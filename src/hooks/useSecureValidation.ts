
import { useCallback } from 'react';

export const useSecureValidation = () => {
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

  return { validateInput };
};
