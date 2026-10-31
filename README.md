# Saath Chalo website

The marketing site, three pages built from the ChatGPT design handoff
(`../website-chatgpt/HANDOFF.md` and its 1440px / 390px mockups):

| Page | File |
|---|---|
| Home | `public/index.html` |
| For organisations | `public/organisations.html` |
| Safety | `public/safety.html` |

Plain HTML, CSS and JS in `public/`, with no build step and no framework — mirrors the cashbook
project's `apps/website`. Shared styles are in `public/css/site.css` (light theme only, on purpose),
shared behaviour in `public/js/site.js`. Illustrations (Islamabad scene, corridor diagram, the
sample dashboards) are inline SVG / HTML, never images. Fonts are Barlow and Barlow Semi Condensed
from Google Fonts, plus Noto Naskh Arabic for the one Urdu line in the hero.

Open `public/index.html` directly, or serve it locally:

```bash
cd public && python -m http.server 8096 --bind 127.0.0.1
```

The backend allows CORS from `http://localhost:8096`, so served this way the page also reads its
section switches from the local API.

## Settings

Contact details and links are edited in the backend, not here: the site reads them from
`${apiBase}/site/config` (the `contact` row of the `site_settings` table) on every load, and an admin
changes them with `PUT /admin/site/contact`, for example
`{"contact": {"support_email": "hello@saathchalo.pk", "play_url": "https://play.google.com/..."}}`.
An empty string hides that link. [`public/config.js`](public/config.js) holds only the fallbacks used
when the API can't be reached, plus the API address:

| Contact key (API) | config.js fallback | What it does |
|---|---|---|
| `support_email` | `supportEmail` | Footer "Say hello" address, the enquiry forms' fallback, and the "talk to us" buttons' fallback. Placeholder `support@saathchalo.pk` until the real address exists |
| `play_url` | `playUrl` | The Play Store listing. Empty shows "Coming soon on Google Play" (not a link) |
| `app_store_url` | `appStoreUrl` | The App Store listing. Empty shows "Coming soon on the App Store" |
| `instagram_url`, `facebook_url`, `linkedin_url` | `instagramUrl`, ... | Footer social links. Empty hides the link. **Placeholder URLs for now** |

The store and social links in the database are placeholders; replace them before launch.

| `apiBase` | The Saath Chalo API, default `http://localhost:3002/api/v1`. **Production sets this to the live API.** The site reads its section switches from `${apiBase}/site/config`, and the footer's Privacy policy / Terms of service / Delete my account links go to `/privacy`, `/terms` and `/delete-account` on the same server (the API serves them outside `/api/v1`) |
| `sections` | Section switch defaults, used until `/site/config` answers and kept if it never does (see below) |

## Section switches

Every section below the hero can be switched off without a deploy. Hero, navigation and footer are
always shown. The backend serves the switches at `GET /api/v1/site/config` (public, no login);
admins change them with `PUT /api/v1/admin/site/sections`.

| Key | Page | Section | Default |
|---|---|---|---|
| `home_twin_city` | Home | "Made for the twin cities" strip | on |
| `home_how_it_works` | Home | How it works (three steps) | on |
| `home_corridor` | Home | The corridor idea (I-11 → Blue Area diagram) | on |
| `home_safety` | Home | Trust is built into the ride (six safety features) | on |
| `home_drivers` | Home | For drivers | on |
| `home_organisations` | Home | For offices, universities & HR teams (with sample dashboard) | on |
| `home_savings` | Home | Share the cost (illustrative monthly example) | on |
| `home_reviews` | Home | Early-user stories ("Built around real twin-city routines") | **off** |
| `home_areas` | Home | Where we go | on |
| `home_enquiry` | Home | Bring Saath Chalo to your office (enquiry form) | on |
| `home_faq` | Home | FAQ ("Before you head out") | on |
| `org_benefits` | Organisations | Programme benefits (six cards) | on |
| `org_dashboard` | Organisations | Employer dashboard | on |
| `org_setup` | Organisations | Organisation setup (three steps) | on |
| `org_pricing` | Organisations | Pricing panel ("Talk to us") | on |
| `org_contact` | Organisations | Contact form | on |
| `safety_basics` | Safety | The safety basics (four steps) | on |
| `safety_groups` | Safety | Privacy in groups | on |
| `safety_sos` | Safety | SOS ("Keep your emergency contacts close") | on |
| `safety_shared_care` | Safety | Shared care (four cards) | on |
| `safety_cta` | Safety | Final call to action ("Your route. Your choice.") | on |

`home_reviews` is off because its three stories are sample launch copy, not verified testimonials
(HANDOFF part 3). Turn it on only once they are replaced with permissioned quotes from real users.

How it works on the page:

- Each switchable section carries `data-section="<key>"`. A section that defaults to off also has
  the `hidden` attribute in the HTML, so it never flashes on screen before the script runs.
- On load `js/site.js` applies the `config.js` defaults at once, then fetches `/site/config` with a
  2.5-second timeout and applies the answer. If the API is down or slow, the defaults stay.
- Links to a hidden section disappear with it — nav, mobile menu, footer and in-page buttons, also
  across pages (links carry `data-requires="<key>"`). The main "talk to us" buttons
  (`data-fallback="mail"`) switch to a `mailto:` to `supportEmail` instead of disappearing.
- To preview a combination in your own browser only, add a query string:
  `index.html?sections=home_reviews:1,home_faq:0`. Nobody else sees it.

To flip a switch for everyone, call the API with an admin's access token (sign in as a user whose
`role` is `admin`; see `../backend/CLAUDE.md`). Switches you leave out keep their current value:

```bash
curl -X PUT "$API/api/v1/admin/site/sections" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sections":{"home_reviews":true}}'
```

The response is the full set of switches. Visitors see the change on their next page load.

## Enquiry forms

The Home office enquiry and the Organisations contact form post to `POST ${apiBase}/site/enquiries`
(no login, 5 per hour per visitor, a hidden honeypot field that drops bot submissions). They land in
the `site_enquiries` table. Admins read them with `GET /admin/site/enquiries` (`?handled=false` for
the unhandled ones) and mark one done with `PATCH /admin/site/enquiries/:id` `{"handled": true}`.
If the API can't be reached the form tells the visitor to email the support address.

**TODO:** the admin panel screen for enquiries (list, mark handled) and for the section and
contact switches. Until it is built, use the endpoints above.

## Screenshots

The phone screenshots are real screens from the local staging build (driver 1 / rider 1's seeded
test routes), never mockups or stock photos. The hero uses `route-map.png` (search results: three
cars already passing I-11 PHA) and the drivers section uses `post-ride.png`:

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
host. Static files only — no app server, no proxy. Before deploying, set `apiBase` in
`public/config.js` to the live API so the section switches and legal links point at production.

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
`certbot --nginx -d website.3-107-198-153.sslip.io`. The API's CORS origins must include the
website's origin, or the switches silently fall back to the `config.js` defaults.

To redeploy after a content change, just re-run the `scp`/`ssh` above — nothing else needs
touching unless the hostname changes.

[`render.yaml`](render.yaml) is kept as a fallback: Render's free static-site tier, same pattern as
cashbook's `hisaab-book-website`. Push to GitHub, then in Render **New > Blueprint** pointed at
this repo — no further setup, no build step.

A real domain, once bought, only touches `public/config.js` (store URLs, support email, API base)
and the nginx `server_name` / certbot cert — the pages themselves have no hosting-specific code.
