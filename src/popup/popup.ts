import { loadGraph } from '../storage/storage-api.js';
import { drawNodes, drawEdges, type RenderNode, type RenderEdge } from './graph-renderer.js';
import { updateInfoPanel } from './info-panel.js';
import type { GraphData } from '../storage/schema.js';

const canvas = document.getElementById('graph') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

let renderNodes: RenderNode[] = [];
let renderEdges: RenderEdge[] = [];
let selectedLabel: string | null = null;

function graphToRender(data: GraphData): void {
  const domains = Object.keys(data.sites);
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r = Math.min(cx, cy) * 0.72;

  renderNodes = domains.map((domain, i) => {
    const angle = (i / domains.length) * Math.PI * 2 - Math.PI / 2;
    const site = data.sites[domain];
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      radius: site.isFirstParty ? 18 : 12,
      label: domain,
      isFirstParty: site.isFirstParty,
    };
  });

  renderEdges = data.edges.map((e) => ({ fromLabel: e.from, toLabel: e.to }));
}

function hitTest(cx: number, cy: number): string | null {
  for (const node of renderNodes) {
    const dx = cx - node.x;
    const dy = cy - node.y;
    if (Math.sqrt(dx * dx + dy * dy) <= node.radius) return node.label;
  }
  return null;
}

function render(): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawEdges(ctx, renderEdges, renderNodes, selectedLabel);
  drawNodes(ctx, renderNodes, selectedLabel);
  requestAnimationFrame(render);
}

async function init(): Promise<void> {
  const data = await loadGraph();
  graphToRender(data);
  requestAnimationFrame(render);

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top) * scaleY;
    const hit = hitTest(cx, cy);
    selectedLabel = hit === selectedLabel ? null : hit; // toggle off on re-click
    updateInfoPanel(selectedLabel, renderEdges);
  });

  chrome.storage.onChanged.addListener((_changes, area) => {
    if (area === 'local') {
      loadGraph().then((d) => graphToRender(d));
    }
  });
}

init();
