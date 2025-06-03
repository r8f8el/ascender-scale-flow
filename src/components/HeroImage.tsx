
import React from 'react';

const HeroImage = () => {
  return (
    <div className="w-full h-64 sm:h-80 md:h-screen relative overflow-hidden">
      <img 
        src="/lovable-uploads/60fea758-69b9-417c-9f0c-9d3acd779d10.png" 
        alt="Ascalate Hero Background" 
        className="w-full h-full object-cover"
        loading="eager"
        fetchPriority="high"
        data-clonable="true"
      />
    </div>
  );
};

export default HeroImage;
