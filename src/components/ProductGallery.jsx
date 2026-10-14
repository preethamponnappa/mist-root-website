import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import BagArt from './BagArt';
import { EASE_OUT, useReducedMotionSafe } from '../lib/motion';
import { sizeLabel } from '../../shared/catalog';
import './ProductGallery.css';

/**
 * Main image plus a row of thumbnails.
 *
 * The first slide is always the drawn bag, labelled with the size currently
 * selected; the catalogue's photographs follow it. Thumbnails are real buttons
 * (Tab reaches them, Enter/Space selects), and the arrow keys move between them
 * as well, the way a row of related choices usually behaves.
 */
export default function ProductGallery({ product, sizeGrams }) {
  const reduced = useReducedMotionSafe();
  const [index, setIndex] = useState(0);
  const thumbs = useRef([]);

  const slides = [
    {
      key: 'bag',
      alt: `${product.name} bag, ${sizeLabel(sizeGrams)}`,
      render: (label) => <BagArt product={product} sizeGrams={sizeGrams} label={label} />,
    },
    ...product.images.map((image) => ({
      key: image.src,
      alt: image.alt,
      render: () => (
        <img
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          decoding="async"
        />
      ),
    })),
  ];
  const current = slides[index] ?? slides[0];

  const onThumbKey = (event) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = (index + step + slides.length) % slides.length;
    setIndex(next);
    thumbs.current[next]?.focus();
  };

  return (
    <div className="gallery">
      <div className="gallery__stage">
        <AnimatePresence mode="wait" initial={false}>
          <motion.figure
            key={current.key}
            className={`gallery__slide gallery__slide--${current.key === 'bag' ? 'art' : 'photo'}`}
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.15 : 0.45, ease: EASE_OUT }}
          >
            {current.render(current.alt)}
          </motion.figure>
        </AnimatePresence>
      </div>

      {slides.length > 1 && (
        <ul className="gallery__thumbs" aria-label={`${product.shortName} images`}>
          {slides.map((slide, i) => (
            <li key={slide.key}>
              <button
                type="button"
                ref={(el) => {
                  thumbs.current[i] = el;
                }}
                className="gallery__thumb"
                aria-label={`Show image ${i + 1} of ${slides.length}: ${slide.alt}`}
                aria-current={i === index ? 'true' : undefined}
                onClick={() => setIndex(i)}
                onKeyDown={onThumbKey}
              >
                {/* Thumbnails are pictures of the button's label, so hide them. */}
                <span aria-hidden="true" className="gallery__thumb-art">
                  {slide.key === 'bag' ? (
                    <BagArt product={product} />
                  ) : (
                    <img src={slide.key} alt="" loading="lazy" decoding="async" />
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
