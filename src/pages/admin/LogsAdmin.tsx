import React, { useState } from 'react';
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
import { toast } from 'sonner';

// Dados de exemplo para os logs
const logsIniciais = [
  {
    id: '1',
    usuario: 'Amanda Silva',
    tipo: 'login',
    ip: '189.54.220.165',
    data: '14/05/2025',
    hora: '09:23:45',
    detalhes: 'Login bem-sucedido no painel administrativo',
    nivel: 'info'
  },
  {
    id: '2',
    usuario: 'Ricardo Mendes',
    tipo: 'arquivo',
    ip: '201.17.123.45',
    data: '14/05/2025',
    hora: '10:15:22',
    detalhes: 'Upload de arquivo "Relatório Q1 2025.pdf" para o cliente Portobello',
    nivel: 'info'
  },
  {
    id: '3',
    usuario: 'Sistema Automático',
    tipo: 'email',
    ip: '172.16.254.1',
    data: '14/05/2025',
    hora: '11:30:15',
    detalhes: 'Envio de e-mail automático para cliente J.Assy sobre novo documento disponível',
    nivel: 'info'
  },
  {
    id: '4',
    usuario: 'Admin Ascalate',
    tipo: 'configuracao',
    ip: '189.54.220.170',
    data: '13/05/2025',
    hora: '16:42:11',
    detalhes: 'Alteração nas configurações de segurança do sistema',
    nivel: 'warning'
  },
  {
    id: '5',
    usuario: 'Cliente Portobello',
    tipo: 'login',
    ip: '200.155.87.90',
    data: '13/05/2025',
    hora: '14:25:33',
    detalhes: 'Múltiplas tentativas de login falhas. Conta temporariamente bloqueada.',
    nivel: 'alert'
  },
  {
    id: '6',
    usuario: 'Carla Santos',
    tipo: 'cliente',
    ip: '189.54.220.168',
    data: '12/05/2025',
    hora: '11:05:22',
    detalhes: 'Criação de novo cliente "Ermenegildo Zegna" no sistema',
    nivel: 'info'
  },
  {
    id: '7',
    usuario: 'Sistema',
    tipo: 'backup',
    ip: '172.16.254.1',
    data: '12/05/2025',
    hora: '03:00:00',
    detalhes: 'Backup diário do sistema realizado com sucesso',
    nivel: 'info'
  },
  {
    id: '8',
    usuario: 'Sistema',
    tipo: 'erro',
    ip: '172.16.254.1',
    data: '11/05/2025',
    hora: '22:15:47',
    detalhes: 'Erro ao processar solicitação #458. Falha na conexão com o servidor de e-mail.',
    nivel: 'error'
  },
];

const LogsAdmin = () => {
  const [logs, setLogs] = useState(logsIniciais);
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('');
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [dataInicio, setDataInicio] = useState<Date | undefined>(undefined);
  const [dataFim, setDataFim] = useState<Date | undefined>(undefined);

  // Listas únicas para os filtros
  const tiposUnicos = Array.from(new Set(logs.map(log => log.tipo))).map(tipo => ({
    valor: tipo,
    nome: getTipoNome(tipo)
  }));

  const niveisUnicos = Array.from(new Set(logs.map(log => log.nivel))).map(nivel => ({
    valor: nivel,
    nome: getNivelNome(nivel)
  }));

  const usuariosUnicos = Array.from(new Set(logs.map(log => log.usuario))).map(usuario => ({
    valor: usuario
  }));

  // Filtragem dos logs
  const logsFiltrados = logs.filter(log => {
    const correspondeAoTermo = log.detalhes.toLowerCase().includes(termoBusca.toLowerCase()) ||
                              log.usuario.toLowerCase().includes(termoBusca.toLowerCase()) ||
                              log.ip.toLowerCase().includes(termoBusca.toLowerCase());
    
    const correspondeAoTipo = filtroTipo ? log.tipo === filtroTipo : true;
    const correspondeAoNivel = filtroNivel ? log.nivel === filtroNivel : true;
    const correspondeAoUsuario = filtroUsuario ? log.usuario === filtroUsuario : true;
    
    // Filtrar por data
    let correspondeAData = true;
    if (dataInicio) {
      const dataParts = log.data.split('/');
      const logDate = new Date(parseInt(dataParts[2]), parseInt(dataParts[1]) - 1, parseInt(dataParts[0]));
      correspondeAData = correspondeAData && logDate >= dataInicio;
    }
    if (dataFim) {
      const dataParts = log.data.split('/');
      const logDate = new Date(parseInt(dataParts[2]), parseInt(dataParts[1]) - 1, parseInt(dataParts[0]));
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
    let csv = 'ID,Usuário,Tipo,IP,Data,Hora,Detalhes,Nível\n';
    
    // Adicionar dados
    logsFiltrados.forEach(log => {
      csv += `${log.id},${log.usuario},"${log.tipo}",${log.ip},${log.data},${log.hora},"${log.detalhes}",${log.nivel}\n`;
    });
    
    // Criar blob e download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `logs_ascalate_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast.success('Logs exportados com sucesso');
  };

  function getTipoNome(tipo: string): string {
    switch (tipo) {
      case 'login': return 'Login';
      case 'arquivo': return 'Arquivo';
      case 'email': return 'E-mail';
      case 'configuracao': return 'Configuração';
      case 'cliente': return 'Cliente';
      case 'backup': return 'Backup';
      case 'erro': return 'Erro';
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
      case 'login': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'arquivo': return <FileUp className="h-4 w-4 text-green-500" />;
      case 'email': return <Mail className="h-4 w-4 text-purple-500" />;
      case 'configuracao': return <Settings className="h-4 w-4 text-amber-500" />;
      case 'cliente': return <User className="h-4 w-4 text-indigo-500" />;
      case 'backup': return <Download className="h-4 w-4 text-teal-500" />;
      case 'erro': return <AlertCircle className="h-4 w-4 text-red-500" />;
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Logs de Acesso e Sistema</h2>
        
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
                <TableHead>Detalhes</TableHead>
                <TableHead>Nível</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logsFiltrados.length > 0 ? (
                logsFiltrados.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.usuario}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {getTipoIcone(log.tipo)}
                        <span>{getTipoNome(log.tipo)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{log.data}</span>
                        <span className="text-xs text-gray-500">{log.hora}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{log.ip}</TableCell>
                    <TableCell className="max-w-md truncate" title={log.detalhes}>
                      {log.detalhes}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getNivelClasse(log.nivel)}`}>
                        {getNivelNome(log.nivel)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
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
