/**
 * JSON-LD, built from the same facts the pages render.
 *
 * Structured data that disagrees with the visible page is worse than none at
 * all, so every value here comes from src/data/business.js and
 * shared/catalog.js rather than being written out again. `scripts/prerender.mjs` calls this and puts the result in
 * the head of each static file, which is where crawlers look.
 *
 * Extensions are included in the import paths: this is loaded directly in Node
 * by the build, which does not resolve extensionless specifiers.
 */
import { BUSINESS } from '../data/business.js';
import {
  CURRENCY,
  SIZES,
  activeProducts,
  paiseToDecimal,
  productBySlug,
  sizeLabel,
} from '../../shared/catalog.js';
import { SITE, canonicalFor } from './seo.js';

const ORGANISATION_ID = `${SITE.origin}/#organisation`;
const WEBSITE_ID = `${SITE.origin}/#website`;

const sameAs = BUSINESS.socials.map((s) => s.url);

const postalAddress = {
  '@type': 'PostalAddress',
  streetAddress: BUSINESS.address.street,
  addressLocality: BUSINESS.address.locality,
  addressRegion: BUSINESS.address.region,
  postalCode: BUSINESS.address.postalCodeCompact,
  addressCountry: BUSINESS.address.countryCode,
};

const geoCoordinates = {
  '@type': 'GeoCoordinates',
  latitude: BUSINESS.geo.latitude,
  longitude: BUSINESS.geo.longitude,
};

/** Who we are. Referenced by @id from the other blocks so nothing is repeated. */
export const organisation = {
  '@type': 'Organization',
  '@id': ORGANISATION_ID,
  name: BUSINESS.name,
  alternateName: BUSINESS.alternateNames,
  url: `${SITE.origin}/`,
  logo: `${SITE.origin}/apple-touch-icon.png`,
  image: `${SITE.origin}${SITE.ogImage}`,
  email: BUSINESS.email,
  telephone: BUSINESS.phone,
  address: postalAddress,
  foundingDate: '1940',
  sameAs,
};

export const website = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: BUSINESS.name,
  url: `${SITE.origin}/`,
  inLanguage: SITE.lang,
  publisher: { '@id': ORGANISATION_ID },
};

/**
 * The estate as a place you can visit. Same name as everywhere else, so Google
 * can tie it to the organisation rather than treating it as a second business.
 */
export const localBusiness = {
  '@type': 'LocalBusiness',
  '@id': `${SITE.origin}/#estate`,
  name: BUSINESS.name,
  parentOrganization: { '@id': ORGANISATION_ID },
  url: canonicalFor('/contact'),
  image: `${SITE.origin}${SITE.ogImage}`,
  email: BUSINESS.email,
  telephone: BUSINESS.phone,
  address: postalAddress,
  geo: geoCoordinates,
  hasMap: `https://www.google.com/maps/search/?api=1&query=${BUSINESS.geo.latitude},${BUSINESS.geo.longitude}`,
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: BUSINESS.hours.dayCodes,
      opens: BUSINESS.hours.opens,
      closes: BUSINESS.hours.closes,
    },
  ],
  sameAs,
};

const shopUrl = (product) => canonicalFor(`/shop/${product.slug}`);
const imageUrls = (product) => product.images.map((image) => `${SITE.origin}${image.src}`);

/**
 * One ProductGroup per coffee, varying by size — the shape Google documents for
 * products sold in variants. Each size is a Product with its own Offer. Grind
 * is not modelled as a variant: it is done to order, never changes the price,
 * and is not one of the properties `variesBy` accepts.
 *
 * Each Offer URL carries `?size=`, which the product page reads to preselect
 * that size, so the price on the landing page matches the price declared here.
 *
 * No aggregateRating: there are no reviews on the page, and inventing them
 * would be both false and a manual-action risk. Availability comes from the
 * variants' `inStock` flags; there is no live stock system behind it.
 */
export function productGroupFor(product) {
  const url = shopUrl(product);
  const images = imageUrls(product);

  const hasVariant = SIZES.flatMap((sizeGrams) => {
    const options = product.variants.filter((v) => v.sizeGrams === sizeGrams);
    if (options.length === 0) return [];
    const inStock = options.filter((v) => v.inStock);
    const pricePaise = Math.min(...(inStock.length ? inStock : options).map((v) => v.pricePaise));

    return [
      {
        '@type': 'Product',
        '@id': `${url}#${sizeGrams}g`,
        name: `${product.name}, ${sizeLabel(sizeGrams)}`,
        size: sizeLabel(sizeGrams),
        image: images,
        weight: { '@type': 'QuantitativeValue', value: sizeGrams, unitCode: 'GRM' },
        offers: {
          '@type': 'Offer',
          url: `${url}?size=${sizeGrams}`,
          price: paiseToDecimal(pricePaise),
          priceCurrency: CURRENCY,
          availability: inStock.length
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: { '@id': ORGANISATION_ID },
        },
      },
    ];
  });

  return {
    '@type': 'ProductGroup',
    '@id': `${url}#product`,
    name: product.name,
    description: product.description,
    url,
    image: images,
    brand: { '@type': 'Brand', name: BUSINESS.name },
    category: 'Coffee',
    productGroupID: `MR-${product.skuCode}`,
    variesBy: ['https://schema.org/size'],
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Species', value: product.species },
      { '@type': 'PropertyValue', name: 'Grade', value: product.grade },
      { '@type': 'PropertyValue', name: 'Process', value: product.process },
      { '@type': 'PropertyValue', name: 'Roast', value: product.roast },
      { '@type': 'PropertyValue', name: 'Origin', value: product.origin },
      { '@type': 'PropertyValue', name: 'Altitude', value: product.altitude },
      { '@type': 'PropertyValue', name: 'Tasting notes', value: product.tastingNotes.join(', ') },
    ],
    hasVariant,
  };
}

function breadcrumbsFor(product) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.origin}/` },
      { '@type': 'ListItem', position: 2, name: 'Shop', item: canonicalFor('/shop') },
      { '@type': 'ListItem', position: 3, name: product.name, item: shopUrl(product) },
    ],
  };
}

/** The shop index as an ordered list pointing at each product page. */
function shopListing() {
  return {
    '@type': 'ItemList',
    '@id': `${canonicalFor('/shop')}#coffees`,
    itemListElement: activeProducts().map((product, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: shopUrl(product),
      name: product.name,
    })),
  };
}

/**
 * Everything a given route should declare, as one @graph. A single block per
 * page keeps the @id references resolvable.
 */
export function structuredDataFor(routePath) {
  const graph = [organisation, website];

  if (routePath === '/contact') graph.push(localBusiness);
  if (routePath === '/shop') graph.push(shopListing());

  const slug = routePath.startsWith('/shop/') ? routePath.slice('/shop/'.length) : null;
  const product = slug && productBySlug(slug);
  if (product?.isActive) graph.push(productGroupFor(product), breadcrumbsFor(product));

  return { '@context': 'https://schema.org', '@graph': graph };
}
