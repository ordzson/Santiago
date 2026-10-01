/* Capítulo 3: la nave, las viñetas del capítulo y su portada. */
/* the merchant ship from v. 4 — bow to the left, wind from behind, red steering oar */
function ship(E, x, y, sc, rot){
  const c = E.ctx; c.save(); c.translate(x, y); c.rotate(rot); c.scale(sc, sc);
  const hull = P('M-52 -8 C-49 3 -32 13 -4 14 C22 15 38 8 44 -7 Z');
  const sail = P('M-27 -69 C-9 -72 12 -72 31 -69 C27 -52 27 -34 31 -17 C12 -20 -10 -20 -29 -16 C-38 -32 -38 -53 -27 -69 Z');
  const fore = P('M-64 -41 C-59 -43 -53 -43 -49 -41 C-50 -35 -50 -29 -48 -23 C-53 -24 -58 -24 -63 -23 C-66 -29 -66 -35 -64 -41 Z');
  fill(E, hull, E.paper); fill(E, sail, E.paper); fill(E, fore, E.paper);
  // rigging behind the sails
  c.strokeStyle = E.ink;
  line(E, [[2, -82], [-50, -10]], .45); line(E, [[2, -82], [43, -9]], .45);
  // mast and yard
  line(E, [[2, -7], [2, -83]], 1.7);
  line(E, [[-31, -70], [35, -71]], 1.3);
  // mainsail: vertical hatch plus a shadowed belly on the leading edge
  hatch(E, sail, [-40, -74, 74, 60], { ang: 90, gap: 1.9, w: .55, brk: .03 });
  hatch(E, sail, [-40, -74, 74, 60], { ang: 62, gap: 2.2, w: .5, clip: P('M-42 -76 L-12 -76 L-12 -12 L-42 -12 Z') });
  edge(E, sail, .9);
  line(E, [[-28, -43], [30, -43]], .4);
  // foremast and artemon sail
  line(E, [[-42, -8], [-66, -46]], 1.1);
  hatch(E, fore, [-67, -44, 20, 22], { ang: 90, gap: 1.7, w: .5 });
  edge(E, fore, .8);
  // pennant
  fill(E, P('M2 -83 L-16 -88 L-11 -84 L-17 -79 Z'), E.ink);
  // hull planking and shade
  hatch(E, hull, [-53, -9, 98, 25], { ang: 0, gap: 1.45, w: .7, wob: .15, brk: .03 });
  hatch(E, hull, [-53, -9, 98, 25], { ang: -38, gap: 2.1, w: .55, clip: P('M-60 3 L60 3 L60 20 L-60 20 Z') });
  edge(E, hull, 1.1);
  line(E, [[-54, -9.5], [45, -8.5]], 1.2);
  // stern post curling up
  edge(E, P('M43 -7 C49 -13 51 -21 48 -28 C46 -32 41 -31 42 -27'), 2.1);
  // the small rudder: a steering oar at the stern
  line(E, [[33, -11], [47, 16]], 1.7, E.red);
  fill(E, P('M44 10 C47 9 50 13 50 19 C50 22 47 23 45.5 21 C44 18 43 13 44 10 Z'), E.red);
  c.restore();
}


/* =====================================================================
   VIÑETAS DEL CAPÍTULO 3
   ===================================================================== */
Object.assign(VIG, {
  scroll(E){
    const c = E.ctx;
    for (let i = 0; i < 150; i++) dot(E, 56 + E.rand() * 104, 144 + Math.abs(E.g()) * 9, .3 + .5 * E.rand());
    c.save(); c.translate(100, 86); c.rotate(-.1); c.translate(-100, -86);
    const sheet = P('M54 42 L146 42 L146 128 L54 128 Z');
    fill(E, sheet, E.paper);
    c.strokeStyle = E.ink;
    for (let y = 56; y <= 114; y += 7.4) rough(E, 63, y, 138 - (y > 100 ? 14 + E.rand() * 34 : E.rand() * 16), y, .75, { wob: 1.2, brk: .16, step: 3 });
    hatch(E, sheet, [54, 42, 92, 86], { ang: 90, gap: 2, w: .5, brk: .1, clip: P('M137 40 L150 40 L150 130 L137 130 Z') });
    edge(E, sheet, .9);
    const roll = P('M46 30 L154 30 C159 30 159 44 154 44 L46 44 C41 44 41 30 46 30 Z');
    fill(E, roll, E.paper);
    hatch(E, roll, [40, 30, 122, 14], { ang: 0, gap: 1.5, w: .6, clip: P('M30 37.5 L170 37.5 L170 46 L30 46 Z') });
    edge(E, roll, 1);
    const roll2 = P('M50 124 L150 124 C155 124 155 137 150 137 L50 137 C45 137 45 124 50 124 Z');
    fill(E, roll2, E.paper);
    hatch(E, roll2, [44, 124, 112, 13], { ang: 0, gap: 1.5, w: .6, clip: P('M30 130.5 L170 130.5 L170 139 L30 139 Z') });
    edge(E, roll2, 1);
    c.beginPath(); c.arc(131, 112, 7.6, 0, TAU); c.fillStyle = E.red; c.fill();
    c.beginPath(); c.arc(131, 112, 4.6, 0, TAU); c.lineWidth = .9 * E.px; c.strokeStyle = E.paper; c.stroke();
    c.restore();
  },
  scale(E){
    for (let i = 0; i < 130; i++) dot(E, 100 + E.g() * 46, 153 + Math.abs(E.g()) * 5, .3 + .5 * E.rand());
    const post = P('M97 36 L103 36 L104.5 140 L95.5 140 Z');
    fill(E, post, E.paper); hatch(E, post, [94, 36, 12, 104], { ang: 90, gap: 1.5, w: .6 }); edge(E, post, .9);
    const base = P('M76 151 L124 151 L117 139 L83 139 Z');
    fill(E, base, E.paper); hatch(E, base, [76, 139, 48, 12], { ang: 0, gap: 1.4, w: .6 });
    hatch(E, base, [76, 139, 48, 12], { ang: 60, gap: 2.1, w: .5, clip: P('M101 130 L130 130 L130 156 L101 156 Z') }); edge(E, base, .9);
    const ax = 34, ay = 42, bx = 166, by = 55;
    E.ctx.strokeStyle = E.ink;
    line(E, [[ax, ay], [18, 88]], .7); line(E, [[ax, ay], [50, 88]], .7);
    line(E, [[bx, by], [146, 104]], .7); line(E, [[bx, by], [186, 104]], .7);
    rough(E, ax, ay, bx, by, 2.6, { wob: .08 });
    dot(E, ax, ay, 1.6); dot(E, bx, by, 1.6);
    const c = E.ctx;
    c.beginPath(); c.arc(100, 48.5, 4.2, 0, TAU); c.fillStyle = E.paper; c.fill(); c.lineWidth = 1 * E.px; c.strokeStyle = E.ink; c.stroke();
    c.beginPath(); c.arc(100, 31, 4, 0, TAU); c.fillStyle = E.ink; c.fill();
    const panL = P('M13 88 Q34 104 55 88 Z');
    fill(E, panL, E.paper); hatch(E, panL, [13, 88, 42, 10], { ang: 0, gap: 1.4, w: .6 }); edge(E, panL, .9);
    const wgt = P('M158 104 L174 104 L171.5 95 L160.5 95 Z');
    fill(E, wgt, E.red); dot(E, 166, 93.3, 1.8, E.red);
    const panR = P('M141 104 Q166 121 191 104 Z');
    fill(E, panR, E.paper); hatch(E, panR, [141, 104, 50, 11], { ang: 0, gap: 1.4, w: .6 }); edge(E, panR, .9);
  },
  ship(E){
    band(E, [[214, 110], [150, 122], [86, 120], [-14, 134]], { w: 20, n: 10, lw: .7, fray0: .06, fray1: .1, dust: 70, dustSide: 1, spread: 6 });
    ship(E, 108, 108, 1, -.05);
    band(E, [[216, 128], [150, 142], [80, 136], [-14, 152]], { w: 24, n: 11, lw: .75, fray0: .05, fray1: .08 });
    bird(E, 30, 42, 6, -.2, .2); bird(E, 46, 26, 4.5, .1, -.05); bird(E, 172, 30, 5, .25, .3);
  },
  forest(E){
    const trees = [[156, 141, 70, 34], [46, 143, 64, 30], [128, 142, 98, 40], [74, 143, 86, 36], [101, 144, 116, 44]];
    for (const [x, b, h, w] of trees) {
      const p = new Path2D();
      for (let k = 0; k < 3; k++) { const top = b - h + k * h * .27, bot = top + h * .45, hw = w * (.32 + .2 * k); p.moveTo(x, top); p.lineTo(x + hw, bot); p.lineTo(x - hw, bot); p.closePath(); }
      fill(E, p, E.paper);
      fill(E, P(`M${x - 2.2} ${b - h * .05} L${x + 2.2} ${b - h * .05} L${x + 2.4} ${b} L${x - 2.4} ${b} Z`), E.ink);
      hatch(E, p, [x - w, b - h, 2 * w, h], { ang: 72, gap: 1.7, w: .6, brk: .05 });
      hatch(E, p, [x - w, b - h, 2 * w, h], { ang: -18, gap: 2.1, w: .5, clip: P(`M${x} ${b - h - 2} L${x + w} ${b - h - 2} L${x + w} ${b + 2} L${x} ${b + 2} Z`) });
      edge(E, p, .7);
    }
    E.ctx.strokeStyle = E.ink;
    for (let y = 145; y <= 153; y += 2.2) rough(E, 12 + E.rand() * 10, y, 188 - E.rand() * 10, y, .6, { wob: .5, brk: .08 });
    for (let i = 0; i < 70; i++) { const t = E.rand(); dot(E, 20 + t * 36 + E.g() * 6, 124 - t * 50 + E.g() * 6, .3 + .4 * E.rand()); }
    fill(E, P('M17 127 C21.5 132.5 25.5 136.5 24.5 141.5 C24 144.5 21.5 146 19 146 C16 146 13.6 144.2 13.8 141.2 C14 137.2 16.6 133.6 17 127 Z'), E.red);
    dot(E, 23, 120, 1.1, E.red); dot(E, 15, 115, .8, E.red); dot(E, 26, 110, .7, E.red);
  },
  serpent(E){
    E.ctx.strokeStyle = E.ink;
    for (let y = 148; y <= 156; y += 2.2) rough(E, 40 + E.rand() * 12, y, 196 - E.rand() * 12, y, .55, { wob: .5, brk: .1 });
    const S = catmull([[188, 141], [162, 148], [130, 149], [102, 143], [87, 129], [92, 112], [112, 101], [127, 87], [123, 69], [107, 57], [90, 54]], 16);
    const wf = t => t < .22 ? 1.2 + (t / .22) * 7.6 : t < .9 ? 8.8 - (t - .22) * 3.4 : 6.5;
    tube(E, S, wf, { gap: 2.1, w: .55, edge: .85 });
    const end = S[S.length - 1], prev = S[S.length - 5];
    const ang = Math.atan2(end[1] - prev[1], end[0] - prev[0]);
    const c = E.ctx; c.save(); c.translate(end[0], end[1]); c.rotate(ang);
    const headP = P('M-3 -4.6 C3 -6.6 10 -5 13.5 -1.2 C14.5 -.2 14.5 .6 13.5 1.6 C10 5 3 6.2 -3 4.4 Z');
    fill(E, headP, E.paper); hatch(E, headP, [-4, -7, 19, 14], { ang: 90, gap: 1.35, w: .5 }); edge(E, headP, 1);
    dot(E, 6.5, -2.2, 1.2, E.ink); dot(E, 6.9, -2.5, .4, E.paper);
    line(E, [[14, .2], [21, .2]], 1, E.red); line(E, [[21, .2], [25, -2.6]], .9, E.red); line(E, [[21, .2], [25, 3]], .9, E.red);
    c.restore();
  },
  figure(E){
    E.ctx.strokeStyle = E.ink;
    for (let i = 0; i < 19; i++) {
      const a = Math.PI / 2 + (i - 9) * .07 + (E.rand() - .5) * .02, r0 = 36 + E.rand() * 10, r1 = 92 + E.rand() * 24;
      rough(E, 100 + Math.cos(a) * r0, -40 + Math.sin(a) * r0, 100 + Math.cos(a) * r1, -40 + Math.sin(a) * r1, .5, { wob: .15, brk: .06 });
    }
    for (let i = 0; i < 90; i++) dot(E, 100 + E.g() * 40, Math.abs(E.g()) * 16, .3 + .4 * E.rand());
    for (let y = 143; y <= 151; y += 2.2) rough(E, 54 + E.rand() * 8, y, 148 - E.rand() * 8, y, .6, { wob: .4, brk: .1 });
    for (let i = 0; i < 80; i++) dot(E, 112 + Math.abs(E.g()) * 34, 142 + E.g() * 3, .3 + .4 * E.rand());
    const body = P('M94 87 C91 101 87 122 83 142 C92 144.5 108 144.5 117 142 C113 122 109 101 106 87 C103 85 97 85 94 87 Z');
    const armL = P('M95 90 C90 85 85 77 80.5 66.5 C79.8 64.6 81.7 63.6 82.8 65.3 C87.5 72.6 92.5 79.6 98.5 85.5 Z');
    const armR = P('M105 90 C110 85 115 77 119.5 66.5 C120.2 64.6 118.3 63.6 117.2 65.3 C112.5 72.6 107.5 79.6 101.5 85.5 Z');
    fill(E, body, E.ink); fill(E, armL, E.ink); fill(E, armR, E.ink);
    const c = E.ctx; c.beginPath(); c.arc(100, 77.5, 6.4, 0, TAU); c.fillStyle = E.ink; c.fill();
    c.globalAlpha = .75; line(E, [[98, 94], [94.5, 139]], .55, E.paper); line(E, [[102.5, 94], [106, 139]], .55, E.paper); line(E, [[100, 100], [100, 140]], .45, E.paper); c.globalAlpha = 1;
  },
  spring(E){
    const rock = P('M12 44 L44 28 L78 33 L104 51 L113 76 L101 98 L70 107 L37 101 L16 82 Z');
    fill(E, rock, E.paper);
    hatch(E, rock, [12, 28, 101, 79], { ang: 52, gap: 1.8, w: .62, brk: .06 });
    hatch(E, rock, [12, 28, 101, 79], { ang: -32, gap: 2.2, w: .52, clip: P('M8 72 L120 64 L120 112 L8 112 Z') });
    line(E, [[44, 28], [52, 60], [104, 51]], .8); line(E, [[52, 60], [70, 107]], .8); line(E, [[52, 60], [16, 82]], .8);
    edge(E, rock, 1.1);
    fill(E, P('M104 65 C107.5 67.5 108.5 72 106.5 76.5 C104.3 74 103.4 69.6 104 65 Z'), E.ink);
    const c = E.ctx; c.strokeStyle = E.ink;
    for (let i = 0; i < 6; i++) {
      c.beginPath(); c.moveTo(107, 69 + i * .9);
      c.quadraticCurveTo(136 + i * 2.6, 64 + i * 1.2, 146 + i * 3.4, 134);
      c.lineWidth = (.55 + E.rand() * .3) * E.px; c.stroke();
    }
    const pool = new Path2D(); pool.ellipse(152, 141, 42, 8.5, 0, 0, TAU);
    fill(E, pool, E.paper);
    hatch(E, pool, [108, 132, 88, 18], { ang: 0, gap: 1.55, w: .55, wob: .9, brk: .12 });
    edge(E, pool, .8);
    for (let i = 0; i < 70; i++) dot(E, 152 + E.g() * 18, 131 - Math.abs(E.g()) * 12, .3 + .45 * E.rand());
  },
  lamp(E){
    E.ctx.strokeStyle = E.ink;
    for (let y = 133; y <= 141; y += 2.2) rough(E, 40 + E.rand() * 8, y, 186 - E.rand() * 8, y, .6, { wob: .4, brk: .1 });
    const body = P('M52 106 C52 92 76 86 106 86 C136 86 156 92 156 106 C156 118 136 124 106 124 C76 124 52 118 52 106 Z');
    const nozzle = P('M60 97 C48 95 36 93 28 94 C21 95 19 103.5 26 106.5 C34 109.5 46 109.5 62 110.5 Z');
    const foot = P('M90 122 L122 122 L118 131 L94 131 Z');
    fill(E, foot, E.paper); hatch(E, foot, [90, 122, 32, 9], { ang: 0, gap: 1.4, w: .55 }); edge(E, foot, .8);
    fill(E, nozzle, E.paper); hatch(E, nozzle, [19, 93, 43, 18], { ang: 0, gap: 1.6, w: .6 });
    hatch(E, nozzle, [19, 93, 43, 18], { ang: 40, gap: 2.2, w: .5, clip: P('M10 103 L70 103 L70 114 L10 114 Z') }); edge(E, nozzle, .9);
    fill(E, body, E.paper); hatch(E, body, [52, 86, 104, 38], { ang: 0, gap: 1.7, w: .62 });
    hatch(E, body, [52, 86, 104, 38], { ang: 35, gap: 2.2, w: .5, clip: P('M40 107 L170 107 L170 130 L40 130 Z') });
    hatch(E, body, [52, 86, 104, 38], { ang: -35, gap: 2.6, w: .45, clip: P('M120 100 L170 100 L170 130 L120 130 Z') });
    edge(E, body, 1);
    const hole = new Path2D(); hole.ellipse(108, 93, 13, 3.6, 0, 0, TAU); fill(E, hole, E.ink);
    const c = E.ctx; c.beginPath(); c.ellipse(164, 100, 7.5, 8.5, 0, 0, TAU); c.lineWidth = 2.2 * E.px; c.strokeStyle = E.ink; c.stroke();
    fill(E, P('M25 69 C29 76 33 82 32 88.5 C31.5 92 28.8 94 26 94 C22.8 94 20.4 92 20.4 88.6 C20.4 83 24 78 25 69 Z'), E.red);
    c.globalAlpha = .8; fill(E, P('M26 82 C27.4 85 28 87.5 27.4 89.5 C27 90.6 26.2 91 25.6 91 C24.6 91 24 90.2 24 89.2 C24 87 25.4 84.8 26 82 Z'), E.paper); c.globalAlpha = 1;
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI * .95 + i * (Math.PI * .9 / 8);
      line(E, [[26 + Math.cos(a) * 15, 83 + Math.sin(a) * 15], [26 + Math.cos(a) * 21, 83 + Math.sin(a) * 21]], .55);
    }
  },
  thorns(E){
    const stems = [
      [[6, 120], [52, 62], [104, 148], [194, 70]],
      [[12, 56], [60, 98], [98, 28], [192, 126]],
      [[50, 156], [62, 104], [120, 104], [150, 24]],
      [[4, 96], [48, 112], [86, 54], [182, 150]]
    ];
    for (let i = 0; i < 160; i++) dot(E, 100 + E.g() * 70, 90 + E.g() * 50, .3 + .4 * E.rand());
    stems.forEach((p, si) => {
      const S = bezSample(p, 70);
      tube(E, S, t => 1.2 + 2.6 * Math.sin(Math.PI * Math.min(1, t * 1.1)), { gap: 1.6, w: .5, edge: .7 });
      const L = bezLen(p); let side = si % 2 ? 1 : -1;
      for (let d = 9; d < L - 6; d += 10 + E.rand() * 4) {
        const t = d / L, b = bez(p, t), dv = bezD(p, t), dl = Math.hypot(dv[0], dv[1]) || 1;
        const tx = dv[0] / dl, ty = dv[1] / dl, nx = -ty * side, ny = tx * side;
        const c = E.ctx; c.beginPath();
        c.moveTo(b[0] + nx * 1.4 - tx * 1.8, b[1] + ny * 1.4 - ty * 1.8);
        c.lineTo(b[0] + nx * 6.5 + tx * 2.4, b[1] + ny * 6.5 + ty * 2.4);
        c.lineTo(b[0] + nx * 1.4 + tx * 1.8, b[1] + ny * 1.4 + ty * 1.8);
        c.closePath(); c.fillStyle = E.ink; c.fill();
        side = -side;
      }
    });
  },
  sprout(E){
    E.ctx.strokeStyle = E.ink;
    for (let i = 0; i < 15; i++) {
      const a = Math.PI / 2 + (i - 7) * .075 + (E.rand() - .5) * .02, r0 = 40 + E.rand() * 10, r1 = 96 + E.rand() * 20;
      rough(E, 100 + Math.cos(a) * r0, -46 + Math.sin(a) * r0, 100 + Math.cos(a) * r1, -46 + Math.sin(a) * r1, .5, { wob: .15, brk: .06 });
    }
    const soil = P('M4 117 C46 110 154 110 196 117 L196 160 L4 160 Z');
    fill(E, soil, E.paper);
    hatch(E, soil, [4, 110, 192, 50], { ang: 0, gap: 1.75, w: .6, wob: .6, brk: .1 });
    hatch(E, soil, [4, 110, 192, 50], { ang: 24, gap: 2.4, w: .5, clip: P('M0 134 L200 134 L200 160 L0 160 Z') });
    edge(E, P('M4 117 C46 110 154 110 196 117'), 1);
    for (let i = 0; i < 60; i++) dot(E, 100 + E.g() * 80, 111 - Math.abs(E.g()) * 4, .3 + .4 * E.rand());
    const hole = new Path2D(); hole.ellipse(100, 137, 9, 6.5, 0, 0, TAU); fill(E, hole, E.paper);
    const seed = new Path2D(); seed.ellipse(100, 137, 6, 4.2, -.3, 0, TAU); fill(E, seed, E.red);
    line(E, [[98, 140], [94, 148], [92, 153]], .5); line(E, [[101, 141], [104, 149]], .5); line(E, [[99.5, 141], [99, 152]], .45);
    edge(E, P('M100 133 C99 118 101 100 100 82'), 1.9);
    const lf = P('M100 99 C93 89 84 83 70 83 C76 94 88 100 100 99 Z'), rf = P('M100 90 C108 80 118 73 132 73 C126 85 114 91 100 90 Z');
    fill(E, lf, E.paper); hatch(E, lf, [70, 82, 30, 18], { ang: -25, gap: 1.45, w: .5 }); edge(E, lf, .85); line(E, [[100, 99], [73, 84]], .45);
    fill(E, rf, E.paper); hatch(E, rf, [100, 72, 32, 19], { ang: 25, gap: 1.45, w: .5 }); edge(E, rf, .85); line(E, [[100, 90], [129, 74]], .45);
  }
});

/* PORTADA DEL CAPÍTULO 3 — la nave del v. 4 entre el viento y las olas */
COVERS[3] = function(E){
  // the top band (brand line and version credit) stays clear; the art lives below and to the right
  // wind: three gusts sweeping in from the right edge
  band(E, [[452, 70], [400, 108], [330, 150], [206, 196]], { w: 34, n: 16, lw: .8, dust: 200, dustSide: -1, spread: 14, brk: .015, heavy: 1 });
  band(E, [[456, 132], [404, 178], [334, 222], [222, 262]], { w: 46, n: 21, lw: .9, dust: 260, dustSide: -1, spread: 17, brk: .015, heavy: 1 });
  band(E, [[452, 206], [414, 244], [362, 276], [276, 304]], { w: 28, n: 13, lw: .8, dust: 150, dustSide: -1, spread: 13, brk: .02, heavy: 1 });
  // swells under the ship, crossing the wind
  const s1 = [[456, 304], [392, 330], [316, 352], [190, 380]];
  band(E, [[462, 372], [384, 396], [300, 414], [176, 434]], { w: 52, n: 24, lw: .95, dust: 170, dustSide: 1, spread: 10, heavy: -1 });
  const t = .66, b = bez(s1, t), d = bezD(s1, t), dl = Math.hypot(d[0], d[1]);
  const f = Math.pow(Math.sin(Math.PI * t), .55);
  const top = [b[0] - d[1] / dl * 22 * f, b[1] + d[0] / dl * 22 * f];
  ship(E, top[0] - 4, top[1] + 5, 1.18, Math.atan2(d[1], d[0]) - Math.PI + .02);
  band(E, s1, { w: 44, n: 22, lw: .95, dust: 230, dustSide: 1, spread: 12, heavy: -1 });
  // gulls in the open sky to the left
  const gulls = [[96, 96, 7, -.2, .3], [134, 74, 5, .1, 0], [176, 118, 6, .25, .4], [74, 150, 5, -.1, .1], [120, 164, 7.5, .05, .5], [162, 190, 4.6, -.3, .2],
    [214, 168, 4.4, .2, -.1], [86, 214, 5.6, .1, .3], [140, 236, 4, -.2, 0], [66, 262, 4.8, .3, .4], [198, 92, 4, -.1, .2], [236, 72, 3.4, .2, .1],
    [184, 258, 4.2, 0, .3], [108, 290, 3.6, .2, .2], [60, 196, 3.8, -.25, .15], [150, 312, 3.2, .1, .3]];
  gulls.forEach(g => bird(E, g[0], g[1], g[2], g[3], g[4]));
};
