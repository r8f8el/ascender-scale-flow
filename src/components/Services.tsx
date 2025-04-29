
import React from 'react';
import { ChartBar, Target, Rocket } from 'lucide-react';

const services = [
  {
    title: "Consultoria Financeira e Estratégica",
    description: "Soluções inovadoras para potencializar o crescimento dos nossos clientes.",
    icon: ChartBar
  },
  {
    title: "Análise de Desempenho",
    description: "Transformamos desafios em oportunidades e insights em resultados significativos.",
    icon: Target
  },
  {
    title: "Planejamento e Execução",
    description: "Estratégias personalizadas para ascender e escalar negócios.",
    icon: Rocket
  }
];

const Services = () => {
  return (
    <section id="services" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-ascalate-black mb-4">O que entregamos</h2>
          <div className="w-24 h-1 bg-ascalate-blue mx-auto"></div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 hover:border-ascalate-blue group"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-ascalate-blue transition-colors duration-300">
                <service.icon className="h-8 w-8 text-ascalate-blue group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
