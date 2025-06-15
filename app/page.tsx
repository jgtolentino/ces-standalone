'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Ask CES v3.0.0 Landing Page - Redirects to CES MVP
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Ask CES MVP
    router.replace('/ces');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🎯</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Redirecting to Ask CES v3.0.0...
        </h1>
        <p className="text-gray-600">
          Your AI-powered campaign effectiveness assistant
        </p>
        <div className="mt-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    </div>
  );
}