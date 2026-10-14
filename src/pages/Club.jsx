import { useState } from 'react';
import { motion } from 'motion/react';
import Page from '../components/Page';
import PageHero from '../components/PageHero';
import SectionHead from '../components/SectionHead';
import Reveal, { RevealGroup, RevealItem } from '../components/Reveal';
import ArrowLink from '../components/ArrowLink';
import ButtonLink from '../components/ButtonLink';
import { EASE_OUT } from '../lib/motion';
import Intensity from '../components/Intensity';
import { ArrowUpRight, Cup, Droplet, Mountain } from '../components/Icons';
import { whatsappOrderUrl } from '../data/business';
import { methodById } from '../data/brewing';
import {
  GRINDS,
  SIZES,
  activeProducts,
  defaultVariant,
  findVariant,
  formatPrice,
  sizeLabel,
} from '../../shared/catalog';
import './Club.css';

const PILLARS = [
  {
    no: '01',
    Icon: Mountain,
    name: 'Source',
    line: 'From the hills of Coorg.',
    body: 'We work with coffees that excite us — from our own family plantations and from growers across Coorg whose work deserves a wider audience. Arabica and Robusta, AA and AAA, every lot kept apart so its character survives the trip to your cup.',
    points: [
      'Quality and character before pedigree',
      'Traceable to a plantation, not a region',
      'Small lots, bought when they are good',
    ],
    href: '#coffees',
    cta: 'See what is in the current release',
  },
  {
    no: '02',
    Icon: Droplet,
    name: 'Brew',
    line: 'Every bean has another side.',
    body: 'V60. AeroPress. French Press. Moka Pot. Cold Brew. Espresso. The same coffee becomes an entirely different drink depending on how you make it — which is either frustrating or the best part, and we think it is the best part.',
    points: [
      'Six methods, six recipes we actually use',
      'Start with ours, then change one thing',
      'No equipment snobbery, ever',
    ],
    to: '/brewing',
    cta: 'All six methods',
  },
  {
    no: '03',
    Icon: Cup,
    name: 'Experience',
    line: 'Coffee brings people together.',
    body: 'Our pop-ups and estate days are where MistRoot actually comes alive. Feel the beans. Grind them. Smell it change. Watch it brew. Ask the question you were slightly embarrassed to ask. Share the cup.',
    points: [
      'Pop-ups, tastings and brew sessions',
      'Estate walks and harvest days in Coorg',
      'Leave knowing more than you arrived with',
    ],
    to: '/experiences',
    cta: 'See the experiences',
  },
];

/** Every size we sell, as one short range: "250 g – 1 kg". */
const SIZE_RANGE = `${sizeLabel(SIZES[0])} – ${sizeLabel(SIZES.at(-1))}`;

/** "Pour Over", "AeroPress · Pour Over" — the methods a coffee suits, by name. */
const brewNames = (product) => product.brewMethods.map((id) => methodById(id).name).join(' · ');

/**
 * One coffee, with everything needed to buy it.
 *
 * There is no checkout yet, so the order button is a wa.me link carrying a
 * pre-filled message for the smallest bag. It is a real <a href> with a
 * working default, so it is crawlable and works without JavaScript; the grind
 * selector only rewrites which message it carries. Other sizes are on the
 * coffee's shop page.
 */
function CoffeeCard({ coffee }) {
  const base = defaultVariant(coffee);
  const [grind, setGrind] = useState(base.grind);
  const variant = findVariant(coffee, base.sizeGrams, grind) ?? base;

  return (
    <motion.article
      className="coffee"
      id={coffee.slug}
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={{
        rest: { y: 0 },
        hover: { y: -10, transition: { duration: 0.5, ease: EASE_OUT } },
      }}
    >
      <div className="coffee__grain" aria-hidden="true" />

      <header className="coffee__head">
        <span className="numeral">{coffee.no}</span>
        <Intensity level={coffee.intensity} name={coffee.name} />
      </header>

      <h3 className="coffee__name">{coffee.name}</h3>
      <p className="coffee__origin">
        Coorg · {coffee.species} {coffee.grade}
      </p>
      <p className="coffee__profile">{coffee.profile}</p>
      <p className="coffee__copy">{coffee.description}</p>

      <ul className="coffee__notes">
        {coffee.tastingNotes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>

      <dl className="coffee__spec">
        <div>
          <dt>Variety</dt>
          <dd>
            {coffee.species} {coffee.grade}
          </dd>
        </div>
        <div>
          <dt>Process</dt>
          <dd>{coffee.process}</dd>
        </div>
        <div>
          <dt>Roast</dt>
          <dd>{coffee.roast}</dd>
        </div>
        <div>
          <dt>Sizes</dt>
          <dd>{SIZE_RANGE}</dd>
        </div>
      </dl>

      <p className="coffee__brew">
        <span>Best brewed</span>
        {brewNames(coffee)}
      </p>

      <div className="coffee__buy">
        <p className="coffee__price">
          <span className="coffee__price-value display">{formatPrice(variant.pricePaise)}</span>
          <span className="coffee__price-unit">per {sizeLabel(variant.sizeGrams)}</span>
        </p>

        <label className="coffee__grind" htmlFor={`grind-${coffee.slug}`}>
          <span>Grind</span>
          <select
            id={`grind-${coffee.slug}`}
            value={grind}
            onChange={(e) => setGrind(e.target.value)}
          >
            {GRINDS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </label>

        <a
          className="btn btn--gold coffee__order js-order-whatsapp"
          id={`order-${coffee.slug}`}
          data-coffee={coffee.slug}
          data-sku={variant.sku}
          data-price-paise={variant.pricePaise}
          href={whatsappOrderUrl(coffee, variant)}
          target="_blank"
          rel="noopener"
        >
          Order on WhatsApp
          <ArrowUpRight size={13} className="btn__arrow" />
        </a>
      </div>

      <ArrowLink to={`/shop/${coffee.slug}`} className="coffee__more">
        All sizes and grinds
      </ArrowLink>

      <motion.span
        className="coffee__rule"
        variants={{
          rest: { scaleX: 0.12, opacity: 0.4 },
          hover: {
            scaleX: 1,
            opacity: 1,
            transition: { duration: 0.6, ease: EASE_OUT },
          },
        }}
      />
    </motion.article>
  );
}

export default function Club() {
  return (
    <Page>
      <PageHero
        kicker="The MistRoot Coffee Club"
        title={
          <>
            Coffee is better <em>when you experience it</em>.
          </>
        }
        lede="We don’t believe coffee should simply be bought. It should be discovered — tasted beside someone, brewed a second way, argued about a little."
        meta={[
          { label: 'We do', value: 'Source · Brew · Share' },
          { label: 'In the cup', value: 'Arabica & Robusta' },
          { label: 'Methods', value: 'Six' },
          { label: 'Entry fee', value: 'Curiosity' },
        ]}
      />

      {/* ------------------------------------------------------- pillars --- */}
      <section className="section club-pillars">
        <div className="shell">
          {PILLARS.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.05}>
              <motion.article
                className="pillar"
                initial="rest"
                whileHover="hover"
                animate="rest"
              >
                <div className="pillar__aside">
                  <span className="numeral pillar__no">{p.no}</span>
                  <motion.span
                    className="pillar__icon"
                    variants={{
                      rest: { y: 0, color: 'rgba(200,164,90,0.75)' },
                      hover: {
                        y: -6,
                        color: 'rgb(227,196,129)',
                        transition: { duration: 0.5, ease: EASE_OUT },
                      },
                    }}
                  >
                    <p.Icon size={34} />
                  </motion.span>
                </div>

                <div className="pillar__main">
                  <h2 className="pillar__name display">{p.name}</h2>
                  <p className="pillar__line">{p.line}</p>
                  <p className="pillar__body">{p.body}</p>

                  <ul className="pillar__points">
                    {p.points.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>

                  <ArrowLink to={p.to} href={p.href} className="pillar__cta">
                    {p.cta}
                  </ArrowLink>
                </div>

                <motion.span
                  className="pillar__rule"
                  variants={{
                    rest: { scaleX: 0.08 },
                    hover: { scaleX: 1, transition: { duration: 0.7, ease: EASE_OUT } },
                  }}
                />
              </motion.article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------- coffees --- */}
      <section className="section section--raised club-coffees" id="coffees">
        <div className="shell">
          <div className="club-coffees__head">
            <SectionHead
              kicker="Our coffees"
              title={
                <>
                  Distinct Origins. <em>Unforgettable Cups.</em>
                </>
              }
              lede="Carefully sourced from the hills of Coorg, our coffees are released in small batches. Each lot has its own character, shaped by the land, the people and the way it is grown."
            />
            <Reveal className="club-coffees__aside" delay={0.14}>
              <p>
                Different Coffees.
                <br />
                A Deeper Connection.
              </p>
            </Reveal>
          </div>

          <RevealGroup className="club-coffees__grid" each={0.1}>
            {activeProducts().map((c) => (
              <RevealItem key={c.slug}>
                <CoffeeCard coffee={c} />
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal delay={0.2} className="club-coffees__foot">
            <ArrowLink to="/brewing">How we brew each of them</ArrowLink>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------- closing --- */}
      <section className="section club-close">
        <div className="shell club-close__inner">
          <Reveal preset="fadeUp">
            <p className="eyebrow eyebrow--bare">Come curious</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="club-close__title">
              This is not coffee served to you. <em>This is coffee shared with you.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.16} className="club-close__actions">
            <ButtonLink to="/experiences">Find the next pop-up</ButtonLink>
            <ArrowLink to="/contact">Or just say hello</ArrowLink>
          </Reveal>
        </div>
      </section>
    </Page>
  );
}
