import { motion, useReducedMotion } from 'motion/react';
import { fadeUp, fadeIn, scaleIn, maskUp, still, stagger, viewportOnce } from '../lib/motion';

const PRESETS = { fadeUp, fadeIn, scaleIn, maskUp };

/**
 * Scroll-triggered reveal. Every section on the site animates in through this
 * so timing stays consistent, and so `prefers-reduced-motion` only has to be
 * honoured in one place.
 */
export default function Reveal({
  as = 'div',
  preset = 'fadeUp',
  delay = 0,
  duration,
  className,
  children,
  ...rest
}) {
  const reduced = useReducedMotion();
  const Tag = motion[as] ?? motion.div;
  const base = reduced ? still : (PRESETS[preset] ?? fadeUp);

  const variants = reduced
    ? base
    : {
        hidden: base.hidden,
        show: {
          ...base.show,
          transition: {
            ...base.show.transition,
            ...(duration ? { duration } : null),
            delay,
          },
        },
      };

  return (
    <Tag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Parent wrapper that staggers any Reveal/motion children beneath it. */
export function RevealGroup({
  as = 'div',
  each = 0.09,
  delayChildren = 0,
  className,
  children,
  ...rest
}) {
  const reduced = useReducedMotion();
  const Tag = motion[as] ?? motion.div;

  return (
    <Tag
      className={className}
      variants={reduced ? still : stagger(each, delayChildren)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Child of a RevealGroup — inherits the parent's stagger instead of its own viewport. */
export function RevealItem({ as = 'div', preset = 'fadeUp', className, children, ...rest }) {
  const reduced = useReducedMotion();
  const Tag = motion[as] ?? motion.div;
  return (
    <Tag className={className} variants={reduced ? still : (PRESETS[preset] ?? fadeUp)} {...rest}>
      {children}
    </Tag>
  );
}
