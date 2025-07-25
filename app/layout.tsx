import "./globals.css";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Scout Analytics v3.1.0',
  description: 'AI-powered retail analytics platform for real-time business intelligence and performance insights.',
  metadataBase: new URL('https://ces-standalone-gilt.vercel.app'),
  openGraph: {
    title: 'Scout Analytics v3.1.0',
    description: 'AI-powered retail analytics platform for real-time business intelligence and performance insights.',
    url: 'https://ces-standalone-gilt.vercel.app',
    siteName: 'Scout Analytics',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Scout Analytics - Retail Intelligence Platform',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Scout Analytics v3.1.0',
    description: 'AI-powered retail analytics platform for real-time business intelligence and performance insights.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}