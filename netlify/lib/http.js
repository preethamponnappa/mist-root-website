/**
 * The only way the functions talk to a third party (Razorpay, later
 * Shiprocket). Every call gets:
 *  - a per-attempt timeout (AbortSignal.timeout),
 *  - bounded retries with exponential backoff and full jitter, on network
 *    errors, 408, 429 and 5xx only — never on other 4xx,
 *  - one structured log line per attempt.
 *
 * Non-idempotent requests (anything that creates something) are retried only
 * when the caller passes `retrySafe: true` and says why in a comment at the
 * call site. Keep `timeoutMs × (retries + 1)` plus backoff well inside the
 * function's time limit (~10 s for synchronous functions).
 */

const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE']);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class HttpError extends Error {
  constructor(message, { status, body, service, op }) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
    this.service = service;
    this.op = op;
  }
}

/**
 * @param {object} options
 * @param {string} options.service     'razorpay', 'shiprocket', …
 * @param {string} options.op          short operation name for the logs
 * @param {string} options.url
 * @param {string} [options.method]
 * @param {Record<string, string>} [options.headers]
 * @param {unknown} [options.json]     serialised as the JSON body
 * @param {number} [options.timeoutMs] per attempt
 * @param {number} [options.retries]   extra attempts after the first
 * @param {boolean} [options.retrySafe] allow retrying a POST/PATCH
 * @param {ReturnType<import('./log.js').createLogger>} options.log
 * @param {typeof fetch} [options.fetchImpl] for tests
 * @returns {Promise<{ status: number, data: any }>}
 */
export async function request({
  service,
  op,
  url,
  method = 'GET',
  headers = {},
  json,
  timeoutMs = 4000,
  retries = 2,
  retrySafe = false,
  log,
  fetchImpl = fetch,
}) {
  const canRetry = SAFE_METHODS.has(method) || retrySafe;
  const attempts = 1 + (canRetry ? retries : 0);

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const started = Date.now();
    let status = 0;
    try {
      const response = await fetchImpl(url, {
        method,
        headers: {
          Accept: 'application/json',
          ...(json === undefined ? {} : { 'Content-Type': 'application/json' }),
          ...headers,
        },
        body: json === undefined ? undefined : JSON.stringify(json),
        signal: AbortSignal.timeout(timeoutMs),
      });
      status = response.status;
      const text = await response.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = { raw: text.slice(0, 500) };
      }

      const retryable = RETRYABLE_STATUS.has(status) && attempt < attempts;
      log.info('http', { service, op, attempt, status, durationMs: Date.now() - started, retrying: retryable });

      if (response.ok) return { status, data };
      if (retryable) {
        await sleep(backoff(attempt, response.headers.get('retry-after')));
        continue;
      }
      throw new HttpError(`${service} ${op} failed with ${status}`, { status, body: data, service, op });
    } catch (error) {
      if (error instanceof HttpError) throw error;
      // Network failure or timeout: no response at all.
      const retryable = attempt < attempts;
      log.warn('http', {
        service,
        op,
        attempt,
        status,
        durationMs: Date.now() - started,
        error: error.name === 'TimeoutError' ? 'timeout' : error.message,
        retrying: retryable,
      });
      if (!retryable) {
        throw new HttpError(`${service} ${op} unreachable: ${error.message}`, { status: 0, service, op });
      }
      await sleep(backoff(attempt));
    }
  }
  // Unreachable: the loop either returns or throws.
  throw new HttpError(`${service} ${op} exhausted retries`, { status: 0, service, op });
}

/** 250 ms, 500 ms, 1 s … with full jitter, capped at 2 s; honours Retry-After up to 3 s. */
function backoff(attempt, retryAfter) {
  const header = Number(retryAfter);
  if (Number.isFinite(header) && header > 0) return Math.min(header * 1000, 3000);
  const ceiling = Math.min(250 * 2 ** (attempt - 1), 2000);
  return Math.round(Math.random() * ceiling);
}
