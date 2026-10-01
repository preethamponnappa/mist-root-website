import { useState } from 'react';
import { motion } from 'motion/react';
import Page from '../components/Page';
import PageHero from '../components/PageHero';
import SectionHead from '../components/SectionHead';
import Reveal, { RevealGroup, RevealItem } from '../components/Reveal';
import ArrowLink from '../components/ArrowLink';
import { EASE_OUT, useReducedMotionSafe } from '../lib/motion';
import { Flame } from '../components/Icons';
import BrewDrawing from '../components/BrewDrawing';
import { METHODS, bestCoffeeFor } from '../data/brewing';
import './Brewing.css';



const WATER = [
  { label: 'Total hardness', value: '60–80 ppm', note: 'as CaCO₃' },
  { label: 'Alkalinity', value: '40 ppm', note: 'keeps acidity honest' },
  { label: 'Temperature', value: '90–96 °C', note: 'by method, not by habit' },
  { label: 'Rest after roast', value: '7–14 days', note: '3 days for espresso' },
];

/**
 * One method recipe.
 *
 * All six panels are rendered into the page rather than just the selected
 * one, so every recipe is present in the prerendered HTML. Inactive panels
 * carry the `hidden` attribute — what the ARIA tabs pattern asks for, and
 * enough to keep them out of the accessibility tree and out of tab order.
 */
function BrewPanel({ method, isActive, reduced }) {
  return (
    <motion.div
      id={`panel-${method.id}`}
      role="tabpanel"
      aria-labelledby={`tab-${method.id}`}
      className="brew__panel"
      hidden={!isActive}
      initial={false}
      animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: reduced ? 0 : -16 }}
      transition={{ duration: 0.45, ease: EASE_OUT }}
    >
      <div className="brew__art">
        <BrewDrawing name={method.drawing} className="brew__drawing" />
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
          Cupped best with <strong>{bestCoffeeFor(method).name}</strong>
        </p>

        {/* The tabs are good to use and poor to link to, so every recipe also
            has a page of its own. */}
        <p className="brew__permalink">
          <ArrowLink to={`/brewing/${method.id}`}>The full {method.name} recipe</ArrowLink>
        </p>
      </div>

      <ol className="brew__steps">
        {method.steps.map((s, i) => (
          <motion.li
            key={s.t}
            className="brew__step"
            initial={false}
            animate={
              isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: reduced ? 0 : 18 }
            }
            transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.12 + i * 0.06 }}
          >
            <span className="brew__step-time">{s.t}</span>
            <span className="brew__step-text">{s.d}</span>
          </motion.li>
        ))}
      </ol>
    </motion.div>
  );
}

export default function Brewing() {
  const [active, setActive] = useState(METHODS[0].id);
  const reduced = useReducedMotionSafe();

  return (
    <Page>
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

          {METHODS.map((m) => (
            <BrewPanel key={m.id} method={m} isActive={active === m.id} reduced={reduced} />
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- water --- */}
      <section className="section section--raised brew-water">
        <div className="shell">
          <SectionHead
            kicker="The unglamorous half"
            title={<>Brewed coffee is about 98 per cent water.</>}
            lede="Almost everything in the cup is water, which is why it is worth getting right. Every recipe above assumes water in this range — change nothing else and fix your water first."
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
            lede="Bring your grinder settings and your worst cup to a pop-up, or send us what you are tasting and we will work through it with you."
          />
          <Reveal delay={0.2}>
            <ArrowLink to="/experiences">See where we are pouring next</ArrowLink>
          </Reveal>
        </div>
      </section>
    </Page>
  );
}
