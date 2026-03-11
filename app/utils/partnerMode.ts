export const PARTNER = 'partner' as const
export const BACKGROUND = 'background' as const
export type PartnerMode = false | typeof PARTNER | typeof BACKGROUND
