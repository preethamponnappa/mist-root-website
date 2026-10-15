/**
 * Postgres (Neon) over HTTP — no connection pool to exhaust from short-lived
 * functions. Every query goes through `query` or `transaction` here, which
 * give it a timeout and one log line with its duration. Writes are never
 * retried here: callers make them idempotent with unique constraints and
 * conditional updates instead.
 */
import { neon } from '@neondatabase/serverless';
import { requireEnv } from './env.js';

let client = null;

function sql() {
  client ??= neon(requireEnv('DATABASE_URL'));
  return client;
}

const fetchOptions = (timeoutMs) => ({ fetchOptions: { signal: AbortSignal.timeout(timeoutMs) } });

/** Run one parameterised statement. Returns the rows. */
export async function query(log, op, text, params = [], { timeoutMs = 5000 } = {}) {
  const started = Date.now();
  try {
    const rows = await sql().query(text, params, fetchOptions(timeoutMs));
    log.info('db', { op, durationMs: Date.now() - started, rows: rows.length });
    return rows;
  } catch (error) {
    log.error('db', { op, durationMs: Date.now() - started, error: error.message });
    throw error;
  }
}

/**
 * Run several statements in one non-interactive transaction. `build` receives
 * the transaction's query function and returns `[txn.query(text, params), …]`.
 * Returns one rows array per statement.
 */
export async function transaction(log, op, build, { timeoutMs = 6000 } = {}) {
  const started = Date.now();
  try {
    const results = await sql().transaction(build, fetchOptions(timeoutMs));
    log.info('db', { op, durationMs: Date.now() - started, statements: results.length });
    return results;
  } catch (error) {
    log.error('db', { op, durationMs: Date.now() - started, error: error.message });
    throw error;
  }
}
