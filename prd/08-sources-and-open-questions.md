# Sources, evidence quality, and open questions

Research date: **19 September 2026**. Official public sources were prioritized. Product behavior was not tested.

## Evidence register

| ID | Source | Used for | Qualification |
|---|---|---|---|
| A1 | [Augora](https://augora.ai/) | Product scope and public claims | Marketing page; numeric pricing not established |
| T1 | [Triple Whale pricing](https://www.triplewhale.com/pricing) | Packaging, free tier, GMV basis and commitment | Dynamic paid prices not extracted |
| T2 | [Triple Pixel](https://kb.triplewhale.com/en/articles/5960325-how-the-triple-pixel-works) | Public tracking explanation | Vendor documentation |
| T3 | [Attribution models](https://kb.triplewhale.com/en/articles/5960333-understanding-and-utilizing-attribution-models) | Rules and normalized versus platform-level credit | Documentation, not an independent accuracy study |
| T4 | [Non-attributed conversions](https://kb.triplewhale.com/en/articles/11570583-understanding-non-attributed-conversions) | Documented limitations | Not a universal or measured error rate |
| T5 | [Post-purchase surveys](https://kb.triplewhale.com/en/articles/6486354-post-purchase-survey-pps-for-shopify-stores) | Specific missing survey capabilities | Applies to native survey, not every integration |
| T6 | [Shopify listing](https://apps.shopify.com/triplewhale-1) | Rating/count snapshot | No systematic review-sentiment analysis |
| H1 | [Hyros tracking pricing](https://hyros.com/pricing-ai-tracking) | Current entry offer | Promotion/date ambiguity; no binding quote |
| H2 | [Hyros explanatory article](https://hyros.com/updates/what-is-hyros/) | Mechanism and older price conflict | Pricing text identifies April 2026 |
| H3 | [Hyros ad tracking](https://hyros.com/ad-tracking) | Current product emphasis | Performance claims not independently verified |
| H4 | [Hyros AIR pricing](https://hyros.com/pricing-air-agent) | Distinguishing separate remarketing product | Not tracking subscription pricing |
| H5 | [Hyros docs](https://docs.hyros.com/) | Documentation discovery | Shopify text endpoint unreliable; not relied on for detailed setup |
| S1 | [Shopify pixels](https://shopify.dev/docs/apps/build/marketing/pixels) | App pixel approach | Check current SDK/sandbox behavior during implementation |
| S2 | [Pixel privacy](https://shopify.dev/docs/api/web-pixels-api/pixel-privacy) | Permission and consent interface | Different from unrestricted storefront APIs |
| S3 | [Protected customer data](https://shopify.dev/docs/apps/launch/protected-customer-data) | Data-access review and minimization | Approval is an external dependency |
| S4 | [Privacy compliance](https://shopify.dev/docs/apps/build/compliance/privacy-law-compliance) | Mandatory webhooks | Platform requirements; not a complete legal assessment |
| S5 | [App Store requirements](https://shopify.dev/docs/apps/launch/shopify-app-store/app-store-requirements) | Billing and embedded-app constraints | Recheck before submission |
| S6 | [Shopify App Pricing](https://shopify.dev/docs/apps/launch/billing/shopify-app-pricing) | Public app billing route | Verify support for proposed usage policy |
| S7 | [Meta data sharing](https://help.shopify.com/en/manual/promoting-marketing/analyze-marketing/meta-data-sharing) | Native server-side purchase delivery | Baseline competitor and coexistence consideration |
| G1 | [GA4 Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4) | GA4 versus Ads distinction | Do not assume Ads activation from GA4 delivery |
| G2 | [Google Ads server-side setup](https://developers.google.com/tag-platform/tag-manager/server-side/ads-setup) | Separate Ads conversion integration | Future implementation requires chosen path |
| G3 | [Google Ads access migration](https://developers.google.com/google-ads/api/docs/api-policy/developer-token) | Current API onboarding caution | Body and summary contain inconsistent old/new language; verify project access live |

## Important research conflicts

1. **Hyros pricing:** Prefer the direct pricing-page observation over the dated article, but get a quote. The promotion banner's date is inconsistent with the retrieval date. No savings percentage is defensible yet.
2. **Triple Whale:** The direct page describes current packages and annual commitment; numerical paid prices were unavailable in extracted text. Do not substitute historical third-party tier names or dollar figures.
3. **Augora:** Retrieved FAQ headings include topics whose full answers were not available. Headings alone do not establish detailed implementation or profit accounting.
4. **Shopify privacy interfaces:** The general pixel page and detailed sandbox privacy page use different wording. Implement against the exact extension SDK and test consent changes.
5. **Google API access:** The migration page body states that developer tokens were sunset on September 9, 2026 and access moved to Google Cloud projects, while its summary still describes the older token model. Use the current onboarding flow and verify access with an actual permitted reporting request.
6. **Starter versions:** Package manifests differ from older README/steering documentation. This plan uses inspected manifests for declared versions and does not imply dependencies were installed.

## Research method and limitations

Inspected the starter's README, steering documents, package manifests, database schema/export selection, API router/authorization helpers, payment provider selection, and dashboard source.

Browsed official homepages, pricing, help centers, Shopify platform documentation, and Google technical documentation. Search snippets were discovery aids; the direct Hyros offer and native Shopify Meta behavior were subsequently opened.

Firecrawl and DataForSEO tools were not available. No SEO traffic, funding, team size, backlink, or keyword numbers were invented. They are not required to decide the initial product scope.

A short [evidence capture log](research/evidence-capture-log.md) preserves selected observations and brief excerpts. Full third-party pages are not reproduced. This is a scoped product/pricing/technical study, not an exhaustive feature audit.

Unavailable or unverified:

- Augora paid plan amounts, usage limits, retention and customer-level attribution rules.
- Exact Triple Whale paid quote for a representative target merchant.
- Hyros applicable price/term after the observed promotion.
- Competitor export samples, API behavior, mobile performance, consent behavior, and support quality.
- Meta developer deduplication page: direct retrieval failed; verify before activation work.
- Hyros Shopify text installation guide: unreliable retrieval.
- Actual infrastructure prices at measured load, marketplace fees, and merchant willingness to pay.
- Accuracy or revenue lift compared against a controlled ground truth.

## Questions to resolve next

| Question | Evidence needed | Decision affected |
|---|---|---|
| Which store segment will pay? | Recorded workflow interviews and paid pilots | Positioning and price |
| Is attribution explanation a recurring pain? | Users diagnosing actual orders | P0 differentiation |
| Can checkout/order joins be implemented reliably? | Dev-store traces and consent matrix | Technical feasibility |
| Can the app access required Meta/Google data? | Approved project/app and successful API calls | Connector scope |
| What is cost per merchant at p95 workload? | Load tests plus vendor quotes | Plan allowances |
| Are survey gaps meaningful to buyers? | Demonstrated downstream workflow | P1 survey investment |
| Is native reporting already sufficient? | Side-by-side task comparison | Go/no-go |
| What counts as a useful profit view? | Cost availability and merchant accounting conventions | Metrics and imports |

## Immediate next action

Validate the ledger and event joins in a Shopify development store, alongside merchant interviews. Then implement the reporting MVP only if the access, demand, and cost gates in the roadmap pass.

