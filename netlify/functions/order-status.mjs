/**
 * GET /api/orders/:publicId — what the /order/<id> page shows.
 *
 * The public id is the only key, so the response is deliberately thin: no
 * email, no phone, no street address — just enough for the customer to
 * recognise their order and see where it is.
 */
import { grindById } from '../../shared/catalog.js';
import { query } from '../lib/db.js';
import { findOrderByPublicId, isPublicId } from '../lib/orders.js';
import { ClientError, handler, json } from '../lib/respond.js';

export default handler(['GET'], async (req, { context, log, requestId }) => {
  const publicId = context?.params?.publicId ?? new URL(req.url).pathname.split('/').pop();
  if (!isPublicId(publicId)) throw new ClientError(404, 'not_found', 'Order not found.');

  const order = await findOrderByPublicId(log, publicId);
  if (!order) throw new ClientError(404, 'not_found', 'Order not found.');

  const items = await query(log.child({ orderId: order.id }), 'order_items.by_order',
    `select sku, product_slug, product_name, size_grams, grind, quantity, unit_price_paise, line_total_paise
       from order_items where order_id = $1 order by id`,
    [order.id]);

  const address = order.shipping_address ?? {};
  return json(200, {
    publicId: order.public_id,
    status: order.status,
    createdAt: order.created_at,
    paidAt: order.paid_at,
    firstName: order.name.split(' ')[0],
    shipTo: { city: address.city, state: address.state, pincode: address.pincode },
    items: items.map((item) => ({
      sku: item.sku,
      slug: item.product_slug,
      name: item.product_name,
      sizeGrams: item.size_grams,
      grindLabel: grindById(item.grind)?.label ?? item.grind,
      quantity: item.quantity,
      unitPricePaise: item.unit_price_paise,
      lineTotalPaise: item.line_total_paise,
    })),
    subtotalPaise: order.subtotal_paise,
    shippingPaise: order.shipping_paise,
    totalPaise: order.total_paise,
  }, requestId);
});

export const config = { path: '/api/orders/:publicId' };
