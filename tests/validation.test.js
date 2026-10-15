import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalisePhone, validateCheckout } from '../shared/validation.js';

const good = {
  name: '  Asha   Rao ',
  email: 'Asha@Example.com',
  phone: '+91 98450 12345',
  line1: '12, 3rd Cross, Indiranagar',
  line2: '',
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '560038',
};

test('accepts a valid customer and normalises it', () => {
  const { value, errors } = validateCheckout(good);
  assert.deepEqual(errors, {});
  assert.equal(value.name, 'Asha Rao');
  assert.equal(value.email, 'asha@example.com');
  assert.equal(value.phone, '9845012345');
  assert.equal(value.address.country, 'IN');
});

test('normalises Indian mobile numbers', () => {
  assert.equal(normalisePhone('09845012345'), '9845012345');
  assert.equal(normalisePhone('919845012345'), '9845012345');
  assert.equal(normalisePhone('98450-12345'), '9845012345');
  assert.equal(normalisePhone('5845012345'), null); // must start 6–9
  assert.equal(normalisePhone('12345'), null);
});

test('flags each bad field', () => {
  const { errors } = validateCheckout({
    ...good,
    email: 'nope',
    pincode: '056003',
    state: 'Atlantis',
    phone: '123',
  });
  assert.deepEqual(Object.keys(errors).sort(), ['email', 'phone', 'pincode', 'state']);
});

test('survives missing input', () => {
  const { errors } = validateCheckout(undefined);
  assert.ok(errors.name && errors.email && errors.pincode);
});
