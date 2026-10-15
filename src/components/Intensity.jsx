import './Intensity.css';

/**
 * Four ticks, `level` of them lit. role="img" is what makes the aria-label
 * legal here: the ticks are a picture of the intensity, and the label is their
 * text alternative.
 */
export default function Intensity({ level, name, className = '' }) {
  return (
    <span
      className={`intensity ${className}`}
      role="img"
      aria-label={`Intensity ${level} of 4${name ? ` — ${name}` : ''}`}
    >
      {[1, 2, 3, 4].map((i) => (
        <span key={i} className={`intensity__tick ${i <= level ? 'is-on' : ''}`} />
      ))}
    </span>
  );
}
