import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker, { recordEvent } from '../worker.mjs';

const origin = 'https://rinconbaldinos.com';
const event = { action: 'call_click', page: '/menu' };
function request(body = event, headers = {}, method = 'POST') {
  return new Request(origin + '/events', { method, headers: { Origin: origin, 'Content-Type': 'application/json', ...headers }, ...(method === 'POST' ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}) });
}
test('events log exactly the fixed anonymous fields, never request metadata', async () => {
  const logs = [];
  const result = await recordEvent(request(event, { Cookie: 'private', Referer: origin + '/?private=secret', 'CF-Connecting-IP': '192.0.2.1' }), line => logs.push(line));
  assert.equal(result.status, 204);
  assert.equal(result.headers.get('Cache-Control'), 'no-store');
  assert.deepEqual(logs.map(JSON.parse), [{ type: 'business_event', ...event }]);
});
test('rejects arbitrary data, malformed JSON, foreign origins, oversized bodies and methods without logging', async () => {
  const cases = [
    [request({ ...event, email: 'must-not-log@example.com' }), 400],
    [request({ action: 'private-user-data', page: '/' }), 400],
    [request({ ...event, page: '/?private=secret' }), 400],
    [request('not JSON'), 400], [request(null), 400],
    [request(event, { Origin: 'https://example.com' }), 403],
    [request(event, { 'Content-Type': 'text/plain' }), 415],
    [request('x'.repeat(257)), 413], [request(event, {}, 'GET'), 405],
  ];
  for (const [input, status] of cases) {
    const logs = [];
    assert.equal((await recordEvent(input, line => logs.push(line))).status, status);
    assert.deepEqual(logs, []);
  }
});
test('other requests go through Cloudflare static assets', async () => {
  const result = await worker.fetch(new Request(origin + '/menu'), { ASSETS: { fetch: () => new Response('menu') } });
  assert.equal(await result.text(), 'menu');
});
