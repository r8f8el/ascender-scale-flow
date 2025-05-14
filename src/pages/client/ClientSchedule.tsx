
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

// Mock schedule data
const mockScheduleItems = [
  { 
    id: '1',
    phase: 'Planejamento inicial',
    description: 'Revisão de necessidades e definição de escopo',
    startDate: '01/11/2023',
    endDate: '15/11/2023',
    status: 'Concluído',
    responsible: 'Daniel Gomes'
  },
  { 
    id: '2',
    phase: 'Análise financeira',
    description: 'Coleta e análise de dados financeiros',
    startDate: '16/11/2023',
    endDate: '30/11/2023',
    status: 'Concluído',
    responsible: 'Equipe Financeira'
  },
  { 
    id: '3',
    phase: 'Elaboração de relatórios',
    description: 'Criação dos relatórios intermediários',
    startDate: '01/12/2023',
    endDate: '20/12/2023',
    status: 'Em andamento',
    responsible: 'Equipe de Consultoria'
  },
  { 
    id: '4',
    phase: 'Revisão e validação',
    description: 'Revisão conjunta dos relatórios preliminares',
    startDate: '21/12/2023',
    endDate: '05/01/2024',
    status: 'Pendente',
    responsible: 'Daniel Gomes'
  },
  { 
    id: '5',
    phase: 'Entrega final',
    description: 'Apresentação e entrega dos relatórios finais',
    startDate: '10/01/2024',
    endDate: '15/01/2024',
    status: 'Pendente',
    responsible: 'Equipe Completa'
  },
];

const getStatusBadge = (status: string) => {
  switch(status) {
    case 'Concluído':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle size={12} className="mr-1" />
          {status}
        </span>
      );
    case 'Em andamento':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock size={12} className="mr-1" />
          {status}
        </span>
      );
    case 'Pendente':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <AlertCircle size={12} className="mr-1" />
          {status}
        </span>
      );
    default:
      return <span>{status}</span>;
  }
};

const ClientSchedule = () => {
  const { client } = useAuth();
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Cronograma - {client?.name}
        </h1>
        <p className="text-gray-600 mt-1">
          Acompanhe o progresso e as próximas etapas do seu projeto
        </p>
      </div>
      
      <div className="flex items-center gap-2 mb-6">
        <Calendar size={20} className="text-blue-600" />
        <span className="font-medium">Projeto: Consultoria Financeira {client?.name}</span>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Fase</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockScheduleItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.phase}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.startDate} a {item.endDate}</TableCell>
                <TableCell>{item.responsible}</TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
        <h3 className="font-medium text-blue-800 mb-2">Observações:</h3>
        <p className="text-blue-700 text-sm">
          Este cronograma é atualizado regularmente conforme o progresso do projeto.
          Caso tenha dúvidas sobre alguma etapa, utilize a seção de Solicitações para entrar em contato conosco.
        </p>
      </div>
    </div>
  );
};

export default ClientSchedule;
