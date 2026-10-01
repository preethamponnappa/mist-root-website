import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const onClient = () => true;
const onServer = () => false;

/**
 * False during the prerender and during hydration, true immediately after.
 *
 * Anything that depends on the URL's query string needs this. The prerender
 * writes one contact.html that is served for /contact and /contact?experience=…
 * alike, so a component that read the query during the first render would
 * produce markup the static file never contained. Gating on this keeps both
 * renders identical and lets the value appear a tick later.
 */
export function useIsHydrated() {
  return useSyncExternalStore(subscribe, onClient, onServer);
}
