# Shopify ad tracking research and product plan

Updated **18 November 2026**. This proposal targets owner-operated Shopify stores that buy Meta and Google ads and reconcile campaign results themselves.

## What to build

A weekly campaign report that answers **“After refunds, product costs, fulfillment and ad spend, which campaign left money to cover overhead?”** A merchant can open a campaign total, see its Shopify orders and refunds, and inspect the click evidence behind each allocation. Unmatched revenue and incomplete costs stay visible. The [worked example](04-mvp-requirements.md#first-usable-report) shows how the campaign with the higher return on ad spend can lose money.

**Why someone might pay.** Shopify already reports campaign performance, Triple Whale has a free attribution plan, Augora advertises event debugging, and HYROS documents campaign-level refunds. The opportunity to test is whether a small team can reconcile its weekly numbers faster at a predictable, month-to-month price. A generic dashboard is a weak first product. [Competitor comparison](01-competitor-findings.md)

**How to price it.** Test $29/month for one store with up to 500 eligible orders and 100,000 behavioral events. Offer higher order bands at $59 and $99. Publish the limits, keep financial reconciliation in every tier, and measure support minutes and cost per store. At the proposed Starter price a 70% service margin leaves $8.70 for all monthly service costs. [Pricing and sensitivity analysis](06-pricing-and-unit-economics.md)

**First build.** Reuse the starter's accounts and organizations. Connect one development store and one authorized ad account. Trace a tagged click into a paid order, issue a partial refund and reproduce the corrected campaign total exactly once. Add the second read-only ad connector for the full reporting MVP. Run the same weekly task with pilot merchants using their existing tools. [Starter fit](05-architecture-and-starter-fit.md) · [Roadmap and pilot gates](07-roadmap-and-validation.md)

## Research and specifications

| Document | Use it to decide |
|---|---|
| [Competitor findings](01-competitor-findings.md) | Which buyer and workflow to target against Augora, Triple Whale, HYROS and native Shopify |
| [How tracking works](02-how-ad-tracking-works.md) | How events, orders, click evidence, attribution rules and optional ad-platform feedback fit together |
| [Gaps and opportunities](03-gaps-and-opportunities.md) | Which limitations are documented, which ideas need testing, and which features deserve priority |
| [MVP requirements](04-mvp-requirements.md) | Which screens, metric definitions and acceptance tests to implement |
| [Architecture and starter fit](05-architecture-and-starter-fit.md) | Which parts of this repository to reuse and which data flows to build |
| [Pricing and unit economics](06-pricing-and-unit-economics.md) | What a merchant would pay under each proposed band and what could make it unprofitable |
| [Delivery and validation](07-roadmap-and-validation.md) | How to sequence the pilot and decide whether to invest further |
| [Sources and open questions](08-sources-and-open-questions.md) | Which commercial and technical assumptions still need direct verification |

The vendor briefs link individual workflow and pricing observations to public sources. [Augora AI](research/augora.md) · [Triple Whale](research/triple-whale.md) · [HYROS](research/hyros.md)

The evidence covers public materials and the local starter source. Comparative accuracy, paid-account behavior, contracted prices and willingness to pay still require merchant trials or written quotes.
