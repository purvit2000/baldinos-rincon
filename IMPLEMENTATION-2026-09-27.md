# Website audit implementation — September 27, 2026

Implemented against the numbered findings in `WEBSITE-AUDIT-2026-09-27.md`. The user excluded **1, 4, 5, 6, 8, 12, and 24**. Those exclusions were preserved: the PDF, store hours, Google Business Profile, privacy-notice scope, catering offerings, hiring requirements, and maintenance/optional-branding work were not changed. The existing public application PDF is byte-for-byte identical to the Git version (SHA-256 `6d9e6a3e44df5c4b1aaeb50fb0412583b465a0d8e0e810f4cf90d88cfb0ee838`).

The owner authorized committing, pushing, and publishing these changes. The existing GitHub-to-Cloudflare Workers Builds integration publishes `main`. No messages or applications were sent to the restaurant; delivery tests used only local simulations. Search Console account work remains pending as detailed below.

| Audit item | Implementation and status |
| --- | --- |
| 2 — Prices | Updated the prices found in the current Rincon ChowNow menu, including 72 sub size prices. Per the owner’s later instruction, preserved the original prices for unlisted items, sizes, and add-ons. Homepage prices agree with the full menu. See `PRICE-UPDATE-2026-09-27.md`. Online/in-store difference notices remain visible. |
| 3 — Reviews | Per the owner’s later instruction, replaced the separate reviews section and API integration with one static **4.5-star / 55-review** badge at the top. The badge and navigation review links open the verified Google Maps reviews tab directly. These display figures were supplied by the owner; they are not presented as an automatically refreshed count. No API key or Google billing setup is required. |
| 7 — Real delivery | Local catering success/failure and application upload/redirect simulations pass. **Real inbox receipt, spam-folder placement, attachment receipt, and reply behavior remain unverified** pending the owner's response to the live-test question. |
| 9 — Mobile navigation | Added the same native expandable navigation to home, menu, careers, and 404 pages. Links close the menu; Escape closes it and returns focus. Native disclosure still works without JavaScript. |
| 10 — Sticky overlap | Category navigation uses the measured header height. At 320px, the header ends at y=69 and category navigation starts at y=69; category headings remain below it after scrolling. |
| 11 — Success states | Persistent catering confirmation with keyboard focus, status semantics, and an explicit new-request action. Application return focuses and scrolls to the visible confirmation, retaining a meaningful URL fragment. Errors preserve entered catering details. |
| 13 — Search metadata | Added canonical URLs, Restaurant JSON-LD, sitemap.xml, and robots.txt. Schema uses the existing published hours and verified address/phone/location. No self-serving aggregate-review schema added. |
| 14 — Search Console | Code prerequisites prepared. **Account work remains blocked:** Search Console opens signed out. Property verification, sitemap submission, URL inspection, and indexing reports require the owner's Google account. No indexing claim is made. |
| 15 — Static menu | All 49 entries and prices are present in delivered HTML. Homepage featured cards also render without JavaScript. Removed Alpine and inline behavior scripts. |
| 16 — Sharing | Added per-page Open Graph/Twitter metadata and a 1200×630 branded image. Each deployment fingerprints the image URL to help cache invalidation. The share image is available to social crawlers; no claim is made that individual platforms have refreshed their caches. |
| 17 — Practical information | Added verified size/bread information, wrap-pricing contact guidance, allergen contact route, pickup instructions, and delivery address checking. **An authentic storefront photo and verified parking/access details remain unavailable.** Holiday-hour changes are excluded by item 5. No operational details were invented. |
| 18 — Forms | Separate email/phone inputs, autocomplete purposes, phone keyboard hint, reply-to configuration, 16px visible inputs, and contact validation. Email or phone is sufficient for catering with JavaScript; the native fallback requires email and explains this. |
| 19 — Price semantics | Each size/price pair uses a definition list on all screen sizes. The desktop view keeps visible labels instead of depending on visual alignment with distant column headings. |
| 20 — URLs and 404 | Added branded 404 with Home/Menu/Order/Call actions, real HTTP 404 status, canonical internal links, and permanent redirects for legacy HTML and trailing-slash page URLs. |
| 21 — Business actions | Added same-origin, fixed-field events for call/order/directions/catering clicks, catering success, application submission, and provider return. A minimal Worker validates events and writes them to existing Cloudflare Workers Logs. No identifiers, cookies, form values, or storage are used by this tracking code. Browser privacy signals are respected. The endpoint is included in the Cloudflare Worker deployment. Logs have limited retention and counts are not completed purchases or independently verified deliveries. |
| 22 — Performance | Added responsive WebP sizes, removed unused runtime dependency, fingerprinted public assets, and one-year immutable asset caching. HTML uses revalidation. First-party JS decreases from 51,136 to 9,678 uncompressed bytes (about 81%), including the new review display. No new Lighthouse or production Core Web Vitals result is claimed. |
| 23 — Headers | Added CSP without unsafe-inline/unsafe-eval, HSTS, nosniff, framing restrictions, Referrer-Policy, and Permissions-Policy. Forms, fonts, maps, the existing Cloudflare beacon, and same-origin events are allowed explicitly. Headers and behavior validated locally; final live checks follow deployment. |

## Verification performed

- `npm run build` passes and outputs four pages, 35 fingerprinted assets, the public PDF, sitemap, robots file, redirects, and security headers. No source photos, reports, local simulation tools, or tests are included in the publish directory.
- `npm test`: **14 passing tests** covering local links and cross-page anchors, static menu count, metadata, sitemap, CSP hashes, immutable caching, redirects, 404 status, PDF preservation, form simulation routes, Worker input validation, price preservation/consistency, and the reviews integration’s secret handling, attribution, validation, provider errors, and rate limits.
- `wrangler deploy --dry-run` passes with `ASSETS` and `REVIEWS_LIMITER` bindings.
- The real local Cloudflare runtime serves the three pages as 200, unknown paths as 404, legacy HTML paths as 301, immutable assets with a single one-year cache policy, and accepted/rejected event payloads as 204/400. Header configuration parses successfully.
- Browser checks on all three pages at **320, 390, 768, and 1440px**: no horizontal overflow; visible text inputs compute to 16px.
- Mobile navigation opens and closes; Escape returns focus; homepage filters show the correct three cards.
- At 320px, the sticky menu categories no longer overlap the header and category headings remain visible.
- Catering success simulation displays a persistent, focused confirmation in the viewport. The failure simulation preserves name/message and permits retry. Phone-only contact validation passes.
- A blank public application PDF was attached and submitted **only to the local simulation**. Its redirect displays the focused success card within the mobile viewport, hides the form, and removes the transient query parameter.
- Browser screenshots inspected for homepage, navigation, menu price cards, desktop careers, and application confirmation. Branded sharing image visually inspected.
- Review cards checked at 320, 390, and 1440px using clearly labeled local fixtures: no horizontal overflow, Google logo at 18px, lower ratings preserved, and HTML-like review text displayed literally. The normal preview was restored after testing. Synthetic data exists only in the non-deployed preview tool.
- Existing Playwright tests were updated for the new paths and behavior and syntax-checked, but **that separate suite was not executed**. This pass does not claim an axe certification, a full screen-reader audit, or physical-iPhone testing.
- `git diff --check` passes. The CSS build emits a pre-existing stale Browserslist-data advisory; compilation succeeds.

## External completion steps

1. Google reviews no longer require activation: the owner requested a static badge and direct link. The previous API endpoint, rate-limit binding, synthetic preview fixtures, and setup guide were removed.
2. Cloudflare publishing already runs through GitHub; no separate Cloudflare login is needed to push normal website changes. Production routes and assets should be checked after the deployment completes.
3. Complete the clearly labeled real catering and blank-PDF application tests with the receiving inbox available. Confirm receipt, attachment, spam placement, and reply-to routing. The owner's earlier test-coordination question is still pending.
4. Sign into [Search Console](https://search.google.com/search-console) for the domain, verify ownership, submit `https://rinconbaldinos.com/sitemap.xml`, and inspect the three canonical pages. This does not modify the excluded Google Business Profile.
5. Supply an authentic storefront photo and confirmed parking/entrance details if those portions of item 17 are to be completed.

## Sources for newly added facts and hosting behavior

- [Baldinos official menu](https://baldinos.us/menu/) — sandwich lengths and bread choices.
- [Google listing used in the audit](https://www.google.com/maps/search/?api=1&query=Baldinos%20Giant%20Jersey%20Subs%20801%20S%20Columbia%20Ave%20Rincon%20GA%2031326) — direct listing link; static review excerpts and dated ratings were removed.
- [Cloudflare static asset headers](https://developers.cloudflare.com/workers/static-assets/headers/) — cache and response-header configuration.
- [Cloudflare Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/) — logging, invocation-log setting, and plan-dependent retention.

## Follow-up: static review badge

The owner requested a static 4.5-star / 55-review preview at the top, linked directly to Google reviews, and removal of the separate review section. The direct reviews-tab destination was verified in Google Maps. Google showed 50 reviews during this check; the requested 55 is the owner-supplied static display value. The original API validation listed above describes the earlier implementation; those four tests were removed with the unused API. The remaining ten checks, build, responsive badge layout, link destination, and live deployment are checked for this follow-up.
