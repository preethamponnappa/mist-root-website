import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';
import './ScrollProgress.css';

/** Hairline read-out of how far through a chapter you are. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reduced = useReducedMotion();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });

  return (
    <motion.div
      className="scroll-progress"
      style={{ scaleX: reduced ? scrollYProgress : scaleX }}
      aria-hidden="true"
    />
  );
}
