import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import LeaderboardClient from '@/components/dashboard/LeaderboardClient'

export const revalidate = 300

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  // Fetch all users with their tiers and watchlist counts
  const users = await db.user.findMany({
    select: {
      id: true,
      walletAddress: true,
      tier: true,
      nftId: true,
      lastSeen: true,
      createdAt: true,
      _count: { select: { watchlist: true } },
    },
    orderBy: [
      { tier: 'desc' },
      { createdAt: 'asc' },
    ],
    take: 100,
  })

  const currentUserId = session.user.id

  return (
    <LeaderboardClient
      users={users.map(u => ({
        ...u,
        lastSeen: u.lastSeen?.toISOString() || null,
        createdAt: u.createdAt.toISOString(),
        watchlistCount: u._count.watchlist,
        isCurrentUser: u.id === currentUserId,
      }))}
      currentUserId={currentUserId}
    />
  )
}
