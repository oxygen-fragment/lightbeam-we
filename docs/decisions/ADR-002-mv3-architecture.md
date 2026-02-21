# ADR-002: Manifest V3 Architecture

**Status:** Accepted
**Date:** 2026-02-21
**Supersedes:** N/A (initial architecture decision)

---

## Context

The original Lightbeam extension was built for Manifest V2 with a persistent background page, `webRequestBlocking`, and legacy APIs. Browser vendors have deprecated MV2:

- Chrome removed MV2 support in Chrome 127 (June 2024) for new extensions; existing extensions have an extended deadline.
- Firefox has adopted MV3 as the primary extension model while retaining some MV2 compatibility APIs.

A rebuild was required. The key architectural question was whether to target MV3 strictly, MV2 with a compatibility shim, or a hybrid approach.

### Constraints

- The extension's core function (observing third-party network requests) depends on `webRequest`.
- MV3 removes `webRequestBlocking` in Chrome but retains `webRequest` (read-only) and introduces `declarativeNetRequest`.
- Lightbeam only **observes** — it does not block. It does not need `webRequestBlocking`.
- A persistent background page is no longer permitted in MV3; service workers are required.

---

## Decision

**Target Manifest V3 exclusively.** Use a service worker for all background logic.

Specifically:
- `"manifest_version": 3` with `"background": { "service_worker": "...", "type": "module" }`
- `chrome.webRequest.onCompleted` (read-only) for request observation — no blocking needed
- `chrome.storage.local` for persistence (service workers cannot hold in-memory state across restarts)
- No `webRequestBlocking`, no `declarativeNetRequest` (not needed for a visualization tool)
- TypeScript + Vite build pipeline; ES module output

Firefox deviations are documented as they arise; MV3 support in Firefox is sufficiently mature for this use case.

---

## Consequences

### Positive

- Future-proof: MV2 is end-of-life in Chrome
- Smaller attack surface: no persistent background page
- Forced separation of concerns: state must be in storage, not memory — which improves resilience
- Native module support (`"type": "module"`) enables clean TypeScript import graphs

### Negative

- **Service worker lifecycle:** The browser may terminate the service worker between requests. All graph state must be read from `chrome.storage.local` on each relevant event rather than kept in memory.
- **Chrome 109+ required:** MV3 service workers with module type require Chrome 109 minimum.
- **Firefox alignment:** Firefox MV3 has minor deviations (e.g. `browser` vs `chrome` namespace); addressed with `@types/chrome` which covers both via the WebExtensions API.
- **No `webRequestBlocking`:** Lightbeam cannot block requests. This is intentional (it is a visualization tool), but means it cannot evolve into a blocker without architectural changes.

### Neutral

- `<all_urls>` host permission is still required for `webRequest` to observe cross-site traffic; this is unavoidable for the core feature.

---

## Related

- ADR-001: Layered Architecture and Integration Strategy
- SPEC.md: Permissions table and security constraints
- README.md: Privacy Model and Threat Model
