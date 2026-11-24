import {test} from 'node:test';
import assert from 'node:assert/strict';
import {VOICE_TUNING, bandEdges, bandLevels, createVoiceSpectrum} from '../src/app/voice-spectrum.ts';
const SR=48000,T=VOICE_TUNING,BINS=T.fftSize/2,HZ=SR/T.fftSize,COUNT=32;
/** Espectro sintético: suelo plano y, entre `from` y `to` Hz, un pico constante. */
const spectrum=(floor:number,peak?:number,from=150,to=3000)=>{
  const s=new Float32Array(BINS).fill(floor);
  if(peak!==undefined)for(let k=0;k<BINS;k++){const f=k*HZ;if(f>=from&&f<=to)s[k]=peak;}
  return s;
};
const run=(sp:ReturnType<typeof createVoiceSpectrum>,db:Float32Array,seconds:number,dt=1/60)=>{let out=sp.levels;for(let t=0;t<seconds;t+=dt)out=sp.update(db,dt);return out;};
const central=(l:ArrayLike<number>)=>Array.from(l).slice(Math.floor(COUNT*0.3),Math.ceil(COUNT*0.6));
test('VOICE_TUNING trae los parámetros iniciales',()=>{
  assert.equal(T.fftSize,2048);assert.equal(T.smoothingTimeConstant,0.5);
  assert.equal(T.minDecibels,-95);assert.equal(T.maxDecibels,-20);
  assert.equal(T.fMin,90);assert.equal(T.fMax,7000);assert.equal(T.gateDb,-68);assert.equal(T.peakFloorDb,-55);
});
test('bandEdges: count+1 bordes logarítmicos y crecientes entre fMin y fMax',()=>{
  const e=bandEdges(SR,T.fftSize,COUNT,90,7000);
  assert.equal(e.freqs.length,COUNT+1);assert.equal(e.bins.length,COUNT+1);
  assert.ok(Math.abs(e.freqs[0]-90)<1e-6);assert.ok(Math.abs(e.freqs[COUNT]-7000)<1e-6);
  for(let i=1;i<=COUNT;i++)assert.ok(e.freqs[i]>e.freqs[i-1]);
  const r=e.freqs[1]/e.freqs[0];
  for(let i=2;i<=COUNT;i++)assert.ok(Math.abs(e.freqs[i]/e.freqs[i-1]-r)<1e-9);
  assert.ok(Math.abs(e.bins[COUNT]-7000/HZ)<1e-6);
});
test('bandEdges: fMax se limita a Nyquist',()=>{const e=bandEdges(8000,2048,8,90,7000);assert.ok(e.freqs[8]<=4000+1e-6);});
test('silencio y ruido de sala (≈ −75 dB) dan barras ≈ 0',()=>{
  const sp=createVoiceSpectrum(COUNT,T,SR);
  for(const floor of [-Infinity,-95,-75]){
    const out=run(sp,spectrum(floor),1);
    assert.equal(out.length,COUNT);
    assert.ok(Math.max(...out)<0.01,`floor ${floor}`);
  }
  assert.ok(Math.max(...bandLevels(spectrum(-75),bandEdges(SR,T.fftSize,COUNT,90,7000),T))<0.01);
});
test('voz normal (picos −35 dB en 150–3000 Hz) llena las barras centrales (≥ 0,5)',()=>{
  const sp=createVoiceSpectrum(COUNT,T,SR);
  const out=run(sp,spectrum(-75,-35),1);
  for(const v of central(out))assert.ok(v>=0.5,`v=${v}`);
});
test('voz baja (−50 dB) es visible (≥ 0,35) y el ruido de fondo sigue en 0',()=>{
  const sp=createVoiceSpectrum(COUNT,T,SR);
  const out=run(sp,spectrum(-75,-50),1);
  for(const v of central(out))assert.ok(v>=0.35,`v=${v}`);
  const e=bandEdges(SR,T.fftSize,COUNT,90,7000);
  const outside=Array.from(out).filter((_,b)=>e.freqs[b]>3500);
  for(const v of outside)assert.ok(v<0.01,`ruido levantado: ${v}`);
});
test('nunca supera 1 ni baja de 0, incluso con espectros extremos',()=>{
  const sp=createVoiceSpectrum(COUNT,T,SR);
  for(const peak of [-95,-60,-35,-20,0,30,Infinity]){
    const out=run(sp,spectrum(-75,peak),0.3);
    for(const v of out)assert.ok(v>=0&&v<=1&&Number.isFinite(v),`peak ${peak} v=${v}`);
  }
  const bl=bandLevels(spectrum(-75,10),bandEdges(SR,T.fftSize,COUNT,90,7000),T);
  for(const v of bl)assert.ok(v>=0&&v<=1);
});
test('ataque más rápido que caída',()=>{
  const dt=0.03;
  const up=createVoiceSpectrum(COUNT,T,SR);
  const rise=Math.max(...up.update(spectrum(-75,-35),dt));
  const dn=createVoiceSpectrum(COUNT,T,SR);
  const loud=run(dn,spectrum(-75,-35),1);
  const before=Math.max(...loud);
  const fall=before-Math.max(...dn.update(spectrum(-75),dt));
  assert.ok(rise/1>fall/before,`subida ${rise} vs caída ${fall/before}`);
  assert.ok(rise>0.5);
});
test('el suavizado depende de dt, no de la cantidad de frames',()=>{
  const a=createVoiceSpectrum(COUNT,T,SR),b=createVoiceSpectrum(COUNT,T,SR);
  const db=spectrum(-75,-35);
  const one=a.update(db,0.04)[12];
  b.update(db,0.02);const two=b.update(db,0.02)[12];
  assert.ok(Math.abs(one-two)<1e-9,`${one} vs ${two}`);
});
test('ganancia adaptativa: el pico decae con el tiempo y una voz baja vuelve a verse',()=>{
  const sp=createVoiceSpectrum(COUNT,T,SR);
  run(sp,spectrum(-75,-25),0.5);
  const soon=Math.max(...run(sp,spectrum(-75,-50),0.2));
  const later=Math.max(...run(sp,spectrum(-75,-50),12));
  assert.ok(later>soon,`${later} > ${soon}`);
  assert.ok(later>=0.9);
});
test('dt inválido no altera ni rompe los niveles',()=>{
  const sp=createVoiceSpectrum(COUNT,T,SR);
  run(sp,spectrum(-75,-35),0.5);
  const before=Array.from(sp.levels);
  for(const dt of [0,-1,NaN])assert.deepEqual(Array.from(sp.update(spectrum(-75,-35),dt)),before);
});
test('reset vuelve a cero',()=>{const sp=createVoiceSpectrum(COUNT,T,SR);run(sp,spectrum(-75,-35),0.5);sp.reset();assert.equal(Math.max(...sp.levels),0);});
