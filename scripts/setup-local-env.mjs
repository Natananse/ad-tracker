import { randomBytes, randomUUID } from "node:crypto";
import {
	existsSync,
	linkSync,
	lstatSync,
	readFileSync,
	renameSync,
	unlinkSync,
	writeFileSync,
} from "node:fs";
import { parseEnv } from "node:util";

// The setup command only provisions the database published by this Compose file.
function validateConnection(value, name, port, password) {
	let url;
	try {
		url = new URL(value);
	} catch {
		throw new Error(`${name} must be a local PostgreSQL connection URL.`);
	}
	const local =
		["postgres:", "postgresql:"].includes(url.protocol) &&
		["127.0.0.1", "localhost"].includes(url.hostname) &&
		(url.port || "5432") === port &&
		url.username === "starter" &&
		decodeURIComponent(url.password) === password &&
		url.pathname === "/starter" &&
		(url.search === "" || url.search === "?schema=public") &&
		url.hash === "";
	if (!local) {
		throw new Error(
			`${name} must point to the Compose starter database on localhost:${port} using its credentials. Local setup stopped before changing the database.`,
		);
	}
}

function prepare() {
	const file = ".env.local";
	const existing = existsSync(file);
	let contents = readFileSync(existing ? file : ".env.local.example", "utf8");
	const values = parseEnv(contents);
	// An exported connection or Compose port overrides values read from disk.
	for (const name of ["DATABASE_URL", "DIRECT_URL", "POSTGRES_PASSWORD", "POSTGRES_PORT"]) {
		if (Object.hasOwn(process.env, name) && process.env[name] !== values[name]) {
			throw new Error(`Unset the overriding shell variable ${name} and configure it in .env.local for local setup.`);
		}
	}
	if (process.env.NODE_ENV === "production" || values.NODE_ENV === "production") {
		throw new Error("Run local setup in a development environment.");
	}
	const port = values.POSTGRES_PORT || "5432";
	if (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535 || Number(port) === 3000) {
		throw new Error("Set POSTGRES_PORT to an available host port such as 5432 or 5433.");
	}
	const password = values.POSTGRES_PASSWORD || randomBytes(24).toString("hex");
	const databaseUrl = values.DATABASE_URL ||
		`postgresql://starter:${encodeURIComponent(password)}@127.0.0.1:${port}/starter`;
	validateConnection(databaseUrl, "DATABASE_URL", port, password);
	// Prisma consults the root .env for variables absent from .env.local.
	const sharedEnv = existsSync(".env") ? parseEnv(readFileSync(".env", "utf8")) : {};
	const directUrl = values.DIRECT_URL ?? sharedEnv.DIRECT_URL;
	if (directUrl) validateConnection(directUrl, "DIRECT_URL", port, password);
	if (values.BETTER_AUTH_SECRET && values.BETTER_AUTH_SECRET.length < 32) {
		throw new Error("Set BETTER_AUTH_SECRET to at least 32 characters in .env.local.");
	}

	const defaults = {
		POSTGRES_PASSWORD: password,
		DATABASE_URL: databaseUrl,
		BETTER_AUTH_SECRET: values.BETTER_AUTH_SECRET || randomBytes(32).toString("hex"),
	};
	let changed = !existing;
	for (const [key, value] of Object.entries(defaults)) {
		if (values[key]) continue;
		const declaration = new RegExp(`^(?:[ \\t]*export[ \\t]+)?[ \\t]*${key}[ \\t]*=.*$`, "m");
		if (declaration.test(contents)) {
			contents = contents.replace(declaration, () => `${key}=${value}`);
		} else {
			contents += `\n${key}=${value}\n`;
		}
		changed = true;
	}
	if (!changed) return;
	if (existing && !lstatSync(file).isFile()) {
		throw new Error("Set up missing values in the linked .env.local file manually.");
	}
	const temp = `${file}.${randomUUID()}.tmp`;
	try {
		writeFileSync(temp, contents, { flag: "wx", mode: 0o600 });
		if (existing) renameSync(temp, file);
		else linkSync(temp, file);
	} finally {
		if (existsSync(temp)) unlinkSync(temp);
	}
}

try {
	prepare();
} catch (error) {
	process.stderr.write(`${error.message}\n`);
	process.exitCode = 1;
}
