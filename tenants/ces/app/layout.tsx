import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CES - Campaign Effectiveness System',
  description: 'AI-powered campaign performance analytics and optimization platform',
  keywords: 'campaign analytics, marketing effectiveness, AI insights, performance tracking',
  icons: {
    icon: '/favicon.ico',
  },
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
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">CES</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">Campaign Effectiveness System</h1>
                    <p className="text-sm text-gray-400">AI-Powered Marketing Analytics</p>
                  </div>
                </div>
                <nav className="hidden md:flex items-center space-x-6">
                  <a href="/" className="text-gray-300 hover:text-white transition-colors">Dashboard</a>
                  <a href="/creative-analyzer" className="text-gray-300 hover:text-white transition-colors">Business Impact Analyzer</a>
                  <a href="/real-campaigns" className="text-gray-300 hover:text-white transition-colors">Real Campaign Analysis</a>
                </nav>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">TBWA Enterprise</div>
                    <div className="text-xs text-gray-400">tenant: ces</div>
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
                  © 2025 TBWA. Campaign Effectiveness System powered by AI Agency Platform.
                </div>
                <div className="flex items-center space-x-4">
                  <span>v2.4.0</span>
                  <span>•</span>
                  <span>Status: Active</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}