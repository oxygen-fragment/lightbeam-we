import { describe, it, expect } from 'vitest';
import { applyRequest } from '../src/storage/graph-updater';
import type { GraphData } from '../src/storage/schema';
import type { RequestRecord } from '../src/background/network-observer';

const emptyGraph: GraphData = {
  version: 2,
  sites: {},
  edges: [],
  lastUpdated: 0,
};

const record: RequestRecord = {
  topLevelDomain: 'example.com',
  thirdPartyDomain: 'tracker.io',
  timestamp: 1000,
  requestType: 'script',
};

describe('applyRequest', () => {
  it('creates site nodes for both domains with correct first-party flag', () => {
    const result = applyRequest(record, emptyGraph);
    expect(result.sites['example.com'].isFirstParty).toBe(true);
    expect(result.sites['tracker.io'].isFirstParty).toBe(false);
  });

  it('creates a new edge with correct fields', () => {
    const result = applyRequest(record, emptyGraph);
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0]).toMatchObject({
      from: 'example.com',
      to: 'tracker.io',
      count: 1,
      firstSeen: 1000,
      lastSeen: 1000,
    });
    expect(result.edges[0].requestTypes).toContain('script');
  });

  it('increments count and keeps one edge on repeated request', () => {
    const r1 = applyRequest(record, emptyGraph);
    const r2 = applyRequest(record, r1);
    expect(r2.edges).toHaveLength(1);
    expect(r2.edges[0].count).toBe(2);
  });

  it('adds new requestType without duplicating existing ones', () => {
    const r1 = applyRequest(record, emptyGraph);
    const imageRecord = { ...record, requestType: 'image' };
    const r2 = applyRequest(imageRecord, r1);
    expect(r2.edges[0].requestTypes).toEqual(['script', 'image']);
    // apply same type again — no duplicate
    const r3 = applyRequest(imageRecord, r2);
    expect(r3.edges[0].requestTypes).toHaveLength(2);
  });

  it('does not mutate the input graph', () => {
    const original: GraphData = { ...emptyGraph, edges: [], sites: {} };
    applyRequest(record, original);
    expect(original.edges).toHaveLength(0);
    expect(Object.keys(original.sites)).toHaveLength(0);
  });

  it('updates lastUpdated to record timestamp', () => {
    const result = applyRequest(record, emptyGraph);
    expect(result.lastUpdated).toBe(1000);
  });
});
