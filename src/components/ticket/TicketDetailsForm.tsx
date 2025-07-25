
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface TicketDetailsFormProps {
  formData: {
    title: string;
    description: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const TicketDetailsForm: React.FC<TicketDetailsFormProps> = ({
  formData,
  onInputChange
}) => {
  return (
    <>
      <div>
        <Label htmlFor="title">Título do Chamado *</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={onInputChange}
          required
          placeholder="Resumo do seu problema ou solicitação"
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição Detalhada *</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={onInputChange}
          required
          rows={5}
          placeholder="Descreva detalhadamente seu problema ou solicitação..."
        />
      </div>
    </>
  );
};
