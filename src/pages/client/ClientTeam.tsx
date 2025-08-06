
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
  Calendar,
  MapPin,
  Star,
  MessageSquare,
  User,
  Shield,
  CheckCircle
} from 'lucide-react';

const ClientTeam = () => {
  const [searchTerm, setSearchTerm] = useState('');

  console.log('👥 ClientTeam: Componente carregado');

  // Dados da equipe
  const teamMembers = [
    {
      id: '1',
      name: 'Rafael Gontijo',
      role: 'Consultor Senior FP&A',
      department: 'Análise Financeira',
      email: 'rafael.gontijo@ascalate.com.br',
      phone: '(11) 99999-0001',
      avatar: 'RG',
      status: 'online',
      location: 'São Paulo, SP',
      joinDate: '2023-01-15',
      specialties: ['Modelagem Financeira', 'Análise de Variância', 'Cenários'],
      isLead: true,
      projectsCount: 8,
      clientSatisfaction: 4.9
    },
    {
      id: '2',
      name: 'Daniel Ascalate',
      role: 'Gerente de Projeto',
      department: 'Gestão de Projetos',
      email: 'daniel@ascalate.com.br',
      phone: '(11) 99999-0002',
      avatar: 'DA',
      status: 'busy',
      location: 'São Paulo, SP',
      joinDate: '2022-03-10',
      specialties: ['Gestão Estratégica', 'Liderança de Equipe', 'Processos'],
      isLead: true,
      projectsCount: 15,
      clientSatisfaction: 4.8
    },
    {
      id: '3',
      name: 'Ana Silva',
      role: 'Analista de Dados',
      department: 'Business Intelligence',
      email: 'ana.silva@ascalate.com.br',
      phone: '(11) 99999-0003',
      avatar: 'AS',
      status: 'online',
      location: 'São Paulo, SP',
      joinDate: '2023-06-20',
      specialties: ['Power BI', 'Automação', 'Dashboards'],
      isLead: false,
      projectsCount: 5,
      clientSatisfaction: 4.7
    }
  ];

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-green-100 text-green-700">● Online</Badge>;
      case 'busy':
        return <Badge className="bg-yellow-100 text-yellow-700">● Ocupado</Badge>;
      case 'away':
        return <Badge className="bg-gray-100 text-gray-700">● Ausente</Badge>;
      default:
        return <Badge variant="outline">● Offline</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nossa Equipe</h1>
        <p className="text-gray-600 mt-1">
          Conheça os especialistas dedicados ao seu projeto
        </p>
      </div>

      {/* Estatísticas da Equipe */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total de Membros</p>
                <p className="text-2xl font-bold">{teamMembers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Online Agora</p>
                <p className="text-2xl font-bold">
                  {teamMembers.filter(m => m.status === 'online').length}
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
                <p className="text-sm text-gray-600">Líderes de Projeto</p>
                <p className="text-2xl font-bold">
                  {teamMembers.filter(m => m.isLead).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Satisfação Média</p>
                <p className="text-2xl font-bold">
                  {(teamMembers.reduce((acc, m) => acc + m.clientSatisfaction, 0) / teamMembers.length).toFixed(1)}
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
              placeholder="Buscar por nome, cargo ou departamento..."
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
                  {member.avatar}
                </div>
                
                {/* Informações */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {member.name}
                      {member.isLead && (
                        <Shield className="inline ml-2 h-4 w-4 text-purple-500" />
                      )}
                    </h3>
                    {getStatusBadge(member.status)}
                  </div>
                  
                  <p className="text-blue-600 font-medium mb-1">{member.role}</p>
                  <p className="text-sm text-gray-600 mb-3">{member.department}</p>
                  
                  {/* Contato */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{member.phone}</span>
                    </div>
                  </div>

                  {/* Especialidades */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Especialidades:</p>
                    <div className="flex flex-wrap gap-1">
                      {member.specialties.map((specialty, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contatar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ClientTeam;
