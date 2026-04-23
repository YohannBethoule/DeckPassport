import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '../database'
import type { H3Event } from 'h3'

export const auth = betterAuth({
  baseURL: {
    allowedHosts: [
      'localhost:3000',
      '*.vercel.app',
      '*.deckpassport.com',
      'deckpassport.com'
    ],
    fallback: 'https://deckpassport.com',
    protocol: import.meta.dev ? 'http' : 'https'
  },
  database: drizzleAdapter(db, {
    provider: 'pg'
  }),
  emailAndPassword: {
    enabled: true
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }
  }
})

export async function requireAuth(event: H3Event) {
  const session = await auth.api.getSession({ headers: event.headers }).catch(() => null)
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return session.user
}
