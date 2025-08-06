
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Mail, 
  Phone, 
  Calendar, 
  Award,
  MapPin,
  Briefcase,
  User,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ClientTeam = () => {
  const { client } = useAuth();

  console.log('👥 ClientTeam - Cliente:', client?.name);

  // Dados da equipe com informações completas
  const teamMembers = [
    {
      id: '1',
      name: 'Daniel Ascalate',
      role: 'Gerente de Projeto',
      email: 'daniel@ascalate.com.br',
      phone: '(11) 99999-0001',
      department: 'Gestão',
      joinDate: '2020-01-15',
      specialties: ['Gestão de Projetos', 'Consultoria Estratégica', 'Liderança'],
      status: 'Ativo',
      bio: 'Especialista em gestão de projetos com mais de 8 anos de experiência em consultoria empresarial.',
      availability: 'Disponível'
    },
    {
      id: '2',
      name: 'Rafael Gontijo',
      role: 'Consultor Senior FP&A',
      email: 'rafael.gontijo@ascalate.com.br',
      phone: '(11) 99999-0002',
      department: 'Consultoria Financeira',
      joinDate: '2021-03-20',
      specialties: ['Análise Financeira', 'FP&A', 'Modelagem Financeira', 'Business Intelligence'],
      status: 'Ativo',
      bio: 'Especialista em FP&A com vasta experiência em modelagem financeira e análise de cenários.',
      availability: 'Disponível'
    },
    {
      id: '3',
      name: 'Ana Silva',
      role: 'Analista de Sistemas',
      email: 'ana.silva@ascalate.com.br',
      phone: '(11) 99999-0003',
      department: 'Tecnologia',
      joinDate: '2022-06-10',
      specialties: ['Desenvolvimento Web', 'Integração de Sistemas', 'Automação'],
      status: 'Ativo',
      bio: 'Desenvolvedora fullstack focada em soluções de integração e automação de processos.',
      availability: 'Em reunião'
    },
    {
      id: '4',
      name: 'Carlos Santos',
      role: 'Consultor Financeiro',
      email: 'carlos.santos@ascalate.com.br',
      phone: '(11) 99999-0004',
      department: 'Finanças',
      joinDate: '2023-02-01',
      specialties: ['Planejamento Financeiro', 'Controladoria', 'Análise de Investimentos'],
      status: 'Ativo',
      bio: 'Contador e consultor financeiro especializado em planejamento estratégico e controladoria.',
      availability: 'Disponível'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Ativo':
        return <Badge className="bg-green-100 text-green-700">Ativo</Badge>;
      case 'Férias':
        return <Badge className="bg-blue-100 text-blue-700">Férias</Badge>;
      case 'Ausente':
        return <Badge variant="outline" className="bg-gray-100 text-gray-700">Ausente</Badge>;
      default:
        return <Badge variant="outline">Indefinido</Badge>;
    }
  };

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'Disponível':
        return <Badge className="bg-green-100 text-green-700">● Disponível</Badge>;
      case 'Em reunião':
        return <Badge className="bg-yellow-100 text-yellow-700">● Em reunião</Badge>;
      case 'Ocupado':
        return <Badge className="bg-red-100 text-red-700">● Ocupado</Badge>;
      default:
        return <Badge variant="outline">● Offline</Badge>;
    }
  };

  const calculateExperience = (joinDate: string) => {
    const start = new Date(joinDate);
    const now = new Date();
    const years = now.getFullYear() - start.getFullYear();
    const months = now.getMonth() - start.getMonth();
    
    if (years === 0) {
      return `${Math.max(1, months)} meses`;
    } else if (months < 0) {
      return `${years - 1} anos e ${12 + months} meses`;
    } else {
      return `${years} anos${months > 0 ? ` e ${months} meses` : ''}`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nossa Equipe</h1>
          <p className="text-gray-600 mt-1">
            Conheça os profissionais dedicados ao seu projeto
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-600">Total de membros</p>
          <p className="text-2xl font-bold text-blue-600">{teamMembers.length}</p>
        </div>
      </div>

      {/* Estatísticas da Equipe */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Equipe Ativa</p>
                <p className="text-2xl font-bold">
                  {teamMembers.filter(member => member.status === 'Ativo').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Briefcase className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Departamentos</p>
                <p className="text-2xl font-bold">
                  {new Set(teamMembers.map(member => member.department)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Especialidades</p>
                <p className="text-2xl font-bold">
                  {teamMembers.reduce((acc, member) => acc + member.specialties.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Disponíveis</p>
                <p className="text-2xl font-bold">
                  {teamMembers.filter(m => m.availability === 'Disponível').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Membros da Equipe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teamMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <p className="text-sm text-gray-600 font-medium">{member.role}</p>
                    <div className="flex gap-2 mt-1">
                      {getStatusBadge(member.status)}
                      {getAvailabilityBadge(member.availability)}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bio */}
              <p className="text-sm text-gray-700">{member.bio}</p>
              
              {/* Informações de Contato */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{member.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{member.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{member.department}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">
                    {calculateExperience(member.joinDate)} na empresa
                  </span>
                </div>
              </div>

              {/* Especialidades */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Especialidades:</p>
                <div className="flex flex-wrap gap-1">
                  {member.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => window.location.href = `mailto:${member.email}`}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = `/cliente/chat?member=${member.id}`}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Informações sobre Suporte */}
      <Card>
        <CardHeader>
          <CardTitle>Como Entrar em Contato</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">📧 Email</h4>
              <p className="text-gray-700 text-sm mb-3">
                Para questões gerais, utilize o email da equipe ou entre em contato diretamente 
                com o membro responsável pela sua área.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = 'mailto:suporte@ascalate.com.br'}
              >
                suporte@ascalate.com.br
              </Button>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">🕒 Horário de Atendimento</h4>
              <p className="text-gray-700 text-sm">
                <strong>Segunda a Sexta:</strong> 8h às 18h<br />
                <strong>Sábado:</strong> 9h às 12h<br />
                <strong>Emergências:</strong> 24/7 via chamado
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientTeam;
