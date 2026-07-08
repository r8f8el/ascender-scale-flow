
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle
} from 'lucide-react';

interface ApprovalMetrics {
  pending: number;
  approved: number;
  rejected: number;
  avgDelayDays: number;
}

const fetchApprovalMetrics = async (): Promise<ApprovalMetrics> => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
  const todayStr = today.toISOString().split('T')[0];

  const [pendingRes, approvedRes, rejectedRes, delayRes] = await Promise.all([
    supabase
      .from('solicitacoes')
      .select('id', { count: 'exact' })
      .in('status', ['Pendente', 'Em Elaboração']),
    supabase
      .from('solicitacoes')
      .select('id', { count: 'exact' })
      .eq('status', 'Aprovado')
      .gte('data_ultima_modificacao', startOfMonth),
    supabase
      .from('solicitacoes')
      .select('id', { count: 'exact' })
      .eq('status', 'Rejeitado')
      .gte('data_ultima_modificacao', startOfMonth),
    supabase
      .from('solicitacoes')
      .select('data_limite')
      .in('status', ['Pendente', 'Em Elaboração'])
      .not('data_limite', 'is', null)
      .lt('data_limite', todayStr),
  ]);

  const overdueItems = delayRes.data || [];
  let totalDelayDays = 0;
  overdueItems.forEach(item => {
    const dueDateObj = new Date(item.data_limite!);
    const diffMs = today.getTime() - dueDateObj.getTime();
    totalDelayDays += Math.round(diffMs / (1000 * 60 * 60 * 24));
  });
  const avgDelayDays = overdueItems.length > 0 
    ? Math.round((totalDelayDays / overdueItems.length) * 10) / 10 
    : 0;

  return {
    pending: pendingRes.count ?? 0,
    approved: approvedRes.count ?? 0,
    rejected: rejectedRes.count ?? 0,
    avgDelayDays,
  };
};

export const ApprovalMetricsCards = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['approval-metrics'],
    queryFn: fetchApprovalMetrics,
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5,
  });

  const cards = [
    {
      title: 'Pendentes',
      value: isLoading ? '...' : String(metrics?.pending ?? 0),
      subtitle: 'itens',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Aprovadas',
      value: isLoading ? '...' : String(metrics?.approved ?? 0),
      subtitle: 'este mês',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Rejeitadas',
      value: isLoading ? '...' : String(metrics?.rejected ?? 0),
      subtitle: 'este mês',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'SLA Médio',
      value: isLoading ? '...' : metrics?.avgDelayDays && metrics.avgDelayDays > 0 
        ? `${metrics.avgDelayDays} dia${metrics.avgDelayDays !== 1 ? 's' : ''}` 
        : 'Em dia',
      subtitle: metrics?.avgDelayDays && metrics.avgDelayDays > 0 ? 'atraso' : 'sem atrasos',
      icon: AlertTriangle,
      color: metrics?.avgDelayDays && metrics.avgDelayDays > 0 ? 'text-orange-600' : 'text-green-600',
      bgColor: metrics?.avgDelayDays && metrics.avgDelayDays > 0 ? 'bg-orange-100' : 'bg-green-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${metric.bgColor}`}>
                {isLoading 
                  ? <Loader2 className={`h-4 w-4 animate-spin ${metric.color}`} />
                  : <Icon className={`h-4 w-4 ${metric.color}`} />
                }
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.subtitle}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};


