import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Page from '../components/Page';
import PageHero from '../components/PageHero';
import SectionHead from '../components/SectionHead';
import Reveal, { RevealGroup, RevealItem } from '../components/Reveal';
import ArrowLink from '../components/ArrowLink';
import { EASE_OUT } from '../lib/motion';
import {
  AeroPressDrawing,
  EspressoDrawing,
  Flame,
  FrenchPressDrawing,
  PourOverDrawing,
} from '../components/Icons';
import './Brewing.css';

const METHODS = [
  {
    id: 'pour-over',
    name: 'Pour Over',
    Drawing: PourOverDrawing,
    tagline: 'For the lot you want to hear clearly.',
    grind: 'Medium-fine',
    grindPos: 42,
    ratio: '1 : 16',
    dose: '22 g / 350 g',
    temp: '94 °C',
    time: '3:30',
    best: 'Cloudline',
    body: 'A cone strips a coffee of anywhere to hide. If a lot has a jasmine tail or a mineral edge, this is where you will find it — and if it has a flaw, this is where that shows up too. We cup on a V60 for exactly that reason.',
    steps: [
      { t: '0:00', d: 'Rinse the paper with boiling water, discard, add 22 g of grounds and level the bed.' },
      { t: '0:00–0:45', d: 'Bloom with 60 g. Swirl once, gently, until the surface goes matte. Wait.' },
      { t: '0:45–1:45', d: 'Pour to 200 g in slow concentric circles. Never touch the wall of the paper.' },
      { t: '1:45–2:30', d: 'Pour to 350 g. Give the brewer one last swirl to flatten the bed.' },
      { t: '3:30', d: 'Drawdown complete. If it finished before 3:00 go finer; after 4:15, coarser.' },
    ],
  },
  {
    id: 'aeropress',
    name: 'AeroPress',
    Drawing: AeroPressDrawing,
    tagline: 'The one that travels, and forgives.',
    grind: 'Fine-medium',
    grindPos: 28,
    ratio: '1 : 13',
    dose: '17 g / 220 g',
    temp: '88 °C',
    time: '2:10',
    best: 'Ridge Ember',
    body: 'Immersion plus a little pressure. Lower temperature than you think, because the contact is total — 88 °C keeps the honey lots sweet instead of pulling them bitter. Inverted, always, whatever the internet says.',
    steps: [
      { t: '0:00', d: 'Inverted. 17 g in, 220 g of 88 °C water straight down the middle.' },
      { t: '0:10', d: 'Stir five times, north-south. Cap with a rinsed paper filter.' },
      { t: '0:10–1:30', d: 'Leave it. Do not agitate, do not fidget with it.' },
      { t: '1:30', d: 'Flip onto the cup and press, slowly, over thirty to forty seconds.' },
      { t: '2:10', d: 'Stop the moment you hear the hiss. Everything after the hiss is regret.' },
    ],
  },
  {
    id: 'french-press',
    name: 'French Press',
    Drawing: FrenchPressDrawing,
    tagline: 'Weight, texture, and no ceremony.',
    grind: 'Coarse',
    grindPos: 78,
    ratio: '1 : 15',
    dose: '40 g / 600 g',
    temp: '96 °C',
    time: '8:00',
    best: 'Nightjar',
    body: 'The only method that keeps every oil the roast produced. It will not give you clarity and it is not trying to. What it gives you is body — the closest thing to drinking the coffee the way the cupping table drinks it.',
    steps: [
      { t: '0:00', d: '40 g coarse, 600 g of water just off the boil, poured hard to break the bed.' },
      { t: '4:00', d: 'Break the crust with a spoon, then skim the foam and floaters off the top.' },
      { t: '4:00–8:00', d: 'Lid on, plunger resting on the surface. Do not press yet.' },
      { t: '8:00', d: 'Press slowly to just below the surface — never all the way to the bottom.' },
      { t: '8:30', d: 'Decant everything immediately. Coffee left on the grounds turns to ash.' },
    ],
  },
  {
    id: 'espresso',
    name: 'Espresso',
    Drawing: EspressoDrawing,
    tagline: 'Nine bars and nowhere to hide.',
    grind: 'Fine',
    grindPos: 12,
    ratio: '1 : 2.2',
    dose: '18 g / 40 g',
    temp: '93 °C',
    time: '28 s',
    best: 'Ridge Ember',
    body: 'Our lots are washed and high-grown, which means they push back against a dark roast. We pull them light and long — 1:2.2 rather than 1:2 — so the acidity has room to become fruit instead of sourness.',
    steps: [
      { t: 'Prep', d: '18 g in a clean basket. Distribute, then tamp level. Level matters more than hard.' },
      { t: '0:00', d: 'Lock in and start immediately. A hot basket sitting idle scorches the puck.' },
      { t: '0:00–0:08', d: 'First drops should appear between six and nine seconds. Later means grind coarser.' },
      { t: '0:28', d: 'Stop at 40 g in the cup. Weigh it — the eye lies about espresso every time.' },
      { t: 'After', d: 'Taste before you adjust anything, and change only one variable at a time.' },
    ],
  },
];

const WATER = [
  { label: 'Total hardness', value: '60–80 ppm', note: 'as CaCO₃' },
  { label: 'Alkalinity', value: '40 ppm', note: 'keeps acidity honest' },
  { label: 'Temperature', value: '88–96 °C', note: 'by method, not by habit' },
  { label: 'Rest after roast', value: '7–14 days', note: '3 days for espresso' },
];

export default function Brewing() {
  const [active, setActive] = useState(METHODS[0].id);
  const reduced = useReducedMotion();
  const method = METHODS.find((m) => m.id === active);

  return (
    <Page title="Brewing — MistRoot Coffee">
      <PageHero
        kicker="Brewing"
        title={
          <>
            Four ways in. <em>None of them wrong.</em>
          </>
        }
        lede="These are the recipes our cupping table actually uses, written down exactly as they are taped to the wall of the roastery. Start here, then move one variable at a time."
        meta={[
          { label: 'Methods', value: 'Four' },
          { label: 'Water', value: '60–80 ppm' },
          { label: 'Rest', value: '7–14 days' },
          { label: 'Rule', value: 'Weigh everything' },
        ]}
      />

      {/* -------------------------------------------------------- picker --- */}
      <section className="section brew">
        <div className="shell">
          <Reveal>
            <div className="brew__tabs" role="tablist" aria-label="Brew methods">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  id={`tab-${m.id}`}
                  aria-selected={active === m.id}
                  aria-controls={`panel-${m.id}`}
                  className={`brew__tab ${active === m.id ? 'is-active' : ''}`}
                  onClick={() => setActive(m.id)}
                >
                  {active === m.id && (
                    <motion.span
                      layoutId="brew-tab"
                      className="brew__tab-bg"
                      transition={{ duration: 0.5, ease: EASE_OUT }}
                    />
                  )}
                  <span className="brew__tab-label">{m.name}</span>
                </button>
              ))}
            </div>
          </Reveal>

          <AnimatePresence mode="wait">
            <motion.div
              key={method.id}
              id={`panel-${method.id}`}
              role="tabpanel"
              aria-labelledby={`tab-${method.id}`}
              className="brew__panel"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: EASE_OUT }}
            >
              <div className="brew__art">
                <method.Drawing className="brew__drawing" />
                <span className="brew__art-caption">{method.tagline}</span>
              </div>

              <div className="brew__detail">
                <h2 className="brew__name">{method.name}</h2>
                <p className="brew__body">{method.body}</p>

                <dl className="brew__spec">
                  <div>
                    <dt>Ratio</dt>
                    <dd>{method.ratio}</dd>
                  </div>
                  <div>
                    <dt>Dose</dt>
                    <dd>{method.dose}</dd>
                  </div>
                  <div>
                    <dt>Water</dt>
                    <dd>{method.temp}</dd>
                  </div>
                  <div>
                    <dt>Total time</dt>
                    <dd>{method.time}</dd>
                  </div>
                </dl>

                <div className="brew__grind">
                  <div className="brew__grind-head">
                    <span>Grind</span>
                    <strong>{method.grind}</strong>
                  </div>
                  <div className="brew__grind-scale" aria-hidden="true">
                    <motion.span
                      className="brew__grind-pin"
                      initial={false}
                      animate={{ left: `${method.grindPos}%` }}
                      transition={{ duration: 0.6, ease: EASE_OUT }}
                    />
                  </div>
                  <div className="brew__grind-ends" aria-hidden="true">
                    <span>Fine</span>
                    <span>Coarse</span>
                  </div>
                </div>

                <p className="brew__pair">
                  <Flame size={16} />
                  Cupped best with <strong>{method.best}</strong>
                </p>
              </div>

              <ol className="brew__steps">
                {method.steps.map((s, i) => (
                  <motion.li
                    key={s.t}
                    className="brew__step"
                    initial={reduced ? false : { opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.12 + i * 0.06 }}
                  >
                    <span className="brew__step-time">{s.t}</span>
                    <span className="brew__step-text">{s.d}</span>
                  </motion.li>
                ))}
              </ol>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* --------------------------------------------------------- water --- */}
      <section className="section section--raised brew-water">
        <div className="shell">
          <SectionHead
            kicker="The unglamorous half"
            title={<>Ninety-eight per cent of what you taste is water.</>}
            lede="Every recipe above assumes water in this range. Change nothing else and fix your water first — it is the single largest improvement available to most people."
          />
          <RevealGroup className="brew-water__grid" each={0.09}>
            {WATER.map((w) => (
              <RevealItem className="waterfact" key={w.label}>
                <span className="waterfact__value display">{w.value}</span>
                <span className="waterfact__label">{w.label}</span>
                <span className="waterfact__note">{w.note}</span>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* -------------------------------------------------------- closing -- */}
      <section className="section brew-close">
        <div className="shell brew-close__inner">
          <SectionHead
            align="center"
            kicker="Still not right?"
            title={<>Bring it to the table and we will taste it with you.</>}
            lede="The cupping lab runs open sessions every second Saturday. Bring your grinder settings and your worst cup."
          />
          <Reveal delay={0.2}>
            <ArrowLink to="/experiences">See the cupping sessions</ArrowLink>
          </Reveal>
        </div>
      </section>
    </Page>
  );
}
