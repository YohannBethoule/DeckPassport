interface ScryfallImageUris {
  small: string
  normal: string
  large: string
  png: string
  art_crop: string
  border_crop: string
}

interface ScryfallCardFace {
  name: string
  mana_cost: string
  type_line: string
  oracle_text?: string
  colors: string[]
  image_uris?: ScryfallImageUris
}

export interface ScryfallCard {
  name: string
  image_uris?: ScryfallImageUris
  card_faces?: ScryfallCardFace[]
  colors: string[]
  color_identity: string[]
  mana_cost: string
  type_line: string
  oracle_text?: string
  keywords: string[]
  legalities: Record<string, string>
  scryfall_uri: string
}

export function getCardImageUri(card: ScryfallCard, size: keyof ScryfallImageUris = 'normal'): string | undefined {
  return card.image_uris?.[size] ?? card.card_faces?.[0]?.image_uris?.[size]
}

interface SearchResponse {
  object: string
  total_cards: number
  data: ScryfallCard[]
}

const SCRYFALL_API = 'https://api.scryfall.com'

export function useScryfall() {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  async function searchCommanders(query: string): Promise<ScryfallCard[]> {
    if (query.length < 2) return []

    if (debounceTimer) clearTimeout(debounceTimer)

    return new Promise((resolve) => {
      debounceTimer = setTimeout(async () => {
        try {
          const response = await $fetch<SearchResponse>(
            `${SCRYFALL_API}/cards/search`,
            { query: { q: `${query} is:commander`, order: 'name' } }
          )
          resolve(response.data)
        } catch {
          resolve([])
        }
      }, 300)
    })
  }

  async function fetchCardByName(name: string): Promise<ScryfallCard | null> {
    try {
      return await $fetch<ScryfallCard>(
        `${SCRYFALL_API}/cards/named`,
        { query: { exact: name } }
      )
    } catch {
      return null
    }
  }

  return { searchCommanders, fetchCardByName }
}
