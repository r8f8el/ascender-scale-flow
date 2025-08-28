import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ClientCommunicationSimple = () => {
  const { user, client, loading } = useAuth();

  console.log('🔄 ClientCommunicationSimple render - user:', user?.id, 'client:', client?.id, 'loading:', loading);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Comunicação Ascalate
        </h1>
        <p className="text-muted-foreground mt-1">
          Converse diretamente com nossa equipe de especialistas
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat Simplificado (Teste)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p><strong>Usuário:</strong> {user?.email || 'N/A'}</p>
            <p><strong>Cliente:</strong> {client?.name || 'N/A'}</p>
            <p><strong>ID do Usuário:</strong> {user?.id || 'N/A'}</p>
            <p><strong>Empresa:</strong> {client?.company || 'N/A'}</p>
          </div>
          
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-center text-muted-foreground">
              Versão simplificada do chat para teste. Se esta página carregar sem erros,
              o problema pode estar na implementação complexa do chat.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientCommunicationSimple;