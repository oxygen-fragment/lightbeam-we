import type { GraphData } from './schema.js';
import type { RequestRecord } from '../background/network-observer.js';

/**
 * Pure function: apply one captured RequestRecord to a GraphData snapshot.
 * Upserts SiteNodes for both domains, finds-or-creates the Edge, and
 * increments count / updates timestamps. Does not mutate inputs.
 */
export function applyRequest(record: RequestRecord, graph: GraphData): GraphData {
  const now = record.timestamp;
  const { topLevelDomain: fpKey, thirdPartyDomain: tpKey } = record;

  // Upsert site nodes
  const sites = { ...graph.sites };
  sites[fpKey] = sites[fpKey]
    ? { ...sites[fpKey], lastSeen: now }
    : { domain: fpKey, firstSeen: now, lastSeen: now, isFirstParty: true };
  sites[tpKey] = sites[tpKey]
    ? { ...sites[tpKey], lastSeen: now }
    : { domain: tpKey, firstSeen: now, lastSeen: now, isFirstParty: false };

  // Find or create edge
  const edges = [...graph.edges];
  const idx = edges.findIndex((e) => e.from === fpKey && e.to === tpKey);

  if (idx >= 0) {
    const existing = edges[idx];
    edges[idx] = {
      ...existing,
      count: existing.count + 1,
      lastSeen: now,
      requestTypes: existing.requestTypes.includes(record.requestType)
        ? existing.requestTypes
        : [...existing.requestTypes, record.requestType],
    };
  } else {
    edges.push({
      from: fpKey,
      to: tpKey,
      requestTypes: [record.requestType],
      count: 1,
      firstSeen: now,
      lastSeen: now,
    });
  }

  return { ...graph, sites, edges, lastUpdated: now };
}
