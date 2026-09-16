import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import wordmark from '../assets/brand/mistroot-wordmark.png';
import Reveal, { RevealGroup, RevealItem } from './Reveal';
import { EASE_OUT } from '../lib/motion';
import { InstagramIcon, JournalIcon, XIcon, YoutubeIcon } from './Icons';
import './Footer.css';

const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com', Icon: InstagramIcon },
  { label: 'X', href: 'https://x.com', Icon: XIcon },
  { label: 'Film journal', href: 'https://youtube.com', Icon: YoutubeIcon },
  { label: 'The Ledger', href: '#', Icon: JournalIcon },
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
      { label: 'Brew recipes', to: '/brewing' },
      { label: 'Harvest calendar', to: '/experiences' },
      { label: 'Coorg & Brahmagiri', to: '/story' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <hr className="hairline" />
      <div className="shell shell--wide footer__inner">
        <RevealGroup className="footer__grid" each={0.08}>
          <RevealItem className="footer__brand">
            <img src={wordmark} alt="MistRoot Coffee" className="footer__wordmark" />
            <p className="footer__blurb">
              Three generations of coffee in the hills of Coorg, now a club for anyone
              curious enough to taste it properly. Sourced from our own hills and beyond,
              roasted in small batches, shared slowly.
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
              <h4 className="footer__col-title">{col.title}</h4>
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
            <h4 className="footer__col-title">Find us</h4>
            <address>
              MistRoot Estate
              <br />
              Brahmagiri Range, Kodagu (Coorg)
              <br />
              Karnataka 571 247
            </address>
            <p className="footer__hours">
              Tasting room · Thu–Sun · 08:00–17:00
              <br />
              <a href="tel:+917022919007" className="footer__phone">
                +91 70229 19007
              </a>
            </p>
          </RevealItem>
        </RevealGroup>

        <Reveal className="footer__base" preset="fadeIn">
          <p>© {new Date().getFullYear()} MistRoot Coffee Estates LLP</p>
          <p className="footer__base-mid">
            Elevation 800 – 1,200 m · 12.3833° N, 75.5167° E
          </p>
          <p>Mist. Mountains. Memories.</p>
        </Reveal>
      </div>
    </footer>
  );
}
