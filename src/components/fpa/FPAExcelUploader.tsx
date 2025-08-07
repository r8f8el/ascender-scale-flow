import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';

interface FPAExcelUploaderProps {
  clientId: string;
}

type ParsedRow = Record<string, string | number | null | undefined> & {
  Period?: string;
  Período?: string;
  Receita?: number;
  Revenue?: number;
  EBITDA?: number;
  'Lucro Líquido'?: number;
  NetIncome?: number;
  COGS?: number;
  'Custo de Mercadorias'?: number;
  OPEX?: number;
  Depreciacao?: number;
  Depreciation?: number;
  'Despesas Financeiras'?: number;
  FinancialExpenses?: number;
};

const HEADER_MAP: Record<string, string> = {
  // period
  'period': 'period',
  'período': 'period',
  'periodo': 'period',
  'mês': 'period',
  'mes': 'period',

  // revenue
  'receita': 'revenue',
  'revenue': 'revenue',
  'faturamento': 'revenue',

  // cogs
  'cogs': 'cost_of_goods_sold',
  'custo de mercadorias': 'cost_of_goods_sold',
  'cmv': 'cost_of_goods_sold',

  // opex
  'opex': 'operating_expenses',
  'despesas operacionais': 'operating_expenses',

  // gross profit (optional)
  'lucro bruto': 'gross_profit',

  // ebitda
  'ebitda': 'ebitda',

  // depreciation
  'depreciação': 'depreciation',
  'depreciacao': 'depreciation',
  'depreciation': 'depreciation',

  // financial expenses
  'despesas financeiras': 'financial_expenses',
  'financial expenses': 'financial_expenses',

  // net income
  'lucro líquido': 'net_income',
  'lucro liquido': 'net_income',
  'net income': 'net_income',
  'netincome': 'net_income',
};

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase();
}

function parsePeriodToDates(period: string): { start: string; end: string; name: string; type: string } | null {
  try {
    const txt = period.trim();
    // Support YYYY-MM, MM/YYYY, MMM YYYY
    const isoMatch = txt.match(/^(\d{4})[-/](\d{1,2})$/);
    const brMatch = txt.match(/^(\d{1,2})\/(\d{4})$/);
    if (isoMatch) {
      const year = Number(isoMatch[1]);
      const month = Number(isoMatch[2]) - 1;
      const startDate = new Date(Date.UTC(year, month, 1));
      const endDate = new Date(Date.UTC(year, month + 1, 0));
      return {
        start: startDate.toISOString().slice(0, 10),
        end: endDate.toISOString().slice(0, 10),
        name: startDate.toLocaleString('pt-BR', { month: 'short', year: 'numeric' }),
        type: 'monthly',
      };
    }
    if (brMatch) {
      const month = Number(brMatch[1]) - 1;
      const year = Number(brMatch[2]);
      const startDate = new Date(Date.UTC(year, month, 1));
      const endDate = new Date(Date.UTC(year, month + 1, 0));
      return {
        start: startDate.toISOString().slice(0, 10),
        end: endDate.toISOString().slice(0, 10),
        name: startDate.toLocaleString('pt-BR', { month: 'short', year: 'numeric' }),
        type: 'monthly',
      };
    }
    // Try native Date parse as fallback
    const d = new Date(txt);
    if (!isNaN(d.getTime())) {
      const startDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
      const endDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
      return {
        start: startDate.toISOString().slice(0, 10),
        end: endDate.toISOString().slice(0, 10),
        name: startDate.toLocaleString('pt-BR', { month: 'short', year: 'numeric' }),
        type: 'monthly',
      };
    }
  } catch {}
  return null;
}

const numberOrZero = (v: any) => {
  const n = typeof v === 'string' ? Number(v.toString().replace(/\./g, '').replace(',', '.')) : Number(v);
  return isFinite(n) ? n : 0;
};

const FPAExcelUploader: React.FC<FPAExcelUploaderProps> = ({ clientId }) => {
  const { toast } = useToast();
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);

  const mappedHeaders = useMemo(() => {
    return headers.map((h) => HEADER_MAP[normalizeHeader(h)] || h);
  }, [headers]);

  const hasRequired = useMemo(() => {
    const lower = mappedHeaders.map((h) => h.toLowerCase());
    return lower.includes('period') && (lower.includes('revenue') || lower.includes('ebitda') || lower.includes('net_income'));
  }, [mappedHeaders]);

  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const ws = workbook.Sheets[workbook.SheetNames[0]];
      const json: any[] = XLSX.utils.sheet_to_json(ws, { defval: null });
      setRows(json as ParsedRow[]);
      // Extract headers from sheet
      const hdr = XLSX.utils.sheet_to_json(ws, { header: 1 })[0] as string[];
      setHeaders((hdr || []).map((h) => (typeof h === 'string' ? h : String(h))));
      setFileName(file.name);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (!clientId) {
      toast({ title: 'Cliente não selecionado', description: 'Selecione um cliente para importar.', variant: 'destructive' });
      return;
    }
    if (!hasRequired) {
      toast({ title: 'Planilha inválida', description: 'Inclua as colunas de Período e pelo menos uma métrica (Receita, EBITDA ou Lucro Líquido).', variant: 'destructive' });
      return;
    }

    setImporting(true);
    try {
      // Build unique periods map
      const periodCache = new Map<string, string>(); // name -> period_id

      for (const r of rows) {
        const periodRaw = (r['Period'] || r['Período'] || r['period'] || r['PERIOD'] || r['Período (AAAA-MM)']) as string | undefined;
        if (!periodRaw) continue;
        const parsed = parsePeriodToDates(String(periodRaw));
        if (!parsed) continue;

        const cacheKey = parsed.name;
        if (!periodCache.has(cacheKey)) {
          // Try find existing period
          const { data: existing, error: findErr } = await supabase
            .from('fpa_periods')
            .select('id')
            .eq('fpa_client_id', clientId)
            .eq('period_name', parsed.name)
            .maybeSingle();
          if (findErr) throw findErr;

          let periodId = existing?.id as string | undefined;
          if (!periodId) {
            const { data: created, error: createErr } = await supabase
              .from('fpa_periods')
              .insert({
                fpa_client_id: clientId,
                start_date: parsed.start,
                end_date: parsed.end,
                is_actual: true,
                period_name: parsed.name,
                period_type: parsed.type,
              })
              .select('id')
              .single();
            if (createErr) throw createErr;
            periodId = created.id;
          }
          periodCache.set(cacheKey, periodId!);
        }
      }

      // Build financial rows
      const financialRows = [] as any[];
      for (const r of rows) {
        const periodRaw = (r['Period'] || r['Período'] || r['period'] || r['PERIOD'] || r['Período (AAAA-MM)']) as string | undefined;
        if (!periodRaw) continue;
        const parsed = parsePeriodToDates(String(periodRaw));
        if (!parsed) continue;
        const periodId = periodCache.get(parsed.name);
        if (!periodId) continue;

        const obj: any = {
          fpa_client_id: clientId,
          period_id: periodId,
          revenue: 0,
          cost_of_goods_sold: 0,
          operating_expenses: 0,
          gross_profit: 0,
          ebitda: 0,
          depreciation: 0,
          financial_expenses: 0,
          net_income: 0,
          scenario_name: 'base',
        };

        // Map known metrics by header synonyms
        for (const [key, value] of Object.entries(r)) {
          if (value == null) continue;
          const mapped = HEADER_MAP[normalizeHeader(key)];
          if (!mapped) continue;
          switch (mapped) {
            case 'revenue':
              obj.revenue = numberOrZero(value);
              break;
            case 'cost_of_goods_sold':
              obj.cost_of_goods_sold = numberOrZero(value);
              break;
            case 'operating_expenses':
              obj.operating_expenses = numberOrZero(value);
              break;
            case 'gross_profit':
              obj.gross_profit = numberOrZero(value);
              break;
            case 'ebitda':
              obj.ebitda = numberOrZero(value);
              break;
            case 'depreciation':
              obj.depreciation = numberOrZero(value);
              break;
            case 'financial_expenses':
              obj.financial_expenses = numberOrZero(value);
              break;
            case 'net_income':
              obj.net_income = numberOrZero(value);
              break;
          }
        }
        financialRows.push(obj);
      }

      if (financialRows.length === 0) {
        toast({ title: 'Nada para importar', description: 'Não foram encontrados dados válidos.', variant: 'destructive' });
        return;
      }

      const { error: insertErr } = await supabase.from('fpa_financial_data').insert(financialRows);
      if (insertErr) throw insertErr;

      // Register upload
      await supabase.from('fpa_data_uploads').insert({
        fpa_client_id: clientId,
        file_name: fileName || 'planilha.xlsx',
        file_path: 'local-upload',
        file_type: 'xlsx',
        status: 'processed',
      });

      toast({ title: 'Importação concluída', description: `Linhas importadas: ${financialRows.length}` });
    } catch (e: any) {
      console.error('Import error', e);
      toast({ title: 'Erro ao importar', description: e?.message || 'Verifique a planilha e tente novamente.', variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar dados do Excel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
            }}
          />
          <Button onClick={handleImport} disabled={!rows.length || importing}>
            {importing ? 'Importando...' : 'Importar'}
          </Button>
        </div>
        {fileName && (
          <div className="text-sm text-muted-foreground">Arquivo: {fileName}</div>
        )}
        {!!rows.length && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={hasRequired ? 'default' : 'destructive'}>
                {hasRequired ? 'Formato reconhecido' : 'Formato inválido'}
              </Badge>
              <span className="text-sm text-muted-foreground">Visualização das primeiras linhas</span>
            </div>
            <div className="overflow-auto border rounded-md">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    {headers.map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-medium whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 10).map((r, idx) => (
                    <tr key={idx} className="border-t">
                      {headers.map((h) => (
                        <td key={h} className="px-3 py-2 whitespace-nowrap">
                          {String((r as any)[h] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-xs text-muted-foreground">
              Dica: Inclua colunas "Período" (AAAA-MM), "Receita", "EBITDA", "Lucro Líquido".
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FPAExcelUploader;
