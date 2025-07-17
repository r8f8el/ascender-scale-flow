
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Check, MessageSquare, Mail } from 'lucide-react';

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

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface TicketDetailsProps {
  ticket: Ticket;
  statuses: TicketStatus[];
  admins: AdminProfile[];
  response: string;
  onResponseChange: (value: string) => void;
  showChat: boolean;
  onToggleChat: () => void;
  onClose: () => void;
  onAssignTicket: (ticketId: string, adminId: string) => void;
  onUpdateStatus: (ticketId: string, statusId: string) => void;
  onAddResponse: () => void;
  getStatusDisplay: (statusId: string) => { name: string; color: string };
  getPriorityDisplay: (priorityId: string) => { name: string; color: string };
  getCategoryDisplay: (categoryId: string) => string;
}

export const TicketDetails: React.FC<TicketDetailsProps> = ({
  ticket,
  statuses,
  admins,
  response,
  onResponseChange,
  showChat,
  onToggleChat,
  onClose,
  onAssignTicket,
  onUpdateStatus,
  onAddResponse,
  getStatusDisplay,
  getPriorityDisplay,
  getCategoryDisplay
}) => {
  const status = getStatusDisplay(ticket.status_id);
  const priority = getPriorityDisplay(ticket.priority_id);

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start">
        <div>
          <CardTitle className="text-lg pr-8">{ticket.title}</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <Badge style={{ backgroundColor: status.color, color: 'white' }}>
              {status.name}
            </Badge>
            <Badge style={{ backgroundColor: priority.color, color: 'white' }}>
              {priority.name}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={showChat ? "default" : "ghost"}
            size="icon"
            onClick={onToggleChat}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
          >
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-6 max-h-[calc(100vh-400px)] overflow-y-auto">
        {!showChat && (
          <>
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Informações do Chamado</h3>
                <span className="text-xs text-gray-500">#{ticket.ticket_number}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-md space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-blue-100 text-blue-800">
                      {ticket.user_name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{ticket.user_name}</p>
                    <p className="text-sm text-gray-500">{ticket.user_email}</p>
                    <p className="text-sm text-gray-500">{ticket.user_phone}</p>
                    <p className="text-xs text-gray-400">
                      Criado em: {new Date(ticket.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Categoria:</p>
                  <p className="text-gray-700">{getCategoryDisplay(ticket.category_id)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Descrição:</p>
                  <p className="text-gray-700">{ticket.description}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Atribuir Responsável</h3>
              <Select 
                value={ticket.assigned_to || ''} 
                onValueChange={(value) => onAssignTicket(ticket.id, value)}
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
                value={ticket.status_id} 
                onValueChange={(value) => onUpdateStatus(ticket.id, value)}
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
                onChange={(e) => onResponseChange(e.target.value)}
                placeholder="Digite sua resposta para o cliente"
                className="min-h-[120px]"
              />
              <Button 
                onClick={onAddResponse}
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
  );
};
