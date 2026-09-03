import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { EASE_OUT } from '../lib/motion';
import { ArrowRight } from './Icons';
import './ArrowLink.css';

const MotionLink = motion.create(Link);

/** Quiet text link: the rule draws itself in and the arrow steps forward. */
export default function ArrowLink({ to, children, className = '', ...rest }) {
  return (
    <MotionLink
      to={to}
      className={`arrowlink ${className}`}
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileFocus="hover"
      {...rest}
    >
      <span className="arrowlink__label">
        {children}
        <motion.span
          className="arrowlink__rule"
          variants={{
            rest: { scaleX: 0, originX: 1 },
            hover: { scaleX: 1, originX: 0, transition: { duration: 0.5, ease: EASE_OUT } },
          }}
        />
      </span>
      <motion.span
        className="arrowlink__arrow"
        variants={{
          rest: { x: 0 },
          hover: { x: 5, transition: { duration: 0.4, ease: EASE_OUT } },
        }}
      >
        <ArrowRight size={15} />
      </motion.span>
    </MotionLink>
  );
}
