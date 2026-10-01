import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { prerenderToNodeStream } from 'react-dom/static';
import { StaticRouter } from 'react-router';
import App from './App.jsx';
import './index.css';

/**
 * Build-time entry point. `scripts/prerender.mjs` calls `warm()` once and then
 * `render()` for each route, writing the result into the client build's
 * index.html template.
 *
 * It mirrors src/main.jsx exactly — same StrictMode, same App — with
 * StaticRouter standing in for BrowserRouter, so the markup React produces here
 * is the markup the client hydrates against.
 */

function tree(url) {
  return (
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>
  );
}

/**
 * Resolve every route's lazy chunk before anything is rendered for real.
 *
 * The pages are React.lazy, so a first render suspends. React's streaming
 * renderers cope with that by emitting the fallback in place and parking the
 * real content in a hidden <div> with a script to swap them in — which would
 * put the whole page somewhere a crawler reads as dead markup. Rendering each
 * route once and throwing the output away resolves the lazy payloads as a side
 * effect, so the renders that count come out as plain, correctly positioned
 * HTML.
 */
export async function warm(urls) {
  for (const url of urls) {
    const { prelude } = await prerenderToNodeStream(tree(url));
    // eslint-disable-next-line no-unused-vars
    for await (const _chunk of prelude) {
      // drained purely to let the stream finish; the markup is discarded
    }
  }
}

/**
 * renderToString deliberately, not a streaming renderer: it cannot suspend, so
 * if a chunk somehow has not been warmed this throws instead of quietly
 * shipping a page whose content is hidden behind JavaScript.
 */
export function render(url) {
  return renderToString(tree(url));
}
