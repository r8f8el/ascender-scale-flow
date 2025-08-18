
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PersonalInfoFormProps {
  formData: {
    user_name: string;
    user_email: string;
    user_phone: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  formData,
  onInputChange
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="user_name">Nome Completo *</Label>
        <Input
          id="user_name"
          name="user_name"
          value={formData.user_name}
          onChange={(e) => onInputChange('user_name', e.target.value)}
          required
          placeholder="Seu nome completo"
        />
      </div>

      <div>
        <Label htmlFor="user_email">E-mail *</Label>
        <Input
          id="user_email"
          name="user_email"
          type="email"
          value={formData.user_email}
          onChange={(e) => onInputChange('user_email', e.target.value)}
          required
          placeholder="seu@email.com"
        />
      </div>

      <div>
        <Label htmlFor="user_phone">Telefone</Label>
        <Input
          id="user_phone"
          name="user_phone"
          value={formData.user_phone}
          onChange={(e) => onInputChange('user_phone', e.target.value)}
          placeholder="(11) 99999-9999"
        />
      </div>
    </div>
  );
};
