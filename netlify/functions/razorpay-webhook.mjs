/**
 * POST /api/webhooks/razorpay — Razorpay's server-to-server notifications.
 * The source of truth for whether an order is paid.
 *
 * Configure in the Razorpay dashboard with the secret in
 * RAZORPAY_WEBHOOK_SECRET and the events payment.captured, payment.failed and
 * order.paid.
 *
 * Rules: verify the signature over the exact raw body before anything else;
 * never mark paid unless the amount and currency match the order we stored;
 * record and return quickly (Razorpay retries anything slow or non-2xx); be
 * idempotent, because Razorpay delivers at least once.
 */
import { createHash } from 'node:crypto';
import { query } from '../lib/db.js';
import { findOrderByRazorpayOrderId, markPaid } from '../lib/orders.js';
import { verifyWebhookSignature } from '../lib/razorpay.js';
import { handler, json, readText } from '../lib/respond.js';

export default handler(['POST'], async (req, { log, requestId }) => {
  const raw = await readText(req);

  if (!verifyWebhookSignature(raw, req.headers.get('x-razorpay-signature'))) {
    log.warn('webhook_signature_invalid');
    return json(401, { error: 'signature_invalid' }, requestId);
  }

  const event = JSON.parse(raw);
  // Razorpay sends a unique id per event; fall back to a hash of the body.
  const eventId = req.headers.get('x-razorpay-event-id') ?? createHash('sha256').update(raw).digest('hex');
  const payment = event.payload?.payment?.entity;
  const eventLog = log.child({ eventId, event: event.event, razorpayOrderId: payment?.order_id });

  if (!payment?.order_id) {
    eventLog.info('webhook_ignored', { reason: 'no payment entity' });
    return json(200, { ok: true }, requestId);
  }

  const order = await findOrderByRazorpayOrderId(eventLog, payment.order_id);
  if (!order) {
    // Not one of ours (another integration on the same account), or a test.
    eventLog.warn('webhook_unknown_order');
    return json(200, { ok: true }, requestId);
  }
  const orderLog = eventLog.child({ orderId: order.id, orderPublicId: order.public_id });

  switch (event.event) {
    case 'payment.captured':
    case 'order.paid': {
      if (payment.amount !== order.total_paise || payment.currency !== order.currency) {
        // Should be impossible — the Razorpay order carried our amount. Never
        // mark paid on a mismatch; this needs a human.
        orderLog.error('webhook_amount_mismatch', {
          expectedPaise: order.total_paise,
          receivedPaise: payment.amount,
          currency: payment.currency,
        });
        return json(200, { ok: true }, requestId);
      }
      await markPaid(orderLog, {
        orderId: order.id,
        razorpayOrderId: payment.order_id,
        razorpayPaymentId: payment.id,
        amountPaise: payment.amount,
        status: payment.status === 'captured' ? 'captured' : 'verified',
        method: payment.method,
        source: 'webhook',
        eventId,
        eventType: event.event,
      });
      orderLog.info('webhook_paid', { razorpayPaymentId: payment.id });
      break;
    }

    case 'payment.failed': {
      await query(orderLog, 'orders.payment_failed',
        `with event as (
           insert into webhook_events (event_id, event_type, order_id) values ($1, $2, $3)
           on conflict (event_id) do nothing returning 1
         ), payment as (
           insert into payments (order_id, razorpay_payment_id, razorpay_order_id, amount_paise, status, method, source)
           values ($3, $4, $5, $6, 'failed', $7, 'webhook')
           on conflict (razorpay_payment_id) do nothing returning 1
         )
         update orders set status = 'payment_failed', updated_at = now()
          where id = $3 and status = 'pending_payment'`,
        [eventId, event.event, order.id, payment.id, payment.order_id, payment.amount, payment.method ?? null]);
      orderLog.info('webhook_payment_failed', {
        razorpayPaymentId: payment.id,
        errorCode: payment.error_code,
        errorReason: payment.error_reason,
      });
      break;
    }

    default:
      orderLog.info('webhook_ignored', { reason: 'unhandled event' });
  }

  return json(200, { ok: true }, requestId);
});

export const config = { path: '/api/webhooks/razorpay' };
