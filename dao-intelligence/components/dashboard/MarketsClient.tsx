// components/dashboard/MarketsClient.tsx
'use client'
import { useState, useCallback } from 'react'
import { Star, TrendingUp, TrendingDown, Search, Crown } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatPercent, priceChangeColor } from '@/lib/utils'
import type { DAOToken, UserSubscription } from '@/types'

type SortKey = 'market_cap' | 'current_price' | 'price_change_percentage_24h' | 'price_change_percentage_7d_in_currency' | 'total_volume'
type SortDir = 'asc' | 'desc'

interface Props {
  tokens: DAOToken[]
  subscription: UserSubscription
}

export default function MarketsClient({ tokens, subscription }: Props) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('market_cap')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set())
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const isPro = subscription.tier === 'pro'

  const filtered = tokens
    .filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.symbol.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const va = (a[sortKey] as number) || 0
      const vb = (b[sortKey] as number) || 0
      return sortDir === 'desc' ? vb - va : va - vb
    })

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortKey(key); setSortDir('desc') }
  }

  async function toggleWatchlist(token: DAOToken) {
    setLoadingId(token.id)
    try {
      const inList = watchlist.has(token.id)
      if (inList) {
        await fetch('/api/data/watchlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coinId: token.id }),
        })
        setWatchlist(prev => { const s = new Set(prev); s.delete(token.id); return s })
      } else {
        const res = await fetch('/api/data/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coinId: token.id, coinName: token.name, coinSymbol: token.symbol }),
        })
        if (res.ok) {
          setWatchlist(prev => new Set(prev).add(token.id))
        } else {
          const { error } = await res.json()
          alert(error)
        }
      }
    } finally {
      setLoadingId(null)
    }
  }

  const SortHeader = ({ col, label }: { col: SortKey; label: string }) => (
    <th
      className="text-right px-4 py-2 text-xs text-zinc-500 font-medium cursor-pointer hover:text-zinc-300 select-none"
      onClick={() => toggleSort(col)}
    >
      {label} {sortKey === col ? (sortDir === 'desc' ? '↓' : '↑') : ''}
    </th>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">DAO Markets</h1>
          <p className="text-sm text-zinc-400 mt-0.5">Live prices for all tracked governance tokens</p>
        </div>
        {!isPro && (
          <Link href="/pricing" className="flex items-center gap-1.5 text-xs font-medium bg-violet-600/20 border border-violet-600/30 text-violet-400 px-3 py-1.5 rounded-lg hover:bg-violet-600/30 transition-colors">
            <Crown size={12} /> Unlock all 50 tokens
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or symbol…"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-8 pr-4 py-2 text-sm focus:outline-none focus:border-violet-500 transition-colors"
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-2 text-xs text-zinc-500 font-medium w-8">#</th>
                <th className="text-left px-4 py-2 text-xs text-zinc-500 font-medium">Token</th>
                <SortHeader col="current_price" label="Price" />
                <SortHeader col="price_change_percentage_24h" label="24h" />
                <SortHeader col="price_change_percentage_7d_in_currency" label="7d" />
                <SortHeader col="market_cap" label="Mkt Cap" />
                <SortHeader col="total_volume" label="Volume" />
                <th className="px-4 py-2 text-xs text-zinc-500 font-medium text-center">Watch</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((token, i) => {
                const change24 = token.price_change_percentage_24h || 0
                const change7d = token.price_change_percentage_7d_in_currency || 0
                const inList = watchlist.has(token.id)
                return (
                  <tr key={token.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 text-xs text-zinc-500">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img src={token.image} alt={token.name} className="w-6 h-6 rounded-full flex-shrink-0" />
                        <div>
                          <p className="font-medium text-xs">{token.name}</p>
                          <p className="text-xs text-zinc-500">{token.symbol?.toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-xs font-medium">
                      {formatCurrency(token.current_price)}
                    </td>
                    <td className={`px-4 py-3 text-right text-xs font-medium ${priceChangeColor(change24)}`}>
                      <span className="flex items-center justify-end gap-0.5">
                        {change24 > 0 ? <TrendingUp size={10} /> : change24 < 0 ? <TrendingDown size={10} /> : null}
                        {formatPercent(change24)}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right text-xs font-medium ${priceChangeColor(change7d)}`}>
                      {formatPercent(change7d)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-zinc-400">
                      {formatCurrency(token.market_cap)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-zinc-400">
                      {formatCurrency(token.total_volume)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleWatchlist(token)}
                        disabled={loadingId === token.id}
                        className={`p-1 rounded transition-colors ${inList ? 'text-amber-400 hover:text-amber-300' : 'text-zinc-600 hover:text-zinc-400'}`}
                      >
                        <Star size={14} fill={inList ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
