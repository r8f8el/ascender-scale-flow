import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText, FileSpreadsheet, Image, Calendar } from 'lucide-react';
import { GanttTask } from '@/hooks/useGanttTasks';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Input } from '@/components/ui/input';

interface GanttExportProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: GanttTask[];
  projectName: string;
}

interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'png';
  includeCompleted: boolean;
  includeProgress: boolean;
  includeDependencies: boolean;
  dateRange: 'all' | 'current' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
}

export const GanttExport: React.FC<GanttExportProps> = ({
  isOpen,
  onClose,
  tasks,
  projectName
}) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeCompleted: true,
    includeProgress: true,
    includeDependencies: true,
    dateRange: 'all'
  });
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    
    try {
      switch (exportOptions.format) {
        case 'pdf':
          await exportToPDF();
          break;
        case 'excel':
          await exportToExcel();
          break;
        case 'csv':
          await exportToCSV();
          break;
        case 'png':
          await exportToPNG();
          break;
      }
    } catch (error) {
      console.error('Erro na exportação:', error);
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = async () => {
    // Implementar exportação para PDF usando jsPDF ou similar
    const filteredTasks = filterTasksByOptions();
    
    // Criar conteúdo HTML para o PDF
    const htmlContent = `
      <html>
        <head>
          <title>Cronograma - ${projectName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .task { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
            .milestone { background-color: #f0f0f0; }
            .completed { background-color: #d4edda; }
            .in-progress { background-color: #d1ecf1; }
            .delayed { background-color: #f8d7da; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Cronograma do Projeto</h1>
            <h2>${projectName}</h2>
            <p>Exportado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
          </div>
          ${filteredTasks.map(task => `
            <div class="task ${task.is_milestone ? 'milestone' : ''} ${task.status}">
              <h3>${task.name}</h3>
              <p><strong>Status:</strong> ${task.status}</p>
              <p><strong>Progresso:</strong> ${task.progress}%</p>
              <p><strong>Responsável:</strong> ${task.assignee}</p>
              <p><strong>Período:</strong> ${format(parseISO(task.start_date), 'dd/MM/yyyy', { locale: ptBR })} - ${format(parseISO(task.end_date), 'dd/MM/yyyy', { locale: ptBR })}</p>
              ${task.description ? `<p><strong>Descrição:</strong> ${task.description}</p>` : ''}
            </div>
          `).join('')}
        </body>
      </html>
    `;

    // Criar blob e download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cronograma-${projectName}-${format(new Date(), 'yyyy-MM-dd')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToExcel = async () => {
    const filteredTasks = filterTasksByOptions();
    
    // Criar dados para Excel
    const excelData = filteredTasks.map(task => ({
      'Nome da Tarefa': task.name,
      'Descrição': task.description || '',
      'Status': task.status,
      'Progresso (%)': task.progress,
      'Prioridade': task.priority,
      'Responsável': task.assignee,
      'Data de Início': format(parseISO(task.start_date), 'dd/MM/yyyy', { locale: ptBR }),
      'Data de Fim': format(parseISO(task.end_date), 'dd/MM/yyyy', { locale: ptBR }),
      'É Marco': task.is_milestone ? 'Sim' : 'Não',
      'Dependências': task.dependencies.join(', ')
    }));

    // Converter para CSV (formato mais simples para Excel)
    const headers = Object.keys(excelData[0]);
    const csvContent = [
      headers.join(','),
      ...excelData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cronograma-${projectName}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = async () => {
    const filteredTasks = filterTasksByOptions();
    
    const csvData = filteredTasks.map(task => [
      task.name,
      task.description || '',
      task.status,
      task.progress,
      task.priority,
      task.assignee,
      format(parseISO(task.start_date), 'dd/MM/yyyy', { locale: ptBR }),
      format(parseISO(task.end_date), 'dd/MM/yyyy', { locale: ptBR }),
      task.is_milestone ? 'Sim' : 'Não',
      task.dependencies.join(';')
    ]);

    const headers = [
      'Nome', 'Descrição', 'Status', 'Progresso', 'Prioridade', 
      'Responsável', 'Data Início', 'Data Fim', 'Marco', 'Dependências'
    ];

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cronograma-${projectName}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToPNG = async () => {
    // Implementar captura de tela do cronograma
    // Pode usar html2canvas ou similar
    alert('Funcionalidade de exportação para PNG será implementada em breve!');
  };

  const filterTasksByOptions = () => {
    let filtered = [...tasks];

    // Filtrar por status
    if (!exportOptions.includeCompleted) {
      filtered = filtered.filter(task => task.status !== 'completed');
    }

    // Filtrar por data
    if (exportOptions.dateRange === 'current') {
      const today = new Date();
      filtered = filtered.filter(task => {
        const startDate = parseISO(task.start_date);
        const endDate = parseISO(task.end_date);
        return startDate <= today && endDate >= today;
      });
    } else if (exportOptions.dateRange === 'custom' && exportOptions.customStartDate && exportOptions.customEndDate) {
      const startDate = parseISO(exportOptions.customStartDate);
      const endDate = parseISO(exportOptions.customEndDate);
      filtered = filtered.filter(task => {
        const taskStart = parseISO(task.start_date);
        const taskEnd = parseISO(task.end_date);
        return taskStart >= startDate && taskEnd <= endDate;
      });
    }

    return filtered;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
            Exportar Cronograma
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Formato de Exportação */}
          <div>
            <Label htmlFor="format">Formato</Label>
            <Select 
              value={exportOptions.format} 
              onValueChange={(value: any) => setExportOptions({ ...exportOptions, format: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    CSV
                  </div>
                </SelectItem>
                <SelectItem value="png">
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Imagem PNG
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Opções de Conteúdo */}
          <div className="space-y-3">
            <Label>Conteúdo a Incluir</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeCompleted"
                checked={exportOptions.includeCompleted}
                onCheckedChange={(checked) => 
                  setExportOptions({ ...exportOptions, includeCompleted: !!checked })
                }
              />
              <Label htmlFor="includeCompleted">Tarefas Concluídas</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeProgress"
                checked={exportOptions.includeProgress}
                onCheckedChange={(checked) => 
                  setExportOptions({ ...exportOptions, includeProgress: !!checked })
                }
              />
              <Label htmlFor="includeProgress">Barras de Progresso</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeDependencies"
                checked={exportOptions.includeDependencies}
                onCheckedChange={(checked) => 
                  setExportOptions({ ...exportOptions, includeDependencies: !!checked })
                }
              />
              <Label htmlFor="includeDependencies">Dependências</Label>
            </div>
          </div>

          {/* Filtro por Data */}
          <div>
            <Label htmlFor="dateRange">Período</Label>
            <Select 
              value={exportOptions.dateRange} 
              onValueChange={(value: any) => setExportOptions({ ...exportOptions, dateRange: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Tarefas</SelectItem>
                <SelectItem value="current">Tarefas Atuais</SelectItem>
                <SelectItem value="custom">Período Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Datas Personalizadas */}
          {exportOptions.dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="customStartDate">Data Início</Label>
                <Input
                  id="customStartDate"
                  type="date"
                  value={exportOptions.customStartDate || ''}
                  onChange={(e) => setExportOptions({ 
                    ...exportOptions, 
                    customStartDate: e.target.value 
                  })}
                />
              </div>
              <div>
                <Label htmlFor="customEndDate">Data Fim</Label>
                <Input
                  id="customEndDate"
                  type="date"
                  value={exportOptions.customEndDate || ''}
                  onChange={(e) => setExportOptions({ 
                    ...exportOptions, 
                    customEndDate: e.target.value 
                  })}
                />
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={exporting}
              className="flex items-center gap-2"
            >
              {exporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Exportar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
