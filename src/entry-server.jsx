import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
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
 */
export function render(url) {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );
}
