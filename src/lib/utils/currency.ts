import { CURRENCY } from '../constants';

/**
 * Format a numeric string as Philippine Peso.
 * @param value - Numeric string (e.g., "1234.56")
 * @returns Formatted string (e.g., "₱1,234.56")
 */
export function formatPHP(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return `${CURRENCY}0.00`;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return `${CURRENCY}0.00`;
  return `${CURRENCY}${num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Parse a formatted PHP string back to a numeric string.
 * @param value - Formatted string (e.g., "₱1,234.56" or "1234.56")
 * @returns Clean numeric string (e.g., "1234.56")
 */
export function parsePHP(value: string): string {
  const cleaned = value.replace(/[₱,\s]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num)) return '0.00';
  return num.toFixed(2);
}
