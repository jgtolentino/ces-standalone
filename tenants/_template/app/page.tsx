export default function TemplatePage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to AI Agency
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Your AI-powered agency platform is ready to go.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Dashboard</h2>
          <p className="text-muted-foreground mb-4">
            Monitor your campaigns and analytics in real-time.
          </p>
          <button className="text-primary hover:underline">
            View Dashboard →
          </button>
        </div>
        
        <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-2">AI Agents</h2>
          <p className="text-muted-foreground mb-4">
            Leverage AI-powered automation and insights.
          </p>
          <button className="text-primary hover:underline">
            Manage Agents →
          </button>
        </div>
        
        <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Reports</h2>
          <p className="text-muted-foreground mb-4">
            Generate comprehensive insights and reports.
          </p>
          <button className="text-primary hover:underline">
            View Reports →
          </button>
        </div>
        
        <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Analytics</h2>
          <p className="text-muted-foreground mb-4">
            Deep dive into performance metrics and trends.
          </p>
          <button className="text-primary hover:underline">
            View Analytics →
          </button>
        </div>
        
        <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Automation</h2>
          <p className="text-muted-foreground mb-4">
            Set up automated workflows and processes.
          </p>
          <button className="text-primary hover:underline">
            Setup Automation →
          </button>
        </div>
        
        <div className="p-6 border rounded-lg hover:shadow-md transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Settings</h2>
          <p className="text-muted-foreground mb-4">
            Configure your tenant and team preferences.
          </p>
          <button className="text-primary hover:underline">
            Manage Settings →
          </button>
        </div>
      </div>

      <div className="mt-12 p-6 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
        <p className="text-muted-foreground mb-4">
          This is a template tenant. To customize it for your client:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Copy this template: <code className="bg-background px-2 py-1 rounded">task create:tenant TENANT=client-name</code></li>
          <li>Configure environment variables in <code className="bg-background px-2 py-1 rounded">.env.local</code></li>
          <li>Customize the branding and features</li>
          <li>Deploy to your tenant-specific path</li>
        </ol>
      </div>
    </div>
  )
}