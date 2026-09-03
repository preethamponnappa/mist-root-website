import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import Page from '../components/Page';
import HeroVideo from '../components/HeroVideo';
import SectionHead from '../components/SectionHead';
import Reveal, { RevealGroup, RevealItem } from '../components/Reveal';
import ArrowLink from '../components/ArrowLink';
import ButtonLink from '../components/ButtonLink';
import { EASE_OUT } from '../lib/motion';
import {
  ArrowRight,
  Basket,
  Compass,
  Cup,
  PourOverDrawing,
  FrenchPressDrawing,
  EspressoDrawing,
} from '../components/Icons';
import './Home.css';

const LOTS = [
  {
    no: '01',
    name: 'Cloudline',
    latin: 'Selection 9 · Washed',
    altitude: '1,540 m',
    pick: 'Third pass, December',
    notes: ['White peach', 'Wet slate', 'Jasmine tail'],
    roast: 1,
    copy: 'The lot that made us stubborn. Picked only from the four blocks that sit inside the cloud for six hours a day, fermented cold for 38 hours, dried on raised beds under muslin.',
  },
  {
    no: '02',
    name: 'Ridge Ember',
    latin: 'Sln 795 · Honey',
    altitude: '1,460 m',
    pick: 'Second pass, January',
    notes: ['Burnt sugar', 'Fig leaf', 'Cocoa nib'],
    roast: 2,
    copy: 'Mucilage left on for eleven days of slow, cool drying. It arrives with the weight of a red wine and finishes like something you smoked over pimento wood.',
  },
  {
    no: '03',
    name: 'Nightjar',
    latin: 'Robusta · Anaerobic',
    altitude: '1,180 m',
    pick: 'Single pass, February',
    notes: ['Black cardamom', 'Molasses', 'Wet earth'],
    roast: 3,
    copy: 'Named for the bird that calls across the drying yard at 3 a.m. Fermented sealed for 96 hours. Loud, low and unrepentant — the one our roaster drinks.',
  },
];

const FACTS = [
  { value: '1,540', unit: 'metres', label: 'Highest picking block' },
  { value: '14', unit: 'species', label: 'Native shade canopy' },
  { value: '9', unit: 'passes', label: 'Selective hand pickings' },
  { value: '15', unit: 'kilos', label: 'Batch size, never more' },
];

const RITUALS = [
  { name: 'Pour Over', Drawing: PourOverDrawing, line: 'Clarity. 3:30 total.' },
  { name: 'French Press', Drawing: FrenchPressDrawing, line: 'Body. 8:00 steep.' },
  { name: 'Espresso', Drawing: EspressoDrawing, line: 'Pressure. 28 seconds.' },
];

const INVITES = [
  {
    Icon: Compass,
    name: 'Estate Walks',
    line: 'Two hours through the shade blocks at first light, ending at the nursery.',
  },
  {
    Icon: Basket,
    name: 'Harvest Days',
    line: 'Pick with the crew from November to February. Your basket gets weighed.',
  },
  {
    Icon: Cup,
    name: 'Bean-to-Cup',
    line: 'Cherry, ferment, dry, roast, cup — the whole chain in a single day.',
  },
];

function RoastMeter({ level }) {
  return (
    <span className="lot__roast" aria-label={`Roast level ${level} of 3`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={`lot__roast-tick ${i <= level ? 'is-on' : ''}`} />
      ))}
    </span>
  );
}

export default function Home() {
  const reduced = useReducedMotion();
  const manifestoRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: manifestoRef,
    offset: ['start end', 'end start'],
  });
  const mistX = useTransform(scrollYProgress, [0, 1], ['-8%', '10%']);
  const quoteY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <Page title="MistRoot Coffee — Grown in the cloud line">
      <HeroVideo />

      {/* ---------------------------------------------------- manifesto --- */}
      <section className="section manifesto" ref={manifestoRef}>
        <motion.div
          className="manifesto__mist"
          style={reduced ? undefined : { x: mistX }}
          aria-hidden="true"
        />
        <div className="shell manifesto__inner">
          <SectionHead
            kicker="The mist belt"
            title={
              <>
                Coffee grown in cloud is <em>slower</em>, and slowness is the
                whole flavour.
              </>
            }
          />
          <motion.div
            className="manifesto__body"
            style={reduced ? undefined : { y: quoteY }}
          >
            <Reveal as="p" delay={0.1}>
              At 1,540 metres the cloud comes up the valley at half past four and does not
              leave until the sun has properly committed. Our cherries ripen two to three
              weeks behind the plains below us. Nobody planned that. The ridge decided it.
            </Reveal>
            <Reveal as="p" delay={0.18}>
              What it gives us is density — sugars laid down in unhurried layers, acidity
              that stays bright instead of turning sharp. What it costs us is certainty.
              Every year we pick nine separate times and throw away more than we keep.
            </Reveal>
            <Reveal delay={0.26} className="manifesto__sign">
              <span className="numeral">Since 2016</span>
              <ArrowLink to="/story">Read how it started</ArrowLink>
            </Reveal>
          </motion.div>
        </div>
      </section>

      {/* --------------------------------------------------------- lots --- */}
      <section className="section section--raised lots">
        <div className="shell">
          <SectionHead
            kicker="Signature lots"
            title={<>Three coffees, one ridge, nine pickings.</>}
            lede="We release small and we release late. What is on this list is what the estate actually gave us this season — when a lot runs out, it stays out until next harvest."
          />

          <RevealGroup className="lots__grid" each={0.12}>
            {LOTS.map((lot) => (
              <RevealItem key={lot.name}>
                <motion.article
                  className="lot"
                  initial="rest"
                  whileHover="hover"
                  animate="rest"
                  variants={{
                    rest: { y: 0 },
                    hover: { y: -10, transition: { duration: 0.5, ease: EASE_OUT } },
                  }}
                >
                  <div className="lot__contours" aria-hidden="true" />
                  <header className="lot__head">
                    <span className="numeral">{lot.no}</span>
                    <RoastMeter level={lot.roast} />
                  </header>

                  <h3 className="lot__name">{lot.name}</h3>
                  <p className="lot__latin">{lot.latin}</p>
                  <p className="lot__copy">{lot.copy}</p>

                  <dl className="lot__spec">
                    <div>
                      <dt>Altitude</dt>
                      <dd>{lot.altitude}</dd>
                    </div>
                    <div>
                      <dt>Picked</dt>
                      <dd>{lot.pick}</dd>
                    </div>
                  </dl>

                  <ul className="lot__notes">
                    {lot.notes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>

                  <motion.span
                    className="lot__rule"
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
        </div>
      </section>

      {/* -------------------------------------------------------- facts --- */}
      <section className="facts">
        <div className="shell shell--wide">
          <RevealGroup className="facts__row" each={0.1}>
            {FACTS.map((f) => (
              <RevealItem className="fact" key={f.label}>
                <span className="fact__value display">{f.value}</span>
                <span className="fact__unit">{f.unit}</span>
                <span className="fact__label">{f.label}</span>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ------------------------------------------------------ rituals --- */}
      <section className="section rituals">
        <div className="shell rituals__inner">
          <SectionHead
            kicker="The ritual"
            title={
              <>
                We will tell you exactly how we brew it. <em>Then ignore us.</em>
              </>
            }
            lede="Every lot ships with the recipe our cupping table settled on — grind, ratio, temperature, time. It is a starting point, not a rule."
          />

          <RevealGroup className="rituals__row" each={0.12}>
            {RITUALS.map(({ name, Drawing, line }) => (
              <RevealItem key={name}>
                <motion.div
                  className="ritual"
                  initial="rest"
                  whileHover="hover"
                  animate="rest"
                  variants={{ rest: {}, hover: {} }}
                >
                  <motion.div
                    className="ritual__art"
                    variants={{
                      rest: { y: 0, color: 'rgba(245,234,217,0.42)' },
                      hover: {
                        y: -8,
                        color: 'rgba(227,196,129,0.95)',
                        transition: { duration: 0.55, ease: EASE_OUT },
                      },
                    }}
                  >
                    <Drawing className="ritual__drawing" />
                  </motion.div>
                  <h4 className="ritual__name">{name}</h4>
                  <p className="ritual__line">{line}</p>
                </motion.div>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal delay={0.2} className="rituals__cta">
            <ButtonLink to="/brewing" variant="ghost">
              All four methods
            </ButtonLink>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------- invite --- */}
      <section className="section section--raised invite">
        <div className="shell invite__inner">
          <div className="invite__left">
            <SectionHead
              kicker="Come up the hill"
              title={<>The estate is open, and it is a two-hour drive from anywhere.</>}
              lede="We keep three ways in: a walk, a harvest, and the long one where you follow a single cherry all the way to the cup in your hand."
            />
            <Reveal delay={0.22}>
              <ButtonLink to="/experiences">See the experiences</ButtonLink>
            </Reveal>
          </div>

          <RevealGroup className="invite__list" each={0.1} delayChildren={0.1}>
            {INVITES.map(({ Icon, name, line }) => (
              <RevealItem key={name}>
                <motion.div
                  className="invite__item"
                  initial="rest"
                  whileHover="hover"
                  animate="rest"
                >
                  <motion.span
                    className="invite__icon"
                    variants={{
                      rest: { borderColor: 'rgba(245,234,217,0.12)', color: 'rgba(200,164,90,0.75)' },
                      hover: {
                        borderColor: 'rgba(200,164,90,0.6)',
                        color: 'rgb(227,196,129)',
                        transition: { duration: 0.45, ease: EASE_OUT },
                      },
                    }}
                  >
                    <Icon size={22} />
                  </motion.span>
                  <div>
                    <h4 className="invite__name">{name}</h4>
                    <p className="invite__line">{line}</p>
                  </div>
                  <motion.span
                    className="invite__arrow"
                    variants={{
                      rest: { opacity: 0, x: -8 },
                      hover: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE_OUT } },
                    }}
                  >
                    <ArrowRight size={16} />
                  </motion.span>
                </motion.div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ---------------------------------------------------- closing ----- */}
      <section className="closing">
        <div className="shell closing__inner">
          <Reveal preset="fadeUp">
            <p className="closing__kicker eyebrow eyebrow--bare">Subscribe to the ridge</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="closing__title">
              Nine pickings a year. <em>Four of them are worth waiting for.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.16} className="closing__actions">
            <ButtonLink to="/contact">Join the harvest list</ButtonLink>
            <ArrowLink to="/story" className="closing__alt">
              Or read our story first
            </ArrowLink>
          </Reveal>
        </div>
      </section>
    </Page>
  );
}
