/**
 * Structured logging: one JSON object per line, which Netlify's function logs
 * keep intact and which can be searched by field (`requestId`, `orderId`, …).
 *
 * Never pass secrets, auth headers, full addresses, card or UPI details. The
 * redaction below is a backstop for mistakes, not a licence to log freely.
 */

const REDACT = /^(authorization|password|secret|token|key_secret|keySecret|signature|razorpay_signature|cookie|address|line1|line2|card|vpa)$/i;

function scrub(value, depth = 0) {
  if (value === null || typeof value !== 'object' || depth > 4) return value;
  if (value instanceof Error) return { name: value.name, message: value.message };
  if (Array.isArray(value)) return value.map((v) => scrub(v, depth + 1));
  return Object.fromEntries(
    Object.entries(value).map(([k, v]) => [k, REDACT.test(k) ? '[redacted]' : scrub(v, depth + 1)]),
  );
}

function write(level, msg, fields = {}) {
  const line = JSON.stringify({ ts: new Date().toISOString(), level, msg, ...scrub(fields) });
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

/** A logger with fields (e.g. requestId) attached to every line it writes. */
export function createLogger(base = {}) {
  return {
    info: (msg, fields) => write('info', msg, { ...base, ...fields }),
    warn: (msg, fields) => write('warn', msg, { ...base, ...fields }),
    error: (msg, fields) => write('error', msg, { ...base, ...fields }),
    child: (fields) => createLogger({ ...base, ...fields }),
  };
}
