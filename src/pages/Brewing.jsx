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
  ColdBrewDrawing,
  EspressoDrawing,
  Flame,
  FrenchPressDrawing,
  MokaPotDrawing,
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
    dose: '20 g / 320 g',
    temp: '92 °C',
    time: '3:15–3:30',
    best: 'Mist Veil',
    body: 'A cone strips a coffee of anywhere to hide. If a lot has a jasmine tail or a mineral edge, this is where you will find it — and if it has a flaw, this is where that shows up too. We cup on a V60 for exactly that reason.',
    steps: [
      { t: '0:00', d: 'Rinse the paper with boiling water, discard, add 20 g of grounds and level the bed.' },
      { t: '0:00–0:30', d: 'Bloom with 50 g. Swirl once, gently, until the surface goes matte. Wait.' },
      { t: '0:30–1:30', d: 'Pour to 200 g in slow concentric circles. Never touch the wall of the paper.' },
      { t: '1:30–2:30', d: 'Pour to 300 g. Give the brewer one last swirl to flatten the bed.' },
      { t: '2:30–3:30', d: 'Pour to 320 g and wait for the drawdown to complete. If it finished before 3:15 go finer; after 4:45, coarser.' },
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
    temp: '90 °C',
    time: '2:10',
    best: 'Canopy Reserve',
    body: 'Immersion plus a little pressure. Lower temperature than you think, because the contact is total — 90 °C keeps the sweetness in place instead of pulling it bitter. Inverted, always, whatever the internet says.',
    steps: [
      { t: '0:00', d: 'Inverted. 17 g in, 220 g of 90 °C water straight down the middle.' },
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
    best: 'Forest Floor',
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
    id: 'moka-pot',
    name: 'Moka Pot',
    Drawing: MokaPotDrawing,
    tagline: 'The one most Indian kitchens already own.',
    grind: 'Fine-medium',
    grindPos: 24,
    ratio: '1 : 8',
    dose: '18 g / 150 g',
    temp: 'Pre-boiled',
    time: '4:00',
    best: 'Monsoon Brew',
    body: 'Unfairly maligned, usually because people start it cold and walk away. Fill the boiler with water that has already boiled, keep the flame low, and take it off the heat the moment the stream turns pale. Done properly it is closer to a rich filter coffee than to espresso, and it is very hard to beat on a wet morning.',
    steps: [
      { t: 'Prep', d: 'Fill the boiler to just below the valve with water off the boil. Use a towel — it is hot.' },
      { t: '0:00', d: '18 g in the basket, levelled, never tamped. Screw the top on and set a low flame.' },
      { t: '2:30–3:30', d: 'Coffee should arrive as a slow, dark stream. A violent sputter means the flame is too high.' },
      { t: '4:00', d: 'The moment the stream goes pale and hisses, off the heat and onto a wet cloth.' },
      { t: 'After', d: 'Stir the pot before pouring — the first and last of the extraction are not the same coffee.' },
    ],
  },
  {
    id: 'cold-brew',
    name: 'Cold Brew',
    Drawing: ColdBrewDrawing,
    tagline: 'For everyone who says they dislike black coffee.',
    grind: 'Coarse',
    grindPos: 88,
    ratio: '1 : 8',
    dose: '100 g / 800 g',
    temp: 'Room, then cold',
    time: '16 hrs',
    best: 'Forest Floor',
    body: 'The most forgiving thing on this list and the best convincer we own. No heat means almost none of the acidity that puts people off, so what is left is sweetness and body. Make it as a concentrate and cut it to taste — over ice, with water, with milk, with tonic if it is April.',
    steps: [
      { t: '0:00', d: '100 g coarse into 800 g of filtered water at room temperature. Stir once to wet it all.' },
      { t: '0:00–4:00', d: 'Leave it on the counter. The first hours at room temperature do most of the extracting.' },
      { t: '4:00–16:00', d: 'Into the fridge for the rest. Beyond about twenty hours it turns woody.' },
      { t: '16:00', d: 'Strain through a cloth, then once more through paper. Do not squeeze the grounds.' },
      { t: 'Serving', d: 'This is a concentrate. Start at one part coffee to two parts water or milk, then adjust.' },
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
    best: 'Monsoon Brew',
    body: 'Most of what we source is washed and high-grown, which means it pushes back against a dark roast. We pull light and long — 1:2.2 rather than 1:2 — so the acidity has room to become fruit instead of sourness.',
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
  { label: 'Temperature', value: '90–96 °C', note: 'by method, not by habit' },
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
            Six ways in. <em>None of them wrong.</em>
          </>
        }
        lede="The same bean can become six different drinks. These are the recipes we actually use at the table and at every pop-up — start here, then move one variable at a time and taste what it did."
        meta={[
          { label: 'Methods', value: 'Six' },
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
