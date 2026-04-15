import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '../database'

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
