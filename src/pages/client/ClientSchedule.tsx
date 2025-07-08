import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

interface Schedule {
  id: string;
  client_name: string;
  project_title: string;
  phase: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  responsible: string;
  created_at: string;
  updated_at: string;
}

const getStatusBadge = (status: string) => {
  switch(status) {
    case 'completed':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle size={12} className="mr-1" />
          Concluído
        </span>
      );
    case 'in_progress':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock size={12} className="mr-1" />
          Em andamento
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <AlertCircle size={12} className="mr-1" />
          Pendente
        </span>
      );
    default:
      return <span>{status}</span>;
  }
};

const ClientSchedule = () => {
  const { client, user } = useAuth();
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSchedules();
    }
  }, [user]);

  const loadSchedules = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Erro ao carregar cronogramas:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar cronogramas",
          variant: "destructive"
        });
        return;
      }

      setSchedules(data || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Carregando cronograma...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Cronograma - {client?.name || user?.email}
        </h1>
        <p className="text-gray-600 mt-1">
          Acompanhe o progresso e as próximas etapas do seu projeto
        </p>
      </div>
      
      {schedules.length > 0 && (
        <div className="flex items-center gap-2 mb-6">
          <Calendar size={20} className="text-blue-600" />
          <span className="font-medium">Projeto: {schedules[0]?.project_title}</span>
        </div>
      )}
      
      {schedules.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum cronograma encontrado
          </h3>
          <p className="text-gray-500">
            Quando houver atividades programadas para seu projeto, elas aparecerão aqui.
          </p>
        </div>
      ) : (
        <>
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
                {schedules.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.phase}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>
                      {formatDate(item.start_date)} a {formatDate(item.end_date)}
                    </TableCell>
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
        </>
      )}
    </div>
  );
};

export default ClientSchedule;