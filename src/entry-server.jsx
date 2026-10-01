import { StrictMode } from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
import { StaticRouter } from 'react-router';
import App from './App.jsx';
import './index.css';

/**
 * Build-time entry point. `scripts/prerender.mjs` calls this once per route and
 * writes the result into the client build's index.html template.
 *
 * It mirrors src/main.jsx exactly — same StrictMode, same App — with
 * StaticRouter standing in for BrowserRouter, so the markup React produces here
 * is the markup the client hydrates against.
 *
 * prerenderToNodeStream rather than renderToString because the routes are
 * React.lazy: this waits for every Suspense boundary to settle before handing
 * back the markup, so the static HTML holds the real page and never a
 * fallback.
 */
export async function render(url) {
  const { prelude } = await prerenderToNodeStream(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );

  let html = '';
  for await (const chunk of prelude) html += chunk;
  return html;
}
