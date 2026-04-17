export function useAffiliate() {
  const config = useRuntimeConfig()

  const isEU = ref(false)

  function hasValue(value: string) {
    return value.trim().length > 0
  }

  const hasTcgplayer = computed(() => {
    const impactUrl = normalizeExternalUrl(config.public.tcgplayerImpactUrl as string)
    return hasValue(impactUrl)
  })
  const hasCardmarket = computed(() => hasValue(config.public.cardmarketReferrerId as string))
  const hasAnyAffiliate = computed(() => hasTcgplayer.value || hasCardmarket.value)

  onMounted(() => {
    isEU.value = Intl.DateTimeFormat().resolvedOptions().timeZone.startsWith('Europe/')
  })

  function appendQuery(url: string, key: string, value: string) {
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}${key}=${encodeURIComponent(value)}`
  }

  function normalizeExternalUrl(url: string) {
    const trimmed = url.trim()
    if (!trimmed) return ''
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  }

  function tcgplayerUrl(cardName?: string) {
    const impactBaseUrl = normalizeExternalUrl(config.public.tcgplayerImpactUrl as string)
    const destination = cardName
      ? `https://www.tcgplayer.com/search/magic/product?q=${encodeURIComponent(cardName)}`
      : 'https://www.tcgplayer.com/magic'

    if (impactBaseUrl) {
      return appendQuery(impactBaseUrl, 'u', destination)
    }

    return destination
  }

  function cardmarketUrl(cardName?: string) {
    const referrerId = config.public.cardmarketReferrerId as string
    const base = cardName
      ? `https://www.cardmarket.com/en/Magic/Products/Singles?searchString=${encodeURIComponent(cardName)}`
      : 'https://www.cardmarket.com/en/Magic'
    if (!referrerId) return base
    return `${base}&referrer=${referrerId}`
  }

  function buyUrl(cardName: string) {
    if (!hasAnyAffiliate.value) {
      return ''
    }

    if (isEU.value && hasCardmarket.value) {
      return cardmarketUrl(cardName)
    }
    return tcgplayerUrl(cardName)
  }

  const marketplaceName = computed(() => (isEU.value && hasCardmarket.value) ? 'CardMarket' : 'TCGPlayer')

  return { isEU, hasTcgplayer, hasCardmarket, hasAnyAffiliate, buyUrl, tcgplayerUrl, cardmarketUrl, marketplaceName }
}
