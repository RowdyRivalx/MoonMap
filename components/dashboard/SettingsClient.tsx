'use client'
import { Crown, User } from 'lucide-react'
import Link from 'next/link'
import type { UserSubscription } from '@/lib/subscription'
import type { TierKey } from '@/lib/tiers'

const TIER_LABELS: Record<TierKey, string> = {
  free: 'Free (Trial)',
  tier1: 'Tier 1 — Holder',
  tier2: 'Tier 2 — Space Debris',
  tier3: 'Tier 3 — Comet',
}

const TIER_DESC: Record<TierKey, string> = {
  free: 'Connect your wallet and get a Moonster NFT for permanent access.',
  tier1: 'You hold a Moonster NFT. Enjoy base access.',
  tier2: 'Your special trait unlocks sentiment analysis and news filters.',
  tier3: 'Your Blue Chain trait unlocks the full dashboard including governance, treasury, and dev metrics.',
}

interface Props {
  user: { wallet?: string }
  subscription: UserSubscription
}

export default function SettingsClient({ user, subscription }: Props) {
  const tier = subscription.tier as TierKey
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-6">Settings</h1>

      <section className="card p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <User size={15} className="text-zinc-400" />
          <h2 className="text-sm font-medium">Wallet</h2>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-xs text-zinc-500">Address</span>
          <span className="text-sm font-mono text-zinc-300">{user.wallet || '—'}</span>
        </div>
      </section>

      <section className="card p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Crown size={15} className="text-zinc-400" />
          <h2 className="text-sm font-medium">Access tier</h2>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-zinc-800 mb-3">
          <span className="text-sm font-medium">{TIER_LABELS[tier]}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            tier === 'tier3' ? 'bg-amber-400/10 text-amber-400' :
            tier === 'tier2' ? 'bg-violet-400/10 text-violet-400' :
            tier === 'tier1' ? 'bg-emerald-400/10 text-emerald-400' :
            'bg-zinc-800 text-zinc-400'
          }`}>
            {tier === 'free' ? 'No NFT' : 'NFT Holder'}
          </span>
        </div>
        <p className="text-sm text-zinc-400">{TIER_DESC[tier]}</p>
        {(tier === 'free' || tier === 'tier1') && (
          <a
            href="https://www.tensor.trade/trade/moonsters"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm mt-4 inline-flex items-center gap-2"
          >
            Get a Moonster on Tensor ↗
          </a>
        )}
      </section>
    </div>
  )
}
