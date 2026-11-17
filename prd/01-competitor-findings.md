# Competitor findings

Snapshot: 19 September 2026. Public-source review; not a hands-on product audit.

## Augora AI

**Positioning and features — vendor-documented:** Shopify conversion recovery using browser events, server forwarding to Meta CAPI/Google Measurement Protocol, and campaign-tagged short links. It also advertises an event debugger, multi-store/team support, encrypted tokens, and an AI agent reading Shopify, Meta, Google Ads, GA4, and Klaviyo with ad-management actions.

**Pricing:** No numeric public plan was established from the retrieved homepage. A free-trial CTA and cancellation language are visible. Do not infer a price or claim our proposal is cheaper.

**Strength:** A focused owner-operator workflow and accessible diagnostics.

**Unknowns:** Attribution rules, identity persistence, retention, billing limits, independent accuracy, and performance under missing consent. Its universal recovery language is marketing, not proof.

**Implication:** A dashboard, AI chat, multi-store support, and event debugging would not be novel against this product.

**How it works:** Its public description suggests collection → enrichment/matching → forwarding → reporting; the private implementation is undisclosed.

Source: [Augora homepage](https://augora.ai/). Capture: [evidence log](research/evidence-capture-log.md).

## Triple Whale

**Positioning — verified-public:** A broad ecommerce measurement and AI platform.

**Packaging:** Free, Foundation, Automate, Enterprise. The free package includes first/last-click tracking; paid packaging adds broader attribution and analytics, while higher tiers add automation and enterprise measurement. Paid pricing depends on annual GMV. The FAQ describes 12-month subscriptions, billed monthly or annually; monthly billing does not imply month-to-month cancellation. Sonar is included in new paid packages. Exact paid amounts were not exposed in the retrieved pricing text.

**Strength:** Breadth and an existing free entry point make a cheaper generic dashboard difficult to differentiate.

**Uncertainty:** Dynamic price selection needs an exact GMV/package/cadence quote. Some security availability language differs between the comparison text and FAQ; verify before making feature claims.

Source: [pricing](https://www.triplewhale.com/pricing). Capture: [evidence log](research/evidence-capture-log.md).

### Tracking and analytics

Triple Pixel connects observed journeys to orders. Its model documentation distinguishes normalized revenue allocation from platform-level credit. In particular, Triple Attribution can assign full credit independently to multiple platforms; summing that model is not financial revenue. Other models support reconciled allocation. This is an intended analytical distinction, not evidence of a software defect. [Pixel explanation](https://kb.triplewhale.com/en/articles/5960325-how-the-triple-pixel-works), [model definitions](https://kb.triplewhale.com/en/articles/5960333-understanding-and-utilizing-attribution-models)

Its documentation acknowledges unattributed orders, including pixel failures and incomplete journeys. A serious alternative must expose uncertainty too. [Non-attributed conversions](https://kb.triplewhale.com/en/articles/11570583-understanding-non-attributed-conversions)

### Specific limitations

The native survey cannot write responses to Shopify metafields/tags/Flow; open-ended questions lack a skip option; some default response labels cannot be translated. These are documented feature gaps, not claims about the entire analytics platform. See the prioritized opportunities in [03](03-gaps-and-opportunities.md). [Survey documentation](https://kb.triplewhale.com/en/articles/6486354-post-purchase-survey-pps-for-shopify-stores)

The App Store listing displayed **4.1/5 from 91 reviews** during research. This is a mutable listing snapshot, not a representative survey of all customers; review sentiment was not systematically sampled. [Shopify listing](https://apps.shopify.com/triplewhale-1)

## Hyros

**Positioning — vendor-documented:** Cross-channel attribution for ecommerce and broader funnels, including delayed sales, repeat purchases, and subscriptions. Current marketing emphasizes Swarm Tracking, ad-platform feedback, ad-manager overlays, and AI/MCP access. [Ad tracking](https://hyros.com/ad-tracking)

**Mechanism — vendor description:** Site interaction identifiers are connected to transactions and customer journeys; known identifiers can connect sessions when available. Its discussion of server-side delivery and identity matching does not prove complete or causal attribution. Do not copy fingerprinting as an MVP requirement. [How Hyros works](https://hyros.com/updates/what-is-hyros/)

**Current pricing evidence:** The direct tracking pricing page displays **$69/month for up to $5,000 tracked monthly revenue**, a revenue selector, assisted setup, and an all-features message. It also shows a promotion mentioning September 18 despite this September 19 retrieval. Treat the amount as an observed offer; eligibility, commitment, expiry, and larger-store prices need confirmation. [Tracking pricing](https://hyros.com/pricing-ai-tracking)

**Conflicting official evidence:** An older official article explicitly dates its pricing to April 2026 and lists Organic from $49, and Business from $230/month on an annual plan. Do not use those figures as the current tracking price floor. [Older article](https://hyros.com/updates/what-is-hyros/)

**Separate product:** AIR pricing is message-based and must not be confused with attribution subscription pricing. [AIR pricing](https://hyros.com/pricing-air-agent)

**Strength:** Broad funnel coverage and assisted implementation. **Opportunity hypothesis:** A smaller Shopify-only product can reduce onboarding and operating complexity. **Unknown:** Contract specifics and comparative accuracy. The Shopify documentation endpoint was discovered but could not be reliably retrieved; detailed installation behavior remains unverified.

Capture: [evidence log](research/evidence-capture-log.md).

## Comparison for our product decision

| Dimension | Augora | Triple Whale | Hyros | Proposed product |
|---|---|---|---|---|
| Primary emphasis | Conversion recovery | Ecommerce measurement and AI | Attribution across broader funnels | Shopify reconciliation and clear decisions |
| Cheap/basic substitutes | Public price unknown | Free package exists | Low-revenue entry offer observed | Must prove value beyond native/free tools |
| Product complexity to compete with | Focused workflow | Broad suite | Broad integration surface | Deliberately narrow |
| Accuracy superiority established? | No independent test here | No independent test here | No independent test here | No product benchmark yet |
| Best competitive response | Explain evidence better | Avoid recreating the suite | Avoid broad funnel commitments | Validate with real merchant workflows |

The recommendation is not to clone all three. Build the smallest paid workflow merchants repeatedly use to reconcile orders, assess contribution, and diagnose uncertainty.

