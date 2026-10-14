import { useId } from 'react';
import { sizeLabel } from '../../shared/catalog';
import './BagArt.css';

/**
 * A drawn bag for a coffee, with its label set from the catalogue.
 *
 * It stands in for product photography until there is some, and it is drawn
 * rather than generated as an image so the label uses the site's own fonts and
 * can never disagree with the product data. Arabica and Robusta get different
 * label accents so the four read as two families at a glance.
 *
 * Decorative by default. Pass `label` to expose it as an image with that text
 * alternative (the product page gallery does).
 */
export default function BagArt({ product, sizeGrams, label, className = '' }) {
  // useId rather than the slug: the same coffee can be drawn twice on one page
  // (gallery and thumbnail), and gradient ids must be unique in the document.
  // Stripped to plain characters so it is safe inside url(#…).
  const id = `bag${useId().replace(/[^\w-]/g, '')}`;
  const words = product.shortName.split(' ');
  const shift = (words.length - 1) * 20;
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true };

  return (
    <svg
      viewBox="0 0 300 360"
      className={`bag-art bag-art--${product.species.toLowerCase()} ${className}`}
      focusable="false"
      {...a11y}
    >
      <defs>
        <radialGradient id={`${id}-glow`} cx="50%" cy="58%" r="55%">
          <stop offset="0%" className="bag-art__glow-in" />
          <stop offset="100%" className="bag-art__glow-out" />
        </radialGradient>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" className="bag-art__body-edge" />
          <stop offset="45%" className="bag-art__body-mid" />
          <stop offset="100%" className="bag-art__body-edge" />
        </linearGradient>
      </defs>

      <rect width="300" height="360" fill={`url(#${id}-glow)`} />

      {/* shadow, then the bag: a gusseted body with a crimped, folded top */}
      <ellipse cx="150" cy="330" rx="92" ry="9" className="bag-art__shadow" />
      <path
        d="M78 92 L222 92 L236 318 Q236 326 228 326 L72 326 Q64 326 64 318 Z"
        fill={`url(#${id}-body)`}
        className="bag-art__body"
      />
      <path d="M82 60 L218 60 L222 92 L78 92 Z" className="bag-art__fold" />
      <path
        d="M82 60 l8.5 -6 l8.5 6 l8.5 -6 l8.5 6 l8.5 -6 l8.5 6 l8.5 -6 l8.5 6 l8.5 -6 l8.5 6 l8.5 -6 l8.5 6 l8.5 -6 l8.5 6 l8.5 -6 l8.5 6"
        className="bag-art__crimp"
      />
      <circle cx="150" cy="118" r="6" className="bag-art__valve" />

      {/* the label */}
      <rect x="92" y="140" width="116" height="150" rx="2" className="bag-art__label" />
      <rect x="98" y="146" width="104" height="138" rx="1" className="bag-art__label-rule" />

      <text x="150" y="168" className="bag-art__brand">
        MISTROOT
      </text>
      <text x="150" y="184" className="bag-art__no">
        No. {product.no}
      </text>
      {words.map((word, i) => (
        <text key={word} x="150" y={210 + i * 20} className="bag-art__name">
          {word}
        </text>
      ))}
      <line x1="132" x2="168" y1={222 + shift} y2={222 + shift} className="bag-art__rule" />
      <text x="150" y={240 + shift} className="bag-art__meta">
        {product.species} {product.grade}
      </text>
      <text x="150" y={254 + shift} className="bag-art__meta bag-art__meta--quiet">
        {product.roast} roast{sizeGrams ? ` · ${sizeLabel(sizeGrams)}` : ''}
      </text>
    </svg>
  );
}
