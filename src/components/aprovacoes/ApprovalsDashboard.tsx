
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  DollarSign,
  Users,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { ApprovalMetricsCards } from './ApprovalMetricsCards';
import { ApprovalTimeline } from './ApprovalTimeline';
import { CriticalAlerts } from './CriticalAlerts';
import { NextActions } from './NextActions';

export const ApprovalsDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <ApprovalMetricsCards />

      {/* Gráficos e Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ApprovalTimeline />
        </div>
        <div>
          <CriticalAlerts />
        </div>
      </div>

      {/* Próximas Ações */}
      <NextActions />
    </div>
  );
};
