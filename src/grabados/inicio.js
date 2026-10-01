/* =====================================================================
   PORTADA GENERAL — «a las doce tribus que están en la dispersión» (1:1)
   Un diente de león suelta sus semillas al viento sobre las colinas.
   ===================================================================== */
function HOME_ART(E){
  const R = E.rand;
  const hill = t => t < .6 ? 1 : Math.pow(Math.max(0, (1 - t) / .4), .7);
  // everything stays above the title block, which on this screen sits higher than on a chapter cover
  band(E, [[476, 226], [400, 232], [300, 242], [190, 260]], { w: 22, n: 10, lw: .7, fray0: .02, dust: 70, dustSide: -1, spread: 8, taper: hill });
  band(E, [[484, 262], [400, 272], [300, 284], [180, 300]], { w: 34, n: 16, lw: .85, fray0: .02, dust: 90, dustSide: 1, spread: 7, heavy: 1, taper: hill });
  // toothed leaves at the foot of the stem
  const leaf = dir => {
    const pts = [], L = 58, bx = 350, by = 280;
    for (let k = 0; k <= 10; k++) { const t = k / 10, w = Math.sin(Math.PI * t) * 9 * (k % 2 ? 1 : .55); pts.push([bx + dir * L * t, by - 4 - t * 14 - w]); }
    for (let k = 10; k >= 0; k--) { const t = k / 10, w = Math.sin(Math.PI * t) * 5; pts.push([bx + dir * L * t, by - t * 10 + w * .3]); }
    const p = polyPath(pts); fill(E, p, E.paper); hatch(E, p, bboxOf(pts), { ang: dir * 20, gap: 1.4, w: .45 }); edge(E, p, .8);
  };
  leaf(-1); leaf(1);
  const cx = 316, cy = 140;
  edge(E, P(`M350 278 C346 232 334 186 ${cx} ${cy + 8}`), 2.2);
  // the seed head, already stripped on the side the wind blows toward
  for (let a = -Math.PI; a < Math.PI; a += .085) {
    if (a > -2.75 && a < -1.15 && R() < .78) continue;
    const r1 = 38 + R() * 6;
    line(E, [[cx + Math.cos(a) * 6, cy + Math.sin(a) * 6], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]], .45);
    pappus(E, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, a, 8);
  }
  const hd = new Path2D(); hd.arc(cx, cy, 7, 0, TAU); fill(E, hd, E.ink);
  // seeds carried off across the sky
  const drift = [[292, 122], [240, 102], [160, 134], [56, 118]];
  for (let i = 0; i < 24; i++) {
    const t = .04 + i / 24 * .94, b = bez(drift, t);
    floatSeed(E, b[0] + E.g() * 24, b[1] + E.g() * 14, 1.8 - t * .8 + R() * .3, -Math.PI / 2 + (R() - .5) * .9, i === 9 ? E.red : null);
  }
}

