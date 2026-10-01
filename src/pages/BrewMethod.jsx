import Page from '../components/Page';
import PageHero from '../components/PageHero';
import SectionHead from '../components/SectionHead';
import Reveal, { RevealGroup, RevealItem } from '../components/Reveal';
import ArrowLink from '../components/ArrowLink';
import BrewDrawing from '../components/BrewDrawing';
import { Flame } from '../components/Icons';
import { METHODS, bestCoffeeFor, methodById } from '../data/brewing';
import { BUSINESS } from '../data/business';
import './Brewing.css';
import './BrewMethod.css';

/**
 * One brewing method, on its own URL.
 *
 * The index page at /brewing keeps all six in tabs, which is good to use and
 * poor to link to. These pages carry the same recipe as plain, linkable HTML —
 * an ordered list of steps a person or a crawler can read straight down.
 *
 * Deliberately no HowTo structured data: Google retired HowTo rich results, and
 * marking up steps that earn nothing is maintenance with no return.
 */
export default function BrewMethod({ methodId }) {
  const method = methodById(methodId);
  const coffee = bestCoffeeFor(method);
  const others = METHODS.filter((m) => m.id !== method.id);

  return (
    <Page>
      <PageHero
        kicker="Brewing"
        title={
          <>
            {method.name}. <em>{method.tagline}</em>
          </>
        }
        lede={method.body}
        meta={[
          { label: 'Ratio', value: method.ratio },
          { label: 'Dose', value: method.dose },
          { label: 'Water', value: method.temp },
          { label: 'Total time', value: method.time },
        ]}
      />

      <section className="section brewmethod">
        <div className="shell brewmethod__inner">
          <Reveal className="brewmethod__art" preset="fadeIn">
            <BrewDrawing name={method.drawing} className="brew__drawing" />
            <span className="brew__art-caption">{method.tagline}</span>
          </Reveal>

          <div className="brewmethod__recipe">
            <h2 className="brewmethod__heading">The recipe</h2>

            <dl className="brew__spec brewmethod__spec">
              <div>
                <dt>Grind</dt>
                <dd>{method.grind}</dd>
              </div>
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

            <h2 className="brewmethod__heading">Step by step</h2>
            <ol className="brewmethod__steps">
              {method.steps.map((s) => (
                <li key={s.t}>
                  <span className="brewmethod__time numeral">{s.t}</span>
                  <span className="brewmethod__text">{s.d}</span>
                </li>
              ))}
            </ol>

            <p className="brew__pair brewmethod__pair">
              <Flame size={16} />
              Cupped best with <strong>{coffee.name}</strong> — {coffee.variety},{' '}
              {method.temp} water, {coffee.weight} from the {BUSINESS.location}.
            </p>

            <Reveal delay={0.1} className="brewmethod__cta">
              <ArrowLink to="/club">See the coffees</ArrowLink>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section section--raised brewmethod-more">
        <div className="shell">
          <SectionHead
            kicker="The other five"
            title={<>Same bean, a different drink.</>}
            lede="Change the method and the coffee changes with it. Each of these has its own recipe, dialled in on our own lots."
          />

          <RevealGroup className="brewmethod-more__grid" each={0.08}>
            {others.map((m) => (
              <RevealItem key={m.id}>
                <a className="methodcard" href={`/brewing/${m.id}`}>
                  <BrewDrawing name={m.drawing} className="methodcard__art" />
                  <span className="methodcard__name">{m.name}</span>
                  <span className="methodcard__meta">
                    {m.dose} · {m.temp} · {m.time}
                  </span>
                </a>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal delay={0.2} className="brewmethod-more__foot">
            <ArrowLink to="/brewing">All six, side by side</ArrowLink>
          </Reveal>
        </div>
      </section>
    </Page>
  );
}
