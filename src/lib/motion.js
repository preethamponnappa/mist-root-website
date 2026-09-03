/* Shared motion language for MistRoot.
   One vocabulary of eases + variants so every section moves like the same brand:
   slow, weighted, never bouncy. */

export const EASE_OUT = [0.22, 1, 0.36, 1];
export const EASE_IN_OUT = [0.65, 0, 0.35, 1];

/** Reveals share a viewport contract: fire once, a little before fully on-screen. */
export const viewportOnce = { once: true, amount: 0.25, margin: '0px 0px -12% 0px' };

export const fadeUp = {
  hidden: { opacity: 0, y: 34 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: EASE_OUT },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 1, ease: EASE_OUT } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 1.06 },
  show: { opacity: 1, scale: 1, transition: { duration: 1.1, ease: EASE_OUT } },
};

/** Wipe a headline up from behind its own baseline (parent needs overflow:hidden). */
export const maskUp = {
  hidden: { y: '110%' },
  show: { y: '0%', transition: { duration: 0.95, ease: EASE_OUT } },
};

/** Parent for staggered children. `delayChildren` staggers whole groups. */
export const stagger = (each = 0.09, delayChildren = 0) => ({
  hidden: {},
  show: {
    transition: { staggerChildren: each, delayChildren },
  },
});

/** Page-level transition used by AnimatePresence in App.jsx. */
export const pageTransition = {
  initial: { opacity: 0, y: 18 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT, when: 'beforeChildren' },
  },
  exit: { opacity: 0, y: -12, transition: { duration: 0.35, ease: EASE_IN_OUT } },
};

/** Collapse every variant to its final state when the user asks for less motion. */
export const still = {
  hidden: { opacity: 1, y: 0, scale: 1 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0 } },
};
