
import React from 'react';

const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center bg-gradient-to-b from-white to-gray-100 pt-20">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-ascalate-blue rounded-full blur-3xl opacity-10 animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-ascalate-darkblue rounded-full blur-3xl opacity-20 animate-pulse"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center md:items-start md:text-left md:w-2/3">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-ascalate-black mb-6 animate-fade-in">
            Potencialize seu 
            <span className="text-ascalate-blue"> crescimento</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Consultoria financeira e estratégica para ascender e escalar seu negócio
          </p>
          <div className="flex gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <a 
              href="#services" 
              className="px-8 py-3 bg-ascalate-blue text-white rounded-md font-medium hover:bg-ascalate-darkblue transition-colors duration-300"
            >
              Nossos serviços
            </a>
            <a 
              href="#contact" 
              className="px-8 py-3 border-2 border-ascalate-blue text-ascalate-blue rounded-md font-medium hover:bg-ascalate-blue hover:text-white transition-colors duration-300"
            >
              Contato
            </a>
          </div>
        </div>
      </div>
      
      <div className="hidden lg:block absolute right-0 bottom-0 w-1/3 h-3/4">
        <div className="relative w-full h-full">
          {/* Círculos animados */}
          <div className="absolute top-1/4 right-1/4 w-64 h-64 border-4 border-ascalate-blue rounded-full opacity-20 animate-rotate-slow"></div>
          <div className="absolute bottom-1/3 right-1/3 w-48 h-48 border-4 border-ascalate-darkblue rounded-full opacity-30 animate-rotate-slow" style={{ animationDirection: 'reverse' }}></div>
          <div className="absolute top-1/3 right-1/2 w-32 h-32 bg-ascalate-blue rounded-full opacity-10 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
