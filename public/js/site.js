// Shared behaviour for all three pages: section switches, store badges,
// contact details, the mobile menu and the enquiry forms.
// Loaded at the end of <body>, after config.js, so it runs before first paint.
(function () {
  'use strict';

  var cfg = window.SAATH_SAWARI || {};
  var defaults = cfg.sections || {};
  // Contact details start from config.js and are replaced by whatever
  // /site/config answers (the backend's site_settings `contact` row), so an
  // admin can change the email and links without touching the site.
  var email = cfg.supportEmail || '';
  var links = {
    play: cfg.playUrl || '',
    appStore: cfg.appStoreUrl || '',
    instagram: cfg.instagramUrl || '',
    facebook: cfg.facebookUrl || '',
    linkedin: cfg.linkedinUrl || '',
  };

  /* ------------------------------------------------------------------
     Section switches
     Every switchable section carries data-section="<key>". Links that
     lead to a section carry data-requires="<key>" (also across pages),
     and same-page "#id" links are found automatically. When a key is
     false the section and every link to it are hidden; a link marked
     data-fallback="mail" is pointed at the support email instead of
     disappearing (used for the main "talk to us" CTAs).
     ------------------------------------------------------------------ */
  var current = {};

  function readOverrides() {
    // ?sections=home_reviews:1,home_faq:0 previews a combination in this
    // browser only. It never changes what other visitors see.
    var out = {};
    var m = /[?&]sections=([^&#]*)/.exec(window.location.search);
    if (!m) return out;
    decodeURIComponent(m[1]).split(',').forEach(function (pair) {
      var kv = pair.split(':');
      if (kv.length === 2 && /^[a-z_]+$/.test(kv[0])) {
        out[kv[0]] = kv[1] === '1' || kv[1] === 'true' || kv[1] === 'on';
      }
    });
    return out;
  }
  var overrides = readOverrides();

  function isOn(key) {
    return current[key] !== false;
  }

  function applySections(values) {
    current = {};
    Object.keys(defaults).forEach(function (k) { current[k] = defaults[k] !== false; });
    Object.keys(values || {}).forEach(function (k) {
      if (typeof values[k] === 'boolean') current[k] = values[k];
    });
    Object.keys(overrides).forEach(function (k) { current[k] = overrides[k]; });

    var hiddenIds = {};
    document.querySelectorAll('[data-section]').forEach(function (el) {
      var on = isOn(el.getAttribute('data-section'));
      el.hidden = !on;
      if (!on && el.id) hiddenIds[el.id] = true;
    });

    document.querySelectorAll('a[href]').forEach(function (a) {
      var key = a.getAttribute('data-requires');
      var href = a.getAttribute('data-href') || a.getAttribute('href');
      var samePage = href.charAt(0) === '#' && href.length > 1;
      if (!key && !samePage) return; // not a link to a section
      var off = key ? !isOn(key) : !!hiddenIds[href.slice(1)];
      if (a.hasAttribute('data-fallback')) {
        if (!a.hasAttribute('data-href')) a.setAttribute('data-href', href);
        a.setAttribute('href', off && email ? mailHref('Saath Chalo for our organisation') : a.getAttribute('data-href'));
        off = off && !email;
      }
      var item = a.closest('li') || a;
      item.hidden = off;
    });
  }

  function applyContact(c) {
    // A key the API leaves out keeps its config.js value; an empty string
    // hides that link.
    function pick(key, now) { return typeof c[key] === 'string' ? c[key].trim() : now; }
    email = pick('support_email', email);
    links.play = pick('play_url', links.play);
    links.appStore = pick('app_store_url', links.appStore);
    links.instagram = pick('instagram_url', links.instagram);
    links.facebook = pick('facebook_url', links.facebook);
    links.linkedin = pick('linkedin_url', links.linkedin);
    renderStoreBadges();
    renderContact();
  }

  function fetchSections() {
    var base = (cfg.apiBase || '').replace(/\/+$/, '');
    if (!base || !window.fetch) return;
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 2500);
    fetch(base + '/site/config', { signal: ctrl ? ctrl.signal : undefined, credentials: 'omit' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        clearTimeout(timer);
        if (!data) return;
        if (data.contact && typeof data.contact === 'object') applyContact(data.contact);
        if (data.sections && typeof data.sections === 'object') applySections(data.sections);
      })
      .catch(function () { clearTimeout(timer); /* keep the config.js defaults */ });
  }

  /* ------------------------------------------------------------------
     Store badges and "Get the app"
     ------------------------------------------------------------------ */
  var ICON_PLAY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M6 4.5v15l12.5-7.5L6 4.5Z"/></svg>';

  function renderStoreBadges() {
    document.querySelectorAll('[data-store-badges]').forEach(function (wrap) {
      wrap.innerHTML = '';
      [
        { name: 'App Store', url: links.appStore, sub: 'Download on the' },
        { name: 'Google Play', url: links.play, sub: 'Get it on' },
      ].forEach(function (s) {
        var el = document.createElement(s.url ? 'a' : 'span');
        el.className = 'store-badge';
        if (s.url) { el.href = s.url; el.rel = 'noopener'; }
        else el.setAttribute('aria-label', s.name + ': coming soon');
        el.innerHTML = ICON_PLAY + '<span class="sb-text"><span class="sb-sub">' +
          (s.url ? s.sub : 'Coming soon on') + '</span><span class="sb-name">' + s.name + '</span></span>';
        wrap.appendChild(el);
      });
    });
    var store = links.play || links.appStore;
    if (store) {
      document.querySelectorAll('[data-get-app]').forEach(function (a) { a.href = store; a.rel = 'noopener'; });
    }
  }

  /* ------------------------------------------------------------------
     Contact details, social links, legal pages
     ------------------------------------------------------------------ */
  function mailHref(subject, body) {
    var q = '?subject=' + encodeURIComponent(subject);
    if (body) q += '&body=' + encodeURIComponent(body);
    return 'mailto:' + email + q;
  }

  function renderContact() {
    document.querySelectorAll('[data-support-email]').forEach(function (a) {
      if (!email) { (a.closest('li') || a).hidden = true; return; }
      a.textContent = email;
      a.href = 'mailto:' + email;
    });
    ['instagram', 'facebook', 'linkedin'].forEach(function (name) {
      var url = links[name];
      document.querySelectorAll('[data-social="' + name + '"]').forEach(function (a) {
        var li = a.closest('li') || a;
        if (url) { a.href = url; li.hidden = false; } else li.hidden = true;
      });
    });
    var origin = '';
    try { origin = new URL(cfg.apiBase).origin; } catch (e) { origin = ''; }
    document.querySelectorAll('[data-legal]').forEach(function (a) {
      a.href = origin + '/' + a.getAttribute('data-legal');
    });
  }

  /* ------------------------------------------------------------------
     Mobile menu
     ------------------------------------------------------------------ */
  function initMenu() {
    var btn = document.querySelector('.menu-toggle');
    var menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;
    function set(open) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.hidden = !open;
    }
    btn.addEventListener('click', function () { set(btn.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1024) set(false); });
  }

  /* ------------------------------------------------------------------
     Enquiry forms: sent to the Saath Chalo API (POST /site/enquiries),
     where the admin panel reads them. If the API can't be reached the
     visitor is pointed at the support email instead.
     ------------------------------------------------------------------ */
  function showStatus(el, text, withEmail) {
    if (!el) return;
    el.hidden = false;
    el.innerHTML = '';
    el.appendChild(document.createTextNode(text));
    if (withEmail && email) {
      var a = document.createElement('a');
      a.href = 'mailto:' + email;
      a.textContent = email;
      el.appendChild(a);
      el.appendChild(document.createTextNode('.'));
    }
  }

  function initForms() {
    var base = (cfg.apiBase || '').replace(/\/+$/, '');
    document.querySelectorAll('form[data-enquiry]').forEach(function (form) {
      var status = form.querySelector('.form-status');
      var button = form.querySelector('button[type="submit"]');
      // A field people never see; bots fill it and the API drops the enquiry.
      var trap = document.createElement('input');
      trap.type = 'text'; trap.name = 'company_site'; trap.tabIndex = -1;
      trap.autocomplete = 'off'; trap.setAttribute('aria-hidden', 'true');
      trap.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0';
      form.appendChild(trap);

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }
        var body = { source: form.getAttribute('data-enquiry') || 'home', company_site: trap.value };
        form.querySelectorAll('input, select, textarea').forEach(function (f) {
          if (!f.name || f === trap || !f.value) return;
          // Both forms' free-text box ends up as the enquiry's message.
          body[f.name === 'commute_from' || f.name === 'improve' ? 'message' : f.name] = f.value;
        });
        if (button) button.disabled = true;
        var ctrl = window.AbortController ? new AbortController() : null;
        var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 10000);
        fetch(base + '/site/enquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: ctrl ? ctrl.signal : undefined,
          credentials: 'omit',
        })
          .then(function (r) {
            clearTimeout(timer);
            if (r.status === 429) throw new Error('busy');
            if (!r.ok) throw new Error('failed');
            form.reset();
            showStatus(status, 'Thank you. We have your enquiry and will reply to ' + body.email + ' soon.');
          })
          .catch(function (err) {
            clearTimeout(timer);
            showStatus(status, err.message === 'busy'
              ? 'You have sent a few enquiries already. Please try again in a while, or email us at '
              : 'We could not send that just now. Please email us at ', true);
          })
          .then(function () { if (button) button.disabled = false; });
      });
    });
  }

  applySections({});
  renderStoreBadges();
  renderContact();
  initMenu();
  initForms();
  fetchSections();
})();
