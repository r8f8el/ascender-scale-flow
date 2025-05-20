
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

// Client logos with real client images - reordered and removed Creditar
const clientLogos = [
  { id: 1, src: "/lovable-uploads/d443c2ff-7b88-4aeb-87cd-e23579308905.png", alt: "Portobello Grupo" },
  { id: 2, src: "/lovable-uploads/fbaf288f-e6a9-4aeb-a285-0c4673697f1b.png", alt: "J.assy" },
  { id: 3, src: "/lovable-uploads/9b9e23bc-f39b-419d-b7e0-dbf05855f76c.png", alt: "Apex" },
  { id: 4, src: "/lovable-uploads/bc6b28d9-fb80-4371-8558-5236efa8bfcd.png", alt: "Cropland" },
  { id: 5, src: "/lovable-uploads/eeb91924-4608-4f64-a7b0-1898deababdc.png", alt: "Highcrop" },
  { id: 6, src: "/lovable-uploads/f21c20f5-4dfe-463b-b744-fdc15cd182e8.png", alt: "J. Alves" },
];

const Clients = () => {
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
      </div>
    </section>
  );
};

export default Clients;
