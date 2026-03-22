#!/usr/bin/env node
/**
 * BeeLuxe Cleaners — Database Migration Runner
 *
 * Applies all SQL migration files in order against your Supabase project.
 * Requires SUPABASE_DB_URL in .env.local (postgres connection string).
 *
 * Usage:
 *   npm run db:migrate
 *
 * Environment variable format:
 *   SUPABASE_DB_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
 */

const fs   = require('fs')
const path = require('path')

async function main() {
  // Load env vars from .env.local
  try {
    const envPath = path.join(__dirname, '..', '.env.local')
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8')
      for (const line of content.split('\n')) {
        const [key, ...rest] = line.split('=')
        if (key && rest.length > 0) {
          process.env[key.trim()] = rest.join('=').trim()
        }
      }
    }
  } catch { /* ignore */ }

  const dbUrl = process.env.SUPABASE_DB_URL
  if (!dbUrl) {
    console.error('❌ SUPABASE_DB_URL is not set in .env.local')
    console.error('   Format: postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres')
    process.exit(1)
  }

  const migrationsDir = path.join(__dirname, 'migrations')
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()

  console.log(`\n🐝 BeeLuxe DB Migrations — ${files.length} file(s) found\n`)

  let { Client } = {}
  try {
    ;({ Client } = require('pg'))
  } catch {
    console.error('❌ pg package not found. Run: npm install pg')
    process.exit(1)
  }

  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })
  await client.connect()

  // Ensure migration tracking table exists
  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id         SERIAL PRIMARY KEY,
      filename   TEXT UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  for (const file of files) {
    const { rows } = await client.query(
      'SELECT 1 FROM _migrations WHERE filename = $1', [file]
    )
    if (rows.length > 0) {
      console.log(`  ✓ skipped  ${file}  (already applied)`)
      continue
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
    try {
      await client.query('BEGIN')
      await client.query(sql)
      await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file])
      await client.query('COMMIT')
      console.log(`  ✅ applied  ${file}`)
    } catch (err) {
      await client.query('ROLLBACK')
      console.error(`  ❌ failed   ${file}`)
      console.error(`     ${err.message}`)
      await client.end()
      process.exit(1)
    }
  }

  await client.end()
  console.log('\n✅ All migrations complete\n')
}

main().catch(err => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
