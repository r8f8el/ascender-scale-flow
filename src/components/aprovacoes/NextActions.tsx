
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, Eye } from 'lucide-react';

export const NextActions = () => {
  const nextActions = [
    {
      title: 'Orçamento TI Q2',
      approver: 'João Silva',
      days: 2,
      priority: 'high',
      value: 'R$ 850.000'
    },
    {
      title: 'CAPEX Marketing',
      approver: 'Diretoria',
      days: 5,
      priority: 'medium',
      value: 'R$ 320.000'
    },
    {
      title: 'Revisão Headcount RH',
      approver: 'CFO',
      days: 1,
      priority: 'low',
      value: 'R$ 150.000'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return 'Normal';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Próximas Ações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {nextActions.map((action, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold">{action.title}</h3>
                  <Badge className={getPriorityColor(action.priority)}>
                    {getPriorityLabel(action.priority)}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Aguardando {action.approver}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {action.days} {action.days === 1 ? 'dia' : 'dias'}
                  </div>
                  <span className="font-medium text-green-600">
                    {action.value}
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Ver Detalhes
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
