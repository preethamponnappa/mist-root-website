# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

MistRoot Coffee Club (mistrootcoffee.com) — an editorial marketing site for a family coffee estate in the Brahmagiri Range, Kodagu (Coorg), with an online shop being added (see **Shop architecture** below). React 19 + Vite 8, plain CSS (no Tailwind, no CSS Modules), React Router 7, Motion (`motion/react`) for every animation. Every route is prerendered to static HTML at build time and hydrated on the client. Hosted on Netlify.

## Commands

```bash
npm run dev       # Vite dev server (localhost:5173) — empty shell, no prerender, no functions
npm run build     # client build + SSR build + scripts/prerender.mjs -> dist/
npm run preview   # serve dist/ locally
npm run lint      # eslint .
```

No test suite is configured. Once Netlify Functions exist, use `netlify dev` (netlify-cli) to run Vite and `/api/*` together locally.

## Rules (non-negotiable)

1. **Money is integer paise.** Every amount in code, the database, API payloads and Razorpay/Shiprocket calls is an integer number of paise (`60000` = ₹600). Never floats, never rupee decimals. Convert to rupees only for display, in one formatter. Columns are `bigint`/`integer` named `*_paise`.
2. **Prices are always recomputed server-side.** The client sends only `{ sku, quantity }` lines. The function looks up unit prices in the server's catalog, computes subtotal, shipping and total itself, and ignores any price, total or discount the client sends. The amount passed to Razorpay comes from that computation, and `order_items` stores a snapshot of the unit price at purchase time.
3. **No secrets in frontend code.** Nothing under `src/` may read a secret, and no secret may use the `VITE_` prefix (Vite inlines those into the bundle). Razorpay key secret, webhook secrets, Shiprocket credentials and `DATABASE_URL` exist only as Netlify environment variables read in `netlify/`. The Razorpay *key id* is public; the checkout function returns it in its response so the frontend needs no env vars at all.
4. **Every external API call has timeouts, retries and structured logging.** Razorpay, Shiprocket and any other third party are called only through the shared HTTP helper in `netlify/lib/http.js`, which enforces: a per-attempt timeout (`AbortSignal.timeout`), bounded retries with exponential backoff and jitter on network errors / 408 / 429 / 5xx only, and one JSON log line per attempt (`service`, `op`, `attempt`, `status`, `durationMs`, `requestId`, `orderId`). Never log secrets, auth tokens, full card/UPI details or full customer addresses. Retry non-idempotent calls (creating an order or shipment) only when the integration has an idempotency guard (see below), and keep the total retry budget under the function's time limit.

## Architecture (current site)

### Routing, prerender & hydration

- `src/main.jsx` hydrates when `#root` already has markup (production) and does a normal render otherwise (dev).
- `src/entry-server.jsx` renders the same `<App />` under `StaticRouter`. `scripts/prerender.mjs` renders every route in `src/lib/seo.js` (`ROUTES` + the 404) into `dist/<route>.html`, and also generates `sitemap.xml`, `llms.txt` and `dist/_headers` (the CSP, which carries hashes of React's inline scripts). The build **fails** if a page's title is over 60 characters or its description falls outside 140–160.
- `src/App.jsx` is the shell: skip link, `<Seo />`, `<ScrollProgress />`, `<Navbar />`, then lazy-loaded routes inside `<Suspense>` → `<AnimatePresence mode="wait">` keyed on pathname, then `<Footer />`. Pages are `React.lazy` chunks that are prefetched once the browser is idle. Scroll resets in `onExitComplete`.
- Routes: `/`, `/shop`, `/shop/<slug>` (one per active product), `/story`, `/club`, `/brewing`, `/brewing/<method>`, `/experiences`, `/contact`, `/coorg-coffee`, `*`. Parameterised pages are registered one route per catalog entry, not as `:param`, so unknown slugs and methods get a real 404.
- Adding a route means: a lazy import + `<Route>` in `App.jsx`, an entry in `ROUTES` in `src/lib/seo.js` (title/description within limits), and its loader in `ROUTE_CHUNKS`.
- **Hydration safety:** first-render markup must match the prerendered HTML. Anything read from `localStorage`, the query string or the clock must be gated behind `useIsHydrated()` (`src/lib/hydration.js`) and appear a tick later.
- `netlify.toml` deliberately has **no** catch-all SPA rewrite; unmatched paths get a real 404 from `dist/404.html`. Add narrow rewrites only for genuinely dynamic paths.

### Head / SEO

`src/lib/seo.js` is the single source of truth for titles, descriptions and canonicals, read both by the prerender and by `<Seo />` at runtime. `src/lib/structured-data.js` builds JSON-LD from the same data (Product + Offer for each coffee on `/club`). `<Page>` provides only the page transition, not the title.

### Data

- `shared/catalog.js` — **the product catalog**, the single source of truth for the site, the prerender and (later) the Netlify Functions. It holds `PRODUCTS`, which are products with generated `variants` (size × grind, SKU `MR-<code>-<grams>-<grind code>`, `pricePaise`, `packedWeightKg`, dimensions, `inStock`). It also holds `GRINDS`, `SIZES`, `SHIPPING` and `MAX_QUANTITY_PER_LINE`, plus the lookups (`productBySlug`, `lookupSku`, `findVariant`, `defaultVariant`, `priceRange`) and the formatters (`formatPrice(paise)` is the only paise→₹ conversion; `paiseToDecimal` is for schema.org/OG). It's plain JS with JSDoc types, not TS, because Node 22 loads it directly. It asserts at import time that SKUs are unique and prices are positive integer paise. Values not yet confirmed are marked `// TODO confirm`.
- `src/data/business.js` — every non-product business fact: `BUSINESS`, `EXPERIENCES`, contact/map hrefs, WhatsApp link builders (`whatsappOrderUrl(product, variant, quantity)`). Plain JS, loaded by Node.
- Files that Node loads (`src/data/*`, `src/lib/seo.js`, `src/lib/structured-data.js`, `shared/*`) must use explicit `.js` extensions in their imports and contain no JSX or asset imports.
- `src/data/brewing.js` — `METHODS` (brew recipes, each with a `bestCoffeeId`).
- Page-only editorial copy stays as data arrays at the top of its page file (`PILLARS` in `Club.jsx`, `FACTS`/`RITUALS` in `Home.jsx`, etc.). Move a dataset into `src/data/` once more than one page or the server needs it.

### Motion system

All timing is centralized in `src/lib/motion.js` (`EASE_OUT`, `EASE_IN_OUT`, `viewportOnce`, variants `fadeUp`/`fadeIn`/`scaleIn`/`maskUp`/`stagger`/`pageTransition`/`still`, and `useReducedMotionSafe()`). Don't hand-roll easings or durations.

Scroll reveals go through `src/components/Reveal.jsx` (`<Reveal preset delay>`, `<RevealGroup each delayChildren>` + `<RevealItem preset>`), which already handles reduced motion. One-off entrance animations (hero copy, form states, drawers) check `useReducedMotionSafe()` locally and branch their own `initial`/`animate`.

### Shared components (`src/components/`)

- `SectionHead` — kicker/title/lede heading block for every section.
- `PageHero` — opening header for inner pages (`kicker`, `title`, `lede`, optional `meta` stat row); applies `.page-top`.
- `ButtonLink` / `ArrowLink` — the two link styles; use them instead of ad-hoc `<Link>` + hover CSS. `ButtonLink` animates the anchor itself, so Motion adds no duplicate tab stop.
- `Icons.jsx` — every icon is a hand-drawn inline SVG using `currentColor`, with the `line`/`draw` stroke presets. No icon fonts, emoji or icon packages; add new ones (cart, bag, plus/minus, close, truck, check) here.
- `HeroVideo.jsx` — the home hero. The parallax video layer and the static gradient/vignette overlays are separate on purpose (the overlays never transform). Keep that split.
- `Navbar.jsx` — desktop links + mobile sheet, driven by `NAV_LINKS`.

### Styling

`Component.jsx` + `Component.css`, imported by the component. Vite builds one stylesheet (`cssCodeSplit: false`), so class names are global; prefix them with the block name (BEM-ish: `.coffee__price`, `.club-coffees__grid`).

- `src/styles/tokens.css`: dark palette (`--ink`, `--ink-raise`, `--ink-card`, `--bark`, `--cream` with contrast-checked alphas `--cream-70/50/30/12/06`, `--field-border`, `--gold`, `--gold-bright`, `--gold-deep`, `--moss`, `--ember`), fonts (`--font-display` Cinzel, `--font-serif` Cormorant Garamond, `--font-sans` Josefin Sans, all self-hosted in `public/fonts/`), fluid type `--step--2` … `--step-5`, space `--space-2xs` … `--space-2xl` and `--section-y`, layout (`--shell`, `--shell-wide`, `--gutter`, `--nav-h`), `--rule`, `--shadow-lift`.
- `src/styles/base.css` primitives: `.shell`, `.shell--wide`, `.section`, `.section--raised`, `.btn`, `.btn--gold`, `.btn--ghost`, `.btn__arrow`, `.eyebrow`, `.lede`, `.display`, `.numeral`, `.hairline`, `.muted`, `.serif-italic`, `.visually-hidden`, plus focus, skip-link and reduced-motion rules.
- Use tokens before hardcoded values. The text alphas are tuned for ≥4.5:1 contrast. Don't invent lighter ones.

### Forms

The contact form (`Contact.jsx`) posts URL-encoded `FormData` to `/` and is captured by **Netlify Forms**. `public/__forms.html` is a static copy of the field set for Netlify's deploy-time parser, so keep its field names in step with `Contact.jsx`.

### Assets

`assests/` (spelled that way) holds the original video and logo JPEG. Components import the transparent PNGs in `src/assets/brand/`. `.claude/launch.json` defines `mistroot-dev` (5173) and `mistroot-preview` (4173).

## Shop architecture

Built so far: the catalog, `/shop`, `/shop/<slug>`, the SKU cart store, and the shop SEO/JSON-LD. Everything from the cart drawer onward (checkout, backend, database, payments, shipping) is still planned.

### Overview

```
Browser (prerendered React)          Netlify Functions (/api/*)             External
─────────────────────────            ──────────────────────────             ────────
/shop, /shop/:slug  ── cart (localStorage) ──┐
CartDrawer                                   │
/checkout ── POST /api/checkout ─────────────┼─> price from catalog ──> Neon Postgres (orders)
          <── { razorpayOrderId, keyId,  ────┤   create Razorpay order ──> Razorpay Orders API
               amountPaise, orderPublicId }  │
Razorpay Checkout modal (checkout.js)        │
          ── POST /api/payments/verify ──────┼─> HMAC verify, mark paid
                                             │
Razorpay ── POST /api/webhooks/razorpay ─────┼─> verify signature, idempotent mark paid,
                                             │   enqueue fulfilment
scheduled fn (every few min) ────────────────┼─> Shiprocket: create order, assign AWB, pickup
Shiprocket ── POST /api/webhooks/shiprocket ─┼─> tracking status updates
/order/:publicId ── GET /api/orders/:id ─────┘
```

### Business rules (decided)

- **Shipping:** free when the server-computed subtotal is over ₹999 (`subtotalPaise > 99900`). Below that, a flat ₹80 shipping fee applies (`SHIPPING_FEE_PAISE = 8000`, defined once in `netlify/lib/pricing.js`). With current prices, one bag pays shipping and any two bags ship free. Shipping is never priced from live Shiprocket rates. Shiprocket is used only for pincode serviceability and fulfilment.
- **Tax:** listed prices are GST-inclusive. `total = subtotal + shipping`, with no tax line added at checkout. If invoices are needed later, back the GST component out of the inclusive amount rather than adding it on top.
- **Inventory:** not tracked. Every coffee is always purchasable (`availability: InStock`). There is no stock table and no reservation step. To take a coffee or variant off sale, set `isActive: false` on the product or `inStock: false` on the variant in `shared/catalog.js` and redeploy.

### Frontend

- **Catalog (built):** `shared/catalog.js` (see Data above). `src/pages/Home.jsx`, `Club.jsx`, `CoorgCoffee.jsx`, `src/data/brewing.js` (`bestCoffeeId` is a product slug) and the prerender all read from it. Never copy product facts or prices into a page.
- **Routes (built):** `/shop` (`Shop.jsx`) and `/shop/<slug>` (`Product.jsx`) are prerendered and indexable. Product routes are generated from `activeProducts()` in both `App.jsx` and `seo.js` (`PRODUCT_ROUTES`, with hand-written descriptions in `PRODUCT_DESCRIPTIONS`; the build fails if one is missing). Product pages get `og:type=product` with `product:price:*` tags, plus a `ProductGroup` JSON-LD varying by size (one INR Offer per size) and a `BreadcrumbList`. `/shop` gets an `ItemList`. The product page reads `?size=&grind=` after hydration and writes them back with `replace`, so the Offer URLs (`?size=500`) land on the matching price. `/checkout` and `/order/:publicId` will be `noindex`. `/order/*` needs one narrow Netlify rewrite to a prerendered `order.html` shell (`/order/*  /order.html  200`), which fetches the order after hydration.
- **Cart (store built, no UI yet):** `src/lib/cart.js` is a module-level store over `localStorage` (`mistroot.cart.v1`) holding `[{ sku, quantity }]` only, never prices. It sanitises against the catalog on read and caps each line at `MAX_QUANTITY_PER_LINE`. It's read with `useCart()` (`useSyncExternalStore` with an empty server snapshot, so prerender and hydration always match) and written with `addToCart`/`setQuantity`/`removeFromCart`/`clearCart`. It syncs across tabs through the `storage` event. No provider is needed.
- **Shop components:** `BagArt` (drawn bag with a catalog-driven label; it stands in for product photography), `ProductGallery`, `Intensity`. The product page's selectors are native radios in `fieldset`/`legend` styled as choice tiles, so keyboard support comes free. Keep that pattern for future option pickers.
- **CartDrawer (next):** a sibling of `<Navbar />` in the shell, plus a navbar count badge. Use a focus trap, Escape to close, `aria-modal`, a Motion slide using `EASE_OUT`, and a reduced-motion branch.
- **Checkout:** a contact + shipping address form (Indian pincode validated client-side for UX and again server-side). Load `https://checkout.razorpay.com/v1/checkout.js` only on `/checkout`. Show a totals preview from `POST /api/quote` (server-computed). Never compute the charged amount on the client.
- **WhatsApp fallback:** until checkout is live, the `/club` cards and each product page carry a pre-filled WhatsApp order link for the selected variant. When checkout goes live, remove them and update the `llms.txt` "How to order" text in `scripts/prerender.mjs` and the `/club` SEO description.

### Backend: Netlify Functions

- `netlify/functions/*.mjs` using the modern signature (`export default async (req, context) => Response` with `export const config = { path: '/api/...' }`). Shared code lives in `netlify/lib/`: `http.js` (timeouts/retries/logging per Rule 4), `log.js` (JSON logger, request id), `db.js`, `pricing.js` (imports `shared/catalog.js` and `SHIPPING`), `razorpay.js`, `shiprocket.js`, `validate.js`.
- Endpoints:
  - `POST /api/quote` returns `{ items, subtotalPaise, shippingPaise, totalPaise }`.
  - `POST /api/checkout` validates the cart and address, recomputes totals, inserts an order (`pending_payment`), creates a Razorpay order (`amount` in paise, `receipt` = our order id), and returns `{ orderPublicId, razorpayOrderId, keyId, amountPaise }`.
  - `POST /api/payments/verify` checks `HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, KEY_SECRET)` with a timing-safe compare and marks the order paid.
  - `POST /api/webhooks/razorpay` verifies `X-Razorpay-Signature` over the **raw** body with the webhook secret and dedupes on `x-razorpay-event-id`. It handles `payment.captured`, `order.paid` and `payment.failed`. This handler is the source of truth for payment status. `verify` only makes the redirect instant.
  - `POST /api/webhooks/shiprocket` checks the shared token header and records tracking status.
  - `GET /api/orders/:publicId` returns a minimal status view with no full address.
  - A scheduled function (`fulfil-orders`) drains the fulfilment outbox: Shiprocket create order → assign AWB → request pickup. Each step is recorded so a retry resumes rather than repeats.
- **Time limits:** synchronous functions time out after ~10 s by default and scheduled functions after ~30 s. Keep per-attempt timeouts at a few seconds, keep retry budgets inside those limits, and keep Shiprocket out of the request path. Webhooks only record and enqueue, then return 200 quickly.
- **Idempotency:** a unique constraint on `payments.razorpay_payment_id` and `webhook_events.event_id` makes duplicate webhooks no-ops. The order status moves forward only (`pending_payment → paid → fulfilment_queued → shipped → delivered`, with `payment_failed` and `cancelled` as side branches) via conditional `UPDATE … WHERE status = …`. Before creating a Shiprocket order, the outbox worker locks its row (`SELECT … FOR UPDATE SKIP LOCKED`) and checks whether a `shiprocket_order_id` is already stored.

### Database: Neon Postgres

- Neon was chosen for its serverless HTTP driver (`@neondatabase/serverless`), which works inside short-lived functions with no pooler, and for its first-class Netlify integration. Supabase's auth, storage and realtime would go unused, and its free projects pause when idle.
- Tables (sketch): `orders` (id, public_id random, status, email, phone, name, shipping address jsonb, `subtotal_paise`, `shipping_paise`, `total_paise`, currency, razorpay_order_id, shiprocket ids, AWB, timestamps), `order_items` (order_id, coffee_id, name snapshot, grind, quantity, `unit_price_paise`, `line_total_paise`), `payments`, `webhook_events`, `fulfilment_jobs` (outbox: order_id, step, attempts, next_attempt_at, last_error), `kv_cache` (the Shiprocket token and its expiry).
- Migrations are plain SQL files in `db/migrations/`, applied in order.

### Razorpay

Standard Checkout: the server creates the order, the client opens the modal with `order_id` + `key_id`, and the server verifies the signature, with the webhook as backstop. Use test keys outside production. Never trust `amount` from the client or from the checkout callback. Compare webhook amounts with `orders.total_paise`.

### Shiprocket

Called **only** from `netlify/lib/shiprocket.js` against `https://apiv2.shiprocket.in/v1/external/…`. Authenticate with `POST /auth/login` using a dedicated API user (`SHIPROCKET_EMAIL`/`SHIPROCKET_PASSWORD`). The token is long-lived (~10 days), so cache it in `kv_cache` with its expiry and refresh it on 401. Use the serviceability endpoint for pincode checks in `/api/quote`. Each variant carries `packedWeightKg` (250 g bag = 0.27 kg, confirmed) and `lengthCm`/`breadthCm`/`heightCm` (placeholders). Shipment weight is the sum of `packedWeightKg × quantity`. Box dimensions for multi-bag orders are still to be decided.

### Netlify config changes the shop will need

- CSP in `scripts/prerender.mjs`: allow `https://checkout.razorpay.com` in `script-src`, `https://api.razorpay.com` in `frame-src`, and Razorpay's endpoints in `connect-src`. Verify the exact list against Razorpay's docs at implementation time.
- `Permissions-Policy` currently sets `payment=()`. Relax it at least for `/checkout` if Razorpay's payment flows need it.
- `Cross-Origin-Opener-Policy: same-origin` can break checkout popups (netbanking/wallets). Use `same-origin-allow-popups` on `/checkout`.
- The `/order/*` rewrite, and the `functions` directory if it isn't the default `netlify/functions`.

### Environment variables (Netlify UI only, never committed)

`DATABASE_URL`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`, `SHIPROCKET_PICKUP_LOCATION`, `SHIPROCKET_WEBHOOK_TOKEN`. For local work, keep them in `.env` (gitignored) and read them through `netlify dev`.
