// app/login/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { BarChart3, Wallet, Loader2, AlertCircle } from 'lucide-react'
import bs58 from 'bs58'

function buildLoginMessage(wallet: string): string {
  return [
    'DAOScope wants you to sign in with your Solana wallet.',
    '',
    `Wallet: ${wallet}`,
    `Timestamp: ${Date.now()}`,
    '',
    'This request will not trigger any blockchain transaction or cost any fees.',
  ].join('\n')
}

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [walletAvailable, setWalletAvailable] = useState(false)

  useEffect(() => {
    const checkWallet = () => {
      const hasPhantom = !!(window as any).solana?.isPhantom
      const hasSolflare = !!(window as any).solflare?.isSolflare
      const hasBackpack = !!(window as any).backpack
      setWalletAvailable(hasPhantom || hasSolflare || hasBackpack)
    }
    setTimeout(checkWallet, 100)
  }, [])

  async function connectAndSign() {
    setLoading(true)
    setError('')
    try {
      const solana = (window as any).solana ||
                     (window as any).solflare ||
                     (window as any).backpack
      if (!solana) {
        setError('No Solana wallet found. Please install Phantom or Backpack.')
        return
      }
      const connectResult = await solana.connect()
      const walletAddress = connectResult.publicKey.toString()
      const message = buildLoginMessage(walletAddress)
      const messageBytes = new TextEncoder().encode(message)
      const signResult = await solana.signMessage(messageBytes, 'utf8')
      const signature = bs58.encode(signResult.signature)
      const result = await signIn('solana-wallet', {
        wallet: walletAddress,
        message,
        signature,
        redirect: false,
      })
      if (result?.error) {
        setError('Sign in failed. Please try again.')
        return
      }
      router.push('/dashboard')
    } catch (err: any) {
      if (err.code === 4001) {
        setError('Signature cancelled.')
      } else {
        setError(err.message || 'Something went wrong.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <BarChart3 size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">DAOScope</span>
        </div>

        <div className="card p-6 text-center">
          <div className="w-14 h-14 bg-violet-600/20 border border-violet-600/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wallet size={24} className="text-violet-400" />
          </div>
          <h1 className="text-xl font-semibold mb-2">Connect your wallet</h1>
          <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
            Sign in with your Solana wallet. NFT holders get automatic access — no account needed.
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 py-2 rounded-lg mb-4 flex items-start gap-2">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={connectAndSign}
            disabled={loading}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
          >
            {loading
              ? <><Loader2 size={15} className="animate-spin" /> Connecting…</>
              : <><Wallet size={15} /> Connect Wallet</>
            }
          </button>

          {!walletAvailable && (
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-xs text-amber-400 mb-2">No wallet detected</p>
              <div className="flex gap-2 justify-center">
                <a href="https://phantom.app" target="_blank" rel="noopener noreferrer" className="text-xs text-violet-400 hover:underline">Get Phantom ↗</a>
                <span className="text-zinc-600">·</span>
                <a href="https://backpack.app" target="_blank" rel="noopener noreferrer" className="text-xs text-violet-400 hover:underline">Get Backpack ↗</a>
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-zinc-800">
            <p className="text-xs text-zinc-500 leading-relaxed">
              Signing is free and doesn't send any transaction. Your access level is determined by your NFT holdings.
            </p>
          </div>
        </div>

        <div className="mt-4 card p-4">
          <p className="text-xs font-medium text-zinc-400 mb-3">Access tiers</p>
          <div className="space-y-2.5">
            {[
              { label: 'No NFT', desc: 'Free tier — basic access', color: 'bg-zinc-500' },
              { label: 'Any collection NFT', desc: 'Tier 1 — prices, news, 10 token watchlist', color: 'bg-emerald-500' },
              { label: 'Space Debris trait', desc: 'Tier 2 — full sentiment + news filters + 50 tokens', color: 'bg-violet-500' },
              { label: 'Coin Gecko Comet trait', desc: 'Tier 3 — governance, treasury & dev metrics', color: 'bg-amber-500' },
            ].map(({ label, desc, color }) => (
              <div key={label} className="flex items-start gap-2.5">
                <span className={`w-1.5 h-1.5 rounded-full ${color} flex-shrink-0 mt-1.5`} />
                <div>
                  <p className="text-xs font-medium text-zinc-200">{label}</p>
                  <p className="text-xs text-zinc-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
