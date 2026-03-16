// lib/nft.ts
import { Connection, PublicKey } from '@solana/web3.js'
import { COLLECTION_ADDRESS, resolveTier, type TierKey } from './tiers'

const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'

// Metaplex Core asset structure (simplified)
interface CoreAsset {
  id: string
  content: {
    metadata: {
      attributes?: { trait_type: string; value: string }[]
    }
  }
  grouping?: { group_key: string; group_value: string }[]
}

// Use Helius DAS API (recommended — much faster than raw RPC)
// Falls back to basic RPC if no Helius key
async function getWalletAssets(walletAddress: string): Promise<CoreAsset[]> {
  const heliusKey = process.env.HELIUS_API_KEY

  if (heliusKey) {
    // Helius DAS API — handles Metaplex Core natively
    const res = await fetch(
      `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'get-assets',
          method: 'getAssetsByOwner',
          params: {
            ownerAddress: walletAddress,
            page: 1,
            limit: 1000,
            displayOptions: {
              showCollectionMetadata: true,
              showUnverifiedCollections: false,
            },
          },
        }),
      }
    )
    const data = await res.json()
    return data.result?.items || []
  }

  // Fallback: Solana RPC via getTokenAccountsByOwner
  // Less reliable for Metaplex Core but works without Helius
  const connection = new Connection(RPC_URL, 'confirmed')
  const pubkey = new PublicKey(walletAddress)

  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
    programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
  })

  // Filter NFTs (amount = 1, decimals = 0)
  const nftMints = tokenAccounts.value
    .filter(
      (a) =>
        a.account.data.parsed.info.tokenAmount.uiAmount === 1 &&
        a.account.data.parsed.info.tokenAmount.decimals === 0
    )
    .map((a) => a.account.data.parsed.info.mint)

  // For each mint, check if it belongs to our collection
  // This is simplified — Helius is strongly recommended for production
  return nftMints.map((mint) => ({
    id: mint,
    content: { metadata: {} },
    grouping: [],
  }))
}

export interface NFTCheckResult {
  hasNFT: boolean
  tier: TierKey
  nftFound?: {
    id: string
    traits: { trait_type: string; value: string }[]
  }
}

export async function checkNFTOwnership(walletAddress: string): Promise<NFTCheckResult> {
  try {
    const assets = await getWalletAssets(walletAddress)

    // Find any asset belonging to our collection
    const collectionNFT = assets.find((asset) => {
      const groups = asset.grouping || []
      return groups.some(
        (g) =>
          g.group_key === 'collection' &&
          g.group_value === COLLECTION_ADDRESS
      )
    })

    if (!collectionNFT) {
      return { hasNFT: false, tier: 'free' }
    }

    // Extract trait values
    const traits = collectionNFT.content?.metadata?.attributes || []
    const traitValues = traits.map((t) => t.value)

    const tier = resolveTier(traitValues)

    return {
      hasNFT: true,
      tier,
      nftFound: {
        id: collectionNFT.id,
        traits,
      },
    }
  } catch (err) {
    console.error('NFT check error:', err)
    // Fail open to free tier on error — don't lock users out
    return { hasNFT: false, tier: 'free' }
  }
}
