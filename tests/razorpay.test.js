import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { safeEqualHex, verifyPaymentSignature, verifyWebhookSignature } from '../netlify/lib/razorpay.js';

const SECRET = 'test_secret_not_real';
const sign = (payload) => createHmac('sha256', SECRET).update(payload).digest('hex');

test('accepts a correct checkout signature', () => {
  const signature = sign('order_ABC|pay_XYZ');
  assert.equal(
    verifyPaymentSignature({ razorpayOrderId: 'order_ABC', razorpayPaymentId: 'pay_XYZ', signature }, SECRET),
    true,
  );
});

test('rejects a signature for a different order or payment', () => {
  const signature = sign('order_ABC|pay_XYZ');
  assert.equal(
    verifyPaymentSignature({ razorpayOrderId: 'order_OTHER', razorpayPaymentId: 'pay_XYZ', signature }, SECRET),
    false,
  );
  assert.equal(
    verifyPaymentSignature({ razorpayOrderId: 'order_ABC', razorpayPaymentId: 'pay_OTHER', signature }, SECRET),
    false,
  );
});

test('verifies the webhook signature over the exact raw body', () => {
  const body = '{"event":"payment.captured","payload":{}}';
  assert.equal(verifyWebhookSignature(body, sign(body), SECRET), true);
  // Re-serialising changes the bytes, so it must fail — always verify the raw text.
  assert.equal(verifyWebhookSignature(JSON.stringify(JSON.parse(body), null, 1), sign(body), SECRET), false);
});

test('rejects missing, non-hex and wrong-length signatures', () => {
  const expected = sign('x');
  assert.equal(safeEqualHex(expected, undefined), false);
  assert.equal(safeEqualHex(expected, null), false);
  assert.equal(safeEqualHex(expected, 'not hex!'), false);
  assert.equal(safeEqualHex(expected, expected.slice(0, 10)), false);
  assert.equal(safeEqualHex(expected, expected), true);
});
