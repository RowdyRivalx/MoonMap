'use client'
import { useState } from 'react'
import { ExternalLink, Star, Filter } from 'lucide-react'
import { MOONSTER_IMG, MOONSTER_IMG_JPEG, TIER_TRAITS } from '@/lib/moonsters'

const MROCKS_MINT = 'HQtEXUxNh3Hb3BgQpqW4XCq3fcHr5JYiGABu61Fg82No'

// Curated Moonsters with verified/derived data
// Using your confirmed #7952 as primary, with derived URLs for others
// Image URL pattern from collection metadata
const ARWEAVE_IMG_BASE = 'https://arweave.net/FbRL6CXx-6BCQJ1FDMivNGEJGUGh0nNjK37GdCVb6dA'

const MOONSTERS = [
  {
    number: 7952,
    id: 'F4uY9uYBwqyzDfXE5xgwmk2rGfxhjTra48uXcZXmSgfX',
    image: 'https://rose-decisive-hornet-818.mypinata.cloud/ipfs/bafybeiaema4ekfkce5aoduq4zgelfkwyoxhosqurfvizk2pxsifdgnit54',
    traits: { Background: 'Green', Base: 'Dark Orc Red Beard', Eyes: 'Green Tri Eyes Bulging', Accessory: 'Blue Chain', 'Space Debris': 'Coin Gecko Comet' },
    tier: 3 as const,
    owned: true,
  },
  // Placeholder Moonsters to showcase the UI — will show #7952 image with different numbers
  ...[1, 42, 333, 777, 1024, 2048, 3000, 4200, 5555, 6969, 8888, 9001].map((n, i) => ({
    number: n,
    id: `placeholder-${n}`,
    image: MOONSTER_IMG,
    traits: {
      Background: ['Purple', 'Dark Blue', 'Red', 'Green', 'Orange', 'Pink', 'Teal', 'Yellow', 'Black', 'White', 'Gray', 'Cyan'][i] || 'Purple',
      Base: ['Skull Watchers', 'Dark Orc', 'Rising Rings', 'Day Watcher', 'Rooted Halo', 'Classic', 'Fire', 'Ice', 'Storm', 'Shadow', 'Gold', 'Neon'][i] || 'Classic',
      Accessory: i % 5 === 0 ? 'Blue Chain' : i % 3 === 0 ? 'Gold Chain' : i % 2 === 0 ? 'None' : 'Silver Ring',
      'Space Debris': i % 4 === 0 ? 'Coin Gecko Comet' : i % 3 === 0 ? 'Uni Swap Coins' : 'Stars',
    },
    tier: (i % 5 === 0 ? 3 : i % 3 === 0 ? 2 : 1) as 1 | 2 | 3,
    owned: false,
  })),
]

type FilterType = 'all' | 'tier3' | 'tier2' | 'tier1' | 'owned'

interface Props { tier: string; wallet: string }

export default function GalleryClient({ tier, wallet }: Props) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [hovered, setHovered] = useState<number | null>(null)

  const filtered = MOONSTERS.filter(m => {
    if (filter === 'owned') return m.owned
    if (filter === 'tier3') return m.tier === 3
    if (filter === 'tier2') return m.tier === 2
    if (filter === 'tier1') return m.tier === 1
    return true
  })

  const tierColor = (t: 1 | 2 | 3) =>
    t === 3 ? { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' }
    : t === 2 ? { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.3)' }
    : { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' }

  const tierLabel = (t: 1 | 2 | 3) => t === 3 ? 'Comet' : t === 2 ? 'Space Debris' : 'Holder'
  const tierIcon = (t: 1 | 2 | 3) => t === 3 ? '⛓️' : t === 2 ? '☄️' : '🌙'

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl blur-lg" style={{ background: 'rgba(124,58,237,0.4)' }} />
              <img src={MOONSTER_IMG} alt="Moonsters" className="relative w-10 h-10 rounded-xl object-cover"
                style={{ border: '1.5px solid rgba(139,92,246,0.4)' }} />
            </div>
            <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Moonsters Gallery</h1>
          </div>
          <p className="text-sm" style={{ color: 'rgba(113,113,122,0.8)' }}>
            10,000 unique Moon-like monsters on Solana · Browse by tier trait
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <a href="https://www.tensor.trade/trade/moonsters" target="_blank" rel="noopener noreferrer"
            className="btn-secondary text-sm flex items-center gap-1.5">
            <Star size={13} /> Get a Moonster
          </a>
          <a href={`https://solscan.io/token/${MROCKS_MINT}`} target="_blank" rel="noopener noreferrer"
            className="btn-secondary text-sm flex items-center gap-1.5">
            <ExternalLink size={13} /> Collection
          </a>
        </div>
      </div>

      {/* Tier legend */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {([3, 2, 1] as const).map(t => {
          const c = tierColor(t)
          const info = t === 3 ? TIER_TRAITS.tier3 : t === 2 ? TIER_TRAITS.tier2 : TIER_TRAITS.tier1
          return (
            <div key={t} className="card p-4" style={{ borderColor: c.border, background: c.bg }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{tierIcon(t)}</span>
                <span className="font-black text-sm" style={{ color: c.color, fontFamily: 'Syne, sans-serif' }}>Tier {t} — {tierLabel(t)}</span>
              </div>
              <p className="text-xs" style={{ color: 'rgba(161,161,170,0.7)' }}>{info.description}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {info.traits.slice(0, 2).map(trait => (
                  <span key={trait} className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.3)', color: c.color, fontFamily: 'Space Mono, monospace', fontSize: '9px' }}>
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
          { key: 'tier3', label: '⛓️ Tier 3' },
          { key: 'tier2', label: '☄️ Tier 2' },
          { key: 'tier1', label: '🌙 Tier 1' },
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
          {filtered.length} results
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {filtered.map((m) => {
          const c = tierColor(m.tier)
          const isHov = hovered === m.number
          return (
            <div key={m.number}
              className="card relative overflow-hidden cursor-pointer transition-all duration-200"
              style={{
                borderColor: isHov ? c.border : 'rgba(139,92,246,0.08)',
                transform: isHov ? 'translateY(-4px)' : 'none',
                boxShadow: isHov ? `0 12px 40px ${c.bg}` : 'none',
              }}
              onMouseEnter={() => setHovered(m.number)}
              onMouseLeave={() => setHovered(null)}>

              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                <img src={m.image} alt={`Moonster #${m.number}`}
                  className="w-full h-full object-cover transition-transform duration-300"
                  style={{ transform: isHov ? 'scale(1.05)' : 'scale(1)' }}
                  onError={e => { (e.target as HTMLImageElement).src = MOONSTER_IMG_JPEG }} />
                {/* Tier badge overlay */}
                <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color, backdropFilter: 'blur(8px)', fontFamily: 'Space Mono, monospace', fontSize: '9px' }}>
                  {tierIcon(m.tier)} T{m.tier}
                </div>
                {m.owned && (
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: 'rgba(245,158,11,0.9)', color: '#000', fontFamily: 'Syne, sans-serif', fontSize: '9px' }}>
                    YOURS
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-2">
                <p className="font-black text-xs text-white" style={{ fontFamily: 'Syne, sans-serif' }}>#{m.number}</p>
                <p className="text-xs truncate" style={{ color: c.color, fontFamily: 'Space Mono, monospace', fontSize: '9px' }}>
                  {m.traits.Accessory !== 'None' ? m.traits.Accessory : m.traits.Base}
                </p>
              </div>

              {/* Hover overlay */}
              {isHov && (
                <div className="absolute inset-0 flex flex-col justify-end p-2"
                  style={{ background: 'linear-gradient(to top, rgba(7,3,18,0.95) 0%, transparent 60%)' }}>
                  <div className="space-y-0.5 mb-2">
                    {Object.entries(m.traits).slice(0, 3).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs">
                        <span style={{ color: 'rgba(113,113,122,0.7)', fontSize: '9px' }}>{k}</span>
                        <span className="font-medium" style={{ color: '#e4e4e7', fontSize: '9px', fontFamily: 'Space Mono, monospace' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <a href="https://www.tensor.trade/trade/moonsters" target="_blank" rel="noopener noreferrer"
                    className="block text-center py-1 rounded-lg text-xs font-bold"
                    style={{ background: `rgba(124,58,237,0.7)`, color: 'white', fontFamily: 'Syne, sans-serif' }}
                    onClick={e => e.stopPropagation()}>
                    {m.owned ? 'View on Tensor' : 'Buy on Tensor'}
                  </a>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-8 text-center">
        <a href="https://www.tensor.trade/trade/moonsters" target="_blank" rel="noopener noreferrer"
          className="btn-primary inline-flex items-center gap-2 px-6 py-3">
          Browse full collection on Tensor <ExternalLink size={14} />
        </a>
      </div>
    </div>
  )
}
