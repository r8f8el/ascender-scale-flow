
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Eye, Edit, Trash2, Clock, User } from 'lucide-react';
import { AvatarInitials } from '@/components/ui/avatar-initials';

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
  created_at: string;
  updated_at: string;
}

interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ModernTicketsTableProps {
  tickets: Ticket[];
  onTicketSelect: (ticket: Ticket) => void;
  getStatusDisplay: (statusId: string) => { name: string; color: string };
  getPriorityDisplay: (priorityId: string) => { name: string; color: string };
  getCategoryDisplay: (categoryId: string) => string;
  getAssignedAdmin: (adminId: string | null) => AdminProfile | null;
}

export const ModernTicketsTable: React.FC<ModernTicketsTableProps> = ({
  tickets,
  onTicketSelect,
  getStatusDisplay,
  getPriorityDisplay,
  getCategoryDisplay,
  getAssignedAdmin
}) => {
  const getStatusVariant = (statusName: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (statusName.toLowerCase()) {
      case 'resolvido':
      case 'fechado':
        return 'default';
      case 'aberto':
      case 'novo':
        return 'destructive';
      case 'em andamento':
      case 'em progresso':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getPriorityVariant = (priorityName: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (priorityName.toLowerCase()) {
      case 'alta':
      case 'crítica':
        return 'destructive';
      case 'média':
        return 'secondary';
      case 'baixa':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="h-5 w-5 bg-primary rounded-full" />
          Tickets do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Assunto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="w-[70px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => {
                const status = getStatusDisplay(ticket.status_id);
                const priority = getPriorityDisplay(ticket.priority_id);
                const assignedAdmin = getAssignedAdmin(ticket.assigned_to);

                return (
                  <TableRow 
                    key={ticket.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => onTicketSelect(ticket)}
                  >
                    <TableCell className="font-mono text-sm">
                      #{ticket.ticket_number}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            <AvatarInitials name={ticket.user_name} />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{ticket.user_name}</div>
                          <div className="text-xs text-muted-foreground">{ticket.user_email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <div className="font-medium truncate">{ticket.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{ticket.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(status.name)}>
                        {status.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityVariant(priority.name)}>
                        {priority.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{getCategoryDisplay(ticket.category_id)}</span>
                    </TableCell>
                    <TableCell>
                      {assignedAdmin ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              <AvatarInitials name={assignedAdmin.name} />
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{assignedAdmin.name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span className="text-xs">Não atribuído</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {tickets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Nenhum ticket encontrado</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Não há tickets para exibir no momento.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
