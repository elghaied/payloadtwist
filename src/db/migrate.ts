import { drizzle } from 'drizzle-orm/node-postgres'
import { sql } from 'drizzle-orm'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function runAuthMigrations() {
  if (!process.env.AUTH_DATABASE_URL) return

  const db = drizzle(process.env.AUTH_DATABASE_URL)

  // Check if auth tables already exist (users is the core table)
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'users'
    )
  `)

  if (result.rows[0]?.exists) return

  // Tables don't exist — apply initial migration
  const migrationPath = join(process.cwd(), 'drizzle', '0000_tranquil_network.sql')
  const migrationSql = readFileSync(migrationPath, 'utf-8')

  const statements = migrationSql.split('--> statement-breakpoint')
  for (const stmt of statements) {
    const trimmed = stmt.trim()
    if (trimmed) {
      await db.execute(sql.raw(trimmed))
    }
  }
}
