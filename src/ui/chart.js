// Resolve a CSS custom property to a concrete colour that canvas understands.
// The chart therefore follows the page theme, including the hue slider.
function themeColor(canvas, name, fallback) {
  const probe = document.createElement('span');
  probe.hidden = true;
  probe.style.color = `var(${name}, ${fallback})`;
  canvas.after(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c || fallback;
}

export function drawChart(canvas, rows) {
  // Draw in logical pixels but back the canvas with device pixels for crispness.
  const W = +(canvas.dataset.w ??= canvas.width);
  const H = +(canvas.dataset.h ??= canvas.height);
  const dpr = window.devicePixelRatio || 1;
  if (canvas.width !== Math.round(W * dpr)) {
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  const col = {
    text: themeColor(canvas, '--muted', '#9a96b0'),
    grid: themeColor(canvas, '--border', 'rgba(255,255,255,.12)'),
    dot: themeColor(canvas, '--accent', '#a78bfa'),
    lo: themeColor(canvas, '--accent-2', '#5eead4'),
    hi: themeColor(canvas, '--accent-3', '#f472b6'),
  };
  const font = '11px system-ui, sans-serif';

  if (!rows.length) {
    ctx.fillStyle = col.text;
    ctx.font = '14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Press Run to explore the landscape', W / 2, H / 2);
    ctx.textAlign = 'start';
    return;
  }

  const padL = 34, padR = 14, padT = 30, padB = 26;
  const maxN = Math.max(2, ...rows.map(r => r.n));
  const maxY = Math.max(...rows.map(r => r.cost), 3 * Math.log2(maxN));
  const x = n => padL + (n - 1) / (maxN - 1) * (W - padL - padR);
  const y = c => H - padB - c / maxY * (H - padT - padB);

  // Grid lines and y labels
  ctx.font = font;
  ctx.lineWidth = 1;
  const step = Math.max(1, Math.ceil(maxY / 5));
  for (let c = 0; c <= maxY; c += step) {
    ctx.strokeStyle = col.grid;
    ctx.beginPath(); ctx.moveTo(padL, y(c)); ctx.lineTo(W - padR, y(c)); ctx.stroke();
    ctx.fillStyle = col.text;
    ctx.textAlign = 'right';
    ctx.fillText(String(c), padL - 8, y(c) + 4);
  }
  ctx.textAlign = 'left';
  ctx.fillText('1', padL, H - 8);
  ctx.textAlign = 'right';
  ctx.fillText('n = ' + maxN, W - padR, H - 8);
  ctx.textAlign = 'left';

  // Theoretical bounds
  const curve = (f, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const n = 1 + (maxN - 1) * i / 200;
      i ? ctx.lineTo(x(n), y(f(n))) : ctx.moveTo(x(n), y(f(n)));
    }
    ctx.stroke();
  };
  curve(n => 3 * Math.log(n) / Math.log(3), col.lo);
  curve(n => 3 * Math.log2(n), col.hi);

  // Data points, glowing when there are few enough to afford it
  ctx.fillStyle = col.dot;
  const glow = rows.length <= 3000;
  if (glow) { ctx.shadowColor = col.dot; ctx.shadowBlur = 6; }
  const r = rows.length > 2000 ? 1.2 : 1.8;
  for (const row of rows) {
    ctx.beginPath();
    ctx.arc(x(row.n), y(row.cost), r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // Legend
  const legend = [[col.dot, 'C(n)'], [col.lo, '3·log₃ n'], [col.hi, '3·log₂ n']];
  let lx = padL;
  for (const [c, label] of legend) {
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(lx, 9, 14, 4, 2) : ctx.rect(lx, 9, 14, 4); ctx.fill();
    ctx.fillStyle = col.text;
    ctx.fillText(label, lx + 19, 15);
    lx += 19 + ctx.measureText(label).width + 18;
  }
}