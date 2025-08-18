
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

const NotificationStatus = () => {
  const { data: notifications = [] } = useNotifications();

  const recentNotifications = notifications.slice(0, 5);
  const successCount = notifications.filter(n => n.sent_at && !n.error_message).length;
  const errorCount = notifications.filter(n => n.error_message).length;
  const pendingCount = notifications.filter(n => !n.sent_at && !n.error_message).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task_assignment':
        return <MessageSquare className="h-4 w-4" />;
      case 'system_alert':
        return <Bell className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'task_assignment':
        return 'Atribuição de Tarefa';
      case 'system_alert':
        return 'Novo Chamado';
      case 'document_update':
        return 'Atualização de Documento';
      case 'fpa_report':
        return 'Relatório FPA';
      default:
        return 'Geral';
    }
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Enviadas</p>
                <p className="text-2xl font-bold text-green-600">{successCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <Bell className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Com Erro</p>
                <p className="text-2xl font-bold text-red-600">{errorCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Notificações Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentNotifications.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhuma notificação encontrada
            </p>
          ) : (
            <div className="space-y-3">
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start gap-3 p-3 border rounded-lg"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {getTypeLabel(notification.type)}
                      </Badge>
                      <Badge
                        variant={
                          notification.sent_at && !notification.error_message
                            ? "default"
                            : notification.error_message
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {notification.sent_at && !notification.error_message
                          ? "Enviada"
                          : notification.error_message
                          ? "Erro"
                          : "Pendente"}
                      </Badge>
                    </div>
                    <p className="font-medium text-sm truncate">
                      {notification.subject}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Para: {notification.recipient_email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleString('pt-BR')}
                    </p>
                    {notification.error_message && (
                      <p className="text-xs text-red-600 mt-1">
                        Erro: {notification.error_message}
                      </p>
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

export default NotificationStatus;
