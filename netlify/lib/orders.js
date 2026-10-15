/**
 * Order helpers shared by the functions. The database is the record; these
 * are the queries and shapes every function agrees on.
 */
import { randomBytes } from 'node:crypto';
import { query, transaction } from './db.js';

/**
 * The id customers see in /order/<id>. 128 random bits, URL-safe — the only
 * thing protecting an order page, so it must stay unguessable.
 */
export const newPublicId = () => randomBytes(16).toString('base64url');

export const isPublicId = (value) => typeof value === 'string' && /^[A-Za-z0-9_-]{22}$/.test(value);

export async function findOrderByPublicId(log, publicId) {
  const rows = await query(
    log,
    'orders.by_public_id',
    `select id, public_id, status, name, email, phone, shipping_address,
            subtotal_paise, shipping_paise, total_paise, currency,
            razorpay_order_id, created_at, paid_at
       from orders where public_id = $1`,
    [publicId],
  );
  return rows[0] ?? null;
}

export async function findOrderByRazorpayOrderId(log, razorpayOrderId) {
  const rows = await query(
    log,
    'orders.by_razorpay_id',
    `select id, public_id, status, total_paise, currency from orders where razorpay_order_id = $1`,
    [razorpayOrderId],
  );
  return rows[0] ?? null;
}

/**
 * Record a successful payment and move the order to paid, exactly once.
 *
 * Every statement is idempotent: the payment insert is keyed on Razorpay's
 * payment id, the status update only moves forward from an unpaid state, and
 * the fulfilment job is keyed on the order. So the browser's verify call and
 * the webhook can both run this, in either order, any number of times.
 */
export function markPaid(log, { orderId, razorpayOrderId, razorpayPaymentId, amountPaise, status, method, source, eventId, eventType }) {
  return transaction(log, 'orders.mark_paid', (txn) => [
    ...(eventId
      ? [
          txn.query(
            `insert into webhook_events (event_id, event_type, order_id) values ($1, $2, $3)
             on conflict (event_id) do nothing`,
            [eventId, eventType ?? source, orderId],
          ),
        ]
      : []),
    txn.query(
      // `status` is what the source actually knows: 'verified' from the
      // browser's signature, 'captured' from Razorpay's webhook. A later
      // 'captured' upgrades a 'verified' row; nothing downgrades a capture.
      `insert into payments (order_id, razorpay_payment_id, razorpay_order_id, amount_paise, status, method, source)
       values ($1, $2, $3, $4, $5, $6, $7)
       on conflict (razorpay_payment_id) do update
         set status = case when payments.status = 'captured' then 'captured' else excluded.status end,
             method = coalesce(excluded.method, payments.method)`,
      [orderId, razorpayPaymentId, razorpayOrderId, amountPaise, status, method ?? null, source],
    ),
    txn.query(
      `update orders set status = 'paid', paid_at = coalesce(paid_at, now()), updated_at = now()
        where id = $1 and status in ('pending_payment', 'payment_failed')`,
      [orderId],
    ),
    txn.query(
      `insert into fulfilment_jobs (order_id, step) values ($1, 'create_shipment')
       on conflict (order_id) do nothing`,
      [orderId],
    ),
  ]);
}
