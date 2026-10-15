import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Page from '../components/Page';
import PageHero from '../components/PageHero';
import ButtonLink from '../components/ButtonLink';
import BagArt from '../components/BagArt';
import { ArrowUpRight, Truck } from '../components/Icons';
import { useIsHydrated } from '../lib/hydration';
import { clearCart, useCart } from '../lib/cart';
import { CHECKOUT_ENABLED } from '../lib/checkout';
import { whatsappCartUrl } from '../data/business';
import { SHIPPING, formatPrice, productBySlug, sizeLabel } from '../../shared/catalog';
import { priceCart } from '../../shared/pricing';
import { INDIAN_STATES, validateCheckout } from '../../shared/validation';
import './Checkout.css';

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

const EMPTY_FORM = { name: '', email: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' };

/** Load Razorpay's checkout script once, on demand — only this page needs it. */
let razorpayLoading = null;
function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  razorpayLoading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT;
    script.async = true;
    script.onload = () => (window.Razorpay ? resolve(window.Razorpay) : reject(new Error('Razorpay did not load')));
    script.onerror = () => {
      razorpayLoading = null;
      reject(new Error('Razorpay did not load'));
    };
    document.head.appendChild(script);
  });
  return razorpayLoading;
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

/**
 * The server's pricing of the cart. Shown as the order summary and on the pay
 * button; recomputed again by /api/checkout, which is what Razorpay charges.
 */
function useQuote(lines, enabled) {
  const [quote, setQuote] = useState({ status: 'idle', data: null });
  const key = JSON.stringify(lines);

  useEffect(() => {
    if (!enabled || lines.length === 0) return undefined;
    let cancelled = false;
    postJson('/api/quote', { lines })
      .then(({ ok, data }) => {
        if (!cancelled) setQuote(ok ? { status: 'ready', data } : { status: 'error', data: null });
      })
      .catch(() => !cancelled && setQuote({ status: 'error', data: null }));
    return () => {
      cancelled = true;
    };
    // `key` stands in for `lines`, which is a new array on every cart change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  return quote;
}

function Field({ id, label, optional, error, hint, children }) {
  return (
    <div className="field">
      <label htmlFor={`checkout-${id}`}>
        {label}
        {optional && <span className="field__opt">optional</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="field__hint" id={`hint-${id}`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field__error" id={`err-${id}`}>
          {error}
        </p>
      )}
    </div>
  );
}

export default function Checkout() {
  const hydrated = useIsHydrated();
  const lines = useCart();
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [phase, setPhase] = useState('idle'); // idle | creating | paying | verifying
  const [notice, setNotice] = useState(null);

  const quote = useQuote(lines, CHECKOUT_ENABLED && hydrated);
  // Until the server's quote arrives, show the same shared pricing locally so
  // the page is not empty; the pay button waits for the server's figure.
  const summary = quote.status === 'ready' ? quote.data : priceCart(lines);
  const cartProblems = quote.status === 'ready' ? quote.data.errors : [];

  const inputProps = (id, autoComplete, extra = {}) => ({
    id: `checkout-${id}`,
    name: id,
    autoComplete,
    value: values[id],
    onChange: (e) => setValues((v) => ({ ...v, [id]: e.target.value })),
    onBlur: () => {
      // Re-check a field once it has an error, so the message clears as soon
      // as it is fixed; untouched fields stay quiet until submit.
      if (errors[id]) {
        const next = validateCheckout(values).errors;
        setErrors((current) => ({ ...current, [id]: next[id] }));
      }
    },
    'aria-invalid': Boolean(errors[id]),
    'aria-describedby': errors[id] ? `err-${id}` : extra.hint ? `hint-${id}` : undefined,
    className: errors[id] ? 'has-error' : '',
  });

  const focusFirstError = (fieldErrors) => {
    const first = Object.keys(EMPTY_FORM).find((k) => fieldErrors[k]);
    if (first) formRef.current?.querySelector(`#checkout-${first}`)?.focus();
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (phase !== 'idle') return;
    setNotice(null);

    const { errors: fieldErrors } = validateCheckout(values);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length) {
      focusFirstError(fieldErrors);
      return;
    }

    setPhase('creating');
    let created;
    try {
      created = await postJson('/api/checkout', { lines, customer: values });
    } catch {
      setPhase('idle');
      setNotice({ tone: 'error', text: 'We could not reach the shop. Check your connection and try again.' });
      return;
    }

    if (!created.ok) {
      setPhase('idle');
      const { data } = created;
      if (data.error === 'invalid_fields') {
        setErrors(data.details?.fields ?? {});
        focusFirstError(data.details?.fields ?? {});
      }
      setNotice({
        tone: 'error',
        text: data.error === 'cart_invalid'
          ? `${data.message} ${(data.details?.errors ?? []).join(' ')}`
          : data.message ?? 'Something went wrong. Please try again.',
      });
      return;
    }

    const order = created.data;
    let Razorpay;
    try {
      Razorpay = await loadRazorpay();
    } catch {
      setPhase('idle');
      setNotice({ tone: 'error', text: 'The payment window could not load. Please try again.' });
      return;
    }

    setPhase('paying');
    const checkout = new Razorpay({
      key: order.keyId,
      order_id: order.razorpayOrderId,
      amount: order.amountPaise,
      currency: order.currency,
      name: order.merchantName,
      description: `Order ${order.orderPublicId.slice(0, 8).toUpperCase()}`,
      prefill: order.prefill,
      notes: { order_public_id: order.orderPublicId },
      theme: { color: '#C8A45A' },
      modal: {
        ondismiss: () => {
          setPhase('idle');
          setNotice({ tone: 'info', text: 'Payment cancelled. Your cart is still here whenever you are ready.' });
        },
      },
      handler: async (response) => {
        setPhase('verifying');
        try {
          await postJson('/api/payments/verify', { orderPublicId: order.orderPublicId, ...response });
        } catch {
          // The webhook confirms the payment regardless; the order page polls.
        }
        clearCart();
        navigate(`/order/${order.orderPublicId}`);
      },
    });
    checkout.on('payment.failed', (response) => {
      // Razorpay's own description already says what to do ("Please use
      // another method"), so show it as-is rather than adding to it.
      setNotice({
        tone: 'error',
        text: response.error?.description ?? 'The payment did not go through. Please try another method.',
      });
    });
    checkout.open();
  };

  // ------------------------------------------------------------ render ---
  const hero = (lede) => (
    <PageHero
      kicker="Checkout"
      title={
        <>
          Almost there. <em>Where should it go?</em>
        </>
      }
      lede={lede}
    />
  );

  if (!CHECKOUT_ENABLED) {
    const cart = priceCart(lines);
    return (
      <Page>
        {hero('Online checkout opens soon. Until then we take orders over WhatsApp — send your cart and we will confirm it there.')}
        <section className="section checkout">
          <div className="shell checkout__closed">
            {hydrated && cart.items.length > 0 ? (
              <a className="btn btn--gold" href={whatsappCartUrl(cart)} target="_blank" rel="noopener">
                Order this cart on WhatsApp
                <ArrowUpRight size={13} className="btn__arrow" />
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            ) : (
              <ButtonLink to="/shop">Browse the coffees</ButtonLink>
            )}
          </div>
        </section>
      </Page>
    );
  }

  const empty = hydrated && lines.length === 0;
  const busy = phase !== 'idle';
  const canPay = quote.status === 'ready' && cartProblems.length === 0 && summary.items.length > 0;

  return (
    <Page>
      {hero('Your details, then payment through Razorpay — UPI, cards, net banking or wallets. Prices include GST.')}

      <section className="section checkout">
        <div className="shell">
          {!hydrated ? (
            <p className="checkout__loading">Loading your cart…</p>
          ) : empty ? (
            <div className="checkout__closed">
              <p>Your cart is empty.</p>
              <ButtonLink to="/shop">Browse the coffees</ButtonLink>
            </div>
          ) : (
            <div className="checkout__grid">
              <form ref={formRef} className="checkout__form" onSubmit={onSubmit} noValidate>
                <fieldset disabled={busy}>
                  <legend className="checkout__legend">Contact</legend>
                  <Field id="name" label="Full name" error={errors.name}>
                    <input type="text" {...inputProps('name', 'name')} />
                  </Field>
                  <div className="form__row">
                    <Field id="email" label="Email" error={errors.email} hint="For your receipt.">
                      <input type="email" inputMode="email" {...inputProps('email', 'email', { hint: true })} />
                    </Field>
                    <Field id="phone" label="Mobile" error={errors.phone} hint="The courier will call this.">
                      <input type="tel" inputMode="tel" {...inputProps('phone', 'tel', { hint: true })} />
                    </Field>
                  </div>
                </fieldset>

                <fieldset disabled={busy}>
                  <legend className="checkout__legend">Shipping address</legend>
                  <Field id="line1" label="House, street and area" error={errors.line1}>
                    <input type="text" {...inputProps('line1', 'address-line1')} />
                  </Field>
                  <Field id="line2" label="Landmark or apartment" optional error={errors.line2}>
                    <input type="text" {...inputProps('line2', 'address-line2')} />
                  </Field>
                  <div className="form__row">
                    <Field id="city" label="Town or city" error={errors.city}>
                      <input type="text" {...inputProps('city', 'address-level2')} />
                    </Field>
                    <Field id="pincode" label="PIN code" error={errors.pincode}>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        {...inputProps('pincode', 'postal-code')}
                      />
                    </Field>
                  </div>
                  <Field id="state" label="State" error={errors.state}>
                    <select {...inputProps('state', 'address-level1')}>
                      <option value="">Choose…</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </Field>
                </fieldset>

                <div className="checkout__status" role="status" aria-live="polite">
                  {notice && <p className={`checkout__notice checkout__notice--${notice.tone}`}>{notice.text}</p>}
                  {phase === 'verifying' && <p className="checkout__notice">Confirming your payment…</p>}
                </div>

                <button type="submit" className="btn btn--gold checkout__pay" disabled={!canPay || busy}>
                  {phase === 'creating'
                    ? 'Preparing payment…'
                    : phase === 'paying' || phase === 'verifying'
                      ? 'Waiting for payment…'
                      : canPay
                        ? `Pay ${formatPrice(summary.totalPaise)}`
                        : quote.status === 'error'
                          ? 'Prices unavailable'
                          : 'Checking prices…'}
                </button>
                {quote.status === 'error' && (
                  <p className="checkout__notice checkout__notice--error">
                    We could not confirm prices just now. Please refresh the page to try again.
                  </p>
                )}
                <p className="checkout__fine">
                  Payments are handled by Razorpay. We never see or store your card or UPI details.
                </p>
              </form>

              <aside className="checkout__summary" aria-labelledby="checkout-summary">
                <h2 id="checkout-summary" className="checkout__summary-title">
                  Your order
                </h2>
                {cartProblems.length > 0 && (
                  <div className="checkout__notice checkout__notice--error">
                    {cartProblems.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>
                )}
                <ul className="checkout__items">
                  {summary.items.map((item) => (
                    <li key={item.sku} className="checkout-item">
                      <span className="checkout-item__art" aria-hidden="true">
                        <BagArt product={productBySlug(item.slug)} />
                      </span>
                      <span className="checkout-item__text">
                        <Link to={`/shop/${item.slug}`} className="checkout-item__name">
                          {item.name}
                        </Link>
                        <span className="checkout-item__meta">
                          {item.quantity} × {sizeLabel(item.sizeGrams)} · {item.grindLabel}
                        </span>
                      </span>
                      <span className="checkout-item__price">{formatPrice(item.lineTotalPaise)}</span>
                    </li>
                  ))}
                </ul>
                <dl className="checkout__totals">
                  <div>
                    <dt>Subtotal</dt>
                    <dd>{formatPrice(summary.subtotalPaise)}</dd>
                  </div>
                  <div>
                    <dt>Shipping</dt>
                    <dd>{summary.shippingPaise ? formatPrice(summary.shippingPaise) : 'Free'}</dd>
                  </div>
                  <div className="checkout__total">
                    <dt>Total</dt>
                    <dd className="display">{formatPrice(summary.totalPaise)}</dd>
                  </div>
                </dl>
                <p className="checkout__ship">
                  <Truck size={16} /> Free shipping over {formatPrice(SHIPPING.freeOverPaise)}. Prices include
                  GST.
                </p>
              </aside>
            </div>
          )}
        </div>
      </section>
    </Page>
  );
}
