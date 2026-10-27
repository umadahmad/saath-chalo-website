# Saath Sawari website

The marketing site: hero, the route-matching differentiator, trust & safety, for-drivers, the
campus/office launch pitch, FAQ. Plain HTML, CSS and JS in `public/`, with no build step — mirrors
the cashbook project's `apps/website`.

Open `public/index.html` directly, or serve it locally:

```bash
cd public && python -m http.server 8096 --bind 127.0.0.1
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

Render's free static-site tier, same pattern as cashbook's `hisaab-book-website` — see
[`render.yaml`](render.yaml). To stand it up:

1. Push this repo to GitHub.
2. In Render, **New > Blueprint**, point it at the repo. It reads `render.yaml` and creates
   `saath-sawari-website` with no further setup — no build step, `public/` served as-is.
3. Render gives it a `*.onrender.com` URL immediately; a custom domain can be added to that
   service later from the Render dashboard.

Moving to a real domain only touches `public/config.js` (store URLs, support email) — the page
itself has no hosting-specific code.
