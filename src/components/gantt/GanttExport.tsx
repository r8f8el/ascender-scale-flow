
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, FileSpreadsheet, Image } from 'lucide-react';
import { GanttTask } from '@/hooks/useGanttTasks';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

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
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv' | 'pdf' | 'png'>('excel');
  const [selectedFields, setSelectedFields] = useState({
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

  const handleFieldToggle = (field: keyof typeof selectedFields) => {
    setSelectedFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const exportToExcel = () => {
    try {
      const exportData = tasks.map(task => {
        const data: any = {};
        
        if (selectedFields.name) data['Nome'] = task.name;
        if (selectedFields.description) data['Descrição'] = task.description || '';
        if (selectedFields.startDate) data['Data Início'] = task.start_date;
        if (selectedFields.endDate) data['Data Fim'] = task.end_date;
        if (selectedFields.progress) data['Progresso (%)'] = task.progress;
        if (selectedFields.priority) data['Prioridade'] = task.priority;
        if (selectedFields.assignedTo) data['Responsável'] = task.assigned_to || '';
        if (selectedFields.category) data['Categoria'] = task.category || '';
        if (selectedFields.dependencies) data['Dependências'] = task.dependencies.join(', ');
        if (selectedFields.ismilestone) data['Marco'] = task.is_milestone ? 'Sim' : 'Não';
        
        return data;
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Cronograma');
      
      const fileName = `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_cronograma.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast.success('Arquivo Excel exportado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      toast.error('Erro ao exportar arquivo Excel');
    }
  };

  const exportToCSV = () => {
    try {
      const exportData = tasks.map(task => {
        const data: any = {};
        
        if (selectedFields.name) data['Nome'] = task.name;
        if (selectedFields.description) data['Descrição'] = task.description || '';
        if (selectedFields.startDate) data['Data Início'] = task.start_date;
        if (selectedFields.endDate) data['Data Fim'] = task.end_date;
        if (selectedFields.progress) data['Progresso (%)'] = task.progress;
        if (selectedFields.priority) data['Prioridade'] = task.priority;
        if (selectedFields.assignedTo) data['Responsável'] = task.assigned_to || '';
        if (selectedFields.category) data['Categoria'] = task.category || '';
        if (selectedFields.dependencies) data['Dependências'] = task.dependencies.join(', ');
        if (selectedFields.ismilestone) data['Marco'] = task.is_milestone ? 'Sim' : 'Não';
        
        return data;
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const csvContent = XLSX.utils.sheet_to_csv(ws);
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_cronograma.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Arquivo CSV exportado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      toast.error('Erro ao exportar arquivo CSV');
    }
  };

  const exportToPDF = () => {
    toast.info('Funcionalidade de exportação para PDF em desenvolvimento');
  };

  const exportToPNG = () => {
    toast.info('Funcionalidade de exportação para PNG em desenvolvimento');
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
      case 'png':
        exportToPNG();
        break;
      default:
        break;
    }
  };

  const getFormatIcon = () => {
    switch (exportFormat) {
      case 'excel':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'csv':
        return <FileText className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'png':
        return <Image className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
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

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Formato de Exportação</Label>
            <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
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
                    <FileText className="h-4 w-4" />
                    PDF (.pdf)
                  </div>
                </SelectItem>
                <SelectItem value="png">
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Imagem (.png)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(exportFormat === 'excel' || exportFormat === 'csv') && (
            <div className="space-y-2">
              <Label>Campos para Exportar</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(selectedFields).map(([field, selected]) => (
                  <div key={field} className="flex items-center space-x-2">
                    <Checkbox
                      id={field}
                      checked={selected}
                      onCheckedChange={() => handleFieldToggle(field as keyof typeof selectedFields)}
                    />
                    <Label htmlFor={field} className="text-sm">
                      {field === 'name' && 'Nome'}
                      {field === 'description' && 'Descrição'}
                      {field === 'startDate' && 'Data Início'}
                      {field === 'endDate' && 'Data Fim'}
                      {field === 'progress' && 'Progresso'}
                      {field === 'priority' && 'Prioridade'}
                      {field === 'assignedTo' && 'Responsável'}
                      {field === 'category' && 'Categoria'}
                      {field === 'dependencies' && 'Dependências'}
                      {field === 'ismilestone' && 'Marco'}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleExport}>
              {getFormatIcon()}
              <span className="ml-2">Exportar</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
