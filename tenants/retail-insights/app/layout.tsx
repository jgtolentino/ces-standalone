import '@ai/ui/styles/globals.css';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Philippines Retail Insights Dashboard',
  description: 'Comprehensive retail analytics and IoT device management platform for the Philippines market',
  keywords: ['retail', 'analytics', 'Philippines', 'IoT', 'dashboard', 'insights'],
  authors: [{ name: 'AI Agency' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-background font-sans antialiased`}>
        <main className="h-full">
          {children}
        </main>
      </body>
    </html>
  );
}