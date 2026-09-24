# Validation — September 24, 2026

## Changes

- Replaced the Tailwind CDN runtime and duplicated inline configuration with a reproducible, minified CSS build (about 24 KB uncompressed).
- Pinned Alpine 3.15.8 and served its 47 KB runtime locally. Removed whole-page cloaking so static content paints before JavaScript initialization and remains visible if scripts fail.
- Converted all 12 JPEGs to WebP: 3,220,605 → 1,592,898 bytes (50.5% smaller). Retained originals. Prioritized the hero image and lazy-loaded catering/review imagery. Reserved the catering image's layout independently of image loading.
- Replaced invalid numeric font-weight utilities with standard Tailwind weights and included the used Inter 900 weight.
- Fixed the careers Apply Now anchor, small-screen native form-control overflow, and careers navigation's Menu destination.
- Improved text contrast, added skip links and visible focus outlines, made the review scroller keyboard accessible, exposed menu category selection as toggle buttons, and added Escape handling to mobile navigation. Reduced-motion preferences now also stop repeating animations.
- Catering submission now checks the provider's JSON success flag, times out after 15 seconds, and preserves entered data when a request fails. Added a native form fallback and a no-JavaScript menu explanation.

## Validation performed

- Production CSS/vendor build succeeds; JavaScript syntax and Git whitespace checks pass.
- Project dependency audit: zero known vulnerabilities.
- Browser checks cover all three pages at 320, 390, 768, and 1440px: page rendering, local resources, anchors, runtime errors, horizontal overflow, and automated WCAG A/AA checks using axe-core.
- Interaction coverage includes mobile navigation, both featured menu categories and their images, all 49 full-menu items, catering success/HTTP rejection/provider rejection/network failure/timeout, required job-application fields, PDF availability, and the careers success redirect.
- Third-party-outage and JavaScript-disabled checks verify graceful behavior. All form requests are simulated; no test messages or applications are delivered.
- Desktop and mobile screenshots were visually reviewed, and below-the-fold image loads were checked by scrolling through the home page.

## Performance comparison

Three cold-cache Chrome runs per version, 390×844 viewport, 4× CPU throttle, 150ms latency, and 200 KB/s download throughput. Original version was the initial Git HEAD, served separately. Values below are medians; measurements are local lab results, not production guarantees.

| Metric | Original | Optimized |
| --- | ---: | ---: |
| First contentful paint | 2.836 s | 0.888 s |
| Largest contentful paint | 6.700 s | 1.752 s |
| Initial transferred bytes | 1,510,668 | 682,474 |
| Cumulative layout shift | 0.03894 | 0.00010 |

Largest contentful paint improved approximately 74%; initial transfer fell approximately 55%. The first optimized run had slower font delivery (3.796 s LCP); subsequent runs were 1.612 s and 1.752 s. Google Fonts remains an external dependency with system-font fallbacks.

## Remaining boundaries

- Actual FormSubmit activation, email receipt, attachment delivery, Google Maps, and ChowNow checkout require live service verification. Tests deliberately do not submit personal data or place orders.
- Chrome was tested; Safari/Firefox and real-device testing were not performed. Automated accessibility scans supplement, rather than replace, manual assistive-technology testing.
- Hosting compression/cache headers and production network behavior cannot be verified without a deployment. No deployment was performed.
- Existing prices, hours, review totals, review quotations, and relative review dates were preserved; their current business accuracy was not verified.
- The first dependency install resolved to the home-directory package because this project had no package manifest. The added home-directory dependencies were removed and its previously installed Tailwind 4.1.7 was restored. Project dependencies now live under this project's own package manifest and lockfile.
