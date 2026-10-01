/**
 * Single source of truth for every route's <head>.
 *
 * Two consumers read this file:
 *  - `scripts/prerender.mjs` at build time, which bakes the tags into the
 *    static HTML (this is what crawlers and social scrapers actually see);
 *  - `src/components/Seo.jsx` at runtime, which keeps the head in sync as the
 *    router swaps pages client-side.
 *
 * Keep it plain data with no imports — the build script loads it directly in
 * Node, so it must stay free of JSX and asset imports.
 *
 * Titles are kept at 60 characters or under and descriptions between 140 and
 * 160, which is roughly what Google will show before truncating. The build
 * checks both and fails if either drifts out of range.
 */

// Extension included deliberately: scripts/prerender.mjs loads this file
// directly in Node, which does not resolve extensionless specifiers.
import { BUSINESS } from '../data/business.js';

export const SITE = {
  origin: 'https://mistrootcoffee.com',
  name: BUSINESS.name,
  locale: 'en_IN',
  lang: 'en-IN',
  themeColor: '#0C0A07',
  ogImage: '/og/mistroot-og.png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: BUSINESS.name,
};

/** Routes that get prerendered, in sitemap order. */
export const ROUTES = [
  {
    path: '/',
    source: 'src/pages/Home.jsx', // drives <lastmod> in the sitemap
    file: 'index.html',
    priority: '1.0',
    changefreq: 'monthly',
    title: "MistRoot Coffee Club — Specialty Coffee from Coorg",
    description:
      "Three generations of coffee growing in the Brahmagiri Range, Kodagu (Coorg). Four estate coffees, six ways to brew them, and the club built around sharing them.",
  },
  {
    path: '/story',
    source: 'src/pages/Story.jsx', // drives <lastmod> in the sitemap
    file: 'story.html',
    priority: '0.8',
    changefreq: 'yearly',
    title: "Our Story — Three Generations of Coorg Coffee",
    description:
      "Our family has grown coffee in the Brahmagiri Range of Kodagu since the 1940s. Three generations on, MistRoot is a club built around how that coffee is shared.",
  },
  {
    path: '/club',
    source: 'src/pages/Club.jsx', // drives <lastmod> in the sitemap
    file: 'club.html',
    priority: '0.9',
    changefreq: 'monthly',
    title: "The Coffee Club — Our Coorg Coffees and Prices",
    description:
      "Four coffees from the Brahmagiri Range in Coorg: Arabica and Robusta, naturally processed, medium roast, 250 g from ₹500. Order on WhatsApp for now.",
  },
  {
    path: '/brewing',
    source: 'src/pages/Brewing.jsx', // drives <lastmod> in the sitemap
    file: 'brewing.html',
    priority: '0.8',
    changefreq: 'monthly',
    title: "Brewing Guides — Six Ways to Brew Coorg Coffee",
    description:
      "Pour over, AeroPress, French press, moka pot, cold brew and espresso. Doses, water temperatures and timings for every MistRoot coffee grown in Kodagu (Coorg).",
  },
  {
    path: '/experiences',
    source: 'src/pages/Experiences.jsx', // drives <lastmod> in the sitemap
    file: 'experiences.html',
    priority: '0.8',
    changefreq: 'monthly',
    title: "Estate Experiences in Coorg — Walks and Harvest",
    description:
      "Pop-ups, estate walks, the December and January harvest, and the bean-to-cup day. Spend time with coffee where it grows, in the Brahmagiri Range of Coorg.",
  },
  {
    path: '/contact',
    source: 'src/pages/Contact.jsx', // drives <lastmod> in the sitemap
    file: 'contact.html',
    priority: '0.6',
    changefreq: 'yearly',
    title: "Contact MistRoot Coffee Club — Kodagu, Coorg",
    description:
      "The tasting room is open Thursday to Sunday, 08:00 to 17:00, in the Brahmagiri Range of Kodagu (Coorg). Email, WhatsApp, directions and the enquiry form.",
  },
];

/**
 * The 404 page is prerendered like the others but stays out of the sitemap and
 * out of the index.
 */
export const NOT_FOUND = {
  path: '/404',
  source: 'src/pages/NotFound.jsx',
  file: '404.html',
  noindex: true,
  title: "Page Not Found — MistRoot Coffee Club",
  description:
    "That page has wandered off the ridge. Head back to MistRoot Coffee Club — the Coorg coffees, the brewing guides and the estate experiences are all still here.",
};

export const ALL_PAGES = [...ROUTES, NOT_FOUND];

/** Absolute, canonical URL for a route. No trailing slash except the root. */
export function canonicalFor(routePath) {
  return routePath === '/' ? `${SITE.origin}/` : `${SITE.origin}${routePath}`;
}

/** Look up a page by pathname; unknown paths fall back to the 404 entry. */
export function pageFor(pathname) {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return ROUTES.find((r) => r.path === clean) ?? NOT_FOUND;
}
