import { useState } from 'react';
import { motion } from 'motion/react';
import Page from '../components/Page';
import PageHero from '../components/PageHero';
import SectionHead from '../components/SectionHead';
import Reveal, { RevealGroup, RevealItem } from '../components/Reveal';
import ArrowLink from '../components/ArrowLink';
import ButtonLink from '../components/ButtonLink';
import { EASE_OUT } from '../lib/motion';
import { ArrowUpRight, Cup, Droplet, Mountain } from '../components/Icons';
import {
  COFFEES,
  formatPrice,
  whatsappOrderUrl,
} from '../data/business';
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

/**
 * Tasting copy only. Variety, process, roast, weight and price are claims we
 * make to a customer, so they come from src/data/business.js and are not
 * repeated here.
 */
const TASTING = {
  'highland-reserve': {
    profile: 'Elegant · Complex · Refined',
    notes: ['Floral', 'Citrus', 'Honey'],
    intensity: 2,
    brew: 'Pour Over',
    copy: 'Our finest Arabica, grown in the high-altitude plantations of Coorg. Handpicked and carefully processed to bring out a clean, layered cup with floral notes and a lingering sweetness.',
  },
  'highland-arabica': {
    profile: 'Smooth · Balanced · Versatile',
    notes: ['Chocolate', 'Nutty', 'Caramel'],
    intensity: 2,
    brew: 'AeroPress · Pour Over',
    copy: 'A well-rounded Arabica with bright acidity, gentle sweetness and a smooth finish. Perfect for everyday brewing, yet special enough to savour slowly.',
  },
  'forest-reserve': {
    profile: 'Bold · Rich · Full-bodied',
    notes: ['Dark chocolate', 'Spice', 'Earthy'],
    intensity: 4,
    brew: 'French Press · Cold Brew',
    copy: 'A premium Robusta with depth and character. Grown under native shade, it delivers a strong cup with rich crema, earthy notes and a comforting finish.',
  },
  'estate-robusta': {
    profile: 'Bold · Smooth · Dependable',
    notes: ['Cocoa', 'Malt', 'Roasted nut'],
    intensity: 3,
    brew: 'Espresso · Moka Pot',
    copy: 'A classic Robusta with a rich, full-bodied profile. Low acidity, with deep chocolate notes — ideal for espresso, milk-based drinks or a strong morning cup.',
  },
};

const LINEUP = COFFEES.map((coffee) => ({ ...coffee, ...TASTING[coffee.id] }));

/** What a customer can ask us to do to the beans before they ship. */
const GRINDS = ['Whole bean', 'Pour over', 'AeroPress', 'French press', 'Moka pot', 'Espresso'];

// role="img" is what makes the aria-label legal here: the four ticks are a
// picture of the intensity, and the label is their text alternative.
function Intensity({ level, name }) {
  return (
    <span
      className="coffee__meter"
      role="img"
      aria-label={`Intensity ${level} of 4 — ${name}`}
    >
      {[1, 2, 3, 4].map((i) => (
        <span key={i} className={`coffee__tick ${i <= level ? 'is-on' : ''}`} />
      ))}
    </span>
  );
}

/**
 * One coffee, with everything needed to buy it.
 *
 * There is no checkout yet, so the order button is a wa.me link carrying a
 * pre-filled message. It is a real <a href> with a working default, so it is
 * crawlable and works without JavaScript; the grind selector only rewrites
 * which message it carries.
 */
function CoffeeCard({ coffee }) {
  const [grind, setGrind] = useState(GRINDS[0]);

  return (
    <motion.article
      className="coffee"
      id={coffee.id}
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
      <p className="coffee__origin">Coorg · {coffee.variety}</p>
      <p className="coffee__profile">{coffee.profile}</p>
      <p className="coffee__copy">{coffee.copy}</p>

      <ul className="coffee__notes">
        {coffee.notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>

      <dl className="coffee__spec">
        <div>
          <dt>Variety</dt>
          <dd>{coffee.variety}</dd>
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
          <dt>Weight</dt>
          <dd>{coffee.weight}</dd>
        </div>
      </dl>

      <p className="coffee__brew">
        <span>Best brewed</span>
        {coffee.brew}
      </p>

      <div className="coffee__buy">
        <p className="coffee__price">
          <span className="coffee__price-value display">{formatPrice(coffee.price)}</span>
          <span className="coffee__price-unit">per {coffee.weight}</span>
        </p>

        <label className="coffee__grind" htmlFor={`grind-${coffee.id}`}>
          <span>Grind</span>
          <select
            id={`grind-${coffee.id}`}
            value={grind}
            onChange={(e) => setGrind(e.target.value)}
          >
            {GRINDS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>

        <a
          className="btn btn--gold coffee__order js-order-whatsapp"
          id={`order-${coffee.id}`}
          data-coffee={coffee.id}
          data-price={coffee.price}
          href={whatsappOrderUrl(coffee, grind)}
          target="_blank"
          rel="noopener"
        >
          Order on WhatsApp
          <ArrowUpRight size={13} className="btn__arrow" />
        </a>
      </div>

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
            {LINEUP.map((c) => (
              <RevealItem key={c.id}>
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
