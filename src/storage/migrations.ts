// Schema migrations for Lightbeam storage

import type { GraphData } from './schema';

export const CURRENT_VERSION = 2;

export function createEmptyGraph(): GraphData {
  return {
    version: CURRENT_VERSION,
    sites: {},
    edges: [],
    lastUpdated: Date.now(),
  };
}

function migrateV1toV2(data: GraphData): GraphData {
  return {
    ...data,
    version: 2,
    lastUpdated: Date.now(),
  };
}

export function migrateData(data: GraphData | null): GraphData {
  if (!data) {
    return createEmptyGraph();
  }

  if (data.version < 2) {
    data = migrateV1toV2(data);
  }

  return data;
}
