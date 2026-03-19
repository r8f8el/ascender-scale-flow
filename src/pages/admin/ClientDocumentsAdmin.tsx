
import React from 'react';
import DocumentManager from '@/components/admin/DocumentManager';

const ClientDocumentsAdmin = () => {
  return (
    <div className="space-y-6">
      <DocumentManager isAdmin={true} />
    </div>
  );
};

export default ClientDocumentsAdmin;
