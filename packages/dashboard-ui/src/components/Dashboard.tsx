import React from 'react';
import { Campaign } from '../types';

export const Dashboard: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Campaign Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Campaign cards will be rendered here */}
      </div>
    </div>
  );
}; 