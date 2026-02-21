const canvas = document.getElementById('graph') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

function render(): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Graph drawing will be added in subsequent tasks
  requestAnimationFrame(render);
}

requestAnimationFrame(render);
