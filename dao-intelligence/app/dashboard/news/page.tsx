// app/dashboard/news/page.tsx
import { auth } from '@/lib/auth'
import { getUserSubscription } from '@/lib/stripe'
import { getDAONews, calculateSentiment } from '@/lib/api'
import NewsClient from '@/components/dashboard/NewsClient'

export const revalidate = 120

export default async function NewsPage() {
  const session = await auth()
  const userId = session!.user!.id!
  const subscription = await getUserSubscription(userId)
  const isPro = subscription.tier === 'pro'

  const [hotNews, risingNews, bullishNews, bearishNews] = await Promise.all([
    getDAONews(undefined, 'hot'),
    isPro ? getDAONews(undefined, 'rising') : Promise.resolve([]),
    isPro ? getDAONews(undefined, 'bullish') : Promise.resolve([]),
    isPro ? getDAONews(undefined, 'bearish') : Promise.resolve([]),
  ])

  const sentiment = calculateSentiment(hotNews)

  return (
    <NewsClient
      hotNews={isPro ? hotNews : hotNews.slice(0, 5)}
      risingNews={risingNews}
      bullishNews={bullishNews}
      bearishNews={bearishNews}
      sentiment={sentiment}
      subscription={subscription}
    />
  )
}
