
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, Calendar, User, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FiltrosAprovacaoDialogProps {
  children: React.ReactNode;
  onApplyFilters: (filters: FiltrosSolicitacao) => void;
  currentFilters: FiltrosSolicitacao;
}

interface FiltrosSolicitacao {
  status: string;
  periodo: string;
  solicitante: string;
  dataInicio: string;
  dataFim: string;
}

export const FiltrosAprovacaoDialog: React.FC<FiltrosAprovacaoDialogProps> = ({ 
  children, 
  onApplyFilters, 
  currentFilters 
}) => {
  const [filtros, setFiltros] = useState<FiltrosSolicitacao>(currentFilters);

  const statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'Em Elaboração', label: 'Em Elaboração' },
    { value: 'Pendente', label: 'Pendente' },
    { value: 'Aprovado', label: 'Aprovado' },
    { value: 'Rejeitado', label: 'Rejeitado' },
    { value: 'Requer Ajuste', label: 'Requer Ajuste' }
  ];

  const periodoOptions = [
    { value: '', label: 'Todos os períodos' },
    { value: 'hoje', label: 'Hoje' },
    { value: 'semana', label: 'Esta semana' },
    { value: 'mes', label: 'Este mês' },
    { value: 'trimestre', label: 'Este trimestre' },
    { value: 'ano', label: 'Este ano' }
  ];

  const aplicarFiltros = () => {
    onApplyFilters(filtros);
  };

  const limparFiltros = () => {
    const filtrosVazios: FiltrosSolicitacao = {
      status: '',
      periodo: '',
      solicitante: '',
      dataInicio: '',
      dataFim: ''
    };
    setFiltros(filtrosVazios);
    onApplyFilters(filtrosVazios);
  };

  const contarFiltrosAtivos = () => {
    return Object.values(filtros).filter(value => value !== '').length;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros Avançados
            {contarFiltrosAtivos() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {contarFiltrosAtivos()} ativo(s)
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Status da Solicitação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={filtros.status} 
                onValueChange={(value) => setFiltros({...filtros, status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Período */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Período
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select 
                value={filtros.periodo} 
                onValueChange={(value) => setFiltros({...filtros, periodo: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  {periodoOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataInicio">Data Início</Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={filtros.dataInicio}
                    onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="dataFim">Data Fim</Label>
                  <Input
                    id="dataFim"
                    type="date"
                    value={filtros.dataFim}
                    onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Solicitante */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                <User className="h-4 w-4 mr-2" />
                Solicitante
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Nome ou email do solicitante"
                value={filtros.solicitante}
                onChange={(e) => setFiltros({...filtros, solicitante: e.target.value})}
              />
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={limparFiltros}>
              Limpar Filtros
            </Button>
            <div className="flex gap-3">
              <Button variant="outline">Cancelar</Button>
              <Button onClick={aplicarFiltros}>
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
