
import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Chat } from '@/components/Chat';
import ClientTickets from './ClientTickets';
import ClientSchedule from './ClientSchedule';
import ClientTeam from './ClientTeam';
import ClientContact from './ClientContact';
import ClientTicketDetail from './ClientTicketDetail';
import { FileManager } from '@/components/FileManager';
import { 
  LayoutDashboard, 
  Users, 
  Ticket, 
  Calendar, 
  MessageCircle,
  FileText,
  Settings,
  LogOut
} from 'lucide-react';

const ClientArea = () => {
  const { client, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/cliente', icon: LayoutDashboard },
    { name: 'Equipe', href: '/cliente/equipe', icon: Users },
    { name: 'Chamados', href: '/cliente/chamados', icon: Ticket },
    { name: 'Cronograma', href: '/cliente/cronograma', icon: Calendar },
    { name: 'Documentos', href: '/cliente/documentos', icon: FileText },
    { name: 'Contato', href: '/cliente/contato', icon: MessageCircle },
  ];

  const isActive = (href: string) => {
    if (href === '/cliente') {
      return location.pathname === '/cliente';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-primary">Área do Cliente</h1>
              {client && (
                <div className="ml-4 text-sm text-muted-foreground">
                  Bem-vindo, {client.name}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white dark:bg-gray-900 border-r min-h-[calc(100vh-4rem)] p-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} to={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<ClientDashboard />} />
            <Route path="/equipe" element={<ClientTeam />} />
            <Route path="/chamados" element={<ClientTickets />} />
            <Route path="/chamados/:id" element={<ClientTicketDetail />} />
            <Route path="/cronograma" element={<ClientSchedule />} />
            <Route path="/documentos" element={<FileManager />} />
            <Route path="/contato" element={<ClientContact />} />
          </Routes>
        </main>
      </div>

      {/* Chat Widget */}
      <Chat />
    </div>
  );
};

// Dashboard do Cliente
const ClientDashboard = () => {
  const { client } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral da sua conta e atividades
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chamados Abertos</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              +1 desde ontem
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Em andamento
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Arquivos disponíveis
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próxima Reunião</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15:00</div>
            <p className="text-xs text-muted-foreground">
              Hoje
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Novo chamado criado</p>
                  <p className="text-xs text-muted-foreground">2 horas atrás</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Documento aprovado</p>
                  <p className="text-xs text-muted-foreground">1 dia atrás</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-600 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Reunião agendada</p>
                  <p className="text-xs text-muted-foreground">2 dias atrás</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status dos Projetos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Sistema de Gestão</span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Website Corporativo</span>
                  <span>40%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientArea;
