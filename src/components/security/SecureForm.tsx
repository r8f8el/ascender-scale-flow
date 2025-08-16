
import React, { useState, useCallback } from 'react';
import { useSecurityContext } from './SecureAuthWrapper';
import { useSecureValidation } from '@/hooks/useSecureValidation';
import { toast } from 'sonner';

interface SecureFormProps {
  children: React.ReactNode;
  onSubmit: (data: any) => Promise<void>;
  formType: 'login' | 'signup' | 'password_reset' | 'general';
  className?: string;
}

export const SecureForm: React.FC<SecureFormProps> = ({
  children,
  onSubmit,
  formType,
  className
}) => {
  const { logSecurityEvent } = useSecurityContext();
  const { validateInput } = useSecureValidation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [csrfToken] = useState(() => crypto.randomUUID());

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (isSubmitting) return;

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Validate CSRF token
    if (formData.get('csrf_token') !== csrfToken) {
      await logSecurityEvent('csrf_token_mismatch', 'form', {
        form_type: formType,
        timestamp: new Date().toISOString()
      });
      toast.error('Erro de segurança. Tente novamente.');
      return;
    }

    // Validate all inputs
    const validatedData: Record<string, any> = {};
    let hasValidationError = false;

    for (const [key, value] of Object.entries(data)) {
      if (key === 'csrf_token') continue;
      
      const validatedValue = validateInput(value as string, key);
      if (validatedValue === null) {
        await logSecurityEvent('input_validation_failed', 'form', {
          form_type: formType,
          field: key,
          timestamp: new Date().toISOString()
        });
        
        if (key === 'email') {
          toast.error('Por favor, insira um email válido');
        } else if (key === 'password') {
          toast.error('A senha deve ter pelo menos 6 caracteres');
        } else {
          toast.error(`Campo ${key} inválido`);
        }
        hasValidationError = true;
        break;
      }
      validatedData[key] = validatedValue;
    }

    if (hasValidationError) return;

    setIsSubmitting(true);
    try {
      await onSubmit(validatedData);
    } finally {
      setIsSubmitting(false);
    }
  }, [csrfToken, formType, logSecurityEvent, validateInput, isSubmitting, onSubmit]);

  return (
    <form onSubmit={handleSubmit} className={className}>
      <input type="hidden" name="csrf_token" value={csrfToken} />
      {children}
    </form>
  );
};
