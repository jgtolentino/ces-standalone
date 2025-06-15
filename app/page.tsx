'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FolderSearch, Lightbulb, TrendingUp, BarChart3, Cloud } from 'lucide-react';

export default function TBWACreativeAnalysisDashboard() {
  const [folderId, setFolderId] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleProcessCampaigns = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/process-campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folderId }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Campaign processing initiated successfully!' });
        setFolderId(''); // Clear input on success
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to process campaign.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `An error occurred: ${error instanceof Error ? error.message : String(error)}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">TBWA Creative Campaign Analysis</h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          AI-powered intelligence to transform raw creative assets into actionable business outcomes.
        </p>
      </div>

      {/* Process Campaigns Section */}
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl space-y-6">
        <h2 className="text-3xl font-bold text-white text-center flex items-center justify-center space-x-3">
          <FolderSearch className="w-8 h-8 text-blue-400" />
          <span>Process New Creative Campaigns</span>
        </h2>
        <p className="text-gray-400 text-center max-w-2xl mx-auto">
          Enter a Google Drive folder ID containing your campaign assets (videos, images, presentations, documents).
          Our system will extract, analyze creative features, and predict business outcomes.
        </p>
        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
          <input
            type="text"
            placeholder="Enter Google Drive Folder ID"
            className="w-full md:w-96 p-3 rounded-md bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={folderId}
            onChange={(e) => setFolderId(e.target.value)}
          />
          <button
            onClick={handleProcessCampaigns}
            disabled={loading || !folderId}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Start Analysis'}
          </button>
        </div>
        {message && (
          <div className={`p-3 rounded-md text-center ${message.type === 'success' ? 'bg-green-500 text-white' : message.type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
            {message.text}
          </div>
        )}
        <p className="text-sm text-gray-500 text-center">Make sure the Google Drive folder is shared with your service account email.</p>
      </div>

      {/* Quick Navigation / Key Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div 
          className="feature-card group cursor-pointer hover:scale-105 transition-transform duration-200"
          onClick={() => router.push('/creative-insights')}
        >
          <Lightbulb className="w-12 h-12 text-yellow-400 mb-4 group-hover:animate-pulse" />
          <h3 className="text-xl font-bold text-white mb-2">Creative Insights</h3>
          <p className="text-gray-400">Deep dive into creative feature performance and AI-powered recommendations.</p>
        </div>
        
        <div 
          className="feature-card group cursor-pointer hover:scale-105 transition-transform duration-200"
          onClick={() => router.push('/campaign-analytics')}
        >
          <BarChart3 className="w-12 h-12 text-teal-400 mb-4 group-hover:animate-bounce" />
          <h3 className="text-xl font-bold text-white mb-2">Campaign Analytics</h3>
          <p className="text-gray-400">View aggregated data and trends across all your analyzed campaigns.</p>
        </div>

        <div 
          className="feature-card group cursor-pointer hover:scale-105 transition-transform duration-200"
          onClick={() => router.push('/health')}
        >
          <Cloud className="w-12 h-12 text-purple-400 mb-4 group-hover:animate-wiggle" />
          <h3 className="text-xl font-bold text-white mb-2">System Health</h3>
          <p className="text-gray-400">Monitor the status of your database, AI, and Google Drive integrations.</p>
        </div>
      </div>

      {/* Styling for Feature Cards */}
      <style jsx>{`
        .feature-card {
          background-color: #1f2937; /* gray-800 */
          padding: 2.5rem;
          border-radius: 0.75rem; /* rounded-lg */
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* shadow-xl */
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          transition: all 0.2s ease-in-out;
        }

        .feature-card:hover {
          transform: translateY(-5px);
        }

        /* Define custom keyframes for animations if not already defined by Tailwind */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        .group-hover\:animate-pulse:hover { animation: pulse 1s infinite; }

        @keyframes bounce {
          0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
          50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
        }
        .group-hover\:animate-bounce:hover { animation: bounce 1s infinite; }

        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        .group-hover\:animate-wiggle:hover { animation: wiggle 0.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}