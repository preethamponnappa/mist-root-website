import { useId, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import Page from '../components/Page';
import SectionHead from '../components/SectionHead';
import Reveal, { RevealGroup, RevealItem } from '../components/Reveal';
import ArrowLink from '../components/ArrowLink';
import BagArt from '../components/BagArt';
import BrewDrawing from '../components/BrewDrawing';
import Intensity from '../components/Intensity';
import ProductGallery from '../components/ProductGallery';
import { ArrowRight, ArrowUpRight, Check, Minus, Plus, Truck } from '../components/Icons';
import { EASE_OUT, useReducedMotionSafe } from '../lib/motion';
import { useIsHydrated } from '../lib/hydration';
import { addToCart, cartCount, useCart } from '../lib/cart';
import { methodById } from '../data/brewing';
import { whatsappOrderUrl } from '../data/business';
import {
  GRINDS,
  MAX_QUANTITY_PER_LINE,
  SHIPPING,
  SIZES,
  activeProducts,
  defaultVariant,
  findVariant,
  formatPrice,
  grindById,
  productBySlug,
  sizeLabel,
} from '../../shared/catalog';
import './Product.css';

const EMPTY_PARAMS = new URLSearchParams();

/**
 * The variant the page is showing, from `?size=&grind=` when they name one that
 * exists, otherwise the product's default. Falls back to an in-stock grind of
 * the chosen size rather than showing something that cannot be bought.
 */
function selectedVariant(product, params) {
  const fallback = defaultVariant(product);
  const size = Number(params.get('size'));
  const grind = params.get('grind');

  const sizeGrams = product.variants.some((v) => v.sizeGrams === size) ? size : fallback.sizeGrams;
  const grindId = grindById(grind) ? grind : fallback.grind;

  const exact = findVariant(product, sizeGrams, grindId);
  if (exact?.inStock) return exact;
  return product.variants.find((v) => v.sizeGrams === sizeGrams && v.inStock) ?? exact ?? fallback;
}

/**
 * A row of radio buttons styled as choices. Native radios give the keyboard
 * behaviour for free — Tab into the group, arrow keys between options — and
 * the fieldset/legend pair names the group for screen readers.
 */
function ChoiceGroup({ legend, name, options, value, onChange, className = '' }) {
  return (
    <fieldset className={`choices ${className}`}>
      <legend className="choices__legend">{legend}</legend>
      <div className="choices__options">
        {options.map((option) => (
          <label key={option.value} className="choice">
            <input
              type="radio"
              className="choice__input"
              name={name}
              value={option.value}
              checked={option.value === value}
              disabled={option.disabled}
              onChange={() => onChange(option.value)}
            />
            <span className="choice__face">
              <span className="choice__label">{option.label}</span>
              {option.detail && <span className="choice__detail">{option.detail}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function QuantityStepper({ value, onChange }) {
  const id = useId();
  const [draft, setDraft] = useState(null);

  const clamp = (n) => Math.min(MAX_QUANTITY_PER_LINE, Math.max(1, n));
  const commit = (raw) => {
    const n = Number.parseInt(raw, 10);
    onChange(Number.isNaN(n) ? value : clamp(n));
    setDraft(null);
  };

  return (
    <div className="stepper">
      <label htmlFor={id} className="stepper__label">
        Quantity
      </label>
      <div className="stepper__control">
        <button
          type="button"
          className="stepper__btn"
          onClick={() => onChange(clamp(value - 1))}
          disabled={value <= 1}
          aria-label="Decrease quantity"
          aria-controls={id}
        >
          <Minus size={14} />
        </button>
        <input
          id={id}
          className="stepper__input"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          aria-describedby={`${id}-max`}
          value={draft ?? String(value)}
          onChange={(e) => setDraft(e.target.value.replace(/\D/g, '').slice(0, 2))}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp') {
              e.preventDefault();
              onChange(clamp(value + 1));
            } else if (e.key === 'ArrowDown') {
              e.preventDefault();
              onChange(clamp(value - 1));
            } else if (e.key === 'Enter' && draft !== null) {
              commit(e.currentTarget.value);
            }
          }}
        />
        <button
          type="button"
          className="stepper__btn"
          onClick={() => onChange(clamp(value + 1))}
          disabled={value >= MAX_QUANTITY_PER_LINE}
          aria-label="Increase quantity"
          aria-controls={id}
        >
          <Plus size={14} />
        </button>
      </div>
      <span id={`${id}-max`} className="visually-hidden">
        Up to {MAX_QUANTITY_PER_LINE} of each size and grind.
      </span>
    </div>
  );
}

export default function Product({ slug }) {
  const product = productBySlug(slug);
  const reduced = useReducedMotionSafe();
  const hydrated = useIsHydrated();
  const [searchParams, setSearchParams] = useSearchParams();
  const cart = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(null);

  // The prerendered HTML has no query string, so the URL's selection is only
  // read once hydration is done — otherwise ?size=500 would hydrate against
  // markup built for 250 g.
  const variant = selectedVariant(product, hydrated ? searchParams : EMPTY_PARAMS);
  const grind = grindById(variant.grind);

  // Built from the live URL, not from `variant`: the router applies navigations
  // as transitions, so a second quick click can land before the re-render and
  // would otherwise undo the first (pick 500 g, then a grind, back to 250 g).
  // The URL itself is updated synchronously, so it is always the latest choice.
  const select = (next) => {
    const params = new URLSearchParams(window.location.search);
    const current = selectedVariant(product, params);
    params.set('size', String(next.sizeGrams ?? current.sizeGrams));
    params.set('grind', next.grind ?? current.grind);
    setSearchParams(params, { replace: true, preventScrollReset: true });
  };

  const sizeOptions = SIZES.filter((size) => product.variants.some((v) => v.sizeGrams === size)).map(
    (size) => {
      const options = product.variants.filter((v) => v.sizeGrams === size);
      const inStock = options.some((v) => v.inStock);
      return {
        value: String(size),
        label: sizeLabel(size),
        detail: inStock ? formatPrice(Math.min(...options.map((v) => v.pricePaise))) : 'Sold out',
        disabled: !inStock,
      };
    },
  );

  const grindOptions = GRINDS.map((g) => {
    const v = findVariant(product, variant.sizeGrams, g.id);
    return {
      value: g.id,
      label: g.label,
      detail: v?.inStock ? g.hint : 'Sold out',
      disabled: !v?.inStock,
    };
  });

  const lineTotal = variant.pricePaise * quantity;
  const inCart = cartCount(cart);

  const onAdd = (event) => {
    event.preventDefault();
    if (!variant.inStock) return;
    const before = cart.find((line) => line.sku === variant.sku)?.quantity ?? 0;
    const after = addToCart(variant.sku, quantity);
    setAdded({
      sku: variant.sku,
      quantity: after - before,
      capped: after - before < quantity,
      label: `${sizeLabel(variant.sizeGrams)}, ${grind.label}`,
    });
  };

  const brewMethods = product.brewMethods.map(methodById).filter(Boolean);
  const others = activeProducts().filter((p) => p.slug !== product.slug);
  const enter = (delay) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, ease: EASE_OUT, delay },
        };

  return (
    <Page>
      {/* ---------------------------------------------------------- buy --- */}
      <section className="product page-top">
        <div className="shell">
          <nav aria-label="Breadcrumb" className="product__crumbs">
            <ol>
              <li>
                <Link to="/shop">Shop</Link>
              </li>
              <li aria-current="page">{product.shortName}</li>
            </ol>
          </nav>

          <div className="product__grid">
            <motion.div className="product__media" {...enter(0.1)}>
              <ProductGallery product={product} sizeGrams={variant.sizeGrams} />
            </motion.div>

            <div className="product__panel">
              <motion.p className="eyebrow" {...enter(0.15)}>
                No. {product.no} · {product.species} {product.grade}
              </motion.p>
              <motion.h1 className="product__name" {...enter(0.2)}>
                {product.name}
              </motion.h1>
              <motion.div className="product__character" {...enter(0.28)}>
                <p className="product__profile">{product.profile}</p>
                <Intensity level={product.intensity} name={product.name} />
              </motion.div>
              <motion.p className="product__lede" {...enter(0.34)}>
                {product.description}
              </motion.p>

              <motion.form className="buy" onSubmit={onAdd} {...enter(0.42)}>
                <p className="buy__price" aria-live="polite" aria-atomic="true">
                  <span className="buy__amount display">{formatPrice(variant.pricePaise)}</span>
                  <span className="buy__unit">
                    {sizeLabel(variant.sizeGrams)} · {grind.label}
                  </span>
                </p>

                <ChoiceGroup
                  legend="Size"
                  name={`size-${product.slug}`}
                  className="choices--size"
                  options={sizeOptions}
                  value={String(variant.sizeGrams)}
                  onChange={(size) => select({ sizeGrams: Number(size) })}
                />

                <ChoiceGroup
                  legend="Grind"
                  name={`grind-${product.slug}`}
                  className="choices--grind"
                  options={grindOptions}
                  value={variant.grind}
                  onChange={(g) => select({ grind: g })}
                />

                <div className="buy__row">
                  <QuantityStepper value={quantity} onChange={setQuantity} />
                  <button type="submit" className="btn btn--gold buy__add" disabled={!variant.inStock}>
                    {variant.inStock ? (
                      <>
                        Add to cart <span className="buy__add-sep" aria-hidden="true">·</span>{' '}
                        {formatPrice(lineTotal)}
                      </>
                    ) : (
                      'Sold out'
                    )}
                  </button>
                </div>

                <div className="buy__status" role="status">
                  {added && (
                    <p className="buy__added">
                      <Check size={16} />
                      <span>
                        {added.quantity > 0
                          ? `Added ${added.quantity} × ${added.label}. `
                          : 'That line is already at the limit. '}
                        {added.capped &&
                          added.quantity > 0 &&
                          `Capped at ${MAX_QUANTITY_PER_LINE} of each size and grind. `}
                        {inCart} {inCart === 1 ? 'bag' : 'bags'} in your cart.
                      </span>
                    </p>
                  )}
                </div>

                <p className="buy__note">
                  <Truck size={18} />
                  <span>
                    Free shipping over {formatPrice(SHIPPING.freeOverPaise)}, otherwise{' '}
                    {formatPrice(SHIPPING.flatFeePaise)}. Prices include GST.
                  </span>
                </p>

                {/* Checkout is not open yet; WhatsApp still takes orders. */}
                <p className="buy__alt">
                  Online checkout opens soon. To order today,{' '}
                  <a
                    href={whatsappOrderUrl(product, variant, quantity)}
                    target="_blank"
                    rel="noopener"
                    className="buy__whatsapp"
                  >
                    send this order on WhatsApp
                    <ArrowUpRight size={12} />
                    <span className="visually-hidden"> (opens in a new tab)</span>
                  </a>
                  .
                </p>
              </motion.form>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- story --- */}
      <section className="section section--raised product-story">
        <div className="shell product-story__inner">
          <div>
            <SectionHead
              kicker="The coffee"
              title={
                <>
                  Where it grows, <em>and how it is made.</em>
                </>
              }
            />
            <div className="product-story__body">
              {product.story.map((paragraph, i) => (
                <Reveal as="p" key={i} delay={0.1 + i * 0.08}>
                  {paragraph}
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={0.16}>
            <dl className="product-spec">
              {[
                ['Species', product.species],
                ['Grade', product.grade],
                ['Origin', product.origin],
                ['Altitude', product.altitude],
                ['Process', product.process],
                ['Roast', product.roast],
              ].map(([term, detail]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{detail}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------ tasting --- */}
      <section className="section product-taste">
        <div className="shell">
          <SectionHead
            kicker="In the cup"
            title={
              <>
                Tasting notes, <em>and how to find them.</em>
              </>
            }
          />

          <Reveal delay={0.1}>
            <ul className="product-notes" aria-label="Tasting notes">
              {product.tastingNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </Reveal>

          <RevealGroup className="product-brews" each={0.1}>
            {brewMethods.map((method, i) => (
              <RevealItem key={method.id} className="product-brew">
                <div className="product-brew__art" aria-hidden="true">
                  <BrewDrawing name={method.drawing} />
                </div>
                <div>
                  <p className="product-brew__kicker">{i === 0 ? 'Our pick' : 'Also good'}</p>
                  <h3 className="product-brew__name">{method.name}</h3>
                  <p className="product-brew__line">{method.tagline}</p>
                  <ArrowLink to={`/brewing/${method.id}`}>The {method.name} recipe</ArrowLink>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ------------------------------------------------------- others --- */}
      <section className="section section--raised product-more" aria-labelledby="product-more">
        <div className="shell">
          <SectionHead
            kicker="The rest of the release"
            title={<span id="product-more">More from the release.</span>}
          />
          <RevealGroup as="ul" className="product-more__list" each={0.08}>
            {others.map((other) => (
              <RevealItem as="li" key={other.slug}>
                <Link to={`/shop/${other.slug}`} className="product-more__item">
                  <span className="product-more__art" aria-hidden="true">
                    <BagArt product={other} />
                  </span>
                  <span className="product-more__text">
                    <span className="product-more__name">{other.name}</span>
                    <span className="product-more__origin">
                      {other.species} {other.grade} · {other.profile}
                    </span>
                  </span>
                  <ArrowRight size={16} className="product-more__arrow" />
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>
    </Page>
  );
}
