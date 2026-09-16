# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

MistRoot Coffee — a premium, editorial marketing site for a single-estate coffee brand in the Western Ghats. React + Vite, plain CSS (no Tailwind, no CSS Modules), React Router for the five pages, and Motion (`motion/react`, the current name for Framer Motion) for every animation.

## Commands

```bash
npm run dev       # start Vite dev server (localhost:5173)
npm run build     # production build to dist/
npm run preview   # serve the production build locally
npm run lint      # eslint .
```

There is no test suite configured. There is no single-file lint/test command beyond what `eslint .` and its file globs give you.

## Architecture

### Routing & page shell

`src/main.jsx` wraps `<App />` in `<BrowserRouter>`. `src/App.jsx` is the shell: it renders `<ScrollProgress />` and `<Navbar />` once, then swaps the five routes (`/`, `/story`, `/brewing`, `/experiences`, `/contact`, plus a `*` `NotFound`) inside `<AnimatePresence mode="wait">`, and renders `<Footer />` once outside the animated region. Every page component is wrapped in `<Page title="…">` (`src/components/Page.jsx`), which sets `document.title` and supplies the enter/exit transition (`pageTransition` from `src/lib/motion.js`) that `AnimatePresence` cross-fades between. Scroll position is reset to top only in `onExitComplete`, so it doesn't jump mid-exit-animation.

### Motion system

All animation timing is centralized in `src/lib/motion.js` (eases, viewport thresholds, and reusable Motion variants: `fadeUp`, `fadeIn`, `scaleIn`, `maskUp`, `stagger`, `pageTransition`, `still`). Don't hand-roll new easing curves or durations in a component — reuse `EASE_OUT`/`EASE_IN_OUT` and the variant presets so every section moves like the same brand.

Scroll-triggered reveals go through `src/components/Reveal.jsx`, not raw `motion.div` + `whileInView`:
- `<Reveal preset="fadeUp|fadeIn|scaleIn|maskUp" delay={…}>` — single element, own viewport trigger.
- `<RevealGroup each={…} delayChildren={…}>` + `<RevealItem preset="…">` — a staggered parent/children pair (used for grids of cards, stat rows, etc).

Both respect `useReducedMotion()` internally by collapsing to the `still` variant — this is the *only* place that check needs to live for scroll reveals. One-off entrance animations inside components (hero copy, form success states, tab panels) still check `useReducedMotion()` locally and branch their own `initial`/`animate` objects; follow that existing pattern rather than introducing a second animation helper.

### Shared building blocks (`src/components/`)

- `SectionHead` — the one heading block (kicker/title/lede) reused across every page section.
- `PageHero` — the opening header for every inner page (not Home, which has its own `HeroVideo`); accepts `kicker`, `title`, `lede`, and an optional `meta` stat row.
- `ButtonLink` / `ArrowLink` — the two link styles used everywhere instead of ad-hoc `<Link>` + hover CSS. `ButtonLink` animates the anchor itself (not a wrapper) so Motion doesn't add a duplicate tab stop.
- `Icons.jsx` — every icon and brew-method illustration is a hand-drawn inline SVG using `currentColor`, defined here. No icon font, no emoji, no third-party icon package — add new icons in this file following the existing `line`/`draw` stroke presets.
- `HeroVideo.jsx` — the fullscreen home hero. The video's parallax layer and the static gradient/vignette overlays are deliberately separate elements (the overlays never transform) so the blend into the page background doesn't drift when the footage moves. If you touch the hero, keep that split.

### Styling

Plain CSS per component (`Component.jsx` + `Component.css`, imported directly in the component). Global tokens live in `src/styles/tokens.css` (colors, type scale, spacing, easing, layout constants as CSS custom properties) and `src/styles/base.css` (reset + shared primitives: `.shell`, `.section`, `.btn`, `.eyebrow`, `.lede`, `.hairline`, `.numeral`, focus/skip-link/reduced-motion rules), both imported once via `src/index.css`. Reach for an existing token/utility class before adding a new hardcoded value — the cream/gold/ink palette and spacing scale are already tuned for contrast (see the comments in `tokens.css` for the accessibility-driven alpha values).

Page-top spacing for inner pages comes from the shared `.page-top` class (`src/App.css`), applied inside `PageHero`.

### Content

Copy, coffee lots, brew recipes, experiences, and contact info are colocated as data arrays/objects at the top of each page file (e.g. `LOTS`, `FACTS`, `RITUALS` in `Home.jsx`, `METHODS`/`WATER` in `Brewing.jsx`, `SUBJECTS`/`CHANNELS`/`SOCIALS` in `Contact.jsx`) rather than in separate data files. Keep new content in the same place unless a dataset is reused across multiple pages.

The contact form (`Contact.jsx`) validates and shows a success state client-side only — there is no backend wired up; `onSubmit` just flips local state.

### Assets

- `assests/video/hero_section.mp4` and `assests/img/logo.jpeg` (note the folder is spelled `assests`, not `assets`) are the original brand assets.
- `src/assets/brand/` contains the logo cut into transparent PNGs derived from that JPEG (`mistroot-mark.png`, `mistroot-wordmark.png`, `mistroot-lockup.png`) — these, not the original JPEG, are what components import.
- `.claude/launch.json` configures the Vite dev server preview (port 5173, `autoPort: true` since 5173 is often already in use in this environment).
