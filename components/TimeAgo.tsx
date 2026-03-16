'use client'
import { useState, useEffect } from 'react'

function calcTimeAgo(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default function TimeAgo({ dateStr }: { dateStr: string }) {
  const [text, setText] = useState('')
  useEffect(() => {
    setText(calcTimeAgo(dateStr))
    const interval = setInterval(() => setText(calcTimeAgo(dateStr)), 30000)
    return () => clearInterval(interval)
  }, [dateStr])
  return <span suppressHydrationWarning>{text}</span>
}
