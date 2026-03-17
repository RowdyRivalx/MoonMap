'use client'
import { useState, useEffect, useCallback } from 'react'
import { ExternalLink, Star, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { MOONSTER_IMG_JPEG } from '@/lib/moonsters'
import { TIER_TRAITS } from '@/lib/moonsters'

const LIMIT = 20

interface NFT {
  id: string
  number: number
  name: string
  image: string | null
  traits: Record<string, string>
  tier: 'tier1' | 'tier2' | 'tier3'
}

type FilterType = 'all' | 'tier3' | 'tier2' | 'tier1' | 'owned'

interface Props { tier: string; wallet: string }

export default function GalleryClient({ tier, wallet }: Props) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [hovered, setHovered] = useState<string | null>(null)
  const [nfts, setNfts] = useState<NFT[]>([])
  const [ownedNfts, setOwnedNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingOwned, setLoadingOwned] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const totalPages = Math.ceil(total / LIMIT)

  const fetchCollection = useCallback(async (p: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/gallery?page=${p}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setNfts(data.nfts)
      setTotal(data.total)
    } catch (e: any) {
      setError(e.message || 'Failed to load collection')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchOwned = useCallback(async () => {
    if (!wallet) return
    setLoadingOwned(true)
    try {
      const res = await fetch(`/api/gallery?wallet=${wallet}`)
      const data = await res.json()
      if (!data.error) setOwnedNfts(data.nfts)
    } finally {
      setLoadingOwned(false)
    }
  }, [wallet])

  useEffect(() => { fetchCollection(page) }, [fetchCollection, page])

  useEffect(() => {
    if (filter === 'owned' && ownedNfts.length === 0) fetchOwned()
  }, [filter, fetchOwned, ownedNfts.length])

  const ownedIds = new Set(ownedNfts.map(n => n.id))

  const displayed = filter === 'owned'
    ? ownedNfts
    : nfts.filter(m => {
        if (filter === 'tier3') return m.tier === 'tier3'
        if (filter === 'tier2') return m.tier === 'tier2'
        if (filter === 'tier1') return m.tier === 'tier1'
        return true
      })

  const tierColor = (t: string) =>
    t === 'tier3' ? { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' }
    : t === 'tier2' ? { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.3)' }
    : { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' }

  const tierLabel = (t: string) => t === 'tier3' ? 'MOONSTER' : t === 'tier2' ? 'Moon Walker' : 'Astronaut'
  const tierIcon = (t: string) => t === 'tier3' ? '⛓️' : t === 'tier2' ? '☄️' : '🌙'
  const tierShort = (t: string) => t === 'tier3' ? 'T3' : t === 'tier2' ? 'T2' : 'T1'

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl blur-lg" style={{ background: 'rgba(124,58,237,0.4)' }} />
              <img src={MOONSTER_IMG_JPEG} alt="Moonsters" className="relative w-10 h-10 rounded-xl object-cover"
                style={{ border: '1.5px solid rgba(139,92,246,0.4)' }} />
            </div>
            <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Moonsters Gallery</h1>
          </div>
          <p className="text-sm" style={{ color: 'rgba(113,113,122,0.8)' }}>
            10,000 unique Moon-like monsters on Solana
            {total > 0 && <span style={{ color: 'rgba(139,92,246,0.7)', fontFamily: 'Space Mono, monospace' }}> · {total.toLocaleString()} indexed</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <a href="https://www.tensor.trade/trade/moonsters" target="_blank" rel="noopener noreferrer"
            className="btn-secondary text-sm flex items-center gap-1.5">
            <Star size={13} /> Get a Moonster
          </a>
          <a href="https://www.tensor.trade/trade/moonsters" target="_blank" rel="noopener noreferrer"
            className="btn-secondary text-sm flex items-center gap-1.5">
            <ExternalLink size={13} /> Collection
          </a>
        </div>
      </div>

      {/* Tier legend */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {(['tier3', 'tier2', 'tier1'] as const).map(t => {
          const c = tierColor(t)
          const info = TIER_TRAITS[t]
          return (
            <div key={t} className="stat-card p-4 transition-all duration-200 hover:-translate-y-0.5"
              style={{ borderColor: c.border, background: c.bg }}>
              {/* Accent top bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-[14px]"
                style={{ background: `linear-gradient(90deg, transparent, ${c.color}88, transparent)` }} />
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-lg">{tierIcon(t)}</span>
                <span className="font-black text-sm" style={{ color: c.color, fontFamily: 'Syne, sans-serif' }}>{tierLabel(t)}</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(161,161,170,0.7)' }}>{info.description}</p>
              <div className="mt-2.5 flex flex-wrap gap-1">
                {info.traits.slice(0, 2).map(trait => (
                  <span key={trait} className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: `${c.color}14`, border: `1px solid ${c.border}`, color: c.color, fontFamily: 'Space Mono, monospace', fontSize: '9px' }}>
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter size={14} style={{ color: 'rgba(113,113,122,0.6)' }} />
        {[
          { key: 'all', label: 'All' },
          { key: 'owned', label: '⭐ My Moonsters' },
          { key: 'tier3', label: '⛓️ MOONSTER' },
          { key: 'tier2', label: '☄️ Moon Walker' },
          { key: 'tier1', label: '🌙 Astronaut' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key as FilterType)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{
              background: filter === key ? 'rgba(124,58,237,0.25)' : 'rgba(139,92,246,0.06)',
              border: `1px solid ${filter === key ? 'rgba(139,92,246,0.4)' : 'rgba(139,92,246,0.12)'}`,
              color: filter === key ? '#a78bfa' : 'rgba(113,113,122,0.8)',
              fontFamily: 'Space Mono, monospace',
            }}>
            {label}
          </button>
        ))}
        <span className="ml-auto text-xs" style={{ color: 'rgba(113,113,122,0.5)', fontFamily: 'Space Mono, monospace' }}>
          {filter === 'owned' ? `${ownedNfts.length} owned` : `${displayed.length} shown`}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="card p-6 text-center mb-6" style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}>
          <p className="text-sm" style={{ color: '#f87171' }}>{error}</p>
          <button onClick={() => fetchCollection(page)} className="btn-secondary text-xs mt-3">Retry</button>
        </div>
      )}

      {/* Loading skeletons */}
      {(loading || (filter === 'owned' && loadingOwned)) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {Array.from({ length: LIMIT }).map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="aspect-square shimmer" />
              <div className="p-2 space-y-1.5">
                <div className="h-3 rounded shimmer" style={{ width: '60%' }} />
                <div className="h-2 rounded shimmer" style={{ width: '80%' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty owned state */}
      {!loading && !loadingOwned && filter === 'owned' && ownedNfts.length === 0 && (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">🌙</p>
          <p className="font-black text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>No Moonsters found</p>
          <p className="text-sm mb-4" style={{ color: 'rgba(113,113,122,0.7)' }}>This wallet doesn't hold any Moonsters yet.</p>
          <a href="https://www.tensor.trade/trade/moonsters" target="_blank" rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2 text-sm px-4 py-2">
            Get a Moonster <ExternalLink size={13} />
          </a>
        </div>
      )}

      {/* NFT Grid */}
      {!loading && !(filter === 'owned' && loadingOwned) && displayed.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {displayed.map((m) => {
            const c = tierColor(m.tier)
            const isHov = hovered === m.id
            const isOwned = ownedIds.has(m.id)
            const traitEntries = Object.entries(m.traits)
            return (
              <div key={m.id}
                className="card relative overflow-hidden cursor-pointer transition-all duration-200"
                style={{
                  borderColor: isHov ? c.border : 'rgba(139,92,246,0.08)',
                  transform: isHov ? 'translateY(-4px)' : 'none',
                  boxShadow: isHov ? `0 12px 40px ${c.bg}` : 'none',
                }}
                onMouseEnter={() => setHovered(m.id)}
                onMouseLeave={() => setHovered(null)}>

                {/* Image */}
                <div className="relative aspect-square overflow-hidden" style={{ background: 'rgba(7,3,18,0.8)' }}>
                  {m.image ? (
                    <img
                      src={m.image}
                      alt={m.name || `Moonster #${m.number}`}
                      className="w-full h-full object-cover transition-transform duration-300"
                      style={{ transform: isHov ? 'scale(1.05)' : 'scale(1)' }}
                      onError={e => { (e.target as HTMLImageElement).src = MOONSTER_IMG_JPEG }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 size={20} className="animate-spin" style={{ color: 'rgba(139,92,246,0.4)' }} />
                    </div>
                  )}
                  {/* Tier badge */}
                  <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color, backdropFilter: 'blur(8px)', fontFamily: 'Space Mono, monospace', fontSize: '9px' }}>
                    {tierIcon(m.tier)} {tierShort(m.tier)}
                  </div>
                  {isOwned && (
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: 'rgba(245,158,11,0.9)', color: '#000', fontFamily: 'Syne, sans-serif', fontSize: '9px' }}>
                      YOURS
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-2">
                  <p className="font-black text-xs text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                    {m.number ? `#${m.number}` : m.name || m.id.slice(0, 6)}
                  </p>
                  <p className="text-xs truncate" style={{ color: c.color, fontFamily: 'Space Mono, monospace', fontSize: '9px' }}>
                    {m.traits['Accessory'] && m.traits['Accessory'] !== 'None'
                      ? m.traits['Accessory']
                      : m.traits['Base'] || tierLabel(m.tier)}
                  </p>
                </div>

                {/* Hover overlay */}
                {isHov && (
                  <div className="absolute inset-0 flex flex-col justify-end p-2"
                    style={{ background: 'linear-gradient(to top, rgba(7,3,18,0.95) 0%, transparent 55%)' }}>
                    <div className="space-y-0.5 mb-2">
                      {traitEntries.slice(0, 3).map(([k, v]) => (
                        <div key={k} className="flex justify-between text-xs">
                          <span style={{ color: 'rgba(113,113,122,0.7)', fontSize: '9px' }}>{k}</span>
                          <span className="font-medium" style={{ color: '#e4e4e7', fontSize: '9px', fontFamily: 'Space Mono, monospace' }}>{v}</span>
                        </div>
                      ))}
                    </div>
                    <a href={`https://www.tensor.trade/item/${m.id}`} target="_blank" rel="noopener noreferrer"
                      className="block text-center py-1 rounded-lg text-xs font-bold"
                      style={{ background: 'rgba(124,58,237,0.7)', color: 'white', fontFamily: 'Syne, sans-serif' }}
                      onClick={e => e.stopPropagation()}>
                      {isOwned ? 'View on Tensor' : 'Buy on Tensor'}
                    </a>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && filter !== 'owned' && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl transition-all disabled:opacity-30"
            style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
            <ChevronLeft size={16} style={{ color: '#a78bfa' }} />
          </button>
          <span className="text-sm" style={{ color: 'rgba(161,161,170,0.7)', fontFamily: 'Space Mono, monospace' }}>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-xl transition-all disabled:opacity-30"
            style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
            <ChevronRight size={16} style={{ color: '#a78bfa' }} />
          </button>
        </div>
      )}

      <div className="mt-8 text-center">
        <a href="https://www.tensor.trade/trade/moonsters" target="_blank" rel="noopener noreferrer"
          className="btn-primary inline-flex items-center gap-2 px-6 py-3">
          Browse full collection on Tensor <ExternalLink size={14} />
        </a>
      </div>
    </div>
  )
}
