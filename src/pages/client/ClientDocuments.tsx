
import React from 'react';
import { useCompanyAccess } from '@/hooks/useCompanyAccess';
import { useAccountMigration } from '@/hooks/useAccountMigration';
import CompanyDashboard from '@/components/client/CompanyDashboard';
import { Loader2 } from 'lucide-react';

const ClientDocuments = () => {
  // Primeiro executar migração se necessário
  const { data: migrationData, isLoading: isMigrating } = useAccountMigration();
  
  // Depois verificar acesso à empresa
  const { data: companyAccess, isLoading } = useCompanyAccess();

  if (isMigrating || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-gray-600">
            {isMigrating ? 'Configurando sua conta...' : 'Carregando dados da empresa...'}
          </p>
        </div>
      </div>
    );
  }

  // Para contas existentes, sempre mostrar o dashboard
  return <CompanyDashboard />;
};

export default ClientDocuments;
