// Storage API wrapper for Lightbeam graph data

import type { GraphData } from './schema';
import { migrateData } from './migrations';

const STORAGE_KEY = 'lightbeam_graph';

export async function loadGraph(): Promise<GraphData> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const data = result[STORAGE_KEY] as GraphData | undefined;
  return migrateData(data ?? null);
}

export async function saveGraph(data: GraphData): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: data });
}
