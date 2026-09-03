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
      { label: 'Brewing', to: '/brewing' },
      { label: 'Experiences', to: '/experiences' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'The Estate',
    links: [
      { label: 'Kalamandi Ridge', to: '/story' },
      { label: 'Harvest calendar', to: '/experiences' },
      { label: 'Shade census', to: '/story' },
      { label: 'Cupping lab', to: '/brewing' },
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
              Single-estate coffee from the mist belt of the Western Ghats. Picked ripe, dried
              slow, roasted in fifteen-kilo batches on the ridge where it grew.
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
              Kalamandi Ridge Estate
              <br />
              Attigundi Post, Chikkamagaluru
              <br />
              Karnataka 577 132
            </address>
            <p className="footer__hours">
              Tasting room · Thu–Sun · 08:00–17:00
              <br />
              <a href="tel:+918212290140" className="footer__phone">
                +91 82122 90140
              </a>
            </p>
          </RevealItem>
        </RevealGroup>

        <Reveal className="footer__base" preset="fadeIn">
          <p>© {new Date().getFullYear()} MistRoot Coffee Estates LLP</p>
          <p className="footer__base-mid">
            Elevation 1,540 m · 13.3861° N, 75.7167° E
          </p>
          <p>Roasted on the ridge. Never shipped green.</p>
        </Reveal>
      </div>
    </footer>
  );
}
