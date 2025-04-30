
import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "h-16 w-auto" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/lovable-uploads/6085375d-7e2a-4bdb-b082-c9f682b54aa1.png" 
        alt="Ascalate Logo" 
        className="h-full"
      />
      <span className="ml-2 text-xs font-medium text-gray-500 flex flex-col items-start">
        <span>BUSINESS</span>
        <span>CONSULTING</span>
      </span>
    </div>
  );
};
