import '@/styles/globals.css'

import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: {
    default: 'DriveIA Platform',
    template: '%s | DriveIA Platform',
  },
  description: 'AI operations platform for vehicle dealers and rent car businesses.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--page-bg)] text-[var(--text-strong)] antialiased">
        {children}
      </body>
    </html>
  )
}
