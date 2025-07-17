
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, User } from 'lucide-react';

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

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface TicketCardProps {
  ticket: Ticket;
  isSelected: boolean;
  onClick: (ticket: Ticket) => void;
  getStatusDisplay: (statusId: string) => { name: string; color: string };
  getPriorityDisplay: (priorityId: string) => { name: string; color: string };
  getCategoryDisplay: (categoryId: string) => string;
  getAssignedAdmin: (adminId: string | null) => AdminProfile | null;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  isSelected,
  onClick,
  getStatusDisplay,
  getPriorityDisplay,
  getCategoryDisplay,
  getAssignedAdmin
}) => {
  const status = getStatusDisplay(ticket.status_id);
  const priority = getPriorityDisplay(ticket.priority_id);
  const assignedAdmin = getAssignedAdmin(ticket.assigned_to);

  return (
    <Card 
      className={`cursor-pointer overflow-hidden transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => onClick(ticket)}
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
};
