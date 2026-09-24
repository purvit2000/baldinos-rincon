# Baldinos Rincon website

Static three-page website. Serve the project root; no application server is required.

## Develop and validate

Use Node.js 20 or newer and npm:

```sh
npm ci
npm run build
npm run preview
npm test
```

Open http://127.0.0.1:4173. Browser tests use an installed Google Chrome and start a preview server automatically when one is not running. All form submissions in the tests are intercepted; no emails or applications are sent.

Edit `styles.input.css` for custom CSS and `tailwind.config.cjs` for design tokens. Run `npm run build` after editing HTML utility classes or dependencies. The build scans all three HTML pages and `script.js`, produces minified `styles.css`, and copies the pinned Alpine runtime into `assets/vendor`. Commit these generated files: production requires no Node runtime or CDN compiler.

Deploy the three HTML files, `styles.css`, `script.js`, `assets/`, and `Employment-Job-Application.pdf`. Do not publish `node_modules`, tests, tooling, or Git metadata. Configure compression and sensible cache headers with the chosen host; hosting configuration is not included here.

## Images

The original JPEGs are retained as source assets. Pages use WebP derivatives, generated with `cwebp` at quality 78:

```sh
for image in assets/*.jpg; do cwebp -q 78 "$image" -o "${image%.jpg}.webp"; done
```

## Performance measurement

With the preview server running:

```sh
node tools/measure.cjs http://127.0.0.1:4173
```

Pass a second URL to compare versions. Each URL receives three cold-cache mobile runs with 150ms latency, 200 KB/s download throughput, and 4× CPU throttling. Results include first contentful paint, largest contentful paint, layout shift, and transferred bytes. Third-party font responses and the local machine affect timings.

See `VALIDATION.md` for this pass's findings and limitations.
