// Network request observer for Lightbeam

import { extractDomain, isThirdParty } from '../lib/domain-utils';

export interface RequestRecord {
  topLevelDomain: string;
  thirdPartyDomain: string;
  timestamp: number;
  requestType: string;
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

        console.log('Request record:', JSON.stringify(record));
      } catch {
        // Tab may have closed before we could query it
      }
    },
    { urls: ['<all_urls>'] }
  );
}
