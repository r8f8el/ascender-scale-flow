
import React from 'react';

export const Logo: React.FC<{className?: string}> = ({ className = "" }) => {
  return (
    <img 
      src="/lovable-uploads/bc6b28d9-fb80-4371-8558-5236efa8bfcd.png" 
      alt="Ascalate Logo" 
      className={className}
    />
  );
};
