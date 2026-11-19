import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvFile } from "node:process";
import { defineConfig } from "prisma/config";

// Existing process variables take precedence over local and shared files.
for (const filename of [".env.local", ".env"]) {
	const path = resolve(__dirname, "../..", filename);
	if (existsSync(path)) {
		loadEnvFile(path);
	}
}

const cliUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

export default defineConfig({
	schema: "prisma/schema.prisma",
	migrations: { seed: "node prisma/seed.mjs" },
	...(cliUrl ? { engine: "classic" as const, datasource: { url: cliUrl } } : {}),
});
