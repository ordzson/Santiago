/* Motor de grabado: trazos temblorosos, tramas, bandas de líneas, puntos y aves.
   Todo se dibuja en <canvas> con los colores del tema (tinta, papel y rojo). */
/* =====================================================================
   ENGRAVING — small canvas engine for the woodcut-style art.
   Lines and dots are drawn in the page's ink; the one small thing in
   each picture (rudder, spark, tongue, flame, seed) is drawn in red.
   ===================================================================== */
const TAU = Math.PI * 2;
function rng(seed){ let a = seed >>> 0; return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function tokens(){
  const cs = getComputedStyle(document.documentElement);
  const v = (n, d) => (cs.getPropertyValue(n) || '').trim() || d;
  return { ink: v('--ink', '#1A1210'), red: v('--red', '#C0293C'), paper: v('--paper', '#F6F1E4') };
}
function engraver(canvas, dw, dh, o){
  const r = canvas.getBoundingClientRect();
  const cw = r.width, ch = r.height;
  if (cw < 4 || ch < 4) return null;
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height);
  const s = o.fit === 'height' ? ch / dh : o.fit === 'cover' ? Math.max(cw / dw, ch / dh) : Math.min(cw / dw, ch / dh);
  const ox = (cw - dw * s) * (o.ax == null ? .5 : o.ax), oy = (ch - dh * s) * (o.ay == null ? .5 : o.ay);
  ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * ox, dpr * oy);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const E = Object.assign({ ctx, s, px: 1 / s, rand: rng(o.seed || 11) }, tokens());
  E.g = () => (E.rand() + E.rand() + E.rand() - 1.5) / 1.5;
  return E;
}
const P = d => new Path2D(d);
function rough(E, x1, y1, x2, y2, w, o){
  o = o || {};
  const c = E.ctx, R = E.rand, px = E.px;
  const len = Math.hypot(x2 - x1, y2 - y1); if (len < .01) return;
  const n = Math.max(1, Math.ceil(len / ((o.step || 5) * px)));
  const nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
  const wob = (o.wob == null ? .35 : o.wob) * px, brk = o.brk || 0;
  let pen = false, off = 0;
  c.beginPath();
  for (let i = 0; i <= n; i++) {
    const t = i / n; off = off * .6 + (R() - .5) * wob;
    const x = x1 + (x2 - x1) * t + nx * off, y = y1 + (y2 - y1) * t + ny * off;
    if (!pen) { c.moveTo(x, y); pen = true; } else c.lineTo(x, y);
    if (brk && R() < brk) pen = false;
  }
  c.lineWidth = w * px * (.8 + .4 * R()); c.stroke();
}
function hatch(E, path, bb, o){
  const c = E.ctx, R = E.rand, px = E.px;
  const a = (o.ang || 0) * Math.PI / 180, gap = (o.gap || 2.4) * px;
  const cx = bb[0] + bb[2] / 2, cy = bb[1] + bb[3] / 2, rad = Math.hypot(bb[2], bb[3]) / 2 + 2;
  const dx = Math.cos(a), dy = Math.sin(a), nx = -dy, ny = dx;
  c.save(); if (path) c.clip(path); if (o.clip) c.clip(o.clip);
  c.strokeStyle = o.color || E.ink;
  for (let d = -rad; d <= rad; d += gap * (.85 + .3 * R())) {
    rough(E, cx + nx * d - dx * rad, cy + ny * d - dy * rad, cx + nx * d + dx * rad, cy + ny * d + dy * rad, o.w || .7, o);
  }
  c.restore();
}
function fill(E, path, color){ E.ctx.fillStyle = color; E.ctx.fill(path); }
function edge(E, path, w, color){ const c = E.ctx; c.lineWidth = (w || 1) * E.px; c.strokeStyle = color || E.ink; c.stroke(path); }
function line(E, pts, w, color){
  const c = E.ctx; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
  c.lineWidth = w * E.px; c.strokeStyle = color || E.ink; c.stroke();
}
function dot(E, x, y, r, color){ const c = E.ctx; c.beginPath(); c.arc(x, y, r * E.px, 0, TAU); c.fillStyle = color || E.ink; c.fill(); }
function bez(p, t){ const u = 1 - t; return [u*u*u*p[0][0] + 3*u*u*t*p[1][0] + 3*u*t*t*p[2][0] + t*t*t*p[3][0], u*u*u*p[0][1] + 3*u*u*t*p[1][1] + 3*u*t*t*p[2][1] + t*t*t*p[3][1]]; }
function bezD(p, t){ const u = 1 - t; return [3*u*u*(p[1][0]-p[0][0]) + 6*u*t*(p[2][0]-p[1][0]) + 3*t*t*(p[3][0]-p[2][0]), 3*u*u*(p[1][1]-p[0][1]) + 6*u*t*(p[2][1]-p[1][1]) + 3*t*t*(p[3][1]-p[2][1])]; }
function bezLen(p){ let L = 0, a = bez(p, 0); for (let i = 1; i <= 48; i++) { const b = bez(p, i / 48); L += Math.hypot(b[0] - a[0], b[1] - a[1]); a = b; } return L; }
function bezSample(p, n){ const out = []; for (let i = 0; i <= n; i++) out.push(bez(p, i / n)); return out; }

/* a band of parallel engraved lines following a curve, with frayed ends and dust */
function band(E, p, o){
  const c = E.ctx, R = E.rand, px = E.px;
  const steps = Math.max(10, Math.ceil(bezLen(p) / (4 * px)));
  const taper = o.taper || (t => Math.pow(Math.sin(Math.PI * t), .55));
  c.strokeStyle = o.color || E.ink;
  for (let i = 0; i < o.n; i++) {
    const k = o.n === 1 ? .5 : i / (o.n - 1), off = (k - .5) * o.w;
    const t0 = R() * (o.fray0 == null ? .16 : o.fray0), t1 = 1 - R() * (o.fray1 == null ? .22 : o.fray1);
    const lw = o.lw * (o.heavy ? (.55 + .9 * (o.heavy > 0 ? k : 1 - k)) : 1) * (.75 + .5 * R());
    let pen = false, wo = 0; c.beginPath();
    for (let j = 0; j <= steps; j++) {
      const t = t0 + (t1 - t0) * j / steps, b = bez(p, t), d = bezD(p, t), dl = Math.hypot(d[0], d[1]) || 1;
      const nx = -d[1] / dl, ny = d[0] / dl, f = taper(t);
      wo = wo * .7 + (R() - .5) * (o.wob == null ? .5 : o.wob) * px;
      const x = b[0] + nx * (off * f + wo), y = b[1] + ny * (off * f + wo);
      if (!pen) { c.moveTo(x, y); pen = true; } else c.lineTo(x, y);
      if (o.brk && R() < o.brk) pen = false;
    }
    c.lineWidth = lw * px; c.stroke();
  }
  if (o.dust) {
    const side = o.dustSide || 1;
    for (let i = 0; i < o.dust; i++) {
      const t = .04 + R() * .92, b = bez(p, t), d = bezD(p, t), dl = Math.hypot(d[0], d[1]) || 1;
      const nx = -d[1] / dl, ny = d[0] / dl, f = taper(t);
      const spread = Math.abs(E.g()) * (o.spread || 14) * (R() < .15 ? 2.2 : 1);
      const off = side * (o.w * .5 * f + spread - R() * o.w * .18 * f);
      dot(E, b[0] + nx * off + (R() - .5) * 3, b[1] + ny * off + (R() - .5) * 3, .3 + .65 * R() * R());
    }
  }
}
function bird(E, x, y, s, rot, flap){
  const c = E.ctx; c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  const f = flap;
  c.beginPath();
  c.moveTo(-1, -.12 - f * .45);
  c.quadraticCurveTo(-.55, -.6 - f, -.07, -.04);
  c.quadraticCurveTo(0, .1, .07, -.04);
  c.quadraticCurveTo(.55, -.6 - f, 1, -.12 - f * .45);
  c.quadraticCurveTo(.5, -.3 - f * .55, .07, .17);
  c.quadraticCurveTo(0, .27, -.07, .17);
  c.quadraticCurveTo(-.5, -.3 - f * .55, -1, -.12 - f * .45);
  c.fillStyle = E.ink; c.fill(); c.restore();
}
function catmull(pts, seg){
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let j = 0; j < seg; j++) {
      const t = j / seg, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map(k => .5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)));
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}
/* a tube (serpent, stems) shaded with cross-contour lines */
function tube(E, S, wf, o){
  o = o || {};
  const n = S.length, cum = [0];
  for (let i = 1; i < n; i++) cum.push(cum[i - 1] + Math.hypot(S[i][0] - S[i - 1][0], S[i][1] - S[i - 1][1]));
  const L = cum[n - 1], Lp = [], Rp = [];
  for (let i = 0; i < n; i++) {
    const a = S[Math.max(0, i - 1)], b = S[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const w = wf(cum[i] / L) / 2;
    Lp.push([S[i][0] - dy * w, S[i][1] + dx * w]); Rp.push([S[i][0] + dy * w, S[i][1] - dx * w]);
  }
  const body = new Path2D(); body.moveTo(Lp[0][0], Lp[0][1]);
  for (let i = 1; i < n; i++) body.lineTo(Lp[i][0], Lp[i][1]);
  for (let i = n - 1; i >= 0; i--) body.lineTo(Rp[i][0], Rp[i][1]);
  body.closePath();
  fill(E, body, E.paper);
  const c = E.ctx; c.strokeStyle = E.ink;
  const gap = (o.gap || 2.3) * E.px; let next = 0, alt = 0;
  for (let i = 0; i < n; i++) {
    if (cum[i] < next) continue;
    next = cum[i] + gap * (.85 + .3 * E.rand()); alt++;
    const f = alt % 2 ? 1 : .45 + .4 * E.rand();
    c.beginPath(); c.moveTo(Rp[i][0], Rp[i][1]);
    c.lineTo(Rp[i][0] + (Lp[i][0] - Rp[i][0]) * f, Rp[i][1] + (Lp[i][1] - Rp[i][1]) * f);
    c.lineWidth = (o.w || .6) * E.px * (.8 + .4 * E.rand()); c.stroke();
  }
  line(E, Lp, o.edge || .9); line(E, Rp, (o.edge || .9) * 1.35);
  return { Lp, Rp, body };
}

const VIG = {};      // viñetas de las páginas, por nombre
const COVERS = {};   // portada de cada capítulo, por número
