import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { FileUp, CloudDownload, CheckCircle, Loader2, AlertTriangle, KeyRound } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from "@/integrations/supabase/client";

const OneDriveIntegration = () => {
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  
  // Connection details
  const [connectionDetails, setConnectionDetails] = useState<{
    email?: string;
    name?: string;
    rootFolder?: string;
    clientId?: string;
    tenantId?: string;
  }>({});

  // Form state
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [tenantId, setTenantId] = useState('common');
  const [rootFolder, setRootFolder] = useState('Ascalate/Clientes');

  const [approvedRequests, setApprovedRequests] = useState<any[]>([]);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const redirectUri = `${window.location.origin}/admin/onedrive`;

  // 1. Check connection status on mount and handle OAuth code callback
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        
        // Check if there is an authorization code in URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        
        if (code) {
          setConnecting(true);
          const pendingConfigStr = localStorage.getItem('microsoft_oauth_pending');
          
          if (pendingConfigStr) {
            const pendingConfig = JSON.parse(pendingConfigStr);
            console.log('Exchanging auth code with saved config...');
            
            const { data, error } = await supabase.functions.invoke('microsoft-oauth', {
              body: {
                action: 'exchange_code',
                clientId: pendingConfig.clientId,
                clientSecret: pendingConfig.clientSecret,
                tenantId: pendingConfig.tenantId,
                code,
                redirectUri,
                rootFolder: pendingConfig.rootFolder
              }
            });
            
            if (error) throw error;
            
            toast.success(`Conta Microsoft conectada: ${data.name || data.email}`);
            localStorage.removeItem('microsoft_oauth_pending');
          } else {
            console.warn('Authorization code found, but no pending OAuth config in localStorage');
          }
          
          // Clear query params from URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        // Fetch current integration status
        await checkStatus();
      } catch (err: any) {
        console.error('Error during OneDrive integration init:', err);
        toast.error('Erro ao conectar ao OneDrive: ' + (err.message || err.error));
        localStorage.removeItem('microsoft_oauth_pending');
      } finally {
        setConnecting(false);
        setLoading(false);
      }
    };
    
    init();
  }, []);

  const checkStatus = async () => {
    const { data, error } = await supabase.functions.invoke('microsoft-oauth', {
      body: { action: 'check_status' }
    });
    
    if (error) {
      console.error('Error checking status:', error);
      return;
    }
    
    if (data?.connected) {
      setConnected(true);
      setConnectionDetails(data);
      setRootFolder(data.rootFolder || 'Ascalate/Clientes');
    } else {
      setConnected(false);
      setConnectionDetails({});
    }
  };

  const fetchApprovedRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('client_document_requests' as any)
        .select('id, filename, title')
        .eq('status', 'approved');
      
      if (error) throw error;
      setApprovedRequests(data || []);
    } catch (err) {
      console.error('Error fetching approved requests:', err);
    }
  };

  useEffect(() => {
    if (connected) {
      fetchApprovedRequests();
    }
  }, [connected]);

  const handleBulkSync = async () => {
    if (approvedRequests.length === 0) return;
    
    setSyncingAll(true);
    setSyncProgress(0);
    toast.info(`Iniciando sincronização de ${approvedRequests.length} arquivos...`);

    let successCount = 0;
    
    for (let i = 0; i < approvedRequests.length; i++) {
      const request = approvedRequests[i];
      try {
        console.log(`Syncing file ${i+1}/${approvedRequests.length}: ${request.filename}`);
        const { data, error } = await supabase.functions.invoke('microsoft-oauth', {
          body: {
            action: 'sync_file',
            requestId: request.id
          }
        });
        
        if (error) throw error;
        if (data?.success) {
          successCount++;
        }
      } catch (err) {
        console.error(`Erro ao sincronizar arquivo ${request.filename}:`, err);
      }
      setSyncProgress(i + 1);
    }
    
    setSyncingAll(false);
    if (successCount === approvedRequests.length) {
      toast.success(`Sincronização em lote finalizada! ${successCount} de ${approvedRequests.length} arquivos enviados com sucesso.`);
    } else {
      toast.warning(`Sincronização concluída com avisos: ${successCount} de ${approvedRequests.length} arquivos enviados com sucesso.`);
    }
  };

  // 2. Initiate OAuth redirect to Microsoft
  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId.trim() || !clientSecret.trim() || !rootFolder.trim()) {
      toast.error('Preencha todas as credenciais do aplicativo Azure.');
      return;
    }

    try {
      setConnecting(true);
      toast.info('Obtendo URL de autorização da Microsoft...');
      
      const { data, error } = await supabase.functions.invoke('microsoft-oauth', {
        body: {
          action: 'get_auth_url',
          clientId,
          tenantId,
          redirectUri
        }
      });

      if (error) throw error;

      if (data?.authUrl) {
        // Save form configuration in localStorage to exchange the code after redirect
        localStorage.setItem('microsoft_oauth_pending', JSON.stringify({
          clientId,
          clientSecret,
          tenantId,
          rootFolder
        }));
        
        // Redirect to Microsoft Sign-in
        window.location.href = data.authUrl;
      } else {
        throw new Error('Url de autorização não retornada pelo servidor.');
      }
    } catch (err: any) {
      console.error('Error getting auth url:', err);
      toast.error('Falha ao iniciar conexão: ' + err.message);
      setConnecting(false);
    }
  };

  // 3. Disconnect account (delete tokens)
  const handleDisconnect = async () => {
    if (!window.confirm("Tem certeza que deseja desconectar sua conta Microsoft? A sincronização automática de arquivos será interrompida.")) {
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('microsoft_tokens' as any)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
        
      if (error) throw error;
      
      setConnected(false);
      setConnectionDetails({});
      setClientId('');
      setClientSecret('');
      toast.success("Integração Microsoft desconectada com sucesso!");
    } catch (err: any) {
      console.error('Error disconnecting:', err);
      toast.error('Falha ao desconectar conta: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-muted-foreground text-sm">Carregando configurações de integração...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium mb-1">Integração Microsoft OneDrive/SharePoint</h2>
          <p className="text-muted-foreground text-sm">
            Configure a integração com sua conta Microsoft para armazenamento e gerenciamento de arquivos em nuvem corporativa
          </p>
        </div>
      </div>

      {connecting && (
        <Alert className="bg-blue-50 border-blue-200">
          <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
          <AlertTitle>Conectando...</AlertTitle>
          <AlertDescription>
            Trocando códigos de segurança com a Microsoft Graph API. Por favor, aguarde.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Status da Conexão</CardTitle>
            <CardDescription>
              {connected 
                ? "Sua conta Microsoft está conectada e ativa" 
                : "Conecte sua conta Microsoft corporativa para sincronizar os uploads automaticamente"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {connected ? (
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12 border">
                    <AvatarFallback className="bg-blue-600 text-white font-bold">MS</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-base">{connectionDetails.name}</p>
                    <p className="text-sm text-muted-foreground">{connectionDetails.email}</p>
                  </div>
                </div>
                
                <Alert className="bg-green-50 border-green-200 text-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="font-semibold">Integração Ativa</AlertTitle>
                  <AlertDescription className="text-sm">
                    Os arquivos aprovados dos checklists de clientes serão enviados diretamente para a árvore de pastas:
                    <code className="block bg-green-100/50 p-2 rounded mt-2 text-xs font-mono text-green-900">
                      {connectionDetails.rootFolder}/[Nome-Cliente]/[Categoria]/[Arquivo]
                    </code>
                  </AlertDescription>
                </Alert>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Client ID do Azure:</strong> <code className="bg-muted px-1 rounded">{connectionDetails.clientId?.substring(0, 8)}...</code></p>
                  <p><strong>Tenant ID:</strong> <code className="bg-muted px-1 rounded">{connectionDetails.tenantId}</code></p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-6 py-6">
                <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                  <FileUp className="h-8 w-8" />
                </div>
                <div className="text-center max-w-sm">
                  <p className="font-medium text-sm mb-2">Conecte sua conta Microsoft</p>
                  <p className="text-xs text-muted-foreground">
                    Esta integração salvará todos os balancetes, extratos e relatórios aprovados diretamente no OneDrive ou SharePoint da sua consultoria.
                  </p>
                </div>
                
                <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-900">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="font-semibold text-amber-800">Pré-requisito</AlertTitle>
                  <AlertDescription className="text-xs text-amber-700">
                    Você deve criar um **App Registration (SPA ou Web)** no portal da Microsoft Azure e coletar as credenciais ao lado. Adicione a Redirect URI do seu portal.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-between bg-muted/20">
            {connected ? (
              <Button variant="destructive" onClick={handleDisconnect} disabled={connecting} className="w-full">
                Desconectar Conta Microsoft
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground text-center w-full">
                Preencha o formulário ao lado para liberar a conexão.
              </p>
            )}
          </CardFooter>
        </Card>
        
        {!connected && (
          <Card>
            <form onSubmit={handleConnect}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-blue-600" />
                  <span>Credenciais do Aplicativo Azure</span>
                </CardTitle>
                <CardDescription>
                  Configure as informações do seu registro de aplicativo no Microsoft Entra ID (antigo Azure AD)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="azure-client-id">Application (client) ID <span className="text-red-500">*</span></Label>
                  <Input
                    id="azure-client-id"
                    placeholder="ex: 4a3e811c-2212-4c28-93d5-ae9ad7b4a9bf"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="azure-client-secret">Client Secret <span className="text-red-500">*</span></Label>
                  <Input
                    id="azure-client-secret"
                    type="password"
                    placeholder="Valor do segredo gerado no Azure"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="azure-tenant-id">Directory (tenant) ID</Label>
                    <Input
                      id="azure-tenant-id"
                      value={tenantId}
                      onChange={(e) => setTenantId(e.target.value)}
                      placeholder="common"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="azure-root-folder">Pasta Raiz no OneDrive</Label>
                    <Input
                      id="azure-root-folder"
                      value={rootFolder}
                      onChange={(e) => setRootFolder(e.target.value)}
                      placeholder="Ascalate/Clientes"
                      required
                    />
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1 mt-2">
                  <p><strong>Configuração do Azure:</strong></p>
                  <p>• Adicione a URI de Redirecionamento (Web): <code className="bg-muted px-1 rounded text-[10px] break-all">{redirectUri}</code></p>
                  <p>• Scopes necessários: <code className="bg-muted px-1 rounded text-[10px]">Files.ReadWrite.All</code>, <code className="bg-muted px-1 rounded text-[10px]">offline_access</code>, <code className="bg-muted px-1 rounded text-[10px]">User.Read</code></p>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 bg-muted/20">
                <Button type="submit" disabled={connecting} className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  {connecting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Conectando...
                    </>
                  ) : (
                    <>
                      <CloudDownload className="h-4 w-4" /> Conectar com Microsoft
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {connected && (
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Sincronização</CardTitle>
              <CardDescription>
                Informações e regras de estruturação dos arquivos no OneDrive/SharePoint
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Pasta Base de Sincronização</Label>
                <div className="bg-muted p-2 rounded mt-1 text-sm font-mono text-muted-foreground break-all">
                  {connectionDetails.rootFolder}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-sm font-semibold">Como os arquivos serão estruturados:</Label>
                <div className="bg-slate-900 text-slate-100 p-4 rounded-md text-xs font-mono mt-2 overflow-x-auto space-y-1">
                  <p className="text-slate-400"># Raiz configurada: {connectionDetails.rootFolder}/</p>
                  <p>└── [Nome da Empresa]/</p>
                  <p>    ├── Contábil/ &nbsp;&nbsp;&nbsp;<span className="text-slate-500"># Balancete de Verificação, etc.</span></p>
                  <p>    ├── Financeiro/ <span className="text-slate-500"># DRE, Extratos Bancários, etc.</span></p>
                  <p>    ├── RH/ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500"># Folha de Pagamento, etc.</span></p>
                  <p>    └── Outros/</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 bg-muted/20">
              <p className="text-[11px] text-muted-foreground">
                Sincronia automática ativada: quando um documento de checklist for aprovado pelo consultor no painel, ele será copiado em tempo real para a pasta correspondente.
              </p>
            </CardFooter>
          </Card>
        )}
      </div>

      {connected && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileUp className="h-5 w-5 text-blue-600" />
              <span>Sincronização em Lote (Bulk Sync)</span>
            </CardTitle>
            <CardDescription>
              Transfira em lote todos os documentos já aprovados para a nuvem da Microsoft
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-muted/30 rounded-xl gap-4">
              <div>
                <p className="text-sm font-semibold">Documentos Aprovados no Portal</p>
                <p className="text-sm text-muted-foreground mt-0.5">Arquivos prontos para serem enviados ao OneDrive/SharePoint</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{approvedRequests.length}</p>
              </div>
              <Button 
                onClick={handleBulkSync}
                disabled={syncingAll || approvedRequests.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium gap-2 min-w-[200px]"
              >
                {syncingAll ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sincronizando ({syncProgress}/{approvedRequests.length})
                  </>
                ) : (
                  <>
                    <CloudDownload className="h-4 w-4" />
                    Sincronizar Todos
                  </>
                )}
              </Button>
            </div>

            {syncingAll && (
              <div className="space-y-2 pt-2">
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${(syncProgress / approvedRequests.length) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Enviando arquivos para o OneDrive/SharePoint... Por favor, não feche esta página.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OneDriveIntegration;
