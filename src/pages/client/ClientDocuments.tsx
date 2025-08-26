
import React from 'react';
import { useCompanyAccess } from '@/hooks/useCompanyAccess';
import CompanyDashboard from '@/components/client/CompanyDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, UserPlus, Mail } from 'lucide-react';

const ClientDocuments = () => {
  const { data: companyAccess, isLoading } = useCompanyAccess();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se não tem acesso à empresa, mostrar página de onboarding
  if (!companyAccess?.hasCompanyAccess) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="max-w-md mx-auto p-8 text-center">
          <div className="text-primary mb-6">
            <Building2 className="h-16 w-16 mx-auto" />
          </div>
          
          <CardHeader>
            <CardTitle className="text-2xl mb-2">Bem-vindo à Ascalate!</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Para começar a usar nossa plataforma, você precisa estar associado a uma empresa ou criar uma nova.
            </p>
            
            <div className="space-y-3">
              <Button className="w-full" variant="default">
                <Building2 className="h-4 w-4 mr-2" />
                Criar Nova Empresa
              </Button>
              
              <Button className="w-full" variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Solicitar Convite
              </Button>
              
              <Button className="w-full" variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Entrar em Contato
              </Button>
            </div>
            
            <div className="pt-4 text-sm text-gray-500">
              Se você recebeu um convite, verifique seu email e clique no link de convite.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se tem acesso, mostrar o dashboard da empresa
  return <CompanyDashboard />;
};

export default ClientDocuments;
