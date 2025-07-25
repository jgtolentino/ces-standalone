import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Brain, BarChart3, MessageSquare, Lightbulb, Users } from 'lucide-react'

const navigation = [
  { name: 'Overview', href: '/ces/overview', icon: BarChart3 },
  { name: 'Scorecard', href: '/ces/scorecard', icon: Brain },
  { name: 'Ask CES', href: '/ces/prompts', icon: MessageSquare },
  { name: 'Insights', href: '/ces/insights', icon: Lightbulb },
  { name: 'Segments', href: '/ces/segments', icon: Users },
]

export default function CESLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <nav className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <Brain className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">CES Dashboard</h1>
              <p className="text-xs text-gray-500">v1.3.0</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            )
          })}
        </div>

        <div className="absolute bottom-0 w-64 p-6 bg-blue-50 border-t">
          <div className="text-xs text-blue-700">
            <div className="font-medium">Powered by</div>
            <div>Pulser + Vercel + Supabase</div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}