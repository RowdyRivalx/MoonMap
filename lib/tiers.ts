// lib/tiers.ts
// ─────────────────────────────────────────────────────────────────────────────
// TIER CONFIGURATION — edit this file to change trait → feature mappings
// ─────────────────────────────────────────────────────────────────────────────

export const COLLECTION_ADDRESS = '9Z7JFLZikV7PYS4kffDZgUqyLZNoQNxBmyF98vx1j51L'

// Trait values that unlock each tier (case-insensitive match)
export const TIER_TRAITS = {
  tier2: [
    'Coin Gecko Comet',
    'Dark Orc Red Beard',
    'Green Tri Eyes Bulging',
    'Blue Bug Tri Eyes',
  ],
  tier3: ['Blue Chain'],
} as const

// What each tier can access
export const TIER_FEATURES = {
  // No NFT
  free: {
    watchlistLimit: 5,
    newsLimit: 5,
    newsFilters: false,
    sentimentFull: false,
    governanceAlerts: false,
    treasuryAnalytics: false,
    developerMetrics: false,
    label: 'Free',
    description: 'No NFT connected',
  },
  // Any NFT from collection
  tier1: {
    watchlistLimit: 10,
    newsLimit: 20,
    newsFilters: false,
    sentimentFull: false,
    governanceAlerts: false,
    treasuryAnalytics: false,
    developerMetrics: false,
    label: 'Holder',
    description: 'Base collection NFT',
  },
  // NFT with Space Debris trait
  tier2: {
    watchlistLimit: 50,
    newsLimit: 100,
    newsFilters: true,
    sentimentFull: true,
    governanceAlerts: false,
    treasuryAnalytics: false,
    developerMetrics: false,
    label: 'Coin Gecko Comet',
    description: 'Space Debris trait',
  },
  // NFT with Coin Gecko Comet trait
  tier3: {
    watchlistLimit: 50,
    newsLimit: 999,
    newsFilters: true,
    sentimentFull: true,
    governanceAlerts: true,
    treasuryAnalytics: true,
    developerMetrics: true,
    label: 'Comet',
    description: 'Coin Gecko Comet trait',
  },
} as const

export type TierKey = keyof typeof TIER_FEATURES
export type TierFeatures = typeof TIER_FEATURES[TierKey]

// Given a list of trait values from the user's NFT, return their tier
export function resolveTier(traitValues: string[]): TierKey {
  const normalized = traitValues.map(v => v.toLowerCase().trim())

  const hasTier3 = TIER_TRAITS.tier3.some(t =>
    normalized.includes(t.toLowerCase().trim())
  )
  if (hasTier3) return 'tier3'

  const hasTier2 = TIER_TRAITS.tier2.some(t =>
    normalized.includes(t.toLowerCase().trim())
  )
  if (hasTier2) return 'tier2'

  return 'tier1' // holds an NFT but no special trait
}

export function getTierFeatures(tier: TierKey): TierFeatures {
  return TIER_FEATURES[tier]
}
