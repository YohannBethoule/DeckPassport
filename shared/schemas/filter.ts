export const FILTER_MODES = ['including', 'only'] as const
export type FilterMode = typeof FILTER_MODES[number]
