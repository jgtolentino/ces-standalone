import "./globals.css";
import Link from "next/link";
import LearnBot from "../components/LearnBot";
import InsightMemoryPanel from "../components/InsightMemoryPanel";

export const metadata = { title: "Scout Analytics v3.1.0" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <div className="flex h-screen">
          {/* Side Navigation */}
          <nav className="w-64 bg-gray-900 text-white flex flex-col">
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">📊</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold">Scout Analytics</h1>
                  <p className="text-xs text-gray-400">v3.1.0</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 py-4">
              <Link href="/" className="flex items-center px-4 py-3 hover:bg-gray-800 transition-colors">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5v4M16 5v4" />
                </svg>
                <span className="text-sm font-medium">Overview</span>
              </Link>
              <Link href="/scout" className="flex items-center px-4 py-3 hover:bg-gray-800 transition-colors">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Scout Dashboard</span>
              </Link>
              <Link href="/trends" className="flex items-center px-4 py-3 hover:bg-gray-800 transition-colors">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="text-sm font-medium">Trends</span>
              </Link>
              <Link href="/products" className="flex items-center px-4 py-3 hover:bg-gray-800 transition-colors">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="text-sm font-medium">Product Mix</span>
              </Link>
              <Link href="/consumers" className="flex items-center px-4 py-3 hover:bg-gray-800 transition-colors">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm font-medium">Consumers</span>
              </Link>
              <Link href="/forecast" className="flex items-center px-4 py-3 hover:bg-gray-800 transition-colors">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-sm font-medium">Forecast</span>
              </Link>
              <Link href="/creative-analyzer" className="flex items-center px-4 py-3 hover:bg-gray-800 transition-colors">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="text-sm font-medium">Creative Analyzer</span>
              </Link>
              <Link href="/real-campaigns" className="flex items-center px-4 py-3 hover:bg-gray-800 transition-colors">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm font-medium">Real Campaigns</span>
              </Link>
              <Link href="/tutorial" className="flex items-center px-4 py-3 hover:bg-gray-800 transition-colors">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-sm font-medium">Tutorial</span>
              </Link>
              <Link href="/retailbot" className="flex items-center px-4 py-3 hover:bg-gray-800 transition-colors">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">RetailBot</span>
              </Link>
            </div>
            
            <div className="p-4 border-t border-gray-800">
              <div className="text-xs text-gray-400 space-y-2">
                <p>© 2025 Scout Analytics</p>
                <p>Powered by AI</p>
                <div className="flex items-center space-x-2 pt-2">
                  <div className="flex items-center space-x-1 px-2 py-1 bg-blue-900 bg-opacity-30 rounded border border-blue-700">
                    <span className="text-blue-300 text-xs">🛡️</span>
                    <span className="text-blue-300 text-xs font-medium">Azure WAF</span>
                  </div>
                  <div className="flex items-center space-x-1 px-2 py-1 bg-green-900 bg-opacity-30 rounded border border-green-700">
                    <span className="text-green-300 text-xs">🧭</span>
                    <span className="text-green-300 text-xs font-medium">Responsible AI</span>
                  </div>
                </div>
              </div>
            </div>
          </nav>
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
        
        {/* LearnBot Tutorial Assistant */}
        <LearnBot />
        
        {/* GenieBot Insight Memory Assistant */}
        <InsightMemoryPanel />
      </body>
    </html>
  );
}
