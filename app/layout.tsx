import "./globals.css";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Scout Analytics v3.1.0',
  description: 'AI-powered retail analytics platform for real-time business intelligence and performance insights.',
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