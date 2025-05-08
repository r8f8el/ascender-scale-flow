import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// Client logos with real client images - reordered and removed Creditar
const clientLogos = [
  { id: 1, src: "/lovable-uploads/d443c2ff-7b88-4aeb-87cd-e23579308905.png", alt: "Portobello Grupo" },
  { id: 2, src: "/lovable-uploads/fbaf288f-e6a9-4aeb-a285-0c4673697f1b.png", alt: "J.assy" },
  { id: 3, src: "/lovable-uploads/9b9e23bc-f39b-419d-b7e0-dbf05855f76c.png", alt: "Apex" },
  { id: 4, src: "/lovable-uploads/bc6b28d9-fb80-4371-8558-5236efa8bfcd.png", alt: "Cropland" },
  { id: 5, src: "/lovable-uploads/eeb91924-4608-4f64-a7b0-1898deababdc.png", alt: "Highcrop" },
  { id: 6, src: "/lovable-uploads/f21c20f5-4dfe-463b-b744-fdc15cd182e8.png", alt: "J. Alves" },
];

const testimonials = [
  {
    id: 1,
    quote: "A Ascalate transformou completamente nossa visão financeira, proporcionando insights valiosos que impulsionaram nosso crescimento em mais de 40% no último ano.",
    author: "Ricardo Mendes",
    position: "CEO, Apex"
  },
  {
    id: 2,
    quote: "O comprometimento e a excelência da equipe Ascalate foram fundamentais para superarmos desafios complexos e atingirmos resultados expressivos em tempo recorde.",
    author: "Luiza Campos",
    position: "CFO, Portobello Grupo"
  },
  {
    id: 3,
    quote: "Recomendo fortemente os serviços da Ascalate para empresas que buscam parceiros estratégicos com visão inovadora e execução impecável de projetos complexos.",
    author: "Felipe Torres",
    position: "Diretor, Creditar"
  },
];

const Clients = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    
    const section = document.getElementById('clients');
    if (section) observer.observe(section);
    
    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);
  
  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };
  
  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };
  
  // Auto rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      if (isVisible) {
        nextTestimonial();
      }
    }, 8000);
    
    return () => clearInterval(timer);
  }, [isVisible, currentTestimonial]);
  
  return (
    <section id="clients" className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Nossos Clientes</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
            Empresas de diversos segmentos que confiam em nossa experiência e metodologia para impulsionar seus resultados.
          </p>
        </motion.div>
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 mb-20">
          {clientLogos.map((logo, index) => (
            <motion.div
              key={logo.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="w-32 md:w-40 h-24 flex items-center justify-center"
            >
              <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 h-full w-full flex items-center justify-center p-4">
                <img 
                  src={logo.src} 
                  alt={logo.alt} 
                  className="w-auto h-auto max-h-full max-w-full object-contain"
                  loading="eager"
                  fetchPriority="high"
                  data-clonable="true"
                />
              </Card>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-center mb-10">O que dizem sobre nós</h3>
          
          <Card className="relative shadow-xl border-none overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <svg className="absolute top-0 right-0 w-24 h-24 text-blue-600 opacity-10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              
              <div className="relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={testimonials[currentTestimonial].id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.7 }}
                    className="text-center"
                  >
                    <p className="text-xl md:text-2xl italic text-gray-700 mb-8">
                      "{testimonials[currentTestimonial].quote}"
                    </p>
                    
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <p className="text-lg font-bold text-blue-900">
                        {testimonials[currentTestimonial].author}
                      </p>
                      <p className="text-gray-500">
                        {testimonials[currentTestimonial].position}
                      </p>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>
              
              <div className="flex justify-center gap-4 mt-10">
                <motion.button 
                  onClick={prevTestimonial}
                  whileHover={{ scale: 1.1, backgroundColor: "#0048ff", color: "#ffffff" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center transition-colors duration-300"
                  aria-label="Depoimento anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </motion.button>
                
                <div className="flex gap-2">
                  {testimonials.map((_, index) => (
                    <motion.button 
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      className={`w-3 h-3 rounded-full ${currentTestimonial === index ? 'bg-blue-600' : 'bg-gray-300'}`}
                      aria-label={`Depoimento ${index + 1}`}
                    />
                  ))}
                </div>
                
                <motion.button 
                  onClick={nextTestimonial}
                  whileHover={{ scale: 1.1, backgroundColor: "#0048ff", color: "#ffffff" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center transition-colors duration-300"
                  aria-label="Próximo depoimento"
                >
                  <ChevronRight className="h-5 w-5" />
                </motion.button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default Clients;
