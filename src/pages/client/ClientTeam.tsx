
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Crown, Mail, Calendar, Shield, AlertCircle } from 'lucide-react';
import { SecureInviteTeamMemberDialog } from '@/components/client/SecureInviteTeamMemberDialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCompanyAccess } from '@/hooks/useCompanyAccess';

const ClientTeam = () => {
  const { data: companyAccess, isLoading: accessLoading } = useCompanyAccess();
  
  const { data: teamMembers, isLoading, refetch } = useQuery({
    queryKey: ['secure-team-members'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      console.log('🔍 Buscando membros da equipe para o usuário:', user.id);
      
      // Buscar o perfil do usuário para obter a empresa
      const { data: profile } = await supabase
        .from('client_profiles')
        .select('company, is_primary_contact')
        .eq('id', user.id)
        .single();

      if (!profile?.company) {
        console.log('⚠️ Usuário não tem empresa definida');
        return [];
      }

      console.log('🏢 Empresa do usuário:', profile.company);

      // Buscar todos os membros da equipe da mesma empresa
      const { data: members, error } = await supabase
        .from('team_members')
        .select(`
          id,
          user_id,
          invited_email,
          name,
          status,
          joined_at,
          created_at,
          hierarchy_level_id,
          hierarchy_levels (
            name,
            level,
            can_approve
          )
        `)
        .eq('company_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar membros:', error);
        throw error;
      }

      console.log('👥 Membros encontrados:', members);
      return members || [];
    },
    enabled: !!companyAccess?.hasCompanyAccess && !accessLoading
  });

  const { data: pendingInvitations } = useQuery({
    queryKey: ['pending-invitations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('team_invitations')
        .select('email, inviter_name, created_at, expires_at')
        .eq('company_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar convites pendentes:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!companyAccess?.hasCompanyAccess && !accessLoading
  });

  if (accessLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!companyAccess?.hasCompanyAccess) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Você precisa estar associado a uma empresa para gerenciar equipes.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: 'Ativo', variant: 'default' as const },
      pending: { label: 'Pendente', variant: 'secondary' as const },
      inactive: { label: 'Inativo', variant: 'destructive' as const }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || 
                      { label: status, variant: 'outline' as const };
    
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            Equipe
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie os membros da sua equipe e convites
          </p>
        </div>
        
        {companyAccess?.profile?.is_primary_contact && (
          <SecureInviteTeamMemberDialog onInviteSuccess={() => refetch()} />
        )}
      </div>

      {/* Alertas de segurança */}
      {companyAccess?.profile?.is_primary_contact && (
        <Alert className="border-blue-200 bg-blue-50">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Sistema de Convites Seguro:</strong> Os convites agora utilizam tokens seguros 
            com validade de 24 horas para garantir máxima segurança.
          </AlertDescription>
        </Alert>
      )}

      {/* Convites Pendentes */}
      {pendingInvitations && pendingInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-orange-500" />
              Convites Pendentes
            </CardTitle>
            <CardDescription>
              Convites enviados que ainda não foram aceitos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingInvitations.map((invitation, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-orange-50">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-orange-100 text-orange-600">
                        <Mail className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <p className="text-sm text-gray-500">
                        Convidado por {invitation.inviter_name} • {new Date(invitation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">Pendente</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Membros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Membros da Equipe
          </CardTitle>
          <CardDescription>
            {teamMembers?.length || 0} membro(s) na equipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : !teamMembers || teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Nenhum membro da equipe encontrado</p>
              {companyAccess?.profile?.is_primary_contact && (
                <p className="text-sm text-gray-400">
                  Use o botão "Convidar Membro" para adicionar pessoas à sua equipe
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{member.name}</h3>
                        {companyAccess?.profile?.is_primary_contact && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{member.invited_email}</p>
                      {member.hierarchy_levels && (
                        <p className="text-xs text-blue-600">
                          {member.hierarchy_levels.name} (Nível {member.hierarchy_levels.level})
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      {getStatusBadge(member.status)}
                      {member.joined_at && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Entrou em {new Date(member.joined_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientTeam;
