
import React from 'react';
import { Label } from '@/components/ui/label';
import { useFPAClients } from '@/hooks/useFPAClients';

interface FPAClientSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

const FPAClientSelector: React.FC<FPAClientSelectorProps> = ({
  value,
  onChange,
  label = "Cliente",
  placeholder = "Selecione um cliente"
}) => {
  const { data: clients = [], isLoading } = useFPAClients();

  return (
    <div>
      <Label htmlFor="client">{label}</Label>
      <select 
        id="client"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded-md mt-1"
        disabled={isLoading}
      >
        <option value="">{isLoading ? "Carregando..." : placeholder}</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.company_name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FPAClientSelector;
