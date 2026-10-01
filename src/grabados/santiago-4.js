/* Capítulo 4: viñetas, la ciudad, el camino, el caminante y el vapor; su portada.
   road(), walker() y polyP() también los usan otros capítulos. */
/* =====================================================================
   VIÑETAS DEL CAPÍTULO 4 (se suman a la colección del capítulo 3)
   ===================================================================== */
function polyP(pts){
  const p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]);
  p.closePath();
  let a = 1e9, b = 1e9, c = -1e9, d = -1e9;
  pts.forEach(([x, y]) => { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); });
  return { p, bb: [a, b, c - a, d - b] };
}
function drop(E, x, y, r, color){
  fill(E, P(`M${x} ${y - 3.2 * r} C${x + 1.6 * r} ${y - .8 * r} ${x + 1.8 * r} ${y + 1.2 * r} ${x} ${y + 1.8 * r} C${x - 1.8 * r} ${y + 1.2 * r} ${x - 1.6 * r} ${y - .8 * r} ${x} ${y - 3.2 * r} Z`), color || E.ink);
}
function sword(E, x1, y1, x2, y2){
  const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, nx = -uy, ny = ux;
  const at = (s, o) => [x1 + ux * s + nx * o, y1 + uy * s + ny * o];
  const ang = Math.atan2(uy, ux) * 180 / Math.PI;
  const b0 = 30, bw = 4.4;
  const blade = polyP([at(b0, -bw), at(L - 26, -bw * .9), at(L - 9, -bw * .5), at(L, 0), at(L - 9, bw * .5), at(L - 26, bw * .9), at(b0, bw)]);
  const half = polyP([at(b0, 0), at(L, 0), at(L - 9, bw * .5), at(L - 26, bw * .9), at(b0, bw)]);
  fill(E, blade.p, E.paper);
  hatch(E, blade.p, blade.bb, { ang, gap: 1.25, w: .5, clip: half.p, wob: .1 });
  edge(E, blade.p, .9);
  line(E, [at(b0 + 1, 0), at(L - 7, 0)], .55);
  const guard = polyP([at(b0 - 4.5, -14), at(b0, -13), at(b0, 13), at(b0 - 4.5, 14)]);
  fill(E, guard.p, E.paper); hatch(E, guard.p, guard.bb, { ang: ang + 90, gap: 1.2, w: .5 }); edge(E, guard.p, .9);
  const grip = polyP([at(8, -2.6), at(b0 - 4.5, -2.6), at(b0 - 4.5, 2.6), at(8, 2.6)]);
  fill(E, grip.p, E.ink);
  E.ctx.save(); E.ctx.clip(grip.p);
  for (let s = 9; s < b0 - 4; s += 2.4) line(E, [at(s, -3), at(s + 2, 3)], .5, E.paper);
  E.ctx.restore();
  const pc = at(4.6, 0), c = E.ctx;
  c.beginPath(); c.arc(pc[0], pc[1], 4.6, 0, TAU); c.fillStyle = E.red; c.fill(); c.lineWidth = .8 * E.px; c.strokeStyle = E.ink; c.stroke();
}
Object.assign(VIG, {
  swords(E){
    for (let i = 0; i < 120; i++) dot(E, 100 + E.g() * 52, 150 + Math.abs(E.g()) * 6, .3 + .5 * E.rand());
    sword(E, 46, 146, 160, 22);
    sword(E, 154, 146, 40, 22);
  },
  cup(E){
    const c = E.ctx; c.strokeStyle = E.ink;
    for (let i = 0; i < 7; i++) { const x = 97 + i; rough(E, x + (E.rand() - .5), -4, x + (E.rand() - .5) * 2, 50, .5 + E.rand() * .3, { wob: .4, brk: .04 }); }
    const pud = new Path2D(); pud.ellipse(100, 147, 74, 7.5, 0, 0, TAU);
    hatch(E, pud, [26, 139, 148, 16], { ang: 0, gap: 1.6, w: .5, wob: .8, brk: .15 });
    for (let i = 0; i < 70; i++) dot(E, 100 + E.g() * 70, 147 + E.g() * 5, .3 + .4 * E.rand());
    const base = P('M72 141 C78 133 122 133 128 141 C122 145.5 78 145.5 72 141 Z');
    const stem = P('M95.5 104 C97 113 97 124 93.5 134 L106.5 134 C103 124 103 113 104.5 104 Z');
    const bowl = P('M56 54 L144 54 C144 86 125 105 100 107 C75 105 56 86 56 54 Z');
    [base, stem, bowl].forEach(p => fill(E, p, E.paper));
    hatch(E, base, [72, 133, 56, 13], { ang: 0, gap: 1.3, w: .5 }); edge(E, base, .85);
    hatch(E, stem, [93, 104, 14, 30], { ang: 90, gap: 1.3, w: .5 }); edge(E, stem, .85);
    hatch(E, bowl, [56, 54, 88, 53], { ang: 90, gap: 1.7, w: .55 });
    hatch(E, bowl, [56, 54, 88, 53], { ang: 40, gap: 2.1, w: .5, clip: P('M108 50 L150 50 L150 110 L108 110 Z') });
    edge(E, bowl, 1);
    const surf = new Path2D(); surf.ellipse(100, 54, 44, 6.5, 0, 0, TAU);
    fill(E, surf, E.paper); hatch(E, surf, [56, 47, 88, 14], { ang: 0, gap: 1.5, w: .45, wob: .6 }); edge(E, surf, .8);
    [[[58, 56], [52, 70], [50, 86], [46, 104]], [[142, 57], [149, 72], [151, 90], [156, 108]], [[70, 59], [66, 76], [70, 92], [76, 101]], [[128, 60], [134, 74], [131, 90], [124, 102]]]
      .forEach((p, k) => line(E, catmull(p, 6), k < 2 ? .9 : .55));
    [[46, 113, 1], [45.6, 123, .8], [156, 117, 1], [157, 128, .8], [46, 133, .7], [157, 137, .7]].forEach(([x, y, r]) => drop(E, x, y, r));
  },
  pitcher(E){
    const c = E.ctx; c.strokeStyle = E.ink;
    for (let i = 0; i < 90; i++) dot(E, 100 + E.g() * 60, 152 + Math.abs(E.g()) * 5, .3 + .45 * E.rand());
    const basin = P('M28 116 L172 116 C168 134 142 147 100 147 C58 147 32 134 28 116 Z');
    fill(E, basin, E.paper);
    hatch(E, basin, [28, 116, 144, 31], { ang: 0, gap: 1.5, w: .55 });
    hatch(E, basin, [28, 116, 144, 31], { ang: 35, gap: 2.1, w: .45, clip: P('M110 112 L176 112 L176 150 L110 150 Z') });
    edge(E, basin, 1);
    const rim = new Path2D(); rim.ellipse(100, 116, 72, 8.5, 0, 0, TAU);
    fill(E, rim, E.paper); edge(E, rim, 1);
    const water = new Path2D(); water.ellipse(100, 117, 64, 5.8, 0, 0, TAU);
    hatch(E, water, [36, 111, 128, 12], { ang: 0, gap: 1.35, w: .45, wob: .9, brk: .1 });
    for (let i = 0; i < 4; i++) {
      c.beginPath(); c.moveTo(94.5 + i * .8, 36 + i * .4);
      c.quadraticCurveTo(99 + i, 58, 100 + i * 1.1, 114);
      c.lineWidth = (.55 + E.rand() * .3) * E.px; c.strokeStyle = E.ink; c.stroke();
    }
    for (let i = 0; i < 40; i++) dot(E, 101 + E.g() * 12, 112 - Math.abs(E.g()) * 6, .3 + .4 * E.rand());
    c.save(); c.translate(58, 50); c.rotate(.62);
    const body = P('M-15 -16 C-27 -6 -27 18 -13 26 L13 26 C27 18 27 -6 15 -16 Z');
    const neck = P('M-9 -16 L-8 -27 L9 -27 L10 -16 Z');
    const lip = P('M8 -27 L21 -33 L13 -24 Z');
    edge(E, P('M-15 -10 C-30 -12 -32 12 -19 16'), 2);
    [body, neck].forEach(p => fill(E, p, E.paper));
    hatch(E, body, [-27, -16, 54, 42], { ang: 90, gap: 1.6, w: .55 });
    hatch(E, body, [-27, -16, 54, 42], { ang: 30, gap: 2, w: .45, clip: P('M4 -20 L30 -20 L30 30 L4 30 Z') });
    edge(E, body, 1);
    hatch(E, neck, [-10, -27, 20, 11], { ang: 90, gap: 1.4, w: .5 }); edge(E, neck, .9);
    fill(E, lip, E.paper); edge(E, lip, .9);
    line(E, [[-9.5, -16], [10.5, -16]], .8);
    c.restore();
  },
  kneel(E){
    const c = E.ctx; c.strokeStyle = E.ink;
    for (let i = 0; i < 17; i++) {
      const a = Math.PI * .42 + (i - 8) * .06 + (E.rand() - .5) * .02, r0 = 30 + E.rand() * 10, r1 = 104 + E.rand() * 22;
      rough(E, 54 + Math.cos(a) * r0, -40 + Math.sin(a) * r0, 54 + Math.cos(a) * r1, -40 + Math.sin(a) * r1, .5, { wob: .15, brk: .06 });
    }
    for (let i = 0; i < 80; i++) dot(E, 70 + E.g() * 30, Math.abs(E.g()) * 16, .3 + .4 * E.rand());
    for (let y = 142; y <= 150; y += 2.2) rough(E, 50 + E.rand() * 8, y, 156 - E.rand() * 8, y, .6, { wob: .4, brk: .1 });
    for (let i = 0; i < 70; i++) dot(E, 132 + Math.abs(E.g()) * 26, 141 + E.g() * 3, .3 + .4 * E.rand());
    const body = P('M93 86 C86 91 82 99 81 109 C80 119 81 130 84 141 L134 141 C134 135 130 130 122 128 L113 127 C111 115 107 101 101 90 C99 87 96 85.5 93 86 Z');
    const hands = P('M86 99 C80 102 76 106 75 111 C74.6 114 77.4 115.2 79.4 113.2 C80.6 109.2 83.6 105.6 88.6 103.2 Z');
    fill(E, body, E.ink); fill(E, hands, E.ink);
    c.beginPath(); c.arc(87.5, 81, 6.2, 0, TAU); c.fillStyle = E.ink; c.fill();
    c.globalAlpha = .7;
    line(E, [[96, 96], [90, 138]], .5, E.paper); line(E, [[103, 104], [104, 138]], .5, E.paper); line(E, [[112, 130], [128, 136]], .45, E.paper);
    c.globalAlpha = 1;
  },
  tablets(E){
    for (let i = 0; i < 120; i++) dot(E, 100 + E.g() * 60, 150 + Math.abs(E.g()) * 5, .3 + .45 * E.rand());
    const tab = x0 => {
      const side = P(`M${x0 + 52} 62 C${x0 + 52} 44 ${x0 + 40} 36 ${x0 + 30} 35 L${x0 + 34} 37 C${x0 + 45} 39 ${x0 + 56} 47 ${x0 + 56} 64 L${x0 + 56} 144 L${x0 + 52} 141 Z`);
      fill(E, side, E.paper); hatch(E, side, [x0 + 30, 35, 27, 110], { ang: 90, gap: 1.1, w: .5 }); edge(E, side, .7);
      const face = P(`M${x0} 141 L${x0} 62 C${x0} 43 ${x0 + 14} 34 ${x0 + 26} 34 C${x0 + 38} 34 ${x0 + 52} 43 ${x0 + 52} 62 L${x0 + 52} 141 Z`);
      fill(E, face, E.paper);
      hatch(E, face, [x0, 34, 52, 107], { ang: 62, gap: 2.6, w: .4, brk: .22 });
      E.ctx.strokeStyle = E.ink;
      for (let y = 56; y <= 130; y += 8) rough(E, x0 + 8, y, x0 + 44 - E.rand() * 6, y, .9, { wob: .3, brk: .3, step: 2.6 });
      edge(E, face, 1);
    };
    tab(42); tab(102);
  },
  hourglass(E){
    for (let i = 0; i < 110; i++) dot(E, 100 + E.g() * 50, 151 + Math.abs(E.g()) * 5, .3 + .45 * E.rand());
    const glass = P('M75 31 C75 57 91 70 98 84 C91 98 75 111 75 137 L125 137 C125 111 109 98 102 84 C109 70 125 57 125 31 Z');
    fill(E, glass, E.paper);
    hatch(E, P('M70 60 C86 64 114 64 130 60 L130 90 L70 90 Z'), [70, 58, 60, 32], { ang: 0, gap: 1.05, w: .5, clip: glass });
    line(E, [[100, 84], [100, 121]], .9, E.red);
    E.ctx.save(); E.ctx.clip(glass); fill(E, P('M70 137 C82 126 94 120 100 119 C106 120 118 126 130 137 Z'), E.red); E.ctx.restore();
    edge(E, glass, .8);
    line(E, [[80, 37], [81, 52], [86, 62]], .45); line(E, [[81, 130], [82, 118]], .45);
    const topPlate = polyP([[58, 22], [142, 22], [138, 31], [62, 31]]), botPlate = polyP([[62, 137], [138, 137], [142, 146], [58, 146]]);
    [topPlate, botPlate].forEach(r => { fill(E, r.p, E.paper); hatch(E, r.p, r.bb, { ang: 0, gap: 1.3, w: .55 }); edge(E, r.p, .9); });
    const posts = [polyP([[65, 31], [69, 31], [69, 137], [65, 137]]), polyP([[131, 31], [135, 31], [135, 137], [131, 137]])];
    posts.forEach(r => { fill(E, r.p, E.paper); hatch(E, r.p, r.bb, { ang: 90, gap: 1.2, w: .5 }); edge(E, r.p, .8); });
  },
  candle(E){
    const c = E.ctx; c.strokeStyle = E.ink;
    for (let k = 0; k < 3; k++) {
      const pts = [];
      for (let i = 0; i <= 20; i++) { const t = i / 20; pts.push([101 + Math.sin(t * 5.5 + k * 1.7) * (3 + t * 9) + k * 2, 46 - t * 46]); }
      c.globalAlpha = .8 - k * .18; line(E, catmull(pts, 3), .55 - k * .08); c.globalAlpha = 1;
    }
    for (let i = 0; i < 70; i++) { const t = E.rand(); dot(E, 101 + E.g() * (2 + t * 14), 44 - t * 44, .25 + .35 * E.rand()); }
    const dish = new Path2D(); dish.ellipse(100, 136, 46, 9.5, 0, 0, TAU);
    fill(E, dish, E.paper); hatch(E, dish, [54, 126, 92, 20], { ang: 0, gap: 1.4, w: .5 }); edge(E, dish, 1);
    c.beginPath(); c.ellipse(152, 133, 6.5, 5, 0, 0, TAU); c.lineWidth = 2 * E.px; c.strokeStyle = E.ink; c.stroke();
    const body = P('M85 136 L85 62 C85 58.5 92 57 100 57 C108 57 115 58.5 115 62 L115 136 Z');
    fill(E, body, E.paper);
    hatch(E, body, [85, 57, 30, 79], { ang: 90, gap: 1.5, w: .5, clip: P('M101 50 L120 50 L120 140 L101 140 Z') });
    hatch(E, body, [85, 57, 30, 79], { ang: 35, gap: 2.2, w: .45, clip: P('M108 50 L120 50 L120 140 L108 140 Z') });
    edge(E, body, 1);
    const top = new Path2D(); top.ellipse(100, 61, 15, 3.6, 0, 0, TAU); edge(E, top, .7);
    edge(E, P('M89 62 C88.4 66 88.6 71 90 74 C91 71 90.8 66 91.6 63'), .7);
    edge(E, P('M110 62.5 C110.6 67 110.2 72 108.6 76'), .6);
    line(E, [[100, 58], [101, 48]], 1.1);
    dot(E, 101, 47.4, 1.7, E.red); dot(E, 103.4, 44.6, .6, E.red); dot(E, 99, 43.4, .5, E.red);
  }
});

/* =====================================================================
   PORTADA DEL CAPÍTULO 4 — la ciudad del v. 13 y el vapor del v. 14
   ===================================================================== */
function rgbOf(col){
  col = String(col).trim();
  if (col[0] === '#') { let h = col.slice(1); if (h.length === 3) h = h.split('').map(x => x + x).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(','); }
  const m = col.match(/\d+(\.\d+)?/g); return m ? m.slice(0, 3).join(',') : '246,241,228';
}
function mist(E, cx, cy, rx, ry, a){
  const c = E.ctx, rgb = rgbOf(E.paper);
  c.save(); c.translate(cx, cy); c.scale(rx / ry, 1);
  const g = c.createRadialGradient(0, 0, 0, 0, 0, ry);
  g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(.55, `rgba(${rgb},${a * .7})`); g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, ry, 0, TAU); c.fill(); c.restore();
  // engraved wisps: broken horizontal strokes drifting through the vapor
  c.strokeStyle = E.ink; c.globalAlpha = .6;
  const rows = Math.max(2, Math.round(ry / 3.4));
  for (let k = 0; k < rows; k++) {
    const y = cy + (k - (rows - 1) / 2) * 3.4, half = rx * (.55 + .4 * E.rand()) * (1 - Math.abs(k - (rows - 1) / 2) / rows);
    rough(E, cx - half, y, cx + half * (.6 + .4 * E.rand()), y + (E.rand() - .5), .45, { wob: .35, brk: .3, step: 2.6 });
  }
  c.globalAlpha = 1;
  for (let i = 0; i < rx * .8; i++) { const t = E.rand() * TAU, rr = .7 + E.rand() * .4; dot(E, cx + Math.cos(t) * rx * rr, cy + Math.sin(t) * ry * rr, .25 + .3 * E.rand()); }
}
function city(E, x0, y0){
  const base = x => y0 - (x - x0) * .1;
  const blds = [[0, 9, 13, 'h'], [8, 7, 22, 't'], [14, 13, 15, 'h'], [26, 9, 29, 'T'], [34, 15, 12, 'd'], [48, 8, 18, 't'], [55, 11, 12, 'h'], [65, 8, 9, 'h']];
  blds.forEach(([dx, w, h, k]) => {
    const x = x0 + dx, yb = base(x + w / 2), yt = yb - h;
    const r = polyP([[x, yt], [x + w, yt], [x + w, yb + 1], [x, yb + 1]]);
    fill(E, r.p, E.paper);
    hatch(E, r.p, r.bb, { ang: 90, gap: 1.05, w: .42, clip: P(`M${x + w * .55} ${yt - 2} L${x + w + 2} ${yt - 2} L${x + w + 2} ${yb + 2} L${x + w * .55} ${yb + 2} Z`) });
    edge(E, r.p, .6);
    if (k === 't' || k === 'T') for (let cx = x; cx < x + w - 1; cx += 2.6) fill(E, P(`M${cx} ${yt} L${cx + 1.3} ${yt} L${cx + 1.3} ${yt - 1.8} L${cx} ${yt - 1.8} Z`), E.ink);
    if (k === 'd') { const dome = new Path2D(); dome.arc(x + w / 2, yt, w / 2 - 1, Math.PI, 0); dome.closePath(); fill(E, dome, E.paper); hatch(E, dome, [x, yt - w / 2, w, w / 2], { ang: 60, gap: 1.1, w: .4 }); edge(E, dome, .6); }
    if (k === 'h') edge(E, P(`M${x - .8} ${yt + .4} L${x + w / 2} ${yt - 3.5} L${x + w + .8} ${yt + .4}`), .6);
    for (let wy = yt + 3.5; wy < yb - 3; wy += 4.5) dot(E, x + w * .3, wy, .55);
    if (k === 'T') { line(E, [[x + w / 2, yt - 1.8], [x + w / 2, yt - 11]], .6); fill(E, P(`M${x + w / 2} ${yt - 11} L${x + w / 2 + 6.5} ${yt - 9.4} L${x + w / 2} ${yt - 7.6} Z`), E.red); }
  });
  const wl = polyP([[x0 - 5, base(x0 - 5) - 5], [x0 + 77, base(x0 + 77) - 5], [x0 + 77, base(x0 + 77) + 1.5], [x0 - 5, base(x0 - 5) + 1.5]]);
  fill(E, wl.p, E.paper); hatch(E, wl.p, wl.bb, { ang: 0, gap: 1.1, w: .45 }); edge(E, wl.p, .6);
  for (let x = x0 - 5; x < x0 + 76; x += 3) fill(E, P(`M${x} ${base(x) - 5} L${x + 1.5} ${base(x) - 5} L${x + 1.5} ${base(x) - 6.8} L${x} ${base(x) - 6.8} Z`), E.ink);
  const gate = new Path2D(); gate.moveTo(x0 - 1, base(x0) + 1.5); gate.lineTo(x0 - 1, base(x0) - 2.4); gate.arc(x0 + 1.4, base(x0) - 2.4, 2.4, Math.PI, 0); gate.lineTo(x0 + 3.8, base(x0) + 1.5); gate.closePath();
  fill(E, gate, E.ink);
}
function road(E, pts){
  const S = catmull(pts, 10), n = S.length, Lp = [], Rp = [];
  for (let i = 0; i < n; i++) {
    const a = S[Math.max(0, i - 1)], b = S[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const w = (15 - 12.5 * i / (n - 1)) / 2;
    Lp.push([S[i][0] - dy * w, S[i][1] + dx * w]); Rp.push([S[i][0] + dy * w, S[i][1] - dx * w]);
  }
  const body = new Path2D(); body.moveTo(Lp[0][0], Lp[0][1]);
  for (let i = 1; i < n; i++) body.lineTo(Lp[i][0], Lp[i][1]);
  for (let i = n - 1; i >= 0; i--) body.lineTo(Rp[i][0], Rp[i][1]);
  body.closePath();
  fill(E, body, E.paper);
  line(E, Lp, .55); line(E, Rp, .7);
  for (let i = 0; i < 70; i++) { const k = Math.floor(E.rand() * n), f = E.rand(); dot(E, Lp[k][0] + (Rp[k][0] - Lp[k][0]) * f, Lp[k][1] + (Rp[k][1] - Lp[k][1]) * f, .25 + .3 * E.rand()); }
  return S;
}
function walker(E, x, y, s, pack){
  const c = E.ctx; c.save(); c.translate(x, y); c.scale(s, s);
  fill(E, P('M-1.6 -8.6 C-2.6 -5.6 -3.2 -2.6 -3.6 0 L-1.4 0 L-.4 -3 L.8 0 L3.2 0 C2.8 -2.6 2.4 -5.6 1.8 -8.6 Z'), E.ink);
  c.beginPath(); c.arc(.2, -10.4, 1.7, 0, TAU); c.fillStyle = E.ink; c.fill();
  line(E, [[2.6, -11], [3.6, .2]], .5);
  if (pack) fill(E, P('M-1.8 -8.6 L-4.6 -8 L-4.8 -4.2 L-2.2 -4.6 Z'), E.ink);
  c.restore();
}
function donkey(E, x, y, s){
  const c = E.ctx; c.save(); c.translate(x, y); c.scale(s, s);
  fill(E, P('M-5 -6.6 C-5 -8.4 4 -8.6 4.6 -6.6 C5 -5 4.6 -4 4 -3.8 L-4.6 -3.8 C-5.2 -4.2 -5.2 -5.4 -5 -6.6 Z'), E.ink);
  fill(E, P('M3.6 -7 L6.4 -10.2 L8 -9.6 L8.2 -8.6 L5.6 -6.4 Z'), E.ink);
  line(E, [[6.5, -10.1], [6.2, -12]], .5); line(E, [[7.1, -10], [7.4, -11.8]], .5);
  [[-4, -3.9, -4.4, 0], [-2.6, -3.9, -2.4, 0], [2.6, -3.9, 2.4, 0], [3.8, -3.9, 4.2, 0]].forEach(([a, b, cc, d]) => line(E, [[a, b], [cc, d]], .7));
  fill(E, P('M-3.2 -8 L1.8 -8 L1.6 -10.4 L-3 -10.4 Z'), E.ink);
  c.restore();
}
COVERS[4] = function(E){
  // engraved morning sun behind the city
  const sun = new Path2D(); sun.arc(356, 150, 30, 0, TAU);
  hatch(E, sun, [326, 120, 60, 60], { ang: 0, gap: 2.4, w: .45, brk: .08 });
  for (let i = 0; i < 26; i++) { const a = -Math.PI + i * Math.PI / 25, r1 = 42 + (i % 2) * 6; line(E, [[356 + Math.cos(a) * 36, 150 + Math.sin(a) * 36], [356 + Math.cos(a) * r1, 150 + Math.sin(a) * r1]], .45); }
  // hills run off the right edge at full width and thin out only toward the left
  const hill = t => t < .6 ? 1 : Math.pow(Math.max(0, (1 - t) / .4), .7);
  // far ridge and the city on it
  band(E, [[470, 222], [400, 226], [320, 236], [196, 262]], { w: 22, n: 10, lw: .55, fray0: .02, fray1: .3, dust: 90, dustSide: -1, spread: 9, taper: hill });
  city(E, 312, 240);
  // middle hill and near hill
  band(E, [[476, 262], [392, 284], [282, 314], [118, 352]], { w: 58, n: 26, lw: .8, fray0: .02, dust: 200, dustSide: 1, spread: 12, heavy: 1, taper: hill });
  band(E, [[484, 318], [398, 344], [286, 372], [130, 404]], { w: 64, n: 28, lw: .95, fray0: .02, dust: 170, dustSide: 1, spread: 12, heavy: 1, taper: hill });
  // the road climbing to the city gate, with travelers on it
  const S = road(E, [[200, 404], [238, 382], [262, 360], [248, 338], [270, 316], [296, 292], [306, 268], [313, 244]]);
  const at = f => S[Math.round(f * (S.length - 1))];
  let q = at(.22); walker(E, q[0] - 1, q[1] + 2, 1.15, true);
  q = at(.30); donkey(E, q[0] - 2, q[1] + 1.5, 1);
  q = at(.36); walker(E, q[0], q[1] + 1, .95, false);
  q = at(.58); walker(E, q[0], q[1] + .8, .75, true);
  q = at(.66); walker(E, q[0], q[1] + .6, .68, false);
  // vapor drifting over the hills, thinning out to the left
  mist(E, 318, 262, 124, 12, .92); mist(E, 236, 272, 74, 8, .55);
  mist(E, 370, 320, 116, 13, .88); mist(E, 270, 334, 84, 9, .6); mist(E, 196, 344, 54, 6, .4);
  [[96, 110, 6, -.2, .3], [134, 86, 4.6, .1, 0], [176, 128, 5.4, .25, .4], [82, 168, 4.6, -.1, .1], [126, 184, 6.4, .05, .5], [160, 214, 4, -.3, .2],
   [212, 166, 3.8, .2, -.1], [102, 236, 4.4, .1, .3], [64, 214, 3.6, -.25, .15], [238, 110, 3.2, .2, .1]].forEach(g => bird(E, g[0], g[1], g[2], g[3], g[4]));
};
