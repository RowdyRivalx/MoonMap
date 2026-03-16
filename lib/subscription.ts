import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { getTierFeatures, type TierKey } from './tiers'

export interface UserSubscription {
  tier: TierKey
  status: string
}

export async function getUserSubscription(userId: string): Promise<UserSubscription> {
  // First try to get tier from JWT session (works without DB)
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.tier) {
      return { tier: session.user.tier as TierKey, status: 'active' }
    }
  } catch {}

  // Fallback: try DB
  try {
    const { db } = await import('./db')
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { tier: true },
    })
    return { tier: (user?.tier as TierKey) || 'free', status: 'active' }
  } catch {
    // DB unavailable — default to free
    return { tier: 'free', status: 'active' }
  }
}

export async function getUserTierFeatures(userId: string) {
  const sub = await getUserSubscription(userId)
  return { subscription: sub, features: getTierFeatures(sub.tier) }
}
