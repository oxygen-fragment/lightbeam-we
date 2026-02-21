/**
 * schema.test.ts
 * Target: Task 3.4 (schema versioning and migration)
 */

import { describe, it, expect } from 'vitest';
import { migrateData, CURRENT_VERSION } from '../src/storage/migrations';
import type { GraphData } from '../src/storage/schema';

describe('schema migrations', () => {
  describe('version detection', () => {
    it('initializes empty storage with current version', () => {
      const result = migrateData(null);
      expect(result.version).toBe(CURRENT_VERSION);
      expect(result.sites).toEqual({});
      expect(result.edges).toEqual([]);
      expect(result.lastUpdated).toBeGreaterThan(0);
    });

    it('preserves data at current version', () => {
      const data: GraphData = {
        version: 2,
        sites: {},
        edges: [],
        lastUpdated: 1234567890,
      };
      const result = migrateData(data);
      expect(result.version).toBe(2);
      expect(result.lastUpdated).toBe(1234567890);
    });
  });

  describe('v1 to v2 migration', () => {
    it('migrates v1 schema to v2', () => {
      // v1 data doesn't have lastUpdated - use unknown cast
      const v1Data = {
        version: 1,
        sites: {},
        edges: [],
      } as unknown as GraphData;
      const result = migrateData(v1Data);
      expect(result.version).toBe(2);
      expect(result.lastUpdated).toBeGreaterThan(0);
    });

    it('preserves site data during migration', () => {
      const v1Data = {
        version: 1,
        sites: {
          'example.com': {
            domain: 'example.com',
            firstSeen: 1234567890,
            lastSeen: 1234567890,
            isFirstParty: true,
          },
        },
        edges: [],
      } as unknown as GraphData;
      const result = migrateData(v1Data);
      expect(result.sites['example.com'].firstSeen).toBe(1234567890);
    });
  });

  describe('migration chain', () => {
    it('applies migrations sequentially for old versions', () => {
      const v1Data = {
        version: 1,
        sites: {},
        edges: [],
      } as unknown as GraphData;
      const result = migrateData(v1Data);
      expect(result.version).toBe(CURRENT_VERSION);
    });
  });
});
