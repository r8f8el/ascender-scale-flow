import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MessageSquare, Calendar, User, Clock } from 'lucide-react';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { TicketChat } from '@/components/ticket/TicketChat';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  status_id: string;
  priority_id: string;
  category_id: string;
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

const MyTickets = () => {
  const { admin } = useAdminAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [statuses, setStatuses] = useState<TicketStatus[]>([]);
  const [priorities, setPriorities] = useState<TicketPriority[]>([]);
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [response, setResponse] = useState('');
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (admin) {
      loadMyTickets();
      loadStatuses();
      loadPriorities();
      loadCategories();
    }
  }, [admin]);

  const loadMyTickets = async () => {
    if (!admin) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('assigned_to', admin.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error loading my tickets:', error);
      toast.error('Erro ao carregar meus chamados');
    } finally {
      setLoading(false);
    }
  };

  const loadStatuses = async () => {
    try {
      const { data, error } = await supabase
        .from('ticket_statuses')
        .select('*')
        .order('name');

      if (error) throw error;
      setStatuses(data || []);
    } catch (error) {
      console.error('Error loading statuses:', error);
    }
  };

  const loadPriorities = async () => {
    try {
      const { data, error } = await supabase
        .from('ticket_priorities')
        .select('*')
        .order('level');

      if (error) throw error;
      setPriorities(data || []);
    } catch (error) {
      console.error('Error loading priorities:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('ticket_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
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
    setShowChat(false);
  };

  const closeDetails = () => {
    setSelectedTicket(null);
    setResponse('');
    setShowChat(false);
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
    if (!selectedTicket || !response.trim() || !admin) {
      toast.error('Digite uma resposta');
      return;
    }

    try {
      const { error } = await supabase
        .from('ticket_responses')
        .insert({
          ticket_id: selectedTicket.id,
          admin_id: admin.id,
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
    return status ? { name: status.name, color: status.color, is_closed: status.is_closed } : { name: 'N/A', color: '#gray', is_closed: false };
  };

  const getPriorityDisplay = (priorityId: string) => {
    const priority = priorities.find(p => p.id === priorityId);
    return priority ? { name: priority.name, color: priority.color } : { name: 'N/A', color: '#gray' };
  };

  const getCategoryDisplay = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'N/A';
  };

  // Separate tickets by status
  const openTickets = filteredTickets.filter(ticket => !getStatusDisplay(ticket.status_id).is_closed);
  const closedTickets = filteredTickets.filter(ticket => getStatusDisplay(ticket.status_id).is_closed);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando meus chamados...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-medium">Meus Chamados</h2>
          <p className="text-sm text-gray-600">Chamados atribuídos para você</p>
        </div>
        <Button onClick={loadMyTickets}>
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

      <Tabs defaultValue="open" className="w-full">
        <TabsList>
          <TabsTrigger value="open">
            Abertos ({openTickets.length})
          </TabsTrigger>
          <TabsTrigger value="closed">
            Fechados ({closedTickets.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="open" className="space-y-4">
          <TicketList 
            tickets={openTickets}
            onSelectTicket={selectTicket}
            selectedTicket={selectedTicket}
            getStatusDisplay={getStatusDisplay}
            getPriorityDisplay={getPriorityDisplay}
            getCategoryDisplay={getCategoryDisplay}
          />
        </TabsContent>
        
        <TabsContent value="closed" className="space-y-4">
          <TicketList 
            tickets={closedTickets}
            onSelectTicket={selectTicket}
            selectedTicket={selectedTicket}
            getStatusDisplay={getStatusDisplay}
            getPriorityDisplay={getPriorityDisplay}
            getCategoryDisplay={getCategoryDisplay}
          />
        </TabsContent>
      </Tabs>
      
      {/* Detalhes do chamado */}
      {selectedTicket && (
        <Card className="mt-6">
          <CardHeader className="flex flex-row justify-between items-start">
            <div>
              <CardTitle className="text-lg">{selectedTicket.title}</CardTitle>
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
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {showChat ? (
              <TicketChat 
                ticketId={selectedTicket.id} 
                isTicketClosed={getStatusDisplay(selectedTicket.status_id).is_closed}
              />
            ) : (
              <>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar>
                      <AvatarFallback className="bg-blue-100 text-blue-800">
                        {selectedTicket.user_name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedTicket.user_name}</p>
                      <p className="text-sm text-gray-500">{selectedTicket.user_email}</p>
                      <p className="text-sm text-gray-500">{selectedTicket.user_phone}</p>
                      <p className="text-xs text-gray-400">#{selectedTicket.ticket_number}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-medium">Categoria:</span> {getCategoryDisplay(selectedTicket.category_id)}</p>
                    <p className="text-sm"><span className="font-medium">Criado em:</span> {new Date(selectedTicket.created_at).toLocaleString('pt-BR')}</p>
                    <div>
                      <p className="text-sm font-medium mb-1">Descrição:</p>
                      <p className="text-gray-700">{selectedTicket.description}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Atualizar Status</h3>
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
                    Enviar Resposta
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface TicketListProps {
  tickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
  selectedTicket: Ticket | null;
  getStatusDisplay: (statusId: string) => { name: string; color: string; is_closed: boolean };
  getPriorityDisplay: (priorityId: string) => { name: string; color: string };
  getCategoryDisplay: (categoryId: string) => string;
}

const TicketList: React.FC<TicketListProps> = ({
  tickets,
  onSelectTicket,
  selectedTicket,
  getStatusDisplay,
  getPriorityDisplay,
  getCategoryDisplay
}) => {
  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <MessageSquare className="h-12 w-12 mb-4 text-gray-400" />
        <h3 className="text-lg font-medium">Nenhum chamado encontrado</h3>
        <p className="text-sm mt-2">
          Não há chamados nesta categoria no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {tickets.map((ticket) => {
        const status = getStatusDisplay(ticket.status_id);
        const priority = getPriorityDisplay(ticket.priority_id);
        
        return (
          <Card 
            key={ticket.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTicket?.id === ticket.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => onSelectTicket(ticket)}
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{ticket.title}</CardTitle>
                  <CardDescription>
                    {ticket.user_name} • #{ticket.ticket_number}
                  </CardDescription>
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
              {ticket.updated_at !== ticket.created_at && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Atualizado: {new Date(ticket.updated_at).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default MyTickets;