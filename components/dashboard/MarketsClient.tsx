'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Star, TrendingUp, TrendingDown, Search, X, Loader2 } from 'lucide-react'
import { formatCurrency, formatPercent, priceChangeColor } from '@/lib/utils'
import SwapPanel from './SwapPanel'
import type { DAOToken, UserSubscription } from '@/types'

type SortKey = 'market_cap' | 'current_price' | 'price_change_percentage_24h' | 'price_change_percentage_7d_in_currency' | 'total_volume'
type SortDir = 'asc' | 'desc'

interface SearchCoin {
  id: string
  name: string
  symbol: string
  market_cap_rank: number | null
  thumb: string
  large: string
}

interface Props { tokens: DAOToken[]; subscription: UserSubscription }

export default function MarketsClient({ tokens, subscription }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('market_cap')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set())
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [swapToken, setSwapToken] = useState<DAOToken | null>(null)

  // Live search state
  const [searchResults, setSearchResults] = useState<SearchCoin[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/data/watchlist').then(r => r.json()).then(data => {
      if (data.items) setWatchlist(new Set(data.items.map((i: any) => i.coinId)))
    }).catch(() => {})
  }, [])

  // Debounced live search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (search.length < 2) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const res = await fetch(`/api/data/search?q=${encodeURIComponent(search)}`)
        const data = await res.json()
        setSearchResults(data.coins || [])
        setShowDropdown(true)
      } catch {
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search])

  // Close dropdown when clicking outside
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  // Pin MROCKS at #1, sort the rest normally
  const mrockToken = tokens.find(t => t.id === 'mrocks')
  const filtered = [
    ...(mrockToken && (!search || mrockToken.name.toLowerCase().includes(search.toLowerCase()) || mrockToken.symbol.toLowerCase().includes(search.toLowerCase())) ? [mrockToken] : []),
    ...tokens
      .filter(t => t.id !== 'mrocks')
      .filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.symbol.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => { const va = (a[sortKey] as number) || 0; const vb = (b[sortKey] as number) || 0; return sortDir === 'desc' ? vb - va : va - vb }),
  ]

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortKey(key); setSortDir('desc') }
  }

  async function toggleWatchlist(e: React.MouseEvent, token: { id: string; name: string; symbol: string }) {
    e.stopPropagation()
    setLoadingId(token.id)
    try {
      if (watchlist.has(token.id)) {
        await fetch('/api/data/watchlist', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ coinId: token.id }) })
        setWatchlist(prev => { const s = new Set(prev); s.delete(token.id); return s })
      } else {
        const res = await fetch('/api/data/watchlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ coinId: token.id, coinName: token.name, coinSymbol: token.symbol }) })
        if (res.ok) setWatchlist(prev => new Set(prev).add(token.id))
        else { const { error } = await res.json(); alert(error) }
      }
    } finally { setLoadingId(null) }
  }

  const SortHeader = ({ col, label }: { col: SortKey; label: string }) => (
    <th className="text-right px-4 py-2 text-xs font-medium cursor-pointer hover:text-zinc-300 select-none"
      style={{ color: 'rgba(113,113,122,0.7)' }}
      onClick={() => toggleSort(col)}>
      {label} {sortKey === col ? (sortDir === 'desc' ? '↓' : '↑') : ''}
    </th>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <SwapPanel token={swapToken} onClose={() => setSwapToken(null)} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Markets</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(113,113,122,0.7)' }}>
            Search any token · ⭐ to add to watchlist
          </p>
        </div>
      </div>

      {/* Search with live dropdown */}
      <div className="relative mb-4" ref={searchWrapRef}>
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 z-10"
          style={{ color: 'rgba(113,113,122,0.6)' }} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onFocus={() => { if (search.length >= 2 && searchResults.length > 0) setShowDropdown(true) }}
          placeholder="Search any token on CoinGecko…"
          className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl"
          style={{
            background: 'rgba(12,6,28,0.7)',
            border: '1px solid rgba(139,92,246,0.22)',
            color: 'var(--c-text)',
          }}
        />
        {search && (
          <button className="absolute right-3 top-1/2 -translate-y-1/2 z-10"
            style={{ color: 'rgba(113,113,122,0.5)' }}
            onClick={() => { setSearch(''); setShowDropdown(false); setSearchResults([]) }}>
            <X size={14} />
          </button>
        )}
        {search.length >= 2 && !search && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
            <Loader2 size={14} className="animate-spin" style={{ color: 'rgba(139,92,246,0.6)' }} />
          </div>
        )}

        {/* Live search dropdown */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl overflow-hidden shadow-2xl"
            style={{
              background: 'rgba(8,4,20,0.98)',
              border: '1px solid rgba(139,92,246,0.25)',
              backdropFilter: 'blur(20px)',
              maxHeight: '340px',
              overflowY: 'auto',
            }}>

            {searchLoading && (
              <div className="flex items-center gap-2.5 px-4 py-3 text-sm"
                style={{ color: 'rgba(167,139,250,0.7)' }}>
                <Loader2 size={14} className="animate-spin" />
                Searching CoinGecko…
              </div>
            )}

            {!searchLoading && searchResults.length === 0 && (
              <div className="px-4 py-3 text-sm" style={{ color: 'rgba(113,113,122,0.6)' }}>
                No tokens found for "{search}"
              </div>
            )}

            {!searchLoading && searchResults.map((coin, i) => {
              const inWatchlist = watchlist.has(coin.id)
              return (
                <div
                  key={coin.id}
                  className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
                  style={{ borderBottom: i < searchResults.length - 1 ? '1px solid rgba(39,39,42,0.5)' : 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(139,92,246,0.06)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => { router.push(`/dashboard/token/${coin.id}`); setShowDropdown(false) }}
                >
                  {/* Icon */}
                  <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden"
                    style={{ background: 'rgba(39,39,42,0.6)' }}>
                    <img
                      src={coin.large || coin.thumb}
                      alt={coin.name}
                      className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  </div>

                  {/* Name + symbol */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#e4e4e7' }}>{coin.name}</p>
                    <p className="text-xs font-mono" style={{ color: 'rgba(113,113,122,0.7)' }}>
                      {coin.symbol.toUpperCase()}
                      {coin.market_cap_rank ? <span style={{ color: 'rgba(139,92,246,0.6)' }}> · #{coin.market_cap_rank}</span> : null}
                    </p>
                  </div>

                  {/* Watchlist star */}
                  <button
                    onClick={e => toggleWatchlist(e, { id: coin.id, name: coin.name, symbol: coin.symbol })}
                    disabled={loadingId === coin.id}
                    className="p-1.5 rounded-lg transition-colors flex-shrink-0"
                    style={{ color: inWatchlist ? '#fbbf24' : 'rgba(113,113,122,0.5)' }}
                    title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                  >
                    {loadingId === coin.id
                      ? <Loader2 size={14} className="animate-spin" />
                      : <Star size={14} fill={inWatchlist ? 'currentColor' : 'none'} />
                    }
                  </button>
                </div>
              )
            })}

            {/* Hint footer */}
            {!searchLoading && searchResults.length > 0 && (
              <div className="px-4 py-2 text-xs font-mono"
                style={{ color: 'rgba(99,85,140,0.5)', borderTop: '1px solid rgba(39,39,42,0.4)' }}>
                ↵ to open · ⭐ to watch · {searchResults.length} results
              </div>
            )}
          </div>
        )}
      </div>

      {/* DAO tokens table */}
      <div className="card overflow-hidden" style={{ borderColor: 'rgba(139,92,246,0.12)' }}>
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(139,92,246,0.1)' }}>
          <span className="text-xs font-mono" style={{ color: 'rgba(99,85,140,0.7)' }}>
            DAO GOVERNANCE TOKENS
            {search && filtered.length < tokens.length && (
              <span style={{ color: 'rgba(139,92,246,0.7)' }}> · {filtered.length} match</span>
            )}
          </span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(39,39,42,0.6)' }}>
              <th className="text-left px-4 py-2 text-xs font-medium" style={{ color: 'rgba(113,113,122,0.7)' }}>#</th>
              <th className="text-left px-4 py-2 text-xs font-medium" style={{ color: 'rgba(113,113,122,0.7)' }}>Token</th>
              <SortHeader col="current_price" label="Price" />
              <SortHeader col="price_change_percentage_24h" label="24h" />
              <SortHeader col="price_change_percentage_7d_in_currency" label="7d" />
              <SortHeader col="market_cap" label="Mkt Cap" />
              <SortHeader col="total_volume" label="Volume" />
              <th className="px-4 py-2 text-xs font-medium text-center" style={{ color: 'rgba(113,113,122,0.7)' }}>Trade</th>
              <th className="px-4 py-2 text-xs font-medium text-center" style={{ color: 'rgba(113,113,122,0.7)' }}>Watch</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm"
                  style={{ color: 'rgba(113,113,122,0.5)' }}>
                  No DAO tokens match "{search}" — use the search above to find any token
                </td>
              </tr>
            ) : filtered.map((token, i) => {
              const c24 = token.price_change_percentage_24h || 0
              const c7d = token.price_change_percentage_7d_in_currency || 0
              const inWatchlist = watchlist.has(token.id)
              return (
                <tr key={token.id}
                  className="transition-colors cursor-pointer"
                  style={{ borderBottom: '1px solid rgba(39,39,42,0.4)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(139,92,246,0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => router.push(token.id === 'mrocks' ? '/dashboard/mrocks' : `/dashboard/token/${token.id}`)}>
                  <td className="px-4 py-3 text-xs" style={{ color: 'rgba(113,113,122,0.5)' }}>{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <img src={token.image} alt={token.name} className="w-6 h-6 rounded-full flex-shrink-0" />
                      <div>
                        <p className="font-medium text-xs text-white">{token.name}</p>
                        <p className="text-xs font-mono" style={{ color: 'rgba(113,113,122,0.6)' }}>{token.symbol?.toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-medium text-white">{formatCurrency(token.current_price)}</td>
                  <td className={`px-4 py-3 text-right text-xs font-medium ${priceChangeColor(c24)}`}>
                    <span className="flex items-center justify-end gap-0.5">
                      {c24 > 0 ? <TrendingUp size={10}/> : c24 < 0 ? <TrendingDown size={10}/> : null}
                      {formatPercent(c24)}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-right text-xs font-medium ${priceChangeColor(c7d)}`}>{formatPercent(c7d)}</td>
                  <td className="px-4 py-3 text-right text-xs" style={{ color: 'rgba(161,161,170,0.8)' }}>{formatCurrency(token.market_cap)}</td>
                  <td className="px-4 py-3 text-right text-xs" style={{ color: 'rgba(161,161,170,0.8)' }}>{formatCurrency(token.total_volume)}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={e => { e.stopPropagation(); setSwapToken(token) }}
                      className="text-xs px-2 py-1 rounded-lg transition-colors"
                      style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.3)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.15)')}>
                      Swap
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={e => toggleWatchlist(e, token)}
                      disabled={loadingId === token.id}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: inWatchlist ? '#fbbf24' : 'rgba(113,113,122,0.4)' }}
                    >
                      {loadingId === token.id
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Star size={14} fill={inWatchlist ? 'currentColor' : 'none'} />
                      }
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
