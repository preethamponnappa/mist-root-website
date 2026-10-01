/**
 * Every fact about the business lives here, and nowhere else.
 *
 * Before this file existed the same details were written out by hand on five
 * different pages and had already drifted apart — three different harvest
 * windows, a cupping session that does not run. Pages import from here so a
 * correction only ever has to be made once.
 *
 * Keep it plain data with no imports: `scripts/prerender.mjs` loads it directly
 * in Node to build the JSON-LD and the sitemap, so it must stay free of JSX and
 * asset imports.
 *
 * Nothing in this file may be changed without a corresponding change to the
 * facts sheet it came from.
 */

export const BUSINESS = {
  /** The registered trading name. Used for the organisation in structured data. */
  name: 'MistRoot Coffee Club',
  /** How the brand is written in running text and page titles. */
  brand: 'MistRoot Coffee',
  /** Spellings people search for. */
  alternateNames: ['Mist Root Coffee', 'MistRoot'],

  email: 'mistrootcoffeeclub@gmail.com',
  /** E.164, for tel: links and structured data. */
  phone: '+917022919007',
  phoneDisplay: '+91 70229 19007',
  /** wa.me wants the number with no plus and no spaces. */
  whatsapp: '917022919007',

  /** The one sentence used wherever the estate's location is described. */
  location: 'Brahmagiri Range, Kodagu (Coorg)',
  address: {
    street: 'MistRoot Estate',
    locality: 'Brahmagiri Range, Kodagu (Coorg)',
    region: 'Karnataka',
    postalCode: '571 247',
    postalCodeCompact: '571247',
    country: 'India',
    countryCode: 'IN',
  },
  geo: { latitude: 12.3833, longitude: 75.5167 },
  geoDisplay: '12.3833° N, 75.5167° E',
  elevation: '800–1,200 m',

  /** Driving time to the estate. */
  driveTimes: [
    { from: 'Bengaluru', duration: '6 hours' },
    { from: 'Mysuru', duration: '4 hours' },
    { from: 'Madikeri', duration: '1 hour' },
  ],

  hours: {
    days: 'Thursday – Sunday',
    short: 'Thu – Sun',
    opens: '08:00',
    closes: '17:00',
    /** Schema.org day codes for openingHoursSpecification. */
    dayCodes: ['Thursday', 'Friday', 'Saturday', 'Sunday'],
    closure: 'Closed through heavy monsoon (Jun–Jul)',
  },

  /** When cherries are picked. */
  harvest: { months: 'December and January', short: 'Dec – Jan' },
  /** The window the bean-to-cup experience runs in. */
  beanToCup: { months: 'December to March', short: 'Dec – Mar' },

  founded: '1940s',
  generations: 'Three',

  /** Named in the facts sheet, oldest first. */
  family: [
    { name: 'A.C. Ponnappa', relation: 'Grandfather', generation: 'First' },
    { name: 'A.P. Ganapathy', relation: 'Father', generation: 'Second' },
    { name: 'A.G. Chethan Chinnappa', relation: 'Son', generation: 'Third' },
    { name: 'A.G. Preetham Ponnappa', relation: 'Son', generation: 'Third' },
  ],

  /** Only profiles that actually exist. Feeds sameAs in the structured data. */
  socials: [{ label: 'Instagram', url: 'https://www.instagram.com/mistrootcoffee/' }],
};

/** `tel:` href. */
export const telHref = `tel:${BUSINESS.phone}`;
/** `mailto:` href. */
export const mailtoHref = `mailto:${BUSINESS.email}`;

/** Google Maps directions to the estate. */
export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${BUSINESS.geo.latitude},${BUSINESS.geo.longitude}`;
/** Embeddable map centred on the estate. The `output=embed` form needs no API key. */
export const mapEmbedUrl = `https://www.google.com/maps?q=${BUSINESS.geo.latitude},${BUSINESS.geo.longitude}&z=12&output=embed`;

/**
 * The lineup, as sold. Every field here is a claim we make to a customer, so
 * none of it is inferred — name, variety, process, roast, weight and price all
 * come straight from the facts sheet.
 */
export const COFFEES = [
  {
    id: 'highland-reserve',
    no: '01',
    name: 'MistRoot Highland Reserve',
    variety: 'Arabica AAA',
    process: 'Natural',
    roast: 'Medium',
    weight: '250 g',
    weightGrams: 250,
    price: 600,
  },
  {
    id: 'highland-arabica',
    no: '02',
    name: 'MistRoot Highland Arabica',
    variety: 'Arabica AA',
    process: 'Natural',
    roast: 'Medium',
    weight: '250 g',
    weightGrams: 250,
    price: 500,
  },
  {
    id: 'forest-reserve',
    no: '03',
    name: 'MistRoot Forest Reserve',
    variety: 'Robusta AAA',
    process: 'Natural',
    roast: 'Medium',
    weight: '250 g',
    weightGrams: 250,
    price: 600,
  },
  {
    id: 'estate-robusta',
    no: '04',
    name: 'MistRoot Estate Robusta',
    variety: 'Robusta AA',
    process: 'Natural',
    roast: 'Medium',
    weight: '250 g',
    weightGrams: 250,
    price: 500,
  },
];

/**
 * What we run and when. Names live here because they appear on the experiences
 * page, in the booking links and in llms.txt, and must read the same in all
 * three. Everything else about each one — duration, group size, price — stays
 * with the editorial copy on the page.
 */
export const EXPERIENCES = [
  { id: 'popup', name: 'Pop-Ups & Brew Sessions', season: 'Announced monthly' },
  { id: 'walk', name: 'Estate Walks', season: 'Year round' },
  { id: 'harvest', name: 'Harvest Experience', season: 'December and January' },
  { id: 'bean', name: 'Bean-to-Cup Journey', season: 'December to March' },
];

export const experienceById = (id) => EXPERIENCES.find((x) => x.id === id);

export const CURRENCY = 'INR';
/** Rupee amounts are written with a thin space after the symbol nowhere else. */
export const formatPrice = (amount) => `₹${amount.toLocaleString('en-IN')}`;

/** Look a coffee up by id; used by the brewing pairings. */
export const coffeeById = (id) => COFFEES.find((c) => c.id === id);

/**
 * Pre-filled WhatsApp order link. Ordering runs through WhatsApp until there is
 * a real checkout, so this is the buy button.
 */
export function whatsappOrderUrl(coffee, grind = 'Whole bean') {
  const message = [
    `Hello ${BUSINESS.name},`,
    '',
    `I would like to order ${coffee.name}.`,
    `Weight: ${coffee.weight}`,
    `Grind: ${grind}`,
    `Price: ${formatPrice(coffee.price)}`,
  ].join('\n');
  return `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** Pre-filled WhatsApp enquiry that is not about a specific coffee. */
export function whatsappEnquiryUrl(subject) {
  const message = `Hello ${BUSINESS.name}, I would like to ask about ${subject}.`;
  return `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(message)}`;
}
