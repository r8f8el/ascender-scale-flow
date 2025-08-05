
import React from 'react';

export const ProjectSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="border rounded-lg p-4 animate-pulse">
          <div className="flex justify-between items-start mb-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gray-300 h-2 rounded-full" style={{width: '45%'}}></div>
          </div>
        </div>
      ))}
    </div>
  );
};
