import { passkey } from "@better-auth/passkey";
import { config } from "@repo/config";
import {
	db,
	getInvitationById,
	getPurchasesByOrganizationId,
	getPurchasesByUserId,
	getUserByEmail,
} from "@repo/database";
import type { Locale } from "@repo/i18n";
import { logger } from "@repo/logs";
import { sendEmail } from "@repo/mail";
import { cancelSubscription } from "@repo/payments";
import { getBaseUrl, getRecipientName } from "@repo/utils";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware } from "better-auth/api";
import {
	admin,
	magicLink,
	openAPI,
	organization,
	twoFactor,
	username,
} from "better-auth/plugins";
import { parse as parseCookies } from "cookie";
import { updateSeatsInOrganizationSubscription } from "./lib/organization";
import { invitationOnlyPlugin } from "./plugins/invitation-only";

const getLocaleFromRequest = (request?: Request) => {
	const cookies = parseCookies(request?.headers.get("cookie") ?? "");
	return (
		(cookies[config.i18n.localeCookieName] as Locale) ??
		config.i18n.defaultLocale
	);
};

const appUrl = getBaseUrl();

export const auth = betterAuth({
	baseURL: appUrl,
	trustedOrigins: [appUrl],
	appName: config.appName,
	database: prismaAdapter(db, {
		provider: "postgresql",
	}),
	advanced: {
		database: {
			generateId: false,
		},
	},
	session: {
		expiresIn: config.auth.sessionCookieMaxAge,
		updateAge: config.auth.sessionUpdateAge,
		// NOTE: freshAge 0 treats every session as "fresh", which disables
		// better-auth's re-authentication requirement on sensitive operations
		// (delete account, change password). Raising this to a real value
		// (default is 60 * 60 * 24) hardens those flows, but the UI has to
		// handle the resulting "session is not fresh" error first.
		freshAge: 0,
	},
	// better-auth only rate limits its own /api/auth/** routes. The app's oRPC
	// routers are limited separately, see @repo/api rate-limit middleware.
	rateLimit: {
		enabled: config.rateLimits.enabled,
		window: config.rateLimits.auth.default.window,
		max: config.rateLimits.auth.default.max,
		// "memory" is per-instance. On serverless/multi-instance deploys switch
		// this to "database" (needs a RateLimit model + migration) or wire up a
		// secondary storage so counters are shared across instances.
		storage: "memory",
		// Keys are matched with `===` against the path AFTER the /api/auth base
		// is stripped, so every one of these must be a real endpoint - an
		// unmatched key is a silently dead rule, not an error. Verified against
		// better-auth 1.6.25's endpoint list.
		customRules: {
			// Sending a credential or creating an account.
			"/sign-in/email": config.rateLimits.auth.signIn,
			"/sign-up/email": config.rateLimits.auth.signUp,
			// Endpoints that send an email.
			"/request-password-reset": config.rateLimits.auth.passwordReset,
			"/sign-in/magic-link": config.rateLimits.auth.magicLink,
			"/send-verification-email":
				config.rateLimits.auth.emailVerification,
			"/change-email": config.rateLimits.auth.emailVerification,
			// Endpoints reached by clicking a link in that email.
			"/magic-link/verify": config.rateLimits.auth.linkVerification,
			"/verify-email": config.rateLimits.auth.linkVerification,
			"/reset-password": config.rateLimits.auth.linkVerification,
			// OTP guessing.
			"/two-factor/verify-totp": config.rateLimits.auth.twoFactor,
			"/two-factor/verify-otp": config.rateLimits.auth.twoFactor,
			"/two-factor/send-otp": config.rateLimits.auth.twoFactor,
		},
	},
	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ["google", "github"],
		},
	},
	hooks: {
		after: createAuthMiddleware(async (ctx) => {
			if (ctx.path.startsWith("/organization/accept-invitation")) {
				const { invitationId } = ctx.body;

				if (!invitationId) {
					return;
				}

				const invitation = await getInvitationById(invitationId);

				if (!invitation) {
					return;
				}

				await updateSeatsInOrganizationSubscription(
					invitation.organizationId,
				);
			} else if (ctx.path.startsWith("/organization/remove-member")) {
				const { organizationId } = ctx.body;

				if (!organizationId) {
					return;
				}

				await updateSeatsInOrganizationSubscription(organizationId);
			}
		}),
		before: createAuthMiddleware(async (ctx) => {
			if (
				ctx.path.startsWith("/delete-user") ||
				ctx.path.startsWith("/organization/delete")
			) {
				const userId = ctx.context.session?.session.userId;
				const { organizationId } = ctx.body;

				if (userId || organizationId) {
					const purchases = organizationId
						? await getPurchasesByOrganizationId(organizationId)
						: // biome-ignore lint/style/noNonNullAssertion: This is a valid case
							await getPurchasesByUserId(userId!);
					const subscriptions = purchases.filter(
						(purchase) =>
							purchase.type === "SUBSCRIPTION" &&
							purchase.subscriptionId !== null,
					);

					if (subscriptions.length > 0) {
						for (const subscription of subscriptions) {
							await cancelSubscription(
								// biome-ignore lint/style/noNonNullAssertion: This is a valid case
								subscription.subscriptionId!,
							);
						}
					}
				}
			}
		}),
	},
	user: {
		additionalFields: {
			onboardingComplete: {
				type: "boolean",
				required: false,
			},
			locale: {
				type: "string",
				required: false,
			},
		},
		deleteUser: {
			enabled: true,
			deleteTokenExpiresIn: config.auth.deleteAccountTokenExpiresIn,
		},
		changeEmail: {
			enabled: true,
			sendChangeEmailConfirmation: async (
				{ user: { email, name }, url },
				request,
			) => {
				const locale = getLocaleFromRequest(request);
				await sendEmail({
					to: email,
					templateId: "emailVerification",
					context: {
						url,
						name: getRecipientName(name, email),
					},
					locale,
				});
			},
		},
	},
	emailAndPassword: {
		enabled: true,
		// If signup is disabled, the only way to sign up is via an invitation. So in this case we can auto sign in the user, as the email is already verified by the invitation.
		// If signup is enabled, we can't auto sign in the user, as the email is not verified yet.
		autoSignIn: !config.auth.enableSignup,
		requireEmailVerification: config.auth.enableSignup,
		resetPasswordTokenExpiresIn: config.auth.passwordResetExpiresIn,
		sendResetPassword: async ({ user, url }, request) => {
			const locale = getLocaleFromRequest(request);
			await sendEmail({
				to: user.email,
				templateId: "forgotPassword",
				context: {
					url,
					name: getRecipientName(user.name, user.email),
				},
				locale,
			});
		},
	},
	emailVerification: {
		sendOnSignUp: config.auth.enableSignup,
		autoSignInAfterVerification: true,
		expiresIn: config.auth.emailVerificationExpiresIn,
		sendVerificationEmail: async (
			{ user: { email, name }, url },
			request,
		) => {
			const locale = getLocaleFromRequest(request);
			await sendEmail({
				to: email,
				templateId: "emailVerification",
				context: {
					url,
					name: getRecipientName(name, email),
				},
				locale,
			});
		},
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
			scope: ["email", "profile"],
			// The invitationOnly plugin only gates /sign-up/email, so without
			// this an OAuth sign-in would create an account even when signup
			// is meant to be invitation-only.
			disableSignUp: !config.auth.enableSignup,
		},
		github: {
			clientId: process.env.GITHUB_CLIENT_ID as string,
			clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
			scope: ["user:email"],
			disableSignUp: !config.auth.enableSignup,
		},
	},
	plugins: [
		username(),
		admin(),
		passkey(),
		magicLink({
			// Same reasoning as the social providers above: this is a signup
			// path that bypasses the invitationOnly plugin otherwise.
			disableSignUp: !config.auth.enableSignup,
			expiresIn: config.auth.magicLinkExpiresIn,
			sendMagicLink: async ({ email, url }, context) => {
				const locale = getLocaleFromRequest(context?.request);
				// A magic link can be requested for an address that has no user
				// row yet, so the name lookup is best-effort and falls back to
				// the address itself.
				const existingUser = await getUserByEmail(email);
				await sendEmail({
					to: email,
					templateId: "magicLink",
					context: {
						url,
						name: getRecipientName(existingUser?.name, email),
					},
					locale,
				});
			},
		}),
		organization({
			invitationExpiresIn: config.auth.organizationInvitationExpiresIn,
			sendInvitationEmail: async (
				{ email, id, organization },
				request,
			) => {
				const locale = getLocaleFromRequest(request);
				const existingUser = await getUserByEmail(email);

				const url = new URL(
					existingUser ? "/auth/login" : "/auth/signup",
					getBaseUrl(),
				);

				url.searchParams.set("invitationId", id);
				url.searchParams.set("email", email);

				await sendEmail({
					to: email,
					templateId: "organizationInvitation",
					locale,
					context: {
						name: getRecipientName(existingUser?.name, email),
						organizationName: organization.name,
						url: url.toString(),
					},
				});
			},
		}),
		openAPI(),
		invitationOnlyPlugin(),
		twoFactor(),
	],
	onAPIError: {
		onError(error, ctx) {
			logger.error(error, { ctx });
		},
	},
});

export * from "./lib/organization";

export type Session = typeof auth.$Infer.Session;

export type ActiveOrganization = NonNullable<
	Awaited<ReturnType<typeof auth.api.getFullOrganization>>
>;

export type Organization = typeof auth.$Infer.Organization;

export type OrganizationMemberRole =
	ActiveOrganization["members"][number]["role"];

export type OrganizationInvitationStatus = typeof auth.$Infer.Invitation.status;

export type OrganizationMetadata = Record<string, unknown> | undefined;
