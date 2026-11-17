# Shopify ad tracking: research and product plan

Research date: **19 September 2026**. Status: proposal, not an implemented product.

## Recommendation

Build a Shopify-first attribution and contribution-margin tool for owner-operated stores. Start with Shopify orders plus Meta and Google spend, transparent click attribution, refund-aware margins, and a clear explanation for every matched or unmatched order. Launch reporting before adding conversion forwarding.

The proposed differentiator is **understandable evidence at a predictable monthly price**. This is a positioning hypothesis, not a demonstrated accuracy advantage.

A pure pixel-forwarding product has a weak starting position: Shopify already provides a native Meta Conversions API path. [Shopify data sharing](https://help.shopify.com/en/manual/promoting-marketing/analyze-marketing/meta-data-sharing)

## Reading order

| File | What it answers |
|---|---|
| [01 — Competitor findings](01-competitor-findings.md) | What Augora, Triple Whale, and Hyros sell; pricing evidence; strengths and uncertainties |
| [02 — How tracking works](02-how-ad-tracking-works.md) | Pixels, orders, identity, attribution, ad feedback, and their limits |
| [03 — Gaps and opportunities](03-gaps-and-opportunities.md) | Documented missing capabilities versus hypotheses to validate |
| [04 — MVP requirements](04-mvp-requirements.md) | Target users, scope, screens, metrics, and acceptance criteria |
| [05 — Architecture and starter fit](05-architecture-and-starter-fit.md) | What this repository provides and what needs building |
| [06 — Pricing and cost model](06-pricing-and-unit-economics.md) | Proposed $29/$59/$99 plans, cost assumptions, and break-even sensitivity |
| [07 — Delivery and validation](07-roadmap-and-validation.md) | Phases, technical tests, merchant interviews, and release gates |
| [08 — Evidence register](08-sources-and-open-questions.md) | Sources, limitations, pricing conflicts, and unresolved research |

## Decisions proposed

- One commerce platform and two ad connectors initially; support ordinary Shopify storefront checkout first.
- Read-only ad permissions in the MVP. No automatic budget changes.
- Use an order ledger as the financial baseline; keep platform-reported conversions separate.
- Preserve unknown attribution rather than inventing matches.
- Publish plan limits and price-change rules; no percentage-of-revenue fee.
- Make reconciliation, refunds, basic exports, and data-quality status available on every paid tier.
- Defer AI until deterministic reporting works. AI can explain verified calculations later.
- Build for Shopify App Store distribution, including Shopify billing and embedded-app requirements.

## Evidence standard

**Verified-public** means a current official page documents the capability; it does not mean we tested it. **Vendor claim** means marketing language or a reported outcome without independent validation. **Inference** describes likely implementation. **Proposal** describes our recommended product. **Unknown** means evidence was insufficient.

No competitor accounts were purchased or logged into, no conversion-accuracy benchmark was run, and no merchants were interviewed. There is no basis yet for promising better ROAS, universal attribution, or lower pricing than every competitor.

Repository inspection was read-only. Only this `prd/` documentation and research evidence were added.

