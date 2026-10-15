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
import { METHODS } from '../data/brewing.js';
import {
  CURRENCY,
  activeProducts,
  paiseToDecimal,
  priceRange,
  productBySlug,
} from '../../shared/catalog.js';

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
    path: '/shop',
    source: 'src/pages/Shop.jsx', // drives <lastmod> in the sitemap
    file: 'shop.html',
    priority: '0.9',
    changefreq: 'weekly',
    title: "Shop MistRoot Coffee — Arabica and Robusta from Coorg",
    description:
      "Buy MistRoot coffee from Coorg: two Arabicas and two Robustas, naturally processed and medium roasted, in 250 g, 500 g and 1 kg bags. Free shipping over ₹999.",
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
  {
    path: '/coorg-coffee',
    source: 'src/pages/CoorgCoffee.jsx',
    file: 'coorg-coffee.html',
    priority: '0.7',
    changefreq: 'yearly',
    title: 'Coorg Coffee Guide — Region, Varieties, Harvest',
    description:
      'What grows in Kodagu (Coorg), when it is picked and why the hillside shows up in the cup. Written from a working estate in the Brahmagiri Range.',
  },
];

/**
 * Written out per method rather than generated: one template cannot land in
 * the 140–160 window across six recipes whose doses, temperatures and times
 * differ this much. The build checks the lengths, and every figure quoted here
 * is in src/data/brewing.js.
 */
const BREW_DESCRIPTIONS = {
    "pour-over": "Our pour over recipe for MistRoot coffee from Coorg: 20 g to 320 g at 92 °C, medium-fine grind, 3:15 to 3:30 total, with timings for every pour.",
    "aeropress": "Our AeroPress recipe for MistRoot coffee from Coorg: 17 g to 220 g at 90 °C, fine-medium grind, 2:10 in total, including the steep and the plunge.",
    "french-press": "Our French press recipe for MistRoot coffee from Coorg: 40 g to 600 g at 96 °C, coarse grind, eight minutes, with the crust break and the decant.",
    "moka-pot": "Our moka pot recipe for MistRoot coffee from Coorg: 18 g to 150 g of pre-boiled water, fine-medium grind, and about four minutes on a low flame.",
    "cold-brew": "Our cold brew recipe for MistRoot coffee from Coorg: 100 g to 800 g, coarse grind, sixteen hours at room temperature, then filtered and chilled.",
    "espresso": "Our espresso recipe for MistRoot coffee from Coorg: 18 g in, 40 g out in about 28 seconds at 93 °C, and what to change when it runs fast or slow."
  };

/**
 * One page per brewing method, built from the recipes themselves so a new
 * method cannot be added without its page, its sitemap entry and its metadata
 * appearing with it.
 */
export const BREW_ROUTES = METHODS.map((method) => ({
  path: `/brewing/${method.id}`,
  source: 'src/pages/BrewMethod.jsx',
  file: `brewing/${method.id}.html`,
  methodId: method.id,
  priority: '0.6',
  changefreq: 'yearly',
  title: `${method.name} Recipe — MistRoot Coorg Coffee`,
  description: BREW_DESCRIPTIONS[method.id],
}));

ROUTES.push(...BREW_ROUTES);

/**
 * Written out per coffee for the same reason as the brew descriptions. Prices
 * are left out on purpose: they live in shared/catalog.js and would drift here.
 */
const PRODUCT_DESCRIPTIONS = {
  'highland-reserve':
    'Highland Reserve is our finest Arabica AAA from Coorg: floral, citrus and honey in the cup. Naturally processed, medium roast, whole bean or ground to order.',
  'highland-arabica':
    'Highland Arabica is an Arabica AA from Coorg for every day: chocolate, nuts and caramel, with a smooth finish. Natural process, medium roast, ground to order.',
  'forest-reserve':
    'Forest Reserve is a Robusta AAA from Coorg: dark chocolate, spice and an earthy finish, with rich crema. Natural process, medium roast, ground to order.',
  'estate-robusta':
    'Estate Robusta is a Robusta AA from Coorg with cocoa, malt and roasted nut, made for espresso and milk drinks. Natural process, medium roast, ground to order.',
};

/**
 * One page per coffee on sale, generated from the catalogue so a new coffee
 * cannot ship without its page, sitemap entry and metadata. The prerender fails
 * if a new coffee has no description above.
 */
export const PRODUCT_ROUTES = activeProducts().map((product) => ({
  path: `/shop/${product.slug}`,
  source: 'shared/catalog.js',
  file: `shop/${product.slug}.html`,
  productSlug: product.slug,
  ogType: 'product',
  priority: '0.8',
  changefreq: 'weekly',
  title: `${product.name} — ${product.species} ${product.grade} from Coorg`,
  description: PRODUCT_DESCRIPTIONS[product.slug] ?? '',
}));

ROUTES.push(...PRODUCT_ROUTES);

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

/**
 * Shop pages that are prerendered (Netlify has no catch-all, so they need a
 * file) but are personal to one visitor: noindex, and out of the sitemap.
 *
 * /order/<id> is a single shell served by the `/order/*` rewrite in
 * netlify.toml. `renderPath` is the URL the prerender renders it at, since the
 * real ids only exist at runtime.
 */
export const CHECKOUT_PAGE = {
  path: '/checkout',
  source: 'src/pages/Checkout.jsx',
  file: 'checkout.html',
  noindex: true,
  title: 'Checkout — MistRoot Coffee Club',
  description:
    'Check out your MistRoot coffee order from Coorg: add your shipping address, then pay securely by UPI, card, net banking or wallet through Razorpay.',
};

export const ORDER_PAGE = {
  path: '/order',
  renderPath: '/order/pending',
  source: 'src/pages/Order.jsx',
  file: 'order.html',
  noindex: true,
  title: 'Your Order — MistRoot Coffee Club',
  description:
    'The status of your MistRoot Coffee order from Coorg: what you ordered, where it is going and whether payment is confirmed. Keep this link to check back.',
};

export const ALL_PAGES = [...ROUTES, CHECKOUT_PAGE, ORDER_PAGE, NOT_FOUND];

/** Absolute, canonical URL for a route. No trailing slash except the root. */
export function canonicalFor(routePath) {
  return routePath === '/' ? `${SITE.origin}/` : `${SITE.origin}${routePath}`;
}

/** Look up a page by pathname; unknown paths fall back to the 404 entry. */
export function pageFor(pathname) {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  if (clean === CHECKOUT_PAGE.path) return CHECKOUT_PAGE;
  if (clean.startsWith('/order/')) return ORDER_PAGE;
  return ROUTES.find((r) => r.path === clean) ?? NOT_FOUND;
}

/** Open Graph product tags for a product page — the lowest price it sells at. Empty elsewhere. */
export function productMetaFor(page) {
  const product = page.productSlug && productBySlug(page.productSlug);
  const range = product && priceRange(product);
  if (!range) return [];
  return [
    ['product:price:amount', paiseToDecimal(range.minPaise)],
    ['product:price:currency', CURRENCY],
  ];
}
