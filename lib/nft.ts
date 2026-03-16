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

    // Find any asset belonging to our collection
    const collectionNFT = assets.find((asset: any) => {
      const groups = asset.grouping || []
      return groups.some(
        (g: any) =>
          g.group_key === 'collection' &&
          g.group_value === COLLECTION_ADDRESS
      )
    })

    if (!collectionNFT) {
      console.log('No Moonster found in wallet')
      return { hasNFT: false, tier: 'free' }
    }

    console.log('Found Moonster:', collectionNFT.id)

    // Extract traits — Metaplex Core uses a flat object, not an array
    const rawAttrs = collectionNFT.content?.metadata?.attributes
    let traits: { trait_type: string; value: string }[] = []

    if (Array.isArray(rawAttrs)) {
      // Standard format: [{trait_type, value}]
      traits = rawAttrs
    } else if (rawAttrs && typeof rawAttrs === 'object') {
      // Metaplex Core format: {"Base": "Dark Orc Red Beard", "Eyes": "..."}
      traits = Object.entries(rawAttrs).map(([trait_type, value]) => ({
        trait_type,
        value: String(value),
      }))
    }

    console.log('Traits:', traits.map(t => `${t.trait_type}: ${t.value}`).join(', '))

    const traitValues = traits.map((t) => t.value)
    const tier = resolveTier(traitValues)

    console.log('Resolved tier:', tier)

    return {
      hasNFT: true,
      tier,
      nftFound: { id: collectionNFT.id, traits },
    }
  } catch (err) {
    console.error('NFT check error:', err)
    return { hasNFT: false, tier: 'free' }
  }
}
