'use client';

import { useState } from 'react';

interface InsightPanelProps {
  response: string;
  role: string;
  businessScore?: {
    totalScore: number;
    topOutcome: [string, number];
  };
  timestamp: string;
}

export function InsightPanel({ response, role, businessScore, timestamp }: InsightPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getRoleIcon = (role: string) => {
    const icons = {
      exec: '💼',
      strategist: '🎯', 
      creative: '🎨',
      analyst: '📊'
    };
    return icons[role as keyof typeof icons] || '📊';
  };

  const getRoleColor = (role: string) => {
    const colors = {
      exec: 'bg-purple-100 text-purple-800 border-purple-200',
      strategist: 'bg-blue-100 text-blue-800 border-blue-200',
      creative: 'bg-pink-100 text-pink-800 border-pink-200',
      analyst: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[role as keyof typeof colors] || colors.analyst;
  };

  const formatResponse = (text: string) => {
    // Split by numbered points or bullet points
    const lines = text.split('\n').filter(line => line.trim());
    const sections: { title?: string; content: string[] }[] = [];
    let currentSection: { title?: string; content: string[] } = { content: [] };

    lines.forEach(line => {
      const trimmed = line.trim();
      
      // Check if it's a section header (ends with colon or is all caps)
      if (trimmed.endsWith(':') || (trimmed === trimmed.toUpperCase() && trimmed.length > 3)) {
        if (currentSection.content.length > 0) {
          sections.push(currentSection);
        }
        currentSection = { title: trimmed, content: [] };
      } else if (trimmed.match(/^\d+\.|^-|^•/)) {
        // Numbered or bullet point
        currentSection.content.push(trimmed);
      } else if (trimmed.length > 0) {
        currentSection.content.push(trimmed);
      }
    });

    if (currentSection.content.length > 0) {
      sections.push(currentSection);
    }

    return sections;
  };

  const sections = formatResponse(response);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getRoleIcon(role)}</span>
            <div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(role)}`}>
                {role.charAt(0).toUpperCase() + role.slice(1)} View
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {new Date(timestamp).toLocaleTimeString()}
          </div>
        </div>

        {businessScore && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">
                Business Effectiveness Score
              </span>
              <span className="text-lg font-bold text-blue-600">
                {businessScore.totalScore.toFixed(1)}/100
              </span>
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Top Outcome: {businessScore.topOutcome[0]} ({businessScore.topOutcome[1].toFixed(1)})
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        {sections.length > 1 ? (
          <div className="space-y-4">
            {sections.map((section, index) => (
              <div key={index}>
                {section.title && (
                  <h4 className="font-semibold text-gray-800 mb-2">
                    {section.title}
                  </h4>
                )}
                <div className="space-y-2">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex} className="text-gray-700">
                      {item.match(/^\d+\./) ? (
                        <div className="flex items-start space-x-2">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                            {item.match(/^\d+/)?.[0]}
                          </span>
                          <span>{item.replace(/^\d+\.\s*/, '')}</span>
                        </div>
                      ) : item.match(/^[-•]/) ? (
                        <div className="flex items-start space-x-2">
                          <span className="flex-shrink-0 w-2 h-2 bg-gray-400 rounded-full mt-2"></span>
                          <span>{item.replace(/^[-•]\s*/, '')}</span>
                        </div>
                      ) : (
                        <p>{item}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed">{response}</p>
          </div>
        )}

        {response.length > 500 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        )}
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Powered by Ask CES v3.0.0</span>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span>Live Data</span>
          </div>
        </div>
      </div>
    </div>
  );
}