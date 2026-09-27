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
  for (const url of ['/', '/menu', '/careers']) {
    test(`${url} at ${width}px: renders, links, accessibility, layout`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      const failedLocal = [];
      page.on('response', r => { if (r.url().startsWith('http://127.0.0.1') && r.status() >= 400) failedLocal.push(r.url()); });
      await page.goto(url);
      await page.waitForLoadState('load');
      await expect(page.locator('h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(errors).toEqual([]);
      expect(failedLocal).toEqual([]);
      const invalidAnchors = await page.locator('a[href^="#"]').evaluateAll(links => links.map(a => a.getAttribute('href')).filter(h => h.length > 1 && !document.getElementById(decodeURIComponent(h.slice(1)))));
      expect(invalidAnchors).toEqual([]);
      const localLinks = await page.locator('[src],a[href],link[href]').evaluateAll(nodes => nodes.map(n => n.getAttribute('src') || n.getAttribute('href')).filter(s => s && s.startsWith('./')));
      for (const link of localLinks) expect(fs.existsSync(path.resolve(link.split(/[?#]/)[0])), link).toBe(true);
      await page.evaluate(fs.readFileSync(axe, 'utf8'));
      const results = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => n.target) })));
      expect(results).toEqual([]);
    });
  }
}

test('mobile navigation and menu category filters', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.getByLabel('Toggle navigation', { exact: true });
  await toggle.click();
  await expect(page.locator('.mobile-menu')).toHaveAttribute('open', '');
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeHidden();
  for (const [name, item, count] of [['Salads', 'Make It a Wrap', 3], ['Subs', '#24 Italian Battalion', 3]]) {
    const button = page.getByRole('button', { name, exact: true });
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('heading', { name: item, exact: true })).toBeVisible();
    await expect(page.locator('#menu article:visible')).toHaveCount(count);
    await expect.poll(() => page.locator('#menu article:visible img').evaluateAll(imgs => imgs.every(i => i.complete && i.naturalWidth > 0))).toBe(true);
  }
});

async function fillCatering(page) {
  await page.goto('/');
  await page.getByLabel('Name', { exact: true }).fill('Browser test');
  await page.getByLabel('Email', { exact: true }).fill('test@example.com');
  await page.getByLabel('Message', { exact: true }).fill('Simulated request; never sent.');
}

test('catering success', async ({ page }) => {
  await fillCatering(page);
  await page.getByRole('button', { name: 'Send Request' }).click();
  await expect(page.getByRole('button', { name: 'Request Sent' })).toBeDisabled();
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('');
  await expect(page.locator('#catering-success')).toBeVisible();
  await expect(page.locator('#catering-success')).toBeFocused();
});
for (const failure of ['http', 'rejected', 'network']) {
  test(`catering ${failure} failure preserves input and permits retry`, async ({ page }) => {
    await page.route('**/__test-form/catering**', route => failure === 'network' ? route.abort() : route.fulfill({ status: failure === 'http' ? 500 : 200, contentType: 'application/json', body: '{"success":"false"}' }));
    await fillCatering(page);
    await page.getByRole('button', { name: 'Send Request' }).click();
    await expect(page.getByRole('alert')).toContainText('Please try again or call');
    await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Browser test');
    await expect(page.getByRole('button', { name: 'Send Request' })).toBeEnabled();
  });
}

test('careers PDF, application validation and success redirect', async ({ page, request }) => {
  await page.goto('/careers');
  await expect(page.locator('[name="_next"]')).toHaveValue('http://127.0.0.1:4173/careers?sent=1#application-success');
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
  await page.goto('/careers?sent=1#application-success');
  await expect(page.getByRole('heading', { name: 'Application received!' })).toBeVisible();
  await expect(page.locator('form')).toBeHidden();
  await expect(page).toHaveURL(/careers#application-success$/);
});

test('third-party outages do not hide content or break local interactivity', async ({ page }) => {
  await page.route(/^https:\/\//, route => route.abort());
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Baldinos Rincon', exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Salads', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Italian Salad Plate' })).toBeVisible();
  await page.goto('/menu');
  await expect(page.locator('main article')).toHaveCount(49);
});

test('catering timeout recovers without losing input', async ({ page }) => {
  await page.route('**/__test-form/catering**', () => {});
  await fillCatering(page);
  await page.clock.install();
  await page.getByRole('button', { name: 'Send Request' }).click();
  await expect(page.getByRole('button', { name: 'Sending' })).toBeDisabled();
  await page.clock.fastForward(16000);
  await expect(page.getByRole('alert')).toContainText('Please try again or call');
  await expect(page.getByLabel('Message', { exact: true })).toHaveValue('Simulated request; never sent.');
});

test('static content and all menu entries remain visible without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  for (const url of ['/', '/menu', '/careers']) {
    await page.goto('http://127.0.0.1:4173' + url);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Call', exact: true }).last()).toBeVisible();
  }
  await page.goto('http://127.0.0.1:4173/menu');
  await expect(page.locator('main article')).toHaveCount(49);
  await context.close();
});
