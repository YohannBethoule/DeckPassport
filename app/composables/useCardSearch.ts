import { type ScryfallCard, getCardImageUri } from '~/composables/useScryfall'

interface UseCardSearchOptions {
  searchFn: (query: string) => Promise<ScryfallCard[]>
  onSelect?: (card: ScryfallCard, imageUrl: string | undefined) => void
}

export function useCardSearch({ searchFn, onSelect }: UseCardSearchOptions) {
  const { fetchPrints, fetchCardByName } = useScryfall()

  const searchResults = ref<ScryfallCard[]>([])
  const selectedCard = ref<ScryfallCard | null>(null)
  const prints = ref<ScryfallCard[]>([])
  const loadingPrints = ref(false)

  async function onSearch(query: string) {
    searchResults.value = await searchFn(query)
  }

  async function onCardSelect(name: string) {
    if (!name) return
    const card = searchResults.value.find(c => c.name === name)
    if (!card) return

    selectedCard.value = card
    const imageUrl = getCardImageUri(card)
    onSelect?.(card, imageUrl)

    await loadPrints(card)
  }

  async function loadPrints(card: ScryfallCard) {
    prints.value = []
    if (card.prints_search_uri) {
      loadingPrints.value = true
      prints.value = await fetchPrints(card.prints_search_uri)
      loadingPrints.value = false
    }
  }

  async function initializeFromName(name: string) {
    if (!name) return
    const card = await fetchCardByName(name)
    if (!card) return

    selectedCard.value = card
    await loadPrints(card)
  }

  function selectPrint(print: ScryfallCard): string | undefined {
    return getCardImageUri(print)
  }

  function clear() {
    selectedCard.value = null
    searchResults.value = []
    prints.value = []
  }

  return {
    searchResults,
    selectedCard,
    prints,
    loadingPrints,
    onSearch,
    onCardSelect,
    selectPrint,
    initializeFromName,
    clear
  }
}
