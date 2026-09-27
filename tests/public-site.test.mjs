import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createPreviewServer } from '../tools/preview.mjs';

let server, base;
before(async () => {
  server = createPreviewServer();
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

test('all pages serve; every local resource and cross-page anchor resolves', async () => {
  const pages = new Map();
  for (const path of ['/', '/menu', '/careers']) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200);
    pages.set(path, await response.text());
  }
  const checked = new Set();
  for (const html of pages.values()) {
    for (const match of html.matchAll(/(?:href|src|action)="([^" ]+)"/g)) {
      if (!match[1].startsWith('/') || match[1].startsWith('/__test-form/')) continue;
      const url = new URL(match[1], base);
      if (url.hash) assert.ok(pages.get(url.pathname)?.includes(`id="${url.hash.slice(1)}"`), `Missing anchor: ${url}`);
      if (!checked.has(url.pathname)) {
        assert.equal((await fetch(url)).status, 200, url.href);
        checked.add(url.pathname);
      }
    }
  }
  const menu = pages.get('/menu');
  assert.equal((menu.match(/<article\b/g) || []).length, 49);
  assert.ok(menu.includes('<dt>Half</dt>') && menu.includes('<dt>Whole</dt>') && menu.includes('<dt>Family</dt>'));
});
test('clean URLs redirect and an unknown path returns the custom 404 status', async () => {
  for (const [old, current] of [['/index.html','/'], ['/menu.html','/menu'], ['/careers.html','/careers'], ['/menu/','/menu']]) {
    const response = await fetch(base + old + '?source=test', { redirect: 'manual' });
    assert.equal(response.status, 301);
    assert.equal(response.headers.get('location'), current + '?source=test');
  }
  const response = await fetch(base + '/missing-page');
  assert.equal(response.status, 404);
  assert.match(await response.text(), /name="robots" content="noindex/);
});
test('verified prices and owner-provided prices for unlisted items remain consistent', async () => {
  const menu = await (await fetch(base + '/menu')).text();
  const cards = [...menu.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/g)].map(match => match[1]);
  const card = name => cards.find(value => value.includes('>' + name + '</h3>'));
  const prices = name => [...card(name).matchAll(/<dd[^>]*>([^<]+)<\/dd>/g)].map(match => match[1]);
  assert.deepEqual(prices('#24 Italian Battalion'), ['$10.19', '$17.29', '$26.59']);
  for (const name of ['#11 Pepper Steak', '#13 Steak', '#19 Steak w/ Mushrooms']) {
    assert.deepEqual(prices(name), ['$8.19', '$13.49']);
  }
  assert.deepEqual(prices('Extra Meat'), ['$0.99', '$1.69', '$2.59']);
  assert.deepEqual(prices('Soup of the Day'), ['From $2.19', '$4.69']);
  const home = await (await fetch(base)).text();
  for (const [name, price] of [['#24 Italian Battalion', '$10.19'], ['#19 Steak with Mushrooms', '$8.19'], ['#18 Smoked Turkey &amp; Provolone', '$9.59']]) {
    const featured = [...home.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/g)].find(match => match[1].includes(name));
    assert.ok(featured?.[1].includes('Half ' + price), name);
  }
});
test('metadata and JSON-LD agree on canonical pages; sitemap is available', async () => {
  for (const path of ['/', '/menu', '/careers']) {
    const html = await (await fetch(base + path)).text();
    assert.ok(html.includes(`rel="canonical" href="https://rinconbaldinos.com${path}"`));
    assert.match(html, /property="og:image"/);
  }
  const html = await (await fetch(base)).text();
  const ld = JSON.parse(html.match(/type="application\/ld\+json">([^<]+)</)[1]);
  assert.equal(ld['@type'], 'Restaurant');
  assert.equal(ld.menu, 'https://rinconbaldinos.com/menu');
  assert.equal(ld.address.postalCode, '31326');
  assert.equal((await fetch(base + '/sitemap.xml')).status, 200);
  assert.match(await (await fetch(base + '/robots.txt')).text(), /Sitemap: https:\/\/rinconbaldinos.com\/sitemap.xml/);
});
test('CSP covers inline JSON-LD; fingerprinted assets get immutable caching', async () => {
  const response = await fetch(base);
  const html = await response.text();
  const csp = response.headers.get('Content-Security-Policy');
  const ld = html.match(/type="application\/ld\+json">([^<]+)</)[1];
  assert.ok(csp.includes(`'sha256-${createHash('sha256').update(ld).digest('base64')}'`));
  assert.ok(!csp.includes('unsafe-inline') && !csp.includes('unsafe-eval'));
  assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff');
  const resource = html.match(/src="(\/assets\/versioned\/script[^\"]+)"/)[1];
  assert.match((await fetch(base + resource)).headers.get('Cache-Control'), /immutable/);
});
test('preview intercepts both forms and simulates delivery failure without outbound requests', async () => {
  const home = await (await fetch(base)).text();
  assert.ok(!home.includes('action="https://formsubmit.co/'));
  const result = await fetch(base + '/__test-form/catering', { method: 'POST', body: 'mock' });
  assert.equal((await result.json()).success, true);
  assert.equal((await fetch(base + '/__test-form/catering?mode=failure', { method: 'POST', body: 'mock' })).status, 503);
  const application = await fetch(base + '/__test-form/application', { method: 'POST', body: 'mock', redirect: 'manual' });
  assert.equal(application.status, 303);
  assert.equal(application.headers.get('location'), '/careers?sent=1#application-success');
});
test('the existing downloadable application is preserved exactly', async () => {
  assert.deepEqual(await fs.readFile('dist/Employment-Job-Application.pdf'), await fs.readFile('Employment-Job-Application.pdf'));
});
