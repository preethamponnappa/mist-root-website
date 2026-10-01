import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { canonicalFor, pageFor } from '../lib/seo';

/**
 * Keeps the document head in sync with the current route.
 *
 * The prerender bakes these same tags into every static HTML file, so this
 * component exists purely for client-side navigation — it renders nothing and
 * writes nothing during server rendering, which keeps it out of hydration's
 * way entirely. Both sides read their values from `src/lib/seo.js`.
 */
export default function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = pageFor(pathname);
    const url = page.noindex ? canonicalFor(pathname) : canonicalFor(page.path);

    document.title = page.title;
    setMeta('name', 'description', page.description);
    setMeta('property', 'og:title', page.title);
    setMeta('property', 'og:description', page.description);
    setMeta('property', 'og:url', url);
    setMeta('name', 'twitter:title', page.title);
    setMeta('name', 'twitter:description', page.description);
    setLink('canonical', url);

    // Only the not-found route carries a robots directive; everything else
    // must not inherit one left behind by a previous navigation.
    if (page.noindex) setMeta('name', 'robots', 'noindex, follow');
    else document.querySelector('meta[name="robots"]')?.remove();
  }, [pathname]);

  return null;
}

function setMeta(keyAttr, key, value) {
  if (!value) return;
  let tag = document.head.querySelector(`meta[${keyAttr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(keyAttr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', value);
}

function setLink(rel, href) {
  let tag = document.head.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
}
