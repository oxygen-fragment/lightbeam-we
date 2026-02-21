// Storage API wrapper for Lightbeam graph data

import type { GraphData } from './schema';
import { migrateData } from './migrations';
import { pruneOldEntries } from './pruning';

const STORAGE_KEY = 'lightbeam_graph';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function loadGraph(): Promise<GraphData> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const data = result[STORAGE_KEY] as GraphData | undefined;
  return pruneOldEntries(migrateData(data ?? null), MAX_AGE_MS);
}

export async function saveGraph(data: GraphData): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: data });
}
