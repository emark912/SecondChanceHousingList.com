/**
 * Format a number string with commas as thousand separators
 * @param value - The input value (can contain commas)
 * @returns Formatted number string with commas
 */
export function formatNumberWithCommas(value: string): string {
  if (!value) return '';
  
  // Remove all non-digit characters
  const digitsOnly = value.replace(/\D/g, '');
  
  // Add commas every 3 digits from the right
  return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Remove all commas from a number string
 * @param value - The input value with commas
 * @returns Number string without commas
 */
export function removeCommas(value: string): string {
  return value.replace(/,/g, '');
}

/**
 * Parse a formatted number string to a number
 * @param value - The formatted number string
 * @returns Parsed number
 */
export function parseFormattedNumber(value: string): number {
  return parseInt(removeCommas(value), 10);
}
