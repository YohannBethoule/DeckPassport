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
  prints_search_uri?: string
  set_name?: string
  collector_number?: string
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

function debouncedSearch(filter: string) {
  let timer: ReturnType<typeof setTimeout> | null = null

  return async (query: string): Promise<ScryfallCard[]> => {
    if (query.length < 2) return []

    if (timer) clearTimeout(timer)

    return new Promise((resolve) => {
      timer = setTimeout(async () => {
        try {
          const response = await $fetch<SearchResponse>(
            `${SCRYFALL_API}/cards/search`,
            { query: { q: `${query} ${filter}`, order: 'name' } }
          )
          resolve(response.data)
        } catch {
          resolve([])
        }
      }, 300)
    })
  }
}

export function useScryfall() {
  const searchCommanders = debouncedSearch('is:commander')
  const searchBackgrounds = debouncedSearch('t:background')

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

  async function fetchPrints(printsSearchUri: string): Promise<ScryfallCard[]> {
    try {
      const response = await $fetch<SearchResponse>(printsSearchUri, {
        query: { unique: 'prints', order: 'released' }
      })
      return response.data
    } catch {
      return []
    }
  }

  return { searchCommanders, searchBackgrounds, fetchCardByName, fetchPrints }
}
