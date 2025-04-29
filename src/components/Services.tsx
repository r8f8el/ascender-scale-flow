
import React from 'react';
import { BarChart3, Target, Rocket } from 'lucide-react';

const services = [
  {
    title: "Consultoria Financeira",
    description: "Análise detalhada e orientação especializada para otimizar o desempenho financeiro da sua empresa.",
    icon: BarChart3
  },
  {
    title: "Planejamento Estratégico",
    description: "Desenvolvimento de estratégias personalizadas para alcançar seus objetivos de negócio e superar a concorrência.",
    icon: Target
  },
  {
    title: "Impulsionamento de Crescimento",
    description: "Identificação e implementação de oportunidades para acelerar o crescimento sustentável do seu negócio.",
    icon: Rocket
  }
];

const Services = () => {
  return (
    <section id="services" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-ascalate-black mb-4">O que entregamos</h2>
          <div className="w-24 h-1 bg-ascalate-blue mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
            Soluções completas e personalizadas para transformar desafios em oportunidades de crescimento.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-10">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 hover:border-ascalate-blue group"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-ascalate-blue transition-colors duration-300">
                <service.icon className="h-8 w-8 text-ascalate-blue group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
              
              <div className="mt-8">
                <a href="#contact" className="text-ascalate-blue font-medium hover:text-ascalate-darkblue flex items-center">
                  <span>Saiba mais</span>
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
