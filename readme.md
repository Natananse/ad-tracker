# The Ultimate Starter

A TypeScript SaaS monorepo with a Next.js App Router web app, PostgreSQL, Better Auth, and a Hono/oRPC API. The product research for the proposed Shopify ad tracker is in [prd/](prd/README.md).

## Local development

Install Node.js 24 LTS (or Node 22.13+ on the 22.x line), pnpm 10.14.0, Bash, and Docker with Compose v2 or later. Start your Docker engine. From the repository root run:

```bash
pnpm run setup
pnpm dev
```

Use the full `pnpm run setup` spelling. Bare `pnpm setup` is pnpm's own shell setup command. [pnpm script execution](https://pnpm.io/10.x/cli/run)

Setup creates a private `.env.local` from [.env.local.example](.env.local.example), generates local secrets, installs the locked dependencies, starts the containers, generates the Prisma client, applies the schema to the local database and seeds demo data. It is safe to rerun with the same environment and volume. A cold start depends on package and image download speed.

| Service | Local address | How to verify |
|---|---|---|
| Web | http://localhost:3000 | Visit the home page, then open `/auth/signup`. |
| API | http://localhost:3000/api/health | Expect an HTTP 200 and the text `OK`. |
| PostgreSQL | 127.0.0.1:5432 | Run `docker compose --env-file .env.local ps` and check the database health. |
| Mailpit | http://localhost:8025 | Sign up, open the verification email here and follow its link. The app sends development mail through port 1025. |

The app uses email/password locally. Google, GitHub, paid checkout and AI need their own credentials. Configure them in the root environment file when you use those features. Keep the same authentication secret across restarts to preserve existing sessions.

## Campaign report

After signing in, open **Campaign report** in the personal or organization sidebar. Load the example to try the comparison, or download the template and import daily campaign totals. The browser processes the file in memory. Export the filtered report to keep a copy before leaving the page.

Use one row per date, channel, campaign and currency. Enter the date as `YYYY-MM-DD`, use an ISO currency code, and enter amounts in that currency's major units. Use sales after discounts and merchandise refunds, excluding taxes and shipping income. Costs cover product, fulfillment, payment fees and other variable costs. Leave unknown spend or costs blank and enter `0` for a confirmed zero.

The report compares campaigns in one currency at a time. Net revenue is sales less refunds. ROAS divides total net revenue by total ad spend. Contribution subtracts spend and variable costs from net revenue. The example reproduces the two-campaign comparison in the [MVP requirements](prd/04-mvp-requirements.md).

## Common commands

| Command | Purpose |
|---|---|
| `pnpm run setup` | Initialize or check the local environment and seed the database |
| `pnpm dev` | Run the web app in development |
| `docker compose --env-file .env.local stop` | Stop local services and retain the database volume |
| `docker compose --env-file .env.local up -d --wait` | Start local services and wait for health checks |
| `docker compose --env-file .env.local --profile redis up -d --wait` | Also start the optional local Redis service |
| `pnpm --filter @repo/database generate` | Regenerate Prisma client and model validators |
| `pnpm --filter @repo/database studio` | Inspect database records with Prisma Studio |
| `pnpm lint` | Run Biome lint |
| `pnpm --filter @repo/web test:campaign-report` | Check CSV import, campaign calculations and export |
| `pnpm --filter @repo/web type-check` | Type-check the web workspace |
| `pnpm build` | Run the workspace production build |
| `pnpm --filter @repo/web e2e:ci` | Install Playwright browsers and run the existing browser suite |

## Configuration

The web server validates its environment during startup and reports the names of invalid settings. Set `DATABASE_URL` to the application's PostgreSQL connection. For schema commands against a pooled database, set `DIRECT_URL` to a direct connection. Local schema commands use `DATABASE_URL` when `DIRECT_URL` is empty. The local bootstrap targets the Compose development database. Use deployment-specific credentials and migration tooling for deployed databases.

`config/index.ts` defines application features, locale defaults, session lifetimes, organization settings and plan definitions. `packages/payments/provider/index.ts` selects the active payment adapter. The default SMTP provider reads `EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT`, and `MAIL_FROM`. Set both SMTP authentication fields when your server requires them.

## Project structure

| Path | Responsibility |
|---|---|
| [apps/web](apps/web) | Marketing, authentication, and SaaS routes, UI, MDX content, browser tests |
| [packages/api](packages/api) | Hono HTTP routes, typed oRPC procedures, OpenAPI and webhooks |
| [packages/auth](packages/auth) | Better Auth server and client configuration |
| [packages/database](packages/database) | PostgreSQL schema, Prisma client and queries |
| [packages](packages) | Shared payments, mail, AI, translations, logging and utilities |
| [tooling](tooling) | Shared TypeScript, Tailwind and maintenance tooling |
| [DECISIONS.md](DECISIONS.md) | Rationale for setup and compatibility choices |
| [CHANGELOG.md](CHANGELOG.md) | Changes to the starter |

## Troubleshooting

- **Docker cannot connect.** Run `docker info` and `docker compose version`. Start Docker Desktop or the Docker Engine service and ensure your selected Docker context points to it.
- **PostgreSQL port in use.** Before the first setup, choose an unused database port such as 5433. Keep `POSTGRES_PORT`, the port in `DATABASE_URL`, and any explicit `DIRECT_URL` consistent. The web app uses port 3000.
- **Database rejects a password.** A persistent PostgreSQL volume keeps the credentials it was initialized with. Restore the matching settings or change the database role's password deliberately. Rerunning setup preserves existing records.
- **Verification email missing.** Check Mailpit on port 8025 and its container health. SMTP is on 1025. Ensure the site URL points to the same origin you use in your browser.
- **Signup returns 422.** Read the form or response validation message, verify the submitted fields, and check whether the email already has an account. Use password reset for an existing account. A database startup failure should be investigated separately.
- **Web port in use.** Set both `PORT` and `NEXT_PUBLIC_SITE_URL` in `.env.local` to the chosen web port, then restart `pnpm dev`.
