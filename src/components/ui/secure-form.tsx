
import React, { FormEvent, ReactNode } from 'react';
import { validateInput, sanitizeInput, checkRateLimit, logSecurityEvent } from '@/utils/security';
import { toast } from 'sonner';

interface SecureFormProps {
  children: ReactNode;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  rateLimitKey?: string;
  maxAttempts?: number;
  className?: string;
}

export const SecureForm: React.FC<SecureFormProps> = ({
  children,
  onSubmit,
  rateLimitKey,
  maxAttempts = 5,
  className = ''
}) => {
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Rate limiting check
    if (rateLimitKey && !checkRateLimit(rateLimitKey, maxAttempts)) {
      toast.error('Muitas tentativas. Tente novamente em alguns minutos.');
      await logSecurityEvent('RATE_LIMIT_EXCEEDED', `Rate limit exceeded for ${rateLimitKey}`);
      return;
    }

    // Input validation
    const formData = new FormData(e.currentTarget);
    const invalidInputs: string[] = [];

    formData.forEach((value, key) => {
      const stringValue = value.toString();
      
      if (key.includes('email') && !validateInput.email(stringValue)) {
        invalidInputs.push(`Email inválido: ${key}`);
      } else if (key.includes('phone') && !validateInput.phone(stringValue)) {
        invalidInputs.push(`Telefone inválido: ${key}`);
      } else if (key.includes('url') && stringValue && !validateInput.url(stringValue)) {
        invalidInputs.push(`URL inválida: ${key}`);
      } else if (!validateInput.text(stringValue)) {
        invalidInputs.push(`Entrada inválida detectada: ${key}`);
      }
    });

    if (invalidInputs.length > 0) {
      toast.error('Dados inválidos detectados. Verifique os campos.');
      await logSecurityEvent('INVALID_INPUT_DETECTED', 'Invalid input in form submission', { 
        invalidInputs,
        formId: rateLimitKey 
      });
      return;
    }

    // Proceed with original submit handler
    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
};
