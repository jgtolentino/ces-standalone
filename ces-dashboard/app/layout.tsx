import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CES Dashboard - Creative Effectiveness System',
  description: 'Enterprise-grade AI analytics dashboard for campaign scoring, prompt-based insight generation, and demographic breakdowns.',
  keywords: 'CES, creative effectiveness, AI analytics, campaign analysis, TBWA',
  authors: [{ name: 'InsightPulseAI & TBWA\\SMP' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'noindex, nofollow', // Private dashboard
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <script
            dangerouslySetInnerHTML={{
              __html: `
                console.log("🚀 CES Dashboard v1.3.0 [FastTrack ID: ces-dashboard]");
                console.log("📊 TBWA Creative Intelligence - Campaign Effectiveness System");
                console.log("🔗 Module: CES Dashboard | Version: 1.3.0 | Deployment: Production");
              `,
            }}
          />
          {children}
        </div>
      </body>
    </html>
  )
}