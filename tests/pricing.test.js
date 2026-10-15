import { test } from 'node:test';
import assert from 'node:assert/strict';
import { priceCart, shippingFor, toFreeShipping } from '../shared/pricing.js';
import { MAX_QUANTITY_PER_LINE, SHIPPING, lookupSku } from '../shared/catalog.js';

const price = (sku) => lookupSku(sku).variant.pricePaise;

test('prices a cart from the catalogue, in integer paise', () => {
  const cart = priceCart([{ sku: 'MR-HR-250-WB', quantity: 2 }]);
  assert.deepEqual(cart.errors, []);
  assert.equal(cart.items[0].unitPricePaise, price('MR-HR-250-WB'));
  assert.equal(cart.subtotalPaise, 2 * price('MR-HR-250-WB'));
  assert.ok(Number.isInteger(cart.totalPaise));
  assert.equal(cart.totalPaise, cart.subtotalPaise + cart.shippingPaise);
});

test('ignores any price the client sends', () => {
  const cart = priceCart([{ sku: 'MR-HR-250-WB', quantity: 1, pricePaise: 1, unitPricePaise: 1 }]);
  assert.equal(cart.items[0].unitPricePaise, price('MR-HR-250-WB'));
});

test('shipping is free only when the subtotal is over ₹999', () => {
  assert.equal(shippingFor(SHIPPING.freeOverPaise), SHIPPING.flatFeePaise); // exactly ₹999: not over
  assert.equal(shippingFor(SHIPPING.freeOverPaise + 1), 0);
  assert.equal(shippingFor(50000), 8000);
  assert.equal(shippingFor(100000), 0);
});

test('free-shipping hint rounds up to whole rupees', () => {
  assert.equal(toFreeShipping(60000), 40000); // needs ₹399.01, shown as ₹400
  assert.equal(toFreeShipping(100000), 0);
});

test('merges repeated SKUs and caps quantity per line', () => {
  const ok = priceCart([
    { sku: 'MR-ER-500-ES', quantity: 3 },
    { sku: 'MR-ER-500-ES', quantity: 2 },
  ]);
  assert.equal(ok.items.length, 1);
  assert.equal(ok.items[0].quantity, 5);

  const over = priceCart([{ sku: 'MR-ER-500-ES', quantity: MAX_QUANTITY_PER_LINE + 1 }]);
  assert.equal(over.items.length, 0);
  assert.equal(over.errors.length, 1);
});

test('rejects unknown SKUs and bad quantities', () => {
  for (const line of [
    { sku: 'MR-XX-250-WB', quantity: 1 },
    { sku: 'MR-HR-250-WB', quantity: 0 },
    { sku: 'MR-HR-250-WB', quantity: 1.5 },
    { sku: 'MR-HR-250-WB', quantity: '2' },
    { quantity: 1 },
  ]) {
    const cart = priceCart([line]);
    assert.equal(cart.items.length, 0, JSON.stringify(line));
    assert.ok(cart.errors.length > 0, JSON.stringify(line));
    assert.equal(cart.totalPaise, 0);
  }
  assert.ok(priceCart('nope').errors.length > 0);
});

test('an empty cart costs nothing, shipping included', () => {
  const cart = priceCart([]);
  assert.equal(cart.totalPaise, 0);
  assert.equal(cart.shippingPaise, 0);
});
