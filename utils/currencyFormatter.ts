/**
 * Currency formatting utilities for the MvamaConnect app
 * Formats currency amounts with comma separators and two decimal places
 */

/**
 * Formats a number or string amount as currency with comma separators and two decimal places
 * @param amount - The amount to format (number or string)
 * @param currency - The currency symbol (default: 'MK')
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | string, currency: string = 'MK'): string => {
  try {
    // Convert to number if it's a string
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // Check if the amount is valid
    if (isNaN(numericAmount)) {
      return `${currency}0.00`;
    }
    
    // Format with comma separators and two decimal places
    const formatted = numericAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true
    });
    
    return `${currency}${formatted}`;
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${currency}0.00`;
  }
};

/**
 * Formats a number or string amount as currency without the currency symbol
 * @param amount - The amount to format (number or string)
 * @returns Formatted amount string with commas and two decimal places
 */
export const formatAmount = (amount: number | string): string => {
  try {
    // Convert to number if it's a string
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // Check if the amount is valid
    if (isNaN(numericAmount)) {
      return '0.00';
    }
    
    // Format with comma separators and two decimal places
    return numericAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true
    });
  } catch (error) {
    console.error('Error formatting amount:', error);
    return '0.00';
  }
};

/**
 * Parses a currency string and returns the numeric value
 * @param currencyString - The currency string to parse (e.g., "MK1,234.56")
 * @returns The numeric value
 */
export const parseCurrency = (currencyString: string): number => {
  try {
    // Remove currency symbols and commas
    const cleanString = currencyString.replace(/[^\d.-]/g, '');
    const numericValue = parseFloat(cleanString);
    return isNaN(numericValue) ? 0 : numericValue;
  } catch (error) {
    console.error('Error parsing currency:', error);
    return 0;
  }
};

/**
 * Validates if a string is a valid currency amount
 * @param amount - The amount string to validate
 * @returns True if valid, false otherwise
 */
export const isValidCurrency = (amount: string): boolean => {
  try {
    const numericAmount = parseFloat(amount);
    return !isNaN(numericAmount) && numericAmount >= 0;
  } catch (error) {
    return false;
  }
};
