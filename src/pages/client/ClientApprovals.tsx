
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import MinhasSolicitacoes from './MinhasSolicitacoes';
import DashboardAprovacoes from './DashboardAprovacoes';

const ClientApprovals = () => {
  const { user } = useAuth();

  // Verificar se o usuário é aprovador
  // TODO: Implementar lógica para identificar se o usuário é aprovador
  const isAprovador = true; // Temporário

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fluxo de Aprovações</h1>
          <p className="text-muted-foreground">
            Sistema de aprovação de documentos e solicitações
          </p>
        </div>
      </div>

      {/* Menu de Navegação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-6 w-6 mr-3 text-blue-500" />
              Minhas Solicitações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Crie e acompanhe suas solicitações de aprovação
            </p>
            <Button 
              onClick={() => window.location.href = '/cliente/solicitacoes'}
              className="w-full"
            >
              Acessar Solicitações
            </Button>
          </CardContent>
        </Card>

        {isAprovador && (
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle2 className="h-6 w-6 mr-3 text-green-500" />
                Dashboard de Aprovações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Revise e aprove solicitações pendentes
              </p>
              <Button 
                onClick={() => window.location.href = '/cliente/aprovacoes-dashboard'}
                className="w-full"
                variant="outline"
              >
                Acessar Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Rotas aninhadas */}
      <Routes>
        <Route path="/solicitacoes" element={<MinhasSolicitacoes />} />
        <Route path="/aprovacoes-dashboard" element={<DashboardAprovacoes />} />
      </Routes>
    </div>
  );
};

export default ClientApprovals;
