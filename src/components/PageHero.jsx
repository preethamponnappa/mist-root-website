import { motion, useReducedMotion } from 'motion/react';
import Reveal from './Reveal';
import { EASE_OUT } from '../lib/motion';
import './PageHero.css';

/**
 * Opening block for every inner page. The title wipes up from its own
 * baseline; the meta row draws a hairline underneath it.
 */
export default function PageHero({ kicker, title, lede, meta = [] }) {
  const reduced = useReducedMotion();

  return (
    <header className="pagehero page-top">
      <div className="pagehero__glow" aria-hidden="true" />
      <div className="shell pagehero__inner">
        <motion.p
          className="eyebrow"
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.1 }}
        >
          {kicker}
        </motion.p>

        <h1 className="pagehero__title">
          <span className="pagehero__mask">
            <motion.span
              className="pagehero__line"
              initial={reduced ? false : { y: '108%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 1, ease: EASE_OUT, delay: 0.2 }}
            >
              {title}
            </motion.span>
          </span>
        </h1>

        {lede && (
          <motion.p
            className="lede pagehero__lede"
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.42 }}
          >
            {lede}
          </motion.p>
        )}

        {meta.length > 0 && (
          <Reveal delay={0.5}>
            <dl className="pagehero__meta">
              {meta.map((m) => (
                <div key={m.label}>
                  <dt>{m.label}</dt>
                  <dd>{m.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}
      </div>
    </header>
  );
}
