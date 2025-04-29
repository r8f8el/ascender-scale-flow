
import React from 'react';
import { BarChart3, Target, Rocket, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const services = [
  {
    title: "Consultoria Financeira",
    description: "Análise detalhada de dados financeiros para otimização de resultados e tomada de decisões estratégicas.",
    icon: BarChart3,
    bgColor: "bg-blue-50"
  },
  {
    title: "Planejamento Estratégico",
    description: "Desenvolvimento de estratégias personalizadas para impulsionar o crescimento sustentável do seu negócio.",
    icon: Target,
    bgColor: "bg-indigo-50"
  },
  {
    title: "Aceleração de Crescimento",
    description: "Identificação de oportunidades e implementação de soluções para acelerar a expansão da sua empresa.",
    icon: Rocket,
    bgColor: "bg-purple-50"
  }
];

const Services = () => {
  return (
    <section id="services" className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">O que entregamos</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
            Soluções completas e personalizadas para transformar desafios em oportunidades de crescimento.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-0">
                <div className={`h-3 ${index === 0 ? 'bg-blue-600' : index === 1 ? 'bg-indigo-600' : 'bg-purple-600'}`}></div>
                <div className="p-8">
                  <div className={`w-16 h-16 rounded-full ${service.bgColor} flex items-center justify-center mb-6`}>
                    <service.icon className={`h-8 w-8 ${index === 0 ? 'text-blue-600' : index === 1 ? 'text-indigo-600' : 'text-purple-600'}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{service.title}</h3>
                  <p className="text-gray-600 mb-8">{service.description}</p>
                  
                  <a href="#contact" className={`inline-flex items-center text-sm font-medium ${index === 0 ? 'text-blue-600 hover:text-blue-800' : index === 1 ? 'text-indigo-600 hover:text-indigo-800' : 'text-purple-600 hover:text-purple-800'} transition-colors`}>
                    <span>Saiba mais</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
