// lib/auth.ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { PublicKey } from '@solana/web3.js'
import nacl from 'tweetnacl'
import bs58 from 'bs58'
import { db } from './db'
import { checkNFTOwnership } from './nft'
import type { TierKey } from './tiers'

const TRIAL_DURATION_MS = 10 * 60 * 1000 // 10 minutes

// Determine effective tier — accounts for trial expiry
export function resolveEffectiveTier(
  nftTier: TierKey,
  trialStartedAt: Date | null
): { tier: TierKey; trialActive: boolean; trialExpiresAt: Date | null } {
  // NFT holder — no trial needed, tier is permanent
  if (nftTier !== 'free') {
    return { tier: nftTier, trialActive: false, trialExpiresAt: null }
  }

  // No NFT — check trial
  if (!trialStartedAt) {
    // First time connecting — trial starts now, grant tier1
    return {
      tier: 'tier1',
      trialActive: true,
      trialExpiresAt: new Date(Date.now() + TRIAL_DURATION_MS),
    }
  }

  const trialExpiresAt = new Date(trialStartedAt.getTime() + TRIAL_DURATION_MS)
  const trialActive = Date.now() < trialExpiresAt.getTime()

  return {
    tier: trialActive ? 'tier1' : 'free',
    trialActive,
    trialExpiresAt,
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Credentials({
      name: 'solana-wallet',
      credentials: {
        wallet: { label: 'Wallet Address', type: 'text' },
        message: { label: 'Message', type: 'text' },
        signature: { label: 'Signature', type: 'text' },
      },
      async authorize(credentials) {
        const { wallet, message, signature } = credentials as {
          wallet: string
          message: string
          signature: string
        }

        if (!wallet || !message || !signature) return null

        // 1. Verify wallet signature
        try {
          const messageBytes = new TextEncoder().encode(message)
          const signatureBytes = bs58.decode(signature)
          const publicKeyBytes = new PublicKey(wallet).toBytes()

          const valid = nacl.sign.detached.verify(
            messageBytes,
            signatureBytes,
            publicKeyBytes
          )
          if (!valid) return null
        } catch {
          return null
        }

        // 2. Reject stale messages (> 5 min old)
        const tsMatch = message.match(/Timestamp: (\d+)/)
        if (tsMatch) {
          const age = Date.now() - parseInt(tsMatch[1])
          if (age > 5 * 60 * 1000) return null
        }

        // 3. Check NFT ownership
        const nftResult = await checkNFTOwnership(wallet)

        // 4. Get or create user, preserving trialStartedAt
        const existing = await db.user.findUnique({ where: { walletAddress: wallet } })

        const trialStartedAt = nftResult.hasNFT
          ? null  // NFT holder — no trial needed
          : existing?.trialStartedAt ?? new Date() // start trial on first visit

        const { tier, trialActive, trialExpiresAt } = resolveEffectiveTier(
          nftResult.tier,
          trialStartedAt
        )

        const user = await db.user.upsert({
          where: { walletAddress: wallet },
          create: {
            walletAddress: wallet,
            tier,
            nftId: nftResult.nftFound?.id || null,
            trialStartedAt: nftResult.hasNFT ? null : new Date(),
          },
          update: {
            tier,
            nftId: nftResult.nftFound?.id || null,
            lastSeen: new Date(),
            // Don't overwrite trialStartedAt once set
            ...(existing?.trialStartedAt ? {} : {
              trialStartedAt: nftResult.hasNFT ? null : new Date(),
            }),
          },
        })

        return {
          id: user.id,
          wallet,
          tier,
          nftId: nftResult.nftFound?.id,
          trialActive,
          trialExpiresAt: trialExpiresAt?.toISOString() ?? null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.wallet = (user as any).wallet
        token.tier = (user as any).tier
        token.nftId = (user as any).nftId
        token.trialActive = (user as any).trialActive
        token.trialExpiresAt = (user as any).trialExpiresAt
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.wallet = token.wallet as string
      session.user.tier = token.tier as TierKey
      session.user.nftId = token.nftId as string | undefined
      session.user.trialActive = token.trialActive as boolean
      session.user.trialExpiresAt = token.trialExpiresAt as string | null
      return session
    },
  },
})

// Extend NextAuth types
declare module 'next-auth' {
  interface User {
    wallet?: string
    tier?: TierKey
    nftId?: string
    trialActive?: boolean
    trialExpiresAt?: string | null
  }
  interface Session {
    user: {
      id: string
      wallet: string
      tier: TierKey
      nftId?: string
      trialActive: boolean
      trialExpiresAt: string | null
    }
  }
}
