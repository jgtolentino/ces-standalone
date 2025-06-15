'use client';

import { useState } from 'react';

interface FeedbackBarProps {
  onFeedback: (rating: number, feedback?: string) => void;
}

export function FeedbackBar({ onFeedback }: FeedbackBarProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleRating = (newRating: number) => {
    setRating(newRating);
    if (newRating <= 3) {
      setShowFeedback(true);
    } else {
      handleSubmit(newRating, '');
    }
  };

  const handleSubmit = (finalRating: number, finalFeedback: string) => {
    onFeedback(finalRating, finalFeedback);
    setSubmitted(true);
    setTimeout(() => {
      setRating(null);
      setFeedback('');
      setShowFeedback(false);
      setSubmitted(false);
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-green-800 font-medium">Thank you for your feedback!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          How helpful was this response?
        </span>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRating(star)}
              className={`w-6 h-6 transition-colors ${
                rating && star <= rating
                  ? 'text-yellow-400 hover:text-yellow-500'
                  : 'text-gray-300 hover:text-yellow-400'
              }`}
            >
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {showFeedback && (
        <div className="mt-4 space-y-3">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="What could be improved? (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            rows={3}
          />
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleSubmit(rating!, feedback)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              Submit Feedback
            </button>
            <button
              onClick={() => {
                setShowFeedback(false);
                setRating(null);
                setFeedback('');
              }}
              className="px-4 py-2 text-gray-600 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500">
        Your feedback helps improve Ask CES responses through our ADR learning system.
      </div>
    </div>
  );
}