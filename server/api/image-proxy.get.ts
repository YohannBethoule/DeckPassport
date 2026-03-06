export default defineEventHandler(async (event) => {
  const { url } = getQuery(event)

  if (!url || typeof url !== 'string') {
    throw createError({ statusCode: 400, message: 'Missing url parameter' })
  }

  const parsed = new URL(url)
  if (parsed.hostname !== 'cards.scryfall.io') {
    throw createError({ statusCode: 403, message: 'Only Scryfall image URLs are allowed' })
  }

  const response = await fetch(url)
  if (!response.ok) {
    throw createError({ statusCode: response.status, message: 'Failed to fetch image' })
  }

  const contentType = response.headers.get('content-type') ?? 'image/jpeg'
  setResponseHeader(event, 'content-type', contentType)
  setResponseHeader(event, 'cache-control', 'public, max-age=86400')

  const buffer = Buffer.from(await response.arrayBuffer())
  return send(event, buffer, contentType)
})
