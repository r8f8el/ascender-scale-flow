
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Eye,
  Clock,
  DollarSign,
  User
} from 'lucide-react';
import { ApprovalDetailsModal } from './ApprovalDetailsModal';

interface PendingApproval {
  id: string;
  title: string;
  value: string;
  department: string;
  requester: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
}

export const PendingApprovals = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null);

  const pendingApprovals: PendingApproval[] = [
    {
      id: '1',
      title: 'CAPEX - Sistema ERP',
      value: 'R$ 850.000',
      department: 'TI',
      requester: 'João Silva',
      deadline: '23/08/2025',
      priority: 'high',
      description: 'Implementação de novo sistema ERP para modernização dos processos'
    },
    {
      id: '2',
      title: 'OPEX - Campanha Digital',
      value: 'R$ 120.000',
      department: 'Marketing',
      requester: 'Maria Santos',
      deadline: '25/08/2025',
      priority: 'medium',
      description: 'Campanha de marketing digital para Q4'
    },
    {
      id: '3',
      title: 'Treinamentos Q4',
      value: 'R$ 45.000',
      department: 'RH',
      requester: 'Pedro Costa',
      deadline: '30/08/2025',
      priority: 'low',
      description: 'Programa de treinamentos para o quarto trimestre'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'ALTA PRIORIDADE';
      case 'medium': return 'MÉDIA PRIORIDADE';
      case 'low': return 'NORMAL';
      default: return 'NORMAL';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '🟢';
    }
  };

  const filteredApprovals = pendingApprovals.filter(approval => {
    const matchesSearch = approval.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         approval.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || approval.department === departmentFilter;
    const matchesPriority = priorityFilter === 'all' || approval.priority === priorityFilter;
    
    return matchesSearch && matchesDepartment && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar aprovações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Departamentos</SelectItem>
                <SelectItem value="TI">TI</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="RH">RH</SelectItem>
                <SelectItem value="Financeiro">Financeiro</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Prioridades</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              Mais Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Aprovações */}
      <div className="space-y-4">
        {filteredApprovals.map((approval) => (
          <Card key={approval.id} className={`border-l-4 ${
            approval.priority === 'high' ? 'border-l-red-500' :
            approval.priority === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg">
                      {getPriorityIcon(approval.priority)}
                    </span>
                    <h3 className="text-lg font-semibold">
                      {approval.title}
                    </h3>
                    <Badge className={getPriorityColor(approval.priority)}>
                      {getPriorityLabel(approval.priority)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-600">{approval.value}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span>Solicitante: {approval.requester}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span>Prazo: {approval.deadline}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {approval.department}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="outline" size="sm">
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeitar
                  </Button>
                  <Button variant="outline" size="sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprovar
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setSelectedApproval(approval)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Detalhes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de Detalhes */}
      {selectedApproval && (
        <ApprovalDetailsModal
          approval={selectedApproval}
          open={!!selectedApproval}
          onOpenChange={(open) => !open && setSelectedApproval(null)}
        />
      )}
    </div>
  );
};
