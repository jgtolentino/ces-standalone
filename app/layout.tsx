import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Scout Analytics - Retail Intelligence Platform',
  description: 'AI-powered retail analytics platform for real-time business intelligence and performance insights.',
  keywords: 'retail analytics, business intelligence, AI insights, Scout Analytics, performance tracking',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-900 text-white min-h-screen`}>
        <div className="flex flex-col min-h-screen">
          <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">TBWA</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">Scout Analytics</h1>
                    <p className="text-sm text-gray-400">Retail Intelligence Platform</p>
                  </div>
                </div>
                <nav className="hidden md:flex items-center space-x-6">
                  <a href="/scout" className="text-gray-300 hover:text-white transition-colors">Dashboard</a>
                  <a href="/scout/trends" className="text-gray-300 hover:text-white transition-colors">Trends</a>
                  <a href="/scout/products" className="text-gray-300 hover:text-white transition-colors">Product Mix</a>
                  <a href="/scout/consumers" className="text-gray-300 hover:text-white transition-colors">Consumers</a>
                  <a href="/scout/retailbot" className="text-gray-300 hover:text-white transition-colors">RetailBot</a>
                </nav>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">Scout Analytics</div>
                    <div className="text-xs text-gray-400">v3.1.0</div>
                  </div>
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium">TA</span>
                  </div>
                </div>
              </div>
            </div>
          </header>
          
          <main className="flex-1">
            {children}
          </main>
          
          <footer className="border-t border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div>
                  © 2025 Scout Analytics. Retail Intelligence Platform powered by AI.
                </div>
                <div className="flex items-center space-x-4">
                  <span>v3.1.0</span>
                  <span>•</span>
                  <span>Status: Operational</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}