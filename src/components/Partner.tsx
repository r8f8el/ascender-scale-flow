
import React from 'react';
import { Card } from '@/components/ui/card';

export const Partner: React.FC = () => {
  return (
    <section id="partner" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Nosso Sócio
        </h2>
        
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 max-w-5xl mx-auto">
          <div className="w-full md:w-1/3 flex justify-center">
            <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300">
              <img 
                src="/lovable-uploads/bba0a347-b616-49c0-b4a9-7542b10fea2c.png" 
                alt="Daniel Gomes" 
                className="w-full h-auto object-cover"
                loading="eager"
                fetchPriority="high"
              />
            </Card>
          </div>
          
          <div className="w-full md:w-2/3">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Daniel Gomes</h3>
            <p className="text-gray-700 mb-4">
              Profissional com mais de 15 anos de experiência em consultoria contábil e fiscal, 
              especializado em atender empresas de médio e grande porte, com foco em otimização 
              tributária e compliance fiscal.
            </p>
            <p className="text-gray-700 mb-4">
              Possui MBA em Gestão Financeira com ênfase em Controladoria, Auditoria e Compliance pela 
              Fundação Getulio Vargas (FGV). Atua como consultor nas áreas de Planejamento Financeiro e 
              Estratégico, com experiência na avaliação de Business Plans que somam mais de R$ 3,5 bilhões em ativos.
            </p>
            <p className="text-gray-700 mb-4">
              Tem histórico de atuação em projetos diversos, abrangendo os setores de Hospitalidade e 
              Entretenimento, Agronegócio, Indústrias, Construtoras e Incorporadoras, Varejo, Saúde, 
              Estética, entre outros.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
