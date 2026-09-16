import { motion } from 'motion/react';
import Page from '../components/Page';
import PageHero from '../components/PageHero';
import SectionHead from '../components/SectionHead';
import Reveal, { RevealGroup, RevealItem } from '../components/Reveal';
import ArrowLink from '../components/ArrowLink';
import ButtonLink from '../components/ButtonLink';
import { EASE_OUT } from '../lib/motion';
import { Cup, Droplet, Mountain } from '../components/Icons';
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

const COFFEES = [
  {
    no: '01',
    name: 'MistRoot Highland Reserve',
    origin: 'Coorg · Arabica AAA · Plantation',
    profile: 'Elegant · Complex · Refined',
    notes: ['Floral', 'Citrus', 'Honey'],
    intensity: 2,
    brew: 'Pour Over',
    copy: 'Our finest Arabica, grown in the high-altitude plantations of Coorg. Handpicked and carefully processed to bring out a clean, layered cup with floral notes and a lingering sweetness.',
  },
  {
    no: '02',
    name: 'MistRoot Highland Arabica',
    origin: 'Coorg · Arabica AA',
    profile: 'Smooth · Balanced · Versatile',
    notes: ['Chocolate', 'Nutty', 'Caramel'],
    intensity: 2,
    brew: 'AeroPress · Pour Over',
    copy: 'A well-rounded Arabica with bright acidity, gentle sweetness and a smooth finish. Perfect for everyday brewing, yet special enough to savour slowly.',
  },
  {
    no: '03',
    name: 'MistRoot Forest Reserve',
    origin: 'Coorg · Robusta AAA',
    profile: 'Bold · Rich · Full-bodied',
    notes: ['Dark chocolate', 'Spice', 'Earthy'],
    intensity: 4,
    brew: 'French Press · Cold Brew',
    copy: 'A premium Robusta with depth and character. Grown under native shade, it delivers a strong cup with rich crema, earthy notes and a comforting finish.',
  },
  {
    no: '04',
    name: 'MistRoot Estate Robusta',
    origin: 'Coorg · Robusta AA',
    profile: 'Bold · Smooth · Dependable',
    notes: ['Cocoa', 'Malt', 'Roasted nut'],
    intensity: 3,
    brew: 'Espresso · Moka Pot',
    copy: 'A classic Robusta with a rich, full-bodied profile. Low acidity, with deep chocolate notes — ideal for espresso, milk-based drinks or a strong morning cup.',
  },
];

function Intensity({ level, name }) {
  return (
    <span className="coffee__meter" aria-label={`Intensity ${level} of 4 — ${name}`}>
      {[1, 2, 3, 4].map((i) => (
        <span key={i} className={`coffee__tick ${i <= level ? 'is-on' : ''}`} />
      ))}
    </span>
  );
}

export default function Club() {
  return (
    <Page title="The Coffee Club — MistRoot Coffee">
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
            {COFFEES.map((c) => (
              <RevealItem key={c.name}>
                <motion.article
                  className="coffee"
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
                    <span className="numeral">{c.no}</span>
                    <Intensity level={c.intensity} name={c.name} />
                  </header>

                  <h3 className="coffee__name">{c.name}</h3>
                  <p className="coffee__origin">{c.origin}</p>
                  <p className="coffee__profile">{c.profile}</p>
                  <p className="coffee__copy">{c.copy}</p>

                  <ul className="coffee__notes">
                    {c.notes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>

                  <p className="coffee__brew">
                    <span>Best brewed</span>
                    {c.brew}
                  </p>

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
