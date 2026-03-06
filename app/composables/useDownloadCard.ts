import { toPng } from 'html-to-image'

export function useDownloadCard(element: Ref<HTMLElement | null>) {
  const loading = ref(false)

  async function download(filename = 'deck-passport.png') {
    if (!element.value) return

    loading.value = true

    try {
      const dataUrl = await toPng(element.value, {
        pixelRatio: 2,
        skipFonts: true,
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
