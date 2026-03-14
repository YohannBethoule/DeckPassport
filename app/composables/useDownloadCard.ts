import { toPng } from 'html-to-image'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function useDownloadCard(element: Ref<HTMLElement | null>) {
  const loading = ref(false)

  async function download(deckName?: string) {
    const filename = deckName ? `${slugify(deckName)}_passport.png` : 'deck-passport.png'
    if (!element.value) return

    loading.value = true

    try {
      const rect = element.value.getBoundingClientRect()
      const dataUrl = await toPng(element.value, {
        pixelRatio: 2,
        skipFonts: true,
        includeQueryParams: true,
        width: Math.ceil(rect.width),
        height: Math.ceil(rect.height),
        fetchRequestInit: { mode: 'cors' }
      })

      const link = document.createElement('a')
      link.download = filename
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Failed to generate image:', error)
    } finally {
      loading.value = false
    }
  }

  return { download, loading }
}
