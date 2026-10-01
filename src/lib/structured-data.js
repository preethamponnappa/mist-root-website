/**
 * JSON-LD, built from the same facts the pages render.
 *
 * Structured data that disagrees with the visible page is worse than none at
 * all, so every value here comes from src/data/business.js rather than being
 * written out again. `scripts/prerender.mjs` calls this and puts the result in
 * the head of each static file, which is where crawlers look.
 *
 * Extensions are included in the import paths: this is loaded directly in Node
 * by the build, which does not resolve extensionless specifiers.
 */
import { BUSINESS, COFFEES } from '../data/business.js';
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

/**
 * One Product per coffee.
 *
 * No aggregateRating: there are no reviews on the page, and inventing them
 * would be both false and a manual-action risk. `availability` is stated as in
 * stock because there is no stock system to read — if a lot sells out, this is
 * the line to change.
 */
export function productFor(coffee) {
  return {
    '@type': 'Product',
    '@id': `${canonicalFor('/club')}#${coffee.id}`,
    name: coffee.name,
    description: `${coffee.variety}, ${coffee.process.toLowerCase()} processed, ${coffee.roast.toLowerCase()} roast. ${coffee.weight} grown in the ${BUSINESS.location}.`,
    brand: { '@type': 'Brand', name: BUSINESS.name },
    category: 'Coffee',
    weight: {
      '@type': 'QuantitativeValue',
      value: coffee.weightGrams,
      unitCode: 'GRM',
    },
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Variety', value: coffee.variety },
      { '@type': 'PropertyValue', name: 'Process', value: coffee.process },
      { '@type': 'PropertyValue', name: 'Roast', value: coffee.roast },
    ],
    offers: {
      '@type': 'Offer',
      url: `${canonicalFor('/club')}#${coffee.id}`,
      price: String(coffee.price),
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      seller: { '@id': ORGANISATION_ID },
    },
  };
}

/**
 * Everything a given route should declare, as one @graph. A single block per
 * page keeps the @id references resolvable.
 */
export function structuredDataFor(routePath) {
  const graph = [organisation, website];

  if (routePath === '/contact') graph.push(localBusiness);
  if (routePath === '/club') graph.push(...COFFEES.map(productFor));

  return { '@context': 'https://schema.org', '@graph': graph };
}
