import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Page from '../components/Page';
import PageHero from '../components/PageHero';
import Reveal, { RevealGroup, RevealItem } from '../components/Reveal';
import { EASE_OUT, useReducedMotionSafe } from '../lib/motion';
import { ArrowUpRight, Compass, InstagramIcon } from '../components/Icons';
import { BUSINESS } from '../data/business';
import './Contact.css';

const SUBJECTS = [
  'Book an experience',
  'Wholesale & cafés',
  'Order a lot',
  'Press & photography',
  'Something else',
];

const SOCIALS = [
  {
    label: 'Instagram',
    handle: '@mistrootcoffee',
    href: 'https://www.instagram.com/mistrootcoffee/',
    Icon: InstagramIcon,
  },
];

const CHANNELS = [
  {
    title: 'The estate',
    lines: [
      BUSINESS.address.street,
      BUSINESS.address.locality,
      `${BUSINESS.address.region} ${BUSINESS.address.postalCode}`,
    ],
    note: `${BUSINESS.geoDisplay} · ${BUSINESS.elevation}`,
  },
  {
    title: 'Tasting room',
    lines: [BUSINESS.hours.days, `${BUSINESS.hours.opens} – ${BUSINESS.hours.closes}`, BUSINESS.hours.closure],
    note: 'Walk-ins welcome; experiences by booking',
  },
  {
    title: 'Direct',
    lines: [BUSINESS.email, BUSINESS.phoneDisplay],
    note: 'We answer within two working days',
  },
];

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

/** Netlify ties a submission to a form by this name; it has to match both the
 *  form's name attribute and the hidden form-name field exactly. */
const FORM_NAME = 'contact';

/** Netlify Forms accepts a URL-encoded body, not JSON. */
const encode = (data) =>
  Object.entries(data)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

export default function Contact() {
  const reduced = useReducedMotionSafe();
  const [values, setValues] = useState({
    name: '',
    email: '',
    subject: SUBJECTS[0],
    people: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  // 'idle' | 'sending' | 'sent' | 'error'
  const [status, setStatus] = useState('idle');
  const sent = status === 'sent';

  const set = (field) => (e) => {
    const v = e.target.value;
    setValues((prev) => ({ ...prev, [field]: v }));
    // clear an error the moment the field becomes valid again
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const validate = () => {
    const next = {};
    if (values.name.trim().length < 2) next.name = 'Please tell us what to call you.';
    if (!emailOk(values.email)) next.email = 'That email address does not look complete.';
    if (values.message.trim().length < 12)
      next.message = 'A line or two more, so we can answer properly.';
    return next;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      const first = document.getElementById(`field-${Object.keys(next)[0]}`);
      first?.focus();
      return;
    }

    // Posting the form's own FormData keeps the body in step with the markup
    // Netlify parsed at deploy time — form-name and the honeypot included.
    setStatus('sending');
    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode(Object.fromEntries(new FormData(form).entries())),
      });
      if (!response.ok) throw new Error(`Netlify answered ${response.status}`);
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  return (
    <Page>
      <PageHero
        kicker="Contact"
        title={
          <>
            Write to the ridge. <em>Someone up there reads it.</em>
          </>
        }
        lede="There is no call centre. Messages land in an inbox that four people share, between a roast and a drying-bed turn."
        meta={[
          { label: 'Reply within', value: '2 working days' },
          { label: 'Tasting room', value: BUSINESS.hours.short },
          { label: 'Phone', value: BUSINESS.phoneDisplay },
        ]}
      />

      <section className="section contact">
        <div className="shell contact__inner">
          {/* --------------------------------------------------------- form */}
          <Reveal className="contact__formwrap">
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="sent"
                  className="contact__sent"
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.55, ease: EASE_OUT }}
                >
                  <motion.span
                    className="contact__sent-mark"
                    initial={reduced ? false : { scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.12 }}
                  >
                    <Compass size={30} />
                  </motion.span>
                  <h2 className="contact__sent-title">
                    That is on its way up the hill.
                  </h2>
                  <p className="contact__sent-body">
                    Thank you, {values.name.trim().split(' ')[0] || 'friend'}. We will reply to{' '}
                    <strong>{values.email.trim()}</strong> within two working days — sooner if
                    it is not harvest week.
                  </p>
                  <motion.button
                    type="button"
                    className="btn btn--ghost"
                    whileHover={reduced ? undefined : { y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.32, ease: EASE_OUT }}
                    onClick={() => {
                      setStatus('idle');
                      setValues({
                        name: '',
                        email: '',
                        subject: SUBJECTS[0],
                        people: '',
                        message: '',
                      });
                    }}
                  >
                    Send another
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  className="form"
                  name={FORM_NAME}
                  method="POST"
                  action="/"
                  data-netlify="true"
                  data-netlify-honeypot="bot-field"
                  onSubmit={onSubmit}
                  noValidate
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE_OUT }}
                >
                  {/* Netlify reads both of these out of the prerendered HTML at
                      deploy time. form-name routes the submission; bot-field is
                      the honeypot — nobody sees it, so anything that arrives
                      with it filled in is treated as spam and dropped. */}
                  <input type="hidden" name="form-name" value={FORM_NAME} />
                  <p className="visually-hidden">
                    <label>
                      Leave this field empty
                      <input name="bot-field" tabIndex={-1} autoComplete="off" />
                    </label>
                  </p>

                  <h2 className="form__title">Send a note</h2>

                  <div className="form__row">
                    <div className="field">
                      <label htmlFor="field-name">Your name</label>
                      <input
                        id="field-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        value={values.name}
                        onChange={set('name')}
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? 'err-name' : undefined}
                        className={errors.name ? 'has-error' : ''}
                      />
                      <FieldError id="err-name" message={errors.name} reduced={reduced} />
                    </div>

                    <div className="field">
                      <label htmlFor="field-email">Email</label>
                      <input
                        id="field-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={values.email}
                        onChange={set('email')}
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? 'err-email' : undefined}
                        className={errors.email ? 'has-error' : ''}
                      />
                      <FieldError id="err-email" message={errors.email} reduced={reduced} />
                    </div>
                  </div>

                  <div className="form__row">
                    <div className="field">
                      <label htmlFor="field-subject">What is this about</label>
                      <select
                        id="field-subject"
                        name="subject"
                        value={values.subject}
                        onChange={set('subject')}
                      >
                        {SUBJECTS.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div className="field">
                      <label htmlFor="field-people">
                        How many of you <span className="field__opt">optional</span>
                      </label>
                      <input
                        id="field-people"
                        name="people"
                        type="text"
                        inputMode="numeric"
                        placeholder="2"
                        value={values.people}
                        onChange={set('people')}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="field-message">Your message</label>
                    <textarea
                      id="field-message"
                      name="message"
                      rows={6}
                      value={values.message}
                      onChange={set('message')}
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={
                        errors.message ? 'err-message' : 'hint-message'
                      }
                      className={errors.message ? 'has-error' : ''}
                    />
                    {!errors.message && (
                      <p className="field__hint" id="hint-message">
                        Dates, rough numbers, and anything we should know about food.
                      </p>
                    )}
                    <FieldError id="err-message" message={errors.message} reduced={reduced} />
                  </div>

                  <AnimatePresence>
                    {status === 'error' && (
                      <motion.p
                        className="field__error form__status"
                        role="alert"
                        initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6, height: 0 }}
                        animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, height: 'auto' }}
                        exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6, height: 0 }}
                        transition={{ duration: 0.32, ease: EASE_OUT }}
                      >
                        That did not get through. Try once more, or write straight to{' '}
                        <a href="mailto:mistrootcoffeeclub@gmail.com">
                          mistrootcoffeeclub@gmail.com
                        </a>
                        .
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    className="btn btn--gold form__submit"
                    disabled={status === 'sending'}
                    whileHover={reduced || status === 'sending' ? undefined : { y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.3, ease: EASE_OUT }}
                  >
                    {status === 'sending' ? 'Sending…' : 'Send it up'}
                    <ArrowUpRight size={13} className="btn__arrow" />
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </Reveal>

          {/* ------------------------------------------------------ details */}
          <div className="contact__side">
            <RevealGroup each={0.09}>
              {CHANNELS.map((c) => (
                <RevealItem className="channel" key={c.title}>
                  <h3 className="channel__title">{c.title}</h3>
                  <ul className="channel__lines">
                    {c.lines.map((l) => (
                      <li key={l}>
                        {l.includes('@') && !l.includes(' ') ? (
                          <a href={`mailto:${l}`}>{l}</a>
                        ) : l.startsWith('+91') ? (
                          <a href={`tel:${l.replace(/\s/g, '')}`}>{l}</a>
                        ) : (
                          l
                        )}
                      </li>
                    ))}
                  </ul>
                  <p className="channel__note">{c.note}</p>
                </RevealItem>
              ))}
            </RevealGroup>

            <Reveal delay={0.2} className="contact__socials">
              <h3 className="channel__title">Elsewhere</h3>
              <ul>
                {SOCIALS.map(({ label, handle, href, Icon }) => (
                  <li key={label}>
                    <motion.a
                      href={href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="social"
                      initial="rest"
                      whileHover="hover"
                      whileFocus="hover"
                      animate="rest"
                    >
                      <motion.span
                        className="social__icon"
                        variants={{
                          rest: { color: 'rgba(200,164,90,0.7)', x: 0 },
                          hover: {
                            color: 'rgb(227,196,129)',
                            x: 3,
                            transition: { duration: 0.35, ease: EASE_OUT },
                          },
                        }}
                      >
                        <Icon size={18} />
                      </motion.span>
                      <span className="social__label">{label}</span>
                      <span className="social__handle">{handle}</span>
                      <motion.span
                        className="social__rule"
                        variants={{
                          rest: { scaleX: 0 },
                          hover: {
                            scaleX: 1,
                            transition: { duration: 0.45, ease: EASE_OUT },
                          },
                        }}
                      />
                    </motion.a>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>
    </Page>
  );
}

/** Inline error that appears next to its field, not in a summary at the top. */
function FieldError({ id, message, reduced }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          id={id}
          className="field__error"
          role="alert"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6, height: 0 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, height: 'auto' }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6, height: 0 }}
          transition={{ duration: 0.32, ease: EASE_OUT }}
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
