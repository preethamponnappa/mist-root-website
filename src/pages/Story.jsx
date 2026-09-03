import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import Page from '../components/Page';
import PageHero from '../components/PageHero';
import SectionHead from '../components/SectionHead';
import Reveal, { RevealGroup, RevealItem } from '../components/Reveal';
import ArrowLink from '../components/ArrowLink';
import heroVideo from '../../assests/video/hero_section.mp4';
import { EASE_OUT } from '../lib/motion';
import { Droplet, Hourglass, Leaf, Mountain } from '../components/Icons';
import './Story.css';

const VALUES = [
  {
    Icon: Mountain,
    name: 'Altitude',
    body: 'Every block sits between 1,180 and 1,540 metres — high enough that the cherry takes its time, low enough that frost never finds us.',
  },
  {
    Icon: Hourglass,
    name: 'Patience',
    body: 'Nine selective passes a season. A picker walks the same row nine times, taking only what is fully red. Slower, dearer, and the entire difference.',
  },
  {
    Icon: Leaf,
    name: 'Shade',
    body: 'Fourteen native species stand over the coffee — rosewood, jackfruit, silver oak, wild fig. The canopy is not decoration; it is the cooling system.',
  },
  {
    Icon: Droplet,
    name: 'Water',
    body: 'Every litre used in washing is recirculated three times, then filtered through a reed bed before it rejoins the stream our neighbours drink from.',
  },
];

const TIMELINE = [
  {
    year: '2016',
    title: 'A failed cardamom plot',
    body: 'Ninety acres of exhausted cardamom on a ridge nobody wanted, bought with a loan and a great deal of optimism. The first thing we did was stop planting and spend a year watching where the cloud sat.',
  },
  {
    year: '2018',
    title: 'The first honest harvest',
    body: 'Four hundred kilos of parchment. Most of it was mediocre and one lot — from the four blocks nearest the escarpment — was startling. That lot is now called Cloudline.',
  },
  {
    year: '2020',
    title: 'The drying yard',
    body: 'We stopped selling cherry to the curing works and built forty raised beds under muslin. Losing the middleman meant learning to dry properly. It took two seasons and one heartbreaking mould event.',
  },
  {
    year: '2022',
    title: 'Roasting on the ridge',
    body: 'A 15 kg drum roaster arrived on the back of a jeep in monsoon. Since then nothing has left this estate green. Every bag is roasted within nine hundred metres of where it grew.',
  },
  {
    year: '2024',
    title: 'Opening the gate',
    body: 'The tasting room opened in the old pulping shed. We started walking guests through the shade blocks because explaining it on a label was never going to work.',
  },
  {
    year: 'Today',
    title: 'Ninety acres, fourteen canopies',
    body: 'Thirty-one people work the ridge, twenty-two of them year-round. We still throw away more cherry than we keep, and we still have not found a reason to stop.',
  },
];

const PEOPLE = [
  {
    initials: 'AK',
    name: 'Anjali Kadamba',
    role: 'Founder · Agronomy',
    line: 'Spent eleven years in soil science before deciding the only honest lab was a hillside. Keeps the shade census by hand, in pencil.',
  },
  {
    initials: 'RD',
    name: 'Rohan D’Costa',
    role: 'Head of Processing',
    line: 'Learned fermentation from his grandmother’s vinegar barrels. Sleeps beside the drying yard through February and is not joking about it.',
  },
  {
    initials: 'MT',
    name: 'Mercy Thomas',
    role: 'Roaster · Cupping',
    line: 'Runs the drum, runs the table, and has final say on what ships. Has rejected two entire lots since 2022. Both times she was right.',
  },
];

export default function Story() {
  const reduced = useReducedMotion();
  const trackRef = useRef(null);
  const bandRef = useRef(null);

  const { scrollYProgress: trackProgress } = useScroll({
    target: trackRef,
    offset: ['start 72%', 'end 62%'],
  });

  const { scrollYProgress: bandProgress } = useScroll({
    target: bandRef,
    offset: ['start end', 'end start'],
  });
  const bandY = useTransform(bandProgress, [0, 1], ['-12%', '12%']);
  const bandScale = useTransform(bandProgress, [0, 0.5, 1], [1.12, 1.02, 1.12]);

  return (
    <Page title="Our Story — MistRoot Coffee">
      <PageHero
        kicker="Our story"
        title={
          <>
            Ninety acres that were <em>never meant</em> to grow coffee.
          </>
        }
        lede="MistRoot began as an argument about altitude and turned into an estate. This is the honest version — the bad first harvest included."
        meta={[
          { label: 'Founded', value: '2016' },
          { label: 'Elevation', value: '1,180 – 1,540 m' },
          { label: 'Shade species', value: '14 native' },
          { label: 'Crew', value: '31 people' },
        ]}
      />

      {/* ------------------------------------------------------- origin --- */}
      <section className="section story-origin">
        <div className="shell story-origin__inner">
          <div className="story-origin__col">
            <SectionHead
              kicker="How it started"
              title={<>We bought the wrong hill, then spent a year listening to it.</>}
            />
            <Reveal as="p" delay={0.12} className="story-origin__body">
              The broker described it as cardamom land with potential. What it actually was:
              a north-east facing spur that catches the valley cloud at half past four every
              afternoon from June to January, and holds it until the following morning. For
              cardamom that is a fungal nightmare. For coffee it is a gift nobody had
              thought to unwrap.
            </Reveal>
            <Reveal as="p" delay={0.18} className="story-origin__body">
              We planted nothing in the first year. We put up four cheap weather loggers,
              walked the boundary every week, and drew a map of where the mist actually
              sat — which turned out to be nothing like the contour lines suggested. Those
              four blocks became the Cloudline lot. The rest of the estate was planted to
              serve them.
            </Reveal>
          </div>

          <Reveal className="story-quote" delay={0.14} preset="fadeUp">
            <blockquote>
              <p>
                “Everyone told us to clear the shade trees and double the yield. We counted
                them instead. There were two hundred and six.”
              </p>
              <footer>
                <span className="story-quote__name">Anjali Kadamba</span>
                <span className="story-quote__role">Founder</span>
              </footer>
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------- values --- */}
      <section className="section section--raised story-values">
        <div className="shell">
          <SectionHead
            kicker="What we hold to"
            title={<>Four rules, and we have broken none of them.</>}
            lede="They are not marketing lines. Each one costs us money every single season, which is how we know they are real."
          />
          <RevealGroup className="story-values__grid" each={0.1}>
            {VALUES.map(({ Icon, name, body }) => (
              <RevealItem key={name}>
                <motion.article
                  className="value"
                  initial="rest"
                  whileHover="hover"
                  animate="rest"
                >
                  <motion.span
                    className="value__icon"
                    variants={{
                      rest: { y: 0, color: 'rgba(200,164,90,0.8)' },
                      hover: {
                        y: -5,
                        color: 'rgb(227,196,129)',
                        transition: { duration: 0.45, ease: EASE_OUT },
                      },
                    }}
                  >
                    <Icon size={30} />
                  </motion.span>
                  <h3 className="value__name">{name}</h3>
                  <p className="value__body">{body}</p>
                  <motion.span
                    className="value__rule"
                    variants={{
                      rest: { scaleX: 0 },
                      hover: { scaleX: 1, transition: { duration: 0.55, ease: EASE_OUT } },
                    }}
                  />
                </motion.article>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ---------------------------------------------------- film band --- */}
      <section className="story-band" ref={bandRef}>
        <div className="story-band__media">
          <motion.video
            className="story-band__video"
            src={heroVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-hidden="true"
            tabIndex={-1}
            style={reduced ? undefined : { y: bandY, scale: bandScale }}
          />
        </div>
        <div className="story-band__scrim" aria-hidden="true" />
        <div className="shell story-band__copy">
          <Reveal preset="fadeUp">
            <p className="story-band__quote">
              The ridge decides the harvest. We just try to keep up with it.
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="story-band__caption">
              Block 4, first light · November
            </p>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------------------------------- timeline --- */}
      <section className="section story-time">
        <div className="shell">
          <SectionHead
            kicker="Ten years, roughly"
            title={<>A slow, occasionally humiliating education.</>}
          />

          <div className="story-time__track" ref={trackRef}>
            <div className="story-time__spine" aria-hidden="true">
              <motion.span
                className="story-time__spine-fill"
                style={reduced ? { scaleY: 1 } : { scaleY: trackProgress }}
              />
            </div>

            <RevealGroup className="story-time__list" each={0.06}>
              {TIMELINE.map((t) => (
                <RevealItem className="story-time__item" key={t.year}>
                  <span className="story-time__dot" aria-hidden="true" />
                  <span className="story-time__year display">{t.year}</span>
                  <div className="story-time__text">
                    <h3 className="story-time__title">{t.title}</h3>
                    <p>{t.body}</p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- people --- */}
      <section className="section section--raised story-people">
        <div className="shell">
          <SectionHead
            kicker="Who is up there"
            title={<>Thirty-one people. Three of them answer the phone.</>}
          />
          <RevealGroup className="story-people__grid" each={0.1}>
            {PEOPLE.map((p) => (
              <RevealItem key={p.name}>
                <motion.article
                  className="person"
                  initial="rest"
                  whileHover="hover"
                  animate="rest"
                >
                  <motion.span
                    className="person__monogram display"
                    variants={{
                      rest: { scale: 1, borderColor: 'rgba(245,234,217,0.12)' },
                      hover: {
                        scale: 1.04,
                        borderColor: 'rgba(200,164,90,0.55)',
                        transition: { duration: 0.5, ease: EASE_OUT },
                      },
                    }}
                  >
                    {p.initials}
                  </motion.span>
                  <h3 className="person__name">{p.name}</h3>
                  <p className="person__role">{p.role}</p>
                  <p className="person__line">{p.line}</p>
                </motion.article>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal delay={0.2} className="story-people__cta">
            <ArrowLink to="/experiences">Come and meet them</ArrowLink>
          </Reveal>
        </div>
      </section>
    </Page>
  );
}
