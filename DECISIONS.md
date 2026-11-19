# Engineering decisions

## Local development

- Use the versions in the workspace manifests and lockfile. The web app uses Next.js 16 and React 19. The dependency graph includes Kysely, which requires Node 22+, and tooling with a Node 22.13 minimum on the 22.x line. Node 24 is the recommended development runtime.
- The workspace script is named `setup`. Developers invoke it with `pnpm run setup` or `bash scripts/setup.sh`. pnpm reserves the shorter spelling for its own shell installer. [pnpm run](https://pnpm.io/10.x/cli/run) · [pnpm setup](https://pnpm.io/10.x/cli/setup)
- Use PostgreSQL on loopback port 5432 with a named volume. Keep port 3000 for Next.js and use Mailpit to inspect local SMTP traffic. Redis is an optional Compose profile.
- Generate development secrets per checkout, persist them in the ignored root environment file, and reuse them on subsequent runs.
- Keep local schema synchronization separate from deployment. Use a direct connection for database administration when supplied and fall back to the normal connection for local development.
