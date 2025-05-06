
import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "h-16 w-auto" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/lovable-uploads/6085375d-7e2a-4bdb-b082-c9f682b54aa1.png" 
        alt="Ascalate Logo" 
        className="h-full"
        loading="eager"
        fetchpriority="high"
        data-clonable="true"
      />
    </div>
  );
};
