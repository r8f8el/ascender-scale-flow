
import { useCallback, useState } from 'react';

interface ValidationRule {
  field: string;
  validator: (value: string) => boolean;
  message: string;
}

interface ValidationOptions {
  required?: string[];
  maxLength?: Record<string, number>;
  sanitize?: boolean;
}

export const useSecureValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateInput = useCallback((value: string, fieldType: string): string => {
    if (!value || typeof value !== 'string') {
      return '';
    }

    // Basic sanitization - remove dangerous characters
    const sanitized = value.trim();
    
    switch (fieldType) {
      case 'email':
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(sanitized) ? sanitized : '';
        
      case 'password':
        // Allow passwords with reasonable characters
        return sanitized.length >= 6 ? sanitized : '';
        
      default:
        // For other fields, just return sanitized value
        return sanitized;
    }
  }, []);

  const sanitizeInput = useCallback((value: string): string => {
    if (!value || typeof value !== 'string') {
      return '';
    }
    
    // Basic sanitization - remove dangerous characters and trim
    return value.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }, []);

  const validateForm = useCallback((
    data: Record<string, any>,
    rules: ValidationRule[],
    options: ValidationOptions = {}
  ): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Check required fields
    if (options.required) {
      for (const field of options.required) {
        if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
          newErrors[field] = `${field} é obrigatório`;
        }
      }
    }
    
    // Check max length
    if (options.maxLength) {
      for (const [field, maxLen] of Object.entries(options.maxLength)) {
        if (data[field] && data[field].length > maxLen) {
          newErrors[field] = `${field} deve ter no máximo ${maxLen} caracteres`;
        }
      }
    }
    
    // Apply custom validation rules
    for (const rule of rules) {
      if (data[rule.field] && !rule.validator(data[rule.field])) {
        newErrors[rule.field] = rule.message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return { 
    validateInput, 
    sanitizeInput, 
    validateForm, 
    errors, 
    clearErrors 
  };
};
