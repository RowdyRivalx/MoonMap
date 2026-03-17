import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import GalleryClient from '@/components/dashboard/GalleryClient'

export default async function GalleryPage() {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.id) redirect('/login')
  return <GalleryClient tier={(session.user as any).tier || 'free'} wallet={(session.user as any).wallet || ''} />
}
