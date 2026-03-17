// lib/nft.ts
import { COLLECTION_ADDRESS, resolveTier, type TierKey } from './tiers'

export interface NFTCheckResult {
  hasNFT: boolean
  tier: TierKey
  nftFound?: {
    id: string
    traits: { trait_type: string; value: string }[]
  }
}

export async function checkNFTOwnership(walletAddress: string): Promise<NFTCheckResult> {
  const heliusKey = process.env.HELIUS_API_KEY
  if (!heliusKey) {
    console.warn('No HELIUS_API_KEY set — defaulting to free tier')
    return { hasNFT: false, tier: 'free' }
  }

  try {
    // Fetch all assets owned by wallet (up to 1000)
    const res = await fetch(
      `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'nft-check',
          method: 'getAssetsByOwner',
          params: {
            ownerAddress: walletAddress,
            page: 1,
            limit: 1000,
            displayOptions: { showCollectionMetadata: false },
          },
        }),
      }
    )

    const data = await res.json()
    const assets = data?.result?.items || []

    // Find ALL assets belonging to our collection
    const collectionNFTs = assets.filter((asset: any) => {
      const groups = asset.grouping || []
      return groups.some(
        (g: any) =>
          g.group_key === 'collection' &&
          g.group_value === COLLECTION_ADDRESS
      )
    })

    if (!collectionNFTs.length) {
      console.log('No Moonster found in wallet')
      return { hasNFT: false, tier: 'free' }
    }

    console.log(`Found ${collectionNFTs.length} Moonster(s):`, collectionNFTs.map((n: any) => n.id).join(', '))

    // Resolve tier for each NFT and pick the best one
    const TIER_RANK: Record<TierKey, number> = { free: 0, tier1: 1, tier2: 2, tier3: 3 }
    let bestTier: TierKey = 'tier1'
    let bestNFT = collectionNFTs[0]
    let bestTraits: { trait_type: string; value: string }[] = []

    for (const nft of collectionNFTs) {
      const rawAttrs = nft.content?.metadata?.attributes
      let traits: { trait_type: string; value: string }[] = []

      if (Array.isArray(rawAttrs)) {
        traits = rawAttrs
      } else if (rawAttrs && typeof rawAttrs === 'object') {
        traits = Object.entries(rawAttrs).map(([trait_type, value]) => ({
          trait_type,
          value: String(value),
        }))
      }

      const traitValues = traits.map((t) => t.value)
      const tier = resolveTier(traitValues)
      console.log(`Moonster ${nft.id} traits: ${traits.map(t => `${t.trait_type}: ${t.value}`).join(', ')} → ${tier}`)

      if (TIER_RANK[tier] > TIER_RANK[bestTier]) {
        bestTier = tier
        bestNFT = nft
        bestTraits = traits
      } else if (TIER_RANK[tier] === TIER_RANK[bestTier] && !bestTraits.length) {
        bestTraits = traits
      }
    }

    console.log('Best tier across all Moonsters:', bestTier)

    return {
      hasNFT: true,
      tier: bestTier,
      nftFound: { id: bestNFT.id, traits: bestTraits },
    }
  } catch (err) {
    console.error('NFT check error:', err)
    return { hasNFT: false, tier: 'free' }
  }
}
