-- Orders, their lines, payments, webhook dedupe and the fulfilment outbox.
-- Money is integer paise everywhere (see CLAUDE.md, rule 1).

create table orders (
  id                bigint generated always as identity primary key,
  public_id         text not null unique,
  status            text not null default 'pending_payment'
                    check (status in ('pending_payment', 'paid', 'payment_failed',
                                      'fulfilment_queued', 'shipped', 'delivered', 'cancelled')),
  name              text not null,
  email             text not null,
  phone             text not null,
  shipping_address  jsonb not null,
  subtotal_paise    integer not null check (subtotal_paise > 0),
  shipping_paise    integer not null check (shipping_paise >= 0),
  total_paise       integer not null check (total_paise = subtotal_paise + shipping_paise),
  currency          text not null default 'INR' check (currency = 'INR'),
  razorpay_order_id text unique,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  paid_at           timestamptz
);

create index orders_status_created_idx on orders (status, created_at desc);

-- Each line keeps a snapshot of what was sold and at what price, so later
-- catalogue changes never rewrite an old order.
create table order_items (
  id               bigint generated always as identity primary key,
  order_id         bigint not null references orders (id) on delete cascade,
  sku              text not null,
  product_slug     text not null,
  product_name     text not null,
  size_grams       integer not null check (size_grams > 0),
  grind            text not null,
  quantity         integer not null check (quantity between 1 and 10),
  unit_price_paise integer not null check (unit_price_paise > 0),
  line_total_paise integer not null check (line_total_paise = unit_price_paise * quantity),
  unique (order_id, sku)
);

create table payments (
  id                  bigint generated always as identity primary key,
  order_id            bigint not null references orders (id),
  razorpay_payment_id text not null unique,
  razorpay_order_id   text not null,
  amount_paise        integer not null check (amount_paise > 0),
  status              text not null check (status in ('verified', 'captured', 'failed')),
  method              text,
  source              text not null,
  created_at          timestamptz not null default now()
);

-- One row per Razorpay webhook delivery we have processed. Payloads are not
-- stored: they carry customer contact details we already hold on the order.
create table webhook_events (
  event_id    text primary key,
  event_type  text not null,
  order_id    bigint references orders (id),
  received_at timestamptz not null default now()
);

-- Outbox for fulfilment (Shiprocket). A paid order gets exactly one job; the
-- scheduled worker advances `step` and records each attempt.
create table fulfilment_jobs (
  order_id        bigint primary key references orders (id),
  step            text not null,
  attempts        integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  last_error      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
