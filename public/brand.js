// The site's brand name: the ONE place it is written. Edit `name` (and `shortName`),
// then run `node tools/apply-brand.js` from the website folder. The script rewrites the
// static copy of the name in the HTML (titles, meta tags, alt texts and visible text, which
// search engines and visitors without JavaScript see) and records it as `previousName`.
// Until that is run, js/site.js already swaps the old name for the new one in the page.
// Contact details are not here: they come from config.js and the API's /site/config.
window.SITE_BRAND = {
  name: 'Vingo Ride',
  shortName: 'Vingo',
  previousName: 'Vingo Ride',
};
