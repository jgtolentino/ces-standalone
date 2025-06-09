import React from 'react';
import { Campaign } from '../types';

interface CampaignCardProps {
  campaign: Campaign;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-semibold mb-2">{campaign.name}</h2>
      <div className="text-sm text-gray-600 mb-4">
        Status: <span className="font-medium">{campaign.status}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-sm text-gray-600">Impressions</p>
          <p className="font-medium">{campaign.metrics.impressions.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Clicks</p>
          <p className="font-medium">{campaign.metrics.clicks.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}; 