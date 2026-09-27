# Baldinos Rincon website

Three static restaurant pages and a custom 404 page, served by Cloudflare Workers Static Assets. A small Worker accepts anonymous business-action events at `/events`; normal page and asset requests are served directly as static files.

## Develop and validate

Use a supported Node.js release compatible with the pinned Wrangler version, then:

```sh
npm ci
npm run build
npm test
npm run preview
```

Open http://127.0.0.1:4173. **All forms in this local preview are simulated and never send email.** Use `/?form-test=failure#contact` to exercise catering error recovery. The application upload simulation discards the submitted data and redirects to the success state. Production HTML in `dist/` retains the real FormSubmit endpoint.

`npm test` runs HTTP, asset, metadata, routing, and Worker input-validation checks. The optional `npm run test:browser` command runs the Playwright suite with installed Google Chrome; the suite uses simulated forms. The September 27 implementation was checked through the Codex browser and Node tests; the separate Playwright suite was updated but not run in that pass.

Edit `styles.input.css` and `tailwind.config.cjs` for styling. Run `npm run build` after changing content, classes, scripts, or images. Commit the generated `styles.css`. There is no client framework dependency: the full menu is HTML, navigation uses native disclosure markup, and `script.js` provides optional enhancements.

The build reads image references from the four public HTML files, creates content-hashed asset names, writes a CSP hash for inline restaurant JSON-LD, and emits `_headers` in `dist/`. Only referenced public assets, the application PDF, sitemap, robots file, redirects, and pages are copied. Source photos, tests, reports, and tooling are not deployed.

## Deployment

```sh
npm run build
npm test
npx wrangler deploy --dry-run
npx wrangler deploy
```

The GitHub repository already triggers Cloudflare Workers Builds for `baldinos-rincon` when `main` is pushed. That is the publishing workflow; a separate local Cloudflare login is unnecessary. The final command above is an alternative manual deployment requiring Cloudflare authentication. The current Cloudflare build command `npm run build` and deploy command `npx wrangler deploy` remain compatible. Deploy through Wrangler so both `worker.mjs` and static assets are included; uploading only `dist/` would omit action tracking.

For a local Cloudflare routing/header check:

```sh
npx wrangler dev --local --port 4180
```

**Unlike `npm run preview`, Wrangler serves the real production form destinations. Do not submit forms there unless intentionally performing an authorized real delivery test.**

## Business-action events

The browser sends only a fixed action name and page category to same-origin `/events`; it uses no tracking identifiers, cookies, or storage. It respects Do Not Track and Global Privacy Control. The Worker rejects unrecognized actions, URLs, extra fields, cross-origin requests, and bodies larger than 256 bytes. It writes only the accepted fixed fields to Cloudflare Workers Logs; invocation logs are disabled. Cloudflare still processes requests as the hosting provider.

After deployment, use the `baldinos-rincon` Worker → Observability logs/query view, filter messages with `type: business_event`, and group/count by `action` and `page` within the account's available retention period. The events are `call_click`, `order_click`, `directions_click`, `catering_click`, `catering_success`, `application_submit`, and `application_return`.

These are indicative counts, not unique visitors, completed purchases, or verified inbox delivery. The application return can be reached manually. Browser blocking, navigation, replay, and failed network requests can affect counts. Workers Logs has limited plan-dependent retention, so this is not a permanent analytics history. No new analytics vendor or paid subscription is configured. See [Cloudflare Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/).

## Images and public information

Responsive WebP sizes are committed in `assets/`. Original source photos remain separate in `baldinos images/`; the build does not publish that folder. Share previews use `assets/social-preview.png` with an asset hash applied at build time.

Prices available in the Rincon ChowNow menu were updated on September 27, 2026. Where an item, size, or add-on was unlisted, the owner's original price was preserved as instructed. See `PRICE-UPDATE-2026-09-27.md` for the source and values. A visible notice explains that online and in-store prices may differ. Sandwich size/bread guidance was checked against [Baldinos' official menu](https://baldinos.us/menu/). No unverified parking, accessibility, allergy-safe preparation, or storefront-photo claims were added.

## Google reviews

The homepage has a static, owner-supplied **4.5-star / 55-review** badge linking directly to the restaurant’s Google Maps reviews tab. Navigation review links use the same destination. There is no separate reviews section, Google API request, API key, or billing setup required. The badge does not auto-update.

See `IMPLEMENTATION-2026-09-27.md` for scope, verification, and external steps still requiring access or confirmation. The original audit is in `WEBSITE-AUDIT-2026-09-27.md`.
