
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ViewMode } from 'gantt-task-react';
import {
  BarChart3,
  Plus,
  Search,
  Filter,
  ZoomIn,
  ZoomOut,
  Calendar,
  Users,
  Settings,
  RefreshCw
} from 'lucide-react';
import { useResponsive } from '@/hooks/useResponsive';

interface GanttHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onCreateTask: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters: {
    status: string;
    priority: string;
    assignee: string;
  };
  onFiltersChange: (filters: any) => void;
  isAdmin?: boolean;
  taskCount: number;
  completedCount: number;
  onRefresh: () => void;
}

export const GanttHeader: React.FC<GanttHeaderProps> = ({
  viewMode,
  onViewModeChange,
  onCreateTask,
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  isAdmin = false,
  taskCount,
  completedCount,
  onRefresh
}) => {
  const isMobile = useResponsive();

  const viewModeOptions = [
    { value: ViewMode.Hour, label: isMobile ? 'H' : 'Horas', icon: '⏰' },
    { value: ViewMode.Day, label: isMobile ? 'D' : 'Dias', icon: '📅' },
    { value: ViewMode.Week, label: isMobile ? 'S' : 'Semanas', icon: '📆' },
    { value: ViewMode.Month, label: isMobile ? 'M' : 'Meses', icon: '🗓️' }
  ];

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800 border-blue-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    urgent: 'bg-red-100 text-red-800 border-red-200'
  };

  if (isMobile) {
    return (
      <div className="bg-white border-b border-gray-200 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Cronograma</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="p-2"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            {isAdmin && (
              <Button onClick={onCreateTask} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Stats */}
        <div className="flex justify-center gap-4">
          <Badge variant="outline" className="flex items-center gap-1">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            {taskCount} tarefas
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            {completedCount} concluídas
          </Badge>
        </div>

        {/* Mobile View Mode Selector */}
        <div className="flex justify-center">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {viewModeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onViewModeChange(option.value)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === option.value
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                <span className="mr-1">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar tarefas..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cronograma do Projeto</h1>
            <p className="text-sm text-gray-500">
              {taskCount} tarefas • {completedCount} concluídas • {Math.round((completedCount / taskCount) * 100) || 0}% progresso
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
          
          {isAdmin && (
            <Button onClick={onCreateTask} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Tarefa
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar tarefas..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <Select
              value={filters.status}
              onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="planning">Planejamento</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="on-hold">Em Espera</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.priority}
              onValueChange={(value) => onFiltersChange({ ...filters, priority: value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Baixa
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    Média
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Alta
                  </div>
                </SelectItem>
                <SelectItem value="urgent">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Urgente
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* View Mode */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 mr-2">Visualização:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {viewModeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onViewModeChange(option.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === option.value
                    ? 'bg-white text-primary shadow-sm scale-105'
                    : 'text-gray-600 hover:text-primary hover:bg-white/50'
                }`}
              >
                <span className="mr-2">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
