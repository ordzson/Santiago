/* Capítulo 2: viñetas, la palmera y la muralla de Jericó; su portada.
   Usa polyPath y sketch (capítulo 1) y road y walker (capítulo 4). */
/* =====================================================================
   VIÑETAS DEL CAPÍTULO 2
   ===================================================================== */
function bboxOf(pts, pad){
  pad = pad == null ? 1 : pad;
  let a = 1e9, b = 1e9, c = -1e9, d = -1e9;
  pts.forEach(([x, y]) => { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); });
  return [a - pad, b - pad, c - a + 2 * pad, d - b + 2 * pad];
}
function shadeFill(E, path, pts, o){ fill(E, path, E.paper); hatch(E, path, bboxOf(pts), o); edge(E, path, o.edge || .9); }

Object.assign(VIG, {
  ring(E){
    const c = E.ctx, cx = 100, cy = 90;
    for (let i = 0; i < 80; i++) dot(E, 102 + E.g() * 46, 138 + Math.abs(E.g()) * 4, .3 + .45 * E.rand());
    const shadow = new Path2D(); shadow.ellipse(104, 136, 40, 5, 0, 0, TAU);
    hatch(E, shadow, [64, 131, 80, 10], { ang: 0, gap: 1.3, w: .45 });
    const outer = new Path2D(); outer.ellipse(cx, cy, 36, 40, 0, 0, TAU);
    const inner = new Path2D(); inner.ellipse(cx, cy + 2, 27, 31, 0, 0, TAU);
    const band = new Path2D(); band.addPath(outer); band.addPath(inner);
    c.save(); c.clip(band, 'evenodd');
    fill(E, outer, E.paper);
    hatch(E, null, [cx - 40, cy - 44, 80, 88], { ang: 90, gap: 1.6, w: .5 });
    hatch(E, null, [cx - 40, cy - 44, 80, 88], { ang: 30, gap: 2.2, w: .45, clip: P(`M${cx + 6} ${cy - 50} L${cx + 50} ${cy - 50} L${cx + 50} ${cy + 50} L${cx + 6} ${cy + 50} Z`) });
    fill(E, P(`M${cx - 34} ${cy - 8} C${cx - 31} ${cy - 25} ${cx - 23} ${cy - 34} ${cx - 15} ${cy - 38} L${cx - 11} ${cy - 34} C${cx - 19} ${cy - 30} ${cx - 26} ${cy - 21} ${cx - 29} ${cy - 6} Z`), E.paper);
    c.restore();
    edge(E, outer, 1.1); edge(E, inner, .9);
    const seat = new Path2D(); seat.ellipse(cx, cy - 40, 15, 9.5, 0, 0, TAU);
    fill(E, seat, E.paper); hatch(E, seat, [cx - 15, cy - 50, 30, 20], { ang: 0, gap: 1.2, w: .45 }); edge(E, seat, 1);
    const gem = new Path2D(); gem.ellipse(cx, cy - 41, 9.5, 6, 0, 0, TAU); fill(E, gem, E.red);
    line(E, [[cx - 5, cy - 43.5], [cx + 1, cy - 45]], .9, E.paper);
    [[-10, -47], [10, -47], [-12, -35], [12, -35]].forEach(([dx, dy]) => dot(E, cx + dx, cy + dy, 1.5));
  },
  crown(E){
    for (let i = 0; i < 80; i++) dot(E, 100 + E.g() * 56, 150 + Math.abs(E.g()) * 4, .3 + .45 * E.rand());
    const cush = P('M40 134 C40 121 160 121 160 134 C160 147 40 147 40 134 Z');
    fill(E, cush, E.paper);
    hatch(E, cush, [40, 121, 120, 26], { ang: 0, gap: 1.5, w: .5 });
    hatch(E, cush, [40, 121, 120, 26], { ang: 50, gap: 2.2, w: .4, clip: P('M100 118 L164 118 L164 150 L100 150 Z') });
    edge(E, cush, .9);
    [[40, 134], [160, 134]].forEach(([x, y]) => { line(E, [[x, y], [x + (x < 100 ? -3 : 3), y + 10]], .8); fill(E, P(`M${x + (x < 100 ? -6 : 0)} ${y + 10} L${x + (x < 100 ? 0 : 6)} ${y + 10} L${x + (x < 100 ? -2 : 4)} ${y + 19} L${x + (x < 100 ? -4 : 2)} ${y + 19} Z`), E.ink); });
    const top = P('M56 114 L50 66 L72 92 L84 54 L100 86 L116 54 L128 92 L150 66 L144 114 Z');
    fill(E, top, E.paper);
    hatch(E, top, [50, 54, 100, 60], { ang: 90, gap: 1.7, w: .5 });
    hatch(E, top, [50, 54, 100, 60], { ang: 30, gap: 2.2, w: .45, clip: P('M104 50 L154 50 L154 118 L104 118 Z') });
    edge(E, top, 1);
    [[50, 66], [84, 54], [116, 54], [150, 66]].forEach(([x, y]) => { const b = new Path2D(); b.arc(x, y - 3, 3.4, 0, TAU); fill(E, b, E.paper); edge(E, b, .8); });
    const bandP = P('M54 108 C76 114 124 114 146 108 L146 125 C124 131 76 131 54 125 Z');
    fill(E, bandP, E.paper); hatch(E, bandP, [54, 108, 92, 23], { ang: 0, gap: 1.3, w: .5 }); edge(E, bandP, 1);
    [[72, 119, 4, 3, false], [100, 120.5, 6.5, 4.4, true], [128, 119, 4, 3, false]].forEach(([x, y, rx, ry, red]) => {
      const j = new Path2D(); j.ellipse(x, y, rx, ry, 0, 0, TAU); fill(E, j, red ? E.red : E.paper); edge(E, j, .7);
    });
  },
  scepter(E){
    const c = E.ctx;
    for (let i = 0; i < 80; i++) dot(E, 100 + E.g() * 56, 150 + Math.abs(E.g()) * 4, .3 + .45 * E.rand());
    const sheet = polyPath([[44, 106], [156, 98], [162, 134], [50, 142]]);
    fill(E, sheet, E.paper);
    c.strokeStyle = E.ink;
    for (let k = 0; k < 5; k++) {
      const t = .18 + k * .15, x0 = 56 + t * 4, y0 = 106 + t * 36, x1 = 150 + t * 4 - (k === 4 ? 44 : 0), y1 = 98 + t * 36;
      rough(E, x0, y0 - 1, x1, y1 - 1 + (x1 - x0) * 0, .6, { wob: .9, brk: .3, step: 2.6 });
    }
    edge(E, sheet, .9);
    [[44, 106, 50, 142], [156, 98, 162, 134]].forEach(([x0, y0, x1, y1]) => {
      const pts = [[x0 - 4, y0 - 1], [x0 + 4, y0 - 1.6], [x1 + 4, y1 + .4], [x1 - 4, y1 + 1]];
      shadeFill(E, polyPath(pts), pts, { ang: 82, gap: 1.2, w: .45 });
    });
    c.save(); c.translate(100, 84); c.rotate(-.55);
    const rod = P('M-62 -2.4 L52 -2.4 L52 2.4 L-62 2.4 Z');
    fill(E, rod, E.paper); hatch(E, rod, [-62, -3, 114, 6], { ang: 0, gap: 1, w: .45 }); edge(E, rod, .9);
    [-40, -10, 20].forEach(x => { const k = new Path2D(); k.ellipse(x, 0, 2.6, 4.2, 0, 0, TAU); fill(E, k, E.paper); edge(E, k, .8); });
    const butt = new Path2D(); butt.arc(-64, 0, 3.6, 0, TAU); fill(E, butt, E.paper); edge(E, butt, .9);
    const orb = new Path2D(); orb.arc(61, 0, 9, 0, TAU);
    fill(E, orb, E.paper); hatch(E, orb, [52, -9, 18, 18], { ang: 90, gap: 1.3, w: .45 }); edge(E, orb, 1);
    const jw = new Path2D(); jw.ellipse(61, 0, 3.6, 4.6, 0, 0, TAU); fill(E, jw, E.red);
    fill(E, P('M70 -2.6 L78 0 L70 2.6 Z'), E.ink);
    c.restore();
  },
  chain(E){
    const c = E.ctx;
    for (let i = 0; i < 60; i++) dot(E, 100 + E.g() * 70, 134 + Math.abs(E.g()) * 4, .3 + .4 * E.rand());
    const yAt = x => 74 + (x - 100) * .06;
    const faceLink = x => {
      const y = yAt(x), o = new Path2D(), i2 = new Path2D(), ring = new Path2D();
      o.ellipse(x, y, 13, 8.6, .06, 0, TAU); i2.ellipse(x, y, 7.6, 3.4, .06, 0, TAU);
      ring.addPath(o); ring.addPath(i2);
      c.save(); c.clip(ring, 'evenodd'); fill(E, o, E.paper); hatch(E, null, [x - 14, y - 10, 28, 20], { ang: 70, gap: 1.3, w: .45 }); c.restore();
      edge(E, o, .9); edge(E, i2, .8);
    };
    const sideLink = x => {
      const y = yAt(x);
      const s = P(`M${x - 13} ${y - 2.8} L${x + 13} ${y - 2.8} C${x + 16.5} ${y - 2.8} ${x + 16.5} ${y + 2.8} ${x + 13} ${y + 2.8} L${x - 13} ${y + 2.8} C${x - 16.5} ${y + 2.8} ${x - 16.5} ${y - 2.8} ${x - 13} ${y - 2.8} Z`);
      fill(E, s, E.paper); hatch(E, s, [x - 17, y - 3, 34, 6], { ang: 0, gap: 1.1, w: .45 }); edge(E, s, .9);
      line(E, [[x - 11, y - .7], [x + 11, y - .7]], .5, E.paper);
    };
    [16, 56, 144, 184].forEach(faceLink); [36, 76, 124, 164].forEach(sideLink);
    const y0 = yAt(100);
    c.save(); c.lineCap = 'round'; c.strokeStyle = E.red; c.lineWidth = 3.4;
    c.beginPath(); c.ellipse(96, y0 + 1.5, 10.5, 6.8, .06, Math.PI * .3, Math.PI * 1.62); c.stroke();
    c.beginPath(); c.ellipse(105, y0 - 1.5, 10.5, 6.8, .06, Math.PI * 1.3, Math.PI * 2.62); c.stroke();
    c.restore();
    dot(E, 102, y0 + 15, 1.1, E.red); dot(E, 97, y0 + 21, .8, E.red);
  },
  mercy(E){
    const c = E.ctx;
    for (let i = 0; i < 110; i++) dot(E, 100 + E.g() * 44, 153 + Math.abs(E.g()) * 4, .3 + .45 * E.rand());
    const post = P('M97 36 L103 36 L104.5 140 L95.5 140 Z');
    fill(E, post, E.paper); hatch(E, post, [94, 36, 12, 104], { ang: 90, gap: 1.5, w: .6 }); edge(E, post, .9);
    const base = P('M76 151 L124 151 L117 139 L83 139 Z');
    fill(E, base, E.paper); hatch(E, base, [76, 139, 48, 12], { ang: 0, gap: 1.4, w: .6 }); edge(E, base, .9);
    const ang = .2, ax = 100 - Math.cos(ang) * 66, ay = 46 + Math.sin(ang) * 66, bx = 100 + Math.cos(ang) * 66, by = 46 - Math.sin(ang) * 66;
    c.strokeStyle = E.ink;
    line(E, [[ax, ay], [ax - 17, ay + 46]], .7); line(E, [[ax, ay], [ax + 17, ay + 46]], .7);
    line(E, [[bx, by], [bx - 17, by + 46]], .7); line(E, [[bx, by], [bx + 17, by + 46]], .7);
    rough(E, ax, ay, bx, by, 2.6, { wob: .08 });
    dot(E, ax, ay, 1.6); dot(E, bx, by, 1.6);
    c.beginPath(); c.arc(100, 46, 4.2, 0, TAU); c.fillStyle = E.paper; c.fill(); c.lineWidth = 1 * E.px; c.strokeStyle = E.ink; c.stroke();
    c.beginPath(); c.arc(100, 30, 4, 0, TAU); c.fillStyle = E.ink; c.fill();
    // the heavier pan: mercy
    const heart = P(`M${ax} ${ay + 45} C${ax - 2} ${ay + 41} ${ax - 10} ${ay + 39} ${ax - 10} ${ay + 33} C${ax - 10} ${ay + 28.5} ${ax - 4} ${ay + 27.5} ${ax} ${ay + 32} C${ax + 4} ${ay + 27.5} ${ax + 10} ${ay + 28.5} ${ax + 10} ${ay + 33} C${ax + 10} ${ay + 39} ${ax + 2} ${ay + 41} ${ax} ${ay + 45} Z`);
    fill(E, heart, E.red);
    const panL = P(`M${ax - 22} ${ay + 46} Q${ax} ${ay + 62} ${ax + 22} ${ay + 46} Z`);
    fill(E, panL, E.paper); hatch(E, panL, [ax - 22, ay + 46, 44, 10], { ang: 0, gap: 1.4, w: .6 }); edge(E, panL, .9);
    // the lighter pan: judgment
    const tab = P(`M${bx - 7} ${by + 45} L${bx - 7} ${by + 33} C${bx - 7} ${by + 28} ${bx + 7} ${by + 28} ${bx + 7} ${by + 33} L${bx + 7} ${by + 45} Z`);
    fill(E, tab, E.paper); hatch(E, tab, [bx - 7, by + 28, 14, 17], { ang: 70, gap: 1.6, w: .4 }); edge(E, tab, .9);
    [36, 39.5, 42.5].forEach(d => line(E, [[bx - 4, by + d], [bx + 4, by + d]], .5));
    const panR = P(`M${bx - 22} ${by + 46} Q${bx} ${by + 62} ${bx + 22} ${by + 46} Z`);
    fill(E, panR, E.paper); hatch(E, panR, [bx - 22, by + 46, 44, 10], { ang: 0, gap: 1.4, w: .6 }); edge(E, panR, .9);
  },
  bowl(E){
    const c = E.ctx;
    for (let i = 0; i < 90; i++) dot(E, 100 + E.g() * 58, 142 + Math.abs(E.g()) * 4, .3 + .45 * E.rand());
    const foot = P('M82 130 L118 130 L114 140 L86 140 Z');
    fill(E, foot, E.paper); hatch(E, foot, [82, 130, 36, 10], { ang: 0, gap: 1.3, w: .5 }); edge(E, foot, .9);
    const body = P('M46 92 C48 118 72 133 100 133 C128 133 152 118 154 92 Z');
    fill(E, body, E.paper);
    hatch(E, body, [46, 92, 108, 41], { ang: 0, gap: 1.6, w: .5 });
    hatch(E, body, [46, 92, 108, 41], { ang: 40, gap: 2.2, w: .45, clip: P('M110 88 L158 88 L158 136 L110 136 Z') });
    edge(E, body, 1);
    const rim = new Path2D(); rim.ellipse(100, 92, 54, 10.5, 0, 0, TAU); fill(E, rim, E.paper); edge(E, rim, 1);
    const inside = new Path2D(); inside.ellipse(100, 93, 47, 7.6, 0, 0, TAU);
    hatch(E, inside, [53, 85, 94, 16], { ang: 0, gap: 1.3, w: .4, clip: P('M40 93 L160 93 L160 104 L40 104 Z') });
    edge(E, inside, .6);
    line(E, [[134, 83.5], [136.5, 92], [134.5, 100], [138, 110]], .8);
    c.save(); c.translate(150, 136); c.rotate(-.22);
    const sb = new Path2D(); sb.ellipse(18, 0, 8, 4.6, 0, 0, TAU);
    fill(E, sb, E.paper); hatch(E, sb, [10, -5, 16, 10], { ang: 0, gap: 1.1, w: .4 }); edge(E, sb, .8);
    const sh = P('M-26 -1.3 L10 -1.5 L10 1.5 L-26 1.3 Z'); fill(E, sh, E.paper); edge(E, sh, .8);
    c.restore();
    [[60, 144], [72, 148], [128, 147]].forEach(([x, y]) => dot(E, x, y, 1.2));
  },
  tree(E){
    const c = E.ctx; c.strokeStyle = E.ink;
    const mound = P('M30 150 C60 136 140 134 172 150 Z');
    fill(E, mound, E.paper); hatch(E, mound, [30, 134, 142, 16], { ang: 0, gap: 1.6, w: .45 }); edge(E, mound, .8);
    for (let i = 0; i < 60; i++) dot(E, 100 + E.g() * 60, 152 + Math.abs(E.g()) * 3, .3 + .4 * E.rand());
    const branch = (x, y, ang, len, w, depth) => {
      const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
      const mx = (x + x2) / 2 + (E.rand() - .5) * len * .3, my = (y + y2) / 2 + (E.rand() - .5) * len * .3;
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(mx, my, x2, y2); c.lineWidth = w * E.px; c.strokeStyle = E.ink; c.stroke();
      if (depth <= 0) return;
      const kids = depth >= 3 ? 2 + (E.rand() < .5 ? 1 : 0) : 2;
      for (let k = 0; k < kids; k++) branch(x2, y2, ang + (k - (kids - 1) / 2) * (.5 + E.rand() * .35) + (E.rand() - .5) * .25, len * (.66 + E.rand() * .12), Math.max(.45, w * .62), depth - 1);
    };
    branch(100, 84, -Math.PI / 2 - .5, 26, 3.2, 4);
    branch(100, 84, -Math.PI / 2 + .45, 24, 3, 4);
    branch(101, 98, -Math.PI / 2 + 1.1, 18, 2.2, 3);
    branch(99, 106, -Math.PI / 2 - 1.15, 16, 2, 3);
    tube(E, bezSample([[100, 146], [98, 124], [104, 104], [100, 82]], 26), t => 10 - 5.5 * t, { gap: 2, w: .5, edge: .9 });
  },
  altar(E){
    const c = E.ctx;
    for (let i = 0; i < 100; i++) dot(E, 100 + E.g() * 60, 152 + Math.abs(E.g()) * 4, .3 + .45 * E.rand());
    for (let k = 0; k < 3; k++) {
      const pts = []; for (let i = 0; i <= 20; i++) { const t = i / 20; pts.push([102 + Math.sin(t * 5 + k * 2) * (4 + t * 12) + k * 3, 74 - t * 70]); }
      c.globalAlpha = .8 - k * .2; line(E, catmull(pts, 3), .6 - k * .1); c.globalAlpha = 1;
    }
    const stone = (x, y, rx, ry) => {
      const s = new Path2D(); s.ellipse(x, y, rx, ry, (E.rand() - .5) * .2, 0, TAU);
      fill(E, s, E.paper);
      hatch(E, s, [x - rx, y - ry, 2 * rx, 2 * ry], { ang: 60, gap: 1.6, w: .45, clip: P(`M${x - rx} ${y} L${x + rx + 1} ${y - ry * .4} L${x + rx + 1} ${y + ry + 1} L${x - rx} ${y + ry + 1} Z`) });
      edge(E, s, .9);
    };
    [[58, 142], [79, 143], [100, 142], [121, 143], [142, 142]].forEach(([x, y]) => stone(x, y, 11, 7.5));
    [[68, 128], [89, 129], [110, 128], [131, 129]].forEach(([x, y]) => stone(x, y, 11, 7.5));
    [[78, 115], [100, 114], [122, 115]].forEach(([x, y]) => stone(x, y, 11, 7));
    const log = (x0, y0, x1, y1) => {
      const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0);
      c.save(); c.translate(x0, y0); c.rotate(a);
      const l = P(`M0 -2.6 L${L} -2.6 L${L} 2.6 L0 2.6 Z`);
      fill(E, l, E.paper); hatch(E, l, [0, -3, L, 6], { ang: 0, gap: 1.1, w: .4 }); edge(E, l, .8);
      const end = new Path2D(); end.ellipse(L, 0, 1.6, 2.6, 0, 0, TAU); fill(E, end, E.paper); edge(E, end, .7);
      c.restore();
    };
    log(64, 106, 136, 102); log(68, 100, 134, 106); log(76, 96, 126, 94);
    fill(E, P('M101 64 C105 75 114 80 112 89 C110 96 92 96 90 89 C88 82 97 77 101 64 Z'), E.red);
    c.globalAlpha = .85; fill(E, P('M101 78 C103 83 106 86 105 90 C104 93 98 93 97 90 C96 86 100 84 101 78 Z'), E.paper); c.globalAlpha = 1;
  },
  cord(E){
    const c = E.ctx;
    const W = P('M28 22 L168 14 L192 24 L194 138 L16 138 L12 60 Z');
    fill(E, W, E.paper);
    c.save(); c.clip(W); c.strokeStyle = E.ink;
    for (let y = 28, r = 0; y < 140; y += 12, r++) {
      rough(E, 0, y, 200, y + (E.rand() - .5) * 1.5, .7, { wob: .5, brk: .04 });
      for (let x = (r % 2 ? 0 : 13) + E.rand() * 4; x < 200; x += 24 + E.rand() * 6) {
        line(E, [[x, y], [x + (E.rand() - .5), y + 12]], .6);
        if (E.rand() < .25) hatch(E, polyPath([[x, y], [x + 24, y], [x + 24, y + 12], [x, y + 12]]), [x, y, 24, 12], { ang: 70, gap: 1.6, w: .4 });
      }
    }
    c.restore();
    edge(E, W, 1);
    const winPts = [[80, 48], [120, 48], [120, 84], [80, 84]], win = polyPath(winPts);
    fill(E, win, E.paper);
    hatch(E, win, bboxOf(winPts), { ang: 90, gap: 1.05, w: .55 }); hatch(E, win, bboxOf(winPts), { ang: 20, gap: 1.6, w: .45 });
    edge(E, win, 1.1);
    const lin = [[72, 38], [128, 38], [128, 48], [72, 48]]; shadeFill(E, polyPath(lin), lin, { ang: 0, gap: 1.2, w: .45 });
    const sill = [[74, 84], [126, 84], [129, 91], [71, 91]]; shadeFill(E, polyPath(sill), sill, { ang: 0, gap: 1.3, w: .45 });
    const cordP = [[100, 84], [104, 102], [96, 120], [101, 146]];
    c.save(); c.lineCap = 'round'; c.strokeStyle = E.red;
    c.beginPath(); c.moveTo(cordP[0][0], cordP[0][1]); c.bezierCurveTo(cordP[1][0], cordP[1][1], cordP[2][0], cordP[2][1], cordP[3][0], cordP[3][1]); c.lineWidth = 3.4; c.stroke();
    c.beginPath(); c.ellipse(100, 87, 5.2, 3.4, 0, 0, TAU); c.lineWidth = 2.4; c.stroke();
    c.restore();
    for (let t = .12; t < 1; t += .09) { const q = bez(cordP, t); line(E, [[q[0] - 1.6, q[1] - 1], [q[0] + 1.6, q[1] + 1]], .6, E.paper); }
  }
});

/* =====================================================================
   PORTADA DEL CAPÍTULO 2 — la muralla de Jericó, la ventana de Rahab
   con el cordón rojo y los mensajeros que se van por otro camino
   ===================================================================== */
function palm(E, x, y, h, lean){
  const top = [x + lean, y - h];
  tube(E, bezSample([[x, y], [x + lean * .2, y - h * .4], [x + lean * .7, y - h * .8], top], 30), t => 6 - 2.8 * t, { gap: 2.3, w: .5, edge: .8 });
  [[-1, .25], [-.85, -.2], [-.45, -.6], [.05, -.75], [.5, -.55], [.9, -.15], [1, .3]].forEach(([dx, dy]) => {
    const L = 34 + E.rand() * 8;
    const ex = top[0] + dx * L, ey = top[1] + dy * L * .6 + L * .38;
    const mx = top[0] + dx * L * .55, my = top[1] + dy * L * .7 - 6;
    const pts = bezSample([top, [mx, my], [mx + dx * 8, my + 2], [ex, ey]], 16);
    line(E, pts, 1);
    for (let i = 2; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], tx = b[0] - a[0], ty = b[1] - a[1], tl = Math.hypot(tx, ty) || 1;
      const nx = -ty / tl, ny = tx / tl, len = 7 * (1 - i / pts.length) + 2;
      line(E, [b, [b[0] + nx * len + tx / tl * 2.5, b[1] + ny * len + ty / tl * 2.5]], .5);
      line(E, [b, [b[0] - nx * len + tx / tl * 2.5, b[1] - ny * len + ty / tl * 2.5]], .5);
    }
  });
}
function wallOfJericho(E){
  const c = E.ctx, R = E.rand;
  const xL = 214, xR = 432, tL = 200, tR = 92, bL = 322, bR = 398, ROWS = 15;
  const yTop = x => tL + (x - xL) * (tR - tL) / (xR - xL);
  const yBot = x => bL + (x - xL) * (bR - bL) / (xR - xL);
  const yAt = (x, f) => yTop(x) + f * (yBot(x) - yTop(x));
  const facePts = [[xL, tL], [xR, tR], [xR, bR], [xL, bL]], face = polyPath(facePts);
  fill(E, face, E.paper);
  c.save(); c.clip(face);
  for (let r = 1; r < ROWS; r++) {
    const pts = []; for (let i = 0; i <= 30; i++) { const x = xL + (xR - xL) * i / 30; pts.push([x, yAt(x, r / ROWS)]); }
    sketch(E, pts, .7, { wob: .5, brk: .02 });
  }
  for (let r = 0; r < ROWS; r++) {
    let x = xL + (r % 2 ? 0 : 5) + R() * 3;
    for (;;) {
      const h = (yBot(x) - yTop(x)) / ROWS, w = h * (1.9 + R() * .7), x2 = x + w;
      if (x2 >= xR) break;
      line(E, [[x2, yAt(x2, r / ROWS)], [x2, yAt(x2, (r + 1) / ROWS)]], .6);
      if (R() < .2) {
        const pts = [[x, yAt(x, r / ROWS)], [x2, yAt(x2, r / ROWS)], [x2, yAt(x2, (r + 1) / ROWS)], [x, yAt(x, (r + 1) / ROWS)]];
        hatch(E, polyPath(pts), bboxOf(pts), { ang: 72, gap: 1.7, w: .45 });
      }
      x = x2;
    }
  }
  const foot = [[xL, yAt(xL, .88)], [xR, yAt(xR, .88)], [xR, bR], [xL, bL]];
  hatch(E, polyPath(foot), bboxOf(foot), { ang: 76, gap: 1.5, w: .5 });
  c.restore();
  edge(E, face, 1.1);
  // battlements
  for (let x = xL + 18; x < xR;) {
    const h = (yBot(x) - yTop(x)) / ROWS, mw = h * 1.7, mh = h * 1.5;
    const pts = [[x, yTop(x) + .5], [x + mw, yTop(x + mw) + .5], [x + mw, yTop(x + mw) - mh], [x, yTop(x) - mh]];
    shadeFill(E, polyPath(pts), pts, { ang: 76, gap: 1.6, w: .45, edge: .8 });
    x += mw + h * 1.25;
  }
  // Rahab's window and the scarlet cord (Joshua 2:15, 18)
  const wx0 = 330, wx1 = 354, f0 = .2, f1 = .32;
  const wp = [[wx0, yAt(wx0, f0)], [wx1, yAt(wx1, f0)], [wx1, yAt(wx1, f1)], [wx0, yAt(wx0, f1)]];
  const win = polyPath(wp);
  fill(E, win, E.paper);
  hatch(E, win, bboxOf(wp), { ang: 90, gap: 1.05, w: .55 }); hatch(E, win, bboxOf(wp), { ang: 30, gap: 1.6, w: .45 });
  edge(E, win, 1.2);
  const lin = [[wx0 - 4, yAt(wx0 - 4, f0) - 6], [wx1 + 4, yAt(wx1 + 4, f0) - 6], [wx1 + 4, yAt(wx1 + 4, f0)], [wx0 - 4, yAt(wx0 - 4, f0)]];
  shadeFill(E, polyPath(lin), lin, { ang: 0, gap: 1.2, w: .45 });
  const sill = [[wx0 - 4, yAt(wx0 - 4, f1)], [wx1 + 4, yAt(wx1 + 4, f1)], [wx1 + 5, yAt(wx1 + 5, f1) + 4], [wx0 - 3, yAt(wx0 - 3, f1) + 4]];
  shadeFill(E, polyPath(sill), sill, { ang: 0, gap: 1.3, w: .45 });
  const cx0 = (wx0 + wx1) / 2 + 2, cy0 = yAt(cx0, f1) + 2, cy1 = yAt(cx0, .97);
  c.save(); c.lineCap = 'round'; c.strokeStyle = E.red;
  c.beginPath(); c.moveTo(cx0, cy0); c.bezierCurveTo(cx0 + 5, cy0 + (cy1 - cy0) * .35, cx0 - 4, cy0 + (cy1 - cy0) * .7, cx0 + 1.5, cy1); c.lineWidth = 2.6; c.stroke();
  c.beginPath(); c.ellipse(cx0, cy0 + 1, 3.8, 2.4, 0, 0, TAU); c.lineWidth = 1.8; c.stroke();
  c.restore();
  // the tower at the far end of the wall
  const tw = [[196, 180], [230, 178], [230, 334], [196, 332]], tower = polyPath(tw);
  fill(E, tower, E.paper);
  c.save(); c.clip(tower);
  for (let y = 186, r = 0; y < 334; y += 8, r++) {
    rough(E, 194, y, 232, y - .5, .6, { wob: .3 });
    for (let x = 196 + (r % 2 ? 0 : 6); x < 230; x += 12) line(E, [[x, y], [x, y + 8]], .5);
  }
  hatch(E, polyPath([[220, 176], [232, 176], [232, 336], [220, 336]]), [218, 176, 16, 160], { ang: 80, gap: 1.4, w: .5 });
  c.restore();
  edge(E, tower, 1.1);
  [[196, 206], [209, 217], [222, 230]].forEach(([a, b]) => { const m = [[a, 180], [b, 179.6], [b, 168], [a, 168.4]]; shadeFill(E, polyPath(m), m, { ang: 80, gap: 1.6, w: .45, edge: .8 }); });
  fill(E, P('M211 204 L215 204 L215 222 L211 222 Z'), E.ink);
  for (let i = 0; i < 180; i++) { const x = 196 + R() * 236; dot(E, x, (x < xL ? 334 : yBot(x)) + 2 + Math.abs(E.g()) * 8, .3 + .45 * R()); }
}
COVERS[2] = function(E){
  // the hill country where the messengers hid (Joshua 2:16)
  band(E, [[252, 236], [196, 218], [130, 222], [30, 250]], { w: 30, n: 14, lw: .75, heavy: 1, dust: 90, dustSide: -1, spread: 9 });
  band(E, [[236, 270], [176, 252], [110, 260], [10, 286]], { w: 26, n: 12, lw: .75, heavy: 1, dust: 70, dustSide: -1, spread: 8 });
  band(E, [[230, 338], [160, 324], [96, 332], [0, 352]], { w: 30, n: 13, lw: .8, dust: 90, dustSide: 1, spread: 8 });
  // the road "by another way", with the two messengers on it
  const S = road(E, [[262, 402], [228, 386], [196, 368], [170, 348], [150, 326], [138, 304], [132, 284]]);
  const at = f => S[Math.round(f * (S.length - 1))];
  let q = at(.46); walker(E, q[0] - 1, q[1] + 1.4, 1.15, true);
  q = at(.55); walker(E, q[0] + 1, q[1] + 1.2, 1.05, false);
  // Jericho, the city of palms
  palm(E, 86, 388, 96, 10);
  wallOfJericho(E);
  [[80, 96, 6, -.2, .3], [116, 72, 4.6, .1, 0], [62, 150, 4.6, -.1, .1], [106, 138, 6, .05, .5], [156, 104, 4, .25, .2], [188, 74, 3.6, .2, -.1], [146, 54, 3.2, .2, .1]].forEach(g => bird(E, g[0], g[1], g[2], g[3], g[4]));
};
