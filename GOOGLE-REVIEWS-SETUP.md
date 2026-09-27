# Google reviews activation

The website has an official Google Places API integration at `/api/google-reviews`. It is deliberately disabled until the business's Google setup and required public notices are complete. Until then, guests see a direct link to the restaurant's Google listing. No stale rating or saved review is presented as current.

## What is implemented

- Fresh rating, review count, and up to five Google-selected reviews are requested when someone opens the homepage. Google orders these reviews by relevance; this is not a feed of every review or necessarily the newest reviews.
- The API key stays in the Cloudflare Worker. The browser receives only the display data. No reviews are saved in KV, logs, or a cache.
- Google Maps branding, author attribution/profile links and images when supplied, direct review links, and additional provider attributions are displayed. Review order and lower ratings are preserved. Malformed records without a valid author, rating, or direct source link are omitted.
- An outage, missing configuration, or rate limit leaves the Google listing link available. There is no fabricated or dated-review fallback.
- The Cloudflare binding allows five upstream requests per minute per Cloudflare location. This is an abuse guard, **not a global spending limit**.

## Owner setup needed before activation

1. In the owner's Google Cloud project, enable Places API (New), complete Google's billing/terms setup, and create an API key restricted to Places API (New). Review the applicable price tier: requesting reviews uses Place Details Enterprise + Atmosphere. Set suitable Google Cloud API quotas and budget alerts; budget alerts alone do not cap charges. Do not paste a key into chat or commit it to Git.
2. Use Google's [Place ID finder](https://developers.google.com/maps/documentation/places/web-service/place-id) to verify the ID for **Baldinos Giant Jersey Subs, 801 S Columbia Ave, Rincon, GA 31326**. A Maps feature ID or ChowNow location ID is not a Google Place ID.
3. Approve and publish the public Terms of Use and Privacy Policy required by [Google's Places policies](https://developers.google.com/maps/documentation/places/web-service/policies). This remains pending because audit item 6 was explicitly excluded; no notice pages have been added without resolving that instruction.
4. In Cloudflare → Workers & Pages → `baldinos-rincon` → Settings → Variables and Secrets, store `GOOGLE_PLACES_API_KEY` as a **Secret**. Set `GOOGLE_PLACE_ID` to the verified place ID. Keep `ENABLE_GOOGLE_REVIEWS` absent or `false` until steps 1–3 are complete.
5. Add the non-secret `GOOGLE_PLACE_ID` and `ENABLE_GOOGLE_REVIEWS: "true"` to the version-controlled Wrangler `vars` configuration when activating, so future Git deployments preserve the configuration. Keep the API key out of `wrangler.jsonc`. Deploy and confirm the production endpoint returns `available: true`, the intended business's rating/count, and properly attributed reviews.

The local `npm run preview` route `/?reviews-test=success#reviews` displays clearly labeled synthetic fixtures only. Those fixtures and the preview server are excluded from production builds. Do not use them as customer reviews.

## Deployment and account access

GitHub `purvit2000/baldinos-rincon` already has a Cloudflare Workers Builds integration for `main`. Pushing the site changes triggers publishing; a separate Cloudflare login is not necessary for that workflow. Cloudflare dashboard access is needed to configure the future API secret or inspect account settings.

Cloudflare and **Google Search Console are separate services**. For account work in this chat, sign into the appropriate service in the in-app browser yourself; no assistant email invitation or password pasted into chat is needed. Search Console is at <https://search.google.com/search-console>. A verified owner can grant an existing human collaborator Full access under Settings → Users and permissions; that is not a way to invite this assistant. A new domain property can be verified through the owner's Cloudflare DNS account. Verification and sitemap submission have not been completed while signed out.

After access is available, submit `https://rinconbaldinos.com/sitemap.xml` and inspect `/`, `/menu`, and `/careers`. Search Console access does not provide the Google Cloud credentials needed for reviews.

Sources: [Places API details](https://developers.google.com/maps/documentation/places/web-service/place-details), [billing](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing), [policies](https://developers.google.com/maps/documentation/places/web-service/policies), [Cloudflare rate limits](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/), [Search Console access](https://support.google.com/webmasters/answer/7687615).
