# AdsTracking design verification

The reference was TrueProfit’s public marketing attribution page. The requested adaptation uses AdsTracking branding, original copy, and a working campaign report as the hero visual. [Reference page](https://trueprofit.io/solutions/marketing-attribution)

## Visual comparison

| Surface | Review |
| --- | --- |
| Typography | The reference uses Plus Jakarta Sans. AdsTracking keeps the app’s existing Geist family, with a centered display heading, uppercase category label, and compact table text. |
| Layout | The landing page uses a dark framed hero, paired actions, a light dashboard preview, and alternating feature panels. The compact announcement links to an example that visitors can open. The phone layout stacks the primary actions. |
| Color and assets | Navy, emerald, and white follow the reference hierarchy. The brand mark and report interface belong to AdsTracking. The financial figures come from the bundled example orders and campaign spend. |
| Content | The feature panels explain click selection and contribution. The page retains the project’s existing billing plans. The demo exposes the actual model, lookback, evidence, and export controls. |

The first desktop comparison showed the heading on a single long line and the dashboard sitting higher than the reference. The final layout narrows the heading, gives the announcement action more space, and increases the gap between the phone actions. The browser check also identified a pricing translation mismatch during the initial build.

## Verification

- Compared fresh Chrome captures at 1440 × 900 and 390 × 844. The revised desktop headline wraps across two lines, the dashboard begins below both primary actions, and the mobile actions remain fully visible. Both the landing page and demo fit the viewport.
- Checked phone navigation, the hero’s returns/costs switch, both attribution models, both lookback windows, credited-click evidence, and the CSV download. The final checks recorded no browser errors.
- Ran the homepage and pricing browser tests against the production build. All three passed, including keyboard navigation to signup.
- Verified the authenticated import, save, reload, recalculation, and export flow against local PostgreSQL.

Final result: passed
