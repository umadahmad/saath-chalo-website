#!/usr/bin/env node
// Writes the brand name from public/brand.js into the static HTML pages.
//
//   node tools/apply-brand.js
//
// Edit `name` in public/brand.js first. This replaces `previousName` with `name` in every
// public/*.html (titles, meta tags, alt/aria texts, visible text), then sets `previousName`
// to `name` so the next rename knows what to look for. No dependencies; line endings are kept.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const publicDir = path.join(__dirname, '..', 'public');
const brandFile = path.join(publicDir, 'brand.js');
const source = fs.readFileSync(brandFile, 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox);
const brand = sandbox.window.SITE_BRAND;
if (!brand || !brand.name || !brand.shortName) {
  console.error('public/brand.js must define window.SITE_BRAND with name and shortName.');
  process.exit(1);
}
const previous = brand.previousName || brand.name;
if (/[<>&"\\$]/.test(brand.name + brand.shortName)) {
  console.error('Brand names must not contain < > & " backslash or $.');
  process.exit(1);
}

let changed = 0;
if (previous !== brand.name) {
  for (const file of fs.readdirSync(publicDir).filter((f) => f.endsWith('.html'))) {
    const full = path.join(publicDir, file);
    const html = fs.readFileSync(full, 'utf8');
    const next = html.split(previous).join(brand.name);
    if (next !== html) {
      fs.writeFileSync(full, next);
      changed++;
      console.log(`updated  public/${file}`);
    }
  }
  const updated = source.replace(
    /(previousName:\s*')[^']*(')/,
    (_, a, b) => `${a}${brand.name}${b}`,
  );
  if (updated === source) {
    console.error('Could not find previousName in public/brand.js.');
    process.exit(1);
  }
  fs.writeFileSync(brandFile, updated);
  console.log('updated  public/brand.js (previousName)');
}

// Check: every page loads brand.js and nothing still carries the old name.
let problems = 0;
for (const file of fs.readdirSync(publicDir).filter((f) => f.endsWith('.html'))) {
  const html = fs.readFileSync(path.join(publicDir, file), 'utf8');
  if (!html.includes('<script src="brand.js"></script>')) {
    console.error(`public/${file} does not load brand.js`);
    problems++;
  }
  if (previous !== brand.name && html.includes(previous)) {
    console.error(`public/${file} still says "${previous}"`);
    problems++;
  }
  if (!html.includes(brand.name)) {
    console.error(`public/${file} does not say "${brand.name}"`);
    problems++;
  }
}
console.log(
  changed ? `\nDone: ${changed} page(s) now say "${brand.name}".` : `\nAll pages say "${brand.name}".`,
);
process.exit(problems ? 1 : 0);
