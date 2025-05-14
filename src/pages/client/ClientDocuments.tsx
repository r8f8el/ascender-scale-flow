
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Folder, File, Download, FileSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock folder and file structure
const mockFolders = {
  'Documentos Gerais': [
    { name: 'Apresentação Institucional.pdf', lastModified: '2023-09-15' },
    { name: 'Resumo de Serviços.docx', lastModified: '2023-10-20' },
  ],
  'Contratos e Aditivos': [
    { name: 'Contrato de Prestação de Serviços.pdf', lastModified: '2023-08-01' },
    { name: 'Aditivo 01 - Ampliação de Escopo.pdf', lastModified: '2023-11-10' },
  ],
  'Relatórios Financeiros': [
    { name: 'Análise Financeira Q3-2023.xlsx', lastModified: '2023-10-05' },
    { name: 'Projeção Anual 2024.pdf', lastModified: '2023-12-01' },
    { name: 'Relatório de Desempenho.pdf', lastModified: '2023-12-15' },
  ],
  'Propostas e Planejamentos': [
    { name: 'Planejamento Estratégico 2024.pptx', lastModified: '2023-11-25' },
  ],
  'Apresentações e Reuniões': [
    { name: 'Apresentação Resultados Q4.pptx', lastModified: '2023-12-20' },
    { name: 'Ata de Reunião - Dez 2023.pdf', lastModified: '2023-12-21' },
  ],
  'Documentos Legais': [
    { name: 'Certificado de Compliance 2023.pdf', lastModified: '2023-07-30' },
  ],
  'Outros Documentos': [],
};

const ClientDocuments = () => {
  const { client } = useAuth();
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleFolderClick = (folder: string) => {
    setCurrentFolder(folder);
    setSearchQuery('');
  };

  const handleBackClick = () => {
    setCurrentFolder(null);
    setSearchQuery('');
  };

  const handleDownload = (fileName: string) => {
    // In a real app, this would trigger a download
    alert(`Download iniciado: ${fileName}`);
  };

  const filterFiles = () => {
    if (!searchQuery) return mockFolders;
    
    const results: Record<string, Array<{name: string, lastModified: string}>> = {};
    
    Object.entries(mockFolders).forEach(([folder, files]) => {
      const matchingFiles = files.filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (matchingFiles.length > 0) {
        results[folder] = matchingFiles;
      }
    });
    
    return results;
  };

  const filteredContent = filterFiles();

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {currentFolder 
              ? `${currentFolder} - ${client?.name}`
              : `Documentos - ${client?.name}`}
          </h1>
          <p className="text-gray-600 mt-1">
            {currentFolder 
              ? 'Visualize e baixe os arquivos disponíveis nesta pasta'
              : 'Acesse os documentos organizados por categoria'}
          </p>
        </div>
        
        <div className="w-full sm:w-64">
          <div className="relative">
            <FileSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md w-full"
            />
          </div>
        </div>
      </div>
      
      {currentFolder ? (
        <>
          <Button 
            variant="outline" 
            onClick={handleBackClick}
            className="mb-4"
          >
            ← Voltar para pastas
          </Button>
          
          <div className="bg-white rounded-lg border">
            {filteredContent[currentFolder]?.length > 0 ? (
              <div className="divide-y">
                {filteredContent[currentFolder].map((file, index) => (
                  <div key={index} className="flex justify-between items-center p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <File size={20} className="text-blue-600" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-gray-500">Atualizado em: {file.lastModified}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={() => handleDownload(file.name)}
                    >
                      <Download size={16} />
                      <span>Baixar</span>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhum arquivo encontrado nesta pasta.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(filteredContent).map((folder) => (
            <div
              key={folder}
              className="bg-white p-4 rounded-lg border cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
              onClick={() => handleFolderClick(folder)}
            >
              <div className="flex items-center gap-3 mb-2">
                <Folder size={24} className="text-blue-600" />
                <h3 className="font-medium">{folder}</h3>
              </div>
              <p className="text-sm text-gray-500">
                {filteredContent[folder].length} arquivo(s)
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientDocuments;
