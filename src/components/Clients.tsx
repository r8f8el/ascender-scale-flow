
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Logos de clientes fictícios
const clientLogos = [
  { id: 1, name: "TechSolutions", color: "#0048ff" },
  { id: 2, name: "Global Finance", color: "#11008f" },
  { id: 3, name: "InnovateX", color: "#000000" },
  { id: 4, name: "Strategic Partners", color: "#0048ff" },
  { id: 5, name: "Growth Capital", color: "#11008f" },
  { id: 6, name: "Future Ventures", color: "#000000" },
];

const testimonials = [
  {
    id: 1,
    quote: "A Ascalate transformou completamente nossa visão financeira, proporcionando insights valiosos que impulsionaram nosso crescimento em mais de 40% no último ano.",
    author: "Ricardo Mendes",
    position: "CEO, TechSolutions"
  },
  {
    id: 2,
    quote: "O comprometimento e a excelência da equipe Ascalate foram fundamentais para superarmos desafios complexos e atingirmos resultados expressivos em tempo recorde.",
    author: "Luiza Campos",
    position: "CFO, Global Finance"
  },
  {
    id: 3,
    quote: "Recomendo fortemente os serviços da Ascalate para empresas que buscam parceiros estratégicos com visão inovadora e execução impecável de projetos complexos.",
    author: "Felipe Torres",
    position: "Diretor, InnovateX"
  },
];

const Clients = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };
  
  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };
  
  return (
    <section id="clients" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-ascalate-black mb-4">Nossos Clientes</h2>
          <div className="w-24 h-1 bg-ascalate-blue mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
            Empresas de diversos segmentos que confiam em nossa experiência e metodologia para impulsionar seus resultados.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-10 mb-20">
          {clientLogos.map((logo) => (
            <div 
              key={logo.id} 
              className="flex items-center justify-center w-40 h-24 bg-white shadow-md rounded-md p-4 hover:shadow-lg transition-shadow duration-300 animate-bounce-slow"
              style={{ animationDelay: `${logo.id * 0.2}s` }}
            >
              <div 
                className="w-full h-full flex items-center justify-center font-bold text-lg"
                style={{ color: logo.color }}
              >
                {logo.name}
              </div>
            </div>
          ))}
        </div>
        
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-10">O que dizem sobre nós</h3>
          
          <div className="relative bg-white rounded-xl shadow-lg p-8 md:p-12 overflow-hidden">
            <svg className="absolute top-0 right-0 w-24 h-24 text-ascalate-blue opacity-10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={testimonials[currentTestimonial].id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <p className="text-xl md:text-2xl italic text-gray-700 mb-8">
                    "{testimonials[currentTestimonial].quote}"
                  </p>
                  
                  <div>
                    <p className="text-lg font-semibold text-ascalate-darkblue">
                      {testimonials[currentTestimonial].author}
                    </p>
                    <p className="text-gray-500">
                      {testimonials[currentTestimonial].position}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            
            <div className="flex justify-center gap-4 mt-10">
              <button 
                onClick={prevTestimonial}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-ascalate-blue hover:text-white transition-colors duration-300"
                aria-label="Depoimento anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button 
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full ${currentTestimonial === index ? 'bg-ascalate-blue' : 'bg-gray-300'}`}
                    aria-label={`Depoimento ${index + 1}`}
                  />
                ))}
              </div>
              
              <button 
                onClick={nextTestimonial}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-ascalate-blue hover:text-white transition-colors duration-300"
                aria-label="Próximo depoimento"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Clients;
