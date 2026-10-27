# Saath Sawari website

The marketing site: hero, the route-matching differentiator, trust & safety, for-drivers, the
campus/office launch pitch, FAQ. Plain HTML, CSS and JS in `public/`, with no build step — mirrors
the cashbook project's `apps/website`.

Not deployed anywhere yet. Open `public/index.html` directly, or serve it locally:

```bash
cd public && python -m http.server 8095 --bind 127.0.0.1
```

## Settings

Everything that depends on hosting is in [`public/config.js`](public/config.js):

| Setting | What it does |
|---|---|
| `playUrl` | The Play Store listing. Empty shows "Coming soon on Google Play" |
| `appStoreUrl` | The App Store listing. Empty shows "Coming soon on the App Store" |
| `supportEmail` | For privacy requests, support and the office/campus contact form. Currently `support@saathchalo.pk` from the backend's `.env.example` — **not actually configured in the live backend**, confirm the real address before this goes public |

## Screenshots

The phone screenshots are real screens from the local staging build (driver 1 / rider 1's seeded
test routes), never mockups or stock photos:

```bash
# 1. Rebuild the app against local staging (see ../backend/CLAUDE.md, "Local copy of staging")
cd ../app && flutter build web --release \
  --dart-define=API_BASE_URL=http://localhost:3002/api/v1 \
  -o build/web-staging-local
python -m http.server 8092 --bind 127.0.0.1 --directory build/web-staging-local

# 2. Capture (reuses ../app/test/e2e_web/lib.js, the app's own e2e helpers)
cd ../../website/tools
NODE_PATH=<playwright's node_modules> APP_URL=http://localhost:8092/ node screenshots.js
```

Saves to `public/assets/screens/*.png`.

## Deployment

Not decided yet. The site is plain static files, so it can go almost anywhere with no build step:

- **Alongside the existing EC2 box** (`backend/deploy/ec2/`) as a static folder served by the
  nginx already in front of the API, at the bare domain, with the API staying on `/api/v1`.
- **A separate static host** (Render free tier, like cashbook's `hisaab-book-website`; Cloudflare
  Pages; Netlify) — zero server maintenance, but a new account/service to manage.

Whichever is chosen, moving to a real domain only touches `public/config.js` (store URLs, support
email) — the page itself has no hosting-specific code.
