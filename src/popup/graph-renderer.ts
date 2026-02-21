export interface RenderNode {
  x: number;
  y: number;
  radius: number;
  label: string;
  isFirstParty: boolean;
}

export interface RenderEdge {
  fromLabel: string;
  toLabel: string;
}

export function drawEdges(
  ctx: CanvasRenderingContext2D,
  edges: RenderEdge[],
  nodes: RenderNode[],
): void {
  const index = new Map(nodes.map((n) => [n.label, n]));
  ctx.strokeStyle = '#8b949e';
  ctx.lineWidth = 1;

  for (const edge of edges) {
    const from = index.get(edge.fromLabel);
    const to = index.get(edge.toLabel);
    if (!from || !to) continue;

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }
}

export function drawNodes(ctx: CanvasRenderingContext2D, nodes: RenderNode[]): void {
  for (const node of nodes) {
    // Circle fill
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ctx.fillStyle = node.isFirstParty ? '#58a6ff' : '#f78166';
    ctx.fill();

    // Border
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label below circle
    ctx.fillStyle = '#e6edf3';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(node.label, node.x, node.y + node.radius + 14);
  }
}
