import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { brackets } from './schema/bracket'

const db = drizzle({ connection: process.env.DATABASE_URL! })

const bracketData = [
  { id: 1, name: 'Exhibition', description: 'Decks built around a theme or gimmick rather than winning. No one wins or loose before turn 9.' },
  { id: 2, name: 'Core', description: 'Casual decks focused on creativity and entertainment. No one wins or loose before turn 8.' },
  { id: 3, name: 'Upgraded', description: 'Focused decks with strong synergies and good card quality. No one wins or loose before turn 6.' },
  { id: 4, name: 'Optimized', description: 'Highly tuned decks with powerful combos, fast mana, and efficient win conditions. No one wins or loose before turn 4.' },
  { id: 5, name: 'cEDH', description: 'Competitive decks built to win as fast and consistently as possible in the competitive metagame.' }
]

async function seed() {
  console.log('Seeding brackets...')
  await db.insert(brackets).values(bracketData).onConflictDoNothing()
  console.log('Seeded 5 brackets.')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
