import { motion } from 'motion/react';
import { pageTransition, useReducedMotionSafe } from '../lib/motion';

/**
 * Every route renders through this so AnimatePresence has a consistent
 * element to cross-fade. The document head is handled separately by <Seo />,
 * which reads its values from src/lib/seo.js.
 */
export default function Page({ children }) {
  const reduced = useReducedMotionSafe();

  const variants = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : pageTransition;

  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={variants}>
      {children}
    </motion.div>
  );
}
