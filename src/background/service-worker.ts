// Lightbeam MV3 Service Worker

import { initNetworkObserver } from './network-observer';

console.log('Lightbeam service worker started');

chrome.runtime.onInstalled.addListener(() => {
  console.log('Lightbeam extension installed');
});

initNetworkObserver();
