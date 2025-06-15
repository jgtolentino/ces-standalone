import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TBWA Creative Campaign Analysis System',
  description: 'AI-powered platform for analyzing creative campaign features and predicting business outcomes.',
  keywords: 'creative analysis, campaign effectiveness, AI insights, TBWA, marketing intelligence',
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
                    <h1 className="text-xl font-bold">Creative Campaign Analysis</h1>
                    <p className="text-sm text-gray-400">AI-Powered Creative Intelligence</p>
                  </div>
                </div>
                <nav className="hidden md:flex items-center space-x-6">
                  <a href="/" className="text-gray-300 hover:text-white transition-colors">Dashboard</a>
                  <a href="/process-campaigns" className="text-gray-300 hover:text-white transition-colors">Process Campaigns</a>
                  <a href="/creative-insights" className="text-gray-300 hover:text-white transition-colors">Creative Insights</a>
                  <a href="/campaign-analytics" className="text-gray-300 hover:text-white transition-colors">Campaign Analytics</a>
                  <a href="/health" className="text-gray-300 hover:text-white transition-colors">System Health</a>
                </nav>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">TBWA Analytics</div>
                    <div className="text-xs text-gray-400">system: standalone</div>
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
                  © 2025 TBWA. Creative Campaign Analysis System powered by AI.
                </div>
                <div className="flex items-center space-x-4">
                  <span>v1.0.0</span>
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