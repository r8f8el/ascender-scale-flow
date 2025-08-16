
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Mail, 
  Phone,
  Shield,
  CheckCircle,
  Clock,
  UserPlus
} from 'lucide-react';
import { useTeamMembers, useCompanyTeamMembers } from '@/hooks/useTeamMembers';
import { TeamInviteDialog } from '@/components/client/TeamInviteDialog';

const ClientTeam = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: teamMembers = [], isLoading: teamLoading } = useTeamMembers();
  const { data: companyMembers = [], isLoading: companyLoading } = useCompanyTeamMembers();

  // Combinar dados de membros da empresa com dados de convites da equipe
  const allTeamData = companyMembers.map(member => {
    const teamMemberData = teamMembers.find(tm => tm.user_id === member.id);
    return {
      ...member,
      status: teamMemberData?.status || 'active',
      hierarchy_level: member.hierarchy_levels || { name: 'Sem nível', level: 99, can_approve: false }
    };
  });

  // Adicionar convites pendentes que ainda não têm user_id
  const pendingInvites = teamMembers.filter(tm => !tm.user_id);
  
  const combinedTeamData = [
    ...allTeamData,
    ...pendingInvites.map(invite => ({
      id: invite.id,
      name: invite.name,
      email: invite.invited_email,
      status: invite.status,
      hierarchy_level: invite.hierarchy_levels || { name: 'Sem nível', level: 99, can_approve: false },
      invited_at: invite.invited_at
    }))
  ];

  const filteredMembers = combinedTeamData.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.hierarchy_level.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Ativo</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="text-gray-500">Inativo</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Ativo</Badge>;
    }
  };

  const isLoading = teamLoading || companyLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nossa Equipe</h1>
          <p className="text-gray-600 mt-1">
            Gerencie os membros da sua equipe e convide novos colaboradores
          </p>
        </div>
        
        <TeamInviteDialog />
      </div>

      {/* Estatísticas da Equipe */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total de Membros</p>
                <p className="text-2xl font-bold">{combinedTeamData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Membros Ativos</p>
                <p className="text-2xl font-bold">
                  {combinedTeamData.filter(m => m.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Convites Pendentes</p>
                <p className="text-2xl font-bold">
                  {combinedTeamData.filter(m => m.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Podem Aprovar</p>
                <p className="text-2xl font-bold">
                  {combinedTeamData.filter(m => m.hierarchy_level.can_approve).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Membros da Equipe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, email ou cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista da Equipe */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                
                {/* Informações */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {member.name}
                    </h3>
                    {getStatusBadge(member.status)}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-purple-500" />
                    <span className="text-purple-600 font-medium">{member.hierarchy_level.name}</span>
                    {member.hierarchy_level.can_approve && (
                      <Badge variant="secondary" className="text-xs">Pode Aprovar</Badge>
                    )}
                  </div>
                  
                  {/* Contato */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  </div>

                  {/* Status específico para convites pendentes */}
                  {member.status === 'pending' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-3">
                      <p className="text-sm text-yellow-800">
                        <Clock className="h-4 w-4 inline mr-1" />
                        Convite enviado - aguardando confirmação
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum membro encontrado</h3>
            <p className="text-gray-600 mb-4">
              {combinedTeamData.length === 0 
                ? "Sua equipe ainda não tem membros. Comece convidando colaboradores!"
                : "Nenhum membro corresponde aos filtros aplicados."
              }
            </p>
            {combinedTeamData.length === 0 && (
              <TeamInviteDialog 
                trigger={
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Convidar Primeiro Membro
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientTeam;
