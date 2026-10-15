import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Page from '../components/Page';
import PageHero from '../components/PageHero';
import ButtonLink from '../components/ButtonLink';
import ArrowLink from '../components/ArrowLink';
import { useIsHydrated } from '../lib/hydration';
import { BUSINESS, mailtoHref, whatsappEnquiryUrl } from '../data/business';
import { formatPrice, sizeLabel } from '../../shared/catalog';
import './Order.css';

/** How long to keep asking while a payment is still being confirmed. */
const POLL_EVERY_MS = 3000;
const POLL_FOR_MS = 90_000;

const HEADLINES = {
  paid: { kicker: 'Order confirmed', title: (name) => <>Thank you, {name}. <em>Your order is confirmed.</em></> },
  fulfilment_queued: { kicker: 'Order confirmed', title: (name) => <>Thank you, {name}. <em>We are getting it ready.</em></> },
  shipped: { kicker: 'Shipped', title: () => <>Your coffee <em>is on the road.</em></> },
  delivered: { kicker: 'Delivered', title: () => <>Delivered. <em>Enjoy every cup.</em></> },
  pending_payment: { kicker: 'Confirming payment', title: () => <>One moment — <em>confirming your payment.</em></> },
  payment_failed: { kicker: 'Payment not completed', title: () => <>The payment <em>did not go through.</em></> },
  cancelled: { kicker: 'Order cancelled', title: () => <>This order <em>was cancelled.</em></> },
};

/**
 * /order/<publicId> — served by a Netlify rewrite to one prerendered shell, so
 * nothing about the order is in the HTML: it is fetched after hydration. The
 * public id is the only key; the API returns no email, phone or street.
 */
export default function Order() {
  const { publicId } = useParams();
  const hydrated = useIsHydrated();
  const [state, setState] = useState({ status: 'loading', order: null });

  useEffect(() => {
    if (!hydrated) return undefined;
    let cancelled = false;
    let timer;
    const started = Date.now();

    const load = async () => {
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(publicId)}`);
        if (cancelled) return;
        if (response.status === 404) {
          setState({ status: 'missing', order: null });
          return;
        }
        if (!response.ok) throw new Error(String(response.status));
        const order = await response.json();
        if (cancelled) return;
        setState({ status: 'ready', order });
        // The webhook may land a few seconds after the redirect.
        if (order.status === 'pending_payment' && Date.now() - started < POLL_FOR_MS) {
          timer = setTimeout(load, POLL_EVERY_MS);
        }
      } catch {
        if (!cancelled) setState({ status: 'error', order: null });
      }
    };
    load();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [hydrated, publicId]);

  const { order } = state;
  const headline = order ? HEADLINES[order.status] ?? HEADLINES.paid : null;
  const reference = publicId?.slice(0, 8).toUpperCase();

  return (
    <Page>
      <PageHero
        kicker={headline?.kicker ?? 'Your order'}
        title={
          headline
            ? headline.title(order.firstName)
            : state.status === 'missing'
              ? <>We cannot find <em>that order.</em></>
              : state.status === 'error'
                ? <>We could not load <em>your order just now.</em></>
                : <>Looking up <em>your order…</em></>
        }
        lede={
          order?.status === 'payment_failed'
            ? 'Nothing was charged for this order. Your cart is still saved, so you can try again with another payment method.'
            : order?.status === 'pending_payment'
              ? 'This usually takes a few seconds. If your money left your account and this does not update, write to us with the reference below.'
              : state.status === 'missing'
                ? 'Check the link you were given. If you paid and this page will not load, write to us and we will find it.'
                : state.status === 'error'
                  ? 'Please refresh in a moment.'
                  : undefined
        }
        meta={order ? [{ label: 'Reference', value: reference }] : []}
      />

      <section className="section order">
        <div className="shell order__inner">
          {order && (
            <>
              <div className="order__summary">
                <h2 className="order__heading">What you ordered</h2>
                <ul className="order__items">
                  {order.items.map((item) => (
                    <li key={item.sku} className="order-item">
                      <span>
                        <Link to={`/shop/${item.slug}`} className="order-item__name">
                          {item.name}
                        </Link>
                        <span className="order-item__meta">
                          {item.quantity} × {sizeLabel(item.sizeGrams)} · {item.grindLabel}
                        </span>
                      </span>
                      <span className="order-item__price">{formatPrice(item.lineTotalPaise)}</span>
                    </li>
                  ))}
                </ul>
                <dl className="order__totals">
                  <div>
                    <dt>Subtotal</dt>
                    <dd>{formatPrice(order.subtotalPaise)}</dd>
                  </div>
                  <div>
                    <dt>Shipping</dt>
                    <dd>{order.shippingPaise ? formatPrice(order.shippingPaise) : 'Free'}</dd>
                  </div>
                  <div className="order__total">
                    <dt>{order.status === 'payment_failed' || order.status === 'pending_payment' ? 'Total' : 'Paid'}</dt>
                    <dd className="display">{formatPrice(order.totalPaise)}</dd>
                  </div>
                </dl>
              </div>

              <div className="order__aside">
                <h2 className="order__heading">Shipping to</h2>
                <p className="order__address">
                  {order.shipTo.city}, {order.shipTo.state} {order.shipTo.pincode}
                </p>
                <p className="order__note">
                  Keep this page’s link — it always shows your order’s latest status. Questions? Quote reference{' '}
                  <strong>{reference}</strong>.
                </p>
                <ul className="order__contact">
                  <li>
                    <ArrowLink href={whatsappEnquiryUrl(`my order ${reference}`)} target="_blank" rel="noopener">
                      WhatsApp {BUSINESS.phoneDisplay}
                    </ArrowLink>
                  </li>
                  <li>
                    <ArrowLink href={mailtoHref}>{BUSINESS.email}</ArrowLink>
                  </li>
                </ul>
              </div>
            </>
          )}

          {order?.status === 'payment_failed' && (
            <div className="order__actions">
              <ButtonLink to="/checkout">Try paying again</ButtonLink>
            </div>
          )}
          {(state.status === 'missing' || order?.status === 'cancelled') && (
            <div className="order__actions">
              <ButtonLink to="/shop">Back to the shop</ButtonLink>
            </div>
          )}
        </div>
      </section>
    </Page>
  );
}
