
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLink, Eye, Copy } from 'lucide-react';
import { toast } from 'sonner';

const TestInvitePage = () => {
  const [testToken, setTestToken] = useState('sample-secure-token-12345');
  const [inviteUrl, setInviteUrl] = useState('');

  React.useEffect(() => {
    // Generate a sample invite URL
    const baseUrl = window.location.origin;
    setInviteUrl(`${baseUrl}/convite-seguro?token=${testToken}`);
  }, [testToken]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteUrl);
    toast.success('URL copiada para a área de transferência!');
  };

  const openInNewTab = () => {
    window.open(inviteUrl, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Teste da Página de Convite Seguro
        </h1>
        <p className="text-gray-600">
          Visualize como a página de inscrição de convites aparece para os novos membros
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Simulador de Convite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">Token de Teste</Label>
            <Input
              id="token"
              value={testToken}
              onChange={(e) => setTestToken(e.target.value)}
              placeholder="Digite um token de teste"
            />
          </div>

          <div className="space-y-2">
            <Label>URL do Convite Gerada</Label>
            <div className="flex items-center gap-2">
              <Input 
                value={inviteUrl} 
                readOnly 
                className="bg-gray-50"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyToClipboard}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={openInNewTab}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Abrir Página de Convite
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Como Funciona o Sistema de Convites</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">1. Envio do Convite</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Cliente clica em "Convidar Membro"</li>
                <li>• Preenche email, nome e nível hierárquico</li>
                <li>• Sistema gera token seguro único</li>
                <li>• Email é enviado automaticamente</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">2. Recebimento do Convite</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Pessoa recebe email com link seguro</li>
                <li>• Clica no link do convite</li>
                <li>• É direcionada para página de cadastro</li>
                <li>• Completa o cadastro com segurança</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">3. Validação Segura</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Token válido por 7 dias apenas</li>
                <li>• Verificação de convite válido</li>
                <li>• Email pré-preenchido</li>
                <li>• Validação de senha forte</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">4. Ativação da Conta</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Conta criada automaticamente</li>
                <li>• Status atualizado para "ativo"</li>
                <li>• Acesso imediato ao painel</li>
                <li>• Notificações ao administrador</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Dica</h4>
        <p className="text-blue-800 text-sm">
          Use o simulador acima para ver exatamente como a página de convite aparece para os novos membros. 
          Você pode testar diferentes tokens para simular diferentes cenários de convite.
        </p>
      </div>
    </div>
  );
};

export default TestInvitePage;
