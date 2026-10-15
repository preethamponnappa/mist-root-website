/**
 * Razorpay Standard Checkout, server side: create orders, and verify the two
 * kinds of signature Razorpay sends back. Uses the REST API through the
 * shared HTTP helper rather than the SDK, so timeouts, retries and logging are
 * the same as for every other external call.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import { request } from './http.js';
import { requireEnv } from './env.js';

const API = 'https://api.razorpay.com/v1';

/** Public — the browser needs it to open the checkout modal. */
export const razorpayKeyId = () => requireEnv('RAZORPAY_KEY_ID');

function authHeader() {
  const credentials = `${requireEnv('RAZORPAY_KEY_ID')}:${requireEnv('RAZORPAY_KEY_SECRET')}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
}

/**
 * Create the Razorpay order a payment will be attached to. The amount comes
 * from the server's own pricing of the cart, never from the browser.
 */
export async function createRazorpayOrder({ amountPaise, receipt, notes, log }) {
  const { data } = await request({
    service: 'razorpay',
    op: 'orders.create',
    url: `${API}/orders`,
    method: 'POST',
    headers: { Authorization: authHeader() },
    json: { amount: amountPaise, currency: 'INR', receipt, notes },
    timeoutMs: 4000,
    retries: 1,
    // Retry-safe: if a timed-out attempt did create an order, the retry makes
    // a second one. Only the id we store and hand to the browser can ever be
    // paid; the other expires unpaid and costs nothing.
    retrySafe: true,
    log,
  });

  if (!data?.id || data.amount !== amountPaise || data.currency !== 'INR') {
    throw new Error('Razorpay returned an order that does not match the request');
  }
  return data;
}

export function hmacHex(secret, payload) {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

/** Constant-time comparison of two hex strings. */
export function safeEqualHex(expected, received) {
  if (typeof received !== 'string' || !/^[0-9a-f]+$/i.test(received)) return false;
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(received, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

/** The signature the checkout modal returns: HMAC(order_id|payment_id, key secret). */
export function verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, signature }, secret = requireEnv('RAZORPAY_KEY_SECRET')) {
  return safeEqualHex(hmacHex(secret, `${razorpayOrderId}|${razorpayPaymentId}`), signature);
}

/** The webhook signature: HMAC of the exact raw body, with the webhook secret. */
export function verifyWebhookSignature(rawBody, signature, secret = requireEnv('RAZORPAY_WEBHOOK_SECRET')) {
  return safeEqualHex(hmacHex(secret, rawBody), signature);
}
