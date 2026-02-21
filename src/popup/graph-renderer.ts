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
  selectedLabel?: string | null,
): void {
  const index = new Map(nodes.map((n) => [n.label, n]));

  for (const edge of edges) {
    const from = index.get(edge.fromLabel);
    const to = index.get(edge.toLabel);
    if (!from || !to) continue;

    const isConnected =
      selectedLabel != null &&
      (edge.fromLabel === selectedLabel || edge.toLabel === selectedLabel);

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = isConnected ? '#e6edf3' : '#8b949e';
    ctx.lineWidth = isConnected ? 2 : 1;
    ctx.globalAlpha = selectedLabel != null && !isConnected ? 0.25 : 1;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

export function drawNodes(
  ctx: CanvasRenderingContext2D,
  nodes: RenderNode[],
  selectedLabel?: string | null,
): void {
  for (const node of nodes) {
    const isSelected = node.label === selectedLabel;

    // Highlight ring for selected node
    if (isSelected) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius + 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#f0e68c';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Circle fill
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ctx.fillStyle = node.isFirstParty ? '#58a6ff' : '#f78166';
    ctx.globalAlpha = selectedLabel != null && !isSelected ? 0.5 : 1;
    ctx.fill();
    ctx.globalAlpha = 1;

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
