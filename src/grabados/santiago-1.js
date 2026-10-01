/* Capítulo 1: semillas, la ola del v. 6 y demás viñetas; su portada. */
/* =====================================================================
   VIÑETAS DEL CAPÍTULO 1
   ===================================================================== */
function pappus(E, x, y, ang, len, color){
  for (let k = -3; k <= 3; k++) {
    const a = ang + k * .26;
    line(E, [[x, y], [x + Math.cos(a) * len, y + Math.sin(a) * len]], .4, color);
  }
}
function floatSeed(E, x, y, s, rot, color){
  const ux = Math.cos(rot), uy = Math.sin(rot);
  line(E, [[x - ux * 4 * s, y - uy * 4 * s], [x, y]], 1.1, color);
  const tx = x + ux * 8 * s, ty = y + uy * 8 * s;
  line(E, [[x, y], [tx, ty]], .45, color);
  pappus(E, tx, ty, rot, 4.5 * s, color);
}
/* ---------- the breaking wave of James 1:6 ----------
   A clear silhouette: the back rises from the right, the crest curls over to the left
   as a white lip of foam with claw-like fingers, and the face below it falls into shadow. */
function lerpPts(A, B, s){ return A.map((p, i) => [p[0] + (B[i][0] - p[0]) * s, p[1] + (B[i][1] - p[1]) * s]); }
function polyPath(pts){ const p = new Path2D(); pts.forEach((q, i) => i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])); p.closePath(); return p; }
function sketch(E, pts, w, o){
  o = o || {};
  const c = E.ctx, R = E.rand, px = E.px;
  let pen = false, off = 0;
  c.beginPath();
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], dl = Math.hypot(dx, dy) || 1;
    off = off * .6 + (R() - .5) * (o.wob == null ? .4 : o.wob) * px;
    const x = pts[i][0] - dy / dl * off, y = pts[i][1] + dx / dl * off;
    if (!pen) { c.moveTo(x, y); pen = true; } else c.lineTo(x, y);
    if (o.brk && R() < o.brk) pen = false;
  }
  c.lineWidth = w * px * (.8 + .4 * R()); c.strokeStyle = o.color || E.ink; c.stroke();
}
function claw(E, x, y, ang, L){
  const c = E.ctx; c.save(); c.translate(x, y); c.rotate(ang);
  const p = P(`M0 -3 C${L * .45} -4.2 ${L * .85} -2.4 ${L} 1.6 C${L * .8} .6 ${L * .65} 1.4 ${L * .6} 3.4 C${L * .4} 3.4 ${L * .2} 3.2 0 3 Z`);
  fill(E, p, E.paper); edge(E, p, .7);
  c.restore();
}
function seaLines(E, x0, x1, y0, rows, gap, brk){
  E.ctx.strokeStyle = E.ink;
  for (let r = 0; r < rows; r++) {
    const y = y0 + r * gap;
    rough(E, x0 + E.rand() * 20, y, x1 - E.rand() * 10, y + (E.rand() - .5) * 1.5, .55 + r * .03, { wob: .6, brk: brk == null ? .18 : brk, step: 3 });
  }
}
function wavelet(E, x, y, s){
  const p = P(`M${x - 9 * s} ${y} C${x - 5 * s} ${y - 2 * s} ${x - s} ${y - 6 * s} ${x + 3 * s} ${y - 6 * s} C${x + 6 * s} ${y - 6 * s} ${x + 7 * s} ${y - 3 * s} ${x + 5 * s} ${y - 2 * s} C${x + 4 * s} ${y - 3.4 * s} ${x + 2 * s} ${y - 3.4 * s} ${x + 2 * s} ${y - 1.6 * s} C${x + 4 * s} ${y} ${x + 8 * s} ${y} ${x + 11 * s} ${y} Z`);
  fill(E, p, E.paper); hatch(E, p, [x - 10 * s, y - 7 * s, 22 * s, 8 * s], { ang: 60, gap: 1.2, w: .4 }); edge(E, p, .7);
}
function curlWave(E, o){
  o = o || {};
  const c = E.ctx, d = o.dens || 1, R = E.rand;
  const body = P('M440 372 C380 366 330 300 310 220 C298 168 282 128 262 120 C230 104 168 112 148 150 C136 172 146 206 168 214 C160 198 166 178 190 172 C214 166 236 176 240 196 C246 240 226 320 180 372 Z');
  const lip = P('M262 120 C230 104 168 112 148 150 C136 172 146 206 168 214 C160 198 166 178 190 172 C214 166 236 176 240 196 C256 186 276 176 298 177 C290 146 280 126 262 120 Z');
  fill(E, body, E.paper);
  // the body of water: lines sweeping from the back to the face
  const back = catmull([[440, 372], [380, 360], [340, 316], [316, 262], [298, 177]], 12);
  const face = catmull([[180, 372], [214, 330], [236, 270], [243, 226], [240, 196]], 12);
  c.save(); c.clip(body);
  const N = Math.max(10, Math.round(56 * d));
  for (let k = 0; k <= N; k++) {
    const L = lerpPts(back, face, k / N);
    sketch(E, L.slice(0, Math.round(L.length * (1 - R() * .28))), .5 + .35 * (k / N), { wob: .5, brk: .015 });
  }
  const zone = (s0, s1) => polyPath(lerpPts(back, face, s0).concat(lerpPts(back, face, s1).reverse()));
  hatch(E, zone(.7, 1.04), [160, 170, 140, 210], { ang: 72, gap: 1.35, w: .5, wob: .2 });
  hatch(E, zone(.86, 1.04), [160, 170, 140, 210], { ang: -18, gap: 1.8, w: .45, wob: .2 });
  c.restore();
  // the white curl of foam
  fill(E, lip, E.paper);
  const outer = catmull([[262, 120], [232, 108], [196, 110], [164, 126], [146, 154], [146, 186], [156, 206], [168, 214]], 10);
  const inner = catmull([[298, 177], [268, 182], [240, 196], [230, 178], [210, 168], [190, 172], [174, 190], [168, 214]], 10);
  c.save(); c.clip(lip);
  hatch(E, polyPath(lerpPts(outer, inner, .78).concat(inner.slice().reverse())), [150, 150, 160, 70], { ang: 30, gap: 1.2, w: .5 });
  c.restore();
  [.24, .48, .7].forEach(s => sketch(E, lerpPts(outer, inner, s), .5, { wob: .4, brk: .04 }));
  edge(E, body, 1.1); edge(E, lip, .9);
  // claws of foam along the leading edge
  for (let i = 8; i < outer.length - 5; i += 4) {
    const a = outer[i - 1], b = outer[i + 1], q = outer[i];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    let nx = ty, ny = -tx;
    if ((q[0] - 205) * nx + (q[1] - 165) * ny < 0) { nx = -nx; ny = -ny; }
    claw(E, q[0], q[1], Math.atan2(ny + ty * .6, nx + tx * .6), 8 + R() * 5);
  }
  // spray thrown off the curl
  for (let i = 0; i < 140 * d; i++) {
    const q = outer[2 + Math.floor(R() * (outer.length - 12))];
    const dx = q[0] - 205, dy = q[1] - 165, dl = Math.hypot(dx, dy) || 1, r = 6 + Math.abs(E.g()) * 22;
    dot(E, q[0] + dx / dl * r + E.g() * 4, q[1] + dy / dl * r + E.g() * 4, .3 + .5 * R());
  }
}

Object.assign(VIG, {
  dandelion(E){
    for (let i = 0; i < 80; i++) dot(E, 64 + E.g() * 40, 153 + Math.abs(E.g()) * 4, .3 + .45 * E.rand());
    const lfL = P('M66 152 C54 148 38 146 22 138 C30 136 36 138 40 136 C46 140 54 140 58 138 C62 142 66 144 68 146 Z');
    const lfR = P('M70 152 C82 149 98 146 112 140 C106 137 100 139 96 137 C90 140 84 141 80 139 C76 143 72 145 70 146 Z');
    [lfL, lfR].forEach(l => { fill(E, l, E.paper); hatch(E, l, [20, 134, 94, 20], { ang: 15, gap: 1.3, w: .45 }); edge(E, l, .7); });
    edge(E, P('M68 152 C66 124 72 96 76 66'), 1.5);
    const cx = 76, cy = 58;
    for (let a = -Math.PI; a < Math.PI; a += .16) {
      if (a > -1.35 && a < -.05 && E.rand() < .7) continue;
      const r1 = 18 + E.rand() * 3;
      line(E, [[cx + Math.cos(a) * 3.5, cy + Math.sin(a) * 3.5], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]], .4);
      pappus(E, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, a, 4.2);
    }
    const hd = new Path2D(); hd.arc(cx, cy, 3.6, 0, TAU); fill(E, hd, E.ink);
    const drift = [[96, 46], [126, 22], [158, 38], [198, 6]];
    for (let i = 0; i < 12; i++) {
      const t = .08 + i / 12 * .9, b = bez(drift, t);
      floatSeed(E, b[0] + E.g() * 6, b[1] + E.g() * 9, .95 - t * .3, -Math.PI / 2 + (E.rand() - .5) * .9, i === 6 ? E.red : null);
    }
  },
  crucible(E){
    for (let i = 0; i < 70; i++) dot(E, 104 + E.g() * 44, 153 + Math.abs(E.g()) * 4, .3 + .45 * E.rand());
    line(E, [[104, 96], [104, 150]], 1.4);
    const flame = (x, y, h, w) => P(`M${x} ${y - h} C${x + w * .2} ${y - h * .7} ${x + w} ${y - h * .45} ${x + w * .75} ${y} L${x - w * .75} ${y} C${x - w} ${y - h * .45} ${x - w * .2} ${y - h * .7} ${x} ${y - h} Z`);
    [[82, 146, 30, 8], [126, 146, 28, 8], [94, 146, 40, 9], [114, 146, 42, 9], [104, 146, 52, 10]].forEach(([x, y, h, w]) => {
      const f = flame(x, y, h, w); fill(E, f, E.paper);
      hatch(E, f, [x - w, y - h, 2 * w, h], { ang: 90, gap: 1.6, w: .45, wob: .3 });
      edge(E, f, .75);
    });
    for (let i = 0; i < 12; i++) {
      const x = 74 + i * 5.4 + (E.rand() - .5) * 2, y = 148 + (E.rand() - .5) * 2.4;
      const coal = new Path2D(); coal.ellipse(x, y, 4.2, 3, E.rand() * .6, 0, TAU);
      fill(E, coal, E.paper); hatch(E, coal, [x - 5, y - 4, 10, 8], { ang: 45, gap: 1.1, w: .4 }); edge(E, coal, .55);
    }
    const body = P('M78 44 C79 70 88 92 104 98 C120 92 129 70 130 44 Z');
    fill(E, body, E.paper);
    hatch(E, body, [78, 44, 52, 54], { ang: 90, gap: 1.5, w: .55 });
    hatch(E, body, [78, 44, 52, 54], { ang: 35, gap: 2.1, w: .45, clip: P('M108 40 L134 40 L134 102 L108 102 Z') });
    edge(E, body, 1);
    const ring = new Path2D(); ring.ellipse(104, 84, 22, 4.6, 0, 0, TAU); edge(E, ring, 1.3);
    line(E, [[83, 86], [70, 150]], 1.4); line(E, [[125, 86], [138, 150]], 1.4);
    const rim = new Path2D(); rim.ellipse(104, 44, 26, 6, 0, 0, TAU); fill(E, rim, E.paper); edge(E, rim, .9);
    const melt = new Path2D(); melt.ellipse(104, 45, 21.5, 4.2, 0, 0, TAU); fill(E, melt, E.red);
    dot(E, 96, 30, 1, E.red); dot(E, 110, 22, .8, E.red); dot(E, 103, 13, .6, E.red);
  },
  wave(E){
    const c = E.ctx;
    // A small illustration needs a stronger silhouette than the full cover:
    // one white curling lip, one dark face and only a few supporting sea marks.
    const body = P('M194 151 C172 149 156 136 149 116 C143 99 143 82 136 69 C131 60 124 55 115 51 C96 43 72 45 56 56 C44 64 38 76 40 88 C42 98 50 104 58 106 C54 97 57 87 66 80 C76 73 90 75 98 84 C108 99 108 126 94 151 Z');
    const face = P('M136 69 C146 84 146 101 151 117 C158 137 173 147 194 151 L94 151 C108 126 108 99 98 84 C108 78 122 72 136 69 Z');
    const lip = P('M115 51 C96 43 72 45 56 56 C44 64 38 76 40 88 C42 98 50 104 58 106 C54 97 57 87 66 80 C76 73 90 75 98 84 C108 78 122 72 136 69 C131 60 124 55 115 51 Z');

    fill(E, body, E.paper);
    hatch(E, face, [92, 68, 104, 84], { ang: 76, gap: 1.35, w: .52, wob: .2 });
    hatch(E, face, [92, 68, 104, 84], { ang: -14, gap: 3.4, w: .42, wob: .2 });
    c.save(); c.clip(body);
    for (let k = 0; k < 7; k++) {
      c.beginPath(); c.moveTo(190, 145 - k * 8);
      c.bezierCurveTo(168, 143 - k * 7, 154, 123 - k * 5, 140, 77 - k * .8);
      c.lineWidth = (.45 + k * .035) * E.px; c.strokeStyle = E.ink; c.stroke();
    }
    c.restore();

    fill(E, lip, E.paper);
    const outer = catmull([[115, 51], [96, 44], [76, 47], [57, 57], [43, 72], [41, 89], [48, 101], [58, 106]], 6);
    const inner = catmull([[136, 69], [119, 72], [103, 79], [98, 84], [91, 75], [77, 73], [66, 80], [58, 106]], 6);
    [.3, .58, .82].forEach(s => sketch(E, lerpPts(outer, inner, s), .55, { wob: .32, brk: .025 }));
    edge(E, body, 1.35); edge(E, lip, 1.2);

    [[104, 47, -1.9, 8], [86, 45, -1.65, 7], [68, 50, -2.25, 7], [53, 59, -2.7, 8], [43, 74, -3.05, 7], [42, 90, 2.85, 6]].forEach(a => claw(E, a[0], a[1], a[2], a[3]));
    for (let i = 0; i < 36; i++) {
      const q = outer[Math.floor(E.rand() * Math.max(1, outer.length - 8))];
      const dx = q[0] - 78, dy = q[1] - 77, dl = Math.hypot(dx, dy) || 1;
      const r = 4 + Math.abs(E.g()) * 12;
      dot(E, q[0] + dx / dl * r + E.g() * 2.5, q[1] + dy / dl * r + E.g() * 2.5, .3 + E.rand() * .35);
    }

    E.ctx.strokeStyle = E.ink;
    seaLines(E, 6, 196, 151, 3, 3.2, .22);
    wavelet(E, 28, 149, .72);
    for (let k = 0; k < 3; k++) rough(E, 158 + k * 4, 21 + k * 9, 196, 13 + k * 8, .55, { wob: .35, brk: .12, step: 3 });
  },
  flower(E){
    const c = E.ctx;
    const sun = new Path2D(); sun.arc(164, 30, 15, 0, TAU);
    fill(E, sun, E.paper); hatch(E, sun, [149, 15, 30, 30], { ang: 0, gap: 1.8, w: .45 }); edge(E, sun, .7);
    for (let i = 0; i < 18; i++) { const a = i * TAU / 18, r1 = 21 + (i % 2) * 6; line(E, [[164 + Math.cos(a) * 18.5, 30 + Math.sin(a) * 18.5], [164 + Math.cos(a) * r1, 30 + Math.sin(a) * r1]], .5); }
    c.strokeStyle = E.ink;
    for (let y = 146; y <= 154; y += 2.2) rough(E, 14 + E.rand() * 8, y, 186 - E.rand() * 8, y, .55, { wob: .4, brk: .12 });
    for (let i = 0; i < 46; i++) {
      const x = 16 + E.rand() * 168, h = 12 + E.rand() * 24, bend = (E.rand() - .3) * 14;
      c.beginPath(); c.moveTo(x, 146);
      c.bezierCurveTo(x + bend * .2, 146 - h * .5, x + bend * .7, 146 - h * .85, x + bend, 146 - h);
      c.lineWidth = (.45 + E.rand() * .35) * E.px; c.strokeStyle = E.ink; c.stroke();
    }
    edge(E, P('M92 146 C90 120 96 92 108 78 C116 70 124 74 126 84'), 1.4);
    const lf = P('M93 128 C84 120 76 118 68 120 C76 128 86 131 93 130 Z');
    fill(E, lf, E.paper); hatch(E, lf, [68, 118, 26, 13], { ang: -20, gap: 1.3, w: .45 }); edge(E, lf, .75);
    c.save(); c.translate(126, 86); c.rotate(.25);
    const head = P('M-8 0 C-8 -4 8 -4 8 0 L10 15 C6 13 3 16 0 14 C-3 16 -6 13 -10 15 Z');
    fill(E, head, E.paper); hatch(E, head, [-10, -4, 20, 20], { ang: 90, gap: 1.3, w: .45 }); edge(E, head, .85);
    c.restore();
    [[138, 112, .6], [148, 128, -.4], [133, 138, 1.1]].forEach(([x, y, r]) => {
      c.save(); c.translate(x, y); c.rotate(r);
      fill(E, P('M0 -4.4 C3.2 -2 3.2 2 0 4.4 C-3.2 2 -3.2 -2 0 -4.4 Z'), E.red);
      c.restore();
    });
  },
  wreath(E){
    const c = E.ctx, cx = 100, cy = 76, R = 50;
    for (let i = 0; i < 70; i++) dot(E, 100 + E.g() * 40, 154 + Math.abs(E.g()) * 4, .3 + .4 * E.rand());
    const leaf = (x, y, ang, L, W) => {
      c.save(); c.translate(x, y); c.rotate(ang);
      const l = P(`M0 0 C${L * .3} ${-W} ${L * .75} ${-W} ${L} 0 C${L * .75} ${W} ${L * .3} ${W} 0 0 Z`);
      fill(E, l, E.paper);
      hatch(E, l, [0, -W, L, 2 * W], { ang: 60, gap: 1.15, w: .4, clip: P(`M0 0 L${L} 0 L${L} ${W + 1} L0 ${W + 1} Z`) });
      edge(E, l, .65); line(E, [[0, 0], [L * .85, 0]], .35);
      c.restore();
    };
    [-1, 1].forEach(s => {
      const th = t => Math.PI / 2 - s * (.24 + t * 2.62);
      const pts = []; for (let i = 0; i <= 40; i++) { const a = th(i / 40); pts.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R]); }
      line(E, pts, 1.2);
      for (let i = 0; i < 12; i++) {
        const t = .03 + i * .08, a = th(t), x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
        const tx = s * Math.sin(a), ty = -s * Math.cos(a);
        const L = 13 - i * .35, W = 3.6 - i * .08;
        leaf(x, y, Math.atan2(ty * .8 + Math.sin(a) * .6, tx * .8 + Math.cos(a) * .6), L, W);
        leaf(x, y, Math.atan2(ty * .8 - Math.sin(a) * .6, tx * .8 - Math.cos(a) * .6), L * .9, W * .9);
        if (i % 3 === 1) dot(E, x + Math.cos(a) * 2, y + Math.sin(a) * 2, 1.3);
      }
    });
    const bx = cx, by = cy + R + 2;
    fill(E, P(`M${bx} ${by} C${bx - 10} ${by - 9} ${bx - 18} ${by - 4} ${bx - 15} ${by + 3} C${bx - 12} ${by + 7} ${bx - 5} ${by + 3} ${bx} ${by} Z`), E.red);
    fill(E, P(`M${bx} ${by} C${bx + 10} ${by - 9} ${bx + 18} ${by - 4} ${bx + 15} ${by + 3} C${bx + 12} ${by + 7} ${bx + 5} ${by + 3} ${bx} ${by} Z`), E.red);
    fill(E, P(`M${bx - 2} ${by + 1} L${bx - 10} ${by + 22} L${bx - 6} ${by + 19} L${bx - 4} ${by + 24} L${bx + 1} ${by + 2} Z`), E.red);
    fill(E, P(`M${bx + 2} ${by + 1} L${bx + 10} ${by + 20} L${bx + 6} ${by + 18} L${bx + 3} ${by + 23} L${bx - 1} ${by + 2} Z`), E.red);
    const knot = new Path2D(); knot.ellipse(bx, by, 3, 2.6, 0, 0, TAU); fill(E, knot, E.red); edge(E, knot, .5);
  },
  hook(E){
    const c = E.ctx; c.strokeStyle = E.ink;
    for (let k = 0; k < 3; k++) rough(E, 8, 12 + k * 3.4, 192, 12 + k * 3.4 + (E.rand() - .5), .5, { wob: .9, brk: .25, step: 3 });
    for (let i = 0; i < 70; i++) dot(E, 100 + E.g() * 70, 154 + Math.abs(E.g()) * 3, .3 + .4 * E.rand());
    [[18, 156, 1], [26, 156, -1], [176, 156, 1]].forEach(([x, y, s]) => edge(E, P(`M${x} ${y} C${x + 6 * s} ${y - 14} ${x - 6 * s} ${y - 26} ${x + 2 * s} ${y - 40}`), .9));
    line(E, [[134, 20], [134, 60]], .5);
    c.beginPath(); c.arc(134, 63, 2.6, 0, TAU); c.lineWidth = 1 * E.px; c.strokeStyle = E.ink; c.stroke();
    c.beginPath(); c.moveTo(134, 65.6); c.lineTo(134, 108); c.bezierCurveTo(134, 124, 112, 126, 111, 108); c.lineTo(110.5, 98);
    c.lineWidth = 1.9; c.strokeStyle = E.ink; c.stroke();
    fill(E, P('M110.5 95 L107.2 104 L112 102.2 Z'), E.ink);
    c.beginPath(); c.moveTo(133, 92); c.bezierCurveTo(124, 88, 122, 98, 128, 101); c.bezierCurveTo(135, 104, 133, 113, 126, 112); c.bezierCurveTo(119, 111, 118, 118, 122, 123);
    c.lineWidth = 3.4; c.strokeStyle = E.red; c.stroke();
    const fishBody = P('M92 104 C86 94 72 90 58 92 C46 94 36 100 30 104 C36 108 46 114 58 116 C72 118 86 114 92 104 Z');
    const tail = P('M33 104 L16 93 L21 104 L16 115 Z');
    fill(E, tail, E.paper); hatch(E, tail, [16, 93, 17, 22], { ang: 0, gap: 1.2, w: .45 }); edge(E, tail, .8);
    fill(E, fishBody, E.paper);
    hatch(E, fishBody, [30, 90, 62, 28], { ang: 50, gap: 2.6, w: .4 });
    hatch(E, fishBody, [30, 90, 62, 28], { ang: -50, gap: 2.6, w: .4 });
    hatch(E, fishBody, [30, 90, 62, 28], { ang: 0, gap: 1.3, w: .45, clip: P('M20 108 L100 108 L100 120 L20 120 Z') });
    edge(E, fishBody, 1);
    edge(E, P('M56 92 L62 83 L70 85 L72 92'), .8);
    edge(E, P('M58 116 L62 123 L69 116'), .8);
    edge(E, P('M78 95 C74 100 74 108 78 113'), .8);
    dot(E, 84, 101, 2.2); dot(E, 84.6, 100.4, .7, E.paper);
    [[98, 94, 1.6], [101, 85, 1.2], [99, 77, .9]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, TAU); c.lineWidth = .5 * E.px; c.strokeStyle = E.ink; c.stroke(); });
  },
  lights(E){
    const c = E.ctx;
    const sx = 92, sy = 72, R = 22;
    for (let i = 0; i < 32; i++) {
      const a = i * TAU / 32, long = i % 2 === 0, r0 = R + 4, r1 = R + (long ? 20 : 11) + E.rand() * 3;
      line(E, [[sx + Math.cos(a) * r0, sy + Math.sin(a) * r0], [sx + Math.cos(a) * r1, sy + Math.sin(a) * r1]], long ? .7 : .45);
    }
    const sun = new Path2D(); sun.arc(sx, sy, R, 0, TAU);
    fill(E, sun, E.paper); hatch(E, sun, [sx - R, sy - R, 2 * R, 2 * R], { ang: 0, gap: 1.7, w: .5 }); edge(E, sun, .9);
    const mx = 162, my = 34, mr = 13;
    const moon = new Path2D(); moon.arc(mx, my, mr, 0, TAU);
    const cut = new Path2D(); cut.rect(mx - 20, my - 20, 40, 40); cut.arc(mx + 6, my - 4, mr * .9, 0, TAU);
    c.save(); c.clip(cut, 'evenodd');
    fill(E, moon, E.paper); hatch(E, moon, [mx - mr, my - mr, 2 * mr, 2 * mr], { ang: 45, gap: 1.2, w: .45 }); edge(E, moon, .8);
    c.restore();
    c.save(); c.clip(moon); c.beginPath(); c.arc(mx + 6, my - 4, mr * .9, 0, TAU); c.lineWidth = .8 * E.px; c.strokeStyle = E.ink; c.stroke(); c.restore();
    const star = (x, y, r, col) => fill(E, P(`M${x} ${y - r} L${x + r * .22} ${y - r * .22} L${x + r} ${y} L${x + r * .22} ${y + r * .22} L${x} ${y + r} L${x - r * .22} ${y + r * .22} L${x - r} ${y} L${x - r * .22} ${y - r * .22} Z`), col || E.ink);
    [[146, 82, 4.2], [182, 64, 2.6], [128, 18, 3.2], [36, 26, 3.6], [20, 72, 2.4], [48, 118, 2.8], [188, 108, 2.2], [154, 120, 3]].forEach(([x, y, r], i) => star(x, y, r, i === 1 ? E.red : null));
    c.strokeStyle = E.ink;
    for (let k = 0; k < 4; k++) { const y = 140 + k * 4; rough(E, 30 + k * 6, y, 196 - k * 4, y - 6 + k, .55, { wob: .5, brk: .12 }); }
    for (let i = 0; i < 60; i++) dot(E, 110 + E.g() * 60, 138 + E.g() * 4, .3 + .4 * E.rand());
  },
  roots(E){
    const c = E.ctx; c.strokeStyle = E.ink;
    const gy = 74;
    const soil = P(`M14 ${gy} L190 ${gy} C188 112 156 150 102 152 C48 150 16 114 14 ${gy} Z`);
    fill(E, soil, E.paper);
    hatch(E, soil, [14, gy, 176, 80], { ang: 0, gap: 3, w: .4, brk: .45, wob: .5 });
    c.save(); c.clip(soil);
    for (let i = 0; i < 90; i++) dot(E, 30 + E.rand() * 140, gy + 6 + E.rand() * 60, .3 + .5 * E.rand());
    [[46, 104, 5, 3.4], [150, 96, 4, 3], [126, 132, 6, 3.8], [70, 132, 3.4, 2.4]].forEach(([x, y, rx, ry]) => {
      const s = new Path2D(); s.ellipse(x, y, rx, ry, E.rand(), 0, TAU);
      fill(E, s, E.paper); hatch(E, s, [x - rx, y - ry, 2 * rx, 2 * ry], { ang: 45, gap: 1.1, w: .4 }); edge(E, s, .6);
    });
    const root = (x, y, ang, len, w, depth) => {
      const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
      const mx = (x + x2) / 2 + (E.rand() - .5) * len * .3, my = (y + y2) / 2 + (E.rand() - .5) * len * .3;
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(mx, my, x2, y2); c.lineWidth = w * E.px; c.strokeStyle = E.ink; c.stroke();
      if (depth <= 0) return;
      const kids = depth >= 3 ? 3 : 2;
      for (let k = 0; k < kids; k++) root(x2, y2, ang + (k - (kids - 1) / 2) * (.55 + E.rand() * .3) + (E.rand() - .5) * .2, len * (.6 + E.rand() * .15), Math.max(.4, w * .66), depth - 1);
    };
    root(100, gy, Math.PI / 2, 24, 2.2, 4);
    c.restore();
    edge(E, soil, .8);
    rough(E, 8, gy, 194, gy, 1, { wob: .3 });
    for (let i = 0; i < 22; i++) { const x = 16 + E.rand() * 170; if (Math.abs(x - 100) < 8) continue; line(E, [[x, gy], [x + (E.rand() - .5) * 4, gy - 3 - E.rand() * 5]], .5); }
    edge(E, P(`M100 ${gy} C99 ${gy - 14} 101 ${gy - 28} 100 ${gy - 44}`), 1.4);
    const lf = (dir, y, L) => {
      const p = P(`M100 ${y} C${100 + dir * L * .3} ${y - 9} ${100 + dir * L * .75} ${y - 10} ${100 + dir * L} ${y - 6} C${100 + dir * L * .7} ${y + 1} ${100 + dir * L * .3} ${y + 2} 100 ${y} Z`);
      fill(E, p, E.paper); hatch(E, p, [100 + Math.min(0, dir * L), y - 11, L, 13], { ang: dir * 30, gap: 1.3, w: .45 }); edge(E, p, .8);
    };
    lf(-1, gy - 18, 26); lf(1, gy - 26, 24); lf(-1, gy - 36, 16); lf(1, gy - 41, 13);
  },
  mirror(E){
    const c = E.ctx;
    for (let i = 0; i < 70; i++) dot(E, 100 + E.g() * 46, 154 + Math.abs(E.g()) * 4, .3 + .45 * E.rand());
    c.save(); c.translate(106, 56); c.rotate(-.32);
    const handle = P('M-3.6 34 C-4.6 50 -5.4 68 -3.6 86 L3.6 86 C5.4 68 4.6 50 3.6 34 Z');
    fill(E, handle, E.paper);
    hatch(E, handle, [-6, 34, 12, 52], { ang: 90, gap: 1.15, w: .45 });
    hatch(E, handle, [-6, 34, 12, 52], { ang: 30, gap: 1.8, w: .4, clip: P('M0 30 L8 30 L8 90 L0 90 Z') });
    edge(E, handle, .9);
    const knob = (y, rx, ry) => { const e = new Path2D(); e.ellipse(0, y, rx, ry, 0, 0, TAU); fill(E, e, E.paper); hatch(E, e, [-rx, y - ry, 2 * rx, 2 * ry], { ang: 90, gap: 1.1, w: .45 }); edge(E, e, .8); };
    knob(35, 7, 2.6); knob(58, 6, 2.4); knob(86, 7, 2.8);
    const fin = new Path2D(); fin.arc(0, 93, 4, 0, TAU); fill(E, fin, E.paper); hatch(E, fin, [-4, 89, 8, 8], { ang: 45, gap: 1.1, w: .45 }); edge(E, fin, .8);
    const outer = new Path2D(); outer.arc(0, 0, 34, 0, TAU);
    const inner = new Path2D(); inner.arc(0, 0, 28.5, 0, TAU);
    fill(E, outer, E.paper);
    const ringP = new Path2D(); ringP.addPath(outer); ringP.addPath(inner);
    c.save(); c.clip(ringP, 'evenodd'); hatch(E, null, [-36, -36, 72, 72], { ang: 90, gap: 1.2, w: .5 }); c.restore();
    c.save(); c.clip(inner);
    hatch(E, null, [-30, -30, 60, 60], { ang: 58, gap: 2.2, w: .4 });
    // the face looking into the mirror, in profile
    const face = P('M10 -24 C0 -25 -9 -18 -10 -8 L-14 -1 C-13 1 -11 1.5 -10.5 2 C-11 4 -11 5.5 -9.5 6.5 C-10.5 8 -10 10 -8 11 C-7.5 15 -4 18 2 18 L4 30 L30 30 L30 -24 Z');
    fill(E, face, E.paper);
    hatch(E, face, [-15, -26, 46, 58], { ang: 58, gap: 1.05, w: .5 });
    hatch(E, face, [-15, -26, 46, 58], { ang: -32, gap: 1.6, w: .4 });
    edge(E, face, .7);
    fill(E, P('M-30 2 L-6 -30 L-2 -30 L-30 8 Z'), E.paper);
    c.restore();
    edge(E, outer, 1.1); edge(E, inner, .8);
    c.restore();
  },
  basket(E){
    const c = E.ctx;
    for (let i = 0; i < 90; i++) dot(E, 100 + E.g() * 56, 152 + Math.abs(E.g()) * 4, .3 + .45 * E.rand());
    const hdl = new Path2D();
    hdl.ellipse(100, 96, 44, 56, 0, Math.PI, TAU); hdl.ellipse(100, 96, 39.5, 51, 0, TAU, Math.PI, true); hdl.closePath();
    fill(E, hdl, E.paper); hatch(E, hdl, [54, 38, 92, 60], { ang: 62, gap: 1.6, w: .5 }); edge(E, hdl, .8);
    const loaf = (x, y, rx, ry) => {
      const l = new Path2D(); l.ellipse(x, y, rx, ry, 0, Math.PI, TAU); l.closePath();
      fill(E, l, E.paper);
      hatch(E, l, [x - rx, y - ry, 2 * rx, ry], { ang: 0, gap: 1.5, w: .45, clip: P(`M${x - rx - 1} ${y - ry * .45} L${x + rx + 1} ${y - ry * .45} L${x + rx + 1} ${y + 1} L${x - rx - 1} ${y + 1} Z`) });
      edge(E, l, .85);
      for (let k = -1; k <= 1; k++) line(E, [[x + k * rx * .4 - 3, y - ry * .7], [x + k * rx * .4 + 3, y - ry * .95]], .7);
    };
    loaf(84, 97, 20, 15); loaf(114, 96, 17, 12);
    const body = P('M54 96 L146 96 C144 120 134 140 100 142 C66 140 56 120 54 96 Z');
    fill(E, body, E.paper);
    c.save(); c.clip(body);
    for (let y = 98, r = 0; y < 142; y += 6, r++) {
      line(E, [[50, y], [150, y]], .55);
      for (let x = 52 + (r % 2 ? 3.5 : 0); x < 150; x += 7) line(E, [[x, y + .8], [x + 1.2, y + 5.2]], .55);
    }
    hatch(E, null, [50, 94, 100, 50], { ang: 40, gap: 2.2, w: .45, clip: P('M112 90 L152 90 L152 146 L112 146 Z') });
    c.restore();
    edge(E, body, 1);
    const rim = new Path2D(); rim.ellipse(100, 96, 47, 5.5, 0, 0, TAU);
    fill(E, rim, E.paper); hatch(E, rim, [53, 90, 94, 12], { ang: 60, gap: 1.5, w: .5 }); edge(E, rim, .9);
    fill(E, P('M124 93 C134 90 144 91 148 95 C149 106 145 119 139 126 C135 117 129 108 121 103 C121 99 122 95 124 93 Z'), E.red);
  }
});

/* =====================================================================
   PORTADA DEL CAPÍTULO 1 — la ola del mar llevada por el viento (v. 6)
   ===================================================================== */
COVERS[1] = function(E){
  // wind driving in from the upper right
  band(E, [[452, 40], [410, 64], [352, 88], [280, 104]], { w: 24, n: 11, lw: .8, dust: 110, dustSide: -1, spread: 12, brk: .02, heavy: 1 });
  band(E, [[456, 96], [430, 112], [394, 128], [336, 144]], { w: 16, n: 7, lw: .7, dust: 70, dustSide: -1, spread: 10, brk: .02, heavy: 1 });
  // the far horizon with a small red sun
  E.ctx.strokeStyle = E.ink;
  rough(E, 30, 316, 92, 316, .6, { wob: .3, brk: .1 }); rough(E, 116, 316, 200, 316, .6, { wob: .3, brk: .1 });
  const sun = new Path2D(); sun.arc(104, 308, 10, 0, TAU); fill(E, sun, E.red);
  for (let k = 0; k < 3; k++) line(E, [[92, 311.5 + k * 2.6], [116, 311.5 + k * 2.6]], .8, E.paper);
  // the open sea between the horizon and the wave
  seaLines(E, 24, 210, 326, 5, 9, .35);
  wavelet(E, 58, 350, 1.4); wavelet(E, 118, 340, 1); wavelet(E, 160, 360, 1.1);
  // the wave itself
  curlWave(E, {});
  // the sea in front
  seaLines(E, 16, 440, 375, 9, 3.4);
  wavelet(E, 40, 384, 1.7); wavelet(E, 132, 388, 1.3); wavelet(E, 86, 398, 1.5);
  [[84, 96, 6, -.2, .3], [122, 70, 4.6, .1, 0], [60, 150, 4.6, -.1, .1], [104, 138, 6.4, .05, .5], [176, 62, 4, .25, .2],
   [214, 46, 3.6, .2, -.1], [44, 214, 3.6, -.25, .15], [92, 236, 4.2, .1, .3], [146, 40, 3.2, .2, .1]].forEach(g => bird(E, g[0], g[1], g[2], g[3], g[4]));
};
