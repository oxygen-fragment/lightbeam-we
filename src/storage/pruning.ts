import type { GraphData } from './schema.js';

/**
 * Remove edges last seen before (Date.now() - maxAge) and any site nodes
 * that are no longer referenced by any remaining edge.
 */
export function pruneOldEntries(data: GraphData, maxAge: number): GraphData {
  const cutoff = Date.now() - maxAge;

  const edges = data.edges.filter((e) => e.lastSeen >= cutoff);

  // Collect domains still referenced by surviving edges
  const referenced = new Set<string>();
  for (const e of edges) {
    referenced.add(e.from);
    referenced.add(e.to);
  }

  const sites: GraphData['sites'] = {};
  for (const [domain, node] of Object.entries(data.sites)) {
    if (referenced.has(domain)) {
      sites[domain] = node;
    }
  }

  return { ...data, edges, sites, lastUpdated: Date.now() };
}
