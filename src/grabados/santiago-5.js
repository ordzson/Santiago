/* Capítulo 5: monedas, polillas y demás viñetas; su portada (usa walker del capítulo 4). */
/* =====================================================================
   VIÑETAS DEL CAPÍTULO 5
   ===================================================================== */
function coinStack(E, cx, base, n, rust){
  const rx = 13, ry = 3.4, h = 3.6;
  for (let i = 0; i < n; i++) {
    const y = base - i * h;
    const side = new Path2D();
    side.moveTo(cx - rx, y - h);
    side.ellipse(cx, y - h, rx, ry, 0, Math.PI, 0, true);
    side.lineTo(cx + rx, y);
    side.ellipse(cx, y, rx, ry, 0, 0, Math.PI, false);
    side.closePath();
    fill(E, side, E.paper);
    hatch(E, side, [cx - rx, y - h - ry, 2 * rx, h + 2 * ry], { ang: 90, gap: 1.05, w: .45, wob: .1 });
    edge(E, side, .6);
    const top = new Path2D(); top.ellipse(cx, y - h, rx, ry, 0, 0, TAU);
    fill(E, top, E.paper); edge(E, top, .6);
    if (rust && rust.indexOf(i) >= 0) { dot(E, cx - 6 + E.rand() * 12, y - h / 2 + 1.2, 1.2, E.red); dot(E, cx + 3 + E.rand() * 4, y - h / 2 + 1.6, .7, E.red); }
  }
  const rim = new Path2D(); rim.ellipse(cx, base - n * h, rx * .7, ry * .66, 0, 0, TAU); edge(E, rim, .45);
}
function moth(E, x, y, s, rot){
  const c = E.ctx; c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  const wings = [P('M0 0 C-4 -9 -14 -10 -16 -4 C-17 1 -10 4 0 2 Z'), P('M0 0 C4 -9 14 -10 16 -4 C17 1 10 4 0 2 Z'),
    P('M0 1.5 C-6 3 -11 7 -9 10 C-6 12 -2 7 0 3 Z'), P('M0 1.5 C6 3 11 7 9 10 C6 12 2 7 0 3 Z')];
  wings.forEach(p => { fill(E, p, E.paper); hatch(E, p, [-17, -11, 34, 23], { ang: 70, gap: 1.2, w: .4 }); edge(E, p, .55); });
  fill(E, P('M-1.1 -4 C-1.4 0 -1.2 6 0 8 C1.2 6 1.4 0 1.1 -4 C.8 -6 -.8 -6 -1.1 -4 Z'), E.ink);
  line(E, [[-.6, -5], [-4, -10]], .4); line(E, [[.6, -5], [4, -10]], .4);
  c.restore();
}
Object.assign(VIG, {
  coins(E){
    for (let i = 0; i < 120; i++) dot(E, 100 + E.g() * 62, 151 + Math.abs(E.g()) * 5, .3 + .45 * E.rand());
    [[44, 147, -.12], [156, 148, .08]].forEach(([x, y, r]) => {
      const e = new Path2D(); e.ellipse(x, y, 12, 3.2, r, 0, TAU);
      fill(E, e, E.paper); hatch(E, e, [x - 12, y - 4, 24, 8], { ang: 0, gap: 1.2, w: .4 }); edge(E, e, .6);
    });
    coinStack(E, 72, 145, 9, [2, 6]);
    coinStack(E, 130, 145, 6, [3]);
    coinStack(E, 101, 149, 14, [5, 9, 12]);
    moth(E, 44, 52, 1.3, -.35);
    moth(E, 156, 34, .85, .35);
  },
  sheaf(E){
    for (let i = 0; i < 100; i++) dot(E, 100 + E.g() * 52, 151 + Math.abs(E.g()) * 5, .3 + .45 * E.rand());
    const c = E.ctx; c.strokeStyle = E.ink;
    const n = 21, wx = 96, wy = 100;
    for (let i = 0; i < n; i++) { const k = i - (n - 1) / 2; rough(E, wx + k * 1.1, wy, wx + k * 2.7, 148, .6, { wob: .3 }); }
    for (let i = 0; i < n; i++) {
      const k = i - (n - 1) / 2, bx = wx + k * 1.1, tx = wx + k * 4.2, ty = 46 + Math.abs(k) * 1.7 + (E.rand() - .5) * 4;
      c.strokeStyle = E.ink; rough(E, bx, wy, tx, ty, .6, { wob: .3 });
      c.save(); c.translate(tx, ty); c.rotate(Math.atan2(ty - wy, tx - bx));
      const head = new Path2D(); head.ellipse(5.5, 0, 6.5, 2.3, 0, 0, TAU);
      fill(E, head, E.paper); hatch(E, head, [-1, -3, 13, 6], { ang: 60, gap: 1.1, w: .45 }); edge(E, head, .55);
      line(E, [[11.5, 0], [17, 0]], .35);
      c.restore();
    }
    const tie = polyP([[wx - 10, wy - 4], [wx + 10, wy - 4], [wx + 10, wy + 4], [wx - 10, wy + 4]]);
    fill(E, tie.p, E.paper); hatch(E, tie.p, tie.bb, { ang: 90, gap: 1, w: .5 }); edge(E, tie.p, .8);
    const blade = P('M146 58 C174 60 184 96 164 120 C171 98 166 74 146 65 Z');
    fill(E, blade, E.paper); hatch(E, blade, [146, 58, 40, 62], { ang: 75, gap: 1.2, w: .45 }); edge(E, blade, .9);
    line(E, [[163, 118], [154, 144]], 3);
    dot(E, 162.4, 121, 1, E.paper);
  },
  rain(E){
    const c = E.ctx; c.strokeStyle = E.ink;
    for (let i = 0; i < 36; i++) { const x = 54 + E.rand() * 94, y = 60 + E.rand() * 56, L = 7 + E.rand() * 8; line(E, [[x, y], [x - L * .26, y + L]], .5); }
    const cloud = P('M50 58 C42 58 40 44 52 42 C52 28 70 22 82 28 C88 16 112 16 118 28 C132 22 148 32 146 44 C158 46 158 58 148 58 Z');
    fill(E, cloud, E.paper);
    hatch(E, cloud, [40, 16, 120, 42], { ang: 0, gap: 1.5, w: .5, clip: P('M30 42 L170 42 L170 60 L30 60 Z') });
    hatch(E, cloud, [40, 16, 120, 42], { ang: 25, gap: 2.4, w: .4, brk: .2 });
    edge(E, cloud, .9);
    for (let r = 0; r < 4; r++) {
      const y = 126 + r * 7.5, x0 = 18 + r * 4, x1 = 182 - r * 4;
      c.strokeStyle = E.ink; rough(E, x0, y, x1, y - 2, .7, { wob: .5 });
      for (let x = x0 + 8; x < x1 - 6; x += 12 + E.rand() * 4) { line(E, [[x, y - 1], [x - 2.2, y - 5]], .55); line(E, [[x, y - 1], [x + 2.4, y - 5.4]], .55); }
    }
    for (let i = 0; i < 80; i++) dot(E, 100 + E.g() * 80, 152 + Math.abs(E.g()) * 4, .3 + .4 * E.rand());
  },
  door(E){
    const c = E.ctx;
    for (let i = 0; i < 110; i++) dot(E, 100 + E.g() * 62, 158 + Math.abs(E.g()) * 3, .3 + .45 * E.rand());
    const outer = P('M46 152 L46 70 C46 34 72 16 100 16 C128 16 154 34 154 70 L154 152 Z');
    const inner = P('M58 152 L58 72 C58 44 78 28 100 28 C122 28 142 44 142 72 L142 152 Z');
    fill(E, outer, E.paper);
    const ring = new Path2D(); ring.addPath(outer); ring.addPath(inner);
    c.save(); c.clip(ring, 'evenodd');
    hatch(E, null, [44, 14, 112, 140], { ang: 50, gap: 2.2, w: .45, brk: .15 });
    c.restore();
    for (let i = 0; i <= 8; i++) { const a = Math.PI + i * Math.PI / 8; line(E, [[100 + Math.cos(a) * 43, 71 + Math.sin(a) * 43], [100 + Math.cos(a) * 54, 71 + Math.sin(a) * 54]], .6); }
    hatch(E, inner, [58, 28, 84, 124], { ang: 90, gap: 1.3, w: .5, wob: .15 });
    for (let x = 66; x < 142; x += 8) line(E, [[x, 40], [x, 152]], .7);
    line(E, [[100, 28], [100, 152]], 1.1);
    c.save(); c.clip(inner);
    [60, 96, 132].forEach(y => { line(E, [[56, y], [144, y]], 2.4); for (let x = 63; x < 140; x += 9) dot(E, x, y, .9, E.paper); });
    c.restore();
    [[93, 112], [107, 112]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 4, 0, TAU); c.lineWidth = 1.1 * E.px; c.strokeStyle = E.ink; c.stroke(); });
    edge(E, outer, 1); edge(E, inner, .9);
    const step = polyP([[38, 152], [162, 152], [166, 158], [34, 158]]);
    fill(E, step.p, E.paper); hatch(E, step.p, step.bb, { ang: 0, gap: 1.3, w: .5 }); edge(E, step.p, .8);
  },
  plumb(E){
    const c = E.ctx;
    for (let i = 0; i < 100; i++) dot(E, 96 + E.g() * 64, 140 + Math.abs(E.g()) * 4, .3 + .45 * E.rand());
    const wall = polyP([[30, 26], [104, 26], [104, 136], [30, 136]]);
    fill(E, wall.p, E.paper);
    hatch(E, wall.p, wall.bb, { ang: 45, gap: 2.4, w: .4, brk: .3 });
    c.strokeStyle = E.ink;
    for (let y = 26, r = 0; y < 136; y += 10, r++) {
      rough(E, 30, y, 104, y, .55, { wob: .3 });
      for (let x = 30 + (r % 2 ? 12 : 0); x < 104; x += 24) line(E, [[x, y], [x, Math.min(y + 10, 136)]], .5);
    }
    edge(E, wall.p, .9);
    const beam = polyP([[92, 12], [152, 12], [152, 19], [92, 19]]);
    fill(E, beam.p, E.paper); hatch(E, beam.p, beam.bb, { ang: 0, gap: 1.2, w: .5 }); edge(E, beam.p, .8);
    line(E, [[126, 19], [126, 102]], .55);
    fill(E, P('M126 100 C130 102 132 107 130 113 L126 123 L122 113 C120 107 122 102 126 100 Z'), E.red);
    line(E, [[123, 102], [129, 102]], .6);
  },
  oil(E){
    E.ctx.save(); E.ctx.translate(0, -14);
    VIG._oil(E);
    E.ctx.restore();
  },
  _oil(E){
    for (let i = 0; i < 90; i++) dot(E, 100 + E.g() * 56, 152 + Math.abs(E.g()) * 5, .3 + .45 * E.rand());
    const bowl = P('M62 126 L138 126 C134 141 120 148 100 148 C80 148 66 141 62 126 Z');
    fill(E, bowl, E.paper); hatch(E, bowl, [62, 126, 76, 22], { ang: 0, gap: 1.4, w: .5 });
    hatch(E, bowl, [62, 126, 76, 22], { ang: 35, gap: 2.1, w: .45, clip: P('M104 120 L142 120 L142 150 L104 150 Z') }); edge(E, bowl, .95);
    const rim = new Path2D(); rim.ellipse(100, 126, 38, 5.5, 0, 0, TAU); fill(E, rim, E.paper); edge(E, rim, .9);
    const surf = new Path2D(); surf.ellipse(100, 127, 32, 3.6, 0, 0, TAU); hatch(E, surf, [68, 123, 64, 8], { ang: 0, gap: 1.2, w: .4, wob: .6 });
    const ripple = new Path2D(); ripple.ellipse(99, 127, 7, 1.4, 0, 0, TAU); edge(E, ripple, .45);
    for (let y = 44; y < 90; y += 5) dot(E, 98 + (E.rand() - .5) * .6, y, .45);
    drop(E, 99, 101, 1.7, E.red);
    const c = E.ctx; c.save(); c.translate(84, 50); c.rotate(.8);
    edge(E, P('M11 -2 C20 -4 22 10 14 14'), 1.8);
    const body = P('M-11 -6 C-20 1 -19 18 -8 22 L8 22 C19 18 20 1 11 -6 Z');
    const neck = P('M-4.5 -6 L-4 -15 L4 -15 L4.5 -6 Z');
    const lip = P('M-6.5 -15 L6.5 -15 L7.5 -18.5 L-7.5 -18.5 Z');
    [body, neck, lip].forEach(p => fill(E, p, E.paper));
    hatch(E, body, [-20, -6, 40, 28], { ang: 90, gap: 1.5, w: .5 });
    hatch(E, body, [-20, -6, 40, 28], { ang: 30, gap: 2, w: .45, clip: P('M3 -8 L22 -8 L22 24 L3 24 Z') });
    edge(E, body, .95);
    hatch(E, neck, [-5, -15, 10, 9], { ang: 90, gap: 1.2, w: .45 }); edge(E, neck, .8); edge(E, lip, .8);
    c.restore();
  },
  elijah(E){
    const c = E.ctx; c.strokeStyle = E.ink;
    for (let y = 114; y <= 152; y += 3) rough(E, 84 + (152 - y) * .35, y, 198, y, .5, { wob: .5, brk: .12 });
    line(E, [[86, 111], [198, 111]], .7);
    const cl = P('M150 100 C145 100 144 93 150 92 C150 86 157 84 161 88 C164 82 172 83 173 89 C178 88 181 94 176 97 C179 100 176 103 171 102 Z');
    fill(E, cl, E.paper);
    hatch(E, cl, [143, 82, 39, 22], { ang: 0, gap: 1.2, w: .4, clip: P('M140 93 L186 93 L186 106 L140 106 Z') });
    edge(E, cl, .7);
    for (let i = 0; i < 50; i++) dot(E, 162 + E.g() * 28, 107 + E.g() * 4, .25 + .3 * E.rand());
    const hill = P('M2 158 L2 72 C22 64 42 68 58 80 C72 92 86 114 96 158 Z');
    fill(E, hill, E.paper);
    hatch(E, hill, [2, 64, 96, 94], { ang: 62, gap: 1.5, w: .55, brk: .06 });
    hatch(E, hill, [2, 64, 96, 94], { ang: -20, gap: 2.2, w: .45, clip: P('M40 60 L110 60 L110 160 L40 160 Z') });
    edge(E, P('M2 72 C22 64 42 68 58 80 C72 92 86 114 96 158'), 1);
    fill(E, P('M23 69 C22 63 26 58 32 58 C37 58 40 62 40 69 Z'), E.ink);
    c.beginPath(); c.arc(22.5, 66, 2.6, 0, TAU); c.fillStyle = E.ink; c.fill();
  },
  sheep(E){
    const c = E.ctx; c.strokeStyle = E.ink;
    for (let y = 142; y <= 150; y += 2.2) rough(E, 24 + E.rand() * 8, y, 178 - E.rand() * 8, y, .6, { wob: .4, brk: .1 });
    for (let i = 0; i < 70; i++) dot(E, 100 + E.g() * 60, 141 + E.g() * 3, .3 + .4 * E.rand());
    line(E, [[58, 144], [48, 34]], 1.7);
    edge(E, P('M48 34 C46 24 56 18 62 24 C65 28 62 33 58 31'), 1.7);
    [[80, 110], [90, 113], [108, 113], [118, 110]].forEach(([x, y]) => line(E, [[x, y], [x + (x < 100 ? -1 : 1), 141]], 2.3));
    const cx = 98, cy = 96, rx = 33, ry = 20, n = 16, wool = new Path2D();
    for (let i = 0; i <= n; i++) {
      const a = i / n * TAU, x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry;
      if (i === 0) wool.moveTo(x, y);
      else { const am = (i - .5) / n * TAU; wool.quadraticCurveTo(cx + Math.cos(am) * (rx + 6.5), cy + Math.sin(am) * (ry + 5.5), x, y); }
    }
    wool.closePath();
    fill(E, wool, E.paper);
    hatch(E, wool, [cx - rx - 7, cy - ry - 6, 2 * rx + 14, 2 * ry + 12], { ang: 0, gap: 1.6, w: .45, wob: .8, brk: .15, clip: P(`M40 ${cy + 4} L160 ${cy + 4} L160 130 L40 130 Z`) });
    for (let i = 0; i < 26; i++) {
      const a = E.rand() * TAU, r = Math.sqrt(E.rand()) * .8, x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r;
      c.beginPath(); c.arc(x, y, 2 + E.rand() * 1.4, Math.PI * (.9 + E.rand() * .3), Math.PI * (2.1 + E.rand() * .3));
      c.lineWidth = .5 * E.px; c.strokeStyle = E.ink; c.stroke();
    }
    edge(E, wool, .9);
    fill(E, P('M126 86 C133 79 143 83 145 91 C146 97 141 101 135 100 C130 99 126 94 126 86 Z'), E.ink);
    fill(E, P('M130 85 C127 80 122 79 120 82 C122 85 126 87 130 87 Z'), E.ink);
    dot(E, 138, 89, .8, E.paper);
  }
});

/* =====================================================================
   PORTADA DEL CAPÍTULO 5 — el labrador que espera la lluvia (v. 7)
   ===================================================================== */
COVERS[5] = function(E){
  const hill = t => t < .6 ? 1 : Math.pow(Math.max(0, (1 - t) / .4), .7);
  const cloudT = t => t < .5 ? 1 : Math.pow(Math.max(0, (1 - t) / .5), .7);
  // the rain cloud sweeping in from the upper right
  band(E, [[470, 74], [412, 98], [344, 122], [236, 150]], { w: 46, n: 22, lw: .9, fray0: .02, dust: 150, dustSide: -1, spread: 9, heavy: 1, taper: cloudT });
  band(E, [[474, 132], [420, 152], [358, 172], [272, 194]], { w: 30, n: 14, lw: .8, fray0: .02, dust: 110, dustSide: -1, spread: 8, heavy: 1, taper: cloudT });
  // rain falling on the field, slanted by the wind
  E.ctx.strokeStyle = E.ink;
  for (let i = 0; i < 130; i++) {
    const x = 236 + E.rand() * 190, y0 = 158 + (x - 236) * .26 + E.rand() * 26, L = 26 + E.rand() * 46;
    if (y0 + L > 318) continue;
    rough(E, x, y0, x - L * .24, y0 + L, .42, { wob: .2, brk: .22, step: 3 });
  }
  // the furrowed field, running off the right edge
  band(E, [[476, 282], [400, 294], [300, 310], [150, 332]], { w: 34, n: 16, lw: .7, fray0: .02, dust: 140, dustSide: 1, spread: 8, taper: hill });
  band(E, [[484, 326], [400, 340], [290, 358], [120, 382]], { w: 52, n: 24, lw: .85, fray0: .02, dust: 120, dustSide: 1, spread: 9, heavy: 1, taper: hill });
  // the farmer waiting at the edge of his field, and the first shoots in red
  walker(E, 198, 358, 1.55, false);
  [[212, 358], [222, 359.5], [232, 357.5], [242, 356]].forEach(([x, y]) => {
    line(E, [[x, y], [x, y - 5]], .9, E.red);
    line(E, [[x, y - 4], [x - 2.6, y - 7]], .9, E.red); line(E, [[x, y - 4.6], [x + 2.8, y - 7.8]], .9, E.red);
  });
  [[96, 104, 6, -.2, .3], [134, 82, 4.6, .1, 0], [176, 124, 5.4, .25, .4], [82, 166, 4.6, -.1, .1], [126, 184, 6.4, .05, .5], [160, 216, 4, -.3, .2],
   [210, 238, 3.8, .2, -.1], [100, 238, 4.4, .1, .3], [64, 212, 3.6, -.25, .15], [220, 92, 3.2, .2, .1]].forEach(g => bird(E, g[0], g[1], g[2], g[3], g[4]));
};
