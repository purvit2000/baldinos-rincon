# Baldinos Rincon website

Static three-page website. The build prepares a deployable `dist/` folder; no application server is required.

## Develop and validate

Use Node.js 20 or newer and npm:

```sh
npm ci
npm run build
npm run preview
npm test
```

Open http://127.0.0.1:4173. Browser tests use an installed Google Chrome and start a preview server automatically when one is not running. All form submissions in the tests are intercepted; no emails or applications are sent.

Edit `styles.input.css` for custom CSS and `tailwind.config.cjs` for design tokens. Run `npm run build` after editing HTML utility classes or dependencies. The build scans all three HTML pages and `script.js`, produces minified `styles.css`, copies the pinned Alpine runtime into `assets/vendor`, and assembles only the public website files in `dist/`. Commit the generated CSS and Alpine runtime; production requires no Node runtime or CDN compiler.

Cloudflare Workers deploys the `dist/` folder through `wrangler.jsonc`. The existing Cloudflare build command `npm run build` and deploy command `npx wrangler deploy` can remain as they are. `node_modules`, tests, source photos, tooling, and Git metadata are never copied into `dist/`.

## Images

The website uses optimized WebP images. Original source photos are retained separately in `baldinos images/` and the two ignored files in `assets/`. Unused display images have been removed from `assets/`. If a new image is added to a page, add it to the file list in `tools/build-static.cjs` so it is included in the deployed site.

## Performance measurement

With the preview server running:

```sh
node tools/measure.cjs http://127.0.0.1:4173
```

Pass a second URL to compare versions. Each URL receives three cold-cache mobile runs with 150ms latency, 200 KB/s download throughput, and 4× CPU throttling. Results include first contentful paint, largest contentful paint, layout shift, and transferred bytes. Third-party font responses and the local machine affect timings.

See `VALIDATION.md` for this pass's findings and limitations.
