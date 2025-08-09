import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GanttChart } from '@/components/gantt/GanttChart';
import { useGanttProjects } from '@/hooks/useGanttProjects';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart3 } from 'lucide-react';

export default function ClientGantt() {
  const { user } = useAuth();
  const { projects, loading } = useGanttProjects(user?.id);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  React.useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Cronogramas
        </h1>
        <p className="text-muted-foreground">
          Acompanhe cronogramas e marcos dos projetos
        </p>
      </div>

      {projects.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Nenhum cronograma encontrado
            </h3>
            <p className="text-sm text-muted-foreground">
              Cronogramas de projetos aparecerão aqui
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Projetos</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedProjectId === project.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedProjectId(project.id)}
                  >
                    <div className="font-medium">{project.name}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {project.progress}% concluído
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-3">
            {selectedProjectId && <GanttChart projectId={selectedProjectId} />}
          </div>
        </div>
      )}
    </div>
  );
}