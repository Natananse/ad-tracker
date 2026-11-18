# Delivery roadmap and validation

Effort ranges are planning estimates for one experienced full-time engineer with part-time design/support help. Platform reviews, API approval, merchant access, and outages can extend elapsed time independently.

## Phase 0 — Validate access and demand (1–2 engineering weeks)

- Recruit 10–15 target merchants and identify their current reporting workflow.
- Confirm Shopify distribution, protected-data needs, billing, and embedded-session design.
- Obtain Meta/Google API access for the exact reporting use case; test real permitted accounts.
- Capture a Shopify pixel event, paid order, refund, and permitted join in a development store.
- Test existing native pixel coexistence before designing outbound conversion delivery.
- Quote infrastructure against estimated event volumes.
- Obtain exact competitor quotes at comparable store sizes and commitment periods.

Start with a development store. For a pilot across independent live merchants, plan for public distribution and review. Shopify limits multi-store installs of a custom-distributed app to stores in the same Plus organization. Recruit pilot merchants while approval is pending. [Shopify distribution methods](https://shopify.dev/docs/apps/launch/distribution/select-distribution-method)

Proceed once the core integrations work in testing and five merchants commit to a paid pilot. If Google access takes longer, offer consenting pilot merchants a clearly priced Meta-only report.

## Phase 1 — Financial foundation (2–3 weeks)

Build installation, shop tenancy, durable webhook receipts, order/refund ledger, bounded backfill, reconciliation, consent integration, uninstall/deletion, and Shopify billing state.

**Gate:** Duplicate, reordered, missing and late events reconcile correctly in two isolated test tenants. Validate authentication across embedded and normal-browser entry.

## Phase 2 — Reporting MVP (3–4 weeks)

Add spend connectors, click attribution, order explanations, cost inputs, health screen, basic exports, and cached dashboards.

**Gate:** Controlled fixtures pass; every displayed number traces to an input and definition; unsupported currencies and unknown identities are explicit.

## Phase 3 — Supervised merchant pilot (2–4 weeks)

Run 5–10 stores in reporting-only mode. Compare order totals daily, observe budget-review sessions, track support cost and errors, and test reinstall/billing paths.

**Gate:** Reliability targets from [MVP requirements](04-mvp-requirements.md), at least five paying stores, acceptable support burden, and repeated weekly use. A store's attribution rate does not need to approach 100% to pass; unexplained inflation does.

## Phase 4 — Activation and selected differentiation (2–4+ weeks)

After the reporting gate, add optional Meta delivery only for verified destination ownership/deduplication configurations. Build the most requested survey or diagnostic feature. Google activation is a separate scoped project.

**Gate:** Destination sandbox/test-tool verification, no duplicate purchases, clear consent suppression, and no unexplained performance claims.

Total to reporting MVP/pilot readiness: roughly 8–13 engineering weeks across phases 0–3, with scheduling overlap possible. Public availability additionally depends on review and approval lead times. This is not a commitment to ship a mature Hyros/Triple Whale replacement in that period.

## Critical test matrix

| Scenario | Expected behavior |
|---|---|
| Pixel and webhook observe one order | One financial order; evidence combined without double revenue |
| Same webhook delivered ten times | One state transition/adjustment |
| Refund arrives before order import | Held/reconciled safely; no orphaned totals |
| Buyer declines marketing consent | No prohibited marketing collection/forwarding; lawful financial ledger handled separately |
| Browser blocked or thank-you page not loaded | Order still appears from source; attribution may remain unknown |
| Customer changes device anonymously | No invented deterministic link |
| Same email on two merchants | No cross-shop identity merge |
| UTMs stripped, click IDs missing | Classification reflects remaining evidence; unknown remains possible |
| Order updated after first ingestion | Revision applied and attribution aggregates rebuilt where necessary |
| Partial refund plus returned inventory | Revenue and cost components adjusted independently |
| Test, cancelled, pending, POS or draft order | Policy-specific inclusion/exclusion is visible |
| New-customer history is incomplete | Customer status Unknown rather than asserted new |
| Account timezone differs from shop | Conversion/date policy displayed; comparisons use explicit boundaries |
| Mixed currencies | Unsupported state or approved conversion logic; never raw addition |
| API throttles, expires or returns partial data | Backoff, checkpoints, visible stale state and reauthorization |
| Worker crashes after commit | Replay causes no duplicate result |
| Tenant ID changed in URL/job/export | Access denied; no data leak |
| Store uninstalled during active job | Job checks installation state and stops |
| Deletion followed by backup restore | Tombstones prevent erased data reappearing |
| Optional delivery overlaps native sender | Activation refused until ownership/dedupe validated |
| Plan declined, cancelled or reinstalled | Entitlements follow verified subscription state without double billing |
| Public collector flooded | Rate limits protect other tenants; untrusted events cannot create revenue |

## Merchant pilot scorecard

Review weekly:

- Source-order reconciliation coverage and unresolved variance.
- Attributed, observed direct, and unknown proportions, with reasons.
- Refund/cost completeness and campaign decisions affected.
- Time to first useful report and time spent resolving a discrepancy.
- Weekly returning merchants and actual decision usage.
- Support minutes and service cost per store/tier.
- Trial-to-paid conversion and cancellation reason.
- Connector lag, retry/dead-letter rate, and export correctness.

For every claimed “recovered conversion,” distinguish source ledger recovery, improved internal matching, successful platform delivery, and actual platform attribution. Do not label an increase in counted conversions as new revenue.

## Risk register

| Risk | Severity | Mitigation / stop condition |
|---|---|---|
| Paid product offers little beyond free tools | High | Require demonstrated workflow value and paid pilots |
| Third-party API access is delayed/denied | High | Feasibility first; do not promise unapproved integrations |
| Permission/consent limits prevent intended joins | High | Unknown states and explicit coverage; redesign if core value fails |
| Duplicate delivery harms ad optimization | High | Reporting-first launch; destination ownership gate |
| Refund/currency errors mislead decisions | High | Auditable ledger and reconciliation tests |
| Support exceeds low-price margins | High | Measure by plan; improve setup or reprice |
| Shopify review or billing incompatibility | High | Prove requirements before broad UI implementation |
| Survey niche does not justify switching | Medium | Build only on repeated demand |
| Competitors copy visible features | Medium | Compete through reliability and workflow execution |
| AI generates unsupported advice | Medium | Defer; use scoped evidence and deterministic calculations |

## Decisions before production work

Choose the first merchant segment and launch currency, confirm platform access, test realistic event workloads, and validate paid demand. The existing starter can accelerate accounts and UI; the tracking and reconciliation pipeline remains the main engineering effort.

