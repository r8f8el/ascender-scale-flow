
import React from 'react';
import { Label } from '@/components/ui/label';
import { useFPAPeriods } from '@/hooks/useFPAPeriods';

interface FPAPeriodSelectorProps {
  clientId: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

const FPAPeriodSelector: React.FC<FPAPeriodSelectorProps> = ({
  clientId,
  value,
  onChange,
  label = "Período",
  placeholder = "Selecione um período"
}) => {
  const { data: periods = [], isLoading } = useFPAPeriods(clientId);

  return (
    <div>
      <Label htmlFor="period">{label}</Label>
      <select 
        id="period"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded-md mt-1"
        disabled={!clientId || isLoading}
      >
        <option value="">{isLoading ? "Carregando..." : placeholder}</option>
        {periods.map((period) => (
          <option key={period.id} value={period.id}>
            {period.period_name} ({period.period_type})
          </option>
        ))}
      </select>
    </div>
  );
};

export default FPAPeriodSelector;
