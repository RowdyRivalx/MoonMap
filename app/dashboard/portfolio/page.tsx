import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getDAOTokens, getWalletTokensFull, getWalletNFTs, getMoonstersFloorPrice } from '@/lib/api'
import { MINT_TO_COIN } from '@/lib/tokens'
import { DAO_COINS } from '@/types'
import PortfolioClient from '@/components/dashboard/PortfolioClient'

export const revalidate = 0

export default async function PortfolioPage() {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.id) redirect('/login')

  const wallet = (session.user as any).wallet || ''

  let watchlist: any[] = []
  try {
    const { db } = await import('@/lib/db')
    watchlist = await db.watchlistItem.findMany({ where: { userId: (session.user as any).id }, orderBy: { addedAt: 'desc' } })
  } catch {}

  const coinIds = ['solana', ...DAO_COINS]
  const [tokens, walletTokensFull, nfts, nftFloorPrice] = await Promise.all([
    getDAOTokens(coinIds).catch(() => []),
    getWalletTokensFull(wallet),
    getWalletNFTs(wallet),
    getMoonstersFloorPrice(),
  ])

  // Derive walletBalances for DAO token pre-filling (mint → coinId)
  const walletBalances: Record<string, number> = {}
  for (const t of walletTokensFull) {
    const coinId = t.mint === 'So11111111111111111111111111111111111111112'
      ? 'solana'
      : MINT_TO_COIN[t.mint]
    if (coinId) walletBalances[coinId] = t.balance
  }

  return (
    <PortfolioClient
      tokens={tokens}
      watchlistItems={watchlist.map((w: any) => ({ ...w, addedAt: w.addedAt?.toISOString?.() || new Date().toISOString() }))}
      wallet={wallet}
      tier={(session.user as any).tier || 'free'}
      walletBalances={walletBalances}
      walletTokensFull={walletTokensFull}
      nfts={nfts}
      nftFloorPrice={nftFloorPrice}
    />
  )
}
