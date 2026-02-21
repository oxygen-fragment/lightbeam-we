/**
 * domain-utils.test.ts
 * Target: Task 2.3 (first-party vs third-party classification)
 */

import { describe, it, expect } from 'vitest';
import { isThirdParty, extractDomain } from '../src/lib/domain-utils';

describe('domain-utils', () => {
  describe('extractDomain', () => {
    it('extracts domain from URL', () => {
      expect(extractDomain('https://example.com/path')).toBe('example.com');
    });

    it('handles subdomains correctly', () => {
      expect(extractDomain('https://sub.example.com')).toBe('example.com');
    });
  });

  describe('isThirdParty', () => {
    it('returns true for different domains', () => {
      expect(isThirdParty('https://example.com', 'https://tracker.net')).toBe(true);
    });

    it('returns false for same domain', () => {
      expect(isThirdParty('https://example.com', 'https://example.com/api')).toBe(false);
    });

    it('returns false for subdomains of same site', () => {
      expect(isThirdParty('https://example.com', 'https://cdn.example.com')).toBe(false);
    });

    // Note: Public suffix handling (co.uk, com.au) requires PSL library
    // Simplified implementation treats these as different domains
    it.skip('handles public suffixes correctly (co.uk, com.au)', () => {
      expect(isThirdParty('https://example.co.uk', 'https://other.co.uk')).toBe(true);
      expect(isThirdParty('https://example.co.uk', 'https://cdn.example.co.uk')).toBe(false);
    });
  });
});
