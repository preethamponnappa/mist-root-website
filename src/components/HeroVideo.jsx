import { useEffect, useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import heroVideo from '../../assests/video/hero_section.mp4';
import heroPoster from '../assets/hero-poster.webp';
import lockup from '../assets/brand/mistroot-lockup.png';
import { EASE_OUT, useReducedMotionSafe } from '../lib/motion';
import ButtonLink from './ButtonLink';
import { ArrowDown } from './Icons';
import './HeroVideo.css';

/** Words rise one after another from behind their own baseline. */
function WordReveal({ text, className, delay = 0 }) {
  const reduced = useReducedMotionSafe();
  const words = text.split(' ');
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span className="wr__mask" key={`${w}-${i}`}>
          <motion.span
            className="wr__word"
            initial={reduced ? { y: 0 } : { y: '112%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT, delay: delay + i * 0.05 }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export default function HeroVideo() {
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const reduced = useReducedMotionSafe();

  // The footage is the heaviest thing on the site, so it is not marked
  // autoplay and nothing is fetched until we ask for it — the poster frame
  // carries the hero until then. Three people never get the download at all:
  // anyone who has asked for reduced motion, anyone on Data Saver, and anyone
  // the browser reports as being on a 2G-class connection. They keep the
  // poster, which is what the first frame looks like anyway.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const connection = navigator.connection;
    const slowLink =
      Boolean(connection?.saveData) || ['slow-2g', '2g'].includes(connection?.effectiveType);

    if (prefersReduced || slowLink) return;

    // Some browsers ignore the JSX `muted` prop on first paint; enforce it,
    // then swallow the rejection if autoplay policy blocks us anyway.
    v.muted = true;
    v.play().catch(() => {});
  }, []);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  // Footage drifts slower than the page and swells slightly — classic parallax.
  const mediaY = useTransform(smooth, [0, 1], ['0%', '16%']);
  const mediaScale = useTransform(smooth, [0, 1], [1, 1.14]);
  const mediaFade = useTransform(smooth, [0, 0.85], [1, 0.35]);
  // Copy leaves faster than the footage, so the layers separate on the way out.
  const copyY = useTransform(smooth, [0, 1], [0, -110]);
  const copyFade = useTransform(smooth, [0, 0.45], [1, 0]);
  const cueFade = useTransform(smooth, [0, 0.15], [1, 0]);

  const still = { y: 0, scale: 1, opacity: 1 };

  return (
    <section className="hero" ref={heroRef}>
      <div className="hero__viewport">
        <motion.div
          className="hero__parallax"
          style={reduced ? still : { y: mediaY, scale: mediaScale, opacity: mediaFade }}
        >
          <video
            ref={videoRef}
            className="hero__video"
            src={heroVideo}
            poster={heroPoster}
            width={1280}
            height={720}
            loop
            muted
            playsInline
            preload="none"
            aria-hidden="true"
            tabIndex={-1}
          />
        </motion.div>
      </div>

      {/* Static overlays — deliberately outside the parallax layer so the seam
          at the foot of the video never drifts while the footage moves. */}
      <div className="hero__topscrim" aria-hidden="true" />
      <div className="hero__vignette" aria-hidden="true" />
      <div className="hero__blend" aria-hidden="true" />

      <motion.div
        className="hero__content shell"
        style={reduced ? { opacity: 1 } : { y: copyY, opacity: copyFade }}
      >
        <motion.p
          className="hero__eyebrow"
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.1 }}
        >
          Western Ghats · Shade Grown · 800–1,200&nbsp;m
        </motion.p>

        <motion.img
          src={lockup}
          alt="MistRoot Coffee"
          width={1000}
          height={761}
          fetchPriority="high"
          decoding="async"
          className="hero__lockup"
          initial={reduced ? false : { opacity: 0, scale: 1.05, filter: 'blur(6px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1, ease: EASE_OUT, delay: 0.2 }}
        />

        <h1 className="hero__tagline">
          {/* the split words are decorative; assistive tech reads the clean line */}
          <span className="visually-hidden">Mist. Mountains. Memories.</span>
          <span aria-hidden="true">
            <WordReveal text="Mist. Mountains." delay={0.36} />{' '}
            <em>
              <WordReveal text="Memories." delay={0.56} />
            </em>
          </span>
        </h1>

        <motion.div
          className="hero__actions"
          initial={reduced ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.85 }}
        >
          <ButtonLink to="/experiences">Walk the estate</ButtonLink>
          <ButtonLink to="/story" variant="ghost" arrow={false}>
            Our story
          </ButtonLink>
        </motion.div>
      </motion.div>

      <motion.div className="hero__cue" style={reduced ? { opacity: 1 } : { opacity: cueFade }}>
        <motion.span
          className="hero__cue-label"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 1 }}
        >
          Scroll
        </motion.span>
        <motion.span
          className="hero__cue-icon"
          animate={reduced ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowDown size={14} />
        </motion.span>
      </motion.div>
    </section>
  );
}
