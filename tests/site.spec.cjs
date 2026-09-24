const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const axe = require.resolve('axe-core/axe.min.js');

// Do not send test messages or applications to the store.
test.beforeEach(async ({ page }) => {
  await page.route('https://formsubmit.co/**', route => route.fulfill({
    contentType: 'application/json', body: JSON.stringify({ success: 'true' }),
  }));
});

for (const width of [320, 390, 768, 1440]) {
  for (const url of ['/', '/menu.html', '/careers.html']) {
    test(`${url} at ${width}px: renders, links, accessibility, layout`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      const failedLocal = [];
      page.on('response', r => { if (r.url().startsWith('http://127.0.0.1') && r.status() >= 400) failedLocal.push(r.url()); });
      await page.goto(url);
      await page.waitForFunction(() => window.Alpine);
      await expect(page.locator('h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(errors).toEqual([]);
      expect(failedLocal).toEqual([]);
      const invalidAnchors = await page.locator('a[href^="#"]').evaluateAll(links => links.map(a => a.getAttribute('href')).filter(h => h.length > 1 && !document.getElementById(decodeURIComponent(h.slice(1)))));
      expect(invalidAnchors).toEqual([]);
      const localLinks = await page.locator('[src],a[href],link[href]').evaluateAll(nodes => nodes.map(n => n.getAttribute('src') || n.getAttribute('href')).filter(s => s && s.startsWith('./')));
      for (const link of localLinks) expect(fs.existsSync(path.resolve(link.split(/[?#]/)[0])), link).toBe(true);
      await page.addScriptTag({ path: axe });
      const results = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) })));
      expect(results).toEqual([]);
    });
  }
}

test('mobile navigation and menu category filters', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Toggle navigation' });
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#mobile-nav')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#mobile-nav')).toBeHidden();
  for (const [name, item, count] of [['Salads', 'Italian Salad Plate', 2], ['Subs', '#24 Italian Battalion', 3]]) {
    const button = page.getByRole('button', { name, exact: true });
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('heading', { name: item, exact: true })).toBeVisible();
    await expect(page.locator('#menu article')).toHaveCount(count);
    await expect.poll(() => page.locator('#menu img').evaluateAll(imgs => imgs.every(i => i.complete && i.naturalWidth > 0))).toBe(true);
  }
});

async function fillCatering(page) {
  await page.goto('/');
  await page.getByLabel('Name', { exact: true }).fill('Browser test');
  await page.getByLabel('Phone or Email').fill('test@example.com');
  await page.getByLabel('Message', { exact: true }).fill('Simulated request; never sent.');
}

test('catering success', async ({ page }) => {
  await fillCatering(page);
  await page.getByRole('button', { name: 'Send Request' }).click();
  await expect(page.getByRole('button', { name: 'Request Sent' })).toBeDisabled();
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('');
});
for (const failure of ['http', 'rejected', 'network']) {
  test(`catering ${failure} failure preserves input and permits retry`, async ({ page }) => {
    await page.route('https://formsubmit.co/**', route => failure === 'network' ? route.abort() : route.fulfill({ status: failure === 'http' ? 500 : 200, contentType: 'application/json', body: '{"success":"false"}' }));
    await fillCatering(page);
    await page.getByRole('button', { name: 'Send Request' }).click();
    await expect(page.getByRole('alert')).toContainText('Please call');
    await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Browser test');
    await expect(page.getByRole('button', { name: 'Send Request' })).toBeEnabled();
  });
}

test('careers PDF, application validation and success redirect', async ({ page, request }) => {
  await page.goto('/careers.html');
  await expect(page.locator('[name="_next"]')).toHaveValue('http://127.0.0.1:4173/careers.html?sent=1');
  expect(await page.locator('form').evaluate(f => f.checkValidity())).toBe(false);
  const response = await request.get('/Employment-Job-Application.pdf');
  expect(response.ok()).toBe(true);
  expect((await response.body()).subarray(0, 5).toString()).toBe('%PDF-');
  await page.getByLabel('Full name').fill('Browser test');
  await page.getByLabel('Phone', { exact: true }).fill('9125550123');
  await page.getByLabel('Email', { exact: true }).fill('test@example.com');
  await page.getByLabel('Completed application (PDF)').setInputFiles('Employment-Job-Application.pdf');
  expect(await page.locator('form').evaluate(f => f.checkValidity())).toBe(true);
  expect(await page.locator('form').getAttribute('enctype')).toBe('multipart/form-data');
  await page.goto('/careers.html?sent=1');
  await expect(page.getByRole('heading', { name: 'Application received!' })).toBeVisible();
  await expect(page.locator('form')).toBeHidden();
  await expect(page).toHaveURL(/careers\.html$/);
});

test('third-party outages do not hide content or break local interactivity', async ({ page }) => {
  await page.route(/^https:\/\//, route => route.abort());
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Baldinos Rincon', exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Salads', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Italian Salad Plate' })).toBeVisible();
  await page.goto('/menu.html');
  await expect(page.locator('main article')).toHaveCount(49);
});

test('catering timeout recovers without losing input', async ({ page }) => {
  await page.route('https://formsubmit.co/**', () => {});
  await fillCatering(page);
  await page.clock.install();
  await page.getByRole('button', { name: 'Send Request' }).click();
  await expect(page.getByRole('button', { name: 'Sending' })).toBeDisabled();
  await page.clock.fastForward(16000);
  await expect(page.getByRole('alert')).toContainText('Please call');
  await expect(page.getByLabel('Message', { exact: true })).toHaveValue('Simulated request; never sent.');
});

test('static content remains visible without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  for (const url of ['/', '/menu.html', '/careers.html']) {
    await page.goto('http://127.0.0.1:4173' + url);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Call', exact: true }).last()).toBeVisible();
  }
  await context.close();
});
