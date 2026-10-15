/**
 * Prices a cart. One function, run in two places:
 *  - in the browser, to show the cart drawer's running total (display only);
 *  - in the Netlify Functions, where its result is the amount actually charged.
 *
 * The browser's figure is never sent anywhere. The server receives only
 * `{ sku, quantity }` lines and calls this itself, so a tampered client can
 * change what it displays but not what it pays.
 *
 * Plain JS, no imports beyond the catalogue: loaded by Vite and by Node.
 */
import { MAX_QUANTITY_PER_LINE, SHIPPING, grindById, lookupSku } from './catalog.js';

/** Most distinct lines one order may hold. Generous; it only stops abuse. */
export const MAX_LINES = 20;

/** Shipping for a subtotal: free over the threshold, otherwise the flat fee. */
export const shippingFor = (subtotalPaise) =>
  subtotalPaise > SHIPPING.freeOverPaise ? 0 : SHIPPING.flatFeePaise;

/**
 * How much more would make shipping free, rounded up to whole rupees (prices
 * are whole rupees, so "₹400 more", not "₹399.01"); 0 once it already is.
 */
export const toFreeShipping = (subtotalPaise) => {
  const short = SHIPPING.freeOverPaise + 1 - subtotalPaise;
  return short > 0 ? Math.ceil(short / 100) * 100 : 0;
};

/**
 * @param {unknown} lines  `[{ sku, quantity }]` from wherever — trusted by nobody
 * @returns {{
 *   items: Array<{ sku: string, slug: string, name: string, sizeGrams: number,
 *     grind: string, grindLabel: string, quantity: number,
 *     unitPricePaise: number, lineTotalPaise: number }>,
 *   subtotalPaise: number, shippingPaise: number, totalPaise: number,
 *   errors: string[] }}
 *
 * Unknown, inactive or out-of-stock SKUs and bad quantities are reported in
 * `errors` and left out of the totals. Callers that charge money must refuse
 * to proceed when `errors` is non-empty or `items` is empty.
 */
export function priceCart(lines) {
  const errors = [];
  if (!Array.isArray(lines)) {
    return { items: [], subtotalPaise: 0, shippingPaise: 0, totalPaise: 0, errors: ['Cart must be a list.'] };
  }
  if (lines.length > MAX_LINES) errors.push(`At most ${MAX_LINES} different items per order.`);

  // Merge repeated SKUs before checking the per-line cap.
  const merged = new Map();
  for (const line of lines.slice(0, MAX_LINES)) {
    const sku = typeof line?.sku === 'string' ? line.sku : '';
    const quantity = line?.quantity;
    if (!Number.isInteger(quantity) || quantity < 1) {
      errors.push(`Invalid quantity for ${sku || 'an item'}.`);
      continue;
    }
    merged.set(sku, (merged.get(sku) ?? 0) + quantity);
  }

  const items = [];
  for (const [sku, quantity] of merged) {
    const found = lookupSku(sku);
    if (!found) {
      errors.push(`Unknown item ${sku || '(blank)'}.`);
      continue;
    }
    const { product, variant } = found;
    if (!product.isActive || !variant.inStock) {
      errors.push(`${product.name} (${sku}) is not available right now.`);
      continue;
    }
    if (quantity > MAX_QUANTITY_PER_LINE) {
      errors.push(`At most ${MAX_QUANTITY_PER_LINE} of ${product.name} in one size and grind.`);
      continue;
    }
    items.push({
      sku,
      slug: product.slug,
      name: product.name,
      sizeGrams: variant.sizeGrams,
      grind: variant.grind,
      grindLabel: grindById(variant.grind).label,
      quantity,
      unitPricePaise: variant.pricePaise,
      lineTotalPaise: variant.pricePaise * quantity,
    });
  }

  const subtotalPaise = items.reduce((sum, item) => sum + item.lineTotalPaise, 0);
  const shippingPaise = items.length ? shippingFor(subtotalPaise) : 0;
  return { items, subtotalPaise, shippingPaise, totalPaise: subtotalPaise + shippingPaise, errors };
}
