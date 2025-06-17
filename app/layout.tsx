import "./globals.css";
import Link from "next/link";

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
                <span className="text-lg mr-3">📈</span>
                <span className="text-sm font-medium">Overview</span>
              </Link>
              <Link href="/trends" className="flex items-center px-4 py-3 hover:bg-gray-800 transition-colors">
                <span className="text-lg mr-3">📊</span>
                <span className="text-sm font-medium">Trends</span>
              </Link>
              <Link href="/products" className="flex items-center px-4 py-3 hover:bg-gray-800 transition-colors">
                <span className="text-lg mr-3">🛒</span>
                <span className="text-sm font-medium">Product Mix</span>
              </Link>
              <Link href="/consumers" className="flex items-center px-4 py-3 hover:bg-gray-800 transition-colors">
                <span className="text-lg mr-3">👥</span>
                <span className="text-sm font-medium">Consumers</span>
              </Link>
              <Link href="/ces" className="flex items-center px-4 py-3 hover:bg-gray-800 transition-colors">
                <span className="text-lg mr-3">🤖</span>
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
      </body>
    </html>
  );
}
