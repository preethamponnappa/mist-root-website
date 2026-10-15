/**
 * Request/response plumbing shared by every function: a request id on every
 * log line and response, bounded JSON body parsing, and uniform errors that
 * never leak internals to the browser.
 */
import { randomUUID } from 'node:crypto';
import { createLogger } from './log.js';
import { ConfigError } from './env.js';

const MAX_BODY_BYTES = 32 * 1024;

export class ClientError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function json(status, body, requestId, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Request-Id': requestId,
      ...headers,
    },
  });
}

/** Raw body text, refusing anything over the size limit. */
export async function readText(req) {
  const length = Number(req.headers.get('content-length') ?? 0);
  if (length > MAX_BODY_BYTES) throw new ClientError(413, 'too_large', 'Request body too large.');
  const text = await req.text();
  if (text.length > MAX_BODY_BYTES) throw new ClientError(413, 'too_large', 'Request body too large.');
  return text;
}

export async function readJson(req) {
  const text = await readText(req);
  try {
    return JSON.parse(text || '{}');
  } catch {
    throw new ClientError(400, 'bad_json', 'Request body is not valid JSON.');
  }
}

/**
 * Wrap a handler: assigns the request id and logger, enforces the method, and
 * turns thrown errors into JSON responses. ClientErrors go back as-is; a
 * missing configuration becomes 503 (checkout not set up); anything else is a
 * logged 500 with no detail sent to the browser.
 */
export function handler(methods, fn) {
  return async (req, context) => {
    const requestId = context?.requestId ?? randomUUID();
    const log = createLogger({ requestId, fn: new URL(req.url).pathname });

    if (!methods.includes(req.method)) {
      return json(405, { error: 'method_not_allowed' }, requestId, { Allow: methods.join(', ') });
    }

    try {
      return await fn(req, { context, log, requestId });
    } catch (error) {
      if (error instanceof ClientError) {
        log.warn('client_error', { status: error.status, code: error.code });
        return json(error.status, { error: error.code, message: error.message, details: error.details }, requestId);
      }
      if (error instanceof ConfigError) {
        log.error('not_configured', { variable: error.variable });
        return json(503, { error: 'not_configured', message: 'Checkout is not available right now.' }, requestId);
      }
      log.error('unhandled', { error });
      return json(500, { error: 'internal', message: 'Something went wrong. Please try again.', requestId }, requestId);
    }
  };
}
