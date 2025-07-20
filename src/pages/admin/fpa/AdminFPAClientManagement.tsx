
import React from 'react';
import FPAClientManager from '@/components/fpa/FPAClientManager';

const AdminFPAClientManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Clientes FP&A</h1>
        <p className="text-gray-600 mt-1">
          Gerencie clientes, onboarding e análises financeiras
        </p>
      </div>
      
      <FPAClientManager />
    </div>
  );
};

export default AdminFPAClientManagement;
