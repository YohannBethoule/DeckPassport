import { type ScryfallCard, getCardImageUri, getCardFaceImageUri, isDoubleFacedCard } from '~/composables/useScryfall'

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
  const currentFaceIndex = ref(0)

  const isDoubleFaced = computed(() =>
    selectedCard.value ? isDoubleFacedCard(selectedCard.value) : false
  )

  async function onSearch(query: string) {
    searchResults.value = await searchFn(query)
  }

  async function onCardSelect(name: string) {
    if (!name) return
    const card = searchResults.value.find(c => c.name === name)
    if (!card) return

    selectedCard.value = card
    currentFaceIndex.value = 0
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
    currentFaceIndex.value = 0
    return getCardImageUri(print)
  }

  function flip(): string | undefined {
    if (!selectedCard.value || !isDoubleFaced.value) return
    currentFaceIndex.value = currentFaceIndex.value === 0 ? 1 : 0
    return getCardFaceImageUri(selectedCard.value, currentFaceIndex.value)
  }

  function clear() {
    selectedCard.value = null
    searchResults.value = []
    prints.value = []
    currentFaceIndex.value = 0
  }

  return {
    searchResults,
    selectedCard,
    prints,
    loadingPrints,
    currentFaceIndex,
    isDoubleFaced,
    onSearch,
    onCardSelect,
    selectPrint,
    flip,
    initializeFromName,
    clear
  }
}
