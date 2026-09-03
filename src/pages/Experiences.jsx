import { useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import Page from '../components/Page';
import PageHero from '../components/PageHero';
import SectionHead from '../components/SectionHead';
import Reveal, { RevealGroup, RevealItem } from '../components/Reveal';
import ArrowLink from '../components/ArrowLink';
import ButtonLink from '../components/ButtonLink';
import { EASE_OUT } from '../lib/motion';
import { Basket, Compass, Cup } from '../components/Icons';
import './Experiences.css';

const EXPERIENCES = [
  {
    no: '01',
    id: 'walk',
    Icon: Compass,
    name: 'Estate Walks',
    sub: 'The two-hour version of everything',
    body: 'We leave the tasting room at 06:15, while the cloud is still lying in the valley below the pulping shed. You will walk the four Cloudline blocks, put your hand on a rosewood that predates the estate by a century, and learn to tell a ripe cherry from a nearly-ripe one by squeezing it. It ends at the nursery with a cup of whatever came off the drum that week.',
    detail: [
      { k: 'Duration', v: '2 hours' },
      { k: 'Starts', v: '06:15, Thu–Sun' },
      { k: 'Group', v: '2–10 people' },
      { k: 'Season', v: 'Year round' },
      { k: 'From', v: '₹1,400' },
    ],
  },
  {
    no: '02',
    id: 'harvest',
    Icon: Basket,
    name: 'Harvest Experience',
    sub: 'Pick with the crew, get your basket weighed',
    body: 'From November to February you can join a picking pass. You are given a basket, a row and a supervisor who will politely reject anything under-ripe. Most guests fill about four kilos in three hours; the crew average is nineteen. At the end your cherry goes through the pulper with the day’s intake and we write your name on the drying bed it lands in.',
    detail: [
      { k: 'Duration', v: 'Half day' },
      { k: 'Starts', v: '07:00, by booking' },
      { k: 'Group', v: '2–6 people' },
      { k: 'Season', v: 'Nov – Feb' },
      { k: 'From', v: '₹3,200' },
    ],
  },
  {
    no: '03',
    id: 'bean',
    Icon: Cup,
    name: 'Bean-to-Cup Journey',
    sub: 'One cherry, followed all the way down',
    body: 'The long one. You start at the tree at first light and finish at the cupping table after dark, having pulped, fermented, turned a drying bed, sorted by hand, roasted a 500 g sample and cupped it blind against two of our production lots. Lunch is on the drying yard. Twelve guests a month, no more, because there is only one drum.',
    detail: [
      { k: 'Duration', v: 'Full day, 12 hrs' },
      { k: 'Starts', v: '05:45, second Sat' },
      { k: 'Group', v: '4 people max' },
      { k: 'Season', v: 'Dec – Mar' },
      { k: 'From', v: '₹8,500' },
    ],
  },
];

const PRACTICAL = [
  {
    q: 'Getting here',
    a: 'Four hours from Bengaluru by road, ninety minutes from Chikkamagaluru town. The last two kilometres are unsealed and steep — a hatchback manages it in dry weather, not in monsoon.',
  },
  {
    q: 'What to wear',
    a: 'Closed shoes with grip, sleeves, and something you do not mind staining. It is 14–18 °C at dawn on the ridge even in April. Leeches appear in the wet months; we hand out salt.',
  },
  {
    q: 'Eating',
    a: 'Every experience includes food cooked by the estate kitchen — rice, greens from the kitchen garden, and whatever the pepper vines are doing. Tell us about allergies when you book, not when you arrive.',
  },
  {
    q: 'Children & dogs',
    a: 'Both welcome on the walks, neither on harvest days for the obvious reasons. There are three estate dogs and they will find you long before you find them.',
  },
];

export default function Experiences() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState('walk');
  const listRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ['start end', 'end start'],
  });
  const driftA = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <Page title="Experiences — MistRoot Coffee">
      <PageHero
        kicker="Experiences"
        title={
          <>
            Come up before dawn. <em>Leave smelling of it.</em>
          </>
        }
        lede="Three ways onto the ridge, all of them hands-on and none of them a tour. You will be given something to carry."
        meta={[
          { label: 'Open', value: 'Thu – Sun' },
          { label: 'First light', value: '06:15' },
          { label: 'Harvest', value: 'Nov – Feb' },
          { label: 'Max group', value: '10' },
        ]}
      />

      {/* -------------------------------------------------------- the three */}
      <section className="section xp" ref={listRef}>
        <motion.div
          className="xp__drift"
          aria-hidden="true"
          style={reduced ? undefined : { y: driftA }}
        />
        <div className="shell">
          {EXPERIENCES.map((x, i) => {
            const isOpen = open === x.id;
            return (
              <Reveal key={x.id} delay={i * 0.06}>
                <motion.article
                  className={`xp__row ${isOpen ? 'is-open' : ''}`}
                  initial="rest"
                  whileHover="hover"
                  animate="rest"
                >
                  <button
                    type="button"
                    className="xp__head"
                    aria-expanded={isOpen}
                    aria-controls={`xp-${x.id}`}
                    onClick={() => setOpen(isOpen ? null : x.id)}
                  >
                    <span className="numeral xp__no">{x.no}</span>

                    <motion.span
                      className="xp__icon"
                      variants={{
                        rest: { color: 'rgba(200,164,90,0.7)', rotate: 0 },
                        hover: {
                          color: 'rgb(227,196,129)',
                          rotate: -4,
                          transition: { duration: 0.5, ease: EASE_OUT },
                        },
                      }}
                    >
                      <x.Icon size={26} />
                    </motion.span>

                    <span className="xp__titles">
                      <motion.span
                        className="xp__name"
                        variants={{
                          rest: { x: 0 },
                          hover: { x: 8, transition: { duration: 0.5, ease: EASE_OUT } },
                        }}
                      >
                        {x.name}
                      </motion.span>
                      <span className="xp__sub">{x.sub}</span>
                    </span>

                    <motion.span
                      className="xp__toggle"
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.4, ease: EASE_OUT }}
                      aria-hidden="true"
                    >
                      <span />
                      <span />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`xp-${x.id}`}
                        className="xp__panel"
                        initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        animate={reduced ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                        exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.55, ease: EASE_OUT }}
                      >
                        <div className="xp__panel-inner">
                          <p className="xp__body">{x.body}</p>

                          <dl className="xp__detail">
                            {x.detail.map((d) => (
                              <div key={d.k}>
                                <dt>{d.k}</dt>
                                <dd>{d.v}</dd>
                              </div>
                            ))}
                          </dl>

                          <div className="xp__actions">
                            <ButtonLink to="/contact">Request this date</ButtonLink>
                            <span className="xp__note">
                              We confirm within two working days · deposit on confirmation
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.span
                    className="xp__underline"
                    variants={{
                      rest: { scaleX: 0 },
                      hover: { scaleX: 1, transition: { duration: 0.6, ease: EASE_OUT } },
                    }}
                  />
                </motion.article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ----------------------------------------------------- practical --- */}
      <section className="section section--raised xp-practical">
        <div className="shell xp-practical__inner">
          <SectionHead
            kicker="Before you set off"
            title={<>The ridge is not far. It is just slow to reach.</>}
          />
          <RevealGroup className="xp-practical__grid" each={0.09}>
            {PRACTICAL.map((p) => (
              <RevealItem className="practical" key={p.q}>
                <h3 className="practical__q">{p.q}</h3>
                <p className="practical__a">{p.a}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* -------------------------------------------------------- closing -- */}
      <section className="section xp-close">
        <div className="shell xp-close__inner">
          <SectionHead
            align="center"
            kicker="Dates open monthly"
            title={<>Harvest slots go in a week. Walks rarely do.</>}
            lede="Tell us roughly when you want to come and how many of you there are. We will send back what is actually available rather than a booking form."
          />
          <Reveal delay={0.2} className="xp-close__actions">
            <ButtonLink to="/contact">Ask about a date</ButtonLink>
            <ArrowLink to="/story">Read the estate’s story</ArrowLink>
          </Reveal>
        </div>
      </section>
    </Page>
  );
}
