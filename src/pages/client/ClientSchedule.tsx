
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Plus, 
  MapPin,
  Users,
  Video
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const ClientSchedule = () => {
  const { user, client } = useAuth();

  // Dados mockados para demonstração
  const events = [
    {
      id: '1',
      title: 'Reunião de Acompanhamento',
      description: 'Revisão mensal dos indicadores financeiros',
      date: '2024-01-20',
      time: '14:00',
      duration: 60,
      type: 'meeting',
      location: 'Sala de Reuniões - Online',
      attendees: ['Rafael Gontijo', 'Daniel Ascalate']
    },
    {
      id: '2',
      title: 'Apresentação de Resultados',
      description: 'Apresentação dos resultados do Q1',
      date: '2024-01-25',
      time: '10:00',
      duration: 90,
      type: 'presentation',
      location: 'Auditório Principal',
      attendees: ['Equipe FP&A', 'Diretoria']
    },
    {
      id: '3',
      title: 'Workshop de Planejamento',
      description: 'Sessão de planejamento estratégico para 2024',
      date: '2024-01-30',
      time: '09:00',
      duration: 240,
      type: 'workshop',
      location: 'Centro de Treinamento',
      attendees: ['Toda a equipe']
    }
  ];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return <Users className="h-5 w-5" />;
      case 'presentation':
        return <Video className="h-5 w-5" />;
      case 'workshop':
        return <Calendar className="h-5 w-5" />;
      default:
        return <Calendar className="h-5 w-5" />;
    }
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'meeting':
        return <Badge className="bg-blue-100 text-blue-700">Reunião</Badge>;
      case 'presentation':
        return <Badge className="bg-green-100 text-green-700">Apresentação</Badge>;
      case 'workshop':
        return <Badge className="bg-purple-100 text-purple-700">Workshop</Badge>;
      default:
        return <Badge variant="outline">Evento</Badge>;
    }
  };

  const handleNewEvent = () => {
    toast.info('Funcionalidade de agendamento em desenvolvimento');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Minha Agenda</h1>
          <p className="text-gray-600 mt-1">
            Acompanhe seus compromissos e reuniões
          </p>
        </div>
        <Button onClick={handleNewEvent}>
          <Plus className="h-4 w-4 mr-2" />
          Agendar Reunião
        </Button>
      </div>

      {/* Visão do Calendário */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário Principal */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Janeiro 2024
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                  const hasEvent = events.some(event => 
                    new Date(event.date).getDate() === day
                  );
                  return (
                    <div 
                      key={day} 
                      className={`p-2 text-center text-sm cursor-pointer rounded-lg hover:bg-gray-100 ${
                        hasEvent ? 'bg-blue-100 text-blue-700 font-medium' : ''
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Próximos Eventos */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Próximos Eventos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {events.slice(0, 3).map((event) => (
                <div key={event.id} className="p-3 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">{event.title}</h4>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                        <Clock className="h-3 w-3" />
                        {new Date(event.date).toLocaleDateString('pt-BR')} às {event.time}
                      </div>
                      {getEventBadge(event.type)}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lista Detalhada de Eventos */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum evento agendado</h3>
                <p className="text-gray-600">
                  Seus próximos compromissos aparecerão aqui
                </p>
              </div>
            ) : (
              events.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gray-100 rounded-lg">
                          {getEventIcon(event.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{event.title}</h3>
                            {getEventBadge(event.type)}
                          </div>
                          <p className="text-gray-600 mb-3">{event.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(event.date).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{event.time} ({event.duration}min)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Users className="h-4 w-4" />
                              <span>Participantes: {event.attendees.join(', ')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientSchedule;
