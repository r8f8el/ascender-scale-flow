
import React from 'react';

export const Partner: React.FC = () => {
  return (
    <section id="partner" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Nossos Parceiros
        </h2>
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          <div className="w-full md:w-auto flex justify-center">
            <img 
              src="/lovable-uploads/9b9e23bc-f39b-419d-b7e0-dbf05855f76c.png" 
              alt="Parceiro 1" 
              className="h-12 md:h-16 object-contain"
              loading="eager"
              fetchPriority="high"
              data-clonable="true"
            />
          </div>
          
          <div className="w-full md:w-auto flex justify-center">
            <img 
              src="/lovable-uploads/fbaf288f-e6a9-4aeb-a285-0c4673697f1b.png" 
              alt="Parceiro 2" 
              className="h-12 md:h-16 object-contain"
              loading="eager"
              fetchPriority="high"
              data-clonable="true"
            />
          </div>
          
          <div className="w-full md:w-auto flex justify-center">
            <img 
              src="/lovable-uploads/f21c20f5-4dfe-463b-b744-fdc15cd182e8.png" 
              alt="Parceiro 3" 
              className="h-12 md:h-16 object-contain"
              loading="eager"
              fetchPriority="high"
              data-clonable="true"
            />
          </div>
          
          <div className="w-full md:w-auto flex justify-center">
            <img 
              src="/lovable-uploads/eeb91924-4608-4f64-a7b0-1898deababdc.png" 
              alt="Parceiro 4" 
              className="h-12 md:h-16 object-contain"
              loading="eager"
              fetchPriority="high"
              data-clonable="true"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
