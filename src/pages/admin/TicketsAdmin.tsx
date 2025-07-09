import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MessageSquare, Check, User, Calendar, Trash, Mail, UserPlus } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { TicketChat } from '@/components/ticket/TicketChat';

interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  status_id: string;
  priority_id: string;
  category_id: string;
  assigned_to: string | null;
  user_name: string;
  user_email: string;
  user_phone: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
}

interface TicketStatus {
  id: string;
  name: string;
  color: string;
  is_closed: boolean;
}

interface TicketPriority {
  id: string;
  name: string;
  color: string;
  level: number;
}

interface TicketCategory {
  id: string;
  name: string;
  description: string;
}

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

const TicketsAdmin = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [statuses, setStatuses] = useState<TicketStatus[]>([]);
  const [priorities, setPriorities] = useState<TicketPriority[]>([]);
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [admins, setAdmins] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [response, setResponse] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load tickets with joins
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select(`
          *,
          ticket_statuses:status_id(name, color, is_closed),
          ticket_priorities:priority_id(name, color, level),
          ticket_categories:category_id(name, description),
          admin_profiles:assigned_to(name, email)
        `)
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;

      // Load statuses
      const { data: statusesData, error: statusesError } = await supabase
        .from('ticket_statuses')
        .select('*')
        .order('name');

      if (statusesError) throw statusesError;

      // Load priorities
      const { data: prioritiesData, error: prioritiesError } = await supabase
        .from('ticket_priorities')
        .select('*')
        .order('level');

      if (prioritiesError) throw prioritiesError;

      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('ticket_categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;

      // Load admin profiles
      const { data: adminsData, error: adminsError } = await supabase
        .from('admin_profiles')
        .select('*')
        .order('name');

      if (adminsError) throw adminsError;

      setTickets(ticketsData || []);
      setStatuses(statusesData || []);
      setPriorities(prioritiesData || []);
      setCategories(categoriesData || []);
      setAdmins(adminsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter ? ticket.status_id === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });

  const selectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setResponse('');
    setSelectedAssignee(ticket.assigned_to || '');
    setShowChat(false);
  };

  const closeDetails = () => {
    setSelectedTicket(null);
    setResponse('');
    setSelectedAssignee('');
    setShowChat(false);
  };

  const assignTicket = async (ticketId: string, adminId: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ 
          assigned_to: adminId,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) throw error;

      // Update local state
      setTickets(prev => prev.map(t => 
        t.id === ticketId 
          ? { ...t, assigned_to: adminId }
          : t
      ));

      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, assigned_to: adminId });
      }

      toast.success('Chamado atribuído com sucesso');
    } catch (error) {
      console.error('Error assigning ticket:', error);
      toast.error('Erro ao atribuir chamado');
    }
  };

  const updateTicketStatus = async (ticketId: string, statusId: string) => {
    try {
      const status = statuses.find(s => s.id === statusId);
      const updateData: any = { 
        status_id: statusId,
        updated_at: new Date().toISOString()
      };

      // If marking as resolved/closed, set timestamps
      if (status?.is_closed) {
        updateData.resolved_at = new Date().toISOString();
        updateData.closed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tickets')
        .update(updateData)
        .eq('id', ticketId);

      if (error) throw error;

      // Update local state
      setTickets(prev => prev.map(t => 
        t.id === ticketId 
          ? { ...t, ...updateData }
          : t
      ));

      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, ...updateData });
      }

      toast.success('Status do chamado atualizado');
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const addResponse = async () => {
    if (!selectedTicket || !response.trim()) {
      toast.error('Digite uma resposta');
      return;
    }

    try {
      const { error } = await supabase
        .from('ticket_responses')
        .insert({
          ticket_id: selectedTicket.id,
          admin_id: (await supabase.auth.getUser()).data.user?.id,
          message: response.trim(),
          is_internal_note: false
        });

      if (error) throw error;

      setResponse('');
      toast.success('Resposta adicionada com sucesso');
    } catch (error) {
      console.error('Error adding response:', error);
      toast.error('Erro ao adicionar resposta');
    }
  };

  const getStatusDisplay = (statusId: string) => {
    const status = statuses.find(s => s.id === statusId);
    return status ? { name: status.name, color: status.color } : { name: 'N/A', color: '#gray' };
  };

  const getPriorityDisplay = (priorityId: string) => {
    const priority = priorities.find(p => p.id === priorityId);
    return priority ? { name: priority.name, color: priority.color } : { name: 'N/A', color: '#gray' };
  };

  const getCategoryDisplay = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'N/A';
  };

  const getAssignedAdmin = (adminId: string | null) => {
    if (!adminId) return null;
    return admins.find(a => a.id === adminId);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando chamados...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Gestão de Chamados</h2>
        <Button onClick={loadData}>
          Atualizar
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative grow max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Buscar chamados..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os status</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status.id} value={status.id}>
                {status.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de chamados */}
        <div className={`lg:col-span-${selectedTicket ? '1' : '3'} space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2`}>
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => {
              const status = getStatusDisplay(ticket.status_id);
              const priority = getPriorityDisplay(ticket.priority_id);
              const assignedAdmin = getAssignedAdmin(ticket.assigned_to);
              
              return (
                <Card 
                  key={ticket.id}
                  className={`cursor-pointer overflow-hidden transition-all hover:shadow-md ${
                    selectedTicket?.id === ticket.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => selectTicket(ticket)}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{ticket.title}</CardTitle>
                        <CardDescription>{ticket.user_name} • {ticket.ticket_number}</CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge style={{ backgroundColor: status.color, color: 'white' }}>
                          {status.name}
                        </Badge>
                        <Badge style={{ backgroundColor: priority.color, color: 'white' }}>
                          {priority.name}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <p className="text-gray-600 text-sm truncate">
                      {ticket.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Categoria: {getCategoryDisplay(ticket.category_id)}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(ticket.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    {assignedAdmin ? (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{assignedAdmin.name}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span className="text-amber-600">Não atribuído</span>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <MessageSquare className="h-12 w-12 mb-4 text-gray-400" />
              <h3 className="text-lg font-medium">Nenhum chamado encontrado</h3>
              <p className="text-sm mt-2">
                Ajuste seus filtros de busca para encontrar os chamados desejados.
              </p>
            </div>
          )}
        </div>

        {/* Detalhes do chamado */}
        {selectedTicket && (
          <div className="lg:col-span-2">
            <Card className="h-full overflow-hidden">
              <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start">
                <div>
                  <CardTitle className="text-lg pr-8">{selectedTicket.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge style={{ backgroundColor: getStatusDisplay(selectedTicket.status_id).color, color: 'white' }}>
                      {getStatusDisplay(selectedTicket.status_id).name}
                    </Badge>
                    <Badge style={{ backgroundColor: getPriorityDisplay(selectedTicket.priority_id).color, color: 'white' }}>
                      {getPriorityDisplay(selectedTicket.priority_id).name}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={showChat ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setShowChat(!showChat)}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={closeDetails}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-6 max-h-[calc(100vh-400px)] overflow-y-auto">
                {showChat ? (
                  <TicketChat 
                    ticketId={selectedTicket.id} 
                    isTicketClosed={getStatusDisplay(selectedTicket.status_id).name.toLowerCase().includes('fechado')}
                  />
                ) : (
                  <>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium">Informações do Chamado</h3>
                        <span className="text-xs text-gray-500">#{selectedTicket.ticket_number}</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md space-y-3">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-blue-100 text-blue-800">
                              {selectedTicket.user_name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{selectedTicket.user_name}</p>
                            <p className="text-sm text-gray-500">{selectedTicket.user_email}</p>
                            <p className="text-sm text-gray-500">{selectedTicket.user_phone}</p>
                            <p className="text-xs text-gray-400">
                              Criado em: {new Date(selectedTicket.created_at).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Categoria:</p>
                          <p className="text-gray-700">{getCategoryDisplay(selectedTicket.category_id)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Descrição:</p>
                          <p className="text-gray-700">{selectedTicket.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Atribuir Responsável</h3>
                      <Select 
                        value={selectedTicket.assigned_to || selectedAssignee} 
                        onValueChange={(value) => assignTicket(selectedTicket.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar responsável" />
                        </SelectTrigger>
                        <SelectContent>
                          {admins.map((admin) => (
                            <SelectItem key={admin.id} value={admin.id}>
                              {admin.name} ({admin.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Status do Chamado</h3>
                      <Select 
                        value={selectedTicket.status_id} 
                        onValueChange={(value) => updateTicketStatus(selectedTicket.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((status) => (
                            <SelectItem key={status.id} value={status.id}>
                              {status.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Adicionar Resposta</h3>
                      <Textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Digite sua resposta para o cliente"
                        className="min-h-[120px]"
                      />
                      <Button 
                        onClick={addResponse}
                        disabled={!response.trim()}
                        className="w-full"
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Enviar Resposta
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketsAdmin;