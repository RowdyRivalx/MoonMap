// components/dashboard/SettingsClient.tsx
'use client'
import { useState } from 'react'
import { Crown, CreditCard, User, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import type { UserSubscription } from '@/types'

interface Props {
  user: { name?: string | null; email?: string | null }
  subscription: UserSubscription
}

export default function SettingsClient({ user, subscription }: Props) {
  const [loadingPortal, setLoadingPortal] = useState(false)
  const isPro = subscription.tier === 'pro'

  async function openBillingPortal() {
    setLoadingPortal(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const { url } = await res.json()
      window.location.href = url
    } finally {
      setLoadingPortal(false)
    }
  }

  const periodEnd = subscription.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
      })
    : null

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-6">Settings</h1>

      {/* Account */}
      <section className="card p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <User size={15} className="text-zinc-400" />
          <h2 className="text-sm font-medium">Account</h2>
        </div>
        <div className="space-y-3">
          <Row label="Name" value={user.name || '—'} />
          <Row label="Email" value={user.email || '—'} />
        </div>
      </section>

      {/* Subscription */}
      <section className="card p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Crown size={15} className="text-zinc-400" />
          <h2 className="text-sm font-medium">Subscription</h2>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium">
              {isPro ? 'Pro Plan' : 'Free Plan'}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isPro ? '$15 / month' : 'Limited features'}
            </p>
          </div>
          <div>
            {isPro ? (
              <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">
                <CheckCircle2 size={11} /> Active
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded-full">
                Free
              </span>
            )}
          </div>
        </div>

        {isPro && periodEnd && (
          <div className="mt-2 pt-3 border-t border-zinc-800">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Calendar size={12} />
              {subscription.cancelAtPeriodEnd
                ? `Cancels on ${periodEnd}`
                : `Renews on ${periodEnd}`}
            </div>
            {subscription.cancelAtPeriodEnd && (
              <div className="mt-2 flex items-start gap-2 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-2 rounded-lg">
                <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                Your subscription is set to cancel. Reactivate to keep Pro access.
              </div>
            )}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-zinc-800 flex gap-3">
          {isPro ? (
            <button
              onClick={openBillingPortal}
              disabled={loadingPortal}
              className="flex items-center gap-2 btn-secondary text-sm disabled:opacity-50"
            >
              <CreditCard size={14} />
              {loadingPortal ? 'Loading…' : 'Manage billing'}
            </button>
          ) : (
            <Link href="/pricing" className="btn-primary text-sm flex items-center gap-2">
              <Crown size={14} /> Upgrade to Pro
            </Link>
          )}
        </div>
      </section>

      {/* Pro features */}
      {!isPro && (
        <section className="card p-5 border-violet-600/30 bg-violet-600/5">
          <h2 className="text-sm font-medium text-violet-300 mb-3">What you unlock with Pro</h2>
          <ul className="space-y-2">
            {[
              '50 DAO tokens (vs 5 free)',
              'Sentiment analysis & filtered news feeds',
              'Governance proposal alerts',
              'Treasury flow analytics',
              'Developer activity metrics',
              'CSV/JSON data export',
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="text-violet-400 text-xs">✓</span> {f}
              </li>
            ))}
          </ul>
          <Link href="/pricing" className="btn-primary text-sm mt-4 inline-flex items-center gap-2">
            <Crown size={14} /> Start 7-day free trial
          </Link>
        </section>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/50 last:border-0">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  )
}
