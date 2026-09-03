import Reveal from './Reveal';
import './SectionHead.css';

/**
 * The one heading block used across every page: kicker, title, optional lede.
 * Keeping it in a single component is what makes the pages feel like one book.
 */
export default function SectionHead({
  kicker,
  title,
  lede,
  align = 'left',
  as = 'h2',
  className = '',
}) {
  const Title = as;
  return (
    <div className={`sechead sechead--${align} ${className}`}>
      {kicker && (
        <Reveal as="p" preset="fadeUp" className="eyebrow sechead__kicker">
          {kicker}
        </Reveal>
      )}
      <Reveal delay={0.08}>
        <Title className="sechead__title">{title}</Title>
      </Reveal>
      {lede && (
        <Reveal as="p" delay={0.16} className="lede sechead__lede">
          {lede}
        </Reveal>
      )}
    </div>
  );
}
