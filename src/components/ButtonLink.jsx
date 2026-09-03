import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { EASE_OUT } from '../lib/motion';
import { ArrowUpRight } from './Icons';

const MotionLink = motion.create(Link);

const lift = {
  rest: { y: 0 },
  hover: { y: -3, transition: { duration: 0.32, ease: EASE_OUT } },
};

const arrowStep = {
  rest: { x: 0, y: 0 },
  hover: { x: 3, y: -3, transition: { duration: 0.32, ease: EASE_OUT } },
};

/**
 * The site's primary call to action. Animating the anchor itself — rather than
 * a wrapper — keeps it to a single tab stop; Motion adds `tabindex` to any
 * non-interactive element it attaches tap gestures to.
 */
export default function ButtonLink({
  to,
  variant = 'gold',
  arrow = true,
  className = '',
  children,
  ...rest
}) {
  const reduced = useReducedMotion();

  return (
    <MotionLink
      to={to}
      className={`btn btn--${variant} ${className}`}
      initial="rest"
      animate="rest"
      whileHover={reduced ? undefined : 'hover'}
      whileFocus={reduced ? undefined : 'hover'}
      whileTap={reduced ? undefined : { scale: 0.98 }}
      variants={lift}
      {...rest}
    >
      {children}
      {arrow && (
        <motion.span className="btn__arrow" variants={arrowStep}>
          <ArrowUpRight size={13} />
        </motion.span>
      )}
    </MotionLink>
  );
}
