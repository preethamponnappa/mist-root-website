import { useEffect, useId, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import BagArt from './BagArt';
import ButtonLink from './ButtonLink';
import { ArrowUpRight, Minus, Plus } from './Icons';
import { EASE_OUT, useReducedMotionSafe } from '../lib/motion';
import {
  cartCount,
  closeCart,
  removeFromCart,
  setQuantity,
  useCart,
  useCartDrawer,
} from '../lib/cart';
import { CHECKOUT_ENABLED } from '../lib/checkout';
import { whatsappCartUrl } from '../data/business';
import { MAX_QUANTITY_PER_LINE, SHIPPING, formatPrice, productBySlug, sizeLabel } from '../../shared/catalog';
import { priceCart, toFreeShipping } from '../../shared/pricing';
import './CartDrawer.css';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The cart, as a panel sliding in from the right.
 *
 * A modal dialog in the full sense: focus moves in when it opens, Tab cycles
 * inside it, Escape and the backdrop close it, the page behind stops
 * scrolling, and focus goes back to whatever opened it. The totals here are
 * for display — they come from the same shared/pricing.js the server uses, but
 * the server recomputes them at checkout regardless.
 */
export default function CartDrawer() {
  const open = useCartDrawer();
  const lines = useCart();
  const reduced = useReducedMotionSafe();
  const { pathname } = useLocation();
  const panel = useRef(null);
  const returnFocus = useRef(null);
  const titleId = useId();

  const cart = priceCart(lines);
  const count = cartCount(lines);
  const remaining = toFreeShipping(cart.subtotalPaise);
  const progress = Math.min(1, cart.subtotalPaise / (SHIPPING.freeOverPaise + 1));

  // Any navigation (a product link in the drawer, Checkout, the back button)
  // closes it.
  useEffect(() => {
    closeCart();
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    returnFocus.current = document.activeElement;
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector('[data-autofocus]')?.focus();

    const onKey = (event) => {
      if (event.key === 'Escape') {
        closeCart();
        return;
      }
      if (event.key !== 'Tab' || !panel.current) return;
      const items = [...panel.current.querySelectorAll(FOCUSABLE)];
      if (items.length === 0) return;
      const first = items[0];
      const last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      returnFocus.current?.focus?.();
    };
  }, [open]);

  const slide = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } };

  return (
    <AnimatePresence>
      {open && (
        <div className="cart-layer">
          <motion.div
            className="cart-backdrop"
            aria-hidden="true"
            onClick={closeCart}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
          />
          <motion.aside
            ref={panel}
            className="cart"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            {...slide}
            transition={{ duration: reduced ? 0.15 : 0.5, ease: EASE_OUT }}
          >
            <header className="cart__head">
              <h2 id={titleId} className="cart__title">
                Your cart
                {count > 0 && (
                  <span className="cart__count">
                    {count} {count === 1 ? 'bag' : 'bags'}
                  </span>
                )}
              </h2>
              <button type="button" className="cart__close" onClick={closeCart} data-autofocus>
                <span aria-hidden="true" className="cart__close-x" />
                <span className="visually-hidden">Close cart</span>
              </button>
            </header>

            {cart.items.length === 0 ? (
              <div className="cart__empty">
                <p>Nothing in here yet.</p>
                <ButtonLink to="/shop" variant="ghost">
                  Browse the coffees
                </ButtonLink>
              </div>
            ) : (
              <>
                <div className="cart__ship" aria-live="polite">
                  <p>
                    {remaining > 0
                      ? `Add ${formatPrice(remaining)} more for free shipping.`
                      : 'Your order ships free.'}
                  </p>
                  <span className="cart__ship-bar" aria-hidden="true">
                    <span style={{ transform: `scaleX(${progress})` }} />
                  </span>
                </div>

                <ul className="cart__lines">
                  {cart.items.map((item) => (
                    <CartLine key={item.sku} item={item} />
                  ))}
                </ul>

                <footer className="cart__foot">
                  <dl className="cart__totals">
                    <div>
                      <dt>Subtotal</dt>
                      <dd>{formatPrice(cart.subtotalPaise)}</dd>
                    </div>
                    <div>
                      <dt>Shipping</dt>
                      <dd>{cart.shippingPaise ? formatPrice(cart.shippingPaise) : 'Free'}</dd>
                    </div>
                    <div className="cart__total">
                      <dt>Total</dt>
                      <dd className="display">{formatPrice(cart.totalPaise)}</dd>
                    </div>
                  </dl>
                  <p className="cart__note">Prices include GST.</p>

                  {CHECKOUT_ENABLED ? (
                    <ButtonLink to="/checkout" className="cart__cta">
                      Checkout
                    </ButtonLink>
                  ) : (
                    <>
                      <a
                        className="btn btn--gold cart__cta"
                        href={whatsappCartUrl(cart)}
                        target="_blank"
                        rel="noopener"
                      >
                        Order this cart on WhatsApp
                        <ArrowUpRight size={13} className="btn__arrow" />
                        <span className="visually-hidden"> (opens in a new tab)</span>
                      </a>
                      <p className="cart__note">Online checkout opens soon.</p>
                    </>
                  )}
                </footer>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

function CartLine({ item }) {
  const product = productBySlug(item.slug);
  const label = `${item.name}, ${sizeLabel(item.sizeGrams)}, ${item.grindLabel}`;

  return (
    <li className="cart-line">
      <span className="cart-line__art" aria-hidden="true">
        <BagArt product={product} />
      </span>
      <div className="cart-line__main">
        {/* Closes explicitly: from that product's own page the path does not
            change, so the navigation effect would not fire. */}
        <Link
          to={`/shop/${item.slug}?size=${item.sizeGrams}&grind=${item.grind}`}
          className="cart-line__name"
          onClick={closeCart}
        >
          {item.name}
        </Link>
        <p className="cart-line__meta">
          {sizeLabel(item.sizeGrams)} · {item.grindLabel}
        </p>
        <div className="cart-line__row">
          <div className="cart-line__qty" role="group" aria-label={`Quantity of ${label}`}>
            <button
              type="button"
              onClick={() => setQuantity(item.sku, item.quantity - 1)}
              disabled={item.quantity <= 1}
              aria-label={`One fewer ${label}`}
            >
              <Minus size={12} />
            </button>
            <span aria-live="polite">{item.quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(item.sku, item.quantity + 1)}
              disabled={item.quantity >= MAX_QUANTITY_PER_LINE}
              aria-label={`One more ${label}`}
            >
              <Plus size={12} />
            </button>
          </div>
          <button type="button" className="cart-line__remove" onClick={() => removeFromCart(item.sku)}>
            Remove<span className="visually-hidden"> {label}</span>
          </button>
        </div>
      </div>
      <span className="cart-line__price">{formatPrice(item.lineTotalPaise)}</span>
    </li>
  );
}
