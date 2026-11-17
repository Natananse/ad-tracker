# Gaps, underserved workflows, and differentiation

Research date: 19 September 2026.

“Missing from existing tools” needs a precise scope. A public website's silence is not proof of absence. This backlog separates documented competitor limitations from ideas that need validation.

## Documented gaps in a specific product

The following are supported by Triple Whale's [native survey documentation](https://kb.triplewhale.com/en/articles/6486354-post-purchase-survey-pps-for-shopify-stores). They do not establish that Augora, Hyros, or every survey app has the same limitation.

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
| Order-level attribution explanation | “Why did this campaign get credit?” | Universally absent: not established | P0 | Merchant can explain five sampled orders without support |
| Revenue reconciliation bridge | Shopify and ad dashboards disagree | Competitors already discuss model differences; usability opportunity | P0 | Reduce time spent diagnosing one discrepancy |
| Explicit unknown reasons | False precision encourages bad decisions | Competitors acknowledge missing data; novelty unproven | P0 | Users distinguish missing evidence from zero performance |
| Refund-aware contribution view | High ROAS can hide poor unit economics | Profit reporting exists in the category; accessibility hypothesis | P0 | Decisions differ meaningfully from revenue-only ranking |
| Predictable order-band pricing | Budgeting software costs is hard | Packaging differentiation, not tracking innovation | P0 | Obtain paid commitments at proposed prices |
| Safe coexistence check | Multiple pixels may duplicate purchases | Universal absence unverified | P0 | Detect conflicting senders on pilot stores |
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

