import type { InsertDeckWithCommander } from '#shared/schemas/deck'

export const testDeck: InsertDeckWithCommander = {
  commanderName: 'Atraxa, Praetors\' Voice',
  imageUrl: 'https://cards.scryfall.io/large/front/7/c/7cc19f85-7ef6-4fd2-83e5-0dbae1d80f2b.jpg?1682712582',
  colors: ['W', 'U', 'B', 'G'],
  title: 'Atraxa Superfriends',
  bracket: 3,
  // description: 'A planeswalker-focused deck that uses Atraxa\'s proliferate ability to accelerate loyalty counters. Plays a controlling game with board wipes and removal while building up an army of planeswalkers.',
  description: 'A planeswalker-focused deck that uses Atraxa\'s.',
  winCondition: 'Ultimate multiple planeswalkers for overwhelming value, or win through Vorinclex + Doubling Season combo with any planeswalker ultimate.',
  coreCards: [
    { name: 'Doubling Season', imageUrl: 'https://cards.scryfall.io/large/front/8/6/8676d164-c76e-402b-a649-6ded3f549b6e.jpg' },
    { name: 'Vorinclex, Monstrous Raider', imageUrl: 'https://cards.scryfall.io/large/front/9/2/92613468-205e-488b-930d-11908477e9f8.jpg' },
    { name: 'Deepglow Skate', imageUrl: 'https://cards.scryfall.io/large/front/4/a/4a8b26dc-de39-4510-9571-6a08afaabe4d.jpg' }
  ],
  deckListUrl: 'https://www.moxfield.com/decks/example-atraxa'
}
