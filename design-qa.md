# AdsTracking homepage design verification

The analytics design supplied on Pinterest guided the cloud-blue hero, pill navigation, layered dashboard and three feature cards. The moving wordmark strip beneath the dashboard follows the TrueProfit example. [Analytics design reference](https://www.pinterest.com/pin/1146869861389759408/) · [Scrolling strip reference](https://trueprofit.io/solutions/marketing-attribution)

## Adaptation

- The sky artwork is original. The dashboard uses AdsTracking’s attribution calculation and sample orders. Visitors can switch between returns and costs or open the full demo.
- The strip identifies report inputs. It includes Shopify, Meta Ads, Google Ads, CSV and JSON. The animation loops horizontally, pauses on hover or with its button, and becomes a single static list when the visitor prefers reduced motion.
- The phone layout presents one level dashboard with the report controls above the chart. The feature cards stack in reading order.

## Browser checks

- Compared desktop and phone captures of the hero, strip and feature cards with the supplied designs.
- Checked the production homepage in Chrome at 1920 × 930 and 390 × 844. Both layouts fit the viewport. Signup and demo links opened their destinations, and the cost view displayed refunds.
- Verified continuous movement, pause, keyboard resume and reduced-motion behavior on both sizes. Chrome recorded no console errors or page exceptions during those flows.
- A 320-pixel check caught the header extending past the edge of the screen. After tightening the spacing, navigation and viewport checks passed at 320, 768, 921, 1024 and 1440 pixels.
- All five homepage and pricing Playwright tests passed against the local production server. They cover the narrow phone menu, report preview, public demo, strip controls, pricing hover state, billing-period selection and keyboard navigation to signup.

Final result: passed
