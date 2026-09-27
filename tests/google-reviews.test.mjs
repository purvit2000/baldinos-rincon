import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getGoogleReviews } from '../google-reviews.mjs';

const request = () => new Request('https://rinconbaldinos.com/api/google-reviews', { headers: { 'Sec-Fetch-Site': 'same-origin' } });
const env = () => ({ ENABLE_GOOGLE_REVIEWS: 'true', GOOGLE_PLACES_API_KEY: 'test-secret-not-for-browser', GOOGLE_PLACE_ID: 'ChIJ_test_fixture_place', REVIEWS_LIMITER: { limit: async () => ({ success: true }) } });
const place = () => ({ id: 'ChIJ_test_fixture_place', rating: 4.5, userRatingCount: 50, googleMapsUri: 'https://www.google.com/maps', reviews: [
  { rating: 2, originalText: { text: '<script>example</script>' }, relativePublishTimeDescription: 'a month ago', googleMapsUri: 'https://www.google.com/maps/reviews/test', authorAttribution: { displayName: 'Test reviewer', uri: 'https://www.google.com/maps/contrib/test', photoUri: 'https://lh3.googleusercontent.com/test' } },
  { rating: 5, googleMapsUri: 'https://www.google.com/maps/reviews/other', originalText: { text: 'Synthetic review.' }, authorAttribution: { displayName: 'Other reviewer', uri: 'javascript:alert(1)', photoUri: 'https://example.com/private-tracker' } },
], attributions: [{ provider: 'Test data provider', providerUri: 'https://example.com/source' }] });

test('unconfigured or disabled feed makes no paid request and returns a Google fallback', async () => {
  for (const config of [{}, { ...env(), ENABLE_GOOGLE_REVIEWS: 'false' }, { ...env(), GOOGLE_PLACES_API_KEY: '' }, { ...env(), REVIEWS_LIMITER: undefined }]) {
    const result = await getGoogleReviews(request(), config, () => { throw new Error('Must not fetch'); });
    assert.equal(result.status, 200); assert.equal((await result.json()).available, false);
  }
});
test('fetches only the configured business, keeps keys server-side, preserves review order and author credits', async () => {
  let seen;
  const result = await getGoogleReviews(request(), env(), async (url, init) => { seen = { url, init }; return Response.json(place()); });
  assert.ok(seen.url.includes('/places/ChIJ_test_fixture_place?languageCode=en'));
  assert.ok(!seen.url.includes(env().GOOGLE_PLACES_API_KEY));
  assert.equal(seen.init.headers['X-Goog-Api-Key'], env().GOOGLE_PLACES_API_KEY);
  assert.equal(seen.init.redirect, 'error');
  assert.equal(result.headers.get('cache-control'), 'no-store');
  assert.equal(result.headers.get('cdn-cache-control'), 'no-store');
  const data = await result.json();
  assert.equal(data.available, true); assert.equal(data.count, 50);
  assert.deepEqual(data.reviews.map(review => review.rating), [2, 5]);
  assert.equal(data.reviews[0].authorUrl, 'https://www.google.com/maps/contrib/test');
  assert.equal(data.reviews[0].text, '<script>example</script>');
  assert.equal(data.reviews[1].authorUrl, ''); assert.equal(data.reviews[1].avatar, '');
  assert.equal(data.attributions[0].name, 'Test data provider');
  assert.ok(!JSON.stringify(data).includes(env().GOOGLE_PLACES_API_KEY));
});
test('rate limits, provider failures, mismatched businesses and invalid ratings fail safely', async () => {
  const cases = [
    [env(), async () => new Response('error containing secret', { status: 403 }), 503],
    [env(), async () => { throw new Error('network failure'); }, 503],
    [env(), async () => Response.json({ ...place(), id: 'wrong_business' }), 503],
    [env(), async () => Response.json({ ...place(), rating: 8 }), 503],
    [{ ...env(), REVIEWS_LIMITER: { limit: async () => ({ success: false }) } }, () => { throw new Error('Must not fetch'); }, 429],
  ];
  for (const [config, upstream, status] of cases) {
    const result = await getGoogleReviews(request(), config, upstream);
    assert.equal(result.status, status); assert.equal((await result.json()).available, false);
  }
});
test('rejects cross-site calls and arbitrary business query parameters', async () => {
  for (const input of [new Request(request().url + '?placeId=another'), new Request(request().url, { headers: { Origin: 'https://example.com' } }), new Request(request().url, { method: 'POST' })]) {
    const result = await getGoogleReviews(input, env(), () => { throw new Error('Must not fetch'); });
    assert.ok([400, 403, 405].includes(result.status));
  }
});
