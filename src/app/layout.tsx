import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers/session-provider'

export const metadata: Metadata = {
  title: 'CleanPro CRM - Home Cleaning Business Management',
  description: 'Complete CRM solution for home cleaning businesses',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
