import type { InsertDeckWithCommander } from '#shared/schemas/deck'

export const testDeck: InsertDeckWithCommander = {
  commanderName: 'Atraxa, Praetors\' Voice',
  imageUrl: 'https://cards.scryfall.io/large/front/7/c/7cc19f85-7ef6-4fd2-83e5-0dbae1d80f2b.jpg?1682712582',
  colors: ['W', 'U', 'B', 'G'],
  title: 'Atraxa Superfriends',
  bracket: 3,
  description: 'A planeswalker-focused deck that uses Atraxa\'s proliferate ability to accelerate loyalty counters. Plays a controlling game with board wipes and removal while building up an army of planeswalkers.',
  winCondition: 'Ultimate multiple planeswalkers for overwhelming value, or win through Vorinclex + Doubling Season combo with any planeswalker ultimate.',
  coreCards: 'Doubling Season\nVorinclex, Monstrous Raider\nDeepglow Skate\nTeferi, Master of Time\nElspeth, Sun\'s Champion',
  deckListUrl: 'https://www.moxfield.com/decks/example-atraxa'
}
