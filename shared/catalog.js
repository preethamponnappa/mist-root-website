/**
 * The product catalogue: every coffee we sell, every variant of it, and what
 * each one costs. The single source of truth for the shop pages, the prerender
 * (JSON-LD, sitemap, llms.txt) and — once checkout exists — the Netlify
 * Functions, which recompute every price from this file and never trust one
 * sent by the browser.
 *
 * Rules for this file:
 *  - Plain JavaScript, no JSX, no asset imports, no browser or Node APIs. It is
 *    loaded by Vite, by Node during the build, and by serverless functions.
 *  - Money is integer paise. 60000 is ₹600. Never floats, never rupees.
 *  - Every value is a claim we make to a customer. Anything not yet confirmed
 *    against the facts sheet is marked `// TODO confirm` — clear those before
 *    taking real orders.
 *
 * Kept as .js with JSDoc rather than .ts: Netlify builds on Node 22, which
 * cannot import TypeScript without a loader, and the prerender imports this
 * file directly.
 */

/**
 * @typedef {'WHOLE_BEAN' | 'POUR_OVER' | 'FRENCH_PRESS' | 'ESPRESSO' | 'SOUTH_INDIAN_FILTER'} GrindId
 *
 * @typedef {object} Variant
 * @property {string}  sku            e.g. MR-HR-250-WB
 * @property {number}  sizeGrams      250 | 500 | 1000
 * @property {GrindId} grind
 * @property {number}  pricePaise     integer paise, GST-inclusive
 * @property {number}  packedWeightKg shipping weight including packaging
 * @property {number}  lengthCm
 * @property {number}  breadthCm
 * @property {number}  heightCm
 * @property {boolean} inStock
 *
 * @typedef {object} ProductImage
 * @property {string} src   path under /public, root-relative
 * @property {string} alt
 * @property {number} width
 * @property {number} height
 *
 * @typedef {object} Product
 * @property {string}   slug          URL segment and stable id
 * @property {string}   skuCode       two-letter code used in every SKU
 * @property {string}   no            display numeral, "01"
 * @property {string}   name
 * @property {string}   shortName     name without the brand
 * @property {'Arabica' | 'Robusta'} species
 * @property {'AA' | 'AAA'} grade
 * @property {string}   origin
 * @property {string}   altitude
 * @property {string}   process
 * @property {string}   roast
 * @property {string}   profile       three-word character line
 * @property {string[]} tastingNotes
 * @property {1|2|3|4}  intensity
 * @property {string}   description   the paragraph used on cards and in meta
 * @property {string[]} story         longer copy for the product page
 * @property {string[]} brewMethods   ids from src/data/brewing.js, best first
 * @property {ProductImage[]} images
 * @property {boolean}  isActive
 * @property {Variant[]} variants
 */

export const CURRENCY = 'INR';

/** Largest quantity of one variant in a single order. The server enforces the same cap. */
export const MAX_QUANTITY_PER_LINE = 10;

/**
 * Shipping as decided: free over ₹999, otherwise a flat ₹80. Prices are
 * GST-inclusive, so there is no tax line. Shown on the product page; the
 * checkout function will import the same numbers.
 */
export const SHIPPING = {
  freeOverPaise: 99900,
  flatFeePaise: 8000,
};

/** Grind options, in the order they are offered. `code` is the SKU suffix. */
export const GRINDS = [
  { id: 'WHOLE_BEAN', code: 'WB', label: 'Whole bean', hint: 'Grind fresh at home' },
  { id: 'POUR_OVER', code: 'PO', label: 'Pour over', hint: 'Medium-fine' },
  { id: 'FRENCH_PRESS', code: 'FP', label: 'French press', hint: 'Coarse' },
  { id: 'ESPRESSO', code: 'ES', label: 'Espresso', hint: 'Fine' },
  { id: 'SOUTH_INDIAN_FILTER', code: 'SF', label: 'South Indian filter', hint: 'Fine-medium' },
];

export const SIZES = [250, 500, 1000];

/**
 * What a packed bag of each size weighs and measures. Shiprocket needs all four
 * numbers on every shipment.
 */
const PACKAGING = {
  250: { packedWeightKg: 0.27, lengthCm: 20, breadthCm: 13, heightCm: 6 }, // TODO confirm dimensions (weight confirmed)
  500: { packedWeightKg: 0.53, lengthCm: 24, breadthCm: 15, heightCm: 7 }, // TODO confirm
  1000: { packedWeightKg: 1.05, lengthCm: 30, breadthCm: 18, heightCm: 8 }, // TODO confirm
};

/** Shared estate photograph — a stand-in until each coffee has its own. */
const ESTATE_IMAGE = {
  src: '/images/shop/estate-ridge.webp',
  alt: 'Coffee cherries ripening on shaded bushes, with mist in the valleys of the Brahmagiri hills behind',
  width: 854,
  height: 480,
}; // TODO replace with product photography

/** Same for every lot today; kept per product so one can differ later. */
const ORIGIN = 'Kodagu (Coorg), Karnataka';
const ALTITUDE = '800–1,200 m'; // TODO confirm per lot (this is the estate's range)

/**
 * Prices per size, in paise. The 250 g prices are the published ones; the
 * larger bags are placeholders.
 */
const SEED = [
  {
    slug: 'highland-reserve',
    skuCode: 'HR',
    no: '01',
    name: 'MistRoot Highland Reserve',
    shortName: 'Highland Reserve',
    species: 'Arabica',
    grade: 'AAA',
    origin: ORIGIN,
    altitude: ALTITUDE,
    process: 'Natural',
    roast: 'Medium',
    profile: 'Elegant · Complex · Refined',
    tastingNotes: ['Floral', 'Citrus', 'Honey'],
    intensity: 2,
    description:
      'Our finest Arabica, grown in the high-altitude plantations of Coorg. Handpicked and carefully processed to bring out a clean, layered cup with floral notes and a lingering sweetness.',
    brewMethods: ['pour-over'],
    prices: {
      250: 60000,
      500: 115000, // TODO confirm
      1000: 220000, // TODO confirm
    },
  },
  {
    slug: 'highland-arabica',
    skuCode: 'HA',
    no: '02',
    name: 'MistRoot Highland Arabica',
    shortName: 'Highland Arabica',
    species: 'Arabica',
    grade: 'AA',
    origin: ORIGIN,
    altitude: ALTITUDE,
    process: 'Natural',
    roast: 'Medium',
    profile: 'Smooth · Balanced · Versatile',
    tastingNotes: ['Chocolate', 'Nutty', 'Caramel'],
    intensity: 2,
    description:
      'A well-rounded Arabica with bright acidity, gentle sweetness and a smooth finish. Perfect for everyday brewing, yet special enough to savour slowly.',
    brewMethods: ['aeropress', 'pour-over'],
    prices: {
      250: 50000,
      500: 95000, // TODO confirm
      1000: 180000, // TODO confirm
    },
  },
  {
    slug: 'forest-reserve',
    skuCode: 'FR',
    no: '03',
    name: 'MistRoot Forest Reserve',
    shortName: 'Forest Reserve',
    species: 'Robusta',
    grade: 'AAA',
    origin: ORIGIN,
    altitude: ALTITUDE,
    process: 'Natural',
    roast: 'Medium',
    profile: 'Bold · Rich · Full-bodied',
    tastingNotes: ['Dark chocolate', 'Spice', 'Earthy'],
    intensity: 4,
    description:
      'A premium Robusta with depth and character. Grown under native shade, it delivers a strong cup with rich crema, earthy notes and a comforting finish.',
    brewMethods: ['french-press', 'cold-brew'],
    prices: {
      250: 60000,
      500: 115000, // TODO confirm
      1000: 220000, // TODO confirm
    },
  },
  {
    slug: 'estate-robusta',
    skuCode: 'ER',
    no: '04',
    name: 'MistRoot Estate Robusta',
    shortName: 'Estate Robusta',
    species: 'Robusta',
    grade: 'AA',
    origin: ORIGIN,
    altitude: ALTITUDE,
    process: 'Natural',
    roast: 'Medium',
    profile: 'Bold · Smooth · Dependable',
    tastingNotes: ['Cocoa', 'Malt', 'Roasted nut'],
    intensity: 3,
    description:
      'A classic Robusta with a rich, full-bodied profile. Low acidity, with deep chocolate notes — ideal for espresso, milk-based drinks or a strong morning cup.',
    brewMethods: ['espresso', 'moka-pot'],
    prices: {
      250: 50000,
      500: 95000, // TODO confirm
      1000: 180000, // TODO confirm
    },
  },
];

/**
 * The second paragraph of every product story. Built from the product's own
 * fields so it can never contradict the spec list beside it.
 */
function storyFor(seed) {
  return [
    seed.description,
    `It is ${seed.process.toLowerCase()}-processed — the whole cherry is dried before it is hulled, so the fruit has time to shape the bean — and taken to a ${seed.roast.toLowerCase()} roast. Grown in ${seed.origin} at ${seed.altitude}.`,
  ];
}

/** One variant per size × grind. Price depends on size only; grind is done to order. */
function variantsFor(seed) {
  return SIZES.flatMap((sizeGrams) =>
    GRINDS.map((grind) => ({
      sku: `MR-${seed.skuCode}-${sizeGrams}-${grind.code}`,
      sizeGrams,
      grind: grind.id,
      pricePaise: seed.prices[sizeGrams],
      ...PACKAGING[sizeGrams],
      inStock: true,
    })),
  );
}

/** @type {Product[]} */
// `prices` only feeds variantsFor(); the product itself carries prices per variant.
export const PRODUCTS = SEED.map(({ prices, ...product }) => ({
  ...product,
  story: storyFor(product),
  images: [ESTATE_IMAGE],
  isActive: true,
  variants: variantsFor({ ...product, prices }),
}));

// Fail the build — and any function cold start — on a malformed catalogue,
// rather than discovering it as a wrong charge.
(function assertCatalogue() {
  const skus = new Set();
  for (const product of PRODUCTS) {
    for (const v of product.variants) {
      if (skus.has(v.sku)) throw new Error(`catalog: duplicate SKU ${v.sku}`);
      skus.add(v.sku);
      if (!Number.isInteger(v.pricePaise) || v.pricePaise <= 0) {
        throw new Error(`catalog: ${v.sku} price must be a positive integer of paise`);
      }
    }
  }
})();

// ------------------------------------------------------------- lookups ---

export const activeProducts = () => PRODUCTS.filter((p) => p.isActive);

export const productBySlug = (slug) => PRODUCTS.find((p) => p.slug === slug);

export const grindById = (id) => GRINDS.find((g) => g.id === id);

const VARIANTS_BY_SKU = new Map(
  PRODUCTS.flatMap((product) => product.variants.map((variant) => [variant.sku, { product, variant }])),
);

/** `{ product, variant }` for a SKU, or undefined. */
export const lookupSku = (sku) => VARIANTS_BY_SKU.get(sku);

export const findVariant = (product, sizeGrams, grind) =>
  product.variants.find((v) => v.sizeGrams === sizeGrams && v.grind === grind);

/** The variant a product page opens on: the smallest size, whole bean, in stock if possible. */
export function defaultVariant(product) {
  return (
    product.variants.find((v) => v.inStock && v.grind === GRINDS[0].id) ??
    product.variants.find((v) => v.inStock) ??
    product.variants[0]
  );
}

/** Lowest and highest price across a product's in-stock variants. */
export function priceRange(product) {
  const prices = product.variants.filter((v) => v.inStock).map((v) => v.pricePaise);
  if (prices.length === 0) return null;
  return { minPaise: Math.min(...prices), maxPaise: Math.max(...prices) };
}

export const isAvailable = (product) => product.isActive && product.variants.some((v) => v.inStock);

// ---------------------------------------------------------- formatting ---

/** ₹600, ₹1,150, ₹12.50 — the only place paise become rupees for display. */
export function formatPrice(paise) {
  const rupees = paise / 100;
  return `₹${rupees.toLocaleString('en-IN', {
    minimumFractionDigits: Number.isInteger(rupees) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

/** "600.00" — the decimal string schema.org and Open Graph expect. */
export const paiseToDecimal = (paise) => `${Math.floor(paise / 100)}.${String(paise % 100).padStart(2, '0')}`;

/** 250 → "250 g", 1000 → "1 kg". */
export const sizeLabel = (grams) => (grams >= 1000 ? `${grams / 1000} kg` : `${grams} g`);

/** "250 g, 500 g and 1 kg" — for copy that lists every size we sell. */
export function sizesSentence() {
  const labels = SIZES.map(sizeLabel);
  return labels.length > 1 ? `${labels.slice(0, -1).join(', ')} and ${labels.at(-1)}` : labels[0];
}
