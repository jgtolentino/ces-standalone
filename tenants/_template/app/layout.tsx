import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@ai/ui/styles'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Agency - Template',
  description: 'AI-powered agency platform template',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <header className="border-b">
            <div className="container mx-auto px-4 py-4">
              <h1 className="text-2xl font-bold">AI Agency</h1>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="border-t mt-auto">
            <div className="container mx-auto px-4 py-4 text-center text-muted-foreground">
              <p>&copy; 2024 AI Agency. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}