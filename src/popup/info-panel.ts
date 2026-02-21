import type { RenderEdge } from './graph-renderer.js';

export function updateInfoPanel(label: string | null, edges: RenderEdge[]): void {
  const panel = document.getElementById('info-panel') as HTMLElement;
  const nameEl = document.getElementById('panel-name') as HTMLElement;
  const countEl = document.getElementById('panel-count') as HTMLElement;

  if (label === null) {
    panel.hidden = true;
    return;
  }

  const connected = edges.filter(
    (e) => e.fromLabel === label || e.toLabel === label,
  ).length;

  // textContent only — domain names from the network are untrusted
  nameEl.textContent = label;
  countEl.textContent = `${connected} third-part${connected === 1 ? 'y' : 'ies'} connected`;
  panel.hidden = false;
}
