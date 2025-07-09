import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, UserCheck, UserX, Mail, Phone, Building } from 'lucide-react';
import { Collaborator, getRoleLabel } from '@/types/collaborator';

interface CollaboratorCardProps {
  collaborator: Collaborator;
  onEdit: (collaborator: Collaborator) => void;
  onToggleStatus: (collaborator: Collaborator) => void;
}

export const CollaboratorCard: React.FC<CollaboratorCardProps> = ({
  collaborator,
  onEdit,
  onToggleStatus
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
              {collaborator.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <CardTitle className="text-lg">{collaborator.name}</CardTitle>
              <CardDescription>{getRoleLabel(collaborator.role)}</CardDescription>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(collaborator)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleStatus(collaborator)}
            >
              {collaborator.is_active ? (
                <UserX className="h-4 w-4 text-red-500" />
              ) : (
                <UserCheck className="h-4 w-4 text-green-500" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant={collaborator.is_active ? "default" : "secondary"}>
              {collaborator.is_active ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{collaborator.email}</span>
            </div>

            {collaborator.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{collaborator.phone}</span>
              </div>
            )}

            {collaborator.department && (
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{collaborator.department}</span>
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            Criado em {new Date(collaborator.created_at).toLocaleDateString('pt-BR')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};