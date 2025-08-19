
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  TrendingUp,
  Users,
  DollarSign,
  Calendar
} from 'lucide-react';
import { ApprovalsDashboard } from '@/components/aprovacoes/ApprovalsDashboard';
import { PendingApprovals } from '@/components/aprovacoes/PendingApprovals';
import { ApprovalReports } from '@/components/aprovacoes/ApprovalReports';
import { WorkflowConfiguration } from '@/components/aprovacoes/WorkflowConfiguration';

const Approvals = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard de Aprovações Orçamentárias</h1>
        <p className="text-muted-foreground">
          Gerencie e monitore todo o fluxo de aprovações orçamentárias
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pendentes
          </TabsTrigger>
          <TabsTrigger value="workflow" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Configurar Fluxo
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <ApprovalsDashboard />
        </TabsContent>

        <TabsContent value="pending">
          <PendingApprovals />
        </TabsContent>

        <TabsContent value="workflow">
          <WorkflowConfiguration />
        </TabsContent>

        <TabsContent value="reports">
          <ApprovalReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Approvals;
