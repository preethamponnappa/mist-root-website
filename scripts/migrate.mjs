/**
 * Applies db/migrations/*.sql in filename order, each once, each in its own
 * transaction, recording what ran in schema_migrations.
 *
 *   DATABASE_URL=postgres://… node scripts/migrate.mjs
 *   (or: npm run db:migrate, which reads .env)
 *
 * Migrations are append-only: never edit one that has run anywhere; add a new
 * numbered file instead.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../db/migrations');
const files = fs.readdirSync(dir).filter((f) => /^\d+_.+\.sql$/.test(f)).sort();

const pool = new Pool({ connectionString: url });
const client = await pool.connect();
try {
  await client.query(`create table if not exists schema_migrations (
    name text primary key, applied_at timestamptz not null default now())`);
  const done = new Set((await client.query('select name from schema_migrations')).rows.map((r) => r.name));

  for (const file of files) {
    if (done.has(file)) {
      console.log(`  skip  ${file}`);
      continue;
    }
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    await client.query('begin');
    try {
      await client.query(sql);
      await client.query('insert into schema_migrations (name) values ($1)', [file]);
      await client.query('commit');
      console.log(`  apply ${file}`);
    } catch (error) {
      await client.query('rollback');
      console.error(`  FAIL  ${file}: ${error.message}`);
      process.exitCode = 1;
      break;
    }
  }
} finally {
  client.release();
  await pool.end();
}
