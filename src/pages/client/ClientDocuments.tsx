
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Download, 
  Search, 
  Filter,
  Calendar,
  Eye,
  Upload,
  FolderOpen,
  File
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ClientDocuments = () => {
  const { client } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  console.log('📄 ClientDocuments - Cliente:', client?.name);

  // Dados mockados de documentos
  const documents = [
    {
      id: '1',
      filename: 'Contrato_Servicos_2024.pdf',
      category: 'Contratos',
      size: '1.2 MB',
      uploaded_at: '2024-01-15T10:30:00Z',
      type: 'application/pdf',
      description: 'Contrato principal de prestação de serviços'
    },
    {
      id: '2',
      filename: 'Relatorio_Financeiro_Jan2024.xlsx',
      category: 'Relatórios',
      size: '850 KB',
      uploaded_at: '2024-02-01T14:20:00Z',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      description: 'Relatório financeiro mensal de janeiro'
    },
    {
      id: '3',
      filename: 'Manual_Usuario_Sistema.pdf',
      category: 'Manuais',
      size: '3.4 MB',
      uploaded_at: '2024-01-20T09:15:00Z',
      type: 'application/pdf',
      description: 'Manual completo para utilização do sistema'
    },
    {
      id: '4',
      filename: 'Cronograma_Projeto_2024.docx',
      category: 'Projetos',
      size: '456 KB',
      uploaded_at: '2024-01-10T16:45:00Z',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      description: 'Cronograma detalhado do projeto 2024'
    },
    {
      id: '5',
      filename: 'Backup_Dados_Sistema.zip',
      category: 'Backups',
      size: '25.6 MB',
      uploaded_at: '2024-02-05T08:30:00Z',
      type: 'application/zip',
      description: 'Backup dos dados do sistema'
    }
  ];

  const categories = ['all', ...new Set(documents.map(doc => doc.category))];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (type.includes('spreadsheet')) return <FileText className="h-5 w-5 text-green-500" />;
    if (type.includes('document')) return <FileText className="h-5 w-5 text-blue-500" />;
    if (type.includes('zip')) return <FileText className="h-5 w-5 text-orange-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      'Contratos': 'bg-blue-100 text-blue-700',
      'Relatórios': 'bg-green-100 text-green-700',
      'Manuais': 'bg-purple-100 text-purple-700',
      'Projetos': 'bg-orange-100 text-orange-700',
      'Backups': 'bg-gray-100 text-gray-700'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatFileSize = (size: string) => {
    return size;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Documentos</h1>
          <p className="text-gray-600 mt-1">
            Gerencie e baixe seus documentos
          </p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload de Arquivo
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total de Documentos</p>
                <p className="text-2xl font-bold">{documents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FolderOpen className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Categorias</p>
                <p className="text-2xl font-bold">{categories.length - 1}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Último Upload</p>
                <p className="text-lg font-bold">05/02</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Download className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Espaço Usado</p>
                <p className="text-lg font-bold">31.5 MB</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <div className="flex gap-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category === 'all' ? 'Todos' : category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Documentos */}
      <div className="space-y-4">
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum documento encontrado</h3>
              <p className="text-gray-600">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Seus documentos aparecerão aqui quando forem enviados'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getFileIcon(document.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{document.filename}</h3>
                      <p className="text-sm text-gray-600 mb-2">{document.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(document.uploaded_at)}
                        </span>
                        <span>{formatFileSize(document.size)}</span>
                        <Badge 
                          variant="outline" 
                          className={getCategoryBadge(document.category)}
                        >
                          {document.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientDocuments;
