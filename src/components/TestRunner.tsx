
import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TestCase {
  id: string;
  name: string;
  description: string;
  category: 'ui' | 'api' | 'integration' | 'performance';
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  error?: string;
  testFunction: () => Promise<boolean>;
}

const TestRunner = () => {
  const [tests, setTests] = useState<TestCase[]>([
    {
      id: 'auth-login',
      name: 'Login de Usuário',
      description: 'Testa o processo de login com credenciais válidas',
      category: 'integration',
      status: 'pending',
      testFunction: async () => {
        // Simulação de teste de login
        await new Promise(resolve => setTimeout(resolve, 1000));
        return Math.random() > 0.2; // 80% chance de sucesso
      }
    },
    {
      id: 'client-dashboard',
      name: 'Dashboard do Cliente',
      description: 'Verifica se o dashboard carrega corretamente',
      category: 'ui',
      status: 'pending',
      testFunction: async () => {
        await new Promise(resolve => setTimeout(resolve, 800));
        return Math.random() > 0.1; // 90% chance de sucesso
      }
    },
    {
      id: 'fpa-data-load',
      name: 'Carregamento de Dados FP&A',
      description: 'Testa a carga de dados financeiros',
      category: 'api',
      status: 'pending',
      testFunction: async () => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return Math.random() > 0.3; // 70% chance de sucesso
      }
    },
    {
      id: 'document-upload',
      name: 'Upload de Documentos',
      description: 'Testa o processo de upload de arquivos',
      category: 'integration',
      status: 'pending',
      testFunction: async () => {
        await new Promise(resolve => setTimeout(resolve, 1200));
        return Math.random() > 0.25; // 75% chance de sucesso
      }
    },
    {
      id: 'notification-system',
      name: 'Sistema de Notificações',
      description: 'Verifica o envio de notificações',
      category: 'integration',
      status: 'pending',
      testFunction: async () => {
        await new Promise(resolve => setTimeout(resolve, 600));
        return Math.random() > 0.15; // 85% chance de sucesso
      }
    },
    {
      id: 'page-performance',
      name: 'Performance de Carregamento',
      description: 'Mede o tempo de carregamento das páginas principais',
      category: 'performance',
      status: 'pending',
      testFunction: async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return Math.random() > 0.4; // 60% chance de sucesso
      }
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const runAllTests = async () => {
    setIsRunning(true);
    setProgress(0);

    const updatedTests = [...tests];
    
    for (let i = 0; i < updatedTests.length; i++) {
      updatedTests[i].status = 'running';
      setTests([...updatedTests]);

      const startTime = Date.now();
      
      try {
        const result = await updatedTests[i].testFunction();
        const duration = Date.now() - startTime;
        
        updatedTests[i].status = result ? 'passed' : 'failed';
        updatedTests[i].duration = duration;
        
        if (!result) {
          updatedTests[i].error = 'Teste falhou na validação';
        }
      } catch (error: any) {
        updatedTests[i].status = 'failed';
        updatedTests[i].duration = Date.now() - startTime;
        updatedTests[i].error = error.message;
      }

      setTests([...updatedTests]);
      setProgress(((i + 1) / updatedTests.length) * 100);
    }

    setIsRunning(false);
  };

  const runSingleTest = async (testId: string) => {
    const updatedTests = [...tests];
    const testIndex = updatedTests.findIndex(t => t.id === testId);
    
    if (testIndex === -1) return;

    updatedTests[testIndex].status = 'running';
    setTests([...updatedTests]);

    const startTime = Date.now();
    
    try {
      const result = await updatedTests[testIndex].testFunction();
      const duration = Date.now() - startTime;
      
      updatedTests[testIndex].status = result ? 'passed' : 'failed';
      updatedTests[testIndex].duration = duration;
      
      if (!result) {
        updatedTests[testIndex].error = 'Teste falhou na validação';
      } else {
        updatedTests[testIndex].error = undefined;
      }
    } catch (error: any) {
      updatedTests[testIndex].status = 'failed';
      updatedTests[testIndex].duration = Date.now() - startTime;
      updatedTests[testIndex].error = error.message;
    }

    setTests([...updatedTests]);
  };

  const getStatusIcon = (status: TestCase['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getCategoryColor = (category: TestCase['category']) => {
    switch (category) {
      case 'ui':
        return 'bg-blue-100 text-blue-800';
      case 'api':
        return 'bg-green-100 text-green-800';
      case 'integration':
        return 'bg-purple-100 text-purple-800';
      case 'performance':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: tests.length,
    passed: tests.filter(t => t.status === 'passed').length,
    failed: tests.filter(t => t.status === 'failed').length,
    running: tests.filter(t => t.status === 'running').length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Test Runner</h1>
          <p className="text-gray-600">Execute testes automatizados do sistema</p>
        </div>
        
        <Button 
          onClick={runAllTests} 
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          <Play className="h-4 w-4" />
          {isRunning ? 'Executando...' : 'Executar Todos os Testes'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
              <div className="text-sm text-gray-500">Passou</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-sm text-gray-500">Falhou</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.running}</div>
              <div className="text-sm text-gray-500">Executando</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      {isRunning && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso dos Testes</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Cases */}
      <Card>
        <CardHeader>
          <CardTitle>Casos de Teste</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {tests.map((test) => (
                <div 
                  key={test.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(test.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">{test.name}</h3>
                        <Badge className={getCategoryColor(test.category)}>
                          {test.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{test.description}</p>
                      {test.duration && (
                        <p className="text-xs text-gray-400 mt-1">
                          Executado em {test.duration}ms
                        </p>
                      )}
                      {test.error && (
                        <p className="text-xs text-red-600 mt-1">
                          Erro: {test.error}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runSingleTest(test.id)}
                    disabled={isRunning || test.status === 'running'}
                  >
                    {test.status === 'running' ? 'Rodando...' : 'Executar'}
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestRunner;
