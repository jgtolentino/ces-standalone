import '@ai/ui/styles/globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TBWA AI Assistant',
  description: 'AI-powered campaign development and insights for TBWA',
  keywords: ['TBWA', 'AI', 'campaign', 'creative', 'marketing', 'insights'],
  authors: [{ name: 'TBWA' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#00B5AD', // TBWA turquoise
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full bg-tbwa-neutral font-sans antialiased">
        <main className="h-full">
          {children}
        </main>
      </body>
    </html>
  );
}