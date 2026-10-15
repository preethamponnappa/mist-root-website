import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HttpError, request } from '../netlify/lib/http.js';

const lines = [];
const log = {
  info: (msg, fields) => lines.push({ level: 'info', msg, ...fields }),
  warn: (msg, fields) => lines.push({ level: 'warn', msg, ...fields }),
  error: (msg, fields) => lines.push({ level: 'error', msg, ...fields }),
};

/** A fake fetch that replays the given responses (or throws errors) in order. */
function fakeFetch(...steps) {
  const calls = [];
  const impl = async (url, init) => {
    calls.push(init);
    const step = steps[calls.length - 1];
    if (step instanceof Error) throw step;
    return new Response(JSON.stringify(step.body ?? {}), { status: step.status });
  };
  return { impl, calls };
}

const base = { service: 'test', op: 'op', url: 'https://example.invalid/x', log };

test('retries a GET on 503, then succeeds', async () => {
  const { impl, calls } = fakeFetch({ status: 503 }, { status: 200, body: { ok: 1 } });
  const res = await request({ ...base, fetchImpl: impl });
  assert.equal(res.data.ok, 1);
  assert.equal(calls.length, 2);
});

test('does not retry a 400', async () => {
  const { impl, calls } = fakeFetch({ status: 400 }, { status: 200 });
  await assert.rejects(request({ ...base, fetchImpl: impl }), (e) => e instanceof HttpError && e.status === 400);
  assert.equal(calls.length, 1);
});

test('never retries a POST unless marked retry-safe', async () => {
  const unsafe = fakeFetch({ status: 503 }, { status: 200 });
  await assert.rejects(request({ ...base, method: 'POST', json: {}, fetchImpl: unsafe.impl }));
  assert.equal(unsafe.calls.length, 1);

  const safe = fakeFetch({ status: 503 }, { status: 200, body: { id: 'x' } });
  const res = await request({ ...base, method: 'POST', json: {}, retrySafe: true, fetchImpl: safe.impl });
  assert.equal(res.data.id, 'x');
  assert.equal(safe.calls.length, 2);
});

test('retries network errors and gives up after the budget', async () => {
  const { impl, calls } = fakeFetch(new TypeError('fetch failed'), new TypeError('fetch failed'), new TypeError('fetch failed'));
  await assert.rejects(request({ ...base, retries: 2, fetchImpl: impl }), (e) => e.status === 0);
  assert.equal(calls.length, 3);
});

test('every attempt carries a timeout signal and is logged', async () => {
  lines.length = 0;
  const { impl, calls } = fakeFetch({ status: 200 });
  await request({ ...base, fetchImpl: impl });
  assert.ok(calls[0].signal instanceof AbortSignal);
  assert.equal(lines.length, 1);
  assert.equal(lines[0].service, 'test');
  assert.equal(lines[0].attempt, 1);
  assert.equal(typeof lines[0].durationMs, 'number');
});
