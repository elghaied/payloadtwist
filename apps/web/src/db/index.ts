import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema'

if (!process.env.AUTH_DATABASE_URL) {
  throw new Error('AUTH_DATABASE_URL environment variable is not set')
}

export const db = drizzle(process.env.AUTH_DATABASE_URL, { schema })
