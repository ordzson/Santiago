import {test} from 'node:test';
import assert from 'node:assert/strict';
import {AMBIENT_DESKTOP,AMBIENT_FADE_MS,AMBIENT_PHONE,MAX_DT_MS,MAX_PARTICLES,PALETTE,RING_MS,advance,ambientTarget,burstCount,clampDt,createField,emitBurst,envelope,isPhoneWidth,liveCount,needsFrame,renderState,resizeField,ringState,setAmbient,setReduced} from '../src/app/particles-engine.ts';
import type {BurstKind,Field} from '../src/app/particles-engine.ts';

/** Azar determinista (mulberry32). */
const seeded=(seed:number)=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
const RECT={left:100,top:200,width:300,height:60};
const run=(f:Field,ms:number,step=16,rnd=seeded(7))=>{for(let t=0;t<ms;t+=step)advance(f,step,rnd);};
const live=(kind:BurstKind,seed=1)=>{const f=createField({width:900,height:700});return {f,n:emitBurst(f,kind,RECT,seeded(seed))};};

test('constantes del contrato',()=>{
  assert.deepEqual([MAX_PARTICLES,MAX_DT_MS,AMBIENT_PHONE,AMBIENT_DESKTOP,AMBIENT_FADE_MS,RING_MS],[500,64,70,120,600,700]);
});

test('conteos por tipo caen en el rango contratado en muchas semillas',()=>{
  const seen:Record<BurstKind,{main:number[];accent:number[]}>={lit:{main:[],accent:[]},paint:{main:[],accent:[]},word:{main:[],accent:[]},special:{main:[],accent:[]}};
  for(let s=1;s<=300;s++)for(const k of Object.keys(seen) as BurstKind[]){const c=burstCount(k,seeded(s));seen[k].main.push(c.main);seen[k].accent.push(c.accent);}
  const within=(xs:number[],lo:number,hi:number)=>assert.ok(Math.min(...xs)>=lo&&Math.max(...xs)<=hi,`${Math.min(...xs)}–${Math.max(...xs)} fuera de ${lo}–${hi}`);
  within(seen.lit.main,28,40);within(seen.paint.main,9,11);within(seen.word.main,10,14);within(seen.special.main,60,80);within(seen.special.accent,6,8);
  within(seen.lit.accent,0,0);
  // y el rango se alcanza de verdad (no es un valor fijo)
  assert.ok(new Set(seen.lit.main).size>5);
});

test('emitBurst entrega lo contratado y coloca las partículas',()=>{
  const lit=live('lit').n;assert.ok(lit>=28&&lit<=40);
  assert.ok(live('paint').n>=9&&live('paint').n<=11);
  const word=live('word');assert.ok(word.n>=10&&word.n<=14);
  assert.ok(word.f.particles.every(p=>p.sprite==='spark'&&p.life===600));
  const sp=live('special');assert.ok(sp.n>=66&&sp.n<=88);
  assert.equal(sp.f.particles.filter(p=>p.tone==='carmine').length,sp.n-sp.f.particles.filter(p=>p.tone!=='carmine').length);
  assert.ok(sp.f.particles.filter(p=>p.tone==='carmine').length>=6&&sp.f.particles.filter(p=>p.tone==='carmine').length<=8);
  assert.equal(liveCount(sp.f),sp.n);
});

test('vidas, tamaños y sesgo al borde superior de lit',()=>{
  const {f}=live('lit',3);
  assert.ok(f.particles.every(p=>p.life>=900&&p.life<=1400&&p.size>=2&&p.size<=5));
  const sp=live('special',3).f;
  assert.ok(sp.particles.every(p=>p.life>=1600&&p.life<=2200));
  // 200 estallidos: la mayoría de motas nace en el borde superior
  let top=0,all=0;
  for(let s=1;s<=200;s++){const g=createField({width:900,height:700});emitBurst(g,'lit',RECT,seeded(s));for(const p of g.particles){all++;if(p.y===RECT.top)top++;}}
  assert.ok(top/all>.45&&top/all<.65,`sesgo superior ${top/all}`);
});

test('special añade un anillo de 700 ms que se expande y se apaga',()=>{
  const {f}=live('special');
  assert.equal(f.rings.length,1);
  assert.equal(f.rings[0].life,700);
  assert.deepEqual([f.rings[0].x,f.rings[0].y],[250,230]);
  assert.equal(live('lit').f.rings.length,0);
  const a=ringState({...f.rings[0],age:100}),b=ringState({...f.rings[0],age:500});
  assert.ok(b.radius>a.radius&&b.alpha<a.alpha);
  run(f,720);
  assert.equal(f.rings.length,0);
});

test('las partículas mueren al terminar su vida y el campo queda vacío',()=>{
  const {f}=live('special',5);
  assert.ok(liveCount(f)>0);
  run(f,1000);assert.ok(liveCount(f)>0,'siguen vivas a 1 s');
  run(f,1300);
  assert.equal(liveCount(f),0);
  assert.equal(needsFrame(f),false);
  const w=live('word').f;run(w,620);assert.equal(liveCount(w),0);
});

test('mueren a su tiempo, no antes: lit sigue vivo a 0,8 s y ha terminado a 1,5 s',()=>{
  const f=createField({width:900,height:700});emitBurst(f,'lit',RECT,seeded(2));
  const n=liveCount(f);run(f,800);assert.equal(liveCount(f),n);
  run(f,720);assert.equal(liveCount(f),0);
});

test('tope de 500 partículas vivas',()=>{
  const f=createField({width:900,height:700});
  for(let i=0;i<20;i++)emitBurst(f,'special',RECT,seeded(i+1));
  assert.equal(liveCount(f),MAX_PARTICLES);
  assert.equal(emitBurst(f,'lit',RECT,seeded(99)),0);
  // con el polvo ambiental encendido también se respeta
  const g=createField({width:900,height:700});setAmbient(g,true);run(g,2000);
  for(let i=0;i<20;i++){emitBurst(g,'special',RECT,seeded(i+1));advance(g,16,seeded(i+50));assert.ok(liveCount(g)<=MAX_PARTICLES);}
});

test('dt acotado a 64 ms',()=>{
  assert.equal(clampDt(16),16);assert.equal(clampDt(64),64);assert.equal(clampDt(500),64);assert.equal(clampDt(-5),0);assert.equal(clampDt(NaN),0);
  // una pausa de 5 s (pestaña dormida) solo avanza 64 ms de edad
  const f=createField({width:900,height:700});emitBurst(f,'lit',RECT,seeded(4));
  advance(f,5000);
  assert.ok(f.particles.length>0);
  assert.ok(f.particles.every(p=>p.age===64));
});

test('movimiento reducido: burst emite 0, ambient no dibuja, y se vacía lo que hubiera',()=>{
  const f=createField({width:900,height:700,reduced:true});
  for(const k of ['lit','paint','word','special'] as BurstKind[])assert.equal(emitBurst(f,k,RECT,seeded(1)),0);
  assert.equal(f.rings.length,0);
  setAmbient(f,true);advance(f,16);
  assert.equal(f.ambientOn,false);assert.equal(liveCount(f),0);assert.equal(needsFrame(f),false);
  // cambiar a reducido en caliente limpia el campo
  const g=createField({width:900,height:700});emitBurst(g,'special',RECT,seeded(1));setAmbient(g,true);
  setReduced(g,true);
  assert.equal(liveCount(g),0);assert.equal(g.rings.length,0);assert.equal(g.ambientOn,false);
});

test('ambient: 70 motas en teléfono, 120 en escritorio',()=>{
  assert.equal(isPhoneWidth(390),true);assert.equal(isPhoneWidth(1280),false);
  assert.equal(ambientTarget(true),70);assert.equal(ambientTarget(false),120);
  const phone=createField({width:390,height:800});setAmbient(phone,true);run(phone,3000);
  assert.equal(liveCount(phone),70);
  const desk=createField({width:1280,height:800});setAmbient(desk,true);run(desk,3000);
  assert.equal(liveCount(desk),120);
  // al cambiar de tamaño (escritorio → teléfono) se recorta al objetivo
  resizeField(desk,390,800);run(desk,100);
  assert.equal(liveCount(desk),70);
});

test('ambient: el polvo se mantiene en pantalla y dentro del haz',()=>{
  const f=createField({width:1000,height:800});setAmbient(f,true);run(f,20000,32);
  assert.equal(liveCount(f),120);
  assert.ok(f.particles.every(p=>p.ambient&&p.x>=-6&&p.x<=1006&&p.y<=806));
  const c=f.particles.filter(p=>p.y<200);
  assert.ok(c.every(p=>p.x>200&&p.x<800),'cerca de arriba el haz es estrecho');
});

test('ambient: al apagar se desvanece 600 ms y luego desaparece',()=>{
  const f=createField({width:900,height:700});setAmbient(f,true);run(f,2000);
  assert.equal(f.ambientLevel,1);
  setAmbient(f,false);
  assert.equal(needsFrame(f),true);
  run(f,300);assert.ok(f.ambientLevel>.4&&f.ambientLevel<.6,`nivel ${f.ambientLevel}`);
  assert.ok(liveCount(f)>0);
  run(f,330);
  assert.equal(f.ambientLevel,0);
  assert.equal(liveCount(f),0);
  assert.equal(needsFrame(f),false);
});

test('el bucle sigue necesario mientras haya vida o ambiente, y no antes',()=>{
  const f=createField({width:900,height:700});
  assert.equal(needsFrame(f),false);
  emitBurst(f,'word',RECT,seeded(1));assert.equal(needsFrame(f),true);
  run(f,700);assert.equal(needsFrame(f),false);
  setAmbient(f,true);assert.equal(needsFrame(f),true);
});

test('un estallido convive con el polvo sin retirarlo',()=>{
  const f=createField({width:900,height:700});setAmbient(f,true);run(f,2000);
  const dust=liveCount(f);emitBurst(f,'lit',RECT,seeded(8));
  assert.ok(liveCount(f)>dust);
  run(f,1600);
  assert.equal(liveCount(f),dust);
});

test('envolvente: nace en 0, llega a 1, se apaga al final; renderState del polvo respeta el nivel',()=>{
  assert.equal(envelope(0,1000),0);
  assert.ok(envelope(300,1000)>.99);
  assert.ok(envelope(900,1000)<envelope(600,1000));
  assert.equal(envelope(1000,1000),0);
  const {f}=live('lit');
  const p=f.particles[0];p.age=p.life*.3;
  assert.ok(renderState(p,1).alpha>0);
  const d=createField({width:900,height:700});setAmbient(d,true);run(d,3000);
  const dust=d.particles[0];
  assert.equal(renderState(dust,0).alpha,0);
  assert.ok(renderState(dust,1).alpha<=dust.alpha);
});

test('paleta: día source-over con los tres tonos del contrato, noche lighter',()=>{
  assert.equal(PALETTE.day.composite,'source-over');assert.equal(PALETTE.night.composite,'lighter');
  const day=Object.values(PALETTE.day.tones);
  for(const c of ['#c9962e','#e0b54a','#a8741f'])assert.ok(day.includes(c));
  const night=Object.values(PALETTE.night.tones);
  for(const c of ['#ffd27a','#f3b54a'])assert.ok(night.includes(c));
});
