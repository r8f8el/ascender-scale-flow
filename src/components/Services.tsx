
import React, { useState } from 'react';
import { BarChart3, Target, Calculator, ArrowRight, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

const services = [
  {
    title: "Consultoria em Planejamento Financeiro",
    description: "Análise e estruturação de indicadores, projeções e relatórios financeiros com foco em resultados. Atuamos com:",
    details: [
      "Modelagem Financeira e Planejamento Orçamentário",
      "Automação de relatórios e dashboards gerenciais",
      "Análise de viabilidade e avaliação de planos de negócio",
      "Implementação de práticas de controladoria e compliance"
    ],
    icon: BarChart3,
    bgColor: "bg-blue-50"
  },
  {
    title: "Consultoria em Planejamento Estratégico",
    description: "Desenvolvimento de estratégias personalizadas para crescimento sustentável e alinhamento de metas ao posicionamento de mercado:",
    details: [
      "Estruturação de governança corporativa",
      "Definição e modelagem de KPIs estratégicos",
      "Análise de cenário, riscos e oportunidades",
      "Planejamento de expansão e diversificação de portfólio"
    ],
    icon: Target,
    bgColor: "bg-blue-50"
  },
  {
    title: "Condução de Planejamento Orçamentário",
    description: "Implementação estruturada do orçamento empresarial, conectando metas estratégicas à realidade financeira do negócio:",
    details: [
      "Elaboração de orçamentos por centro de custo e unidade de negócio",
      "Simulações de cenários e sensibilidade (otimista, base, pessimista)",
      "Integração com projeções de fluxo de caixa e DRE",
      "Capacitação da equipe na cultura de orçamento contínuo"
    ],
    icon: Calculator,
    bgColor: "bg-blue-50"
  }
];

const Services = () => {
  const [expandedService, setExpandedService] = useState<number | null>(null);

  const toggleService = (index: number) => {
    setExpandedService(expandedService === index ? null : index);
  };

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

  return (
    <section id="services" className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">O que entregamos</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
            Soluções completas e personalizadas para transformar desafios em oportunidades de crescimento.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="h-full"
            >
              <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-orange-500"></div>
                <CardContent className="p-6 lg:p-8 flex-grow flex flex-col">
                  <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-full ${service.bgColor} flex items-center justify-center mb-4 lg:mb-6`}>
                    <service.icon className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold mb-3 lg:mb-4">{service.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm lg:text-base flex-grow">{service.description}</p>
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 mb-4 text-left font-normal hover:bg-transparent"
                    onClick={() => toggleService(index)}
                  >
                    <span className="text-blue-600 font-medium">Ver detalhes</span>
                    <motion.div
                      animate={{ rotate: expandedService === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="h-5 w-5 text-blue-600" />
                    </motion.div>
                  </Button>
                  
                  <AnimatePresence>
                    {expandedService === index && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-2 mb-6 overflow-hidden"
                      >
                        {service.details.map((detail, detailIndex) => (
                          <motion.li 
                            key={detailIndex} 
                            className="text-xs lg:text-sm text-gray-700 flex items-start"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: detailIndex * 0.1 }}
                          >
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            {detail}
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                  
                  <motion.a 
                    href="#contact" 
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors group mt-auto"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <span>Saiba mais</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </motion.a>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
