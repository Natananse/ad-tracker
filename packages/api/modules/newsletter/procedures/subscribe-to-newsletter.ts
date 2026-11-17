import { ORPCError } from "@orpc/client";
import { config } from "@repo/config";
import { logger } from "@repo/logs";
import { sendEmail } from "@repo/mail";
import { getRecipientName } from "@repo/utils";
import { z } from "zod";
import { localeMiddleware } from "../../../orpc/middleware/locale-middleware";
import { createRateLimitMiddleware } from "../../../orpc/middleware/rate-limit-middleware";
import { publicProcedure } from "../../../orpc/procedures";

export const subscribeToNewsletter = publicProcedure
	// Unauthenticated and sends mail to an ATTACKER-SUPPLIED address, so without
	// a limit this endpoint is a spam relay that burns our sending reputation.
	.use(
		createRateLimitMiddleware(
			"newsletter",
			config.rateLimits.api.newsletter,
		),
	)
	.route({
		method: "POST",
		path: "/newsletter",
		tags: ["Newsletter"],
		summary: "Subscribe to newsletter",
	})
	.input(
		z.object({
			email: z.string().email(),
		}),
	)
	.use(localeMiddleware)
	.handler(async ({ input, context: { locale } }) => {
		const { email } = input;

		try {
			// ... add your crm or email service integration here to store the email of the user

			await sendEmail({
				to: email,
				locale,
				templateId: "newsletterSignup",
				context: {
					// Newsletter signup carries no user record, so this falls
					// back to the address' local part rather than "Hi there".
					name: getRecipientName(undefined, email),
				},
			});
		} catch (error) {
			logger.error(error);
			throw new ORPCError("INTERNAL_SERVER_ERROR");
		}
	});
