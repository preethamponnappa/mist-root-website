import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import Page from '../components/Page';
import PageHero from '../components/PageHero';
import SectionHead from '../components/SectionHead';
import Reveal, { RevealGroup, RevealItem } from '../components/Reveal';
import ArrowLink from '../components/ArrowLink';
import ButtonLink from '../components/ButtonLink';
import heroVideo from '../../assests/video/hero_section.mp4';
import { EASE_OUT } from '../lib/motion';
import { Droplet, Hourglass, Leaf, Mountain } from '../components/Icons';
import './Story.css';

const LESSONS = [
  {
    Icon: Droplet,
    name: 'Rain',
    body: 'The south-west monsoon arrives in June and does not really let go until October. It decides the flowering, the ripening and — more than once — the entire harvest calendar.',
  },
  {
    Icon: Mountain,
    name: 'Altitude',
    body: 'Between 800 and 1,200 metres the cherry takes its time. Slow is the whole point: sugars laid down in unhurried layers rather than rushed into being.',
  },
  {
    Icon: Leaf,
    name: 'Shade',
    body: 'Rosewood, jackfruit, silver oak, wild fig, and pepper climbing up their trunks. Coorg coffee grows under a forest, not in rows under the sun. The canopy is the cooling system.',
  },
  {
    Icon: Hourglass,
    name: 'Patience',
    body: 'You cannot argue with a hillside about timing. Every good coffee we have ever tasted came from somebody who was willing to wait for it.',
  },
];

const JOURNEY = [
  {
    step: 'Grow',
    title: 'Where it began',
    body: 'Three generations in the hills of Coorg, among rain, shade, pepper vines and old trees. Coffee was never a product in our house. It was the season, the weather report and most of the conversation.',
  },
  {
    step: 'Source',
    title: 'Curiosity beyond the estate',
    body: 'Our roots are in farming; our curiosity took us further. We began looking at other origins, varieties and processing methods — Arabica and Robusta, washed, natural and experimental — and buying the lots that genuinely excited us.',
  },
  {
    step: 'Brew',
    title: 'The same bean, six ways',
    body: 'A V60 can turn a familiar coffee into something unrecognisable. A cold brew can change the mind of someone who has always said they dislike black coffee. Once you have seen that happen, it is difficult to stop experimenting.',
  },
  {
    step: 'Share',
    title: 'The part we were actually after',
    body: 'People are fascinated by coffee the moment somebody takes the time to explain it. That realisation is the whole reason MistRoot exists as a club rather than simply a bag with a label on it.',
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
            Rooted in Coorg. <em>Made for the journey.</em>
          </>
        }
        lede="Three generations of coffee. One new way of experiencing it."
        meta={[
          { label: 'Home', value: 'Coorg, Karnataka' },
          { label: 'Generations', value: 'Three' },
          { label: 'Grown at', value: '800 – 1,200 m' },
          { label: 'Now', value: 'A coffee club' },
        ]}
      />

      {/* ------------------------------------------------------- origin --- */}
      <section className="section story-origin">
        <div className="shell">
          <div className="story-origin__col">
            <SectionHead
              kicker="How it started"
              title={<>Coffee has never been just a crop to us.</>}
            />
            <Reveal as="p" delay={0.12} className="story-origin__body">
              It has been part of our family for generations — grown in the hills of Coorg,
              surrounded by rain, shade, pepper vines, old trees and the unmistakable rhythm
              of the Western Ghats.
            </Reveal>
            <Reveal as="p" delay={0.18} className="story-origin__body">
              We grew up seeing coffee not as something that begins in a packet, but as
              something that begins much earlier — in the soil, in the hands that cultivate
              it, and in the patience it takes to bring a cherry from blossom to bean.
            </Reveal>
            <Reveal as="p" delay={0.24} className="story-origin__body story-origin__body--lead">
              MistRoot was born from that connection.
            </Reveal>
            <Reveal as="p" delay={0.3} className="story-origin__body">
              We wanted to take what we love about Coorg coffee and make something beyond
              another coffee brand. Something people could taste, learn, experience and
              remember.
            </Reveal>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- pull quote --- */}
      <section className="story-pull">
        <div className="shell">
          <Reveal preset="fadeUp">
            <p className="story-pull__text">
              From the estate to the cup, every coffee has a story worth slowing down for.
            </p>
          </Reveal>
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
              The hills decide the harvest. We just try to keep up with them.
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="story-band__caption">Coorg, first light · Western Ghats</p>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------ lessons --- */}
      <section className="section section--raised story-values">
        <div className="shell">
          <SectionHead
            kicker="What the hills taught us"
            title={<>Place matters. Every detail leaves its mark.</>}
            lede="Rainfall, altitude, shade, soil, harvest, processing — change any one of them and you change what ends up in the cup. It was the first thing we learned here, and it is still the first thing we look for in any coffee we buy."
          />
          <RevealGroup className="story-values__grid" each={0.1}>
            {LESSONS.map(({ Icon, name, body }) => (
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

      {/* ---------------------------------------------------- community --- */}
      <section className="section story-time">
        <div className="shell">
          <SectionHead
            kicker="From growing coffee to building a community"
            title={<>Our roots are in coffee farming. Our curiosity took us further.</>}
            lede="That curiosity became the MistRoot Coffee Club — a place where coffee is not intimidating or overly complicated, but something you explore with friends, discover one cup at a time, and eventually make your own."
          />

          <div className="story-time__track" ref={trackRef}>
            <div className="story-time__spine" aria-hidden="true">
              <motion.span
                className="story-time__spine-fill"
                style={reduced ? { scaleY: 1 } : { scaleY: trackProgress }}
              />
            </div>

            <RevealGroup className="story-time__list" each={0.06}>
              {JOURNEY.map((j) => (
                <RevealItem className="story-time__item" key={j.step}>
                  <span className="story-time__dot" aria-hidden="true" />
                  <span className="story-time__year display">{j.step}</span>
                  <div className="story-time__text">
                    <h3 className="story-time__title">{j.title}</h3>
                    <p>{j.body}</p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>

          <Reveal delay={0.2} className="story-time__cta">
            <ArrowLink to="/club">What the Coffee Club actually is</ArrowLink>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------ closing --- */}
      <section className="section section--raised story-close">
        <div className="shell story-close__inner">
          <Reveal preset="fadeUp">
            <p className="eyebrow eyebrow--bare">Where MistRoot begins</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="story-close__title display">Mist. Mountains. Memories.</h2>
          </Reveal>
          <Reveal as="p" delay={0.16} className="story-close__body">
            That is not just a tagline. It is the place we come from, and the reason any of
            this exists.
          </Reveal>
          <Reveal delay={0.24} className="story-close__actions">
            <ButtonLink to="/club">Meet the Coffee Club</ButtonLink>
            <ArrowLink to="/experiences">Or come up to Coorg</ArrowLink>
          </Reveal>
        </div>
      </section>
    </Page>
  );
}
