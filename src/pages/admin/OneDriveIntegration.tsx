
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FileUp, CloudDownload, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const OneDriveIntegration = () => {
  const [connected, setConnected] = useState(false);
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [autoSync, setAutoSync] = useState(true);
  
  const mockLogin = () => {
    // Simular login no Microsoft
    toast.success("Autenticando com a Microsoft...");
    
    setTimeout(() => {
      setConnected(true);
      setUserName('Usuário Ascalate');
      setEmail('admin@ascalate.com.br');
      toast.success("Conta Microsoft conectada com sucesso!");
    }, 1500);
  };
  
  const handleDisconnect = () => {
    if (window.confirm("Tem certeza que deseja desconectar sua conta Microsoft?")) {
      setConnected(false);
      setUserName('');
      setEmail('');
      toast.success("Conta Microsoft desconectada");
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium mb-1">Integração Microsoft OneDrive/SharePoint</h2>
          <p className="text-muted-foreground text-sm">
            Configure a integração com sua conta Microsoft para armazenamento e gerenciamento de arquivos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status da Conexão</CardTitle>
            <CardDescription>
              {connected 
                ? "Sua conta Microsoft está conectada" 
                : "Conecte sua conta Microsoft para integração com OneDrive/SharePoint"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {connected ? (
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-blue-700 text-white">MS</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{userName}</p>
                    <p className="text-sm text-muted-foreground">{email}</p>
                  </div>
                </div>
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle>Conectado</AlertTitle>
                  <AlertDescription>
                    Sua integração com o OneDrive/SharePoint está ativa e funcionando
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-6 py-6">
                <FileUp className="h-12 w-12 text-blue-600" />
                <div className="text-center">
                  <p className="mb-2">Clique no botão abaixo para conectar sua conta Microsoft</p>
                  <p className="text-sm text-muted-foreground">
                    Esta integração permitirá o armazenamento seguro de arquivos no seu OneDrive/SharePoint
                  </p>
                </div>
                <Button onClick={mockLogin} className="gap-2">
                  <CloudDownload className="h-4 w-4" />
                  Conectar com Microsoft
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            {connected && (
              <>
                <Button variant="outline" onClick={handleDisconnect}>
                  Desconectar conta
                </Button>
                <Button onClick={() => toast.success("Conexão testada com sucesso!")}>
                  Testar conexão
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
        
        {connected && (
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Sincronização</CardTitle>
              <CardDescription>
                Personalize as configurações de sincronização entre o sistema e o OneDrive/SharePoint
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-sync">Sincronização Automática</Label>
                  <p className="text-sm text-muted-foreground">
                    Sincronizar automaticamente novos arquivos
                  </p>
                </div>
                <Switch
                  id="auto-sync"
                  checked={autoSync}
                  onCheckedChange={setAutoSync}
                />
              </div>
              
              <Separator />
              
              <div>
                <Label htmlFor="root-folder">Pasta Principal</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="root-folder"
                    defaultValue="Ascalate/Clientes"
                    placeholder="Caminho da pasta"
                  />
                  <Button variant="outline">Escolher</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Pasta base onde os arquivos dos clientes serão armazenados
                </p>
              </div>
              
              <Separator />
              
              <div>
                <p className="font-medium mb-2">Estrutura de Pastas para Clientes</p>
                <div className="bg-muted p-3 rounded-md text-sm">
                  <pre className="whitespace-pre-wrap">
                    Ascalate/Clientes/[Nome do Cliente]/
                    ├── Documentos/
                    ├── Contratos/
                    ├── Relatórios/
                    └── Outros/
                  </pre>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => toast.success("Configurações salvas")}>
                Salvar Configurações
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
      
      {connected && (
        <Card>
          <CardHeader>
            <CardTitle>Gerenciamento de Permissões</CardTitle>
            <CardDescription>
              Configure quem pode acessar os arquivos no OneDrive/SharePoint
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Níveis de Acesso</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-3 p-4">
                      <div className="row-span-3">
                        <h4 className="font-medium leading-none">Permissões</h4>
                        <p className="text-sm text-muted-foreground">
                          Configure os diferentes níveis de acesso para as pastas de clientes.
                        </p>
                      </div>
                      <Separator className="my-1" />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <h4 className="text-sm font-medium">Administrador</h4>
                          <p className="text-xs text-muted-foreground">Acesso completo</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Cliente</h4>
                          <p className="text-xs text-muted-foreground">Acesso limitado</p>
                        </div>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            <div className="bg-muted p-4 rounded-md">
              <p className="font-medium mb-2">Importante sobre Permissões</p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Clientes só têm acesso às suas próprias pastas</li>
                <li>Administradores têm acesso completo a todas as pastas</li>
                <li>As permissões são sincronizadas automaticamente</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OneDriveIntegration;
