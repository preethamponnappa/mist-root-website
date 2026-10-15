import { useSyncExternalStore } from 'react';
import { MAX_QUANTITY_PER_LINE, lookupSku } from '../../shared/catalog.js';

/**
 * The cart: a list of `{ sku, quantity }` in localStorage, and nothing else.
 *
 * It never stores a price, a name or a total. Those are looked up from the
 * catalogue when shown, and recomputed by the server at checkout, so a stale or
 * hand-edited cart can never change what someone is charged.
 *
 * Read through `useSyncExternalStore` with an empty server snapshot: the
 * prerender and the hydration pass both see an empty cart, so the markup always
 * matches, and React re-renders with the stored cart straight after.
 */

const STORAGE_KEY = 'mistroot.cart.v1';
const EMPTY = Object.freeze([]);

let items = null;
const listeners = new Set();

/** Drop anything that is not a known, active SKU with a sane quantity. */
function sanitise(raw) {
  if (!Array.isArray(raw)) return EMPTY;
  const merged = new Map();
  for (const line of raw) {
    const found = line && typeof line.sku === 'string' ? lookupSku(line.sku) : null;
    const quantity = Number(line?.quantity);
    if (!found?.product.isActive || !Number.isInteger(quantity) || quantity < 1) continue;
    merged.set(line.sku, Math.min((merged.get(line.sku) ?? 0) + quantity, MAX_QUANTITY_PER_LINE));
  }
  return Object.freeze([...merged].map(([sku, quantity]) => Object.freeze({ sku, quantity })));
}

function readStorage() {
  try {
    return sanitise(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]'));
  } catch {
    return EMPTY;
  }
}

function getSnapshot() {
  if (items === null) items = readStorage();
  return items;
}

const getServerSnapshot = () => EMPTY;

function commit(next) {
  items = sanitise(next);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Private mode or a full quota: the cart still works for this visit.
  }
  for (const listener of listeners) listener();
}

// Keep tabs in step: adding a coffee in one tab updates the count in another.
function onStorage(event) {
  if (event.key !== STORAGE_KEY) return;
  items = readStorage();
  for (const listener of listeners) listener();
}

function subscribe(listener) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener('storage', onStorage);
  };
}

/** The cart lines, `[{ sku, quantity }]`. Always empty during prerender and hydration. */
export function useCart() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Add `quantity` of a SKU, merging with any existing line. Returns the line's
 * new quantity, which is capped at MAX_QUANTITY_PER_LINE.
 */
export function addToCart(sku, quantity = 1) {
  const current = getSnapshot();
  commit([...current, { sku, quantity }]);
  return getSnapshot().find((line) => line.sku === sku)?.quantity ?? 0;
}

export function setQuantity(sku, quantity) {
  commit(getSnapshot().map((line) => (line.sku === sku ? { sku, quantity } : line)));
}

export function removeFromCart(sku) {
  commit(getSnapshot().filter((line) => line.sku !== sku));
}

export function clearCart() {
  commit(EMPTY);
}

/** Total number of bags across every line. */
export const cartCount = (lines) => lines.reduce((sum, line) => sum + line.quantity, 0);
