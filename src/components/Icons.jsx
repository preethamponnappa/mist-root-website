/* Hand-drawn SVG line set for MistRoot.
   Everything inherits `currentColor` and a 1.25 stroke so the icons and the
   larger brew illustrations read as one drawing hand. No icon fonts, no emoji. */

const line = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const draw = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.25,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

/* ---------------------------------------------------------------- UI icons */

export function ArrowUpRight({ size = 16, ...p }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" {...p}>
      <g {...line}>
        <path d="M7 17 17 7" />
        <path d="M8.5 7H17v8.5" />
      </g>
    </svg>
  );
}

export function ArrowRight({ size = 16, ...p }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" {...p}>
      <g {...line}>
        <path d="M4 12h15" />
        <path d="M13.5 6.5 19 12l-5.5 5.5" />
      </g>
    </svg>
  );
}

export function ArrowDown({ size = 16, ...p }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" {...p}>
      <g {...line}>
        <path d="M12 4v15" />
        <path d="M6.5 13.5 12 19l5.5-5.5" />
      </g>
    </svg>
  );
}

export function Mountain({ size = 28, ...p }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" {...p}>
      <g {...draw}>
        <path d="M2 25 11 9l6 9 3-4.5L30 25" />
        <path d="M8.2 14.5h5.4" />
        <path d="M2 25h28" />
      </g>
    </svg>
  );
}

export function Leaf({ size = 28, ...p }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" {...p}>
      <g {...draw}>
        <path d="M26 5C13 5 6 11 6 20a8 8 0 0 0 8 8c9 0 12-9 12-23Z" />
        <path d="M22 9C16 13 12 18 10 27" />
      </g>
    </svg>
  );
}

export function Droplet({ size = 28, ...p }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" {...p}>
      <g {...draw}>
        <path d="M16 3.5c5.5 7 9 11.4 9 15.5a9 9 0 0 1-18 0c0-4.1 3.5-8.5 9-15.5Z" />
        <path d="M11.5 19.5a4.5 4.5 0 0 0 3.2 4.3" />
      </g>
    </svg>
  );
}

export function Hourglass({ size = 28, ...p }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" {...p}>
      <g {...draw}>
        <path d="M8 3h16M8 29h16" />
        <path d="M10 3c0 6 6 8.5 6 13s-6 7-6 13" />
        <path d="M22 3c0 6-6 8.5-6 13s6 7 6 13" />
        <path d="M12 25.5h8" />
      </g>
    </svg>
  );
}

export function Basket({ size = 28, ...p }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" {...p}>
      <g {...draw}>
        <path d="M3 12h26l-3 15a2 2 0 0 1-2 1.6H8A2 2 0 0 1 6 27Z" />
        <path d="M10.5 12 16 3l5.5 9" />
        <path d="M12.5 17.5 13.5 24M19.5 17.5 18.5 24" />
      </g>
    </svg>
  );
}

export function Cup({ size = 28, ...p }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" {...p}>
      <g {...draw}>
        <path d="M5 11h19v9a8 8 0 0 1-8 8h-3a8 8 0 0 1-8-8Z" />
        <path d="M24 13.5h2.5a3.5 3.5 0 0 1 0 7H24" />
        <path d="M10 6.5c1.5-1.5 0-3 0-3M16 6.5c1.5-1.5 0-3 0-3" />
      </g>
    </svg>
  );
}

export function Compass({ size = 28, ...p }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" {...p}>
      <g {...draw}>
        <circle cx="16" cy="16" r="13" />
        <path d="m21 11-3 7-7 3 3-7Z" />
      </g>
    </svg>
  );
}

export function Flame({ size = 28, ...p }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" {...p}>
      <g {...draw}>
        <path d="M16 2.5c1 6-4 7-4 12a4 4 0 0 0 8 0c0-1.6-.6-2.7-.6-2.7 3.6 2 5.6 5 5.6 8.4A9 9 0 0 1 7 20.2C7 12 16 10.5 16 2.5Z" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------- brew method drawings */
/* All four share a 120×170 stage so they optically line up in a row. */

const Stage = ({ children, ...p }) => (
  <svg viewBox="0 0 120 170" role="presentation" aria-hidden="true" {...p}>
    <g {...draw}>{children}</g>
  </svg>
);

export function PourOverDrawing(p) {
  return (
    <Stage {...p}>
      {/* cone */}
      <ellipse cx="60" cy="34" rx="36" ry="8" />
      <path d="M24 34 54 90h12l30-56" />
      <path d="M39 34 57 90M81 34 63 90" opacity="0.45" />
      {/* stem + drip */}
      <path d="M54 90h12v8H54z" />
      <path d="M60 102v9" opacity="0.7" />
      {/* carafe */}
      <path d="M53 98c0 9-22 13-22 27v27a8 8 0 0 0 8 8h42a8 8 0 0 0 8-8v-27c0-14-22-18-22-27" />
      <path d="M31 133c14-4 44-4 58 0" opacity="0.4" />
    </Stage>
  );
}

export function AeroPressDrawing(p) {
  return (
    <Stage {...p}>
      {/* plunger cap + shaft */}
      <rect x="41" y="14" width="38" height="9" rx="4.5" />
      <path d="M53 23h14v26H53z" />
      <path d="M60 23v26" opacity="0.4" />
      {/* chamber */}
      <path d="M37 49h46v72a5 5 0 0 1-5 5H42a5 5 0 0 1-5-5z" />
      <path d="M37 60h46M37 74h46M37 88h46" opacity="0.35" />
      {/* filter cap */}
      <path d="M44 126h32l-4 9H48z" />
      {/* cup */}
      <path d="M40 139h40v14a8 8 0 0 1-8 8H48a8 8 0 0 1-8-8z" />
    </Stage>
  );
}

export function FrenchPressDrawing(p) {
  return (
    <Stage {...p}>
      {/* knob + lid */}
      <circle cx="60" cy="16" r="5.5" />
      <path d="M60 21.5V27" />
      <rect x="33" y="27" width="54" height="10" rx="4" />
      {/* rod + mesh */}
      <path d="M60 37v34" opacity="0.7" />
      <path d="M42 71h36l-1.5 7h-33z" />
      {/* beaker */}
      <path d="M35 39h50v104a8 8 0 0 1-8 8H43a8 8 0 0 1-8-8z" />
      {/* handle */}
      <path d="M85 60c14 2 16 10 16 17s-2 15-16 17" />
      {/* brew level */}
      <path d="M36 92h48" opacity="0.45" />
      <path d="M40 84c9 3 31 3 40 0" opacity="0.3" />
    </Stage>
  );
}

export function EspressoDrawing(p) {
  return (
    <Stage {...p}>
      {/* group head */}
      <rect x="41" y="12" width="38" height="12" rx="3" />
      {/* portafilter */}
      <path d="M35 24h50l-7 26H42z" />
      <path d="M85 30h22" opacity="0.8" />
      <path d="M42 36h36" opacity="0.35" />
      {/* twin spouts */}
      <path d="M48 50h9l-1.5 8h-6zM63 50h9l-1.5 8h-6z" />
      {/* streams */}
      <path d="M52.5 60c-1 12-1.5 18-.5 26M67.5 60c1 12 1.5 18 .5 26" opacity="0.6" />
      {/* cup */}
      <path d="M36 88h48v20a14 14 0 0 1-14 14H50a14 14 0 0 1-14-14z" />
      <path d="M84 92h4a8 8 0 0 1 0 16h-4" />
      <path d="M40 96c12 4 28 4 40 0" opacity="0.4" />
      <path d="M32 132h56" opacity="0.5" />
    </Stage>
  );
}

/* -------------------------------------------------------------- social */

export function InstagramIcon({ size = 18, ...p }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" {...p}>
      <g {...draw}>
        <rect x="3" y="3" width="18" height="18" rx="5.5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

export function XIcon({ size = 18, ...p }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" {...p}>
      <g {...draw}>
        <path d="M4 3.5h4.2l11.8 17h-4.2z" />
        <path d="M4.6 20.5 10.8 13.6M13.4 10.6 19.6 3.5" />
      </g>
    </svg>
  );
}

export function YoutubeIcon({ size = 18, ...p }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" {...p}>
      <g {...draw}>
        <rect x="2.5" y="5" width="19" height="14" rx="4.5" />
        <path d="m10.3 9.2 4.7 2.8-4.7 2.8z" />
      </g>
    </svg>
  );
}

export function JournalIcon({ size = 18, ...p }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" {...p}>
      <g {...draw}>
        <path d="M4 4.5h13a3 3 0 0 1 3 3v12H7a3 3 0 0 0-3 3z" />
        <path d="M7 19.5h13" />
        <path d="M8 9h8M8 12.5h6" opacity="0.55" />
      </g>
    </svg>
  );
}
