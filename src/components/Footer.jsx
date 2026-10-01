import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import wordmark from '../assets/brand/mistroot-wordmark.png';
import Reveal, { RevealGroup, RevealItem } from './Reveal';
import { EASE_OUT } from '../lib/motion';
import { InstagramIcon } from './Icons';
import { BUSINESS, mailtoHref, telHref } from '../data/business';
import { METHODS } from '../data/brewing';
import './Footer.css';

const SOCIALS = [
  { label: 'Instagram', href: 'https://www.instagram.com/mistrootcoffee/', Icon: InstagramIcon },
];

const COLUMNS = [
  {
    title: 'Wander',
    links: [
      { label: 'Our Story', to: '/story' },
      { label: 'Coffee Club', to: '/club' },
      { label: 'Brewing', to: '/brewing' },
      { label: 'Experiences', to: '/experiences' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'The Coffee',
    links: [
      { label: 'The current release', to: '/club' },
      { label: 'Harvest calendar', to: '/experiences' },
      // Was pointing at /story, which is about the family rather than the region.
      { label: 'Coorg coffee guide', to: '/coorg-coffee' },
    ],
  },
  {
    title: 'Brew it',
    links: METHODS.map((method) => ({
      label: method.name,
      to: `/brewing/${method.id}`,
    })),
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <hr className="hairline" />
      <div className="shell shell--wide footer__inner">
        <RevealGroup className="footer__grid" each={0.08}>
          <RevealItem className="footer__brand">
            <img
              src={wordmark}
              alt="MistRoot Coffee"
              width={1000}
              height={198}
              loading="lazy"
              decoding="async"
              className="footer__wordmark"
            />
            <p className="footer__blurb">
              MistRoot (Mist Root) Coffee is three generations of coffee in the hills of
              Coorg, now a club for anyone curious enough to taste it properly. Sourced
              from our own hills and beyond, roasted in small batches, shared slowly.
            </p>
            <ul className="footer__socials">
              {SOCIALS.map(({ label, href, Icon }) => (
                <li key={label}>
                  <motion.a
                    href={href}
                    className="footer__social"
                    target="_blank"
                    rel="noreferrer noopener"
                    whileHover={{ y: -4, color: 'var(--gold-bright)' }}
                    whileTap={{ scale: 0.94 }}
                    transition={{ duration: 0.3, ease: EASE_OUT }}
                  >
                    <Icon size={17} />
                    <span className="visually-hidden">{label}</span>
                  </motion.a>
                </li>
              ))}
            </ul>
          </RevealItem>

          {COLUMNS.map((col) => (
            <RevealItem className="footer__col" key={col.title}>
              <h2 className="footer__col-title">{col.title}</h2>
              <ul>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <motion.span
                      className="footer__link-wrap"
                      initial="rest"
                      whileHover="hover"
                      animate="rest"
                    >
                      <Link to={l.to} className="footer__link">
                        {l.label}
                      </Link>
                      <motion.span
                        className="footer__link-rule"
                        variants={{
                          rest: { scaleX: 0 },
                          hover: { scaleX: 1, transition: { duration: 0.4, ease: EASE_OUT } },
                        }}
                      />
                    </motion.span>
                  </li>
                ))}
              </ul>
            </RevealItem>
          ))}

          <RevealItem className="footer__col footer__col--find">
            <h2 className="footer__col-title">Find us</h2>
            <address>
              {BUSINESS.address.street}
              <br />
              {BUSINESS.address.locality}
              <br />
              {BUSINESS.address.region} {BUSINESS.address.postalCode}
            </address>
            <p className="footer__hours">
              Tasting room · {BUSINESS.hours.short} · {BUSINESS.hours.opens}–{BUSINESS.hours.closes}
              <br />
              <a href={telHref} className="footer__phone">
                {BUSINESS.phoneDisplay}
              </a>
              <br />
              <a href={mailtoHref} className="footer__phone">
                {BUSINESS.email}
              </a>
            </p>
          </RevealItem>
        </RevealGroup>

        <Reveal className="footer__base" preset="fadeIn">
          <p>
            © {new Date().getFullYear()} {BUSINESS.name}
          </p>
          <p className="footer__base-mid">
            Elevation {BUSINESS.elevation} · {BUSINESS.geoDisplay}
          </p>
          <p>Mist. Mountains. Memories.</p>
        </Reveal>
      </div>
    </footer>
  );
}
