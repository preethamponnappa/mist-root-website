/* Shared motion language for MistRoot.
   One vocabulary of eases + variants so every section moves like the same brand:
   slow, weighted, never bouncy. */

import { useSyncExternalStore } from 'react';

export const EASE_OUT = [0.22, 1, 0.36, 1];
export const EASE_IN_OUT = [0.65, 0, 0.35, 1];

/**
 * Reveals share a viewport contract: fire once, a little before fully on-screen.
 *
 * `amount: 'some'` rather than a fraction, deliberately. A fraction asks for
 * that proportion of the element to be on screen at once, which an element
 * taller than the viewport can never satisfy — the coffee grid on /club is
 * 3,200px of stacked cards on a phone, so a 0.25 threshold left it invisible
 * at every scroll position. The negative bottom margin is what keeps the
 * "a little before" feel: the trigger line sits at 88% of the viewport height.
 */
export const viewportOnce = { once: true, amount: 'some', margin: '0px 0px -12% 0px' };

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

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeToReducedMotion(onChange) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function readReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/** The prerender has no media queries, so it always renders the full-motion markup. */
function readReducedMotionOnServer() {
  return false;
}

/**
 * Hydration-safe `prefers-reduced-motion`.
 *
 * Motion's own `useReducedMotion()` returns `null` while server rendering but
 * the real preference on the client's very first render, so a reduced-motion
 * visitor would hydrate against markup the prerender never produced. Going
 * through `useSyncExternalStore` makes React use the server snapshot for both
 * the prerender and hydration, then settle to the true preference immediately
 * after — no mismatch, and it still reacts live when the OS setting changes.
 *
 * Use this everywhere instead of importing `useReducedMotion` from
 * `motion/react` directly.
 */
export function useReducedMotionSafe() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    readReducedMotion,
    readReducedMotionOnServer,
  );
}
