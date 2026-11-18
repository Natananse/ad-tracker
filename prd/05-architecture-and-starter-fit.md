# Architecture and fit with this starter

The starter's dashboard, registered API routes, payment provider, database models, configuration and web package versions were rechecked in source on 18 November 2026.

## What the repository actually contains

| Area | Inspected evidence | Reuse and limitation |
|---|---|---|
| Web application | `apps/web/package.json`, `apps/web/app/` | Next.js 16.2.12 and React 19.2.4 declared; UI foundation available |
| SaaS tenancy | `packages/database/prisma/schema.prisma` | User, Organization, Member, Invitation available; no Shopify Shop or attribution ledger model |
| Database selection | `packages/database/index.ts` | Exports Prisma; Drizzle directories are alternatives, not evidence of a second active database |
| API | `packages/api/index.ts`, `packages/api/orpc/router.ts` | Hono/oRPC foundation; existing modules cover generic SaaS functions |
| Authorization | `packages/api/orpc/procedures.ts`, `packages/api/modules/organizations/lib/membership.ts` | Session and membership helpers exist; new shop routes require explicit tenant/role checks |
| Billing | `packages/payments/provider/index.ts` | Polar is active; other provider directories are inactive unless exported |
| Dashboard | `apps/web/modules/saas/dashboard/components/Dashboard.tsx` | Hardcoded monthly chart data; replace with validated query results |
| AI | `packages/ai/index.ts`, `packages/api/modules/ai/` | Generic AI/chat foundation; no advertising analyst pipeline established |
| Site analytics | `apps/web/modules/analytics/provider/` | Analytics for the SaaS website, not merchant-store attribution |
| Documentation | `readme.md`, `.kiro/steering/` | Useful structure guidance, but older dependency versions conflict with manifests |

Searches for Shopify, CAPI, and attribution in application/package/config source found no merchant-tracking implementation. Existing payment webhooks handle SaaS subscriptions, not Shopify sales.

No dependencies were installed and no app was run for this documentation task. Existing auth and payment integrations are source-level observations, not verified working journeys.

## Recommended deployment shape

Begin with a modular monolith for the application, a lightweight public collector, and a separate worker process. Use managed PostgreSQL for financial/configuration data, durable queue semantics, and object storage for bounded raw archives.

Avoid a large streaming cluster and a dedicated warehouse before measured load requires them. Do not run durable retry jobs as fire-and-forget Next.js request work.

| Proposed location | Responsibility |
|---|---|
| `apps/web/modules/saas/tracking/` | Overview, campaign table, order explanations, setup and health |
| `packages/api/modules/shops/` | Tenant-scoped shop management and install state |
| `packages/api/modules/reporting/` | Authorized aggregate/report/export endpoints |
| `packages/shopify/` | OAuth/session integration, GraphQL client, webhooks and billing adapter |
| `packages/connectors/` | Meta and Google read-only adapters, schemas and checkpoints |
| `packages/tracking/` | Event validation, normalization, attribution and metric definitions |
| `apps/worker/` | Backfills, spend syncs, attribution runs, reconciliation and deletions |
| `extensions/storefront-pixel/` | Shopify web pixel app extension |
| `packages/database/prisma/` | Durable models and migrations |
| `packages/ai/` | Later read-only explanations over approved aggregates |

These are proposed additions. An embedded Shopify shell may warrant a dedicated app entry; prove the App Bridge/session integration before choosing whether to put it in the existing Next.js app or a small separate host.

## Minimal data model

Every business record carries `organizationId` and `shopId`; compound constraints and authorization maintain the ownership relationship.

| Entity | Important fields and invariants |
|---|---|
| Shop | Unique Shopify shop ID/domain, organization, install state, timezone/currency, permission set |
| ConnectorCredential | Shop/account/provider, encrypted token, key version, expiry/scopes; no frontend access |
| WebhookReceipt | Provider/shop/event ID, received time, payload reference, processing state; unique dedupe key |
| Order | Shop/source order ID, source timestamps, eligibility, original money components, revision |
| RefundAdjustment | Source refund/transaction ID, order, component amounts, event time; immutable adjustment identity |
| ProductCost | Variant, currency, amount, effective interval, source and confidence |
| TrackingEvent | Shop/source event ID, schema version, permitted pseudonymous references, occurrence/receive time |
| IdentityLink | Tenant-scoped references, evidence type, purpose/consent, expiry; reversible/deleteable links |
| AdEntity | Provider/account/campaign/ad IDs, name history, status |
| AdSpendDaily | Provider/account/ad/date/currency, spend, source timezone, fetch revision |
| AttributionRun | Model/rule version, window, input watermark, creation time |
| AttributionAllocation | Order/run/touchpoint/channel, weight and value; weights total one including unknown bucket |
| DeliveryAttempt | Destination/event key, consent gate, attempt number, response category and next retry |
| SyncCheckpoint | Connector/job, cursor, lease, watermark, last success and lag |
| AuditEvent | Actor, action, entity, time, redacted metadata |
| BillingEntitlement | Shop subscription reference, plan, period, status and verified effective limits |

Money uses decimal or currency-aware integer minor units, never floating-point accumulation. Retain transaction/shop currency separately; do not assume every currency has two decimals.

## Ingestion and reconciliation

1. Verify webhook signatures against the raw body and expected shop.
2. Persist a durable receipt before acknowledging accepted work.
3. Process through a transactional outbox or queue with at-least-once semantics.
4. Apply idempotent state transitions using source identity and revision/timestamps.
5. Schedule reconciliation for missing orders, late refunds, and connector changes.
6. Publish aggregate snapshots with an input watermark and attribution version.

Workers need bounded retries, jitter, dead-letter handling, expiring leases, safe replay, and per-tenant workload limits. A worker crash after a database write but before queue acknowledgment must not duplicate revenue.

Ad reporting often revises recent dates. Re-fetch a rolling lookback, initially seven days plus a weekly 28-day repair pass; measure cost and platform constraints before fixing this policy.

## Security, privacy and billing requirements

Shopify protected customer data access is not automatic. Request the minimum fields and implement degraded behavior for redacted or unavailable data. [Protected customer data](https://shopify.dev/docs/apps/launch/protected-customer-data)

Declare pixel privacy requirements and honor consent changes through Shopify-supported pixel interfaces. The generic browser Customer Privacy API and sandbox interfaces are not interchangeable; verify the exact SDK methods in the spike. Do not use server webhooks to recreate denied marketing tracking. [Pixel privacy](https://shopify.dev/docs/api/web-pixels-api/pixel-privacy)

Implement and verify `customers/data_request`, `customers/redact`, and `shop/redact`; invalid compliance-webhook HMAC must be rejected. [Privacy webhooks](https://shopify.dev/docs/apps/build/compliance/privacy-law-compliance)

Use Shopify App Pricing for the proposed public app's fixed monthly subscriptions. Shopify makes it the default for new public apps with supported pricing models. Let the merchant approve the plan in Shopify and verify the subscription before granting access. The starter's Polar integration serves its existing SaaS billing. [Shopify App Pricing](https://shopify.dev/docs/apps/launch/billing/shopify-app-pricing) · [App Store requirements](https://shopify.dev/docs/apps/launch/shopify-app-store/app-store-requirements)

Additional proposed controls:

- Encrypt connector tokens using managed keys; redact tokens, identifiers, and event payloads in logs.
- Separate merchant authentication from signed Shopify requests and worker identities.
- Bind exports, cache keys, object-storage paths, and jobs to both shop and tenant.
- Minimize raw personal data; keep display/debug payloads redacted.
- Use short-lived signed export URLs and audited administrative access.
- Maintain consent eligibility per purpose; order accounting and ad activation have different requirements.
- Document retention, subprocessors, incident response, and data-processing terms before launch.
- Treat an LLM as an untrusted consumer of scoped summaries; no token access, arbitrary SQL, or unrestricted outbound actions.

## Retention proposal

- Raw behavioral events: 30 days on Starter; 90 days on higher plans.
- Raw diagnostics: seven days, redacted; no blanket full-payload logging.
- Financial/attribution summaries: 13 months across paid plans, subject to deletion requirements.
- Identity links: bounded by attribution purpose and configured retention.
- Uninstall: stop collection, revoke tokens, freeze jobs, and execute the applicable deletion schedule.
- Backups: encrypted, time-limited, and restored only with deletion tombstones reapplied.

After raw-event expiry, historical model recomputation may be impossible. Display the recomputation boundary and preserve enough derived evidence to explain existing allocations without indefinite personal-data storage.

## Scaling triggers

Introduce an analytical store only when measured scan cost, retention, or query latency justifies it. Track events per shop, bytes per event, ingestion lag, database growth, report latency, retry rate, and cost per million accepted events.

The bottleneck may be connector quotas or support hours rather than storage. Optimize the measured bottleneck.

