
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Monitor, Star, BarChart3, PieChart, TrendingUp, Activity } from 'lucide-react';
import { ClientBIEmbed } from '@/hooks/useClientBIEmbeds';

interface BIEmbedSelectorProps {
  embeds: ClientBIEmbed[];
  selectedEmbed: ClientBIEmbed | null;
  onSelectEmbed: (embed: ClientBIEmbed) => void;
  isLoading?: boolean;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'dashboard':
      return <Monitor className="h-4 w-4" />;
    case 'report':
      return <BarChart3 className="h-4 w-4" />;
    case 'analytics':
      return <TrendingUp className="h-4 w-4" />;
    case 'kpi':
      return <Activity className="h-4 w-4" />;
    default:
      return <PieChart className="h-4 w-4" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'dashboard':
      return 'bg-blue-100 text-blue-800';
    case 'report':
      return 'bg-green-100 text-green-800';
    case 'analytics':
      return 'bg-purple-100 text-purple-800';
    case 'kpi':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const BIEmbedSelector: React.FC<BIEmbedSelectorProps> = ({
  embeds,
  selectedEmbed,
  onSelectEmbed,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dashboards Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (embeds.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dashboards Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum dashboard configurado</p>
            <p className="text-gray-400 text-sm mt-1">
              Entre em contato com seu consultor para configurar os dashboards
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboards Disponíveis ({embeds.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {embeds.map((embed) => (
            <div
              key={embed.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedEmbed?.id === embed.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => onSelectEmbed(embed)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(embed.category)}
                    <h4 className="font-medium text-gray-900">
                      {embed.title || 'Dashboard'}
                      {embed.is_featured && (
                        <Star className="h-4 w-4 text-yellow-500 ml-1 inline" />
                      )}
                    </h4>
                  </div>
                  {embed.description && (
                    <p className="text-sm text-gray-600 mb-2">{embed.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getCategoryColor(embed.category)}>
                      {embed.category.charAt(0).toUpperCase() + embed.category.slice(1)}
                    </Badge>
                    <Badge variant="outline">
                      {embed.provider || 'Outro'}
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={selectedEmbed?.id === embed.id ? 'default' : 'outline'}
                >
                  {selectedEmbed?.id === embed.id ? 'Selecionado' : 'Selecionar'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BIEmbedSelector;
