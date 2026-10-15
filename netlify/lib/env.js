/**
 * Server-side configuration. Secrets are read here and nowhere else, only
 * from the environment (Netlify UI in production, .env under `netlify dev`).
 */

export class ConfigError extends Error {
  constructor(name) {
    super(`Missing environment variable ${name}`);
    this.name = 'ConfigError';
    this.variable = name;
  }
}

const read = (name) => globalThis.Netlify?.env?.get?.(name) ?? process.env[name];

export function requireEnv(name) {
  const value = read(name);
  if (!value) throw new ConfigError(name);
  return value;
}

export const optionalEnv = (name) => read(name) || undefined;
