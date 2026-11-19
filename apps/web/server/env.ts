import { z } from "zod";

const postgresUrl = z.url({
	protocol: /^(postgres|postgresql|prisma|prisma\+postgres)$/,
	error: "Expected a PostgreSQL connection URL",
});

const siteUrl = z.url({
	protocol: /^https?$/,
	hostname: /./,
	error: "Expected an absolute HTTP or HTTPS URL",
}).refine((value) => {
	if (!URL.canParse(value)) {
		return false;
	}
	const { username, password } = new URL(value);
	return !username && !password;
}, "The public site URL cannot contain credentials");

const port = z.string()
	.regex(/^\d+$/, "Expected a TCP port from 1 through 65535")
	.transform(Number)
	.pipe(z.number().int().min(1).max(65535));

const optionalCredential = z.string()
	.regex(/\S/, "Expected a nonempty credential")
	.optional();

const serverEnvSchema = z.object({
	DATABASE_URL: postgresUrl,
	DIRECT_URL: z.url({
		protocol: /^postgres(ql)?$/,
		error: "Expected a direct PostgreSQL connection URL",
	}).optional(),
	BETTER_AUTH_SECRET: z.string().min(32, "Use at least 32 random characters")
		.refine((value) => /\S/.test(value), "Generate a random secret"),
	NEXT_PUBLIC_SITE_URL: siteUrl.optional(),
	PORT: port.optional(),
	EMAIL_SERVER_HOST: z.string().regex(/^\S+$/, "Expected an SMTP host").default("localhost"),
	EMAIL_SERVER_PORT: port.default(1025),
	// Nodemailer accepts display names and single-label local mail domains.
	MAIL_FROM: z.string().regex(
		/^(?:[^<>\r\n]+\s*<[^\s<>@]+@[^\s<>@]+>|[^\s<>@]+@[^\s<>@]+)$/,
		"Expected a sender address such as noreply@example.com",
	).default("noreply@localhost"),
	EMAIL_SERVER_USER: optionalCredential,
	EMAIL_SERVER_PASSWORD: optionalCredential,
	GOOGLE_CLIENT_ID: optionalCredential,
	GOOGLE_CLIENT_SECRET: optionalCredential,
	GITHUB_CLIENT_ID: optionalCredential,
	GITHUB_CLIENT_SECRET: optionalCredential,
	POLAR_ACCESS_TOKEN: optionalCredential,
	POLAR_WEBHOOK_SECRET: optionalCredential,
	OPENAI_API_KEY: optionalCredential,
}).superRefine((env, ctx) => {
	for (const [first, second] of [
		["EMAIL_SERVER_USER", "EMAIL_SERVER_PASSWORD"],
		["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
		["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"],
	] as const) {
		if (Boolean(env[first]) !== Boolean(env[second])) {
			ctx.addIssue({
				code: "custom",
				path: [env[first] ? second : first],
				message: `Set both ${first} and ${second} to enable this integration`,
			});
		}
	}
});

export function validateServerEnv(source: NodeJS.ProcessEnv) {
	const settings = Object.fromEntries(
		Object.entries(source).filter(([, value]) => value !== ""),
	);
	const parsed = serverEnvSchema.safeParse(settings);
	if (!parsed.success) {
		// Never include the source object or the values of failed fields.
		const problems = parsed.error.issues.map(
			(issue) => `  ${issue.path.join(".")}: ${issue.message}`,
		);
		throw new Error(["Invalid server environment:", ...problems].join("\n"));
	}
	return parsed.data;
}
