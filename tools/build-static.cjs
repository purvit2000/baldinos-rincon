const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const pages = ['index.html', 'menu.html', 'careers.html', '404.html'];
const html = new Map(pages.map(file => [file, fs.readFileSync(path.join(root, file), 'utf8')]));
const assets = new Set(['styles.css', 'script.js']);
for (const source of html.values()) {
  for (const match of source.matchAll(/\/assets\/[a-zA-Z0-9_.-]+\.(?:webp|png|svg)/g)) assets.add(match[0].slice(1));
}
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(path.join(output, 'assets/versioned'), { recursive: true });
const replacements = new Map();
for (const file of assets) {
  const contents = fs.readFileSync(path.join(root, file));
  const hash = crypto.createHash('sha256').update(contents).digest('hex').slice(0, 12);
  const parsed = path.parse(file);
  const dest = `/assets/versioned/${parsed.name}.${hash}${parsed.ext}`;
  fs.writeFileSync(path.join(output, dest), contents);
  replacements.set('/' + file, dest);
}
const hashes = new Set();
for (const [file, source] of html) {
  let rendered = source;
  for (const [from, to] of replacements) rendered = rendered.split(from).join(to);
  for (const match of rendered.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) {
    if (match[1].trim()) hashes.add(`'sha256-${crypto.createHash('sha256').update(match[1]).digest('base64')}'`);
  }
  fs.writeFileSync(path.join(output, file), rendered);
}
for (const file of ['favicon.ico', 'Employment-Job-Application.pdf', 'robots.txt', 'sitemap.xml', '_redirects']) {
  fs.copyFileSync(path.join(root, file), path.join(output, file));
}
const csp = [
  "default-src 'self'",
  `script-src 'self' https://static.cloudflareinsights.com ${[...hashes].join(' ')}`.trim(),
  "style-src 'self' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self' https://formsubmit.co https://cloudflareinsights.com",
  "frame-src https://www.google.com",
  "form-action 'self' https://formsubmit.co",
  "base-uri 'none'", "object-src 'none'", "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');
fs.writeFileSync(path.join(output, '_headers'), `/*
  Content-Security-Policy: ${csp}
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Strict-Transport-Security: max-age=31536000

/assets/versioned/*
  Cache-Control: public, max-age=31536000, immutable

/404.html
  X-Robots-Tag: noindex
`);
console.log(`Prepared ${pages.length} pages, ${assets.size} fingerprinted assets, sitemap, redirects and security headers in dist/`);
