const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Baldinos%20Giant%20Jersey%20Subs%20801%20S%20Columbia%20Ave%20Rincon%20GA%2031326';
const FIELDS = 'id,rating,userRatingCount,reviews,googleMapsUri,attributions';
const json = (data, status = 200) => Response.json(data, { status, headers: {
  'Cache-Control': 'no-store', 'CDN-Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer',
  'Strict-Transport-Security': 'max-age=31536000',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
} });
const unavailable = status => json({ available: false, mapsUrl: MAPS_URL }, status);
function httpsUrl(value, allowedHosts) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return '';
    if (allowedHosts && !allowedHosts.some(host => url.hostname === host || url.hostname.endsWith('.' + host))) return '';
    return url.href;
  } catch { return ''; }
}
const googleLink = value => httpsUrl(value, ['google.com', 'maps.app.goo.gl']);

// Data is fetched on demand and is never saved in KV, a cache, or logs.
// Configure the secret and verified place ID only after the required notices
// and the owner's Google Cloud billing/quota setup are complete.
export async function getGoogleReviews(request, env, fetchGoogle = fetch) {
  if (request.method !== 'GET') return unavailable(405);
  const url = new URL(request.url);
  if (url.search) return unavailable(400); // This endpoint never accepts another business ID.
  const origin = request.headers.get('Origin');
  if ((origin && origin !== url.origin) || request.headers.get('Sec-Fetch-Site') === 'cross-site') return unavailable(403);
  if (env.ENABLE_GOOGLE_REVIEWS !== 'true' || !env.GOOGLE_PLACES_API_KEY || !/^[A-Za-z0-9_-]{10,256}$/.test(env.GOOGLE_PLACE_ID || '') || !env.REVIEWS_LIMITER) return unavailable(200);
  try {
    const limit = await env.REVIEWS_LIMITER.limit({ key: 'baldinos-rincon-google-reviews' });
    if (!limit.success) return unavailable(429);
    const result = await fetchGoogle(`https://places.googleapis.com/v1/places/${env.GOOGLE_PLACE_ID}?languageCode=en`, {
      headers: { 'X-Goog-Api-Key': env.GOOGLE_PLACES_API_KEY, 'X-Goog-FieldMask': FIELDS },
      signal: AbortSignal.timeout(6000), redirect: 'error',
    });
    if (!result.ok) return unavailable(503);
    const place = await result.json();
    if (place.id !== env.GOOGLE_PLACE_ID || !Number.isFinite(place.rating) || place.rating < 1 || place.rating > 5 || !Number.isSafeInteger(place.userRatingCount) || place.userRatingCount < 0) return unavailable(503);
    const mapsUrl = googleLink(place.googleMapsUri) || MAPS_URL;
    const reviews = (Array.isArray(place.reviews) ? place.reviews : []).slice(0, 5).map(review => ({
      author: typeof review.authorAttribution?.displayName === 'string' ? review.authorAttribution.displayName : '',
      authorUrl: googleLink(review.authorAttribution?.uri),
      avatar: httpsUrl(review.authorAttribution?.photoUri, ['googleusercontent.com', 'ggpht.com']),
      rating: review.rating,
      text: typeof review.originalText?.text === 'string' ? review.originalText.text : (typeof review.text?.text === 'string' ? review.text.text : ''),
      date: typeof review.relativePublishTimeDescription === 'string' ? review.relativePublishTimeDescription : '',
      url: googleLink(review.googleMapsUri),
    })).filter(review => review.author && review.url && Number.isFinite(review.rating) && review.rating >= 1 && review.rating <= 5);
    const attributions = (Array.isArray(place.attributions) ? place.attributions : []).map(value => ({
      name: typeof value.provider === 'string' ? value.provider : '', url: httpsUrl(value.providerUri),
    })).filter(value => value.name);
    return json({ available: true, rating: place.rating, count: place.userRatingCount, mapsUrl, reviews, attributions });
  } catch { return unavailable(503); }
}
