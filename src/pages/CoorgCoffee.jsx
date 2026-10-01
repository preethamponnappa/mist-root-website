import Page from '../components/Page';
import PageHero from '../components/PageHero';
import SectionHead from '../components/SectionHead';
import Reveal, { RevealGroup, RevealItem } from '../components/Reveal';
import ArrowLink from '../components/ArrowLink';
import { BUSINESS, COFFEES } from '../data/business';
import './CoorgCoffee.css';

/**
 * Marks a claim that is not in the facts sheet and has not been checked.
 *
 * Everything on this page about MistRoot itself comes from src/data/business.js.
 * Everything about Coorg as a region is drafted and unverified, and says so on
 * screen rather than in a comment nobody reads.
 */
function Verify({ children }) {
  return (
    <span className="verify">
      <span className="verify__flag">Verify</span>
      {children}
    </span>
  );
}

const SECTIONS = [
  {
    id: 'region',
    kicker: 'The region',
    title: 'Where Coorg is',
    paragraphs: [
      {
        text: `Coorg — Kodagu, officially — is a district in the Western Ghats of Karnataka, in southern India. Our own estate sits in the ${BUSINESS.location}, at ${BUSINESS.elevation}.`,
        verified: true,
      },
      {
        text: 'Coffee is grown across the district rather than in one valley, on hillsides that run from the plains up into the Ghats.',
        verified: false,
      },
    ],
  },
  {
    id: 'varieties',
    kicker: 'What grows',
    title: 'Arabica and Robusta',
    paragraphs: [
      {
        text: `Both species grow here. We sell four lots: ${COFFEES.map((c) => `${c.name} (${c.variety})`).join(', ')} — all naturally processed and medium roasted, in ${COFFEES[0].weight} bags.`,
        verified: true,
      },
      {
        text: 'Robusta accounts for the larger share of what Coorg produces, with Arabica planted at the higher and shadier elevations.',
        verified: false,
      },
      {
        text: 'The AA and AAA in a lot name refer to screen size — how large the graded bean is — rather than to cup score.',
        verified: false,
      },
    ],
  },
  {
    id: 'harvest',
    kicker: 'The calendar',
    title: 'When it is picked',
    paragraphs: [
      {
        text: `On our estate the harvest runs in ${BUSINESS.harvest.months}. The tasting room is open ${BUSINESS.hours.days}, ${BUSINESS.hours.opens} to ${BUSINESS.hours.closes}, and closes through the heavy monsoon in June and July.`,
        verified: true,
      },
      {
        text: 'Across the district, Arabica is generally picked before Robusta, and the season shifts year to year with the rain.',
        verified: false,
      },
    ],
  },
  {
    id: 'distinctive',
    kicker: 'The difference',
    title: 'Why it tastes the way it does',
    paragraphs: [
      {
        text: 'Coffee here grows under a canopy rather than in open rows — rosewood, jackfruit, silver oak and wild fig, with pepper climbing the trunks.',
        verified: false,
      },
      {
        text: 'The south-west monsoon arrives in June and does not really let go until October, which decides the flowering, the ripening and often the harvest calendar.',
        verified: false,
      },
      {
        text: 'Shade and altitude together slow the cherry down, and slower ripening is generally held to build sweetness and body.',
        verified: false,
      },
    ],
  },
];

export default function CoorgCoffee() {
  return (
    <Page>
      <PageHero
        kicker="Guide"
        title={
          <>
            Coorg coffee, <em>from the inside.</em>
          </>
        }
        lede="A working guide to the region we grow in — what is planted here, when it is picked, and what the hillside does to the cup."
        meta={[
          { label: 'District', value: 'Kodagu' },
          { label: 'Range', value: 'Brahmagiri' },
          { label: 'Our elevation', value: BUSINESS.elevation },
          { label: 'Our harvest', value: BUSINESS.harvest.short },
        ]}
      />

      <Reveal className="shell coorg-notice" preset="fadeIn">
        <p>
          <strong>Draft.</strong> Anything marked <Verify>like this</Verify> is a
          general claim about the region that has not been checked against a source.
          Everything about MistRoot itself comes from our own records.
        </p>
      </Reveal>

      {SECTIONS.map((section, i) => (
        <section
          className={`section coorg-section ${i % 2 ? 'section--raised' : ''}`}
          id={section.id}
          key={section.id}
        >
          <div className="shell coorg-section__inner">
            <SectionHead kicker={section.kicker} title={section.title} />
            <div className="coorg-section__body">
              {section.paragraphs.map((p) => (
                <Reveal as="p" key={p.text.slice(0, 40)} delay={0.08}>
                  {p.verified ? p.text : <Verify>{p.text}</Verify>}
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="section coorg-close">
        <div className="shell coorg-close__inner">
          <SectionHead
            align="center"
            kicker="Taste it"
            title={<>Four lots off this hillside.</>}
            lede="The quickest way to understand a region is to drink it. Ours are listed with what they are, what they cost and how we brew them."
          />
          <RevealGroup className="coorg-close__links" each={0.08}>
            <RevealItem>
              <ArrowLink to="/club">See the coffees</ArrowLink>
            </RevealItem>
            <RevealItem>
              <ArrowLink to="/brewing">How we brew them</ArrowLink>
            </RevealItem>
            <RevealItem>
              <ArrowLink to="/experiences">Come and see it</ArrowLink>
            </RevealItem>
          </RevealGroup>
        </div>
      </section>
    </Page>
  );
}
