import "./globals.css";
import Link from "next/link";

export const metadata = { title: "Scout Analytics 3.3" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <nav className="flex gap-4 p-4 bg-white shadow">
          <Link href="/">Overview</Link>
          <Link href="/trends">Trends</Link>
          <Link href="/products">Product Mix</Link>
          <Link href="/consumers">Consumers</Link>
          <Link href="/ces">CES Chat</Link>
        </nav>
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
