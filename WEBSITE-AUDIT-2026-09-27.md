# Baldinos Rincon website audit

Reviewed September 27, 2026. Website: https://rinconbaldinos.com/

The site has a useful foundation: a readable menu, clear ordering links, telephone links, location information, catering inquiries, and a careers page. The most valuable work now is correcting business information, improving application privacy, connecting the Google listing to the website, and making the secondary pages easier to use on phones.

This audit separates confirmed observations from business decisions and unverified integrations. No production files, business listings, prices, or account settings were changed. No messages, applications, or orders were submitted.

**Scope and evidence**

- Inspected the live homepage, menu, and careers page in the browser, including rendered content, links, forms, mobile navigation, menu filters, map, and ordering destination.
- Checked all three pages at viewport widths of 320, 390, 768, and 1440 CSS pixels, after styles and generated menu content loaded.
- Compared downloaded production HTML and JavaScript with the local files. SHA-256 hashes matched for `index.html`, `menu.html`, `careers.html`, and `script.js`.
- Checked HTTPS, HTTP and www redirects, public assets, PDF delivery, robots.txt, sitemap.xml, an unknown URL, compression, caching, and response headers.
- Opened the linked Google Maps business listing and ChowNow restaurant, compared reviews, business details, sample prices, and operating windows.
- Read and visually inspected all four pages of the required employment PDF. It is fillable, with 130 PDF form fields; it is not simply a scanned document.
- Reviewed existing test coverage and the earlier validation record as background. Those historical test results are not presented as new live audit results.

**Do these first**

| Priority | Finding | Status | Recommended action |
| --- | --- | --- | --- |
| High | Required job application asks for an SSN and is submitted through an email form service | Confirmed | Remove SSN from initial application; use a short mobile form and a separate secure onboarding process |
| High | Website menu prices differ from its linked ChowNow menu | Confirmed differences; business intent unknown | Reconcile prices or clearly distinguish in-store and online prices beside the menu |
| High | Website claims 4.8 stars / 35 Google reviews; Google currently shows 4.5 / 50 | Confirmed | Correct visible claims and metadata; remove hard-coded relative dates |
| High | Public Google listing displays “Add website” | Confirmed public presentation | Add this domain through the authorized Business Profile account |
| High | Sunday online ordering hours differ from store hours | Confirmed differences; business intent unknown | Verify ordering cutoff/opening time and label store versus online hours |
| High | No privacy notice linked from forms or footer | Confirmed on all three pages | Explain information collected, service providers, use, retention, access, and contact route |
| High verification | Actual catering-email and application-attachment receipt is unverified | Not tested end to end | Perform owner-authorized delivery tests and check the receiving inbox and attachment |

**1. Remove SSN collection from the initial application**

Page 1 of the required employment application explicitly asks for a Social Security number. The careers page requires applicants to attach the completed PDF and posts it to FormSubmit using a multipart request. The PDF also requests home address, employment history, references, and other extensive personal information.

This creates unnecessary exposure during initial recruitment. Replace the first-stage application with name, contact details, desired role, availability, relevant experience, and optional résumé. Collect any information needed for payroll or later onboarding through a purpose-built secure process at the appropriate stage. Review the remaining employment questions with the person responsible for hiring policy.

This is a practical data-minimization recommendation, not a finding that a breach occurred. The [FTC's business guidance](https://www.ftc.gov/business-guidance/resources/protecting-personal-information-guide-business) recommends collecting only necessary information and protecting sensitive transmissions.

Evidence: `Employment-Job-Application.pdf`, page 1; `careers.html`, lines 136–174.

**2. Reconcile menu prices with online ordering**

The ordering link correctly opens the restaurant at 801 S Columbia Ave. However, sampled base prices differ:

| Item | Website | Linked ChowNow menu |
| --- | ---: | ---: |
| #24 Italian Battalion, half | $8.69 | $10.19 |
| #24 Italian Battalion, whole | $14.39 | $17.29 |
| #18 Smoked Turkey & Provolone, half | $8.19 | $9.59 |
| Italian salad | $7.99 | $8.99 |
| Chips | $1.59 | $1.69 |

The half Italian Battalion's $10.19 base price was also confirmed inside its customization dialog, before adding anything to an order. These are displayed item prices, not a comparison of checkout taxes or fees.

The website's note says prices may vary “by location,” but both pages refer to the same location. If online pricing intentionally differs, label the site's prices as in-store prices and explain that online pricing differs. Otherwise, update both from one approved menu source. Put the explanation near the prices rather than only at the bottom of a long page.

Sources: [website menu](https://rinconbaldinos.com/menu), [Rincon ChowNow menu](https://direct.chownow.com/order/34681/locations/61755). The current in-store price list was not independently available.

**3. Correct ratings and review dates**

The homepage shows 4.8 stars and 35 Google reviews in two places. Its meta description also says 4.8. The linked [Google listing](https://www.google.com/maps/search/?api=1&query=Baldinos%20Giant%20Jersey%20Subs%20801%20S%20Columbia%20Ave%20Rincon%20GA%2031326) showed 4.5 stars and 50 reviews during this audit.

Kenya Baker's displayed review is labeled “1 month ago” on the site and “9 months ago” on Google. The website's review dates are literal strings in `script.js`; they never age automatically. The six selected reviews are not a live feed.

Correct the rating and count, or remove the numerical claim if nobody will maintain it. Use actual review dates, a documented “checked on” date, or omit relative dates. Verify all six excerpts against their original reviews and present them as selected excerpts. Only Kenya Baker's excerpt and date were directly compared in this audit; the other quotations remain to be checked.

Evidence: `index.html`, lines 8, 160–166, and 348–353; `script.js`, lines 62–93.

**4. Connect the Google Business Profile to the site**

The public listing displayed an “Add website” button and no website link. This appears to be a missing connection in the public profile; the private account's ownership and settings were not inspected.

Add `https://rinconbaldinos.com/` as the website through the authorized Business Profile account, and verify the menu and order links. That gives Maps visitors a direct route to this site. Also ensure any maintained social profiles and the parent brand's location directory reference the correct domain where appropriate. [Google's profile editing guidance](https://support.google.com/business/answer/3039617) describes these fields.

**5. Clarify store hours versus ordering hours**

The site and Google agree on Monday–Saturday 10 AM–9 PM and Sunday 11 AM–8 PM. ChowNow showed today's Sunday pickup and delivery windows as 10 AM–7 PM. Its Monday–Saturday windows matched 10 AM–9 PM.

This may reflect separate online hours, a temporary override, or a configuration error. Verify it with the store. If intentional, clearly show the online ordering window or cutoff. Also confirm the separately published catering window of 11 AM–7:30 PM and the $50 delivery minimum apply to the direct catering process advertised here. A partner's hours or minimums need not be the same as direct orders.

Add holiday/special-hours handling. If adding an “Open now” indicator, base it on America/New_York and include special closures rather than relying only on weekly hours.

**6. Add a privacy notice**

Neither form nor the footer links to a privacy notice. Customers and applicants are told their information goes straight to the team, but FormSubmit is also involved in processing the submission.

Publish a concise, accurate notice covering the information collected, why it is used, providers involved, who can access it, how long the business keeps it, and how to contact the business about it. Include hiring attachments explicitly while that flow exists. Inventory the actual use of Google Maps, Google Fonts, ChowNow, FormSubmit, and the Cloudflare analytics beacon.

This audit does not conclude that every visitor requires a cookie banner. Consent requirements depend on actual tracking and applicable rules; a decorative banner would not resolve the missing explanation.

**7. Verify real form delivery before relying on it**

The catering code checks both HTTP status and FormSubmit's success response, has a 15-second timeout, and preserves input after failure. Those are good safeguards. The careers form correctly uses multipart encoding for its PDF attachment.

However, source code and simulated tests do not prove current inbox delivery. The existing automated tests intercept form requests, and this audit did not send a message or application. Verify activation, recipient address, spam-folder placement, attachment arrival/readability, and the actual return URL with owner-authorized test submissions. Establish who monitors the inbox and the promised response window.

For catering, an accepted inquiry must not be presented as a confirmed booking. Use wording such as “Request received; your catering order is confirmed only after our team contacts you.”

**8. Make catering easier to buy**

The section advertises party subs, boxed lunches, salads, desserts, and drinks, but gives no package prices, serving counts, advance-notice requirement, delivery area, delivery charge explanation, or inclusions. The contact form has only name, a combined phone-or-email field, and a message. Date and headcount appear only in the message placeholder.

Add verified packages with serving counts and starting prices, what comes with each package, pickup/delivery options, minimum notice, delivery coverage, and order-confirmation expectations. Add structured fields for event date, time, headcount, pickup/delivery, and contact details. A dedicated catering page would give customers a useful URL to share with an office or event organizer.

Do not copy a delivery partner's fee or menu without confirming it applies to direct orders. The [Rincon ezCater listing](https://www.ezcater.com/catering/baldinos-giant-jersey-subs-7) can help identify what needs reconciliation, but should not automatically dictate direct-store policies.

**9. Restore mobile navigation on menu and careers**

The homepage provides a mobile navigation button and working Escape handling. On the menu and careers pages, the desktop navigation is hidden below 1024px and no hamburger replacement exists. Customers must return to the homepage to navigate between sections.

Use the same accessible header on all pages, with Menu, Catering, Visit, Careers, and the appropriate primary action. Keep its expanded state and keyboard behavior consistent.

Evidence: `menu.html`, lines 30–53; `careers.html`, lines 30–53. Confirmed at phone and tablet widths.

**10. Fix the narrow-screen sticky category overlap**

At a 320px viewport, the menu header grows to 85px tall because its content wraps. The category bar still sticks at `top: 68px`, so it overlaps the bottom 17px of the header. At wider tested widths the header is approximately 69px.

Use an offset tied to the actual header height, or keep the header height stable at narrow widths. Retest category anchors as well as scrolling. The issue is visible even though the page has no horizontal overflow.

Evidence: `menu.html`, line 73; live header/category bounding rectangles at 320px.

**11. Put form success messages where people can see and hear them**

The careers return state scrolls to the top of the page, but its “Application received!” heading appears around 1,354px down at 390×844. Applicants initially see the recruiting introduction instead of their confirmation. The success block has no live-region semantics.

On return, scroll and move focus to an accessible confirmation, or use a dedicated confirmation view. Include a realistic follow-up expectation. This was verified by opening the documented `?sent=1` return state; no application was sent.

Catering success is only a temporary button-label change and resets after four seconds. Use a persistent `role="status"` confirmation and retain clear next steps. Keep the existing error alert. See [W3C guidance on status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

**12. Simplify hiring and explain the job**

The careers page says full-time and part-time positions are open but does not identify specific openings, typical shifts, duties, compensation information, or expected response time. Add accurate details that applicants need to decide whether to apply.

Although the PDF is fillable, downloading, completing, saving, and uploading a four-page document is still cumbersome on a phone. Prefer a short native web application. If retaining upload temporarily, disclose the permitted file size and validate it before submission. FormSubmit documents a 10MB total upload limit; the current page provides no size guidance. Review bot protection: the careers form explicitly disables reCAPTCHA and relies on a honeypot plus whatever protections the provider supplies. [FormSubmit documentation](https://formsubmit.co/documentation).

**13. Add the missing local-search metadata**

All three pages have titles, descriptions, language, and viewport metadata. None has a canonical URL or Restaurant/LocalBusiness structured data. `sitemap.xml` returned 404. `robots.txt` returned 200 with Cloudflare comment text; it contains no sitemap reference or active blanket crawl prohibition in the returned content.

Add Restaurant JSON-LD with verified name, address, phone, opening hours, URL, menu URL, images, and cuisine. Add canonical URLs using the final public routes, currently `/`, `/menu`, and `/careers`. Publish a sitemap and include its URL in robots.txt. Validate through Search Console and Google's Rich Results Test. A missing sitemap on a small site is an improvement opportunity, not proof that Google cannot index it. [Google local-business documentation](https://developers.google.com/search/docs/appearance/structured-data/local-business).

Do not expect self-published Google review excerpts or an aggregate rating on this restaurant's own site to produce review stars in search. Google's [review rich-result rules](https://developers.google.com/search/docs/appearance/structured-data/review-snippet) restrict self-serving LocalBusiness reviews.

**14. Confirm indexing in Search Console**

A public site-restricted search did not return this domain in the results available to this audit. That is not a definitive indexing diagnosis. Private Search Console access was not used.

Verify the domain property, inspect the homepage/menu/careers URLs, submit the sitemap, and check crawl/indexing reports. The website's title and location description are reasonable starting points. Updating the Google Business Profile website field is a particularly concrete near-term action.

**15. Serve the menu as HTML before JavaScript runs**

The 49 menu cards are generated by Alpine templates; the initial HTML contains data in a script rather than readable menu entries. The no-JavaScript fallback points to ChowNow, which also requires JavaScript.

Render or generate the menu into the HTML during the build and use JavaScript only for enhancements. This improves resilience and accessibility for tools that do not execute scripts. Google can render JavaScript, so this is not a claim that the present menu is categorically unindexable. [Google JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

**16. Add social-sharing previews**

No Open Graph or Twitter-card metadata was found. Provide a branded preview image, title, description, and canonical URL for each page. This gives shared links a predictable presentation in compatible messaging and social apps. The presence of a favicon does not replace link-preview metadata.

**17. Answer practical menu and visit questions**

Add verified sandwich lengths or serving guidance for Half, Whole, and Family. Explain bread choices, wrap pricing/sizing if different, and what is included. ChowNow's sampled sub offered white and wheat bread; that choice is not explained on the website menu.

Add a clear route for allergen questions and accurate dietary labels where the kitchen can substantiate them. Do not imply gluten-free or allergy-safe preparation without confirmation. A vegetarian sandwich is already listed, so vegetarian availability itself is not missing.

Explain ordinary delivery availability, whether an address check is required, pickup instructions, parking/access details, and holiday hours. Add a recognizable storefront photo to help first-time visitors find the correct shop. Only publish accessibility and parking details after verification.

**18. Improve form labels and input behavior**

Visible fields already have associated labels and required flags. However, they lack purpose-specific autocomplete attributes. Add `name`, `tel`, and `email` autocomplete values; separate phone and email in the catering form so each can be validated appropriately. A combined plain-text contact field can accept an unusable response.

Configure the provider's reply-to field explicitly when an email address is collected. Use a mobile-friendly input size and test iOS focus behavior; current text inputs compute to 14px. Real iPhone keyboard/zoom behavior was not tested. [W3C guidance on input purpose](https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html).

**19. Associate desktop menu prices with their sizes**

On mobile, each price has a visible Half/Whole/Family label. Desktop uses visual columns of ordinary divs and spans, rather than table header associations or a size label on each price. Improve the markup so assistive technology can reliably associate each price with its size, for example with a semantic table or accessible per-price labels.

The site already includes skip links, useful heading structure, image alternatives, reduced-motion styling, and keyboard focus styling. This audit is not a full screen-reader or WCAG conformance certification.

**20. Add a useful 404 page and cleaner internal links**

An unknown URL returned HTTP 404 with an empty body. Keep the correct 404 status, but provide a branded page with Menu, Order, Call, and Home actions.

Internal links use `.html` routes even though production redirects `/menu.html` and `/careers.html` to extensionless paths with HTTP 307. Update links to the selected canonical routes and consider permanent redirects for permanent URL conventions. The current links work; this is navigation and technical cleanup.

**21. Track meaningful business actions**

A Cloudflare analytics beacon was present in the live DOM, so “no analytics at all” would be incorrect. No custom events for order clicks, calls, directions, catering success, or applications were found in the site code.

Measure those actions with an appropriate privacy-conscious setup. Distinguish clicking “Order Online” from completing a purchase; actual order conversion requires ChowNow reporting or integration. Check what the existing Cloudflare account already provides before adding another analytics product.

**22. Finish performance and hosting improvements**

Good foundations: static pages, Cloudflare delivery, local Alpine runtime, minified CSS, WebP imagery, hero preload, and lazy loading for lower-page images/maps. All checked public assets returned 200. The CSS response was gzip compressed, approximately 5.5KB transferred; Alpine transferred approximately 16.8KB compressed.

The hero image is about 131KB; the steak image about 225KB. Several menu images are around 1600px wide even on phones. Add responsive image variants and sizes where worthwhile. Review browser caching: the checked stylesheet uses `max-age=0, must-revalidate` despite a versioned URL. Fingerprinted assets can use longer browser caching when the deployment pipeline reliably changes their URLs.

Google Fonts is still a third-party dependency. Consider trimming font weights or self-hosting if real performance evidence justifies it. Avoid delaying the more consequential information fixes for small byte savings.

The PageSpeed API returned HTTP 429 for quota exhaustion. No fresh Lighthouse score, production LCP/INP/CLS result, or Core Web Vitals pass/fail is claimed. The earlier `VALIDATION.md` contains local lab results from September 24; those are not current production field measurements.

**23. Add baseline response-header protections**

HTTPS and HTTP-to-HTTPS redirection work. The checked HTML responses did not include a Content-Security-Policy, HSTS, X-Content-Type-Options, Referrer-Policy, or explicit framing restriction. These are hardening opportunities, not evidence of an exploit or breach.

Add suitable headers through the hosting configuration and verify forms, maps, fonts, ordering links, and scripts still work. Roll out CSP carefully: the site uses inline scripts and Alpine expressions, so a blindly copied restrictive policy can break functionality. Review existing provider-side protections separately; they cannot be inferred from the public HTML.

**24. Add an ownership and maintenance routine**

Assign an owner for prices, hours, hiring status, catering availability, and review claims. Maintain one approved menu dataset for homepage features and the full menu. Add a visible “last updated” date where useful. Keep an operational checklist for partner menus and the Google listing so changes do not leave conflicting information across channels.

Useful optional improvements after the above: an approved brand logo in place of the current B monogram; a short local owner/team story; a print-friendly menu; verified links to active social accounts; and a rewards link if the store wants to promote the offer visible in ChowNow. A blog, chatbot, newsletter popup, or new loyalty system should depend on a concrete business need and someone owning it.

**Verified strengths and checks**

| Check | Result |
| --- | --- |
| Homepage, menu, careers | All served successfully |
| CSS, application JavaScript, Alpine, icons, referenced WebP assets | Checked resources returned 200 |
| Employment PDF | 200; four pages; fillable; inspected visually and as text |
| HTTP → HTTPS | 301 to HTTPS |
| www → apex domain | 301 to rinconbaldinos.com |
| Embedded map | Loaded the correct Rincon location |
| Address and phone | Match Google and the parent brand's location listing |
| Ordering destination | Correct restaurant/location; menu and item customization loaded |
| Homepage mobile menu | Opens; Escape closes it |
| Homepage Subs/Salads control | Changes displayed cards successfully |
| Full menu | 49 cards render; category navigation works |
| Horizontal page overflow | None on the three pages at the four tested widths |
| Console warnings/errors | None captured for the first-party page checks |
| Semantic basics | One H1 per page; labeled visible form fields; skip links; image alternatives |
| Sitemap | `/sitemap.xml` returned 404 |
| Unknown URL | 404 with empty response body |

The browser reserves a 15px scrollbar gutter in this environment. For requested widths of 320/390/768/1440px, document widths were 305/375/753/1425px. The page scroll width matched the document width at each size. This does not establish real-device Safari behavior or remove the separate sticky overlap finding.

**Suggested implementation order**

1. Correct reviews and clarify pricing/hours; remove SSN collection; connect the Google listing to the domain.
2. Add privacy information and verify actual form delivery with the store; improve visible and accessible confirmations.
3. Reuse mobile navigation across pages; fix the narrow sticky offset; streamline the job application.
4. Add useful catering details and menu/visit information approved by the store.
5. Add structured data, canonical URLs, sitemap, sharing metadata, and a helpful 404 page; verify Search Console.
6. Add conversion measurement, measured performance improvements, and tested hosting protections.

**What remains unverified**

Actual in-store pricing and intentional online markups; provider account configuration and inbox delivery; checkout/payment completion and delivery eligibility for a real address; the other five featured review excerpts; business ownership and Search Console settings; real Safari/Firefox and assistive-technology behavior; production field performance; and legal sufficiency of privacy/hiring policies. These are specific boundaries of this audit, not confirmed failures.
