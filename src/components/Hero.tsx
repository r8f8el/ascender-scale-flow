
import React from 'react';

const Hero = () => {
  return (
    <section className="py-16 bg-white relative z-10">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-ascalate-black">
          Ascalate <span className="text-ascalate-blue">Business Consulting</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-10">
          Transformando potencial em resultados através de consultoria estratégica e financeira de excelência
        </p>
        <div className="mt-8">
          <a 
            href="#contact" 
            className="bg-ascalate-blue hover:bg-ascalate-darkblue text-white font-bold py-3 px-8 rounded-full transition-colors duration-300 inline-flex items-center"
          >
            Fale Conosco
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </a>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
};

export default Hero;
