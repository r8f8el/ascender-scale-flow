// CNPJ validation utilities

export const formatCNPJ = (value: string): string => {
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, '');
  
  // Apply CNPJ mask XX.XXX.XXX/XXXX-XX
  if (numbers.length <= 14) {
    return numbers
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  
  return numbers.slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
};

export const validateCNPJ = (cnpj: string): boolean => {
  // Remove all non-numeric characters
  const numbers = cnpj.replace(/\D/g, '');
  
  // Check if has 14 digits
  if (numbers.length !== 14) {
    return false;
  }
  
  // Check if all digits are the same
  if (/^(\d)\1{13}$/.test(numbers)) {
    return false;
  }
  
  // Validate check digits
  let sum = 0;
  let weight = 2;
  
  // First check digit
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(numbers[i]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  
  let checkDigit1 = sum % 11;
  checkDigit1 = checkDigit1 < 2 ? 0 : 11 - checkDigit1;
  
  if (parseInt(numbers[12]) !== checkDigit1) {
    return false;
  }
  
  // Second check digit
  sum = 0;
  weight = 2;
  
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(numbers[i]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  
  let checkDigit2 = sum % 11;
  checkDigit2 = checkDigit2 < 2 ? 0 : 11 - checkDigit2;
  
  return parseInt(numbers[13]) === checkDigit2;
};

export const cleanCNPJ = (cnpj: string): string => {
  return cnpj.replace(/\D/g, '');
};