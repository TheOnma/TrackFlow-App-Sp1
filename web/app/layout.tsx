import React from 'react'
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TrackFlow - Task Tracker with SP1 Integration',
  description: 'A minimalist task tracker with zero-knowledge proof generation using SP1.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
} 