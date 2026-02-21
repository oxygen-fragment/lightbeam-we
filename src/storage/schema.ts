// Storage schema types for Lightbeam graph data

export interface SiteNode {
  domain: string;
  firstSeen: number;
  lastSeen: number;
  isFirstParty: boolean;
}

export interface Edge {
  from: string;  // first-party domain
  to: string;    // third-party domain
  requestTypes: string[];
  count: number;
  firstSeen: number;
  lastSeen: number;
}

export interface GraphData {
  version: number;
  sites: Record<string, SiteNode>;
  edges: Edge[];
  lastUpdated: number;  // Added in v2
}
