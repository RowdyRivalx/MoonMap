import { NextAuthOptions, getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PublicKey } from '@solana/web3.js'
import nacl from 'tweetnacl'
import bs58 from 'bs58'
import { checkNFTOwnership } from './nft'
import type { TierKey } from './tiers'

const TRIAL_DURATION_MS = 10 * 60 * 1000

// Try to import db but don't fail if it's unavailable
async function tryUpsertUser(wallet: string, tier: TierKey, nftId: string | null, hasNFT: boolean) {
  try {
    const { db } = await import('./db')
    const existing = await db.user.findUnique({ where: { walletAddress: wallet } })
    const user = await db.user.upsert({
      where: { walletAddress: wallet },
      create: {
        walletAddress: wallet,
        tier,
        nftId,
        trialStartedAt: hasNFT ? null : new Date(),
      },
      update: {
        tier,
        nftId,
        lastSeen: new Date(),
        ...(!existing?.trialStartedAt && !hasNFT ? { trialStartedAt: new Date() } : {}),
      },
    })
    return user.id
  } catch (e) {
    console.warn('DB unavailable, using wallet as ID:', e instanceof Error ? e.message.split('\n')[0] : e)
    // Fall back to wallet address as ID — app still works, just no persistence
    return wallet
  }
}

async function getTrialStart(wallet: string): Promise<Date | null> {
  try {
    const { db } = await import('./db')
    const user = await db.user.findUnique({ where: { walletAddress: wallet } })
    return user?.trialStartedAt ?? null
  } catch {
    return null
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/login', error: '/login' },
  providers: [
    CredentialsProvider({
      name: 'solana-wallet',
      credentials: {
        wallet:    { label: 'Wallet',    type: 'text' },
        message:   { label: 'Message',   type: 'text' },
        signature: { label: 'Signature', type: 'text' },
      },
      async authorize(credentials) {
        console.log('=== AUTHORIZE CALLED ===')
        const { wallet, message, signature } = credentials as {
          wallet: string; message: string; signature: string
        }
        console.log('Wallet:', wallet)
        if (!wallet || !message || !signature) return null

        // 1. Verify signature
        try {
          const msgBytes = new TextEncoder().encode(message)
          const sigBytes = bs58.decode(signature)
          const pubBytes = new PublicKey(wallet).toBytes()
          const valid = nacl.sign.detached.verify(msgBytes, sigBytes, pubBytes)
          console.log('Signature valid:', valid)
          if (!valid) return null
        } catch (e) {
          console.error('Sig error:', e)
          return null
        }

        // 2. Reject stale messages
        const tsMatch = message.match(/Timestamp: (\d+)/)
        if (tsMatch && Date.now() - parseInt(tsMatch[1]) > 300_000) {
          console.log('Message too old')
          return null
        }

        // 3. Check NFT ownership
        console.log('Checking NFT ownership...')
        const nftResult = await checkNFTOwnership(wallet)
        console.log('NFT result:', nftResult.hasNFT, nftResult.tier)

        // 4. Determine tier + trial
        let tier: TierKey = nftResult.tier
        let trialActive = false
        let trialExpiresAt: Date | null = null

        if (!nftResult.hasNFT) {
          const trialStart = (await getTrialStart(wallet)) ?? new Date()
          trialExpiresAt = new Date(trialStart.getTime() + TRIAL_DURATION_MS)
          trialActive = Date.now() < trialExpiresAt.getTime()
          tier = trialActive ? 'tier1' : 'free'
        }

        // 5. Try to persist to DB (non-blocking — works without DB)
        const userId = await tryUpsertUser(
          wallet,
          tier,
          nftResult.nftFound?.id || null,
          nftResult.hasNFT
        )

        console.log('Auth success. ID:', userId, 'Tier:', tier)

        return {
          id: userId,
          wallet,
          tier,
          trialActive,
          trialExpiresAt: trialExpiresAt?.toISOString() ?? null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id             = user.id
        token.wallet         = (user as any).wallet
        token.tier           = (user as any).tier
        token.trialActive    = (user as any).trialActive
        token.trialExpiresAt = (user as any).trialExpiresAt
      }
      return token
    },
    async session({ session, token }) {
      session.user.id            = token.id as string
      session.user.wallet        = token.wallet as string
      session.user.tier          = token.tier as string
      session.user.trialActive   = token.trialActive as boolean
      session.user.trialExpiresAt = token.trialExpiresAt as string
      return session
    },
  },
}

export async function auth() {
  return getServerSession(authOptions)
}
