# LeoNes — Free Automated Social Posting

"Option 2": zero-cost automation. One queued video per platform per day, posted by
a GitHub Actions cron (free) via each platform's official free API. No Buffer/Later
subscription, no third-party access to the accounts.

## How it works

```
content-library/  --plan-->  posting-queue.json  --daily cron-->  TikTok / IG / FB
(branded videos)             (captions+hashtags)                  (official APIs)
```

- `node tools/social-autopost.mjs plan` — scans `content-library/` and queues every
  video with a rotating caption + platform hashtags. Branded (`branded-*.mp4`, real
  logo overlaid) versions are preferred automatically.
- `node tools/social-autopost.mjs post` — posts the next queued item per platform.
  Runs daily at 17:00 UTC via `.github/workflows/social-autopost.yml`; also has a
  manual "Run workflow" button in the GitHub Actions tab.
- `node tools/social-autopost.mjs status` — progress per platform.
- Platforms without credentials are skipped gracefully — you can activate them
  one at a time.

## One-time setup per platform (all free)

### Facebook Page + Instagram Reels (one Meta app covers both)
1. Business page + Instagram **business/creator** account linked to it.
2. developers.facebook.com → Create App (type: Business) → add "Instagram Graph API"
   and "Facebook Login for Business".
3. Graph API Explorer → generate a **Page access token** with scopes:
   `pages_manage_posts, pages_read_engagement, instagram_basic, instagram_content_publish`.
   Exchange for a long-lived token (60 days; renewable by re-running the exchange).
4. GitHub → Settings → Secrets → Actions:
   - `META_PAGE_TOKEN` — the long-lived page token
   - `FB_PAGE_ID` — the page id
   - `IG_USER_ID` — the IG business account id (Graph: `GET /me/accounts?fields=instagram_business_account`)
5. **Instagram requirement:** Reels ingest needs a public video URL. Default is the
   repo's raw GitHub URL (`MEDIA_BASE` env to override) — the repo must be public,
   or set `MEDIA_BASE` to any public host of `content-library/` (e.g. a Netlify site).

### TikTok
1. developers.tiktok.com → register an app → add the **Content Posting API** product.
2. Until TikTok audits the app, posts are forced `SELF_ONLY` (visible only to the
   account) — this is TikTok policy for unaudited apps. Request the audit early;
   after approval flip `privacy_level` to `PUBLIC_TO_EVERYONE` in
   `tools/social-autopost.mjs`.
3. OAuth the LeoNes account with scope `video.publish`, store the access token as
   the `TIKTOK_ACCESS_TOKEN` secret (refresh tokens last 1 year).

## Honest constraints to know

- **Account safety:** these are the official APIs — no ToS risk, unlike
  browser-automation posting, which can get a brand account banned.
- **Meta token expiry:** long-lived tokens last ~60 days. Renewing is one curl call;
  a calendar reminder is enough.
- **TikTok audit:** public posting needs the (free) app audit — typically days.
- **Rate:** one post/platform/day is deliberate — steady drip beats a dump, and it
  stays far inside every platform's limits.
- Queue state lives in `content-library/posting-queue.json` (committed by the
  workflow so history is auditable). Captions/hashtags are editable there per item.
