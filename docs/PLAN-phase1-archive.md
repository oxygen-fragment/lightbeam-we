# PLAN.md — Lightbeam Rebuild Micro-Tasks (Phase 1 Archive)

> Archived 2026-02-21. All 25 tasks completed. Active plan is PLAN.md.

Status: Complete
Created: 2026-02-20
Layers: 7
Tasks: 25
TDD Mode: Enabled

---

## Layer 1: Skeleton / Project Setup (3 tasks)

### Task 1.1: Initialize npm project with TypeScript
**Deliverable:** `package.json`, `tsconfig.json`
**Acceptance Check:** `npm install && npx tsc --version` exits 0
**Files:** 2 | LOC: ~30

### Task 1.2: Create Manifest V3 skeleton
**Deliverable:** `src/manifest.json` with minimal MV3 structure
**Acceptance Check:** `cat src/manifest.json | jq .manifest_version` returns `3`
**Files:** 1 | LOC: ~25

### Task 1.3: Add Vite build configuration
**Deliverable:** `vite.config.ts`, build script in `package.json`
**Acceptance Check:** `npm run build` produces `dist/manifest.json`
**Files:** 2 | LOC: ~40

---

## Layer 2: Network Capture Module (5 tasks)

### Task 2.1: Create service worker entry point
**Deliverable:** `src/background/service-worker.ts`
**Acceptance Check:** Load unpacked in Chrome; no console errors; service worker active in `chrome://extensions`
**Files:** 1 | LOC: ~15

### Task 2.2: Implement webRequest listener for onCompleted
**Deliverable:** `src/background/network-observer.ts`
**Acceptance Check:** Console logs request URL when visiting any site
**Files:** 1 | LOC: ~40

### Task 2.3: Add first-party vs third-party domain classification
**Deliverable:** `src/lib/domain-utils.ts` with `isThirdParty(tabUrl, requestUrl)` function
**Acceptance Check:** Unit test: `isThirdParty("https://example.com", "https://tracker.net")` returns `true`
**Files:** 1 | LOC: ~35

### Task 2.4: Extract request metadata (type, timestamp, domains)
**Deliverable:** Update `network-observer.ts` to build `RequestRecord` objects
**Acceptance Check:** Console log shows JSON with keys: `topLevelDomain`, `thirdPartyDomain`, `timestamp`, `requestType`
**Files:** 1 | LOC: ~30

### Task 2.5: Filter and emit third-party requests only
**Deliverable:** Update `network-observer.ts` to filter using `isThirdParty`
**Acceptance Check:** Only third-party requests logged; first-party requests ignored
**Files:** 1 | LOC: ~20

---

## Layer 3: Storage and Schema Versioning (4 tasks)

### Task 3.1: Define data schema TypeScript types
**Deliverable:** `src/storage/schema.ts` with `GraphData`, `SiteNode`, `Edge` types
**Acceptance Check:** `npx tsc --noEmit` passes with no type errors
**Files:** 1 | LOC: ~40

### Task 3.2: Implement storage read/write wrapper
**Deliverable:** `src/storage/storage-api.ts` with `loadGraph()`, `saveGraph(data)` functions
**Acceptance Check:** Manual test: call `saveGraph({})` then `loadGraph()`; data persists across service worker restarts
**Files:** 1 | LOC: ~35

### Task 3.3: Add schema version field and migration scaffold
**Deliverable:** `src/storage/migrations.ts` with version check and migration runner
**Acceptance Check:** `loadGraph()` on empty storage initializes `{version: 1, sites: {}, edges: []}`
**Files:** 1 | LOC: ~40

### Task 3.4: Implement one version increment migration (v1 → v2)
**Deliverable:** Add migration function in `migrations.ts`
**Acceptance Check:** Stored v1 data transforms to v2 schema on load
**Files:** 1 | LOC: ~30

---

## Layer 4: Graph Visualization MVP (5 tasks)

### Task 4.1: Create popup HTML skeleton
**Deliverable:** `src/popup/popup.html`, `src/popup/popup.ts`
**Acceptance Check:** Clicking extension icon opens popup with placeholder text
**Files:** 2 | LOC: ~40

### Task 4.2: Add canvas element and basic render loop
**Deliverable:** Update `popup.ts` with `<canvas>` setup and `requestAnimationFrame` loop
**Acceptance Check:** Popup shows blank canvas; no console errors
**Files:** 1 | LOC: ~35

### Task 4.3: Implement node rendering (circles for sites)
**Deliverable:** `src/popup/graph-renderer.ts` with `drawNodes(ctx, nodes)` function
**Acceptance Check:** Popup renders 5 hardcoded test nodes as circles
**Files:** 1 | LOC: ~50

### Task 4.4: Implement edge rendering (lines between nodes)
**Deliverable:** Update `graph-renderer.ts` with `drawEdges(ctx, edges)` function
**Acceptance Check:** Lines connect nodes based on edge data
**Files:** 1 | LOC: ~40

### Task 4.5: Wire live data from storage to renderer
**Deliverable:** Update `popup.ts` to load `GraphData` and render
**Acceptance Check:** After browsing 3 sites with trackers, popup shows graph with nodes and edges
**Files:** 1 | LOC: ~45

---

## Layer 5: User Interaction & Performance (3 tasks)

### Task 5.1: Add node selection on click
**Deliverable:** Update `popup.ts` with click handler and selected state
**Acceptance Check:** Clicking a node highlights it; connected edges emphasized
**Files:** 1 | LOC: ~40

### Task 5.2: Display site info panel on selection
**Deliverable:** `src/popup/info-panel.ts` showing site name and third-party count
**Acceptance Check:** Selecting a node shows info panel with correct data
**Files:** 1 | LOC: ~35

### Task 5.3: Implement data pruning for storage limits
**Deliverable:** `src/storage/pruning.ts` with `pruneOldEntries(maxAge)` function
**Acceptance Check:** Entries older than configured max age are removed on next save
**Files:** 1 | LOC: ~30

---

## Layer 6: Security Hardening & Permissions (3 tasks)

### Task 6.1: Add strict CSP to manifest
**Deliverable:** Update `manifest.json` with `content_security_policy`
**Acceptance Check:** `grep "script-src 'self'" dist/manifest.json` succeeds
**Files:** 1 | LOC: ~5

### Task 6.2: Minimize and document permissions
**Deliverable:** Update `manifest.json`; add permissions table to SPEC.md
**Acceptance Check:** Manifest contains only: `webRequest`, `storage`, `tabs` (or justified subset)
**Files:** 2 | LOC: ~20

### Task 6.3: Add input sanitization for display strings
**Deliverable:** `src/lib/sanitize.ts` with `sanitizeForDisplay(str)` function
**Acceptance Check:** Test: `<script>alert(1)</script>` input returns escaped string
**Files:** 1 | LOC: ~25

---

## Layer 7: Documentation & ADRs (2 tasks)

### Task 7.1: Create README with install, privacy, and threat model
**Deliverable:** `README.md` with sections: Installation, Privacy Model, Threat Model
**Acceptance Check:** `grep -E "Privacy Model|Threat Model" README.md` returns 2 lines
**Files:** 1 | LOC: ~50

### Task 7.2: Log initial architecture decision (ADR-001)
**Deliverable:** `docs/decisions/ADR-001-mv3-architecture.md`
**Acceptance Check:** File exists with status, context, decision, consequences sections
**Files:** 1 | LOC: ~40

---

## TDD Mode: Precode Test Stubs

| File | Target Task | Key Assertions |
|------|-------------|----------------|
| `tests/domain-utils.test.ts` | 2.3 | `isThirdParty()`, `extractDomain()` |
| `tests/schema.test.ts` | 3.4 | Migration v1→v2, version detection |
| `tests/sanitize.test.ts` | 6.3 | XSS escaping, HTML entity handling |
