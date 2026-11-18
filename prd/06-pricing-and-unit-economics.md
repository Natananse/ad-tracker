# Pricing and making the product cheaper to operate

Dollar amounts are USD before tax. Proposed subscription prices and operating budgets are scenarios for a pilot. Published fee schedules are linked where used.

## Competitive reality

Triple Whale Free costs $0. For its paid plans, the published term is 12 months and the rate depends on annual GMV. HYROS advertises a Shopify starting figure of $199 per month and quotes based on tracked revenue. Augora's reviewed materials did not establish a numeric price. Compare the same store, period, attribution functions and service level before calculating savings. [Triple Whale pricing](https://www.triplewhale.com/pricing) · [HYROS Shopify offer](https://hyros.com/shopify) · [HYROS pricing](https://hyros.com/pricing-ai-tracking) · [Augora terms](https://augora.ai/legal/terms)

The product must justify payment against free/native workflows. Low price is useful only if support and reliability remain sustainable.

## Proposed packaging experiment

| Plan | Monthly price | Monthly eligible orders | Accepted behavioral events | Included stores | Intended user |
|---|---:|---:|---:|---:|---|
| Starter | $29 | 500 | 100,000 | 1 | Small operator validating acquisition |
| Growth | $59 | 3,000 | 600,000 | 1 | Established store needing frequent decisions |
| Scale | $99 | 10,000 | 2,000,000 | 1 | Higher volume store with bounded support |
| Agency | Not priced | Quoted after workload research | Explicit pooled allowance | Demand-led | Not a launch commitment |

All paid plans include core models, reconciliation, refunds, contribution estimates, exports, and health monitoring. Higher prices pay for workload and retention, not access to accurate numbers. Include ordinary team access; do not meter dashboard viewers initially.

Proposal: 14-day trial, month-to-month renewal, self-service cancellation, no automatic unapproved overages. Order limits are the main value metric; event allowance protects against unusually high browsing volume.

Order billing definition: unique, non-test paid online-store orders first becoming eligible during the billing cycle; exclude replays and duplicates. Refunding a processed order does not erase the service consumed. Clearly distinguish this usage measure from net-revenue reporting.

Warn at 80% and 100%. Offer a seven-day grace period and a merchant-approved upgrade. If a hard limit is reached after grace, preserve financial order/refund ingestion, visibly restrict new optional behavioral collection, and show resulting coverage limits. Never silently sample purchases or imply full tracking after collection stops.

Keep annual discounts out of launch economics until retention is measured. A later annual option must explicitly state the term and effective monthly amount.

### What two stores would pay

Assume one connected store, a steady $60 order value, 200 behavioral events per order and no promotions or returns for the illustrative GMV calculation. The merchant's actual figures and the vendor's GMV definition govern a quote.

| Monthly workload | Implied annual store sales | Proposed monthly bill | Twelve months at that rate |
|---|---:|---:|---:|
| 300 orders and 60,000 events | $216,000 | $29 | $348 |
| 1,500 orders and 300,000 events | $1,080,000 | $59 | $708 |

A promotion could produce 450 orders and 120,000 events. That fits Starter's order band but exceeds its event allowance. Under the proposed policy, the owner can approve Growth at $59 or stay at $29 with the optional collection limit visible after grace. The financial history continues in both cases.

For each profile, record the vendor's eligible revenue definition, quoted price, term, implementation charges, included destinations, event caps and renewal behavior. Ask HYROS for the applicable tracked revenue, which can differ from total store sales. Also time the same task with native Shopify and Triple Whale Free. A $29 subscription must earn its cost against that $0 incremental software baseline.

## How to reduce cost without damaging the core

| Decision | Cost saved | Tradeoff |
|---|---|---|
| Shopify-only, two ad connectors | Less maintenance and fewer unusual workflows | Smaller initial market |
| Reporting before activation | Avoids destination setup/support during first release | Less appeal to buyers wanting pixel repair |
| Hourly spend sync and cached aggregates | Fewer API jobs and repeated queries | Not tick-by-tick “live” spend |
| Collect necessary events only | Lower ingestion and retention cost | No session replay or exhaustive clickstream |
| Short raw retention | Smaller indexes, backups, and privacy surface | Limited historical recomputation |
| Deterministic rules before ML | Lower infrastructure and debugging burden | Fewer sophisticated model options |
| Guided setup and health checks | Fewer support calls | Upfront product-design effort |
| AI summaries only on demand | Bounded model spend | No unlimited agent promise |
| Shared managed infrastructure | Lower early fixed overhead | Tenant isolation must be engineered carefully |

Do not reduce cost by skipping consent, deletion, backups, signature validation, reconciliation, or isolation.

## Workload model

Assume **200 behavioral events per order** for a planning example. This is highly store-dependent: low conversion rates can produce far more events per order.

- Starter at 500 orders → 100,000 events/month.
- At 1 KB normalized payload/event → 100 MB of logical payload.
- Indexes, metadata, replication, backups, and object-storage overhead are additional; use a provisional 5× storage multiplier when sizing.
- 100 such stores → 10 million events/month and roughly 10 GB of logical payload before overhead.
- At 1,000 events/order, the same stores produce 50 million events/month: five times the ingestion load.

Price the actual observed event/order distribution, not only the average. A shop with few purchases and huge traffic can be expensive.

## Illustrative 100-store scenario

Assume 60 Starter, 30 Growth, and 10 Scale stores. Each consumes its included allowance.

| Item | Calculation | Monthly amount |
|---|---|---:|
| Starter revenue | 60 × $29 | $1,740 |
| Growth revenue | 30 × $59 | $1,770 |
| Scale revenue | 10 × $99 | $990 |
| Total MRR | Sum | **$4,500** |
| Accepted events | 6M + 18M + 20M | **44 million** |
| Core hosting/database/backups | Placeholder budget | $450 |
| Queue, ingestion, storage and transfer | Placeholder budget | $350 |
| Monitoring/email/support tools | Placeholder budget | $100 |
| Limited AI use | Placeholder budget | $50 |
| Merchant support | 20 hours × $25/hour | $500 |
| Billing/marketplace fee reserve | Assumed 5% × MRR | $225 |
| Total service cost | Sum | **$1,675** |
| Contribution before development and acquisition | $4,500 − $1,675 | **$2,825** |
| Illustrative service margin | $2,825 / $4,500 | **62.8%** |

Two published rates help calibrate the placeholders. Both are included within the corresponding budget lines above.

- **Queue operations.** As one supplier example, Cloudflare Queues' paid tier includes one million operations per month and charges $0.40 per additional million. At one small message per event, written, read and deleted once, 44 million events imply 132 million operations and **$52.40** in queue usage. Retries add reads. Worker subscriptions, compute, databases, logs, storage and delivery still need pricing. [Cloudflare Queues pricing](https://developers.cloudflare.com/queues/platform/pricing/)
- **Shopify fees.** At $4,500 billed, a 2.9% processing fee is **$130.50**. Shopify documents 0% revenue share on the first $1 million in qualifying lifetime app revenue across associated accounts for developers eligible for its standard schedule, and 15% above that threshold. Regional fees and tax may also apply. A fully above-threshold month would add **$675** in revenue share at this MRR. Reprice the reserve at that point. [Shopify App Store revenue share and fees](https://shopify.dev/docs/apps/launch/distribution/revenue-share)

Excluded: founder/developer salary, customer acquisition, legal/privacy review, incident response projects, taxes, refunds/chargebacks, initial setup labor, and any premium API or data costs.

This scenario does **not** prove an 80–90% gross margin business.

## Sensitivity

| Change from base | Extra monthly cost | Remaining contribution | Service margin |
|---|---:|---:|---:|
| Base | $0 | $2,825 | 62.8% |
| Infrastructure costs double for core + ingestion | $800 | $2,025 | 45.0% |
| Support rises to 60 total hours | $1,000 | $1,825 | 40.6% |
| Both happen | $1,800 | $1,025 | 22.8% |

With base contribution of $28.25/store, a hypothetical $6,000 monthly development/acquisition overhead would require roughly **213 stores** at unchanged economics. This is a rough linear planning calculation; fixed cost allocation and scale effects make it unsuitable as a forecast.

## Per-plan cost ceilings

A 70% service-margin target permits costs of only:

- Starter: $8.70/store/month.
- Growth: $17.70/store/month.
- Scale: $29.70/store/month.

At $25/hour, 30 minutes of support costs $12.50: more than Starter's entire target cost budget before infrastructure or fees. Self-service installation is therefore a business requirement.

Measure cost by tier. Do not let large accounts silently consume all margin while aggregate numbers look healthy. If the low tier cannot meet the target, narrow included workload, improve onboarding, or raise price rather than removing correctness controls.

## Price validation

Interview at least ten target merchants about actual alternatives and costs. Test $29/$59/$99 against a second package—for example, fewer tiers at $39/$79—using real pilot purchase decisions. Small samples are directional, not statistically conclusive.

Track activation, support time, trial-to-paid, 30/60-day retention, usage distribution, and contribution by tier. Require at least five paid pilot commitments before treating pricing as validated. Do not count compliments or email signups as willingness to pay.

