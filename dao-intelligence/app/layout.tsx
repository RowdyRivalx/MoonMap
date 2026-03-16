// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DAOScope — DAO Intelligence Platform',
  description:
    'Real-time crypto DAO analytics: live prices, governance tracking, sentiment analysis, and treasury insights for serious DeFi participants.',
  keywords: ['DAO', 'DeFi', 'governance', 'crypto analytics', 'uniswap', 'aave', 'maker'],
  openGraph: {
    title: 'DAOScope — DAO Intelligence Platform',
    description: 'Real-time crypto DAO analytics for serious DeFi participants.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-zinc-100 antialiased`}>
        {children}
      </body>
    </html>
  )
}
