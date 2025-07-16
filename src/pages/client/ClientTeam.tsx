import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Calendar,
  Shield,
  Trash2,
  Send,
  Clock
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface TeamMember {
  id: string;
  member_id: string;
  role: string;
  status: string;
  invited_at: string;
  user_email?: string;
  user_name?: string;
}

const ClientTeam = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { client, user } = useAuth();
  const { logPageAccess, logUserAction, logDataOperation } = useActivityLogger();

  useEffect(() => {
    if (client?.id) {
      fetchTeamMembers();
      logPageAccess('Gestão de Equipe');
    }
  }, [client?.id]);

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      
      // Fetch team members from company_teams table
      const { data: teamData, error } = await supabase
        .from('company_teams')
        .select(`
          id,
          member_id,
          role,
          status,
          invited_at,
          client_profiles!inner(
            name,
            email
          )
        `)
        .eq('company_id', client?.id);

      if (error) throw error;

      // Add primary contact (current user) to the list
      const teamWithPrimary = [
        {
          id: 'primary',
          member_id: user?.id || '',
          role: 'admin',
          status: 'active',
          invited_at: new Date().toISOString(),
          user_email: client?.email || '',
          user_name: client?.name || ''
        },
        ...(teamData || []).map((member: any) => ({
          id: member.id,
          member_id: member.member_id || '',
          role: member.role,
          status: member.status,
          invited_at: member.invited_at,
          user_email: member.client_profiles?.email || '',
          user_name: member.client_profiles?.name || ''
        }))
      ];

      setTeamMembers(teamWithPrimary);
    } catch (error) {
      console.error('Error fetching team members:', error);
      // Show primary contact only if there's an error
      setTeamMembers([{
        id: 'primary',
        member_id: user?.id || '',
        role: 'admin',
        status: 'active',
        invited_at: new Date().toISOString(),
        user_email: client?.email || '',
        user_name: client?.name || ''
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteEmail || !inviteEmail.includes('@')) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
        variant: "destructive"
      });
      return;
    }

    if (!client?.id) {
      toast({
        title: "Erro",
        description: "Informações da empresa não encontradas.",
        variant: "destructive"
      });
      return;
    }

    setIsInviting(true);

    try {
      // Call the Supabase invite function
      const { data, error } = await supabase.rpc('invite_team_member', {
        p_email: inviteEmail,
        p_company_id: client.id
      });

      if (error) throw error;

      toast({
        title: "Convite enviado!",
        description: `Convite enviado para ${inviteEmail}. O membro receberá instruções para acessar a plataforma.`
      });

      setInviteEmail('');
      setIsDialogOpen(false);
      fetchTeamMembers();

    } catch (error: any) {
      console.error('Error inviting member:', error);
      toast({
        title: "Erro ao enviar convite",
        description: error.message || "Verifique se você é o contato principal da empresa e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('company_teams')
        .delete()
        .eq('id', memberId);

      if (error) {
        console.error('Error removing member:', error);
        toast({
          title: "Erro",
          description: "Não foi possível remover o membro da equipe.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Membro removido",
        description: "Membro removido da equipe com sucesso."
      });

      fetchTeamMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao remover membro.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive">Administrador</Badge>;
      case 'member':
        return <Badge variant="outline">Membro</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Gerenciar Equipe</h1>
            <p className="text-muted-foreground">
              Convide e gerencie membros da sua equipe
            </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4" />
              <span>Convidar Membro</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Convidar Novo Membro</DialogTitle>
              <DialogDescription>
                Digite o email da pessoa que você deseja convidar para sua equipe.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInviteMember} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="invite-email" className="text-sm font-medium">
                  Email do convidado
                </label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="funcionario@empresa.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isInviting}>
                  {isInviting ? (
                    <>
                      <Send className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Convite
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Membros</p>
                <p className="text-2xl font-bold">
                  {teamMembers.filter(m => m.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Convites Pendentes</p>
                <p className="text-2xl font-bold">
                  {teamMembers.filter(m => m.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Administradores</p>
                <p className="text-2xl font-bold">
                  {teamMembers.filter(m => m.role === 'admin' && m.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Membros da Equipe</CardTitle>
          <CardDescription>
            Lista de todos os membros da sua equipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando membros da equipe...</p>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Nenhum membro na equipe ainda
              </p>
              <p className="text-sm text-muted-foreground">
                Comece convidando o primeiro membro da sua equipe
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                   <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {member.user_name || 'Nome não disponível'}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {member.user_email || 'Email não disponível'}
                      </div>
                      <div className="flex items-center space-x-2 mt-1 flex-wrap">
                        {getStatusBadge(member.status)}
                        {getRoleBadge(member.role)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Convidado em</p>
                      <p>{new Date(member.invited_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                    
                    {member.status === 'pending' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover Convite</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover este convite? O usuário não poderá mais aceitar o convite.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleRemoveMember(member.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
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