/**
 * Checkout field rules, shared by the checkout form (for instant feedback) and
 * the checkout function (which is the one that counts). Keeping them in one
 * place means the form can never accept something the server then rejects.
 *
 * Plain JS, no imports: loaded by Vite and by Node.
 */

/** States and union territories, as a customer would pick them. */
export const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export const CHECKOUT_FIELDS = ['name', 'email', 'phone', 'line1', 'line2', 'city', 'state', 'pincode'];

const clean = (value) => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '');

/** Ten digits starting 6–9, after dropping spaces, dashes, a +91/91 or a leading 0. */
export function normalisePhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  const local = digits.length === 12 && digits.startsWith('91') ? digits.slice(2)
    : digits.length === 11 && digits.startsWith('0') ? digits.slice(1)
    : digits;
  return /^[6-9]\d{9}$/.test(local) ? local : null;
}

/**
 * @param {Record<string, unknown>} input
 * @returns {{ value: { name: string, email: string, phone: string,
 *   address: { line1: string, line2: string, city: string, state: string, pincode: string, country: 'IN' } },
 *   errors: Record<string, string> }}
 */
export function validateCheckout(input = {}) {
  const errors = {};
  const name = clean(input.name);
  const email = clean(input.email).toLowerCase();
  const phone = normalisePhone(input.phone);
  const line1 = clean(input.line1);
  const line2 = clean(input.line2);
  const city = clean(input.city);
  const state = clean(input.state);
  const pincode = clean(input.pincode).replace(/\s/g, '');

  if (name.length < 2 || name.length > 80) errors.name = 'Your full name, please.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 120) {
    errors.email = 'An email address we can send the receipt to.';
  }
  if (!phone) errors.phone = 'A 10-digit Indian mobile number, for the courier.';
  if (line1.length < 4 || line1.length > 120) errors.line1 = 'House, street and area.';
  if (line2.length > 120) errors.line2 = 'Keep this to 120 characters.';
  if (city.length < 2 || city.length > 60) errors.city = 'Town or city.';
  if (!INDIAN_STATES.includes(state)) errors.state = 'Choose a state.';
  if (!/^[1-9]\d{5}$/.test(pincode)) errors.pincode = 'A 6-digit PIN code.';

  return {
    value: {
      name,
      email,
      phone: phone ?? '',
      address: { line1, line2, city, state, pincode, country: 'IN' },
    },
    errors,
  };
}
