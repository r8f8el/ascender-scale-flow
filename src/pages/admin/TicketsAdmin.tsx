
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TicketChat } from '@/components/ticket/TicketChat';
import { TicketFilters } from '@/components/admin/tickets/TicketFilters';
import { TicketCard } from '@/components/admin/tickets/TicketCard';
import { TicketDetails } from '@/components/admin/tickets/TicketDetails';
import { EmptyTicketState } from '@/components/admin/tickets/EmptyTicketState';
import { useTicketData } from '@/hooks/useTicketData';
import { useTicketActions } from '@/hooks/useTicketActions';

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

const TicketsAdmin = () => {
  const {
    tickets,
    statuses,
    priorities,
    categories,
    admins,
    loading,
    setTickets,
    loadData
  } = useTicketData();

  const { assignTicket, updateTicketStatus, addResponse } = useTicketActions(tickets, setTickets, statuses);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [response, setResponse] = useState('');
  const [showChat, setShowChat] = useState(false);

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

  const handleAssignTicket = async (ticketId: string, adminId: string) => {
    const success = await assignTicket(ticketId, adminId);
    if (success && selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, assigned_to: adminId });
    }
  };

  const handleUpdateStatus = async (ticketId: string, statusId: string) => {
    const status = statuses.find(s => s.id === statusId);
    const success = await updateTicketStatus(ticketId, statusId);
    if (success && selectedTicket && selectedTicket.id === ticketId) {
      const updateData: any = { ...selectedTicket, status_id: statusId };
      if (status?.is_closed) {
        updateData.resolved_at = new Date().toISOString();
        updateData.closed_at = new Date().toISOString();
      }
      setSelectedTicket(updateData);
    }
  };

  const handleAddResponse = async () => {
    if (!selectedTicket) return;
    
    const success = await addResponse(selectedTicket.id, response);
    if (success) {
      setResponse('');
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
    return admins.find(a => a.id === adminId) || null;
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

      <TicketFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statuses={statuses}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-${selectedTicket ? '1' : '3'} space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2`}>
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                isSelected={selectedTicket?.id === ticket.id}
                onClick={selectTicket}
                getStatusDisplay={getStatusDisplay}
                getPriorityDisplay={getPriorityDisplay}
                getCategoryDisplay={getCategoryDisplay}
                getAssignedAdmin={getAssignedAdmin}
              />
            ))
          ) : (
            <EmptyTicketState />
          )}
        </div>

        {selectedTicket && (
          <div className="lg:col-span-2">
            {showChat ? (
              <TicketChat 
                ticketId={selectedTicket.id} 
                isTicketClosed={getStatusDisplay(selectedTicket.status_id).name.toLowerCase().includes('fechado')}
              />
            ) : (
              <TicketDetails
                ticket={selectedTicket}
                statuses={statuses}
                admins={admins}
                response={response}
                onResponseChange={setResponse}
                showChat={showChat}
                onToggleChat={() => setShowChat(!showChat)}
                onClose={closeDetails}
                onAssignTicket={handleAssignTicket}
                onUpdateStatus={handleUpdateStatus}
                onAddResponse={handleAddResponse}
                getStatusDisplay={getStatusDisplay}
                getPriorityDisplay={getPriorityDisplay}
                getCategoryDisplay={getCategoryDisplay}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketsAdmin;
