// Everything about the site that changes with where things are hosted. When
// the domain or the app's own address arrives, this is the only file to
// edit (see README.md).
window.SAATH_SAWARI = {
  // The Play Store listing. Empty shows "Coming soon on Google Play".
  playUrl: '',

  // The App Store listing. Empty shows "Coming soon on the App Store".
  appStoreUrl: '',

  // For privacy requests, support and the "bring it to your office" contact.
  // Set in .env.example as support@saathchalo.pk, but not yet configured in
  // the live backend — confirm the real address before this goes public.
  // (The design handoff shows hello@saathchalo.pk; whichever is real goes here.)
  supportEmail: 'support@saathchalo.pk',

  // Social profiles for the footer's "Say hello" column. Empty hides the link.
  instagramUrl: '',
  facebookUrl: '',
  linkedinUrl: '',

  // The Saath Chalo API. The site reads its section switches from
  // `${apiBase}/site/config`, and links the footer's privacy / terms /
  // delete-account pages to the same server (they live outside /api/v1).
  // Local default below; production sets this to the live API's base URL.
  apiBase: 'http://localhost:3002/api/v1',

  // Section switches used until /site/config answers (and if it never does).
  // Keep these identical to the backend's defaults; a section that defaults
  // to false must also carry the `hidden` attribute in the HTML so it never
  // flashes on screen. See README.md for which key is which section.
  sections: {
    home_twin_city: true,
    home_how_it_works: true,
    home_corridor: true,
    home_safety: true,
    home_drivers: true,
    home_organisations: true,
    home_savings: true,
    home_reviews: false,
    home_areas: true,
    home_enquiry: true,
    home_faq: true,
    org_benefits: true,
    org_dashboard: true,
    org_setup: true,
    org_pricing: true,
    org_contact: true,
    safety_basics: true,
    safety_groups: true,
    safety_sos: true,
    safety_shared_care: true,
    safety_cta: true,
  },
};
