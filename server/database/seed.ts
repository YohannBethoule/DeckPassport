import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { archetypes } from './schema/archetype'
import { brackets } from './schema/bracket'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle({ client: sql })

const bracketData = [
  { id: 1, name: 'Exhibition', description: 'Decks built around a theme or gimmick rather than winning. No one wins or loose before turn 9.' },
  { id: 2, name: 'Core', description: 'Casual decks focused on creativity and entertainment. No one wins or loose before turn 8.' },
  { id: 3, name: 'Upgraded', description: 'Focused decks with strong synergies and good card quality. No one wins or loose before turn 6.' },
  { id: 4, name: 'Optimized', description: 'Highly tuned decks with powerful combos, fast mana, and efficient win conditions. No one wins or loose before turn 4.' },
  { id: 5, name: 'cEDH', description: 'Competitive decks built to win as fast and consistently as possible in the competitive metagame.' }
]

const archetypeData = [
  { id: 1, name: 'Aggro', description: 'Aims to win quickly through aggressive creature-based attacks and direct damage.' },
  { id: 2, name: 'Aristocrats', description: 'Generates value by repeatedly sacrificing and recurring creatures for incremental advantage.' },
  { id: 3, name: 'Burn', description: 'Wins through direct damage spells targeting opponents and their life totals.' },
  { id: 4, name: 'Combo', description: 'Seeks to assemble specific card combinations that win the game or generate overwhelming advantage.' },
  { id: 5, name: 'Control', description: 'Focuses on answering threats with removal and counterspells, winning in the late game.' },
  { id: 6, name: 'Group Hug', description: 'Provides resources and benefits to all players, using politics and goodwill to survive.' },
  { id: 7, name: 'Group Slug', description: 'Punishes all players for taking game actions, draining life totals symmetrically.' },
  { id: 8, name: 'Infect', description: 'Wins by dealing poison counters to opponents through creatures with infect or proliferate effects.' },
  { id: 9, name: 'Landfall', description: 'Leverages land drops to trigger powerful abilities and generate incremental value.' },
  { id: 10, name: 'Mill', description: 'Wins by depleting opponents\' libraries rather than reducing their life totals.' },
  { id: 11, name: 'Midrange', description: 'Plays efficient threats and removal to grind out value and dominate the mid-game.' },
  { id: 12, name: 'Pillowfort', description: 'Builds a defensive fortress of enchantments and artifacts to deter attacks.' },
  { id: 13, name: 'Ramp', description: 'Accelerates mana production to deploy large threats and powerful spells ahead of curve.' },
  { id: 14, name: 'Reanimator', description: 'Fills the graveyard with powerful creatures and brings them back to the battlefield cheaply.' },
  { id: 15, name: 'Spellslinger', description: 'Casts a high volume of instants and sorceries, often copying or recurring them for value.' },
  { id: 16, name: 'Stax', description: 'Restricts opponents\' resources and actions through taxing effects and lock pieces.' },
  { id: 17, name: 'Stompy', description: 'Deploys large, efficient creatures to overwhelm opponents through raw power.' },
  { id: 18, name: 'Storm', description: 'Chains together many cheap spells in a single turn to fuel a storm-count win condition.' },
  { id: 19, name: 'Tokens', description: 'Creates a wide board of creature tokens, then buffs them with anthems and overrun effects.' },
  { id: 20, name: 'Toolbox', description: 'Runs a suite of silver-bullet answers, using tutors and recursion to find the right tool.' },
  { id: 21, name: 'Tribal', description: 'Built around a specific creature type, leveraging lords and tribal synergies.' },
  { id: 22, name: 'Voltron', description: 'Focuses on suiting up a single creature with equipment and auras to deal commander damage.' },
  { id: 23, name: 'Wheels', description: 'Forces all players to discard and draw new hands, exploiting discard triggers and asymmetry.' },
  { id: 24, name: 'Chaos', description: 'Introduces randomness and unpredictability to disrupt normal game plans.' },
  { id: 25, name: 'Enchantress', description: 'Draws cards and generates value from casting enchantments, building an enchantment-heavy board.' },
  { id: 26, name: 'Superfriends', description: 'Deploys multiple planeswalkers and protects them to leverage their loyalty abilities.' },
  { id: 27, name: 'Blink', description: 'Repeatedly exiles and returns creatures to the battlefield to reuse enter-the-battlefield effects.' },
  { id: 28, name: 'Clone', description: 'Copies opponents\' and own powerful creatures and permanents to multiply threats.' },
  { id: 29, name: 'Theft', description: 'Steals opponents\' permanents and spells, turning their resources against them.' },
  { id: 30, name: 'Lifegain', description: 'Gains large amounts of life and converts that life total into win conditions and card advantage.' },
  { id: 31, name: '+1/+1', description: 'Put a ton of +1/+1 counters of your creatures.' },
  { id: 32, name: 'Goad', description: 'Force your opponents to fight amongst themselves.' }
]

async function seed() {
  console.log('Seeding archetypes...')
  await db.insert(archetypes).values(archetypeData).onConflictDoNothing()
  console.log(`Seeded ${archetypeData.length} archetypes.`)

  console.log('Seeding brackets...')
  await db.insert(brackets).values(bracketData).onConflictDoNothing()
  console.log('Seeded 5 brackets.')

  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
