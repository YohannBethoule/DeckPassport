import type { InsertDeckWithCommander } from '#shared/schemas/deck'

export function useDeckPassport() {
  return useState<InsertDeckWithCommander | null>('deck-passport', () => null)
}
