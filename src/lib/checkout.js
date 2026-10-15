/**
 * Whether online checkout is switched on for this build.
 *
 * Off by default, so the shop can deploy before Razorpay and the database are
 * configured: with it off, the cart drawer offers to send the whole cart over
 * WhatsApp instead of linking to /checkout. Set VITE_CHECKOUT_ENABLED=true in
 * Netlify (and in .env for `netlify dev`) once the functions' secrets are in
 * place. It is a feature flag, not a secret — VITE_ values are public.
 */
export const CHECKOUT_ENABLED = import.meta.env.VITE_CHECKOUT_ENABLED === 'true';
