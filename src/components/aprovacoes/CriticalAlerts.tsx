
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AlertMetrics {
  overdue: number;
  dueTodayCount: number;
  avgDelayDays: number;
}

const fetchAlertMetrics = async (): Promise<AlertMetrics> => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('solicitacoes')
    .select('data_limite')
    .in('status', ['Pendente', 'Em Elaboração'])
    .not('data_limite', 'is', null);

  if (error) throw error;

  const items = data || [];
  let overdue = 0;
  let dueTodayCount = 0;
  let totalDelayDays = 0;
  let delayCount = 0;

  items.forEach(item => {
    const dueDate = item.data_limite!;
    if (dueDate < todayStr) {
      overdue++;
      const dueDateObj = new Date(dueDate);
      const diffMs = today.getTime() - dueDateObj.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      totalDelayDays += diffDays;
      delayCount++;
    } else if (dueDate === todayStr) {
      dueTodayCount++;
    }
  });

  const avgDelayDays = delayCount > 0 ? Math.round((totalDelayDays / delayCount) * 10) / 10 : 0;
  return { overdue, dueTodayCount, avgDelayDays };
};

export const CriticalAlerts = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['critical-alert-metrics'],
    queryFn: fetchAlertMetrics,
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Alertas Críticos
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const alerts = [
    {
      type: 'critical',
      count: metrics?.overdue ?? 0,
      label: 'itens vencidos',
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    {
      type: 'warning',
      count: metrics?.dueTodayCount ?? 0,
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
            <span className="text-sm text-muted-foreground">SLA Médio de Atraso</span>
            <Badge 
              variant="outline" 
              className={metrics?.avgDelayDays && metrics.avgDelayDays > 0 ? 'text-orange-600' : 'text-green-600'}
            >
              {metrics?.avgDelayDays && metrics.avgDelayDays > 0
                ? `${metrics.avgDelayDays} dia${metrics.avgDelayDays !== 1 ? 's' : ''} atraso`
                : 'Sem atrasos'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

