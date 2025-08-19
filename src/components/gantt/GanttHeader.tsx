
import React from 'react';
import { ViewMode } from 'gantt-task-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Calendar, 
  CalendarDays,
  CalendarRange,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

interface GanttHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onCreateTask: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters: any;
  onFiltersChange: (filters: any) => void;
  isAdmin: boolean;
  taskCount: number;
  completedCount: number;
  onRefresh: () => void;
  customCreateButton?: React.ReactNode;
}

const viewModeOptions = [
  { value: ViewMode.Day, label: 'Diário', icon: Calendar },
  { value: ViewMode.Week, label: 'Semanal', icon: CalendarDays },
  { value: ViewMode.Month, label: 'Mensal', icon: CalendarRange }
];

export const GanttHeader: React.FC<GanttHeaderProps> = ({
  viewMode,
  onViewModeChange,
  onCreateTask,
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  isAdmin,
  taskCount,
  completedCount,
  onRefresh,
  customCreateButton
}) => {
  const progressPercentage = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

  return (
    <div className="border-b bg-white p-4 space-y-4">
      {/* Primeira linha - Título e ações principais */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Cronograma do Projeto
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant="outline" className="text-xs">
                {taskCount} tarefas
              </Badge>
              <Badge variant="outline" className="text-xs">
                {completedCount} concluídas
              </Badge>
              <Badge 
                variant={progressPercentage >= 70 ? "default" : progressPercentage >= 40 ? "secondary" : "destructive"}
                className="text-xs"
              >
                {progressPercentage}% completo
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
          
          {isAdmin && (customCreateButton || (
            <Button onClick={onCreateTask} className="gap-2">
              <Calendar className="h-4 w-4" />
              Nova Tarefa
            </Button>
          ))}
        </div>
      </div>

      {/* Segunda linha - Controles de visualização e filtros */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
        {/* Busca */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tarefas..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Controles de visualização */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
            {viewModeOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <Button
                  key={option.value}
                  variant={viewMode === option.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange(option.value)}
                  className="gap-2 text-xs"
                >
                  <IconComponent className="h-3 w-3" />
                  {option.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filtros:</span>
          </div>
          
          <Select
            value={filters.status}
            onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
          >
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Eye className="h-3 w-3" />
                  Todos
                </div>
              </SelectItem>
              <SelectItem value="planning">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-3 w-3" />
                  Planejamento
                </div>
              </SelectItem>
              <SelectItem value="active">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Em Andamento
                </div>
              </SelectItem>
              <SelectItem value="completed">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3" />
                  Concluído
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.priority}
            onValueChange={(value) => onFiltersChange({ ...filters, priority: value })}
          >
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="low">🔵 Baixa</SelectItem>
              <SelectItem value="medium">🟡 Média</SelectItem>
              <SelectItem value="high">🟠 Alta</SelectItem>
              <SelectItem value="urgent">🔴 Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
