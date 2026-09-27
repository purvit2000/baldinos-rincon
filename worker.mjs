import { getGoogleReviews } from './google-reviews.mjs';

// Anonymous counts only. Never log request objects, headers, or form payloads.
const actions = new Set([
  'call_click', 'order_click', 'directions_click', 'catering_click',
  'catering_success', 'application_submit', 'application_return',
]);
const pages = new Set(['/', '/menu', '/careers', '/404']);
const response = status => new Response(null, { status, headers: {
  'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  'Strict-Transport-Security': 'max-age=31536000',
} });

export async function recordEvent(request, log = console.log) {
  if (request.method !== 'POST') return response(405);
  if (request.headers.get('Origin') !== new URL(request.url).origin) return response(403);
  if (request.headers.get('Content-Type')?.split(';')[0].trim() !== 'application/json') return response(415);
  if (Number(request.headers.get('Content-Length')) > 256) return response(413);
  const reader = request.body?.getReader();
  if (!reader) return response(400);
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 256) { await reader.cancel(); return response(413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const data = JSON.parse(new TextDecoder().decode(bytes));
    if (!data || Array.isArray(data) || Object.keys(data).length !== 2 || !actions.has(data.action) || !pages.has(data.page)) return response(400);
    log(JSON.stringify({ type: 'business_event', action: data.action, page: data.page }));
    return response(204);
  } catch { return response(400); }
}

export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname === '/events') return recordEvent(request);
    if (new URL(request.url).pathname === '/api/google-reviews') return getGoogleReviews(request, env);
    return env.ASSETS.fetch(request);
  },
};
