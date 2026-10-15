/**
 * POST /api/payments/verify — called by the checkout page from Razorpay's
 * success handler, so the customer sees "paid" straight away.
 *
 * Body: { orderPublicId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
 * 200:  { orderPublicId, status }
 *
 * The webhook is the source of truth for payment status; this is the fast
 * path. Both call markPaid, which is idempotent, so they can arrive in either
 * order.
 */
import { findOrderByPublicId, isPublicId, markPaid } from '../lib/orders.js';
import { verifyPaymentSignature } from '../lib/razorpay.js';
import { ClientError, handler, json, readJson } from '../lib/respond.js';

export default handler(['POST'], async (req, { log, requestId }) => {
  const body = await readJson(req);
  const { orderPublicId, razorpay_order_id: razorpayOrderId, razorpay_payment_id: razorpayPaymentId } = body;

  if (!isPublicId(orderPublicId) || typeof razorpayOrderId !== 'string' || typeof razorpayPaymentId !== 'string') {
    throw new ClientError(400, 'bad_request', 'Missing payment details.');
  }

  const order = await findOrderByPublicId(log, orderPublicId);
  if (!order) throw new ClientError(404, 'not_found', 'Order not found.');
  const orderLog = log.child({ orderId: order.id, orderPublicId });

  // The signature binds this payment to *our* Razorpay order for this order,
  // so a valid signature for some other order cannot mark this one paid.
  const valid =
    order.razorpay_order_id === razorpayOrderId &&
    verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, signature: body.razorpay_signature });

  if (!valid) {
    orderLog.warn('payment_signature_invalid', { razorpayOrderId, razorpayPaymentId });
    throw new ClientError(400, 'signature_invalid', 'We could not confirm that payment.');
  }

  await markPaid(orderLog, {
    orderId: order.id,
    razorpayOrderId,
    razorpayPaymentId,
    amountPaise: order.total_paise,
    status: 'verified',
    source: 'checkout_handler',
  });
  orderLog.info('payment_verified', { razorpayPaymentId });

  return json(200, { orderPublicId, status: 'paid' }, requestId);
});

export const config = { path: '/api/payments/verify' };
