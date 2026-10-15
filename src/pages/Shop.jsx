import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import Page from '../components/Page';
import PageHero from '../components/PageHero';
import SectionHead from '../components/SectionHead';
import Reveal, { RevealGroup, RevealItem } from '../components/Reveal';
import ArrowLink from '../components/ArrowLink';
import BagArt from '../components/BagArt';
import { ArrowRight, Bag, Check, Truck } from '../components/Icons';
import { EASE_OUT } from '../lib/motion';
import {
  GRINDS,
  SHIPPING,
  SIZES,
  activeProducts,
  formatPrice,
  isAvailable,
  priceRange,
  sizeLabel,
} from '../../shared/catalog';
import './Shop.css';

const SIZE_RANGE = `${sizeLabel(SIZES[0])} – ${sizeLabel(SIZES.at(-1))}`;

/** The three things people ask before they buy, answered before they have to. */
const PROMISES = [
  {
    Icon: Bag,
    title: 'Ground to order',
    line: 'Whole bean, or ground for pour over, French press, espresso or a South Indian filter.',
  },
  {
    Icon: Truck,
    title: `Free shipping over ${formatPrice(SHIPPING.freeOverPaise)}`,
    line: `A flat ${formatPrice(SHIPPING.flatFeePaise)} on smaller orders.`,
  },
  {
    Icon: Check,
    title: 'Prices include GST',
    line: 'GST is already in every price. Shipping, when it applies, is the only thing added.',
  },
];

const cardLift = {
  rest: { y: 0 },
  hover: { y: -8, transition: { duration: 0.5, ease: EASE_OUT } },
};

/**
 * One coffee in the grid. The whole card is clickable through a single link —
 * the name — whose hit area is stretched over the card, so there is one tab
 * stop per coffee and the accessible name is just the coffee's name.
 */
function ProductCard({ product }) {
  const range = priceRange(product);
  const available = isAvailable(product);

  return (
    <motion.article
      className={`shop-card ${available ? '' : 'is-sold-out'}`}
      initial="rest"
      animate="rest"
      whileHover="hover"
      variants={cardLift}
    >
      <div className="shop-card__art">
        <BagArt product={product} />
      </div>

      <div className="shop-card__body">
        <span className="numeral shop-card__no">{product.no}</span>
        <h3 className="shop-card__name">
          <Link to={`/shop/${product.slug}`} className="shop-card__link">
            {product.name}
          </Link>
        </h3>
        <p className="shop-card__origin">
          Coorg · {product.species} {product.grade}
        </p>
        <p className="shop-card__profile">{product.profile}</p>

        <ul className="shop-card__notes" aria-label="Tasting notes">
          {product.tastingNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>

        <div className="shop-card__foot">
          <p className="shop-card__price">
            {available && range ? (
              <>
                <span className="shop-card__from">From</span>
                <span className="display shop-card__amount">{formatPrice(range.minPaise)}</span>
              </>
            ) : (
              <span className="shop-card__from">Sold out</span>
            )}
          </p>
          <span className="shop-card__cta" aria-hidden="true">
            Choose
            <motion.span
              className="shop-card__arrow"
              variants={{
                rest: { x: 0 },
                hover: { x: 5, transition: { duration: 0.4, ease: EASE_OUT } },
              }}
            >
              <ArrowRight size={14} />
            </motion.span>
          </span>
        </div>
      </div>

      <motion.span
        className="shop-card__rule"
        variants={{
          rest: { scaleX: 0.08, opacity: 0.45 },
          hover: { scaleX: 1, opacity: 1, transition: { duration: 0.65, ease: EASE_OUT } },
        }}
      />
    </motion.article>
  );
}

export default function Shop() {
  const products = activeProducts();

  return (
    <Page>
      <PageHero
        kicker="The shop"
        title={
          <>
            Four coffees from Coorg. <em>Ground the way you brew.</em>
          </>
        }
        lede="Two Arabicas and two Robustas from the hills of Kodagu, naturally processed and medium roasted. Pick a size, tell us how you brew, and we grind it to match."
        meta={[
          { label: 'Coffees', value: String(products.length) },
          { label: 'Sizes', value: SIZE_RANGE },
          { label: 'Grinds', value: String(GRINDS.length) },
          { label: 'Shipping', value: `Free over ${formatPrice(SHIPPING.freeOverPaise)}` },
        ]}
      />

      <section className="section section--raised shop-list" aria-labelledby="shop-coffees">
        <div className="shell">
          <SectionHead
            kicker="Our coffees"
            title={
              <span id="shop-coffees">
                Distinct Origins. <em>Unforgettable Cups.</em>
              </span>
            }
            lede="Released in small batches, each lot kept apart so its character survives the trip to your cup."
          />

          <RevealGroup className="shop-list__grid" each={0.08}>
            {products.map((product) => (
              <RevealItem key={product.slug}>
                <ProductCard product={product} />
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal delay={0.2} className="shop-list__foot">
            <ArrowLink to="/brewing">Not sure which? Start from how you brew</ArrowLink>
          </Reveal>
        </div>
      </section>

      <section className="section shop-promises" aria-label="Ordering">
        <div className="shell">
          <RevealGroup as="ul" className="shop-promises__list" each={0.1}>
            {PROMISES.map(({ Icon, title, line }) => (
              <RevealItem as="li" key={title} className="shop-promise">
                <span className="shop-promise__icon">
                  <Icon size={22} />
                </span>
                <h2 className="shop-promise__title">{title}</h2>
                <p className="shop-promise__line">{line}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>
    </Page>
  );
}
