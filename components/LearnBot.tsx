'use client';

import { useState, useEffect } from 'react';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  steps: TutorialStep[];
  pageUrl: string;
}

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target?: string;
  action?: 'highlight' | 'click' | 'scroll';
}

const TUTORIALS: Tutorial[] = [
  {
    id: 'overview-basics',
    title: 'Overview Dashboard Basics',
    description: 'Learn how to navigate the main KPI cards and revenue trends',
    pageUrl: '/',
    steps: [
      {
        id: 'kpi-cards',
        title: 'KPI Cards Overview',
        content: 'These cards show your key metrics: Total Revenue, Transactions, Average Order Value, and ROI. They update in real-time with your campaign data.',
        target: '.kpi-grid'
      },
      {
        id: 'revenue-chart',
        title: 'Revenue Trends Chart',
        content: 'This line chart shows your revenue performance over the last 90 days. Hover over data points to see detailed values.',
        target: '.revenue-chart'
      }
    ]
  },
  {
    id: 'trends-advanced',
    title: 'Trends Analysis',
    description: 'Master the trends dashboard with interactive charts',
    pageUrl: '/trends',
    steps: [
      {
        id: 'line-chart',
        title: 'Performance Line Chart',
        content: 'Track multiple metrics over time. Use the legend to show/hide specific data series.',
        target: '.line-chart-container'
      },
      {
        id: 'date-filters',
        title: 'Date Range Filters',
        content: 'Adjust the time period to focus on specific campaigns or seasons.',
        target: '.date-filters'
      }
    ]
  },
  {
    id: 'product-mix',
    title: 'Product Performance',
    description: 'Analyze your product portfolio with stacked bar charts',
    pageUrl: '/products',
    steps: [
      {
        id: 'stacked-bars',
        title: 'Product Mix Visualization',
        content: 'Each bar represents a product category. Stack heights show relative performance across different metrics.',
        target: '.stacked-bar-chart'
      }
    ]
  },
  {
    id: 'consumers-insights',
    title: 'Consumer Analytics',
    description: 'Understand your audience with demographic heatmaps',
    pageUrl: '/consumers',
    steps: [
      {
        id: 'demographic-heatmap',
        title: 'Demographic Heatmap',
        content: 'Color intensity represents engagement levels across age groups and regions. Darker colors indicate higher performance.',
        target: '.heatmap-container'
      }
    ]
  },
  {
    id: 'ces-chat',
    title: 'CES AI Assistant',
    description: 'Get AI-powered insights and recommendations',
    pageUrl: '/ces',
    steps: [
      {
        id: 'role-selector',
        title: 'Role Selection',
        content: 'Choose your role (Brand Manager, Data Analyst, etc.) to get tailored insights and recommendations.',
        target: '.role-selector'
      },
      {
        id: 'query-input',
        title: 'Ask Questions',
        content: 'Type natural language questions about your campaigns. CES will analyze your data and provide actionable insights.',
        target: '.query-input'
      }
    ]
  },
  {
    id: 'responsible-ai-overview',
    title: 'Why This AI is Safe',
    description: 'Learn about our responsible AI practices and safety measures',
    pageUrl: '/',
    steps: [
      {
        id: 'responsible-ai-intro',
        title: 'Built with Responsible AI',
        content: 'This dashboard follows comprehensive Responsible AI principles including fairness, transparency, privacy protection, and regular ethical audits to ensure safe and trustworthy insights.'
      },
      {
        id: 'azure-waf-compliance',
        title: 'Enterprise Security Standards',
        content: 'We comply with Azure Well-Architected Framework (WAF) standards for AI security, including encrypted data, audit trails, and role-based access controls.'
      },
      {
        id: 'bias-prevention',
        title: 'Fairness & Bias Prevention',
        content: 'The AI uses well-balanced datasets and is tested across diverse use cases to avoid unfair outcomes. All responses include confidence scores so you know how reliable each insight is.'
      },
      {
        id: 'data-protection',
        title: 'Your Data is Protected',
        content: 'Your data is encrypted and never used to train models without permission. We follow strict privacy protocols and you have full control over your information.'
      },
      {
        id: 'human-oversight',
        title: 'Human Oversight & Safety',
        content: 'All AI responses are regularly audited and inappropriate content is automatically filtered. If something seems wrong, there\'s always a clear path for human review.'
      }
    ]
  }
];

export default function LearnBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTutorial, setCurrentTutorial] = useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);

  useEffect(() => {
    // Check if user has seen the intro
    const seen = localStorage.getItem('learnbot-intro-seen');
    if (!seen) {
      setIsOpen(true);
    } else {
      setHasSeenIntro(true);
    }
  }, []);

  const startTutorial = (tutorial: Tutorial) => {
    setCurrentTutorial(tutorial);
    setCurrentStep(0);
    // Navigate to tutorial page if needed
    if (window.location.pathname !== tutorial.pageUrl) {
      window.location.href = tutorial.pageUrl;
    }
  };

  const nextStep = () => {
    if (currentTutorial && currentStep < currentTutorial.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finishTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const finishTutorial = () => {
    setCurrentTutorial(null);
    setCurrentStep(0);
  };

  const markIntroSeen = () => {
    localStorage.setItem('learnbot-intro-seen', 'true');
    setHasSeenIntro(true);
    setIsOpen(false);
  };

  const getCurrentPageTutorials = () => {
    const currentPath = window.location.pathname;
    return TUTORIALS.filter(tutorial => tutorial.pageUrl === currentPath);
  };

  if (!isOpen && !currentTutorial) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50 hover:scale-105"
        title="Open LearnBot Tutorial Assistant"
      >
        <span className="text-2xl">🎓</span>
      </button>
    );
  }

  return (
    <>
      {/* Tutorial Panel */}
      <div className={`fixed right-6 bottom-20 w-80 bg-white rounded-lg shadow-xl border z-50 transition-all duration-300 ${isOpen ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4 pointer-events-none'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🎓</span>
            <span className="font-semibold">LearnBot</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {!hasSeenIntro ? (
            // Welcome Screen
            <div className="text-center">
              <div className="text-4xl mb-3">👋</div>
              <h3 className="text-lg font-semibold mb-2">Welcome to Scout Analytics!</h3>
              <p className="text-sm text-gray-600 mb-4">
                I'm LearnBot, your AI tutorial assistant. I'll help you master the dashboard features and get the most insights from your data.
              </p>
              <button
                onClick={markIntroSeen}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
              >
                Get Started
              </button>
            </div>
          ) : currentTutorial ? (
            // Active Tutorial
            <div>
              <div className="mb-3">
                <h3 className="font-semibold text-gray-900">{currentTutorial.title}</h3>
                <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                  <span>Step {currentStep + 1} of {currentTutorial.steps.length}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${((currentStep + 1) / currentTutorial.steps.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">
                  {currentTutorial.steps[currentStep].title}
                </h4>
                <p className="text-sm text-gray-600">
                  {currentTutorial.steps[currentStep].content}
                </p>
              </div>

              <div className="flex space-x-2">
                {currentStep > 0 && (
                  <button
                    onClick={prevStep}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                )}
                <button
                  onClick={nextStep}
                  className="flex-1 bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  {currentStep === currentTutorial.steps.length - 1 ? 'Finish' : 'Next'}
                </button>
              </div>

              <button
                onClick={finishTutorial}
                className="w-full text-xs text-gray-500 hover:text-gray-700 mt-2 transition-colors"
              >
                Skip Tutorial
              </button>
            </div>
          ) : (
            // Tutorial Selection
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Available Tutorials</h3>
              
              {/* Current Page Tutorials */}
              {getCurrentPageTutorials().length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-blue-600 mb-2">For This Page:</h4>
                  <div className="space-y-2">
                    {getCurrentPageTutorials().map(tutorial => (
                      <button
                        key={tutorial.id}
                        onClick={() => startTutorial(tutorial)}
                        className="w-full text-left p-2 border border-blue-200 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                      >
                        <div className="font-medium text-sm text-blue-800">{tutorial.title}</div>
                        <div className="text-xs text-blue-600">{tutorial.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* All Tutorials */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">All Tutorials:</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {TUTORIALS.map(tutorial => (
                    <button
                      key={tutorial.id}
                      onClick={() => startTutorial(tutorial)}
                      className="w-full text-left p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-sm text-gray-800">{tutorial.title}</div>
                      <div className="text-xs text-gray-600">{tutorial.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tutorial Highlight Overlay */}
      {currentTutorial && currentTutorial.steps[currentStep].target && (
        <div className="fixed inset-0 bg-black bg-opacity-20 z-40 pointer-events-none">
          <style jsx>{`
            .tutorial-highlight {
              box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.2);
              border-radius: 4px;
            }
          `}</style>
        </div>
      )}
    </>
  );
}