import { drawNodes, type RenderNode } from './graph-renderer.js';

const canvas = document.getElementById('graph') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// Hardcoded test nodes — will be replaced by live data in Task 4.5
const testNodes: RenderNode[] = [
  { x: 240, y: 180, radius: 20, label: 'example.com',   isFirstParty: true  },
  { x: 100, y:  90, radius: 14, label: 'tracker.io',    isFirstParty: false },
  { x: 380, y:  90, radius: 14, label: 'analytics.net', isFirstParty: false },
  { x: 100, y: 270, radius: 14, label: 'ads.com',       isFirstParty: false },
  { x: 380, y: 270, radius: 14, label: 'cdn.net',       isFirstParty: false },
];

function render(): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawNodes(ctx, testNodes);
  requestAnimationFrame(render);
}

requestAnimationFrame(render);
