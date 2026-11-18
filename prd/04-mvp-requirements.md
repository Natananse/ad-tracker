# MVP product requirements

Status: proposed scope. All thresholds below are release targets to test, not existing service guarantees.

## User and job

Primary user: a Shopify owner/operator running Meta and Google ads, roughly 100–3,000 monthly orders, without a full-time data analyst. These are initial recruiting criteria, not researched market-size estimates.

Core job: “Before I change my ad budget, show me the orders, costs, and evidence behind the campaign numbers.”

Secondary user: an invited marketer with read access. Agencies and multi-store management are expansion use cases.

## Scope

### P0: paid reporting MVP

- Shopify installation, tenant binding, embedded entry, shop disconnection, billing, and deletion lifecycle.
- Order/refund ingestion plus bounded historical import and scheduled reconciliation.
- Consent-aware Shopify app pixel for supported events.
- Meta and Google read-only spend/campaign imports, subject to API access.
- First-click and last-non-direct-click reports with 7/28-day windows.
- Order evidence drawer with observed journey, applied rule, exclusions, and unknown reason.
- Daily revenue/spend reconciliation and contribution calculation.
- New/returning customer classification when supported; Unknown when history is insufficient.
- Connection health, freshness labels, failure alerts, and basic CSV export.
- Same-currency reporting initially; no silent conversion.
- All users receive essential correctness, security, and deletion capabilities regardless of plan.

### P1: after the reporting gate

Optional Meta purchase delivery after consent, deduplication, native-integration coexistence, and destination testing pass. Later: simple survey, Shopify write-back, UTM diagnostics, and linear attribution.

### Explicitly outside MVP

Autonomous ad changes; Google Ads conversion activation; probabilistic fingerprinting; view-through identity matching; MMM; incrementality modeling; creative generation; call tracking; non-Shopify checkout; complex subscription/LTV forecasting; warehouse SQL UI; customer-level cross-merchant identity graphs.

## Main journey and screens

1. **Install and setup:** Validate shop and permissions → initialize ledger → connect ad accounts → choose timezone/currency → confirm pixel and consent state → test order/refund → ready.
2. **Overview:** Net merchandise revenue, spend, MER, contribution after ads, unmatched share, freshness, and cost completeness.
3. **Campaigns:** Channel/campaign/ad table with model/window/date controls; attributed revenue, spend, ROAS, contribution estimate, order count, and insufficient-data indicator.
4. **Orders:** Each order shows financial breakdown and attribution explanation; refunds link to adjustments.
5. **Data health:** Missing scopes, revoked tokens, delayed syncs, rejected events, invalid links, and remediation.
6. **Costs:** Product cost CSV, effective dates, fulfillment cost assumptions, and fee estimates.
7. **Settings/billing:** Roles, store mapping, consent configuration, retention, exports, deletion, plan usage, upgrade/downgrade/cancel.

Installation readiness is separate from attribution readiness: a healthy new pixel cannot show weeks of historical click evidence.

## First usable report

A merchant reviewing two campaigns should be able to decide which deserves a closer look, then reproduce the comparison from the underlying orders. This fictional fixture uses USD, one attribution model and window, no taxes or shipping income, and complete costs. Each column covers the same week. Assume the refunds have no associated recoverable inventory.

| Weekly campaign totals | Campaign A | Campaign B |
|---|---:|---:|
| Paid merchandise sales after discounts | $1,000 | $700 |
| Merchandise refunds | $200 | $0 |
| Attributed net merchandise revenue | $800 | $700 |
| Ad spend | $200 | $200 |
| Return on ad spend after refunds | 4.0× | 3.5× |
| Product, fulfillment and payment costs | $650 | $320 |
| Contribution after ads | **−$50** | **$180** |

Campaign A leads on return on ad spend. Campaign B leaves more money to cover overhead. Clicking A's $200 in refunds should reveal the order adjustments behind it. Replaying the same refund must leave the total at $200. Removing a product cost must change the contribution to an incomplete estimate. Measure whether a merchant can explain these results without help.

## Definitions that must be visible in the product

| Metric | Proposed definition |
|---|---|
| Net merchandise revenue | Merchandise sales after discounts, less merchandise refunds; excludes collected taxes, duties, and shipping |
| Paid eligible order | Non-test online-store order meeting the configured paid-state rule; exceptions separately classified |
| Attributed revenue | Net merchandise revenue allocated under one model and window |
| ROAS | Campaign attributed revenue / campaign spend; N/A when spend is zero or unavailable |
| MER | Store net merchandise revenue / total supported ad spend in the same period/currency |
| Contribution before ads | Net merchandise revenue + net shipping income − COGS consumed − fulfillment/shipping expense − payment fees − variable operating costs |
| Contribution after ads | Contribution before ads − supported ad spend |
| New-customer CAC | Supported ad spend / verified first-time customers; unknown if historical coverage cannot establish first purchase |
| Attribution coverage | Eligible orders with an observed eligible attribution link / all eligible orders |
| Cost completeness | Eligible orders with required cost inputs / all eligible orders |

Contribution is not accounting net profit: fixed overhead and other channels may be missing. Each estimated input must be labeled. Partial refunds must allocate merchandise, shipping, tax, and any returned inventory separately; do not reverse COGS automatically for every refund.

Compare platform-reported conversion revenue in a separate column. It uses different attribution and value conventions and is never added to the financial ledger.

Reporting defaults to conversion date in shop timezone. Refunds have both an adjustment date and an original order date: offer a restated order-cohort view and a refund-period ledger view, with explicit labels. MVP may expose the latter as the reconciliation ledger, not a second campaign model.

## Functional acceptance criteria

| ID | Requirement | Passing evidence |
|---|---|---|
| F01 | Install identity and tenancy | Valid install binds the correct shop to one authorized organization; forged callbacks rejected |
| F02 | Financial ingestion | Replayed order/refund webhooks create no duplicate ledger entries |
| F03 | Backfill boundary | Import range displayed; orders without historical touchpoints remain unassigned |
| F04 | Attribution | Fixture journeys produce deterministic, documented first/last results |
| F05 | Reconciliation | Attributed + observed direct + other classified + unknown equals eligible net revenue within one currency minor unit of rounding |
| F06 | Refunds | Full/partial refunds restate allocated revenue without creating a second purchase |
| F07 | Missing evidence | Consent denied, pixel blocked, or missing join results in an explicit incomplete/unknown state |
| F08 | Spend | Daily totals reconcile to connector responses; timezone/currency mismatches are surfaced |
| F09 | Costs | Missing COGS produces an incomplete estimate, never an asserted profit number |
| F10 | Export | Export includes model/window, currency, timezone, generated-at time, completeness, and row evidence IDs |
| F11 | Isolation | Cross-tenant shop IDs, exports, jobs, and caches fail authorization tests |
| F12 | Lifecycle | Uninstall stops work; erasure covers raw events, identity links, exports, and restore procedures |
| F13 | Billing | Upgrade/downgrade/decline/reinstall handled with no double subscription |
| F14 | Observability | Revoked connector and stale data are visible without leaking credentials |

## Proposed reliability and performance targets

- Financial ledger: ≥99.5% of eligible source orders reconciled within 24 hours; unexplained discrepancies investigated before release. This measures ingestion coverage, not ad attribution accuracy.
- Accepted order webhooks reflected in the dashboard within five minutes at p95 during healthy operation.
- Spend refresh every 60 minutes initially, subject to platform reporting lag and quotas.
- Dashboard p95 under two seconds for a 30-day summary at the declared plan workload.
- Zero duplicate financial orders in replay tests and zero cross-tenant access in boundary tests.
- Setup target: median under 15 minutes of merchant effort, excluding reviews and platform backfills.
- Alerts for stale financial/spend data within the defined freshness budget; never present stale data as live.

Measure real values during pilot before publishing an SLA.

## Event and API contracts

Collector requires schema version, store public key, source event ID, occurrence time, event type, approved payload, and consent context. A public store key is an identifier, not a secret or proof of authenticity. Validate origin expectations, payload bounds, timestamps, supported types, and abuse limits.

Order mutations arrive through verified Shopify webhooks and reconciliation. Untrusted browser data cannot set financial order values or settle payments.

Reporting APIs accept authorized shop, date range, model, and window. Server authorization determines tenancy; request-supplied organization IDs never suffice. Export jobs bind the requester's permissions and expiry.

## Open product decisions

Confirm the actual buyer volume, required order history, first launch currency/region, support channel, and whether stores need Meta-only reporting before Google. Pilot evidence may narrow scope further; do not silently drop a promised connector after a paid launch.

