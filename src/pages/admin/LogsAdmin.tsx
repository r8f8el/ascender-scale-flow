import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download, Filter, Shield, User, Calendar, Clock, FileUp, Settings, Mail, AlertCircle, Circle } from 'lucide-react';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from '@/hooks/use-toast';

interface SystemLog {
  id: string;
  user_name: string;
  type: string;
  ip_address: string;
  action: string;
  details: string | null;
  level: string;
  created_at: string;
}

const LogsAdmin = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('');
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [dataInicio, setDataInicio] = useState<Date | undefined>(undefined);
  const [dataFim, setDataFim] = useState<Date | undefined>(undefined);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000); // Limitar a 1000 logs mais recentes

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar logs do sistema.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Listas únicas para os filtros
  const tiposUnicos = Array.from(new Set(logs.map(log => log.type))).map(tipo => ({
    valor: tipo,
    nome: getTipoNome(tipo)
  }));

  const niveisUnicos = Array.from(new Set(logs.map(log => log.level))).map(nivel => ({
    valor: nivel,
    nome: getNivelNome(nivel)
  }));

  const usuariosUnicos = Array.from(new Set(logs.map(log => log.user_name))).map(usuario => ({
    valor: usuario
  }));

  // Filtragem dos logs
  const logsFiltrados = logs.filter(log => {
    const correspondeAoTermo = (log.details && log.details.toLowerCase().includes(termoBusca.toLowerCase())) ||
                              log.user_name.toLowerCase().includes(termoBusca.toLowerCase()) ||
                              log.ip_address.toLowerCase().includes(termoBusca.toLowerCase()) ||
                              log.action.toLowerCase().includes(termoBusca.toLowerCase());
    
    const correspondeAoTipo = filtroTipo ? log.type === filtroTipo : true;
    const correspondeAoNivel = filtroNivel ? log.level === filtroNivel : true;
    const correspondeAoUsuario = filtroUsuario ? log.user_name === filtroUsuario : true;
    
    // Filtrar por data
    let correspondeAData = true;
    if (dataInicio) {
      const logDate = new Date(log.created_at);
      correspondeAData = correspondeAData && logDate >= dataInicio;
    }
    if (dataFim) {
      const logDate = new Date(log.created_at);
      correspondeAData = correspondeAData && logDate <= dataFim;
    }
    
    return correspondeAoTermo && 
           correspondeAoTipo && 
           correspondeAoNivel && 
           correspondeAoUsuario &&
           correspondeAData;
  });

  const exportarCSV = () => {
    // Criar cabeçalho do CSV
    let csv = 'ID,Usuário,Tipo,IP,Ação,Detalhes,Nível,Data\n';
    
    // Adicionar dados
    logsFiltrados.forEach(log => {
      const data = new Date(log.created_at).toLocaleString('pt-BR');
      csv += `${log.id},"${log.user_name}","${log.type}","${log.ip_address}","${log.action}","${log.details || ''}","${log.level}","${data}"\n`;
    });
    
    // Criar blob e download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `logs_ascalate_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Sucesso",
      description: "Logs exportados com sucesso!"
    });
  };

  function getTipoNome(tipo: string): string {
    switch (tipo) {
      case 'login': return 'Login';
      case 'logout': return 'Logout';
      case 'file': return 'Arquivo';
      case 'email': return 'E-mail';
      case 'config': return 'Configuração';
      case 'client': return 'Cliente';
      case 'backup': return 'Backup';
      case 'error': return 'Erro';
      case 'ticket': return 'Chamado';
      case 'document': return 'Documento';
      default: return tipo.charAt(0).toUpperCase() + tipo.slice(1);
    }
  }

  function getNivelNome(nivel: string): string {
    switch (nivel) {
      case 'info': return 'Informação';
      case 'warning': return 'Aviso';
      case 'error': return 'Erro';
      case 'alert': return 'Alerta';
      default: return nivel.charAt(0).toUpperCase() + nivel.slice(1);
    }
  }

  function getTipoIcone(tipo: string) {
    switch (tipo) {
      case 'login': 
      case 'logout': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'file': return <FileUp className="h-4 w-4 text-green-500" />;
      case 'email': return <Mail className="h-4 w-4 text-purple-500" />;
      case 'config': return <Settings className="h-4 w-4 text-amber-500" />;
      case 'client': return <User className="h-4 w-4 text-indigo-500" />;
      case 'backup': return <Download className="h-4 w-4 text-teal-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'ticket': return <Calendar className="h-4 w-4 text-orange-500" />;
      case 'document': return <FileUp className="h-4 w-4 text-cyan-500" />;
      default: return <Circle className="h-4 w-4 text-gray-500" />;
    }
  }

  function getNivelClasse(nivel: string): string {
    switch (nivel) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-amber-100 text-amber-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'alert': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  const limparFiltros = () => {
    setTermoBusca('');
    setFiltroTipo('');
    setFiltroNivel('');
    setFiltroUsuario('');
    setDataInicio(undefined);
    setDataFim(undefined);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Carregando logs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Logs de Acesso e Sistema</h2>
        
        <Button onClick={exportarCSV}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Logs
        </Button>
      </div>
      
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros de Busca</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Buscar nos logs..."
                className="pl-9"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
              />
            </div>
            
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os tipos</SelectItem>
                {tiposUnicos.map((tipo, index) => (
                  <SelectItem key={index} value={tipo.valor}>
                    {tipo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filtroNivel} onValueChange={setFiltroNivel}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os níveis</SelectItem>
                {niveisUnicos.map((nivel, index) => (
                  <SelectItem key={index} value={nivel.valor}>
                    {nivel.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filtroUsuario} onValueChange={setFiltroUsuario}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os usuários</SelectItem>
                {usuariosUnicos.map((usuario, index) => (
                  <SelectItem key={index} value={usuario.valor}>
                    {usuario.valor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dataInicio ? format(dataInicio, 'dd/MM/yyyy') : <span>Data Início</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dataInicio}
                    onSelect={setDataInicio}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dataFim ? format(dataFim, 'dd/MM/yyyy') : <span>Data Fim</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dataFim}
                    onSelect={setDataFim}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <Button variant="outline" onClick={limparFiltros} className="h-10">
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabela de logs */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableCaption>Exibindo {logsFiltrados.length} logs de sistema</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Detalhes</TableHead>
                <TableHead>Nível</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logsFiltrados.length > 0 ? (
                logsFiltrados.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.user_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {getTipoIcone(log.type)}
                        <span>{getTipoNome(log.type)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{new Date(log.created_at).toLocaleDateString('pt-BR')}</span>
                        <span className="text-xs text-gray-500">{new Date(log.created_at).toLocaleTimeString('pt-BR')}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{log.ip_address}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell className="max-w-md truncate" title={log.details || ''}>
                      {log.details || '-'}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getNivelClasse(log.level)}`}>
                        {getNivelNome(log.level)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Nenhum log encontrado com os filtros selecionados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogsAdmin;