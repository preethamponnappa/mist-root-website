import { useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { pageTransition } from '../lib/motion';

/**
 * Every route renders through this so AnimatePresence has a consistent
 * element to cross-fade, and so the document title stays in sync.
 */
export default function Page({ title, children }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (title) document.title = title;
  }, [title]);

  const variants = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : pageTransition;

  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={variants}>
      {children}
    </motion.div>
  );
}
