import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)

export const db = drizzle({
  client: sql,
  schema
})

export type DbTransaction = Parameters<Parameters<typeof db['transaction']>[0]>[0]
