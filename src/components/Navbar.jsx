import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react';
import mark from '../assets/brand/mistroot-mark.png';
import { EASE_OUT } from '../lib/motion';
import { ArrowUpRight } from './Icons';
import './Navbar.css';

const MotionNavLink = motion.create(NavLink);

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/story', label: 'Our Story' },
  { to: '/brewing', label: 'Brewing' },
  { to: '/experiences', label: 'Experiences' },
  { to: '/contact', label: 'Contact' },
];

/* The label rolls: the visible line lifts out while its clone rises in. */
const labelStack = {
  rest: { y: '0%' },
  hover: { y: '-100%', transition: { duration: 0.42, ease: EASE_OUT } },
};

function DeskLink({ to, label }) {
  const reduced = useReducedMotion();
  return (
    <NavLink to={to} end={to === '/'} className="navlink">
      {({ isActive }) => (
        <motion.span
          className="navlink__viewport"
          initial="rest"
          animate="rest"
          whileHover={reduced ? undefined : 'hover'}
          whileFocus={reduced ? undefined : 'hover'}
        >
          <motion.span className="navlink__stack" variants={labelStack}>
            <span className="navlink__line">{label}</span>
            <span className="navlink__line navlink__line--clone" aria-hidden="true">
              {label}
            </span>
          </motion.span>
          {isActive && (
            <motion.span
              layoutId="nav-active"
              className="navlink__marker"
              transition={{ duration: 0.5, ease: EASE_OUT }}
            />
          )}
        </motion.span>
      )}
    </NavLink>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const { pathname } = useLocation();
  const reduced = useReducedMotion();
  const [seenPath, setSeenPath] = useState(pathname);

  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 48));

  // Navigating closes the sheet — derived during render rather than in an
  // effect, so it never costs a second paint with the menu still open.
  if (pathname !== seenPath) {
    setSeenPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <motion.header
        className={`nav ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}
        initial={reduced ? false : { y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.25 }}
      >
        <div className="nav__inner shell shell--wide">
          <NavLink to="/" className="brand" aria-label="MistRoot Coffee — home">
            <motion.img
              src={mark}
              alt=""
              className="brand__mark"
              whileHover={{ scale: 1.07, rotate: -1.5 }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
            />
            <span className="brand__word display">MistRoot</span>
          </NavLink>

          <nav className="nav__links" aria-label="Primary">
            {NAV_LINKS.map((l) => (
              <DeskLink key={l.to} {...l} />
            ))}
          </nav>

          <div className="nav__end">
            <MotionNavLink
              to="/contact"
              className="nav__cta"
              initial="rest"
              animate="rest"
              whileHover="hover"
              whileFocus="hover"
            >
              <span>Visit the estate</span>
              <motion.span
                className="nav__cta-arrow"
                variants={{
                  rest: { x: 0, y: 0 },
                  hover: { x: 3, y: -3, transition: { duration: 0.35, ease: EASE_OUT } },
                }}
              >
                <ArrowUpRight size={13} />
              </motion.span>
              <motion.span
                className="nav__cta-fill"
                variants={{
                  rest: { scaleX: 0 },
                  hover: { scaleX: 1, transition: { duration: 0.45, ease: EASE_OUT } },
                }}
              />
            </MotionNavLink>

            <button
              type="button"
              className="nav__burger"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="visually-hidden">{open ? 'Close menu' : 'Open menu'}</span>
              <motion.span
                className="nav__burger-bar"
                animate={open ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.35, ease: EASE_OUT }}
              />
              <motion.span
                className="nav__burger-bar"
                animate={open ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.35, ease: EASE_OUT }}
              />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="sheet"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          >
            <motion.nav
              className="sheet__nav"
              aria-label="Mobile"
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.16 } } }}
            >
              {NAV_LINKS.map((l, i) => (
                <motion.div
                  key={l.to}
                  className="sheet__row"
                  variants={{
                    hidden: { opacity: 0, y: 26 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
                  }}
                >
                  <span className="numeral">{String(i + 1).padStart(2, '0')}</span>
                  <NavLink to={l.to} end={l.to === '/'} className="sheet__link">
                    {l.label}
                  </NavLink>
                </motion.div>
              ))}
            </motion.nav>
            <motion.p
              className="sheet__foot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.5 } }}
              exit={{ opacity: 0 }}
            >
              Kalamandi Ridge Estate · 1,540 m · Western Ghats
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
