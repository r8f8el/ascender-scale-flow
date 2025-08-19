
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Download, FileText, Image, Table } from 'lucide-react';
import { GanttTask } from '@/hooks/useGanttTasks';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as XLSX from 'xlsx';

interface GanttExportProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: GanttTask[];
  projectName: string;
}

export const GanttExport: React.FC<GanttExportProps> = ({
  isOpen,
  onClose,
  tasks,
  projectName
}) => {
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv' | 'pdf'>('excel');
  const [includeFields, setIncludeFields] = useState({
    name: true,
    description: true,
    startDate: true,
    endDate: true,
    progress: true,
    priority: true,
    assignedTo: true,
    category: true,
    dependencies: true,
    ismilestone: true
  });

  const handleFieldChange = (field: keyof typeof includeFields, checked: boolean) => {
    setIncludeFields(prev => ({
      ...prev,
      [field]: checked
    }));
  };

  const getStatusText = (task: GanttTask) => {
    const status = task.status || 'pending';
    switch (status) {
      case 'completed': return 'Concluída';
      case 'in_progress': return 'Em Progresso';
      case 'blocked': return 'Bloqueada';
      case 'pending': return 'Pendente';
      default: return 'Não definido';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return 'Não definido';
    }
  };

  const exportToExcel = () => {
    const data = tasks.map(task => {
      const row: any = {};
      
      if (includeFields.name) row['Nome'] = task.name;
      if (includeFields.description) row['Descrição'] = task.description || '';
      if (includeFields.startDate) row['Data de Início'] = format(new Date(task.start_date), 'dd/MM/yyyy');
      if (includeFields.endDate) row['Data de Fim'] = format(new Date(task.end_date), 'dd/MM/yyyy');
      if (includeFields.progress) row['Progresso (%)'] = task.progress;
      if (includeFields.priority) row['Prioridade'] = getPriorityText(task.priority);
      if (includeFields.assignedTo) row['Responsável'] = task.assigned_to || 'Não definido';
      if (includeFields.category) row['Categoria'] = task.category || 'Não definido';
      if (includeFields.isMinestone) row['Marco'] = task.is_milestone ? 'Sim' : 'Não';
      if (includeFields.dependencies) row['Dependências'] = task.dependencies?.length > 0 ? 
        task.dependencies.join(', ') : 'Nenhuma';

      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cronograma');

    // Ajustar largura das colunas
    const colWidths = Object.keys(data[0] || {}).map(key => ({ wch: Math.max(key.length, 15) }));
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `${projectName}_Cronograma.xlsx`);
  };

  const exportToCSV = () => {
    const headers: string[] = [];
    const rows: string[][] = [];

    // Definir cabeçalhos baseado nos campos selecionados
    if (includeFields.name) headers.push('Nome');
    if (includeFields.description) headers.push('Descrição');
    if (includeFields.startDate) headers.push('Data de Início');
    if (includeFields.endDate) headers.push('Data de Fim');
    if (includeFields.progress) headers.push('Progresso (%)');
    if (includeFields.priority) headers.push('Prioridade');
    if (includeFields.assignedTo) headers.push('Responsável');
    if (includeFields.category) headers.push('Categoria');
    if (includeFields.isMinestone) headers.push('Marco');
    if (includeFields.dependencies) headers.push('Dependências');

    // Adicionar dados das tarefas
    tasks.forEach(task => {
      const row: string[] = [];
      
      if (includeFields.name) row.push(task.name);
      if (includeFields.description) row.push(task.description || '');
      if (includeFields.startDate) row.push(format(new Date(task.start_date), 'dd/MM/yyyy'));
      if (includeFields.endDate) row.push(format(new Date(task.end_date), 'dd/MM/yyyy'));
      if (includeFields.progress) row.push(task.progress.toString());
      if (includeFields.priority) row.push(getPriorityText(task.priority));
      if (includeFields.assignedTo) row.push(task.assigned_to || 'Não definido');
      if (includeFields.category) row.push(task.category || 'Não definido');
      if (includeFields.isMinestone) row.push(task.is_milestone ? 'Sim' : 'Não');
      if (includeFields.dependencies) row.push(task.dependencies?.length > 0 ? 
        task.dependencies.join(', ') : 'Nenhuma');

      rows.push(row);
    });

    // Criar conteúdo CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download do arquivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${projectName}_Cronograma.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    // Implementação básica para PDF - pode ser expandida com jsPDF
    const printContent = `
      <html>
        <head>
          <title>${projectName} - Cronograma</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h1 { color: #333; }
            .milestone { font-weight: bold; color: #8B5CF6; }
          </style>
        </head>
        <body>
          <h1>${projectName} - Cronograma do Projeto</h1>
          <p>Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
          
          <table>
            <thead>
              <tr>
                ${includeFields.name ? '<th>Nome</th>' : ''}
                ${includeFields.startDate ? '<th>Início</th>' : ''}
                ${includeFields.endDate ? '<th>Fim</th>' : ''}
                ${includeFields.progress ? '<th>Progresso</th>' : ''}
                ${includeFields.priority ? '<th>Prioridade</th>' : ''}
                ${includeFields.assignedTo ? '<th>Responsável</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${tasks.map(task => `
                <tr ${task.is_milestone ? 'class="milestone"' : ''}>
                  ${includeFields.name ? `<td>${task.name}${task.is_milestone ? ' 🏆' : ''}</td>` : ''}
                  ${includeFields.startDate ? `<td>${format(new Date(task.start_date), 'dd/MM/yyyy')}</td>` : ''}
                  ${includeFields.endDate ? `<td>${format(new Date(task.end_date), 'dd/MM/yyyy')}</td>` : ''}
                  ${includeFields.progress ? `<td>${task.progress}%</td>` : ''}
                  ${includeFields.priority ? `<td>${getPriorityText(task.priority)}</td>` : ''}
                  ${includeFields.assignedTo ? `<td>${task.assigned_to || 'Não definido'}</td>` : ''}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleExport = () => {
    switch (exportFormat) {
      case 'excel':
        exportToExcel();
        break;
      case 'csv':
        exportToCSV();
        break;
      case 'pdf':
        exportToPDF();
        break;
    }
    onClose();
  };

  const getFormatIcon = () => {
    switch (exportFormat) {
      case 'excel': return <Table className="h-4 w-4" />;
      case 'csv': return <FileText className="h-4 w-4" />;
      case 'pdf': return <Image className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Cronograma
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Formato de Exportação</Label>
            <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <Table className="h-4 w-4" />
                    Excel (.xlsx)
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    CSV (.csv)
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    PDF (Impressão)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Campos para Exportar</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(includeFields).map(([field, checked]) => {
                const fieldLabels: Record<string, string> = {
                  name: 'Nome',
                  description: 'Descrição',
                  startDate: 'Data Início',
                  endDate: 'Data Fim',
                  progress: 'Progresso',
                  priority: 'Prioridade',
                  assignedTo: 'Responsável',
                  category: 'Categoria',
                  dependencies: 'Dependências',
                  isMinestone: 'Marco'
                };

                return (
                  <div key={field} className="flex items-center space-x-2">
                    <Checkbox
                      id={field}
                      checked={checked}
                      onCheckedChange={(checked) => 
                        handleFieldChange(field as keyof typeof includeFields, checked as boolean)
                      }
                    />
                    <Label htmlFor={field} className="text-sm">
                      {fieldLabels[field]}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <div className="text-sm text-gray-600">
              {tasks.length} tarefa{tasks.length !== 1 ? 's' : ''} para exportar
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleExport} className="flex items-center gap-2">
                {getFormatIcon()}
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
