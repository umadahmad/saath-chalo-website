// Captures the marketing site's screenshots against the local staging build,
// with real seeded data (driver 1 / rider 1's test routes), never fabricated.
// Mirrors apps/website/tools/screenshots.js in the cashbook project, reusing
// the app's own e2e helpers instead of a second copy of them.
//
// Prerequisites: the local staging stack running (see ../../backend/CLAUDE.md,
// "Local copy of staging") and the web build rebuilt against it:
//
//   cd ../../app && flutter build web --release \
//     --dart-define=API_BASE_URL=http://localhost:3002/api/v1 \
//     -o build/web-staging-local
//   python -m http.server 8092 --bind 127.0.0.1 --directory build/web-staging-local
//
// Then, with Playwright on the path (see the root CLAUDE.md's Playwright note):
//
//   NODE_PATH=<playwright's node_modules> APP_URL=http://localhost:8092/ \
//     node tools/screenshots.js
const path = require('path');
const L = require('../../app/test/e2e_web/lib.js');

const OUT = path.resolve(__dirname, '../public/assets/screens');
const RIDER = { email: 'rider.qa@saathchalo.test', password: 'SaathChaloQA!1' };

async function signInEmail(p, { email, password }) {
  // "Get started" is a FilledButton (reliably role=button); the welcome
  // screen's TextButton alternative doesn't expose the same way - both lead
  // to the same sign-in screen (see WelcomeScreen._continue in the app).
  await L.waitFor(p, /Get started/);
  await L.tap(p, /Get started/, { wait: 1200 });
  await L.waitFor(p, /Mobile number|Sign in with email/);
  await L.tap(p, /Sign in with email/);
  await L.waitFor(p, /Email/);
  await L.type(p, /^Email/, email);
  await L.type(p, /^Password/, password);
  await L.tap(p, 'Sign in', { wait: 2500 });
}

async function openDriverMode(p) {
  await L.tap(p, 'Menu');
  await L.waitFor(p, /Switch mode/);
  await L.tap(p, /^Driver$/, { wait: 2000 });
}

async function shoot(p, file) {
  await p.page.screenshot({ path: path.join(OUT, file) });
  console.log('wrote', file);
}

(async () => {
  const b = await L.browser();

  // 1. Welcome screen - first open, no account yet.
  {
    const p = await L.phone(b, 'welcome');
    await L.waitFor(p, /Get started/);
    await L.sleep(500);
    await shoot(p, 'welcome.png');
    await p.ctx.close();
  }

  // 2. Phone sign-in - trust pills, brand canvas, bilingual toggle.
  {
    const p = await L.phone(b, 'signin');
    await L.waitFor(p, /Get started/);
    await L.tap(p, /Get started/, { wait: 1200 });
    await L.waitFor(p, /Mobile number/);
    await shoot(p, 'signin.png');
    await p.ctx.close();
  }

  // 3. Search results with the colour-coded multi-route map.
  {
    const p = await L.phone(b, 'route-map');
    await signInEmail(p, RIDER);
    await L.tap(p, /Where are you starting/);
    await L.type(p, /Sector, markaz or landmark/, 'I-11');
    await L.tap(p, /^I-11 PHA/, { wait: 1200 });
    await L.tap(p, /Where are you going/);
    await L.type(p, /Sector, markaz or landmark/, 'Hot n Chilli');
    await L.tap(p, /Hot n Chilli/, { wait: 6000 });
    await shoot(p, 'route-map.png');

    // 4. Ride detail: tap the first result card for the trust-badge screen.
    await p.page.mouse.click(60, 613);
    await L.waitFor(p, /Request to join/, 8000);
    await L.sleep(1500);
    await shoot(p, 'ride-detail.png');
    await p.ctx.close();
  }

  // 5. Driver home - upcoming rides, "Driving anyway?" prompt.
  {
    const p = await L.phone(b, 'driver-home');
    await signInEmail(p, RIDER);
    await openDriverMode(p);
    await shoot(p, 'driver-home.png');

    // 6. Post a ride, through to the route-choice map.
    await L.tap(p, /Post a ride/, { wait: 1500 });
    await L.tap(p, /^From/);
    await L.type(p, /Sector, markaz or landmark/, 'I-11');
    await L.tap(p, /^I-11 PHA/, { wait: 1200 });
    await L.tap(p, /^To/);
    await L.type(p, /Sector, markaz or landmark/, 'Hot n Chilli');
    await L.tap(p, /Hot n Chilli/, { wait: 1200 });
    await L.waitFor(p, /Which way do you drive/, 8000);
    await L.sleep(3000); // map tiles
    await shoot(p, 'post-ride.png');
    await p.ctx.close();
  }

  // 7. CNIC verification - the redesigned full-width capture cards.
  {
    const p = await L.phone(b, 'cnic');
    await signInEmail(p, RIDER);
    await L.tab(p, 'Profile');
    await L.tap(p, /CNIC verification/, { wait: 1500 });
    await shoot(p, 'cnic.png');
    await p.ctx.close();
  }

  await b.close();
  console.log('\nDone. Screens are in', OUT);
})();
