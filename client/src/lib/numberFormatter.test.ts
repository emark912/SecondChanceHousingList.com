import { describe, it, expect } from 'vitest';
import { formatNumberWithCommas, removeCommas, parseFormattedNumber } from './numberFormatter';

describe('Number Formatter Utility', () => {
  describe('formatNumberWithCommas', () => {
    it('should format a number with commas', () => {
      expect(formatNumberWithCommas('30000')).toBe('30,000');
    });

    it('should handle numbers with existing commas', () => {
      expect(formatNumberWithCommas('30,000')).toBe('30,000');
    });

    it('should handle large numbers', () => {
      expect(formatNumberWithCommas('1000000')).toBe('1,000,000');
    });

    it('should handle small numbers', () => {
      expect(formatNumberWithCommas('100')).toBe('100');
    });

    it('should handle empty string', () => {
      expect(formatNumberWithCommas('')).toBe('');
    });

    it('should remove non-digit characters', () => {
      expect(formatNumberWithCommas('30,0a0b0')).toBe('30,000');
    });

    it('should handle numbers with special characters', () => {
      expect(formatNumberWithCommas('$30,000')).toBe('30,000');
    });
  });

  describe('removeCommas', () => {
    it('should remove commas from formatted number', () => {
      expect(removeCommas('30,000')).toBe('30000');
    });

    it('should handle numbers without commas', () => {
      expect(removeCommas('30000')).toBe('30000');
    });

    it('should handle large numbers with multiple commas', () => {
      expect(removeCommas('1,000,000')).toBe('1000000');
    });

    it('should handle empty string', () => {
      expect(removeCommas('')).toBe('');
    });
  });

  describe('parseFormattedNumber', () => {
    it('should parse formatted number to integer', () => {
      expect(parseFormattedNumber('30,000')).toBe(30000);
    });

    it('should parse number without commas', () => {
      expect(parseFormattedNumber('30000')).toBe(30000);
    });

    it('should handle large numbers', () => {
      expect(parseFormattedNumber('1,000,000')).toBe(1000000);
    });

    it('should handle empty string', () => {
      expect(parseFormattedNumber('')).toBe(NaN);
    });
  });
});
