// Network request observer for Lightbeam

import { extractDomain, isThirdParty } from '../lib/domain-utils';
import { loadGraph, saveGraph } from '../storage/storage-api';
import { applyRequest } from '../storage/graph-updater';
import type { GraphData } from '../storage/schema';

export interface RequestRecord {
  topLevelDomain: string;
  thirdPartyDomain: string;
  timestamp: number;
  requestType: string;
}

const DEBOUNCE_MS = 500;

// In-memory buffer; null means no pending writes since last flush
let pendingGraph: GraphData | null = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

async function persistRecord(record: RequestRecord): Promise<void> {
  // Load from storage on first call or after a flush
  if (pendingGraph === null) {
    pendingGraph = await loadGraph();
  }
  pendingGraph = applyRequest(record, pendingGraph);

  // Reset debounce window — only one setTimeout is active at a time
  if (saveTimer !== null) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if (pendingGraph !== null) {
      saveGraph(pendingGraph); // fire-and-forget; loss acceptable per ADR-001
      pendingGraph = null;
    }
    saveTimer = null;
  }, DEBOUNCE_MS);
}

export function initNetworkObserver(): void {
  chrome.webRequest.onCompleted.addListener(
    async (details) => {
      if (details.tabId < 0) return; // Ignore non-tab requests

      try {
        const tab = await chrome.tabs.get(details.tabId);
        if (!tab.url) return;
        if (!isThirdParty(tab.url, details.url)) return; // Skip first-party

        const record: RequestRecord = {
          topLevelDomain: extractDomain(tab.url),
          thirdPartyDomain: extractDomain(details.url),
          timestamp: details.timeStamp,
          requestType: details.type,
        };

        await persistRecord(record);
      } catch {
        // Tab may have closed before we could query it
      }
    },
    { urls: ['<all_urls>'] }
  );
}
