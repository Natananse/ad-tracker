import { ORPCError } from "@orpc/server";
import { getBaseUrl } from "@repo/utils";

export function getSafeRedirectUrl(redirectUrl?: string) {
	if (!redirectUrl) {
		return undefined;
	}

	try {
		const appUrl = new URL(getBaseUrl());
		const targetUrl = new URL(redirectUrl, appUrl);

		if (
			targetUrl.origin !== appUrl.origin ||
			targetUrl.username ||
			targetUrl.password
		) {
			throw new ORPCError("BAD_REQUEST", {
				message: "The redirect URL must use the application origin.",
			});
		}

		return targetUrl.toString();
	} catch (error) {
		if (error instanceof ORPCError) {
			throw error;
		}

		throw new ORPCError("BAD_REQUEST", {
			message: "The redirect URL is invalid.",
		});
	}
}
