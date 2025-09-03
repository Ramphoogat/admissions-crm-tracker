import React from 'react';

interface StageBadgeProps {
  stage: 'new' | 'contacted' | 'scheduled' | 'admitted' | 'lost';
}

const StageBadge: React.FC<StageBadgeProps> = ({ stage }) => {
  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'new':
        return 'bg-gray-100 text-gray-800';
      case 'contacted':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'admitted':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'new':
        return 'New';
      case 'contacted':
        return 'Contacted';
      case 'scheduled':
        return 'Scheduled';
      case 'admitted':
        return 'Admitted';
      case 'lost':
        return 'Lost';
      default:
        return stage;
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(stage)}`}>
      {getStageLabel(stage)}
    </span>
  );
};

export default StageBadge;
