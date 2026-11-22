# AdsTracking homepage design verification

The analytics design supplied on Pinterest guided the cloud-blue hero, pill navigation, layered dashboard and three feature cards. The moving wordmark strip beneath the dashboard follows the TrueProfit example. [Analytics design reference](https://www.pinterest.com/pin/1146869861389759408/) · [Scrolling strip reference](https://trueprofit.io/solutions/marketing-attribution)

## Adaptation

- The original sky artwork drifts behind a stationary headline and dashboard. The dashboard uses AdsTracking’s attribution calculation and sample orders. Visitors can switch between returns and costs or open the full demo.
- The strip identifies report inputs. It includes Shopify, Meta Ads, Google Ads, CSV and JSON. Hover pauses the strip. Its motion button pauses or resumes the sky, the scrolling strip and both connector diagrams together.
- The phone layout presents one level dashboard with the report controls above the chart. The feature cards stack in reading order.
- Each feature card now links to a larger visual. Two light sections alternate explanatory text with a source diagram and an interactive attribution comparison. A dark section follows the inputs through the AdsTracking mark to the report totals. These layouts adapt the three supplied TrueProfit screenshots to the existing cobalt palette. [Attribution visual reference](https://trueprofit.io/solutions/marketing-attribution)
- The source diagram offers the example JSON used by the campaign report. The model switch uses that same example to recalculate the campaign rows. The dark diagram uses an original transparent glass tile with the AdsTracking chart mark overlaid.
- In both connector diagrams, moving points follow the same paths that draw the wires. The dark diagram changes to vertical routes on phones. Reduced-motion preferences leave the points and sky still and display one static list of report inputs.

## Browser checks

- Compared desktop and phone captures of the hero, strip and feature cards with the supplied designs.
- Checked the production homepage in Chrome at 1920 × 930 and 390 × 844. Both layouts fit the viewport. Signup and demo links opened their destinations, and the cost view displayed refunds.
- Verified continuous movement, pause, keyboard resume and reduced-motion behavior on both sizes. Chrome recorded no console errors or page exceptions during those flows.
- A 320-pixel check caught the header extending past the edge of the screen. After tightening the spacing, navigation and viewport checks passed at 320, 768, 921, 1024 and 1440 pixels.
- Compared the three new sections against the supplied references using production captures at 1440 and 390 pixels. On desktop, the light illustrations alternate sides, followed by the dark input-to-output diagram. On a phone, the explanatory text sits above each light diagram and the dark flow reads vertically.
- Checked the new sections at 320, 390, 820 and 1440 pixels. The diagrams fit at each width, the feature-card links opened their sections, the sample download matched the report fixture, and the demo link opened the report. Changing the model with the keyboard moved the credited sale between Meta and Google. Chrome reported no errors in these flows.
- All six homepage and pricing Playwright tests passed against the local production server. They cover attribution recalculation, the narrow phone menu, report preview, public demo, strip controls, pricing hover state, billing-period selection and keyboard navigation to signup.
- At 320, 390, 820 and 1440 pixels, Chrome confirmed each diagram’s five visible points advanced, the sky moved while the headline stayed in place, the shared button froze and resumed the animations, and reduced motion disabled them. Desktop and phone captures taken 700 milliseconds apart showed visible movement in each diagram and in the sky.

Final result: passed
