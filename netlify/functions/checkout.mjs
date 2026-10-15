/**
 * POST /api/checkout — turn a cart and an address into a pending order and a
 * Razorpay order to pay it with.
 *
 * Body: { lines: [{ sku, quantity }], customer: { name, email, phone, line1,
 *         line2, city, state, pincode } }
 * 201:  { orderPublicId, razorpayOrderId, keyId, amountPaise, currency, prefill }
 * 422:  { error: 'cart_invalid' | 'invalid_fields', details }
 *
 * The amount charged is computed here from shared/catalog.js. Nothing the
 * browser says about price is read.
 */
import { priceCart } from '../../shared/pricing.js';
import { validateCheckout } from '../../shared/validation.js';
import { BUSINESS } from '../../src/data/business.js';
import { query, transaction } from '../lib/db.js';
import { newPublicId } from '../lib/orders.js';
import { createRazorpayOrder, razorpayKeyId } from '../lib/razorpay.js';
import { ClientError, handler, json, readJson } from '../lib/respond.js';

export default handler(['POST'], async (req, { log, requestId }) => {
  const body = await readJson(req);

  const cart = priceCart(body.lines);
  if (cart.errors.length || cart.items.length === 0) {
    throw new ClientError(422, 'cart_invalid', 'Some items in your cart cannot be ordered.', {
      errors: cart.errors.length ? cart.errors : ['Your cart is empty.'],
    });
  }

  const { value: customer, errors } = validateCheckout(body.customer);
  if (Object.keys(errors).length) {
    throw new ClientError(422, 'invalid_fields', 'Please check the highlighted fields.', { fields: errors });
  }

  // Fail fast with 503 before writing anything if payments are not configured.
  const keyId = razorpayKeyId();

  const publicId = newPublicId();
  const orderLog = log.child({ orderPublicId: publicId });

  const [[order]] = await transaction(orderLog, 'orders.create', (txn) => [
    txn.query(
      `insert into orders (public_id, name, email, phone, shipping_address,
                           subtotal_paise, shipping_paise, total_paise)
       values ($1, $2, $3, $4, $5, $6, $7, $8)
       returning id`,
      [
        publicId,
        customer.name,
        customer.email,
        customer.phone,
        JSON.stringify(customer.address),
        cart.subtotalPaise,
        cart.shippingPaise,
        cart.totalPaise,
      ],
    ),
    ...cart.items.map((item) =>
      txn.query(
        `insert into order_items (order_id, sku, product_slug, product_name, size_grams, grind,
                                  quantity, unit_price_paise, line_total_paise)
         values ((select id from orders where public_id = $1), $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          publicId,
          item.sku,
          item.slug,
          item.name,
          item.sizeGrams,
          item.grind,
          item.quantity,
          item.unitPricePaise,
          item.lineTotalPaise,
        ],
      ),
    ),
  ]);
  const withOrder = orderLog.child({ orderId: order.id });

  let razorpayOrder;
  try {
    razorpayOrder = await createRazorpayOrder({
      amountPaise: cart.totalPaise,
      receipt: publicId,
      notes: { order_public_id: publicId },
      log: withOrder,
    });
  } catch (error) {
    // No way to pay this order, so close it rather than leave it pending.
    await query(withOrder, 'orders.cancel_unpayable',
      `update orders set status = 'cancelled', updated_at = now() where id = $1 and status = 'pending_payment'`,
      [order.id]);
    withOrder.error('razorpay_order_failed', { error: error.message, status: error.status });
    throw new ClientError(502, 'payment_unavailable', 'We could not start the payment. Please try again in a minute.');
  }

  await query(withOrder, 'orders.attach_razorpay',
    `update orders set razorpay_order_id = $1, updated_at = now() where id = $2`,
    [razorpayOrder.id, order.id]);

  withOrder.info('checkout_created', {
    razorpayOrderId: razorpayOrder.id,
    totalPaise: cart.totalPaise,
    lines: cart.items.length,
  });

  return json(201, {
    orderPublicId: publicId,
    razorpayOrderId: razorpayOrder.id,
    keyId,
    amountPaise: cart.totalPaise,
    currency: 'INR',
    merchantName: BUSINESS.brand,
    prefill: { name: customer.name, email: customer.email, contact: customer.phone },
  }, requestId);
});

export const config = { path: '/api/checkout' };
