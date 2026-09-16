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
  ColdBrewDrawing,
  Compass,
  Cup,
  PourOverDrawing,
  FrenchPressDrawing,
} from '../components/Icons';
import './Home.css';

const LOTS = [
  {
    no: '01',
    name: 'Mist Veil',
    origin: 'Coorg · Washed',
    profile: 'Clean · Bright · Layered',
  },
  {
    no: '02',
    name: 'Forest Floor',
    origin: 'Chikmagalur · Natural',
    profile: 'Deep · Fruited · Wild',
  },
  {
    no: '03',
    name: 'Monsoon Brew',
    origin: 'Malabar · Monsooned',
    profile: 'Bold · Low-acid · Spiced',
  },
  {
    no: '04',
    name: 'Canopy Reserve',
    origin: 'Single lot · Anaerobic',
    profile: 'Rare · Complex · Loud',
  },
];

const FACTS = [
  { value: '3', unit: 'generations', label: 'Of Coorg coffee behind us' },
  { value: '6', unit: 'methods', label: 'On the brew bar' },
  { value: '14', unit: 'species', label: 'Native shade canopy' },
  { value: '4', unit: 'coffees', label: 'In the current release' },
];

const RITUALS = [
  { name: 'Pour Over', Drawing: PourOverDrawing, line: 'Clarity. 3:30 total.' },
  { name: 'French Press', Drawing: FrenchPressDrawing, line: 'Body. 8:00 steep.' },
  { name: 'Cold Brew', Drawing: ColdBrewDrawing, line: 'Sweetness. 16 hours.' },
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
    <Page title="MistRoot Coffee — Mist. Mountains. Memories.">
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
                Coffee grown in mist is <em>slower</em>, and slowness is the
                whole flavour.
              </>
            }
          />
          <motion.div
            className="manifesto__body"
            style={reduced ? undefined : { y: quoteY }}
          >
            <Reveal as="p" delay={0.1}>
              On this slope the mist does not sit on the peaks — it pools. It comes up past
              Bhagamandala at half past four and does not leave until the sun has properly
              committed. Our cherries ripen two to three weeks behind the open country
              below. Nobody planned that. The slope decided it.
            </Reveal>
            <Reveal as="p" delay={0.18}>
              What it gives us is density — sugars laid down in unhurried layers, acidity
              that stays bright instead of turning sharp. What it costs us is certainty. We
              go back over the same rows for weeks and throw away more than we keep.
            </Reveal>
            <Reveal delay={0.26} className="manifesto__sign">
              <span className="numeral">Since the early 1990s</span>
              <ArrowLink to="/story">Read how it started</ArrowLink>
            </Reveal>
          </motion.div>
        </div>
      </section>

      {/* --------------------------------------------------------- lots --- */}
      <section className="section section--raised lots">
        <div className="shell">
          <SectionHead
            kicker="Coffees worth discovering"
            title={<>Selected for what they bring to the cup, not where they come from.</>}
            lede="Small batches, some from our own hills in Coorg and some from growers we have spent years getting to know. When one runs out it stays out until it is good again."
          />

          <RevealGroup className="lots__list" each={0.08}>
            {LOTS.map((lot) => (
              <RevealItem key={lot.name}>
                <motion.div
                  className="lot"
                  initial="rest"
                  whileHover="hover"
                  animate="rest"
                >
                  <span className="numeral lot__no">{lot.no}</span>
                  <motion.h3
                    className="lot__name"
                    variants={{
                      rest: { x: 0 },
                      hover: { x: 10, transition: { duration: 0.5, ease: EASE_OUT } },
                    }}
                  >
                    {lot.name}
                  </motion.h3>
                  <span className="lot__origin">{lot.origin}</span>
                  <span className="lot__profile">{lot.profile}</span>
                  <motion.span
                    className="lot__rule"
                    variants={{
                      rest: { scaleX: 0.06, opacity: 0.45 },
                      hover: {
                        scaleX: 1,
                        opacity: 1,
                        transition: { duration: 0.65, ease: EASE_OUT },
                      },
                    }}
                  />
                </motion.div>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal delay={0.2} className="lots__cta">
            <ButtonLink to="/club" variant="ghost">
              Meet the Coffee Club
            </ButtonLink>
          </Reveal>
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
            lede="Every coffee ships with the recipe we settled on at the table — grind, ratio, temperature, time. It is a starting point, not a rule, and the fun begins when you ignore it."
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
              All six methods
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
            <p className="closing__kicker eyebrow eyebrow--bare">Join the club</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="closing__title">
              Come curious. <em>Leave with a story.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.16} className="closing__actions">
            <ButtonLink to="/contact">Get the release list</ButtonLink>
            <ArrowLink to="/story" className="closing__alt">
              Or read our story first
            </ArrowLink>
          </Reveal>
        </div>
      </section>
    </Page>
  );
}
