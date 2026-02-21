# Lightbeam

Lightbeam is a browser extension that visualizes the third-party tracking relationships between sites you visit. It captures network requests in real time and renders them as an interactive graph in your browser's toolbar popup.

Built with Manifest V3, TypeScript, and native Canvas — no external libraries, no telemetry.

---

## Installation

### Requirements

- Chrome 109+ or Firefox 109+ (MV3 support required)
- Node.js 18+ and npm (for building from source)

### Build from source

```bash
git clone https://github.com/mozilla/lightbeam-we.git
cd lightbeam-we
npm install
npm run build
```

The compiled extension is written to `dist/`.

### Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked** and select the `dist/` directory
4. The Lightbeam icon appears in the toolbar

### Load in Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select `dist/manifest.json`

---

## Privacy Model

Lightbeam is designed to observe tracking — not to perform it.

- **All data stays local.** Graph data is stored in `browser.storage.local` only. Nothing is sent to any external server.
- **No telemetry.** The extension makes zero outbound network requests of its own.
- **No remote code.** A strict Content Security Policy (`script-src 'self'`) blocks any external scripts from loading.
- **Minimal permissions.** Only `webRequest` (observe requests), `tabs` (resolve the top-level URL), and `storage` (local persistence) are requested.
- **Data pruning.** Old observations can be pruned by age to keep storage bounded.
- **Hostile input treated as untrusted.** Domain names and request metadata captured from the network are never injected into the DOM as raw HTML.

---

## Threat Model

### In scope

| Threat | Mitigation |
|---|---|
| XSS via captured domain names | `sanitizeForDisplay()` escapes all HTML entities; DOM writes use `textContent` only |
| Remote code injection | CSP `script-src 'self'`; no `eval` or `new Function` anywhere |
| Data exfiltration | No external network calls; enforced by CSP and code review |
| Stale data accumulation | `pruneOldEntries(maxAge)` removes aged-out observations |
| Overly broad permissions | Permissions minimized and justified in `SPEC.md` |

### Out of scope

- **Accuracy of tracking detection** — Lightbeam is a visualization tool, not a blocker. It may miss some trackers (e.g. first-party bounce tracking) and may surface false positives.
- **Browser-level attacks** — Compromised browser or OS is outside this extension's threat model.
- **Persistent background page** — MV3 service workers can be terminated by the browser at any time; Lightbeam persists state to storage to survive restarts.

---

## Development

```bash
npm run build      # production build → dist/
npm run dev        # watch mode
npm run typecheck  # TypeScript type check
npm test           # unit tests (Vitest)
```

---

## License

MPL-2.0 — see [LICENSE](LICENSE).
