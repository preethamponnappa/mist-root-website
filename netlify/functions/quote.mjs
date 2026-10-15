/**
 * POST /api/quote — price a cart. The checkout page shows these totals; the
 * checkout function computes them again rather than trusting them.
 *
 * Body: { lines: [{ sku, quantity }] }
 * 200:  { items, subtotalPaise, shippingPaise, totalPaise, errors }
 */
import { priceCart } from '../../shared/pricing.js';
import { handler, json, readJson } from '../lib/respond.js';

export default handler(['POST'], async (req, { requestId }) => {
  const body = await readJson(req);
  return json(200, priceCart(body.lines), requestId);
});

export const config = { path: '/api/quote' };
