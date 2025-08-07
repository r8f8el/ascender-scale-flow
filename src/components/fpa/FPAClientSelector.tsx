
import React from 'react';
import { Label } from '@/components/ui/label';

interface Client {
  id: string;
  company_name: string;
}

interface FPAClientSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  clients?: Client[];
  selectedClient?: string;
  onClientSelect?: (clientId: string) => void;
}

const FPAClientSelector: React.FC<FPAClientSelectorProps> = ({
  value,
  onChange,
  label = "Cliente",
  placeholder = "Selecione um cliente",
  clients = [],
  selectedClient,
  onClientSelect
}) => {
  const handleChange = (newValue: string) => {
    onChange(newValue);
    if (onClientSelect) {
      onClientSelect(newValue);
    }
  };

  const clientsToUse = clients.length > 0 ? clients : [];
  const currentValue = selectedClient || value;

  return (
    <div>
      <Label htmlFor="client">{label}</Label>
      <select 
        id="client"
        value={currentValue}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full p-2 border rounded-md mt-1"
      >
        <option value="">{placeholder}</option>
        {clientsToUse.map((client) => (
          <option key={client.id} value={client.id}>
            {client.company_name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FPAClientSelector;
