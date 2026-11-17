import { logger } from "@repo/logs";
import nodemailer from "nodemailer";
import type { SendEmailHandler } from "../../types";

const transporter = nodemailer.createTransport({
	host: process.env.EMAIL_SERVER_HOST || "localhost",
	port: Number.parseInt(process.env.EMAIL_SERVER_PORT || "1025", 10),
	secure: false,
	auth:
		process.env.EMAIL_SERVER_USER && process.env.EMAIL_SERVER_PASSWORD
			? {
					user: process.env.EMAIL_SERVER_USER,
					pass: process.env.EMAIL_SERVER_PASSWORD,
				}
			: undefined,
});

export const send: SendEmailHandler = async ({ to, subject, html, text }) => {
	try {
		await transporter.sendMail({
			from: process.env.MAIL_FROM || "noreply@localhost",
			to,
			subject,
			html,
			text,
		});
	} catch (error) {
		logger.error("Failed to send email via MailHog:", error);
		throw new Error("Could not send email");
	}
};
