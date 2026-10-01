/**
 * Build-time prerender.
 *
 * `npm run build` runs three steps: the normal client build, an SSR build of
 * src/entry-server.jsx, then this script. For every route in src/lib/seo.js it
 * renders the real React tree to HTML, drops it into the client build's
 * index.html template along with that route's head tags, and writes a static
 * file. The client then hydrates that markup instead of booting from an empty
 * <div id="root">.
 *
 * It also emits dist/sitemap.xml so the sitemap can never drift from the route
 * list, and prints any route whose copy is still marked TODO-COPY.
 */
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { ALL_PAGES, ROUTES, SITE, canonicalFor } from '../src/lib/seo.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const ssrDist = path.join(root, 'dist-ssr');

const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(dist, '.vite/manifest.json'), 'utf8'));
const { render, warm } = await import(pathToFileURL(path.join(ssrDist, 'entry-server.js')).href);

// Resolve every route's lazy chunk first; see the note in src/entry-server.jsx.
await warm(ALL_PAGES.map((page) => page.path));

const ROOT_PLACEHOLDER = '<div id="root"></div>';
if (!template.includes(ROOT_PLACEHOLDER) || !template.includes('<!--seo-->')) {
  throw new Error('index.html is missing the #root container or the <!--seo--> marker');
}

/** Minimal escaping for values that land inside double-quoted attributes. */
function attr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function headFor(page) {
  const url = canonicalFor(page.path);
  const image = `${SITE.origin}${SITE.ogImage}`;

  const tags = [
    `<title>${attr(page.title)}</title>`,
    `<meta name="description" content="${attr(page.description)}" />`,
    `<link rel="canonical" href="${attr(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${attr(SITE.name)}" />`,
    `<meta property="og:locale" content="${attr(SITE.locale)}" />`,
    `<meta property="og:title" content="${attr(page.title)}" />`,
    `<meta property="og:description" content="${attr(page.description)}" />`,
    `<meta property="og:url" content="${attr(url)}" />`,
    `<meta property="og:image" content="${attr(image)}" />`,
    `<meta property="og:image:width" content="${SITE.ogImageWidth}" />`,
    `<meta property="og:image:height" content="${SITE.ogImageHeight}" />`,
    `<meta property="og:image:alt" content="${attr(SITE.ogImageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${attr(page.title)}" />`,
    `<meta name="twitter:description" content="${attr(page.description)}" />`,
    `<meta name="twitter:image" content="${attr(image)}" />`,
  ];

  if (page.noindex) tags.push(`<meta name="robots" content="noindex, follow" />`);

  return tags.join('\n    ');
}

/**
 * The page components are loaded with React.lazy, so Vite fetches their chunk
 * at runtime rather than listing it in index.html. Naming it here lets the
 * browser start that download alongside the main bundle instead of after it.
 */
function modulePreloadsFor(source) {
  const entry = source && manifest[source];
  if (!entry) return '';

  const files = new Set([entry.file, ...(entry.imports ?? []).map((key) => manifest[key]?.file)]);
  return [...files]
    .filter(Boolean)
    .map((file) => `\n    <link rel="modulepreload" crossorigin href="/${file}" />`)
    .join('');
}

/** Last commit touching the page's source, so lastmod tracks content not builds. */
function lastModified(source) {
  if (!source) return null;
  try {
    const iso = execFileSync('git', ['log', '-1', '--format=%cI', '--', source], {
      cwd: root,
      encoding: 'utf8',
    }).trim();
    return iso ? iso.slice(0, 10) : null;
  } catch {
    return null;
  }
}

const inlineScriptHashes = new Set();
const today = new Date().toISOString().slice(0, 10);

for (const page of ALL_PAGES) {
  // React hoists resource hints — <link rel="preload"> for the images it
  // knows about — to the top of its output. Injected as-is they would land
  // inside #root, where the client never puts them, and hydration would report
  // a mismatch on the container's first children. Lift them into the head,
  // which is where they belong and where they start downloading sooner.
  const hoisted = [];
  const appHtml = render(page.path).replace(/<link\b[^>]*\/>/g, (tag) => {
    hoisted.push(tag);
    return '';
  });

  const html = template
    .replace(
      /<!--seo-->[\s\S]*?<\/title>/,
      headFor(page) +
        modulePreloadsFor(page.source) +
        hoisted.map((tag) => `\n    ${tag}`).join(''),
    )
    .replace(ROOT_PLACEHOLDER, `<div id="root">${appHtml}</div>`);

  // React's Suspense runtime arrives as a couple of inline <script> blocks.
  // Hashing them is what lets the CSP stay free of 'unsafe-inline' for
  // scripts, and doing it here means the hashes follow React's version
  // instead of being pasted into netlify.toml and going stale.
  for (const [, body] of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
    inlineScriptHashes.add(`sha256-${crypto.createHash('sha256').update(body, 'utf8').digest('base64')}`);
  }

  const target = path.join(dist, page.file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html);
  console.log(`  prerendered ${page.path.padEnd(14)} -> dist/${page.file}`);
}

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...ROUTES.map((route) =>
    [
      '  <url>',
      `    <loc>${canonicalFor(route.path)}</loc>`,
      `    <lastmod>${lastModified(route.source) ?? today}</lastmod>`,
      `    <changefreq>${route.changefreq}</changefreq>`,
      `    <priority>${route.priority}</priority>`,
      '  </url>',
    ].join('\n'),
  ),
  '</urlset>',
  '',
].join('\n');

fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap);
console.log(`  wrote dist/sitemap.xml (${ROUTES.length} urls)`);

/**
 * Content-Security-Policy lives here rather than in netlify.toml because it
 * carries the hashes of React's inline bootstrap scripts, which change with
 * React. Everything else — caching, the other security headers — stays in
 * netlify.toml where it is easy to read and edit.
 *
 * Report-only for now: violations show up in the browser console and in any
 * reporting endpoint, and nothing is blocked. Switch the header name to
 * Content-Security-Policy once the reports come back clean.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  // The contact form posts back to this origin, where Netlify intercepts it.
  "form-action 'self'",
  `script-src 'self' ${[...inlineScriptHashes].map((h) => `'${h}'`).join(' ')}`,
  // 'unsafe-inline' is unavoidable: Motion animates by writing style
  // attributes, and there is a <noscript> style block in the head.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  // Fonts are self-hosted; nothing is fetched from Google any more.
  "font-src 'self'",
  "media-src 'self'",
  "connect-src 'self'",
  "manifest-src 'self'",
  // 'upgrade-insecure-requests' is deliberately absent: browsers ignore it in
  // a report-only policy and log an error saying so. Add it when this becomes
  // Content-Security-Policy proper.
].join('; ');

fs.writeFileSync(
  path.join(dist, '_headers'),
  `# Generated by scripts/prerender.mjs — edit the script, not this file.
/*
  Content-Security-Policy-Report-Only: ${csp}
`,
);
console.log(`  wrote dist/_headers (CSP report-only, ${inlineScriptHashes.size} script hashes)`);

// Titles and descriptions are written to fit what Google shows before it
// truncates. Checked here so a later edit cannot quietly drift out of range.
const TITLE_MAX = 60;
const DESCRIPTION_MIN = 140;
const DESCRIPTION_MAX = 160;

const outOfRange = ALL_PAGES.flatMap((page) => {
  const problems = [];
  if (page.title.length > TITLE_MAX) {
    problems.push(`title is ${page.title.length} characters, max ${TITLE_MAX}`);
  }
  if (page.description.length < DESCRIPTION_MIN || page.description.length > DESCRIPTION_MAX) {
    problems.push(
      `description is ${page.description.length} characters, wanted ${DESCRIPTION_MIN}-${DESCRIPTION_MAX}`,
    );
  }
  return problems.map((problem) => `${page.path}: ${problem}`);
});

if (outOfRange.length) {
  console.error('  Metadata out of range:');
  for (const problem of outOfRange) console.error('    ' + problem);
  process.exit(1);
}
