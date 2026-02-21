/**
 * sanitize.test.ts
 * Target: Task 6.3 (input sanitization for display)
 */

import { describe, it, expect } from 'vitest';
import { sanitizeForDisplay } from '../src/lib/sanitize';

describe('sanitize', () => {
  describe('sanitizeForDisplay', () => {
    it('escapes HTML script tags', () => {
      const input = '<script>alert(1)</script>';
      const result = sanitizeForDisplay(input);
      expect(result).not.toContain('<script>');
      expect(result).toContain('&lt;script&gt;');
    });

    it('escapes HTML entities', () => {
      expect(sanitizeForDisplay('<div>')).toBe('&lt;div&gt;');
      expect(sanitizeForDisplay('"quotes"')).toBe('&quot;quotes&quot;');
      expect(sanitizeForDisplay("'apostrophe'")).toBe('&#39;apostrophe&#39;');
    });

    it('handles ampersands', () => {
      expect(sanitizeForDisplay('foo & bar')).toBe('foo &amp; bar');
    });

    it('preserves safe strings', () => {
      expect(sanitizeForDisplay('example.com')).toBe('example.com');
      expect(sanitizeForDisplay('normal text 123')).toBe('normal text 123');
    });

    it('handles null/undefined gracefully', () => {
      expect(sanitizeForDisplay(null)).toBe('');
      expect(sanitizeForDisplay(undefined)).toBe('');
    });

    it('truncates excessively long strings', () => {
      const longString = 'a'.repeat(10000);
      const result = sanitizeForDisplay(longString);
      expect(result.length).toBeLessThanOrEqual(1000);
    });
  });
});
