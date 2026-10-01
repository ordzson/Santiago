/* =====================================================================
   HERRAMIENTA — inicio, índice de capítulos y lector
   ===================================================================== */
const META = {
  1: { theme: 'Pruebas y sabiduría', verses: 27, seed: 1960, crop: [118, 58, 300, 388],
       blurb: 'Gozo en las pruebas, sabiduría que se pide con fe, la corona de la vida y hacedores de la palabra.',
       desc: 'Gozo en las pruebas, sabiduría que se pide con fe, la flor que se marchita, la corona de la vida, el Padre de las luces y el espejo de la palabra.',
       summary: 'Pruebas que maduran, sabiduría que se pide y una palabra que se practica.' },
  2: { theme: 'Fe y obras', verses: 26, seed: 1964, crop: [150, 80, 280, 362],
       blurb: 'Sin favoritismos, la ley real, la misericordia que triunfa y una fe que se ve en las obras.',
       desc: 'El anillo de oro y la ropa sucia, la ley real, la misericordia que triunfa, la fe sin obras, Abraham en el altar y Rahab en la muralla.',
       summary: 'Fe sin favoritismos: la fe verdadera se ve en las obras.' },
  3: { theme: 'La lengua y la sabiduría', verses: 18, seed: 1960, crop: [110, 110, 300, 388],
       blurb: 'El freno y el timón, la chispa que incendia un bosque y la sabiduría que viene de lo alto.',
       desc: 'Los maestros y su juicio, el freno y el timón, la chispa que incendia un bosque, la fuente que no da dos aguas y la sabiduría que viene de lo alto.',
       summary: 'La lengua y la sabiduría que viene de lo alto.' },
  4: { theme: 'Humildad', verses: 17, seed: 1964, crop: [150, 90, 280, 362],
       blurb: 'Guerras y conflictos, una gracia mayor, un solo Juez y una vida que es como el vapor.',
       desc: 'Las guerras que nacen del deseo, la amistad con el mundo, una gracia mayor, las manos limpias, un solo Juez y una vida que es como el vapor.',
       summary: 'Humildad: Dios resiste a los soberbios y da mayor gracia.' },
  5: { theme: 'Paciencia y oración', verses: 20, seed: 1975, crop: [150, 60, 280, 362],
       blurb: 'Advertencias a los ricos, la paciencia del labrador, la oración de Elías y el hermano que vuelve.',
       desc: 'Riquezas que se pudren, el clamor de los segadores, la paciencia del labrador y la de Job, el sí que es sí, la oración de Elías y el hermano que vuelve.',
       summary: 'Paciencia y oración hasta que venga el Señor.' }
};
const ORDER = [1, 2, 3, 4, 5];
const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
let CUR = null, cur = -1, TOTAL = 0, pageEls = [], leaving = null, leaveTimer = 0;

/* ---------- chapter pages ---------- */
function prepChapter(C){
  if (C.PAGES) return;
  C.PAGES = [{ type: 'cover', title: 'Portada', short: 'Portada' },
    { type: 'intro', sec: 'intro', title: C.INTRO.title, short: 'Antes de empezar', vig: C.INTRO.vig, ref: C.INTRO.ref }];
  C.TEXT_PAGES.forEach(p => {
    p.type = 'text'; p.verses = range(p.vv[0], p.vv[1]);
    p.label = p.vv[0] === p.vv[1] ? 'v. ' + p.vv[0] : 'vv. ' + p.vv[0] + '–' + p.vv[1];
    p.ref = 'Santiago ' + C.BOOK.ch + ':' + (p.vv[0] === p.vv[1] ? p.vv[0] : p.vv[0] + '–' + p.vv[1]);
    p.short = p.label;
    C.PAGES.push(p);
  });
  C.PAGES.push({ type: 'recap', sec: 'repaso', title: C.RECAP_TITLE, short: 'Repaso', ref: 'Santiago ' + C.BOOK.ch + ':1–' + C.TEXT_PAGES[C.TEXT_PAGES.length - 1].vv[1] });
}
function pageOfVerse(v){ const i = CUR.PAGES.findIndex(p => p.type === 'text' && v >= p.vv[0] && v <= p.vv[1]); return i < 0 ? 1 : i; }
function dashes(long){ return `<div class="dashes" data-long="${long}" aria-hidden="true"><i></i><i></i><i></i><i></i></div>`; }
function head(p){
  const sec = CUR.SECTIONS[p.sec];
  return `<div class="pg-head" style="--sec:${sec.color}">
      ${p.vig ? `<canvas class="vig" data-vig="${p.vig}" aria-hidden="true"></canvas>` : ''}
      <p class="kicker"><span class="dot"></span>${sec.name}</p>
      <p class="ref">${p.ref}</p>
      <h2 class="pg-title">${p.title}</h2>
      ${dashes(sec.long)}
    </div>`;
}
function nextLink(i){
  const P = CUR.PAGES;
  if (i >= P.length - 1) {
    const n = CUR.BOOK.ch + 1;
    if (CH[n]) return `<button class="next-link" data-chapter="${n}" data-page="0"><span><small>Siguiente · Capítulo ${n}</small><b>${META[n].theme}</b></span>${ICON.arrow}</button>`;
    return `<button class="next-link" data-home="index"><span><small>Fin de la carta</small><b>Volver al índice</b></span>${ICON.home}</button>`;
  }
  const n = P[i + 1];
  return `<button class="next-link" data-go="${i + 1}"><span><small>${n.type === 'text' ? 'Siguiente · ' + n.label : 'Siguiente'}</small><b>${n.title}</b></span>${ICON.arrow}</button>`;
}
function markVerse(text, notes){
  const spans = [];
  notes.forEach(n => {
    let from = 0, idx = -1;
    for (let c = 0; c < n.occ; c++) { idx = text.indexOf(n.k, from); if (idx < 0) break; from = idx + n.k.length; }
    if (idx >= 0) { spans.push([idx, idx + n.k.length, n.k]); n.found = true; }
  });
  spans.sort((a, b) => a[0] - b[0]);
  let out = '', pos = 0;
  spans.forEach(([a, b, k]) => {
    if (a < pos) return;
    out += esc(text.slice(pos, a)) + `<span class="w" role="button" tabindex="0" aria-haspopup="dialog" data-k="${esc(k)}">${esc(text.slice(a, b))}</span>`;
    pos = b;
  });
  return (out + esc(text.slice(pos))).replace(/\n/g, '<br>');
}
function textPage(p, i){
  const NB = CUR.NBLA;
  const verses = p.verses.map(v => {
    const mark = v === 1 ? `<span class="chap" aria-hidden="true">${CUR.BOOK.ch}</span><span class="sr">Versículo 1. </span>` : `<sup class="vn">${v}</sup>`;
    return mark + markVerse(NB[v] || '', p.notes.filter(n => n.v === v));
  }).join(' ');
  const pos = n => (NB[n.v] || '').indexOf(n.k);
  p.notes = p.notes.filter(n => n.found).sort((a, b) => a.v - b.v || pos(a) - pos(b));
  return head(p) + `
    <div class="scripture"><p>${verses}</p></div>
    <p class="tap-hint">${p.notes.length} notas del griego · toca lo subrayado</p>
    <div class="study">
      <div class="blk" style="--c:var(--teal)">
        <p class="blk-label">Observa</p>
        <p class="q">${p.observe.q}</p>
        <button class="reveal" aria-expanded="false" aria-controls="ans-${i}">Ver respuesta ${ICON.chev}</button>
        <p class="ans" id="ans-${i}" hidden><b>Respuesta</b>${p.observe.a}</p>
      </div>
      <div class="blk" style="--c:var(--ochre)">
        <p class="blk-label">Aplica</p>
        <p class="q">${p.apply}</p>
      </div>
      <div class="blk" style="--c:var(--sage)">
        <p class="blk-label">Conecta</p>
        <ul class="links">${p.links.map(([r, t]) => `<li><span class="lr">${r}</span><span class="lt">${t}</span></li>`).join('')}</ul>
      </div>
    </div>` + nextLink(i);
}
function introPage(p, i){ return head(p) + CUR.introBody() + nextLink(i); }
function memoBlock(){
  const t = CUR.NBLA[CUR.MEMO.v] || '';
  const words = t.split(/\s+/).filter(Boolean).map((w, k) => `<span class="tok" data-i="${k}"><b>${esc(w.charAt(0))}</b>${esc(w.slice(1))}</span>`).join(' ');
  return `
    <p class="blk-label sub-h" style="--c:var(--teal)">Para memorizar</p>
    <div class="memo">
      <p class="memo-ref">Santiago ${CUR.BOOK.ch}:${CUR.MEMO.v}</p>
      <p class="memo-text">${words}</p>
      <div class="memo-ctrl">
        <p class="memo-level" aria-live="polite">Lee el versículo y luego oculta palabras para repasarlo.</p>
        <div class="memo-btns">
          <button class="memo-less" disabled>Mostrar más</button>
          <button class="memo-more">Ocultar más</button>
        </div>
      </div>
    </div>`;
}
function letterBlock(){
  return `<p class="blk-label sub-h" style="--c:var(--ochre)">La carta completa</p>
    <ol class="letter">${ORDER.map(n => `<li${n === CUR.BOOK.ch ? ' class="on"' : ''}><button data-chapter="${n}" data-page="0"${n === CUR.BOOK.ch ? ' aria-current="true"' : ''}><b>${n}</b><span>${META[n].summary}</span><i aria-hidden="true">${ICON.go}</i></button></li>`).join('')}</ol>`;
}
function recapPage(p, i){
  return head(p) + CUR.recapBody() + `
    <p class="credit">Texto bíblico tomado de la Nueva Biblia de las Américas (NBLA), Copyright © 2005 por The Lockman Foundation. Usado con permiso. Las notas del griego, las preguntas y la oración son material de estudio y no forman parte del texto bíblico.</p>
    ` + nextLink(i);
}
function coverPage(){
  const n = CUR.BOOK.ch;
  return `<canvas class="cover-art" aria-hidden="true"></canvas>
    <div class="cover-in">
      <div class="c-main">
        <p class="c-pre">la epístola de</p>
        <h2 class="c-title">Santiago</h2>
        <p class="c-chap">Capítulo ${n}</p>
        <div class="dashes" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
        <p class="c-desc">${META[n].desc}</p>
        <div class="c-actions"><button class="btn-start" data-go="1">Comenzar ${ICON.go}</button></div>
      </div>
    </div>`;
}
function renderDeck(){
  const deck = $('#deck');
  if (leaving) { clearTimeout(leaveTimer); leaving = null; }
  deck.textContent = '';
  CUR.PAGES.forEach((p, i) => {
    const s = document.createElement('section');
    s.className = 'page' + (i === 0 ? ' cover' : '');
    s.id = 'pg-' + i; s.tabIndex = -1;
    s.setAttribute('aria-label', i === 0 ? 'Santiago ' + CUR.BOOK.ch + ', portada' : (p.type === 'text' ? p.ref + ', ' : '') + p.title);
    s.innerHTML = i === 0 ? coverPage() : p.type === 'text' ? textPage(p, i) : p.type === 'intro' ? introPage(p, i) : recapPage(p, i);
    s.setAttribute('inert', ''); s.setAttribute('aria-hidden', 'true');
    deck.appendChild(s);
  });
  pageEls = $$('.page', deck);
  TOTAL = CUR.PAGES.length;
  memo = 0;
  buildToc();
  $('#bar-ch').textContent = 'Santiago ' + CUR.BOOK.ch;
  $('#toc-h').textContent = 'Santiago ' + CUR.BOOK.ch;
  $$('.toc-ch button').forEach(b => b.setAttribute('aria-current', +b.dataset.chapter === CUR.BOOK.ch ? 'true' : 'false'));
}
function buildToc(){
  let html = '', last = null;
  CUR.PAGES.forEach((p, i) => {
    if (p.sec && p.sec !== 'intro' && p.sec !== 'repaso' && p.sec !== last) html += `<li class="toc-sec" style="--c:${CUR.SECTIONS[p.sec].color}">${CUR.SECTIONS[p.sec].name}</li>`;
    last = p.sec;
    const small = p.type === 'text' ? `<small>${p.ref}</small>` : `<small>${p.short}</small>`;
    const title = p.type === 'cover' ? 'Santiago, capítulo ' + CUR.BOOK.ch : p.title;
    html += `<li><button class="toc-item" data-go="${i}"><span class="toc-n">${i + 1}</span><span class="toc-t">${small}${title}</span></button></li>`;
  });
  $('#toc-list').innerHTML = html;
}

/* ---------- art: drawn when a page is shown ---------- */
function fitTitleIn(scope){
  const el = scope && $('.c-title', scope), box = scope && $('.c-main', scope);
  if (!el || !box) return;
  el.style.fontSize = '58px';
  const w = el.getBoundingClientRect().width, avail = box.clientWidth;
  if (w > 0 && avail > 0) el.style.fontSize = Math.min(58 * avail / w, 124).toFixed(1) + 'px';
}
function drawPage(i){
  const el = pageEls[i];
  if (!el || el.dataset.drawn === '1') return;
  try {
    if (i === 0) {
      fitTitleIn(el);
      const E = engraver($('.cover-art', el), 400, 520, { fit: 'height', ax: 1, ay: 0, seed: META[CUR.BOOK.ch].seed });
      if (!E) return;
      COVERS[CUR.BOOK.ch](E);
    } else {
      const cv = $('canvas.vig', el);
      if (cv) {
        const E = engraver(cv, 200, 160, { fit: 'contain', ax: 1, ay: 0, seed: 101 + (i - 1) * 17 });
        if (!E) return;
        if (VIG[cv.dataset.vig]) VIG[cv.dataset.vig](E);
      }
    }
    el.dataset.drawn = '1';
  } catch (err) { el.dataset.drawn = '1'; }
}
let aroundTimer = 0;
function drawAround(i){
  drawPage(i);
  clearTimeout(aroundTimer);
  aroundTimer = setTimeout(() => { drawPage(i + 1); drawPage(i - 1); }, 220);
}
let homeDirty = true, homeJobs = 0;
function drawHomeArt(){
  if (!homeDirty || $('#home').hidden) return;
  homeDirty = false;
  const run = ++homeJobs;
  fitTitleIn($('#hero'));
  const jobs = [() => {
    const E = engraver($('#hero-art'), 400, 520, { fit: 'height', ax: 1, ay: 0, seed: 1 });
    if (E) HOME_ART(E);
  }].concat(ORDER.map(n => () => {
    const cv = $(`canvas[data-thumb="${n}"]`), [x, y, w, h] = META[n].crop;
    const E = cv && engraver(cv, w, h, { fit: 'cover', ax: .5, ay: .5, seed: META[n].seed });
    if (!E) return;
    E.ctx.translate(-x, -y);
    COVERS[n](E);
  }));
  const step = () => {
    if (run !== homeJobs) return;
    const job = jobs.shift();
    if (!job) return;
    try { job(); } catch (err) { /* el arte es decorativo */ }
    setTimeout(step, 20);
  };
  step();
}

/* ---------- views ---------- */
function showView(name){
  const toHome = name === 'home', home = $('#home'), reader = $('#reader');
  closeSheets(true);
  home.hidden = !toHome; reader.hidden = toHome;
  if (toHome) { refreshHome(); requestAnimationFrame(drawHomeArt); }
}
function scrollToIndex(){
  const box = $('#home'), idx = $('#capitulos');
  box.scrollTo({ top: Math.max(0, idx.offsetTop - 4), behavior: reduceMotion ? 'auto' : 'smooth' });
}
function chapterState(n){ const s = store.get('stgo-ch-' + n); return s && typeof s.page === 'number' ? s : null; }
function resumePage(n){
  prepChapter(CH[n]);
  const s = chapterState(n), last = CH[n].PAGES.length - 1;
  return s && s.max < last ? Math.min(s.page, last) : 0;
}
function openChapter(n, page, opts){
  opts = opts || {};
  const C = CH[n];
  if (!C) return;
  prepChapter(C);
  if (CUR !== C) { CUR = C; renderDeck(); cur = -1; }
  showView('reader');
  page = Math.max(0, Math.min(C.PAGES.length - 1, page | 0));
  go(page, { force: true, dir: opts.dir || 1, instant: !opts.dir, focus: opts.focus });
}

/* ---------- home ---------- */
function renderHome(){
  $('#chap-list').innerHTML = ORDER.map(n => {
    const M = META[n];
    return `<li><button class="chap-row" data-chapter="${n}">
        <span class="thumb-wrap"><canvas class="thumb" data-thumb="${n}" aria-hidden="true"></canvas><b class="thumb-n" aria-hidden="true">${n}</b></span>
        <span class="chap-txt">
          <small class="chap-k">Capítulo ${n} · ${M.verses} versículos</small>
          <b class="chap-t">${M.theme}</b>
          <span class="chap-d">${M.blurb}</span>
          <span class="chap-p" id="prog-${n}"><span class="bar-p"><i></i></span><em>Sin empezar</em></span>
        </span>
      </button></li>`;
  }).join('');
}
function refreshHome(){
  ORDER.forEach(n => {
    prepChapter(CH[n]);
    const s = chapterState(n), total = CH[n].PAGES.length, el = $('#prog-' + n);
    let pct = 0, txt = 'Sin empezar', done = false;
    if (s && s.max > 0) {
      done = s.max >= total - 1;
      pct = Math.round((s.max + 1) / total * 100);
      txt = done ? 'Terminado' : 'Vas en la página ' + (s.page + 1) + ' de ' + total;
    }
    $('i', el).style.width = pct + '%';
    $('em', el).textContent = txt;
    el.classList.toggle('done', done);
  });
  const last = store.get('stgo-last');
  if (last && CH[last.ch]) {
    prepChapter(CH[last.ch]);
    const p = CH[last.ch].PAGES[last.page] || CH[last.ch].PAGES[0];
    $('#resume-txt').textContent = 'Seguir leyendo';
    $('#resume-sub').textContent = 'Te quedaste en el capítulo ' + last.ch + ', ' + (p.type === 'text' ? p.label : p.title.toLowerCase()) + '.';
  } else {
    $('#resume-txt').textContent = 'Empezar a leer';
    $('#resume-sub').textContent = 'Empieza por el capítulo 1 o elige uno en el índice.';
  }
}

/* ---------- navigation ---------- */
function syncChrome(){
  $('#prev').disabled = cur === 0 && !CH[CUR.BOOK.ch - 1];
  $('#next').disabled = cur === TOTAL - 1 && !CH[CUR.BOOK.ch + 1];
  $('#bar').classList.toggle('on-cover', cur === 0);
  $('#count-txt').textContent = (cur + 1) + ' / ' + TOTAL;
  $('#progress').style.width = (cur / (TOTAL - 1) * 100) + '%';
  $$('.toc-item').forEach(b => b.setAttribute('aria-current', +b.dataset.go === cur ? 'page' : 'false'));
}
function saveProgress(){
  const n = CUR.BOOK.ch, prev = chapterState(n);
  store.set('stgo-ch-' + n, { page: cur, max: Math.max(prev ? prev.max || 0 : 0, cur) });
  store.set('stgo-last', { ch: n, page: cur });
}
function go(i, opts){
  opts = opts || {};
  if (i >= TOTAL) { if (CH[CUR.BOOK.ch + 1]) openChapter(CUR.BOOK.ch + 1, 0, { dir: 1 }); return; }
  if (i < 0) { const n = CUR.BOOK.ch - 1; if (CH[n]) { prepChapter(CH[n]); openChapter(n, CH[n].PAGES.length - 1, { dir: -1 }); } return; }
  if (i === cur && !opts.force) return;
  closeSheets(true);
  const dir = opts.dir || (i > cur ? 1 : -1);
  const from = cur >= 0 && cur !== i ? pageEls[cur] : null, to = pageEls[i];
  if (leaving) { leaving.classList.remove('out-l', 'out-r'); clearTimeout(leaveTimer); leaving = null; }
  pageEls.forEach(el => el.classList.remove('in-r', 'in-l'));
  if (from) { from.classList.remove('is-current'); from.setAttribute('inert', ''); from.setAttribute('aria-hidden', 'true'); }
  to.scrollTop = 0;
  to.classList.add('is-current'); to.removeAttribute('inert'); to.setAttribute('aria-hidden', 'false');
  if (!reduceMotion && !opts.instant) {
    if (from) {
      from.classList.add(dir > 0 ? 'out-l' : 'out-r');
      leaving = from;
      leaveTimer = setTimeout(() => { from.classList.remove('out-l', 'out-r'); leaving = null; }, 300);
    }
    to.classList.add(dir > 0 ? 'in-r' : 'in-l');
  }
  cur = i;
  syncChrome();
  saveProgress();
  drawAround(cur);
  const p = CUR.PAGES[cur];
  $('#live').textContent = 'Capítulo ' + CUR.BOOK.ch + ', página ' + (cur + 1) + ' de ' + TOTAL + '. ' + (p.type === 'text' ? p.ref + ', ' : '') + (p.type === 'cover' ? 'portada' : p.title);
  if (opts.focus) to.focus({ preventScroll: true });
}

/* ---------- sheets ---------- */
let openSheet = null, returnFocus = null, noteState = null;
function showSheet(id){
  const sh = $('#' + id), scrim = $('#scrim');
  if (openSheet && openSheet !== sh) closeSheets(true);
  returnFocus = returnFocus || document.activeElement;
  sh.removeAttribute('inert'); sh.classList.add('on'); scrim.classList.add('on');
  if (pageEls[cur]) pageEls[cur].setAttribute('inert', '');
  openSheet = sh;
  setTimeout(() => { const x = $('[data-close]', sh); x && x.focus({ preventScroll: true }); }, 60);
}
function closeSheets(silent){
  if (!openSheet) return;
  openSheet.classList.remove('on'); openSheet.setAttribute('inert', '');
  $('#scrim').classList.remove('on');
  if (pageEls[cur]) pageEls[cur].removeAttribute('inert');
  $$('.w.is-on').forEach(w => w.classList.remove('is-on'));
  openSheet = null;
  if (!silent && returnFocus && document.contains(returnFocus)) returnFocus.focus({ preventScroll: true });
  returnFocus = null;
}
function renderNote(){
  const p = CUR.PAGES[noteState.pi], n = p.notes[noteState.idx];
  $('#ns-kick').textContent = 'Mira de cerca · v. ' + n.v;
  $('#ns-word').textContent = n.k;
  $('#ns-gr').textContent = n.gr;
  $('#ns-tr').textContent = n.tr;
  $('#ns-gloss').textContent = '«' + n.gloss + '»';
  $('#ns-body').textContent = n.body;
  $('#ns-pos').textContent = (noteState.idx + 1) + ' de ' + p.notes.length;
  $('#ns-prev').disabled = noteState.idx === 0;
  $('#ns-next').disabled = noteState.idx === p.notes.length - 1;
  $$('.w', pageEls[noteState.pi]).forEach(w => w.classList.toggle('is-on', w.dataset.k === n.k));
}
function openNote(el){
  const pi = pageEls.indexOf(el.closest('.page'));
  const idx = CUR.PAGES[pi].notes.findIndex(n => n.k === el.dataset.k);
  if (idx < 0) return;
  noteState = { pi, idx };
  returnFocus = el;
  renderNote(); showSheet('note-sheet');
  $('#note-sheet').scrollTop = 0;
}

/* ---------- memorize ---------- */
let memo = 0;
const MEMO_LABEL = ['Lee el versículo y luego oculta palabras para repasarlo.', 'Nivel 1 de 3 · toca una raya para ver la palabra.', 'Nivel 2 de 3 · toca una raya para ver la palabra.', 'Nivel 3 de 3 · solo quedan las iniciales.'];
function setMemo(l){
  const box = pageEls[cur] && $('.memo', pageEls[cur]);
  if (!box) return;
  memo = Math.max(0, Math.min(3, l));
  $$('.tok', box).forEach((t, i) => {
    const hide = memo === 0 ? false : memo === 3 ? true : memo === 1 ? i % 3 === 1 : i % 3 !== 0;
    t.classList.toggle('hid', hide); t.classList.remove('peek');
  });
  $('.memo-level', box).textContent = MEMO_LABEL[memo];
  $('.memo-less', box).disabled = memo === 0; $('.memo-more', box).disabled = memo === 3;
}

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const t = e.target;
  const chap = t.closest('[data-chapter]');
  if (chap) {
    e.preventDefault();
    const n = +chap.dataset.chapter;
    closeSheets(true);
    openChapter(n, chap.dataset.page != null ? +chap.dataset.page : resumePage(n), { focus: true });
    return;
  }
  const hm = t.closest('[data-home]');
  if (hm) { e.preventDefault(); showView('home'); if (hm.dataset.home === 'index') requestAnimationFrame(scrollToIndex); return; }
  if (t.closest('#to-index')) { scrollToIndex(); return; }
  if (t.closest('#resume-btn')) {
    const last = store.get('stgo-last');
    if (last && CH[last.ch]) openChapter(last.ch, last.page, { focus: true }); else openChapter(1, 0, { focus: true });
    return;
  }
  if ($('#reader').hidden) return;
  const g = t.closest('[data-go]');
  if (g) { e.preventDefault(); go(+g.dataset.go, { focus: true }); return; }
  const w = t.closest('.w'); if (w) { openNote(w); return; }
  const r = t.closest('.reveal');
  if (r) {
    const a = document.getElementById(r.getAttribute('aria-controls'));
    const open = r.getAttribute('aria-expanded') !== 'true';
    r.setAttribute('aria-expanded', String(open)); a.hidden = !open;
    r.firstChild.nodeValue = open ? 'Ocultar respuesta ' : 'Ver respuesta ';
    return;
  }
  if (t.closest('.memo-more')) { setMemo(memo + 1); return; }
  if (t.closest('.memo-less')) { setMemo(memo - 1); return; }
  const tok = t.closest('.tok.hid'); if (tok) tok.classList.toggle('peek');
});
$('#prev').addEventListener('click', () => go(cur - 1));
$('#next').addEventListener('click', () => go(cur + 1));
$('#scrim').addEventListener('click', () => closeSheets());
$$('[data-close]').forEach(b => b.addEventListener('click', () => closeSheets()));
$('#count').addEventListener('click', () => { returnFocus = $('#count'); showSheet('toc-sheet'); const c = $('.toc-item[aria-current="page"]'); c && c.scrollIntoView({ block: 'center' }); });
$('#ns-prev').addEventListener('click', () => { if (noteState.idx > 0) { noteState.idx--; renderNote(); } });
$('#ns-next').addEventListener('click', () => { if (noteState.idx < CUR.PAGES[noteState.pi].notes.length - 1) { noteState.idx++; renderNote(); } });
$('#deck').addEventListener('keydown', e => {
  const w = e.target.closest && e.target.closest('.w');
  if (w && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openNote(w); }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeSheets(); return; }
  if (openSheet || $('#reader').hidden) return;
  if (e.key === 'ArrowRight') go(cur + 1);
  else if (e.key === 'ArrowLeft') go(cur - 1);
});
let sx = 0, sy = 0, st = 0, tracking = false;
$('#deck').addEventListener('touchstart', e => {
  if (openSheet || e.touches.length !== 1) { tracking = false; return; }
  sx = e.touches[0].clientX; sy = e.touches[0].clientY; st = Date.now(); tracking = true;
}, { passive: true });
$('#deck').addEventListener('touchend', e => {
  if (!tracking) return; tracking = false;
  const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
  if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.6 && Date.now() - st < 900) go(cur + (dx < 0 ? 1 : -1));
}, { passive: true });

function redrawAll(){
  homeDirty = true;
  pageEls.forEach(el => { el.dataset.drawn = ''; });
  if (!$('#home').hidden) drawHomeArt();
  if (!$('#reader').hidden && cur >= 0) drawAround(cur);
}
let rt = 0;
window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(redrawAll, 180); });
if (window.matchMedia) {
  const mq = matchMedia('(prefers-color-scheme: dark)');
  if (mq.addEventListener) mq.addEventListener('change', () => requestAnimationFrame(redrawAll));
}
new MutationObserver(() => requestAnimationFrame(redrawAll)).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class', 'style'] });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { fitTitleIn($('#hero')); if (cur === 0 && pageEls[0]) fitTitleIn(pageEls[0]); });

/* ---------- start ---------- */
renderHome();
const hashCh = /^#cap([1-5])$/.exec(location.hash || '');
if (hashCh) openChapter(+hashCh[1], resumePage(+hashCh[1]));
else showView('home');
