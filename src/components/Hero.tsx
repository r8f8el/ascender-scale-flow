
import React from 'react';

const Hero = () => {
  return (
    <section className="py-16 bg-white relative z-10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-black">
            Sobre Ascalate
          </h2>
          
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p className="text-lg">
              Somos uma consultoria especializada em Planejamento Financeiro, Estratégico e Orçamentário, com foco em impulsionar a performance e a escalabilidade de negócios por meio de soluções práticas, orientadas por dados e alinhadas aos objetivos dos nossos clientes.
            </p>
            
            <p className="text-lg">
              Nosso foco está na integração entre análise financeira profunda e inteligência estratégica, oferecendo desde a modelagem de cenários até a implementação de governança e KPIs que sustentam o crescimento sustentável.
            </p>
            
            <div className="mt-8">
              <p className="text-lg font-semibold mb-4">Contamos com uma equipe multidisciplinar formada por:</p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-3 mr-4 flex-shrink-0"></span>
                  <div>
                    <span className="font-medium">Analistas de FP&A (Financial Planning & Analysis):</span> responsáveis por estruturar projeções, simulações financeiras e relatórios gerenciais de alta precisão.
                  </div>
                </div>
                
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-3 mr-4 flex-shrink-0"></span>
                  <div>
                    <span className="font-medium">Analistas de Dados:</span> que desenvolvem dashboards, automatizam relatórios e transformam dados brutos em insights estratégicos.
                  </div>
                </div>
                
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-3 mr-4 flex-shrink-0"></span>
                  <div>
                    <span className="font-medium">Gestores de Projetos:</span> que conduzem a implementação das soluções, garantindo alinhamento entre áreas, prazos e metas definidas.
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-lg mt-8">
              Combinamos experiência prática, metodologia rigorosa e tecnologia para entregar valor real, sustentando nossa atuação nos princípios de inovação, transparência, colaboração e excelência.
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
};

export default Hero;
