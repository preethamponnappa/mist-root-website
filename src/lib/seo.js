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
 * TODO-COPY: every entry flagged `todo: true` below is draft wording awaiting
 * sign-off. The flag never reaches the markup; `npm run build` prints the list
 * of routes still unconfirmed so they can't be forgotten.
 */

export const SITE = {
  origin: 'https://mistrootcoffee.com',
  name: 'MistRoot Coffee',
  locale: 'en_IN',
  lang: 'en-IN',
  themeColor: '#0C0A07',
  ogImage: '/og/mistroot-og.png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: 'MistRoot Coffee',
};

/** Routes that get prerendered, in sitemap order. */
export const ROUTES = [
  {
    path: '/',
    source: 'src/pages/Home.jsx', // drives <lastmod> in the sitemap
    file: 'index.html',
    priority: '1.0',
    changefreq: 'monthly',
    todo: true, // TODO-COPY
    title: 'MistRoot Coffee — Specialty Coffee from Coorg',
    description:
      'Three generations of coffee growing in the hills of Coorg, now a coffee club. Beans sourced from our own hills and beyond, brewed six ways, shared slowly.',
  },
  {
    path: '/story',
    source: 'src/pages/Story.jsx', // drives <lastmod> in the sitemap
    file: 'story.html',
    priority: '0.8',
    changefreq: 'yearly',
    todo: true, // TODO-COPY
    title: 'Our Story — Three Generations of Coffee in Coorg | MistRoot',
    description:
      'Rooted in Coorg, made for the journey. Three generations of coffee growing in the Brahmagiri range, and one new way of experiencing it.',
  },
  {
    path: '/club',
    source: 'src/pages/Club.jsx', // drives <lastmod> in the sitemap
    file: 'club.html',
    priority: '0.9',
    changefreq: 'monthly',
    todo: true, // TODO-COPY
    title: 'The MistRoot Coffee Club — Coorg Coffee, Sourced and Shared',
    description:
      'How we source, brew and share coffee from Coorg — and the four coffees in the current MistRoot lineup.',
  },
  {
    path: '/brewing',
    source: 'src/pages/Brewing.jsx', // drives <lastmod> in the sitemap
    file: 'brewing.html',
    priority: '0.8',
    changefreq: 'monthly',
    todo: true, // TODO-COPY
    title: 'Brewing Guides — Six Ways to Brew Coorg Coffee | MistRoot',
    description:
      'Pour over, AeroPress, French press, moka pot, cold brew and espresso — dialled-in recipes for every MistRoot coffee, with doses, temperatures and timings.',
  },
  {
    path: '/experiences',
    source: 'src/pages/Experiences.jsx', // drives <lastmod> in the sitemap
    file: 'experiences.html',
    priority: '0.8',
    changefreq: 'monthly',
    todo: true, // TODO-COPY
    title: 'Estate Experiences in Coorg — Walks, Harvest & Bean-to-Cup | MistRoot',
    description:
      'Estate walks, the harvest experience and the bean-to-cup journey — spend a day with coffee where it grows, in Coorg.',
  },
  {
    path: '/contact',
    source: 'src/pages/Contact.jsx', // drives <lastmod> in the sitemap
    file: 'contact.html',
    priority: '0.6',
    changefreq: 'yearly',
    todo: true, // TODO-COPY
    title: 'Contact MistRoot Coffee — Coorg, Karnataka',
    description:
      'Get in touch with MistRoot Coffee in Kodagu (Coorg) — email, phone, estate address and the enquiry form.',
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
  todo: true, // TODO-COPY
  title: 'Page Not Found — MistRoot Coffee',
  description: 'That page has wandered off the ridge. Find your way back to MistRoot Coffee.',
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
