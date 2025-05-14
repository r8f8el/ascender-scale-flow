
import React from 'react';

export const Logo: React.FC<{className?: string}> = ({ className = "" }) => {
  return (
    <img 
      src="/lovable-uploads/209e69d6-61b3-4dbc-98f9-5a6af51184b9.png" 
      alt="Ascalate Logo" 
      className={className}
      loading="eager"
      fetchPriority="high"
      data-clonable="true"
    />
  );
};
