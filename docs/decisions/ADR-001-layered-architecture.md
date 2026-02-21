# ADR-001: Layered Architecture and Integration Strategy

**Status:** Accepted
**Date:** 2026-02-20
**Context:** Checkpoint after completing Layers 1-3 (Setup, Network Capture, Storage)

---

## Context

We are rebuilding Lightbeam as a Manifest V3 browser extension. The implementation follows a layered approach where each component is built and tested independently before integration.

### Current Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser Extension                         │
├─────────────────────────────────────────────────────────────┤
│  Layer 4: Visualization (TODO)                              │
│  - popup.html + popup.ts                                    │
│  - Canvas-based graph rendering                             │
│  - Reads from storage                                       │
├─────────────────────────────────────────────────────────────┤
│  Layer 3: Storage ✓                                         │
│  - schema.ts (GraphData, SiteNode, Edge types)              │
│  - storage-api.ts (loadGraph, saveGraph)                    │
│  - migrations.ts (v1→v2 migration pattern)                  │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: Network Capture ✓                                 │
│  - service-worker.ts (MV3 background)                       │
│  - network-observer.ts (webRequest listener)                │
│  - domain-utils.ts (isThirdParty classification)            │
│  - Currently: logs to console only                          │
├─────────────────────────────────────────────────────────────┤
│  Layer 1: Skeleton ✓                                        │
│  - manifest.json (MV3)                                      │
│  - vite.config.ts (build pipeline)                          │
│  - TypeScript + Vitest                                      │
└─────────────────────────────────────────────────────────────┘
```

### Integration Gap Identified

Network capture currently logs `RequestRecord` objects to console but does not persist them to storage. Visualization will read from storage. A connection point is needed.

```
Network Observer ──[RequestRecord]──→ ??? ──→ Storage ──→ Visualization
                                       ↑
                              Integration needed
```

---

## Decision

**Proceed with current layered approach.** Build visualization layer (Layer 4) first, then add integration between network capture and storage as a subsequent task.

### Rationale

1. **Components are well-isolated** — Each layer can be tested independently
2. **Integration points are well-defined** — No ambiguity about data flow
3. **Patterns are standard** — Chrome storage + Canvas rendering is proven
4. **Risk is bounded** — No architectural changes needed for integration

---

## Integration Plan

### Step 1: Data Transformation (Network → Storage)

```typescript
// Transform RequestRecord to GraphData updates
function recordRequest(record: RequestRecord, graph: GraphData): GraphData {
  // 1. Upsert SiteNode for topLevelDomain (isFirstParty: true)
  // 2. Upsert SiteNode for thirdPartyDomain (isFirstParty: false)
  // 3. Find or create Edge between them
  // 4. Update edge.count++, edge.requestTypes, edge.lastSeen
  // 5. Update graph.lastUpdated
  return updatedGraph;
}
```

### Step 2: Storage → Visualization

```typescript
// In popup.ts
const graph = await loadGraph();
renderGraph(graph);

// For live updates:
chrome.storage.onChanged.addListener((changes) => {
  if (changes.lightbeam_graph) {
    renderGraph(changes.lightbeam_graph.newValue);
  }
});
```

---

## Risk Assessment

### Low Risk

| Risk | Mitigation |
|------|------------|
| Data transformation logic | Straightforward; just data mapping |
| Service worker lifecycle | Data persists in storage, not memory |
| Popup ↔ background communication | Standard chrome.storage patterns |
| Storage limits | Pruning task planned (Task 5.3) |

### Medium Risk

| Risk | Mitigation |
|------|------------|
| Edge lookup performance | O(n) acceptable for MVP (<1000 edges). If needed, migrate to `Record<string, Edge>` for O(1) lookup |
| Race conditions on writes | Debounce writes (batch every 500ms). Missing occasional edge acceptable for privacy viz |
| Canvas with 100+ nodes | Native Canvas handles this; only redraw on data change |

### Monitoring Points

| Area | What to Watch |
|------|---------------|
| Firefox MV3 | Test after Chrome implementation stable |
| Storage size | Monitor in DevTools; pruning planned |
| Performance | Profile if UI feels sluggish with many nodes |

---

## Schema Considerations

### Current Schema (v2)

```typescript
interface GraphData {
  version: number;
  sites: Record<string, SiteNode>;  // O(1) lookup ✓
  edges: Edge[];                     // O(n) lookup ⚠️
  lastUpdated: number;
}
```

### Potential Future Schema (v3)

If edge lookup becomes a bottleneck:

```typescript
interface GraphData {
  version: number;
  sites: Record<string, SiteNode>;
  edges: Record<string, Edge>;  // Key: "from:to" for O(1) lookup
  lastUpdated: number;
}
```

Migration path exists (we have the pattern from v1→v2).

---

## Consequences

### Positive

- Clean separation of concerns
- Each layer testable in isolation
- Standard, well-understood patterns
- Migration system ready for schema evolution

### Negative

- Integration deferred (small risk of interface mismatch)
- Edge array may need future optimization

### Neutral

- Race conditions accepted for MVP (privacy viz doesn't need 100% accuracy)

---

## Related

- PLAN.md: Task sequence and complexity budgets
- ACCEPTANCE.md: §1.C (Data Persistence), §2.A (Graph Rendering)
- Future: ADR-002 will cover visualization approach
