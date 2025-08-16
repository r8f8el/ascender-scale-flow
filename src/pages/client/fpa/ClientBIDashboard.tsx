
import React, { useEffect, useState } from 'react';
import { useClientBIEmbeds, useCurrentClientId, ClientBIEmbed } from '@/hooks/useClientBIEmbeds';
import BIEmbedSelector from '@/components/fpa/BIEmbedSelector';
import BIEmbedViewer from '@/components/fpa/BIEmbedViewer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const ClientBIDashboard: React.FC = () => {
  const { data: currentClientId, isLoading: loadingClientId } = useCurrentClientId();
  const { data: embeds = [], isLoading: loadingEmbeds } = useClientBIEmbeds(currentClientId);
  const [selectedEmbed, setSelectedEmbed] = useState<ClientBIEmbed | null>(null);
  
  useEffect(() => {
    document.title = 'Painel de BI | Ascalate';
  }, []);

  // Auto-select the first featured embed or first embed
  useEffect(() => {
    if (embeds.length > 0 && !selectedEmbed) {
      const featuredEmbed = embeds.find(embed => embed.is_featured);
      setSelectedEmbed(featuredEmbed || embeds[0]);
    }
  }, [embeds, selectedEmbed]);

  const isLoading = loadingClientId || loadingEmbeds;

  if (!currentClientId && !loadingClientId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Painel de BI</h1>
            <p className="text-gray-600 mt-1">Análises e relatórios financeiros</p>
          </div>
        </div>
        
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Cliente FP&A não encontrado</p>
              <p>Você precisa estar cadastrado como cliente FP&A para acessar os dashboards de BI.</p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Painel de BI</h1>
          <p className="text-gray-600 mt-1">Análises e relatórios financeiros personalizados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar com seletor de embeds */}
        <div className="lg:col-span-1">
          <BIEmbedSelector
            embeds={embeds}
            selectedEmbed={selectedEmbed}
            onSelectEmbed={setSelectedEmbed}
            isLoading={isLoading}
          />
        </div>

        {/* Área principal com o embed selecionado */}
        <div className="lg:col-span-3">
          <BIEmbedViewer embed={selectedEmbed} />
        </div>
      </div>
    </div>
  );
};

export default ClientBIDashboard;
