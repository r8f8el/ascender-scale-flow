import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const teamMembers = [
    {
      title: "Analistas de FP&A (Financial Planning & Analysis)",
      description: "responsáveis por estruturar projeções, simulações financeiras e relatórios gerenciais de alta precisão."
    },
    {
      title: "Analistas de Dados",
      description: "que desenvolvem dashboards, automatizam relatórios e transformam dados brutos em insights estratégicos."
    },
    {
      title: "Gestores de Projetos",
      description: "que conduzem a implementação das soluções, garantindo alinhamento entre áreas, prazos e metas definidas."
    }
  ];

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-8 text-black"
            variants={itemVariants}
          >
            Sobre a Ascalate
          </motion.h2>
          
          <motion.div 
            className="space-y-6 text-gray-700 leading-relaxed"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.p 
              className="text-lg md:text-xl"
              variants={itemVariants}
            >
              Somos uma consultoria especializada em Planejamento Financeiro, Estratégico e Orçamentário, com foco em impulsionar a performance e a escalabilidade de negócios por meio de soluções práticas, orientadas por dados e alinhadas aos objetivos dos nossos clientes.
            </motion.p>
            
            <motion.p 
              className="text-lg md:text-xl"
              variants={itemVariants}
            >
              Nosso foco está na integração entre análise financeira profunda e inteligência estratégica, oferecendo desde a modelagem de cenários até a implementação de governança e KPIs que sustentam o crescimento sustentável.
            </motion.p>
            
            <motion.div 
              className="mt-10 p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg"
              variants={itemVariants}
            >
              <motion.p 
                className="text-lg font-semibold mb-4 text-gray-900"
                variants={itemVariants}
              >
                Contamos com uma equipe multidisciplinar formada por:
              </motion.p>
              
              <motion.div 
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {teamMembers.map((member, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-start group"
                    variants={itemVariants}
                    whileHover={{ x: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div className="flex-shrink-0 mt-1 mr-4">
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ChevronRight className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">{member.title}:</span> {member.description}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            
            <motion.p 
              className="text-lg md:text-xl mt-8"
              variants={itemVariants}
            >
              Combinamos experiência prática, metodologia rigorosa e tecnologia para entregar valor real, sustentando nossa atuação nos princípios de inovação, transparência, colaboração e excelência.
            </motion.p>
            
            <motion.div 
              className="flex justify-center mt-10"
              variants={itemVariants}
            >
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg font-medium transition-all duration-300 transform hover:scale-105"
                onClick={() => {
                  const contactSection = document.getElementById('contact');
                  if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Entre em Contato
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
