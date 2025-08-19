
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, FileText, Target, Calendar } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskTemplate {
  name: string;
  duration: number;
  description: string;
}

interface TaskCategory {
  category: string;
  tasks: TaskTemplate[];
}

const FPA_TASK_TEMPLATES: TaskCategory[] = [
  {
    category: 'Kick-off & Planejamento',
    tasks: [
      { name: 'Reunião de Kick-off', duration: 1, description: 'Alinhamento inicial com stakeholders' },
      { name: 'Definição de Escopo', duration: 2, description: 'Documentação detalhada do escopo do projeto' },
      { name: 'Cronograma Detalhado', duration: 1, description: 'Elaboração do cronograma final' }
    ]
  },
  {
    category: 'Entendimento do Negócio',
    tasks: [
      { name: 'Análise do Modelo de Negócio', duration: 3, description: 'Compreensão profunda do negócio' },
      { name: 'Mapeamento de Processos', duration: 5, description: 'Documentação dos processos financeiros' },
      { name: 'Identificação de KPIs', duration: 2, description: 'Definição dos principais indicadores' }
    ]
  },
  {
    category: 'Coleta e Análise de Dados',
    tasks: [
      { name: 'Coleta de Dados Financeiros', duration: 7, description: 'Extração de dados históricos' },
      { name: 'Validação de Dados', duration: 3, description: 'Verificação e limpeza dos dados' },
      { name: 'Análise de Tendências', duration: 4, description: 'Identificação de padrões e tendências' }
    ]
  },
  {
    category: 'Modelagem e Forecast',
    tasks: [
      { name: 'Construção do Modelo Base', duration: 8, description: 'Desenvolvimento do modelo financeiro' },
      { name: 'Cenários e Simulações', duration: 5, description: 'Criação de cenários otimista/pessimista/realista' },
      { name: 'Projeções de Receita', duration: 4, description: 'Modelagem detalhada de receitas' },
      { name: 'Projeções de Custos', duration: 4, description: 'Modelagem detalhada de custos' }
    ]
  },
  {
    category: 'Orçamento e Budget',
    tasks: [
      { name: 'Estruturação do Budget', duration: 6, description: 'Organização da estrutura orçamentária' },
      { name: 'Budget Operacional', duration: 5, description: 'Orçamento das operações' },
      { name: 'Budget de Investimentos', duration: 3, description: 'Planejamento de CAPEX' },
      { name: 'Validação com Gestores', duration: 3, description: 'Alinhamento com áreas responsáveis' }
    ]
  },
  {
    category: 'Entrega e Apresentação',
    tasks: [
      { name: 'Preparação da Apresentação', duration: 3, description: 'Criação de slides executivos' },
      { name: 'Apresentação para Diretoria', duration: 1, description: 'Apresentação dos resultados' },
      { name: 'Documentação Final', duration: 2, description: 'Entrega de documentação completa' },
      { name: 'Treinamento da Equipe', duration: 2, description: 'Capacitação da equipe interna' }
    ]
  }
];

interface FPATaskTemplatesProps {
  onSelectTemplate: (template: TaskTemplate) => void;
  startDate: Date;
}

export const FPATaskTemplates: React.FC<FPATaskTemplatesProps> = ({
  onSelectTemplate,
  startDate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Kick-off & Planejamento');

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Kick-off & Planejamento': return '🎯';
      case 'Entendimento do Negócio': return '🏢';
      case 'Coleta e Análise de Dados': return '📊';
      case 'Modelagem e Forecast': return '📈';
      case 'Orçamento e Budget': return '💰';
      case 'Entrega e Apresentação': return '📋';
      default: return '📋';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Kick-off & Planejamento': return 'bg-blue-50 border-blue-200';
      case 'Entendimento do Negócio': return 'bg-green-50 border-green-200';
      case 'Coleta e Análise de Dados': return 'bg-purple-50 border-purple-200';
      case 'Modelagem e Forecast': return 'bg-orange-50 border-orange-200';
      case 'Orçamento e Budget': return 'bg-yellow-50 border-yellow-200';
      case 'Entrega e Apresentação': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Templates FP&A
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Selecione um template para preencher automaticamente os dados da tarefa
        </p>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto">
          {FPA_TASK_TEMPLATES.map((template) => (
            <TabsTrigger
              key={template.category}
              value={template.category}
              className="text-xs p-2 flex flex-col items-center gap-1"
            >
              <span className="text-lg">{getCategoryIcon(template.category)}</span>
              <span className="hidden lg:block">{template.category.split(' ')[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {FPA_TASK_TEMPLATES.map((categoryData) => (
          <TabsContent key={categoryData.category} value={categoryData.category} className="mt-4">
            <Card className={`${getCategoryColor(categoryData.category)} border-2`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-xl">{getCategoryIcon(categoryData.category)}</span>
                  {categoryData.category}
                  <Badge variant="secondary" className="ml-auto">
                    {categoryData.tasks.length} templates
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {categoryData.tasks.map((task, index) => {
                    const endDate = addDays(startDate, task.duration);
                    const estimatedHours = task.duration * 8;

                    return (
                      <Card
                        key={index}
                        className="p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-200 hover:border-blue-300"
                        onClick={() => onSelectTemplate(task)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <h4 className="font-medium text-gray-900">{task.name}</h4>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {task.duration} dia{task.duration > 1 ? 's' : ''}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(endDate, 'dd/MM', { locale: ptBR })}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {estimatedHours}h
                              </Badge>
                            </div>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            className="ml-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            Usar Template
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <div className="text-center">
        <div className="text-xs text-gray-500 space-y-1">
          <p>💼 <strong>Total:</strong> {FPA_TASK_TEMPLATES.reduce((acc, cat) => acc + cat.tasks.length, 0)} templates disponíveis</p>
          <p>⏱️ <strong>Estimativa Total:</strong> ~{FPA_TASK_TEMPLATES.reduce((acc, cat) => acc + cat.tasks.reduce((sum, task) => sum + task.duration, 0), 0)} dias úteis</p>
        </div>
      </div>
    </div>
  );
};
