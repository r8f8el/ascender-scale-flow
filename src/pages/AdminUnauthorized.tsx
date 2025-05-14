
import React from 'react';
import { Logo } from '../components/Logo';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

const AdminUnauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex flex-col items-center">
          <Logo className="h-12 w-auto" />
          <div className="mt-4 p-3 bg-red-100 rounded-full">
            <Shield size={32} className="text-red-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Acesso Não Autorizado
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Você não tem permissão para acessar esta área do sistema.
          </p>
        </div>
        
        <div className="flex justify-center gap-4 mt-8">
          <Button 
            onClick={() => navigate('/admin')}
            variant="outline"
          >
            Voltar ao Painel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminUnauthorized;
