# AdsTracking

A workspace for measuring Shopify campaign attribution and profitability, built with Next.js, PostgreSQL, Better Auth, and a Hono/oRPC API. The [product research](prd/README.md) covers the target merchants, calculations, and planned integrations.

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

Open `/demo` for the public sample. Signing in opens the workspace’s **Campaign report**. In an empty workspace, choose **Explore sample report** or **Import CSV** to preview your own data. Save the report to see it the next time you sign in. Organization members can read shared reports. Owners and admins can replace them. Concurrent saves use a revision check.

For first-click or last-click reporting, open **Import orders and ad clicks (JSON)** and import a normalized JSON snapshot of orders, refunds, eligible clicks and daily spend. Choose a 7- or 28-day lookback, inspect order evidence, then save. The API computes the result and stores the normalized source with the report so it can be recalculated. [Order snapshot format and example](packages/api/modules/tracking/attribution/README.md)

The source of data in this version is file import. Run `pnpm --filter @repo/database migrate:deploy` and `pnpm --filter @repo/database generate` before starting the updated app. Fresh local installations run both commands during setup. If an older database was created with `db push` and Prisma reports P3005, first verify that its existing tables and constraints match `00000000000000_init`. Once verified, record that baseline with `pnpm --filter @repo/database exec prisma migrate resolve --applied 00000000000000_init` and rerun the deployment command.

Choose **Download CSV template** for the headers and one example row. Use one currency per new CSV and one row per date, channel and campaign. Enter the date as `YYYY-MM-DD` and amounts in the currency's major units. Use sales after discounts and merchandise refunds, excluding taxes and shipping income. Costs cover product, fulfillment, payment fees and other variable costs. Leave unknown spend or costs blank and enter `0` for a confirmed zero. If a file has errors, the preview lists the affected rows and columns.

Filter by date, channel and campaign to update the rankings, charts, order evidence and CSV export. Older reports with multiple currencies still open one currency at a time. Net revenue is sales less refunds. ROAS divides net revenue by ad spend. Contribution subtracts spend and variable costs from net revenue. For campaigns with positive known spend and a positive margin before ads, break-even ROAS is net revenue divided by net revenue less variable costs. For example, $100 net revenue and $60 in variable costs require a 2.5× return to break even. The sample reproduces the two-campaign comparison in the [MVP requirements](prd/04-mvp-requirements.md).

### Workspace cost settings

Open **Workspace cost settings** on the campaign report to fill in missing variable costs. Choose a currency, enter the product cost percentage and payment fee percentage, then enter the fixed payment fee and fulfillment cost per paid order. Enter an explicit zero for a cost that does not apply. Organization members can view the defaults. Owners and admins can change them. Personal settings apply only to the signed-in user's workspace.

Both percentages use sales after discounts and before refunds. Each percentage amount rounds to the nearest minor unit, with halves rounding up. For example, $100 in sales, two orders, 30% product cost, a 3% payment fee, a $0.30 fixed fee and $2 fulfillment per order produce $37.60 in estimated costs. With $20 in ad spend and no refunds, contribution is $42.40.

CSV files can include an optional `orders` column with a whole number of paid orders. A blank count leaves the estimate unknown when a per-order fee is positive. JSON snapshots already contain the individual orders, so rounding and fees apply to each missing-cost order. Entered amounts, including zero, always take precedence. Saved settings apply to reports in the selected currency and can be edited or turned off to recalculate the view. Imported costs stay in their original form. Campaign details and CSV exports identify the cost source.

### Reporting backend

| Authenticated API | Behavior |
| --- | --- |
| `tracking.attributeOrders` | Preview allocations, daily campaign totals, and the credited click for each order. |
| `tracking.getReport` | Read the workspace report, revision, edit permission and cost settings. Returned rows retain the imported `costs` field and identify any estimate with `estimatedCosts` and `costSource`. |
| `tracking.saveReport` | Atomically replace daily facts from CSV rows or recompute them from an order snapshot. A stale revision returns a conflict. |
| `tracking.getCostSettings` | Read the workspace's defaults and whether the current user can edit them. |
| `tracking.saveCostSettings` | Save all four defaults and their currency, or clear the defaults for this workspace. |

PostgreSQL stores one `campaign_report` per workspace. Each owns `campaign_daily_fact` rows keyed by date, channel, campaign, and currency. Money is stored in integer minor units. Order-based reports also retain the attribution rule, lookback window, normalized order data, and eligible clicks. Both the public demo and authenticated reports use the same allocation logic.

The `workspace_cost_settings` table stores one profile for each workspace that enables estimates. Percentages use whole basis points (2.90% is 290), and fixed fees use whole minor units ($0.30 is 30 US cents).

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

### Neon database setup

For local development against Neon, use the **Connect** dialog on the development branch. Set `DATABASE_URL` in the root `.env.local` to the pooled URL and `DIRECT_URL` to the direct URL for the same database, role, and branch. The app uses the pool for signed-in requests. The Prisma CLI uses the direct connection when applying schema changes. [Neon connection guide](https://neon.com/docs/connect/connection-pooling)

Apply the checked-in migrations with `pnpm --filter @repo/database migrate:deploy`. This creates the tables for Better Auth, workspaces, and campaign reports on a fresh database and records which migrations have run. Run `pnpm dev` to load the settings, or restart the app if it was already running. Local email verification uses the configured SMTP service. Start the local inbox with `docker compose --env-file .env.local up -d mailpit`, or run the Mailpit binary with `mailpit --listen 127.0.0.1:8025 --smtp 127.0.0.1:1025`.

For a hosted deployment, set the production branch's pooled URL on the web service and supply its direct URL to the migration job. Run the same migration command for that branch before starting the new app release. Each environment has its own users and saved reports. The public demo reads a bundled sample. Signing in, saving an imported campaign report, and reloading it exercises the database connection.

### Application settings

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
