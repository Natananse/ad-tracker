import { ORPCError, os } from "@orpc/server";
import type { RateLimitRule } from "@repo/config";
import { config } from "@repo/config";

/**
 * Rate limiting for the app's own oRPC procedures.
 *
 * better-auth has its own limiter, but it only covers the /api/auth/** routes
 * it serves. Everything in this package is a separate router and needs its own
 * limiting - most importantly the unauthenticated procedures that send mail or
 * probe the database.
 *
 * NOTE: counters live in this process's memory, so on a serverless or
 * multi-instance deployment each instance limits independently. Swap
 * `hitCounter` for a shared store (Redis / the database) before relying on
 * these numbers as a hard cap in production.
 */

type Counter = {
	count: number;
	resetAt: number;
};

const buckets = new Map<string, Counter>();

// Bound the map so a flood of unique keys can't grow it without limit.
const MAX_TRACKED_KEYS = 10_000;

function pruneExpired(now: number) {
	// Map.forEach rather than for..of: apps/web compiles without the
	// downlevelIteration/es2015 target that iterating a Map requires.
	const expired: string[] = [];

	buckets.forEach((counter, key) => {
		if (counter.resetAt <= now) {
			expired.push(key);
		}
	});

	for (const key of expired) {
		buckets.delete(key);
	}
}

function hitCounter(key: string, rule: RateLimitRule) {
	const now = Date.now();
	const existing = buckets.get(key);

	if (!existing || existing.resetAt <= now) {
		if (buckets.size >= MAX_TRACKED_KEYS) {
			pruneExpired(now);
		}

		const counter = { count: 1, resetAt: now + rule.window * 1000 };
		buckets.set(key, counter);
		return { allowed: true, retryAfter: 0 };
	}

	existing.count += 1;

	if (existing.count > rule.max) {
		return {
			allowed: false,
			retryAfter: Math.ceil((existing.resetAt - now) / 1000),
		};
	}

	return { allowed: true, retryAfter: 0 };
}

/**
 * Best-effort client identity.
 *
 * `x-forwarded-for` is client-controlled unless a trusted proxy overwrites it.
 * Vercel and most managed platforms do overwrite it; if you deploy behind
 * something that does not, read the header your proxy actually sets instead.
 */
function getClientKey(headers: Headers) {
	const forwardedFor = headers.get("x-forwarded-for");

	if (forwardedFor) {
		// Left-most entry is the original client.
		const first = forwardedFor.split(",")[0]?.trim();
		if (first) {
			return first;
		}
	}

	return (
		headers.get("x-real-ip") ?? headers.get("cf-connecting-ip") ?? "unknown"
	);
}

/**
 * Builds a middleware that limits a procedure to `rule` requests per client.
 *
 * @param name  Bucket namespace, so two procedures sharing an IP don't share a
 *              budget.
 * @param rule  Window (seconds) and max requests, from `config.rateLimits.api`.
 */
export const createRateLimitMiddleware = (name: string, rule: RateLimitRule) =>
	os
		.$context<{
			headers: Headers;
		}>()
		.middleware(async ({ context, next }) => {
			if (!config.rateLimits.enabled) {
				return await next();
			}

			const key = `${name}:${getClientKey(context.headers)}`;
			const { allowed, retryAfter } = hitCounter(key, rule);

			if (!allowed) {
				throw new ORPCError("TOO_MANY_REQUESTS", {
					message: `Too many requests. Try again in ${retryAfter} seconds.`,
					data: { retryAfter },
				});
			}

			return await next();
		});
