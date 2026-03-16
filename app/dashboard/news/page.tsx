import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserSubscription } from '@/lib/subscription'
import { getDAONews, calculateSentiment } from '@/lib/api'
import NewsClient from '@/components/dashboard/NewsClient'

export const revalidate = 120

export default async function NewsPage() {
  const session = await getServerSession(authOptions)
  const userId = session!.user!.id!
  const subscription = await getUserSubscription(userId)
  const features = { newsFilters: subscription.tier === 'tier2' || subscription.tier === 'tier3' }

  const [hotNews, risingNews, bullishNews, bearishNews] = await Promise.all([
    getDAONews(undefined, 'hot'),
    features.newsFilters ? getDAONews(undefined, 'rising') : Promise.resolve([]),
    features.newsFilters ? getDAONews(undefined, 'bullish') : Promise.resolve([]),
    features.newsFilters ? getDAONews(undefined, 'bearish') : Promise.resolve([]),
  ])

  const sentiment = calculateSentiment(hotNews)

  return (
    <NewsClient
      hotNews={features.newsFilters ? hotNews : hotNews.slice(0, 10)}
      risingNews={risingNews}
      bullishNews={bullishNews}
      bearishNews={bearishNews}
      sentiment={sentiment}
      subscription={subscription}
    />
  )
}
