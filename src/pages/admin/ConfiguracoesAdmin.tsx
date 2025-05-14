
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Save, Upload, Globe, Mail, Bell, Lock, ShieldCheck, PenLine, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { AspectRatio } from '@/components/ui/aspect-ratio';

// Dados de exemplo para as configurações
const configuracoesIniciais = {
  aparencia: {
    logotipo: '/lovable-uploads/eeb91924-4608-4f64-a7b0-1898deababdc.png',
    corPrimaria: '#0056b3',
    corSecundaria: '#003d7f',
    mensagemBemVindo: 'Bem-vindo ao Portal do Cliente Ascalate. Aqui você encontra documentos, cronogramas e pode fazer solicitações diretamente para nossa equipe.',
  },
  emails: {
    smtpServidor: 'smtp.ascalate.com.br',
    smtpPorta: '587',
    smtpUsuario: 'notificacoes@ascalate.com.br',
    remetente: 'Ascalate Consultoria <notificacoes@ascalate.com.br>',
    assinaturaEmail: 'Equipe Ascalate\nConsultoria Especializada\ncontato@ascalate.com.br\n+55 (11) 3456-7890',
  },
  notificacoes: {
    notificarNovoDocumento: true,
    notificarRespostaSolicitacao: true,
    notificarAtualizacaoCronograma: true,
    notificarLoginSuspeito: true,
  },
  dominio: {
    dominioAtual: 'clientes.ascalate.com.br',
    sslAtivo: true,
    redirecionarWWW: true,
    paginaErro404: 'Oops! A página que você está procurando não foi encontrada. Por favor, verifique o URL ou retorne à página inicial.',
  },
  seguranca: {
    tempoSessao: '30',
    tentativasLogin: '5',
    senhaMinima: '8',
    exigirCaracteresEspeciais: true,
    permitirReset: true,
  }
};

const ConfiguracoesAdmin = () => {
  const [configuracoes, setConfiguracoes] = useState(configuracoesIniciais);
  const [tabAtual, setTabAtual] = useState('aparencia');
  const [logoPreview, setLogoPreview] = useState(configuracoes.aparencia.logotipo);

  const handleChange = (categoria: string, campo: string, valor: string | boolean | number) => {
    setConfiguracoes({
      ...configuracoes,
      [categoria]: {
        ...configuracoes[categoria as keyof typeof configuracoes],
        [campo]: valor
      }
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Em uma aplicação real, aqui faria o upload do arquivo
      // Para este exemplo, apenas vamos mostrar o preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        handleChange('aparencia', 'logotipo', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const salvarConfiguracoes = () => {
    // Em uma aplicação real, aqui enviaria para o backend
    toast.success('Configurações salvas com sucesso');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Configurações do Sistema</h2>
        
        <Button onClick={salvarConfiguracoes}>
          <Save className="mr-2 h-4 w-4" />
          Salvar Todas as Configurações
        </Button>
      </div>
      
      <Tabs defaultValue="aparencia" value={tabAtual} onValueChange={setTabAtual}>
        <TabsList className="mb-6 w-full justify-start border-b pb-0 overflow-auto">
          <TabsTrigger value="aparencia" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span>Aparência</span>
          </TabsTrigger>
          <TabsTrigger value="emails" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>E-mails</span>
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="dominio" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>Domínio</span>
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span>Segurança</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="aparencia">
          <Card>
            <CardHeader>
              <CardTitle>Aparência e Marca</CardTitle>
              <CardDescription>
                Configure as informações de marca e aparência do portal do cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="logotipo" className="block mb-2">Logotipo</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="border rounded-md p-2 w-full max-w-md bg-white">
                        <AspectRatio ratio={3/1} className="bg-muted flex items-center justify-center">
                          {logoPreview ? (
                            <img
                              src={logoPreview}
                              alt="Logotipo"
                              className="max-h-full object-contain"
                            />
                          ) : (
                            <div className="text-gray-400">Sem logotipo</div>
                          )}
                        </AspectRatio>
                      </div>
                    
                      <div className="mt-4">
                        <Label htmlFor="logo-upload" className="block text-sm mb-1">
                          Enviar novo logotipo
                        </Label>
                        <div className="flex items-center">
                          <Input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="flex-1"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Tamanho recomendado: 300x100px, formato PNG ou SVG com fundo transparente
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="corPrimaria">Cor Primária</Label>
                        <div className="flex gap-2">
                          <div 
                            className="h-10 w-10 rounded border"
                            style={{backgroundColor: configuracoes.aparencia.corPrimaria}}
                          />
                          <Input
                            id="corPrimaria"
                            type="text"
                            value={configuracoes.aparencia.corPrimaria}
                            onChange={(e) => handleChange('aparencia', 'corPrimaria', e.target.value)}
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="corSecundaria">Cor Secundária</Label>
                        <div className="flex gap-2">
                          <div 
                            className="h-10 w-10 rounded border"
                            style={{backgroundColor: configuracoes.aparencia.corSecundaria}}
                          />
                          <Input
                            id="corSecundaria"
                            type="text"
                            value={configuracoes.aparencia.corSecundaria}
                            onChange={(e) => handleChange('aparencia', 'corSecundaria', e.target.value)}
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mensagemBemVindo">Mensagem de Boas-vindas</Label>
                  <Textarea
                    id="mensagemBemVindo"
                    value={configuracoes.aparencia.mensagemBemVindo}
                    onChange={(e) => handleChange('aparencia', 'mensagemBemVindo', e.target.value)}
                    placeholder="Digite a mensagem de boas-vindas..."
                    rows={4}
                  />
                  <p className="text-xs text-gray-500">
                    Esta mensagem será exibida na página inicial do portal do cliente
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => salvarConfiguracoes()}>Salvar Configurações</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="emails">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de E-mail</CardTitle>
              <CardDescription>
                Configure o servidor de e-mail usado para enviar notificações aos clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtpServidor">Servidor SMTP</Label>
                  <Input
                    id="smtpServidor"
                    value={configuracoes.emails.smtpServidor}
                    onChange={(e) => handleChange('emails', 'smtpServidor', e.target.value)}
                    placeholder="smtp.example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smtpPorta">Porta SMTP</Label>
                  <Input
                    id="smtpPorta"
                    value={configuracoes.emails.smtpPorta}
                    onChange={(e) => handleChange('emails', 'smtpPorta', e.target.value)}
                    placeholder="587"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smtpUsuario">Usuário SMTP</Label>
                  <Input
                    id="smtpUsuario"
                    value={configuracoes.emails.smtpUsuario}
                    onChange={(e) => handleChange('emails', 'smtpUsuario', e.target.value)}
                    placeholder="user@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smtpSenha">Senha SMTP</Label>
                  <Input
                    id="smtpSenha"
                    type="password"
                    placeholder="••••••••••"
                  />
                  <p className="text-xs text-gray-500">
                    Deixe em branco para manter a senha atual
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="remetente">Nome do Remetente</Label>
                  <Input
                    id="remetente"
                    value={configuracoes.emails.remetente}
                    onChange={(e) => handleChange('emails', 'remetente', e.target.value)}
                    placeholder="Empresa <empresa@email.com>"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assinaturaEmail">Assinatura de E-mail</Label>
                <Textarea
                  id="assinaturaEmail"
                  value={configuracoes.emails.assinaturaEmail}
                  onChange={(e) => handleChange('emails', 'assinaturaEmail', e.target.value)}
                  placeholder="Digite a assinatura padrão para e-mails..."
                  rows={4}
                />
              </div>
              
              <div className="mt-6">
                <Button variant="outline">
                  Enviar E-mail de Teste
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => salvarConfiguracoes()}>Salvar Configurações</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>
                Configure quais eventos disparam notificações automáticas para os clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notificarNovoDocumento">Notificar Novo Documento</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar e-mail quando um novo documento for adicionado
                    </p>
                  </div>
                  <Switch
                    id="notificarNovoDocumento"
                    checked={configuracoes.notificacoes.notificarNovoDocumento}
                    onCheckedChange={(checked) => 
                      handleChange('notificacoes', 'notificarNovoDocumento', checked)
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notificarRespostaSolicitacao">Notificar Resposta de Solicitação</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar e-mail quando uma solicitação for respondida
                    </p>
                  </div>
                  <Switch
                    id="notificarRespostaSolicitacao"
                    checked={configuracoes.notificacoes.notificarRespostaSolicitacao}
                    onCheckedChange={(checked) => 
                      handleChange('notificacoes', 'notificarRespostaSolicitacao', checked)
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notificarAtualizacaoCronograma">Notificar Atualização de Cronograma</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar e-mail quando um cronograma for atualizado
                    </p>
                  </div>
                  <Switch
                    id="notificarAtualizacaoCronograma"
                    checked={configuracoes.notificacoes.notificarAtualizacaoCronograma}
                    onCheckedChange={(checked) => 
                      handleChange('notificacoes', 'notificarAtualizacaoCronograma', checked)
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notificarLoginSuspeito">Notificar Login Suspeito</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar e-mail quando houver tentativas de login com falha
                    </p>
                  </div>
                  <Switch
                    id="notificarLoginSuspeito"
                    checked={configuracoes.notificacoes.notificarLoginSuspeito}
                    onCheckedChange={(checked) => 
                      handleChange('notificacoes', 'notificarLoginSuspeito', checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => salvarConfiguracoes()}>Salvar Configurações</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="dominio">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Domínio</CardTitle>
              <CardDescription>
                Configure o domínio e certificado SSL do portal de clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dominioAtual">Domínio Atual</Label>
                  <Input
                    id="dominioAtual"
                    value={configuracoes.dominio.dominioAtual}
                    onChange={(e) => handleChange('dominio', 'dominioAtual', e.target.value)}
                    placeholder="cliente.seudominio.com.br"
                  />
                  <p className="text-xs text-gray-500">
                    Alterações de domínio podem levar até 24h para propagação completa
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sslAtivo">Certificado SSL</Label>
                    <p className="text-sm text-muted-foreground">
                      Habilitar HTTPS com certificado SSL automático
                    </p>
                  </div>
                  <Switch
                    id="sslAtivo"
                    checked={configuracoes.dominio.sslAtivo}
                    onCheckedChange={(checked) => 
                      handleChange('dominio', 'sslAtivo', checked)
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="redirecionarWWW">Redirecionar WWW</Label>
                    <p className="text-sm text-muted-foreground">
                      Redirecionar de www.dominio.com para dominio.com
                    </p>
                  </div>
                  <Switch
                    id="redirecionarWWW"
                    checked={configuracoes.dominio.redirecionarWWW}
                    onCheckedChange={(checked) => 
                      handleChange('dominio', 'redirecionarWWW', checked)
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paginaErro404">Mensagem de Erro 404</Label>
                  <Textarea
                    id="paginaErro404"
                    value={configuracoes.dominio.paginaErro404}
                    onChange={(e) => handleChange('dominio', 'paginaErro404', e.target.value)}
                    placeholder="Página não encontrada..."
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => salvarConfiguracoes()}>Salvar Configurações</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="seguranca">
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>
                Configure as políticas de segurança do portal de clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tempoSessao">Tempo de Sessão (minutos)</Label>
                    <Select 
                      value={configuracoes.seguranca.tempoSessao} 
                      onValueChange={(value) => handleChange('seguranca', 'tempoSessao', value)}
                    >
                      <SelectTrigger id="tempoSessao">
                        <SelectValue placeholder="Selecione o tempo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutos</SelectItem>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="60">1 hora</SelectItem>
                        <SelectItem value="120">2 horas</SelectItem>
                        <SelectItem value="240">4 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tentativasLogin">Tentativas de Login</Label>
                    <Select 
                      value={configuracoes.seguranca.tentativasLogin} 
                      onValueChange={(value) => handleChange('seguranca', 'tentativasLogin', value)}
                    >
                      <SelectTrigger id="tentativasLogin">
                        <SelectValue placeholder="Selecione o número" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 tentativas</SelectItem>
                        <SelectItem value="5">5 tentativas</SelectItem>
                        <SelectItem value="10">10 tentativas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="senhaMinima">Tamanho Mínimo de Senha</Label>
                    <Select 
                      value={configuracoes.seguranca.senhaMinima} 
                      onValueChange={(value) => handleChange('seguranca', 'senhaMinima', value)}
                    >
                      <SelectTrigger id="senhaMinima">
                        <SelectValue placeholder="Selecione o tamanho" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 caracteres</SelectItem>
                        <SelectItem value="8">8 caracteres</SelectItem>
                        <SelectItem value="10">10 caracteres</SelectItem>
                        <SelectItem value="12">12 caracteres</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="exigirCaracteresEspeciais">Exigir Caracteres Especiais</Label>
                    <p className="text-sm text-muted-foreground">
                      Exigir números, símbolos e maiúsculas em senhas
                    </p>
                  </div>
                  <Switch
                    id="exigirCaracteresEspeciais"
                    checked={configuracoes.seguranca.exigirCaracteresEspeciais}
                    onCheckedChange={(checked) => 
                      handleChange('seguranca', 'exigirCaracteresEspeciais', checked)
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="permitirReset">Permitir Reset de Senha</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir que clientes redefinam suas senhas por e-mail
                    </p>
                  </div>
                  <Switch
                    id="permitirReset"
                    checked={configuracoes.seguranca.permitirReset}
                    onCheckedChange={(checked) => 
                      handleChange('seguranca', 'permitirReset', checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => salvarConfiguracoes()}>Salvar Configurações</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfiguracoesAdmin;
