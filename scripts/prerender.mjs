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
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { ALL_PAGES, ROUTES, SITE, canonicalFor } from '../src/lib/seo.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const ssrDist = path.join(root, 'dist-ssr');

const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const { render } = await import(pathToFileURL(path.join(ssrDist, 'entry-server.js')).href);

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

const today = new Date().toISOString().slice(0, 10);

for (const page of ALL_PAGES) {
  const appHtml = render(page.path);
  const html = template
    .replace(/<!--seo-->[\s\S]*?<\/title>/, headFor(page))
    .replace(ROOT_PLACEHOLDER, `<div id="root">${appHtml}</div>`);

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

const unconfirmed = ALL_PAGES.filter((page) => page.todo).map((page) => page.path);
if (unconfirmed.length) {
  console.log(`\n  TODO-COPY: title/description still unconfirmed for ${unconfirmed.join(', ')}`);
}
