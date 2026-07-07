import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, FileSpreadsheet, Calendar, Building, X } from 'lucide-react';
import { exportToPDF, exportToExcel } from '@/utils/reportExporter';
import { toast } from 'sonner';

interface ReportViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: any;
  clientName: string;
  financialData?: any[];
}

export const ReportViewerModal: React.FC<ReportViewerModalProps> = ({
  isOpen,
  onClose,
  report,
  clientName,
  financialData = []
}) => {
  if (!report) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Filtrar dados financeiros correspondentes ao período do relatório, se aplicável
  const relatedData = financialData.filter(d => d.period_id === report.period_id || !report.period_id);

  const handleExportPDF = async () => {
    try {
      const filename = `${report.title.replace(/\s+/g, '_')}_${clientName.replace(/\s+/g, '_')}`;
      toast.info('Gerando PDF de alta definição...');
      await exportToPDF('fpa-report-printable-content', filename);
      toast.success('PDF exportado com sucesso!');
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao exportar PDF: ' + err.message);
    }
  };

  const handleExportExcel = () => {
    try {
      if (relatedData.length === 0) {
        toast.error('Nenhum dado financeiro associado para exportar para Excel.');
        return;
      }

      // Preparar os dados para o Excel
      const excelRows = relatedData.map(d => ({
        'Parâmetro Financeiro': 'Valor',
        'Receita Bruta': d.revenue || 0,
        'Custo de Vendas': d.cost_of_goods_sold || 0,
        'Despesas Operacionais': d.operating_expenses || 0,
        'EBITDA': (d.revenue || 0) - (d.cost_of_goods_sold || 0) - (d.operating_expenses || 0),
        'Depreciação/Amortização': d.depreciation || 0,
        'Resultado Financeiro': d.financial_expenses || 0,
        'Lucro Líquido': (d.revenue || 0) - (d.cost_of_goods_sold || 0) - (d.operating_expenses || 0) - (d.depreciation || 0) - (d.financial_expenses || 0),
        'Fluxo de Caixa Operacional': d.operating_cash_flow || 0,
        'Fluxo de Caixa Investimentos': d.investing_cash_flow || 0,
        'Fluxo de Caixa Financiamento': d.financing_cash_flow || 0,
        'Saldo de Caixa': d.cash_balance || 0,
        'Ativo Circulante': d.current_assets || 0,
        'Ativo Não Circulante': d.non_current_assets || 0,
        'Total Ativos': d.total_assets || 0,
        'Passivo Circulante': d.current_liabilities || 0,
        'Passivo Não Circulante': d.non_current_liabilities || 0,
        'Patrimônio Líquido': d.equity || 0,
        'Período': report.period_covered || report.description || 'N/A'
      }));

      const filename = `FPA_${report.title.replace(/\s+/g, '_')}_${clientName.replace(/\s+/g, '_')}`;
      exportToExcel(excelRows, 'Dados FP&A', filename);
      toast.success('Planilha Excel gerada com sucesso!');
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao exportar Excel: ' + err.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none rounded-xl shadow-2xl bg-white">
        <DialogHeader className="p-6 pb-2 border-b flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Visualização do Relatório
            </DialogTitle>
            <p className="text-sm text-gray-500 mt-1">
              Visualize os dados e exporte o relatório financeiro consolidado.
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>

        {/* Printable Area */}
        <div className="p-8 bg-gray-50/50">
          <div 
            id="fpa-report-printable-content" 
            className="bg-white border rounded-xl p-10 shadow-sm max-w-3xl mx-auto space-y-8 font-sans text-gray-800"
          >
            {/* Report Header Branding */}
            <div className="flex justify-between items-start border-b pb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Ascender FP&A Advisor</span>
                <h1 className="text-2xl font-extrabold text-gray-900 mt-1">{report.title}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Relatório Analítico de Performance Financeira
                </p>
              </div>
              <div className="text-right text-xs text-gray-500 space-y-1">
                <div className="flex items-center gap-1.5 justify-end font-semibold text-gray-900">
                  <Building className="h-3.5 w-3.5 text-gray-500" />
                  {clientName}
                </div>
                <div className="flex items-center gap-1.5 justify-end">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  {report.period_covered || report.description || 'Geral'}
                </div>
                <div className="mt-2">
                  <Badge variant="outline" className="capitalize text-[10px]">
                    {report.report_type}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Insights & Comments */}
            {report.insights && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Comentários do Consultor & Insights
                </h3>
                <div className="p-4 bg-blue-50/30 border border-blue-100 rounded-lg text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {report.insights}
                </div>
              </div>
            )}

            {/* Description */}
            {report.description && !report.insights && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Descrição
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">{report.description}</p>
              </div>
            )}

            {/* Financial Reference Table */}
            {relatedData.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Demonstrativo Financeiro Consolidado
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-200">
                        <th className="p-3 font-semibold text-gray-700">Categoria Financeira</th>
                        <th className="p-3 font-semibold text-gray-700 text-right">Valor Realizado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="p-3 font-medium text-gray-900">Receita Bruta</td>
                        <td className="p-3 text-right font-semibold text-green-700">
                          {formatCurrency(relatedData[0].revenue || 0)}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 text-gray-600 pl-6">(-) Custo de Vendas (CPV/CMV)</td>
                        <td className="p-3 text-right text-gray-700">
                          {formatCurrency(relatedData[0].cost_of_goods_sold || 0)}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 text-gray-600 pl-6">(-) Despesas Operacionais (OpEx)</td>
                        <td className="p-3 text-right text-gray-700">
                          {formatCurrency(relatedData[0].operating_expenses || 0)}
                        </td>
                      </tr>
                      <tr className="bg-gray-50 font-bold border-t border-b">
                        <td className="p-3 text-gray-900">EBITDA</td>
                        <td className="p-3 text-right text-gray-900">
                          {formatCurrency(
                            (relatedData[0].revenue || 0) - 
                            (relatedData[0].cost_of_goods_sold || 0) - 
                            (relatedData[0].operating_expenses || 0)
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 text-gray-600 pl-6">(-) Depreciação & Amortização</td>
                        <td className="p-3 text-right text-gray-700">
                          {formatCurrency(relatedData[0].depreciation || 0)}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 text-gray-600 pl-6">(-) Despesas Financeiras Líquidas</td>
                        <td className="p-3 text-right text-gray-700">
                          {formatCurrency(relatedData[0].financial_expenses || 0)}
                        </td>
                      </tr>
                      <tr className="bg-blue-50/50 font-bold border-t-2">
                        <td className="p-3 text-blue-900">Lucro Líquido do Período</td>
                        <td className="p-3 text-right text-blue-800 text-sm">
                          {formatCurrency(
                            (relatedData[0].revenue || 0) - 
                            (relatedData[0].cost_of_goods_sold || 0) - 
                            (relatedData[0].operating_expenses || 0) - 
                            (relatedData[0].depreciation || 0) - 
                            (relatedData[0].financial_expenses || 0)
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Additional Info Cards */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="p-3 bg-gray-50 border rounded-lg text-center">
                    <p className="text-[10px] uppercase font-bold text-gray-500">Saldo de Caixa</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">
                      {formatCurrency(relatedData[0].cash_balance || 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 border rounded-lg text-center">
                    <p className="text-[10px] uppercase font-bold text-gray-500">Patrimônio Líquido</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">
                      {formatCurrency(relatedData[0].equity || 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 border rounded-lg text-center">
                    <p className="text-[10px] uppercase font-bold text-gray-500">Geração de Caixa Op.</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">
                      {formatCurrency(relatedData[0].operating_cash_flow || 0)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed rounded-lg bg-gray-50 text-gray-500 text-xs">
                Nenhum demonstrativo financeiro consolidado foi acoplado a este período.
              </div>
            )}

            {/* Footer */}
            <div className="border-t pt-6 flex justify-between items-center text-[10px] text-gray-400">
              <span>Gerado de forma digital em {new Date().toLocaleDateString('pt-BR')}</span>
              <span>Ascender FP&A - Confidencial</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-4 border-t bg-gray-50 flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button variant="outline" onClick={handleExportExcel} className="gap-2 border-green-200 text-green-700 hover:bg-green-50">
            <FileSpreadsheet className="h-4 w-4" />
            Exportar Excel
          </Button>
          <Button onClick={handleExportPDF} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
