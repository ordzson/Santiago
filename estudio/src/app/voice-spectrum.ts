/**
 * Motor puro del espectro de voz: recibe el espectro del analizador (dB por bin,
 * como `getFloatFrequencyData`) y devuelve niveles 0..1 por barra. Sin DOM ni Web Audio.
 */
export interface VoiceTuning {
  /** Parámetros del `AnalyserNode`. */
  fftSize:number; smoothingTimeConstant:number; minDecibels:number; maxDecibels:number;
  /** Banda útil en Hz (escala logarítmica). */
  fMin:number; fMax:number;
  /** Inclinación (dB por octava) por encima de `tiltFromHz`: realza los agudos, que suenan más flojos. */
  tiltDbPerOct:number; tiltFromHz:number;
  /** Por debajo de este nivel (dB medidos, antes de inclinar) un bin no cuenta: ruido de sala. */
  gateDb:number;
  /** Ganancia adaptativa: el pico móvil cae hacia `peakFloorDb` con constante `peakDecay` (s). */
  peakFloorDb:number; peakDecay:number;
  /** Constantes de tiempo (s) de subida y caída de cada barra. */
  attack:number; release:number;
}
export const VOICE_TUNING:VoiceTuning={
  fftSize:2048,smoothingTimeConstant:0.5,minDecibels:-95,maxDecibels:-20,
  fMin:90,fMax:7000,tiltDbPerOct:3,tiltFromHz:500,
  gateDb:-68,peakFloorDb:-55,peakDecay:3,attack:0.035,release:0.22
};
export interface BandEdges {sampleRate:number; fftSize:number; count:number; bins:Float64Array; freqs:Float64Array}
/** `count + 1` bordes en escala logarítmica entre `fMin` y `fMax`, en Hz y en posición (fraccionaria) de bin. */
export function bandEdges(sampleRate:number,fftSize:number,count:number,fMin:number,fMax:number):BandEdges{
  const n=Math.max(1,Math.floor(count));
  const lo=Math.max(1,fMin),hi=Math.max(lo*1.01,Math.min(fMax,sampleRate/2));
  const bins=new Float64Array(n+1),freqs=new Float64Array(n+1);
  const binHz=sampleRate/fftSize;
  for(let i=0;i<=n;i++){freqs[i]=lo*Math.pow(hi/lo,i/n);bins[i]=freqs[i]/binHz;}
  return {sampleRate,fftSize,count:n,bins,freqs};
}
const valueOf=(v:number,min:number)=>Number.isFinite(v)?v:min;
/** Nivel por banda en dB (máximo de sus bins). La compuerta actúa sobre el nivel medido y la inclinación solo realza lo que la pasa. */
function bandDb(db:ArrayLike<number>,edges:BandEdges,t:VoiceTuning,out:Float64Array){
  const last=db.length-1,binHz=edges.sampleRate/edges.fftSize;
  for(let b=0;b<edges.count;b++){
    const first=Math.min(last,Math.max(0,Math.floor(edges.bins[b])));
    const end=Math.min(last,Math.max(first,Math.ceil(edges.bins[b+1])-1));
    let m=-Infinity;
    for(let k=first;k<=end;k++){
      const f=Math.max(k,0.5)*binHz;
      const tilt=f>t.tiltFromHz?t.tiltDbPerOct*Math.log2(f/t.tiltFromHz):0;
      const raw=valueOf(db[k],t.minDecibels);
      const v=raw<=t.gateDb?t.gateDb:raw+tilt;
      if(v>m)m=v;
    }
    out[b]=m===-Infinity?t.gateDb:m;
  }
  return out;
}
const toLevel=(w:number,gate:number,peak:number)=>w<=gate?0:Math.min(1,Math.max(0,(w-gate)/Math.max(1e-6,peak-gate)));
/** Niveles 0..1 por banda para un espectro dado; `peakDb` es la referencia de 1 (por defecto el suelo de ganancia). */
export function bandLevels(db:ArrayLike<number>,edges:BandEdges,tuning:VoiceTuning=VOICE_TUNING,peakDb:number=tuning.peakFloorDb):Float64Array{
  const w=bandDb(db,edges,tuning,new Float64Array(edges.count));
  const peak=Math.max(peakDb,tuning.gateDb+1);
  for(let b=0;b<w.length;b++)w[b]=toLevel(w[b],tuning.gateDb,peak);
  return w;
}
export interface VoiceSpectrum {readonly levels:Float64Array; update(db:ArrayLike<number>,dt:number):Float64Array; reset():void}
/** Espectro con estado: ganancia adaptativa y suavizado (ataque rápido, caída lenta) independientes del ritmo de frames. */
export function createVoiceSpectrum(count:number,tuning:VoiceTuning=VOICE_TUNING,sampleRate=48000):VoiceSpectrum{
  const edges=bandEdges(sampleRate,tuning.fftSize,count,tuning.fMin,tuning.fMax);
  const levels=new Float64Array(edges.count),w=new Float64Array(edges.count);
  let peak=tuning.peakFloorDb;
  const coef=(dt:number,tau:number)=>tau<=0?1:1-Math.exp(-dt/tau);
  return {
    levels,
    update(db,dt){
      const step=Number.isFinite(dt)&&dt>0?Math.min(dt,1):0;
      bandDb(db,edges,tuning,w);
      let frameMax=-Infinity;
      for(let b=0;b<w.length;b++)if(w[b]>frameMax)frameMax=w[b];
      peak=tuning.peakFloorDb+(peak-tuning.peakFloorDb)*(1-coef(step,tuning.peakDecay));
      if(frameMax>peak)peak=frameMax;
      const ref=Math.max(peak,tuning.gateDb+1);
      for(let b=0;b<levels.length;b++){
        const target=toLevel(w[b],tuning.gateDb,ref);
        const tau=target>levels[b]?tuning.attack:tuning.release;
        levels[b]+=(target-levels[b])*coef(step,tau);
      }
      return levels;
    },
    reset(){levels.fill(0);peak=tuning.peakFloorDb;}
  };
}
