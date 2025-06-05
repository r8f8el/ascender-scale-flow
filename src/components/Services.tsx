
import React from 'react';
import { BarChart3, Target, Calculator, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
                <div className="h-3 bg-blue-600"></div>
                <div className="p-8">
                  <div className={`w-16 h-16 rounded-full ${service.bgColor} flex items-center justify-center mb-6`}>
                    <service.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  
                  <ul className="space-y-2 mb-6">
                    {service.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="text-sm text-gray-700 flex items-start">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                  
                  <a href="#contact" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
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
