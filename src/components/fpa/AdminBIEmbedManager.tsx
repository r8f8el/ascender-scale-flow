
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Loader2, 
  Save, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Monitor,
  BarChart3,
  TrendingUp,
  Activity,
  PieChart,
  MoveUp,
  MoveDown
} from 'lucide-react';
import { ClientBIEmbed, useUpsertClientBIEmbed, useDeleteClientBIEmbed } from '@/hooks/useClientBIEmbeds';
import { useToast } from '@/components/ui/use-toast';

interface AdminBIEmbedManagerProps {
  clientId: string;
  embeds: ClientBIEmbed[];
}

const providers = [
  { value: 'powerbi', label: 'Power BI' },
  { value: 'looker_studio', label: 'Looker Studio' },
  { value: 'tableau', label: 'Tableau' },
  { value: 'metabase', label: 'Metabase' },
  { value: 'superset', label: 'Apache Superset' },
  { value: 'other', label: 'Outro' },
];

const categories = [
  { value: 'dashboard', label: 'Dashboard', icon: Monitor },
  { value: 'report', label: 'Relatório', icon: BarChart3 },
  { value: 'analytics', label: 'Analytics', icon: TrendingUp },
  { value: 'kpi', label: 'KPIs', icon: Activity },
  { value: 'custom', label: 'Personalizado', icon: PieChart },
];

const AdminBIEmbedManager: React.FC<AdminBIEmbedManagerProps> = ({ clientId, embeds }) => {
  const { toast } = useToast();
  const upsert = useUpsertClientBIEmbed();
  const deleteEmbed = useDeleteClientBIEmbed();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmbed, setEditingEmbed] = useState<ClientBIEmbed | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    provider: 'powerbi',
    title: '',
    description: '',
    category: 'dashboard',
    embedUrl: '',
    iframeHtml: '',
    isActive: true,
    isFeatured: false,
    displayOrder: 0,
  });

  const resetForm = () => {
    setFormData({
      provider: 'powerbi',
      title: '',
      description: '',
      category: 'dashboard',
      embedUrl: '',
      iframeHtml: '',
      isActive: true,
      isFeatured: false,
      displayOrder: embeds.length,
    });
    setEditingEmbed(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (embed: ClientBIEmbed) => {
    setFormData({
      provider: embed.provider || 'powerbi',
      title: embed.title || '',
      description: embed.description || '',
      category: embed.category || 'dashboard',
      embedUrl: embed.embed_url || '',
      iframeHtml: embed.iframe_html || '',
      isActive: embed.is_active,
      isFeatured: embed.is_featured,
      displayOrder: embed.display_order,
    });
    setEditingEmbed(embed);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({ title: 'Erro', description: 'Título é obrigatório', variant: 'destructive' });
      return;
    }

    if (!formData.embedUrl.trim() && !formData.iframeHtml.trim()) {
      toast({ title: 'Erro', description: 'URL do embed ou HTML do iframe é obrigatório', variant: 'destructive' });
      return;
    }

    try {
      await upsert.mutateAsync({
        id: editingEmbed?.id,
        fpa_client_id: clientId,
        provider: formData.provider,
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        embed_url: formData.embedUrl || null,
        iframe_html: formData.iframeHtml || null,
        is_active: formData.isActive,
        is_featured: formData.isFeatured,
        display_order: formData.displayOrder,
        access_mode: 'secure',
      } as any);
      
      toast({ 
        title: 'Sucesso', 
        description: editingEmbed ? 'Embed atualizado com sucesso' : 'Embed criado com sucesso' 
      });
      setIsDialogOpen(false);
      resetForm();
    } catch (err: any) {
      toast({ 
        title: 'Erro ao salvar', 
        description: err.message || 'Verifique os campos', 
        variant: 'destructive' 
      });
    }
  };

  const handleDelete = async (embed: ClientBIEmbed) => {
    if (!confirm('Tem certeza que deseja excluir este embed?')) return;
    
    try {
      await deleteEmbed.mutateAsync({ id: embed.id, clientId });
      toast({ title: 'Sucesso', description: 'Embed excluído com sucesso' });
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message || 'Erro ao excluir embed', variant: 'destructive' });
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(c => c.value === category);
    const IconComponent = categoryData?.icon || Monitor;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Embeds de BI Configurados ({embeds.length})</span>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Embed
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEmbed ? 'Editar Embed' : 'Novo Embed de BI'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título *</Label>
                    <Input 
                      value={formData.title} 
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex.: Painel Executivo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              <cat.icon className="h-4 w-4" />
                              {cat.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fornecedor</Label>
                    <Select 
                      value={formData.provider} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, provider: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map(p => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Ordem de Exibição</Label>
                    <Input 
                      type="number"
                      value={formData.displayOrder} 
                      onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>URL do Embed (recomendado)</Label>
                  <Input 
                    value={formData.embedUrl} 
                    onChange={(e) => setFormData(prev => ({ ...prev, embedUrl: e.target.value }))}
                    placeholder="https://app.powerbi.com/view?r=..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>HTML do Iframe (alternativo)</Label>
                  <Textarea 
                    value={formData.iframeHtml} 
                    onChange={(e) => setFormData(prev => ({ ...prev, iframeHtml: e.target.value }))}
                    rows={4}
                    placeholder="<iframe src='...'></iframe>"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea 
                    value={formData.description} 
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    placeholder="Descrição do dashboard..."
                  />
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={formData.isActive} 
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                    />
                    <Label>Ativo</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={formData.isFeatured} 
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                    />
                    <Label>Destacado</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={upsert.isPending}>
                    {upsert.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Save className="h-4 w-4 mr-2" />
                    {editingEmbed ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {embeds.length === 0 ? (
          <div className="text-center py-8">
            <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum embed configurado</p>
            <p className="text-gray-400 text-sm mt-1">
              Clique em "Novo Embed" para adicionar o primeiro dashboard
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {embeds.map((embed) => (
              <div key={embed.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getCategoryIcon(embed.category)}
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        {embed.title}
                        {embed.is_featured && <Star className="h-4 w-4 text-yellow-500" />}
                      </h4>
                    </div>
                    {embed.description && (
                      <p className="text-sm text-gray-600 mb-2">{embed.description}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge variant={embed.is_active ? 'default' : 'secondary'}>
                        {embed.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                      <Badge variant="outline">
                        {embed.category}
                      </Badge>
                      <Badge variant="outline">
                        {embed.provider}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Ordem: {embed.display_order}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => openEditDialog(embed)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(embed)}
                      disabled={deleteEmbed.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminBIEmbedManager;
