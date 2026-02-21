// Domain classification utilities

export function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    // Extract registrable domain (simplified: last 2 parts)
    const parts = hostname.split('.');
    if (parts.length <= 2) return hostname;
    return parts.slice(-2).join('.');
  } catch {
    return '';
  }
}

export function isThirdParty(tabUrl: string, requestUrl: string): boolean {
  const tabDomain = extractDomain(tabUrl);
  const requestDomain = extractDomain(requestUrl);
  if (!tabDomain || !requestDomain) return false;
  return tabDomain !== requestDomain;
}
