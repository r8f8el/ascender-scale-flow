
import React from 'react';
import { Linkedin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { motion } from 'framer-motion';

const Partner = () => {
  return (
    <section id="partner" className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Nosso Sócio</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-ascalate-blue mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
            Conheça o profissional por trás da Ascalate e sua trajetória de sucesso.
          </p>
        </motion.div>
        
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/3"
          >
            <Card className="overflow-hidden shadow-2xl border-none rounded-2xl transform transition-all duration-300 hover:shadow-ascalate-blue/20 hover:-translate-y-1">
              <div className="relative w-full overflow-hidden">
                <AspectRatio ratio={3/4} className="bg-gray-100">
                  <img 
                    src="/lovable-uploads/9d76e17b-e7f3-435a-b95b-158ef80f185f.png" 
                    alt="Daniel Gomes" 
                    className="object-cover"
                    loading="eager"
                    fetchpriority="high"
                    data-clonable="true"
                  />
                </AspectRatio>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="absolute bottom-0 left-0 p-6"
                >
                  <h3 className="text-2xl font-bold text-white">Daniel Gomes</h3>
                  <p className="text-blue-200">Sócio Fundador</p>
                </motion.div>
              </div>
            </Card>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2"
          >
            <Card className="p-8 shadow-xl border-none rounded-2xl backdrop-blur-sm bg-white/90">
              <motion.h3 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-2xl font-bold mb-4 text-ascalate-darkblue"
              >
                Experiência e Liderança
              </motion.h3>
              
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-gray-700 mb-6"
              >
                Com mais de 15 anos de experiência no mercado financeiro, Daniel Gomes é especialista em consultoria financeira e estratégica para empresas de diversos setores. Sua abordagem inovadora e capacidade analítica têm ajudado negócios a alcançarem seu máximo potencial e superarem expectativas.
              </motion.p>
              
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-gray-700 mb-8"
              >
                Formado em Finanças e com MBA em Gestão Estratégica, Daniel combina conhecimento técnico com uma visão holística do mercado, entregando soluções personalizadas e resultados consistentes para seus clientes.
              </motion.p>
              
              <motion.a 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, color: "#0048ff" }}
                href="https://www.linkedin.com/in/danielgomesgo?originalSubdomain=br" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-ascalate-blue hover:text-ascalate-darkblue transition-colors rounded-full px-6 py-2 border border-ascalate-blue hover:border-ascalate-darkblue"
              >
                <Linkedin className="h-5 w-5 mr-2" />
                <span>Conecte-se no LinkedIn</span>
              </motion.a>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Partner;
