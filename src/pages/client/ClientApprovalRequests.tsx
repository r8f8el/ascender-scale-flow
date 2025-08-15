import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NewApprovalRequestForm } from '@/components/client/approval/NewApprovalRequestForm';
import { MyApprovalRequests } from '@/components/client/approval/MyApprovalRequests';
import { PendingApprovalTasks } from '@/components/client/approval/PendingApprovalTasks';
import { ApprovalOverview } from '@/components/client/approval/ApprovalOverview';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';



const ClientApprovalRequests = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (location.pathname.includes('/nova')) {
      setActiveTab('new-request');
    } else {
      setActiveTab('overview');
    }
  }, [location.pathname]);

  // Check if user has approver role by checking if they appear in approval_steps
  const { data: isApprover } = useQuery({
    queryKey: ['user-approver-status', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from('approval_steps')
        .select('id')
        .or(`approver_user_id.eq.${user.id},approver_email.eq.${user.email}`)
        .limit(1);
      return data && data.length > 0;
    },
    enabled: !!user,
  });

  console.log('🔍 ClientApprovalRequests renderizando - activeTab:', activeTab);
  console.log('🔍 ClientApprovalRequests - user:', user);
  console.log('🔍 ClientApprovalRequests - isApprover data:', isApprover);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Fluxo de Aprovações</h1>
        <p className="text-muted-foreground">
          Gerencie suas solicitações de aprovação e tarefas pendentes
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="my-requests">Minhas Solicitações</TabsTrigger>
          <TabsTrigger value="new-request">Nova Solicitação</TabsTrigger>
          {isApprover && (
            <TabsTrigger value="pending-tasks">Tarefas Pendentes</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview">
          <ApprovalOverview />
        </TabsContent>

        <TabsContent value="my-requests">
          <Card>
            <CardHeader>
              <CardTitle>Minhas Solicitações</CardTitle>
            </CardHeader>
            <CardContent>
              <MyApprovalRequests />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new-request">
          <Card>
            <CardHeader>
              <CardTitle>Nova Solicitação de Aprovação</CardTitle>
            </CardHeader>
            <CardContent>
              <NewApprovalRequestForm />
            </CardContent>
          </Card>
        </TabsContent>

        {isApprover && (
          <TabsContent value="pending-tasks">
            <Card>
              <CardHeader>
                <CardTitle>Tarefas Pendentes de Aprovação</CardTitle>
              </CardHeader>
              <CardContent>
                <PendingApprovalTasks />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ClientApprovalRequests;