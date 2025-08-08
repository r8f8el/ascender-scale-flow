
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, BarChart3 } from 'lucide-react';
import { useFPAClients } from '@/hooks/useFPAClients';
import { useClientBIEmbeds, useUpsertClientBIEmbed } from '@/hooks/useClientBIEmbeds';
import { useToast } from '@/components/ui/use-toast';

const providers = [
  { value: 'powerbi', label: 'Power BI' },
  { value: 'looker_studio', label: 'Looker Studio' },
  { value: 'tableau', label: 'Tableau' },
  { value: 'metabase', label: 'Metabase' },
  { value: 'superset', label: 'Apache Superset' },
  { value: 'other', label: 'Outro' },
];

const AdminFPABIEmbeds: React.FC = () => {
  useEffect(() => {
    document.title = 'Admin • Embeds de BI | Ascalate';
  }, []);

  const { toast } = useToast();
  const { data: clients = [], isLoading: loadingClients } = useFPAClients();
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const { data: embeds = [], isLoading: loadingEmbeds } = useClientBIEmbeds(clientId);
  const upsert = useUpsertClientBIEmbed();

  const selectedEmbed = embeds[0];

  // Form state
  const [provider, setProvider] = useState('powerbi');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [iframeHtml, setIframeHtml] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [accessMode, setAccessMode] = useState('secure');

  useEffect(() => {
    if (selectedEmbed) {
      setProvider(selectedEmbed.provider || 'other');
      setTitle(selectedEmbed.title || '');
      setDescription(selectedEmbed.description || '');
      setEmbedUrl(selectedEmbed.embed_url || '');
      setIframeHtml(selectedEmbed.iframe_html || '');
      setIsActive(selectedEmbed.is_active);
      setAccessMode(selectedEmbed.access_mode || 'secure');
    } else {
      setProvider('powerbi');
      setTitle('');
      setDescription('');
      setEmbedUrl('');
      setIframeHtml('');
      setIsActive(true);
      setAccessMode('secure');
    }
  }, [selectedEmbed]);

  const handleSave = async () => {
    if (!clientId) return;
    try {
      await upsert.mutateAsync({
        id: selectedEmbed?.id,
        fpa_client_id: clientId,
        provider,
        title,
        description,
        embed_url: embedUrl || null,
        iframe_html: iframeHtml || null,
        is_active: isActive,
        access_mode: accessMode,
      } as any);
      toast({ title: 'Salvo com sucesso', description: 'Embed de BI atualizado.' });
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message || 'Verifique os campos', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Embeds de BI por Cliente</h1>
          <p className="text-gray-600 mt-1">Configure o dashboard de BI exibido para cada cliente</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" /> Configuração do Embed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Cliente FP&A</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingClients ? 'Carregando...' : 'Selecione um cliente'} />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fornecedor</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  {providers.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Painel Executivo" />
            </div>
            <div className="space-y-2">
              <Label>Ativo</Label>
              <div className="flex items-center gap-3 py-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <span className="text-sm text-gray-600">Exibir para o cliente</span>
              </div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>URL do Embed (iframe src)</Label>
              <Input value={embedUrl} onChange={(e) => setEmbedUrl(e.target.value)} placeholder="Cole aqui a URL do embed do seu provedor" />
              <p className="text-xs text-gray-500">Recomendado. Alternativamente, preencha o HTML completo do iframe abaixo.</p>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>HTML do Iframe (opcional)</Label>
              <Textarea value={iframeHtml} onChange={(e) => setIframeHtml(e.target.value)} rows={5} placeholder="&lt;iframe src=...&gt;&lt;/iframe&gt;" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={!clientId || upsert.isPending}>
              {upsert.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" /> Salvar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFPABIEmbeds;
