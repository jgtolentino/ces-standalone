import "./globals.css";
import Link from "next/link";
import LearnBot from "../components/LearnBot";

export const metadata = { title: "Scout Analytics 3.3" };

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
                  <p className="text-xs text-gray-400">v3.3</p>
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
              <Link href="/ces" className="flex items-center px-4 py-3 hover:bg-gray-800 transition-colors">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-sm font-medium">CES Chat</span>
              </Link>
            </div>
            
            <div className="p-4 border-t border-gray-800">
              <div className="text-xs text-gray-400">
                <p>© 2025 Scout Analytics</p>
                <p>Powered by AI</p>
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
      </body>
    </html>
  );
}
