
import React from 'react';
import { Target, Eye, Lightbulb, Check, Star, Users } from 'lucide-react';

const MissionVision = () => {
  return (
    <section id="mission" className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-ascalate-black mb-4">Missão, Visão e Valores</h2>
          <div className="w-24 h-1 bg-ascalate-blue mx-auto"></div>
          <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
            Conheça os princípios que guiam nossas ações e definem nosso compromisso com o sucesso dos clientes.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-10">
          <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-ascalate-blue animate-fade-in">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0">
                <Target className="h-10 w-10 text-ascalate-blue" />
              </div>
              <h3 className="ml-4 text-2xl font-semibold">Missão</h3>
            </div>
            <p className="text-gray-700">
              "Potencializar o crescimento de nossos clientes ao oferecer soluções inovadoras de consultoria que possibilitam ascender e escalar seus negócios, transformando desafios em oportunidades e insights em resultados significativos."
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-lg border-t-4 border-ascalate-darkblue animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0">
                <Eye className="h-10 w-10 text-ascalate-darkblue" />
              </div>
              <h3 className="ml-4 text-2xl font-semibold">Visão</h3>
            </div>
            <p className="text-gray-700">
              "Ser reconhecida como a consultoria de referência em inovação e excelência no desenvolvimento de soluções que potencializam o desempenho financeiro e estratégico das empresas no Brasil e além."
            </p>
          </div>
        </div>
        
        <div className="mt-16">
          <div className="bg-white p-8 rounded-lg shadow-lg animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center mb-10">
              <div className="flex-shrink-0">
                <Lightbulb className="h-10 w-10 text-ascalate-blue" />
              </div>
              <h3 className="ml-4 text-2xl font-semibold">Valores</h3>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ValueCard 
                icon={Lightbulb} 
                title="Inovação" 
                description="Buscamos constantemente novas abordagens e tecnologias para oferecer soluções que agreguem valor aos nossos clientes."
              />
              
              <ValueCard 
                icon={Check} 
                title="Transparência" 
                description="Mantemos uma comunicação clara e honesta, assegurando a confiança nas relações com nossos clientes e parceiros."
              />
              
              <ValueCard 
                icon={Users} 
                title="Colaboração" 
                description="Trabalhamos em conjunto com nossos clientes, entendendo suas necessidades e co-criando soluções personalizadas."
              />
              
              <ValueCard 
                icon={Star} 
                title="Excelência" 
                description="Comprometemo-nos a entregar serviços de alta qualidade que superem as expectativas, garantindo resultados sustentáveis."
              />
              
              <ValueCard 
                icon={Check} 
                title="Ética" 
                description="Atuamos com integridade, respeitando normas e regulamentos, promovendo um ambiente de negócios justo e responsável."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface ValueCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const ValueCard = ({ icon: Icon, title, description }: ValueCardProps) => {
  return (
    <div className="p-6 border border-gray-100 rounded-lg hover:border-ascalate-blue hover:shadow-md transition-all duration-300">
      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-ascalate-blue" />
      </div>
      <h4 className="text-xl font-semibold mb-2">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default MissionVision;
