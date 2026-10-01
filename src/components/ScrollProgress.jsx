import { motion, useScroll, useSpring } from 'motion/react';
import { useReducedMotionSafe } from '../lib/motion';
import './ScrollProgress.css';

/** Hairline read-out of how far through a chapter you are. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reduced = useReducedMotionSafe();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });

  return (
    <motion.div
      className="scroll-progress"
      style={{ scaleX: reduced ? scrollYProgress : scaleX }}
      aria-hidden="true"
    />
  );
}
