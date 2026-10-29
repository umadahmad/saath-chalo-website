# Saath Chalo website

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

Live at **https://website.3-107-198-153.sslip.io**, served by the same EC2 box as the API
(`3.107.198.153`), reusing its existing nginx + certbot setup rather than standing up a second
host. Static files only — no app server, no proxy.

```bash
# From a machine with the server's key (~/.ssh/saath-chalo-ec2.pem):
scp -i ~/.ssh/saath-chalo-ec2.pem -r public ec2-user@3.107.198.153:/tmp/saath-website-public
ssh -i ~/.ssh/saath-chalo-ec2.pem ec2-user@3.107.198.153 '
  sudo rm -rf /var/www/saath-chalo-website/public
  sudo mkdir -p /var/www/saath-chalo-website
  sudo mv /tmp/saath-website-public /var/www/saath-chalo-website/public
  sudo chown -R root:root /var/www/saath-chalo-website
  sudo find /var/www/saath-chalo-website -type d -exec chmod 755 {} \;
  sudo find /var/www/saath-chalo-website -type f -exec chmod 644 {} \;
'
```

`/var/www/saath-chalo-website` on purpose, not `/opt/saath-chalo/website`: the API's directory
there is `chmod 750 saath:saath` so the app process is sandboxed to its own files, which also
blocks nginx (running as its own `nginx` user) from reading anything under it. The site needs a
path nginx can actually traverse.

The nginx vhost is `/etc/nginx/conf.d/saath-chalo-website.conf` on the server (not checked in
here, mirrors `../backend/deploy/ec2/nginx.conf`'s style but `root`s straight to the static files
instead of proxying) — `server_name website.3-107-198-153.sslip.io`, HTTPS via
`certbot --nginx -d website.3-107-198-153.sslip.io`.

To redeploy after a content change, just re-run the `scp`/`ssh` above — nothing else needs
touching unless the hostname changes.

[`render.yaml`](render.yaml) is kept as a fallback: Render's free static-site tier, same pattern as
cashbook's `hisaab-book-website`. Push to GitHub, then in Render **New > Blueprint** pointed at
this repo — no further setup, no build step.

A real domain, once bought, only touches `public/config.js` (store URLs, support email) and the
nginx `server_name` / certbot cert — the page itself has no hosting-specific code.
