import type { InsertDeckWithCommander } from '#shared/schemas/deck'
import type { ManaColor } from '#shared/schemas/commander'

type RawDeck = {
  id: number
  title: string
  description: string
  winCondition: string
  coreCards: string | null
  deckListUrl: string | null
  commander: { id: number, name: string, imageUrl: string | null, colors: string[] }
  partnerCommander: { id: number, name: string, imageUrl: string | null, colors: string[] } | null
  background: { id: number, name: string, imageUrl: string | null } | null
  bracket: { id: number }
  archetypes: { archetypeId: number, archetype: { name: string } }[] | null
  commanderPrints: { commanderId: number, commanderPrintUri: string }[] | null
  backgroundPrints: { backgroundId: number, backgroundPrintUri: string }[] | null
}

function getCommanderPrintUri(d: RawDeck, commanderId: number): string | undefined {
  return d.commanderPrints?.find(p => p.commanderId === commanderId)?.commanderPrintUri
}

export function toDeckView(d: RawDeck): { deck: InsertDeckWithCommander, archetypeNames: string[] } {
  const commanderPrintUri = getCommanderPrintUri(d, d.commander.id)
  const partnerPrintUri = d.partnerCommander ? getCommanderPrintUri(d, d.partnerCommander.id) : undefined

  const backgroundPrintUri = d.background
    ? d.backgroundPrints?.find(p => p.backgroundId === d.background!.id)?.backgroundPrintUri
    : undefined

  return {
    deck: {
      commanderName: d.commander.name,
      imageUrl: commanderPrintUri ?? d.commander.imageUrl ?? '',
      commanderDefaultImageUrl: commanderPrintUri ? (d.commander.imageUrl ?? undefined) : undefined,
      colors: d.commander.colors as ManaColor[],
      title: d.title,
      bracket: d.bracket.id,
      description: d.description,
      winCondition: d.winCondition,
      coreCards: d.coreCards ?? '',
      deckListUrl: d.deckListUrl ?? '',
      partnerCommanderName: d.partnerCommander?.name,
      partnerImageUrl: partnerPrintUri ?? d.partnerCommander?.imageUrl ?? undefined,
      partnerDefaultImageUrl: partnerPrintUri ? (d.partnerCommander?.imageUrl ?? undefined) : undefined,
      partnerColors: d.partnerCommander?.colors as ManaColor[] | undefined,
      backgroundName: d.background?.name,
      backgroundImageUrl: backgroundPrintUri ?? d.background?.imageUrl ?? undefined,
      backgroundDefaultImageUrl: backgroundPrintUri ? (d.background?.imageUrl ?? undefined) : undefined,
      archetypes: d.archetypes?.map(a => a.archetypeId) ?? []
    },
    archetypeNames: (d.archetypes ?? []).map(a => a.archetype.name)
  }
}
