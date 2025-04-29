
import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "h-16 w-auto" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex">
        <div className="h-full aspect-square rounded-full bg-ascalate-blue opacity-90 animate-circle-float-1"></div>
        <div className="-ml-4 h-full aspect-square rounded-full bg-blue-700 opacity-90 animate-circle-float-2"></div>
        <div className="-ml-4 h-full aspect-square rounded-full bg-ascalate-darkblue opacity-90 animate-circle-float-3"></div>
      </div>
      <span className="ml-3 text-2xl font-bold text-ascalate-black">Ascalate</span>
      <span className="ml-2 text-xs font-medium text-gray-500 flex flex-col items-start">
        <span>BUSINESS</span>
        <span>CONSULTING</span>
      </span>
    </div>
  );
};
