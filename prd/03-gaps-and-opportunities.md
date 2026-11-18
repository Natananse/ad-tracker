# Gaps, underserved workflows, and differentiation

Updated 18 November 2026. The strongest reasons to run a pilot are a discrepancy the merchant can reproduce and a price they can predict at their own volume.

## Gaps that affect an ad-budget decision

| Where the limitation appears | What a merchant runs into | Proposed response and priority |
|---|---|---|
| Triple Whale Free | The plan comparison lists a lifetime-only attribution window. A store using the free plan cannot select a seven-day versus a 28-day window there. [Plan comparison](https://www.triplewhale.com/pricing) | **Launch.** Include both windows at $29. Show which actual orders gain or lose credit when the owner changes the window. Test whether those differences affect a weekly budget decision. |
| HYROS sales query | Its published MCP sales tool filters by the date a sale was made, even when looking for refunded sales. An October purchase refunded in November can fall outside a November sales query. The refund webhook exposes the adjustment date. [HYROS research and API navigation](research/hyros.md#two-opportunities-for-the-proposed-product) | **Launch.** Let the merchant open both the original campaign and the current refund period from one adjustment. Validate the time saved against the merchant's current report. The constraint is specific to this query. |
| Shopify's native marketing reports | Shopify can include unpaid, pending and canceled orders in its reported order counts. A merchant comparing that figure to paid online orders can get different answers even when both systems work. [Marketing report definitions](https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/default-reports/marketing-reports) | **Launch.** Explain the difference with counts and values by exclusion reason, plus links to the affected orders. Check that exclusions and eligible orders reconcile to the same source population. |
| Comparing an Augora or HYROS bill before purchase | Augora directs buyers to pricing or an order form. HYROS directs buyers to a quote. The reviewed public terms do not give a comparable bill for a known one-store workload. [Augora terms](https://augora.ai/legal/terms) · [HYROS pricing](https://hyros.com/pricing-ai-tracking) | **Launch.** Publish an order and event schedule with worked examples for ordinary and promotion months. Test whether a merchant can predict the bill and values that certainty. |

### Documented survey limitations

Triple Whale documents the following limits for its native survey. Dedicated survey apps already solve parts of this workflow. Fairing can sync answers to Shopify order metafields and KnoCommerce provides a Shopify Flow trigger. Ask what extra tool or manual export a merchant would retire. [Triple Whale survey documentation](https://kb.triplewhale.com/en/articles/6486354-post-purchase-survey-pps-for-shopify-stores) · [Fairing](https://docs.fairing.co/docs/shopify-analytics) · [KnoCommerce](https://docs.knocommerce.com/en/articles/10629828-shopify-flow-integration)

| Gap | Proposed improvement | Priority | Validation before building |
|---|---|---|---|
| Native responses do not write back into Shopify | Optional order metafields, tags, and a Flow integration, with clear purpose and permissions | P1 | Interview merchants already using survey answers operationally |
| Open-ended questions cannot be skipped | Accessible Skip control that preserves earlier responses | P1 | Prototype and measure survey abandonment |
| Some default labels are locked for translation | Full locale dictionaries, including fallback labels and validation text | P1 | Test two multilingual storefronts |
| Imported historical responses are absent from the native Survey Report | Unified live/imported reporting with source labels and duplicate prevention | P2 | Validate demand and historical data quality |

These gaps are useful entry points, but survey customization alone is unlikely to justify a full attribution platform. They become relevant after a reliable core exists.

## Differentiation hypotheses

| Idea | Customer problem | Competitor evidence status | MVP priority | How to test it |
|---|---|---|---|---|
| Order-level attribution explanation | “Why did this campaign get credit?” | Triple Whale already offers a journey drilldown. Augora illustrates a matched order. Test the value of explaining missing evidence and adjustments together. | P0 | Merchant can explain five sampled orders without support |
| Revenue reconciliation bridge | Shopify and ad dashboards disagree | Competitors already discuss model differences; usability opportunity | P0 | Reduce time spent diagnosing one discrepancy |
| Explicit unknown reasons | False precision encourages bad decisions | Competitors acknowledge missing data; novelty unproven | P0 | Users distinguish missing evidence from zero performance |
| Refund-aware contribution view | High ROAS can hide poor unit economics | HYROS describes campaign refunds. Triple Whale tracks costs for returns. Test the time saved by explaining all inputs in a single report. | P0 | Decisions differ meaningfully from revenue-only ranking |
| Predictable order-band pricing | Budgeting software costs is hard | Packaging differentiation, not tracking innovation | P0 | Obtain paid commitments at proposed prices |
| Purchase-sender verification | Multiple integrations may send the same purchase | Shopify offers native Meta forwarding. Augora advertises forwarding and event debugging. | P1 | Record the existing setup during the reporting pilot. Verify one counted purchase in the destination before enabling any forwarding. |
| Portable explanation export | Merchant wants to inspect or leave | Exports already exist in the category | P0 | Export reproduces the displayed totals and rules |
| UTM linting and naming drift alerts | Links lose campaign IDs or use inconsistent names | UTMs already exist; automate quality checks | P1 | Catch broken links before a campaign launch |
| Decision guardrails for small samples | One sale causes an apparent winner | Absence unverified | P1 | Users avoid acting on inadequate evidence |
| Multilingual survey plus Shopify write-back | Discovery evidence cannot power store workflows | Specific limitations documented above | P1 | Three merchants request the same downstream action |
| Shareable read-only agency report | Owner and agency disagree about definitions | Agency tools already exist | P2 | Prove demand beyond a CSV/email report |
| Read-only AI explanations with evidence links | Owner cannot interpret the metrics | AI already widespread; trust and price are the hypothesis | P2 | Answers remain correct under incomplete data |
| Affordable experimentation guidance | Users confuse attribution with lift | Advanced measurement already exists | P3 | Sufficient store volume and willingness to run controlled tests |

Priority: P0 = launch requirement; P1 = after core validation; P2 = demand-led expansion; P3 = later research.

## Do not claim these are new

AI chat, CAPI forwarding, multi-store dashboards, UTM links, multiple attribution models, exports, surveys, LTV, and ad-management actions are established capabilities across the researched category. Their presence alone is not differentiation. See [competitor findings](01-competitor-findings.md).

## Recommended product promise

“See which ads are associated with profitable Shopify orders—and understand the evidence behind every number.”

Avoid “100% accurate,” “tracks everyone,” “recovers every lost conversion,” “GDPR-proof,” and guaranteed ROAS claims. A useful tool can explain uncertainty without pretending it disappears.

## What could become defensible

- A well-tested Shopify order/refund reconciliation engine and clear metric definitions.
- A library of connector failure signatures and specific repair instructions.
- Fast self-service onboarding that keeps support costs low.
- Longitudinal merchant workflows built around profitable decisions, not a large chart catalog.

These are execution advantages to build, not existing assets or guarantees against competitors copying the features.

## Discovery questions

Interview 10–15 Shopify operators, including native-only users, paid-tool users, and former customers. Ask them to demonstrate their last budget decision and show the discrepancy they struggled with, using authorized/redacted data.

Record current software spend, monthly orders, sessions per order, ad channels, support needs, cancellation constraints, and whether the problem recurs weekly. Ask what free tools fail to accomplish before pitching the proposed solution.

Do not ask only “Would you use a cheaper alternative?” Require a concrete workflow, a price reaction, and a commitment to a pilot.

