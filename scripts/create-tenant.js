#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Available tenant template
const TEMPLATE_DIR = path.join(__dirname, '../tenants/_template');
const TENANTS_DIR = path.join(__dirname, '../tenants');

function createTenant(tenantSlug) {
  // Validate tenant slug
  if (!tenantSlug || !/^[a-z0-9-]+$/.test(tenantSlug)) {
    console.error('❌ Invalid tenant slug. Use lowercase letters, numbers, and hyphens only.');
    process.exit(1);
  }

  const tenantDir = path.join(TENANTS_DIR, tenantSlug);

  // Check if tenant already exists
  if (fs.existsSync(tenantDir)) {
    console.error(`❌ Tenant "${tenantSlug}" already exists.`);
    process.exit(1);
  }

  console.log(`🚀 Creating tenant: ${tenantSlug}`);

  try {
    // Copy template directory
    execSync(`cp -r "${TEMPLATE_DIR}" "${tenantDir}"`);
    
    // Create tenant-specific package.json
    const packageJson = {
      name: `@ai/tenant-${tenantSlug}`,
      version: "0.1.0",
      description: `AI Agency tenant application for ${tenantSlug}`,
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
        lint: "next lint",
        typecheck: "tsc --noEmit"
      },
      dependencies: {
        "next": "catalog:",
        "react": "catalog:",
        "react-dom": "catalog:",
        "@ai/ui": "workspace:*",
        "@ai/db": "workspace:*"
      },
      devDependencies: {
        "typescript": "catalog:",
        "@types/react": "catalog:",
        "@types/react-dom": "catalog:",
        "@types/node": "catalog:",
        "@ai/eslint-config": "workspace:*"
      }
    };

    fs.writeFileSync(
      path.join(tenantDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Create tenant-specific .env.sample
    const envSample = `# Tenant: ${tenantSlug}
BASE_PATH=/${tenantSlug}
TENANT_SLUG=${tenantSlug}
NEXT_PUBLIC_TENANT_NAME="${tenantSlug.charAt(0).toUpperCase() + tenantSlug.slice(1)}"

# Supabase (shared across all tenants)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Pulser API (tenant-scoped)
PULSER_API_KEY=
PULSER_TENANT_ID=${tenantSlug}

# Optional: Tenant-specific overrides
# CUSTOM_DOMAIN=
# TENANT_THEME=
`;

    fs.writeFileSync(
      path.join(tenantDir, '.env.sample'),
      envSample
    );

    // Create basic Next.js app structure
    const appDir = path.join(tenantDir, 'app');
    fs.mkdirSync(appDir, { recursive: true });

    // Layout component
    const layoutContent = `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@ai/ui/styles'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '${tenantSlug.charAt(0).toUpperCase() + tenantSlug.slice(1)} - AI Agency',
  description: 'AI-powered agency platform for ${tenantSlug}',
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
          {children}
        </div>
      </body>
    </html>
  )
}
`;

    fs.writeFileSync(path.join(appDir, 'layout.tsx'), layoutContent);

    // Page component
    const pageContent = `export default function ${tenantSlug.charAt(0).toUpperCase() + tenantSlug.slice(1)}Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">
        Welcome to ${tenantSlug.charAt(0).toUpperCase() + tenantSlug.slice(1)}
      </h1>
      <p className="text-lg text-muted-foreground mb-8">
        Your AI-powered agency platform is ready to go.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor your campaigns and analytics
          </p>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">AI Agents</h2>
          <p className="text-muted-foreground">
            Leverage AI-powered automation
          </p>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Reports</h2>
          <p className="text-muted-foreground">
            Generate insights and reports
          </p>
        </div>
      </div>
    </div>
  )
}
`;

    fs.writeFileSync(path.join(appDir, 'page.tsx'), pageContent);

    // TypeScript config
    const tsConfig = {
      extends: "next/core-web-vitals",
      compilerOptions: {
        baseUrl: ".",
        paths: {
          "@/*": ["./app/*"],
          "@/components/*": ["./components/*"]
        }
      },
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
      exclude: ["node_modules"]
    };

    fs.writeFileSync(
      path.join(tenantDir, 'tsconfig.json'),
      JSON.stringify(tsConfig, null, 2)
    );

    // Next.js config
    const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.BASE_PATH || '',
  env: {
    TENANT_SLUG: process.env.TENANT_SLUG || '${tenantSlug}',
  },
  experimental: {
    serverComponentsExternalPackages: ['@ai/db'],
  },
}

module.exports = nextConfig
`;

    fs.writeFileSync(path.join(tenantDir, 'next.config.js'), nextConfig);

    console.log(`✅ Tenant "${tenantSlug}" created successfully!`);
    console.log(`\n📁 Location: ${tenantDir}`);
    console.log(`\n🚀 Next steps:`);
    console.log(`   1. cd tenants/${tenantSlug}`);
    console.log(`   2. Copy .env.sample to .env.local and configure`);
    console.log(`   3. pnpm install (from repo root)`);
    console.log(`   4. pnpm dev (to start development)`);
    console.log(`\n🌐 Your tenant will be available at: /${tenantSlug}`);

  } catch (error) {
    console.error(`❌ Failed to create tenant: ${error.message}`);
    process.exit(1);
  }
}

// CLI handling
const tenantSlug = process.argv[2];

if (!tenantSlug) {
  console.log('Usage: node scripts/create-tenant.js <tenant-slug>');
  console.log('Example: node scripts/create-tenant.js my-client');
  process.exit(1);
}

createTenant(tenantSlug);