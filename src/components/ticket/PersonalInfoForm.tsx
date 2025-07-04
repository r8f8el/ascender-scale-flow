
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone } from 'lucide-react';

interface PersonalInfoFormProps {
  formData: {
    user_name: string;
    user_email: string;
    user_phone: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  formData,
  onInputChange
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="user_name">Nome Completo *</Label>
          <Input
            id="user_name"
            name="user_name"
            value={formData.user_name}
            onChange={onInputChange}
            required
            placeholder="Seu nome completo"
          />
        </div>
        <div>
          <Label htmlFor="user_email">Email para Contato *</Label>
          <Input
            type="email"
            id="user_email"
            name="user_email"
            value={formData.user_email}
            onChange={onInputChange}
            required
            placeholder="seu@email.com"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="user_phone">Telefone (com WhatsApp) *</Label>
        <Input
          type="tel"
          id="user_phone"
          name="user_phone"
          value={formData.user_phone}
          onChange={onInputChange}
          required
          placeholder="(11) 99999-9999"
        />
        <div className="flex items-center mt-2 text-sm text-gray-600">
          <Phone size={16} className="mr-2" />
          <span>Ao preencher, você concorda em receber notificações sobre seu chamado via SMS ou WhatsApp.</span>
        </div>
      </div>
    </>
  );
};
