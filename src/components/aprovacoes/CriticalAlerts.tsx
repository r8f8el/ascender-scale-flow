
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock } from 'lucide-react';

export const CriticalAlerts = () => {
  const alerts = [
    {
      type: 'critical',
      count: 3,
      label: 'itens vencidos',
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    {
      type: 'warning',
      count: 8,
      label: 'itens vencendo hoje',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Alertas Críticos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert, index) => (
          <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
            <div className={`w-3 h-3 rounded-full ${alert.color}`} />
            <div className="flex-1">
              <div className={`text-lg font-bold ${alert.textColor}`}>
                {alert.count}
              </div>
              <p className="text-sm text-muted-foreground">
                {alert.label}
              </p>
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">SLA Médio</span>
            <Badge variant="outline" className="text-orange-600">
              2,5 dias atraso
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
