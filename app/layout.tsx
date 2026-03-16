import type { Metadata } from 'next'
import './globals.css'
import SessionProvider from '@/components/SessionProvider'
import MoonsterBackground from '@/components/MoonsterBackground'

export const metadata: Metadata = {
  title: 'MoonMap — DAO Intelligence for Moonsters',
  description: 'Real-time crypto DAO analytics built for Moonsters NFT holders.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MoonsterBackground />
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
