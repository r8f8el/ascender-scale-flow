
import React from 'react';
import { Target, Eye, Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const MissionVision = () => {
  return (
    <section id="mission" className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Missão, Visão e Valores</h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
            Conheça os princípios que guiam nossas ações e definem nosso compromisso com o sucesso dos clientes.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="animate__animated animate__fadeIn shadow-xl border-t-4 border-blue-600">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0">
                  <Target className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="ml-4 text-2xl font-bold">Missão</h3>
              </div>
              <p className="text-gray-700">
                "Potencializar o crescimento de nossos clientes ao oferecer soluções inovadoras de consultoria que possibilitam ascender e escalar seus negócios, transformando desafios em oportunidades e insights em resultados significativos."
              </p>
            </CardContent>
          </Card>
          
          <Card className="animate__animated animate__fadeIn shadow-xl border-t-4 border-blue-600" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0">
                  <Eye className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="ml-4 text-2xl font-bold">Visão</h3>
              </div>
              <p className="text-gray-700">
                "Ser reconhecida como a consultoria de referência em inovação e excelência no desenvolvimento de soluções que potencializam o desempenho financeiro e estratégico das empresas no Brasil e além."
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-16">
          <Card className="animate__animated animate__fadeIn shadow-xl" style={{ animationDelay: '0.4s' }}>
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0">
                  <Lightbulb className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="ml-4 text-2xl font-bold">Valores</h3>
              </div>
              
              <p className="text-gray-700">
                Buscamos constantemente novas abordagens e tecnologias para oferecer soluções inovadoras que agreguem valor aos nossos clientes. Mantemos uma comunicação clara e honesta, assegurando a confiança nas relações. Trabalhamos em conjunto com nossos clientes, entendendo suas necessidades e co-criando soluções personalizadas. Comprometemo-nos a entregar serviços de alta qualidade que superem as expectativas, garantindo resultados sustentáveis e promovendo um ambiente de negócios justo e responsável.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default MissionVision;
