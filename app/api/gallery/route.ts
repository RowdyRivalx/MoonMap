import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { COLLECTION_ADDRESS, resolveTier } from '@/lib/tiers'

export const dynamic = 'force-dynamic'

const LIMIT = 20

// CIPHER: Solana base58 address validation — 32-44 alphanumeric chars, no 0/O/I/l
const SOLANA_ADDRESS_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/

function isValidSolanaAddress(addr: string): boolean {
  return SOLANA_ADDRESS_RE.test(addr)
}

function parseAsset(asset: any) {
  const name: string = asset.content?.metadata?.name || ''
  const number = parseInt(name.replace(/[^0-9]/g, ''), 10) || 0
  const rawAttrs = asset.content?.metadata?.attributes || []
  const traits: { trait_type: string; value: string }[] = Array.isArray(rawAttrs)
    ? rawAttrs
    : Object.entries(rawAttrs).map(([trait_type, value]) => ({ trait_type, value: String(value) }))

  const traitValues = traits.map(t => t.value)
  const tier = resolveTier(traitValues)

  const image =
    asset.content?.links?.image ||
    asset.content?.files?.[0]?.uri ||
    null

  const traitMap: Record<string, string> = {}
  for (const t of traits) traitMap[t.trait_type] = t.value

  return { id: asset.id, number, name, image, traits: traitMap, tier }
}

export async function GET(req: NextRequest) {
  // CIPHER: require authentication
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const pageRaw = parseInt(searchParams.get('page') || '1', 10)
  const page = isNaN(pageRaw) || pageRaw < 1 ? 1 : Math.min(pageRaw, 1000) // CIPHER: clamp page
  const wallet = searchParams.get('wallet') || ''
  const heliusKey = process.env.HELIUS_API_KEY

  if (!heliusKey) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 500 })
  }

  // CIPHER: validate wallet address before forwarding to Helius
  if (wallet && !isValidSolanaAddress(wallet)) {
    return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
  }

  try {
    // If wallet provided, return only that wallet's Moonsters
    if (wallet) {
      const res = await fetch(`https://mainnet.helius-rpc.com/?api-key=${heliusKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'gallery-wallet',
          method: 'getAssetsByOwner',
          params: {
            ownerAddress: wallet,
            page: 1,
            limit: 1000,
            displayOptions: { showCollectionMetadata: false },
          },
        }),
      })
      const data = await res.json()
      const assets: any[] = data?.result?.items || []
      const moonsters = assets.filter((a: any) =>
        (a.grouping || []).some(
          (g: any) => g.group_key === 'collection' && g.group_value === COLLECTION_ADDRESS
        )
      )
      return NextResponse.json({ nfts: moonsters.map(parseAsset), total: moonsters.length, page: 1, limit: moonsters.length })
    }

    // Otherwise return paginated collection
    const res = await fetch(`https://mainnet.helius-rpc.com/?api-key=${heliusKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'gallery-collection',
        method: 'getAssetsByGroup',
        params: {
          groupKey: 'collection',
          groupValue: COLLECTION_ADDRESS,
          page,
          limit: LIMIT,
          displayOptions: { showCollectionMetadata: false },
        },
      }),
      next: { revalidate: 3600 },
    })

    const data = await res.json()
    const items: any[] = data?.result?.items || []
    const total: number = data?.result?.total || 0

    return NextResponse.json({ nfts: items.map(parseAsset), total, page, limit: LIMIT })
  } catch (err) {
    console.error('Gallery fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch collection' }, { status: 500 })
  }
}
