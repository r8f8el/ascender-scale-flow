
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Star, Clock } from 'lucide-react';
import { ClientBIEmbed } from '@/hooks/useClientBIEmbeds';

interface BIEmbedSelectorProps {
  embeds: ClientBIEmbed[];
  selectedEmbed: ClientBIEmbed | null;
  onSelectEmbed: (embed: ClientBIEmbed) => void;
  isLoading: boolean;
}

const BIEmbedSelector: React.FC<BIEmbedSelectorProps> = ({
  embeds,
  selectedEmbed,
  onSelectEmbed,
  isLoading
}) => {
  const getProviderIcon = (provider: string) => {
    switch (provider?.toLowerCase()) {
      case 'powerbi':
      case 'power bi':
        return '📊';
      case 'tableau':
        return '📈';
      case 'looker':
      case 'lookerstudio':
        return '📉';
      case 'metabase':
        return '📋';
      default:
        return '📊';
    }
  };

  if (isLoading) {
    return (
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Dashboards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (embeds.length === 0) {
    return (
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Dashboards
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Monitor className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-sm text-gray-500">
            Nenhum dashboard disponível
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-blue-600" />
            <span>Dashboards</span>
            <Badge variant="outline" className="ml-1">
              {embeds.length}
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-3 space-y-2 max-h-[600px] overflow-y-auto">
        {embeds.map((embed) => (
          <button
            key={embed.id}
            onClick={() => onSelectEmbed(embed)}
            className={`w-full text-left p-3 rounded-lg border transition-all duration-200 group relative ${
              selectedEmbed?.id === embed.id
                ? 'bg-blue-50 border-blue-200 shadow-sm'
                : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50/50'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-lg flex-shrink-0">
                    {getProviderIcon(embed.provider)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-sm text-gray-900 truncate">
                      {embed.title || 'Dashboard'}
                    </h4>
                    {embed.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {embed.description}
                      </p>
                    )}
                  </div>
                </div>

                {embed.is_featured && (
                  <div className="flex-shrink-0">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  {embed.provider || 'BI'}
                </Badge>

                <div className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                  <Clock className="h-3 w-3" />
                  <span>
                    {new Date(embed.updated_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>

            {selectedEmbed?.id === embed.id && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg"></div>
            )}
          </button>
        ))}
      </CardContent>
    </Card>
  );
};

export default BIEmbedSelector;
