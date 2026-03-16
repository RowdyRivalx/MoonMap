export const MOONSTER_IMG = 'https://rose-decisive-hornet-818.mypinata.cloud/ipfs/bafybeiaema4ekfkce5aoduq4zgelfkwyoxhosqurfvizk2pxsifdgnit54'
export const MOONSTER_IMG_JPEG = 'https://rose-decisive-hornet-818.mypinata.cloud/ipfs/bafkreiafltcgo34ly6up3b2qymc3wie75dsiorcgkiafrpdvsaygoe2cmy'

export const TIER_TRAITS = {
  tier3: { label: 'Tier 3 — Comet', traits: ['Blue Chain'], color: '#f59e0b', glow: 'rgba(245,158,11,0.4)', description: 'Rarest tier. Full governance, treasury & developer analytics.', icon: '🔵⛓️' },
  tier2: { label: 'Tier 2 — Space Debris', traits: ['Coin Gecko Comet', 'Dark Orc Red Beard', 'Green Tri Eyes Bulging', 'Blue Bug Tri Eyes'], color: '#8b5cf6', glow: 'rgba(139,92,246,0.4)', description: 'Special traits unlock sentiment, news filters & 50-token watchlist.', icon: '☄️' },
  tier1: { label: 'Tier 1 — Holder', traits: ['Any Moonster'], color: '#10b981', glow: 'rgba(16,185,129,0.3)', description: 'Any Moonster NFT grants live prices, news & 10-token watchlist.', icon: '🌙' },
}

export const PRIMARY_MOONSTER = { id: 'F4uY9uYBwqyzDfXE5xgwmk2rGfxhjTra48uXcZXmSgfX', number: 7952, name: 'Moonster #7952', image: MOONSTER_IMG, staticImage: MOONSTER_IMG_JPEG, traits: { Background: 'Green', Base: 'Dark Orc Red Beard', Eyes: 'Green Tri Eyes Bulging', Accessory: 'Blue Chain', 'Space Debris': 'Coin Gecko Comet' }, tier: 3 as const, tierLabel: 'Comet', highlightTrait: 'Blue Chain' }
export const FEATURED_MOONSTERS = [PRIMARY_MOONSTER]
