import {AfterViewInit, Component, ElementRef, OnDestroy, effect, input, untracked, viewChild} from '@angular/core';
import {VOICE_TUNING, VoiceSpectrum, createVoiceSpectrum} from './voice-spectrum';
/** Ancho y hueco (px CSS) de cada barra. */
const BAR=3,GAP=3,DOT=2;
/**
 * Espectro de voz simétrico al pie de la página: graves en el centro, agudos hacia los lados, barras que
 * crecen arriba y abajo de una línea base. Solo anima mientras `active` y la pestaña está visible; si no, dibuja la línea de reposo.
 */
@Component({selector:'v-voice-meter',standalone:true,template:`<canvas #canvas aria-hidden="true"></canvas>`,
  styles:`:host{display:block;flex:1;min-width:0;height:28px}canvas{display:block;width:100%;height:100%}`})
export class VoiceMeterComponent implements AfterViewInit, OnDestroy {
  analyser=input<AnalyserNode|null>(null); sampleRate=input(48000);
  /** Escena en lectura con la voz encendida y el analizador listo. */
  active=input(false); night=input(false);
  private canvas=viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private observer?:ResizeObserver; private raf=0; private prev=0; private ready=false;
  private cssW=0; private cssH=0; private pairs=0;
  private spectrum:VoiceSpectrum|null=null; private spectrumKey='';
  private data:Float32Array<ArrayBuffer>|null=null;
  private colors={bar:'#c7364b',rest:'#675d52'}; private colorsAt=0;
  private readonly onVisibility=()=>this.sync();
  constructor(){
    effect(()=>{this.active();this.analyser();this.night();untracked(()=>{if(this.ready){this.colorsAt=0;this.sync();}});});
  }
  ngAfterViewInit(){
    this.ready=true;
    this.observer=new ResizeObserver(()=>{this.measure();this.sync();});
    this.observer.observe(this.canvas().nativeElement);
    document.addEventListener('visibilitychange',this.onVisibility);
    this.measure();this.sync();
  }
  ngOnDestroy(){
    this.ready=false;cancelAnimationFrame(this.raf);this.raf=0;
    this.observer?.disconnect();document.removeEventListener('visibilitychange',this.onVisibility);
  }
  private get running(){return this.active()&&!!this.analyser()&&!document.hidden;}
  /** Arranca o detiene el bucle según el estado actual; en reposo pinta una vez la línea de puntos. */
  private sync(){
    if(!this.ready)return;
    if(this.running){
      if(!this.raf){this.prev=0;this.raf=requestAnimationFrame(this.tick);}
      return;
    }
    cancelAnimationFrame(this.raf);this.raf=0;this.spectrum?.reset();
    this.draw(null);
  }
  private measure(){
    const el=this.canvas().nativeElement;
    const w=Math.max(0,Math.floor(el.clientWidth)),h=Math.max(0,Math.floor(el.clientHeight));
    const dpr=window.devicePixelRatio||1;
    if(w!==this.cssW||h!==this.cssH||el.width!==Math.round(w*dpr)){
      this.cssW=w;this.cssH=h;el.width=Math.round(w*dpr);el.height=Math.round(h*dpr);
    }
    this.pairs=Math.max(0,Math.floor((w+GAP)/(BAR+GAP)/2));
    this.spectrumKey='';
  }
  private readColors(now:number){
    if(now-this.colorsAt<400&&this.colorsAt)return;
    this.colorsAt=now||1;
    const cs=getComputedStyle(this.canvas().nativeElement);
    this.colors={bar:cs.getPropertyValue('--mark-red').trim()||this.colors.bar,rest:cs.getPropertyValue('--page-muted').trim()||this.colors.rest};
  }
  private readonly tick=(time:number)=>{
    this.raf=0;
    if(!this.running){this.sync();return;}
    const an=this.analyser()!;
    const dt=this.prev?Math.min((time-this.prev)/1000,0.1):0;this.prev=time;
    const key=`${this.pairs}|${an.frequencyBinCount}|${this.sampleRate()}`;
    if(!this.spectrum||key!==this.spectrumKey){
      this.spectrum=createVoiceSpectrum(Math.max(1,this.pairs),VOICE_TUNING,this.sampleRate());this.spectrumKey=key;
      this.data=new Float32Array(an.frequencyBinCount);
    }
    if(this.data){an.getFloatFrequencyData(this.data);this.spectrum.update(this.data,dt);}
    this.draw(this.spectrum.levels);
    this.raf=requestAnimationFrame(this.tick);
  };
  /** `levels` nulo: línea de reposo (puntos de 2 px). Las barras se ordenan del centro hacia los lados por frecuencia creciente. */
  private draw(levels:Float64Array|null){
    const el=this.canvas().nativeElement;const ctx=el.getContext('2d');if(!ctx)return;
    const dpr=el.width/Math.max(1,this.cssW)||1;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,this.cssW,this.cssH);
    const pairs=this.pairs;if(!pairs)return;
    this.readColors(performance.now());
    const mid=this.cssH/2,maxHalf=Math.max(DOT/2,mid-1);
    const cx=this.cssW/2,pitch=BAR+GAP;
    const pair=(i:number,level:number)=>{
      const half=level>0.02?Math.max(DOT/2,level*maxHalf):DOT/2;
      const lit=half>DOT/2;
      ctx.fillStyle=lit?this.colors.bar:this.colors.rest;
      ctx.globalAlpha=lit?1:0.45;
      const w=lit?BAR:DOT,off=(BAR-w)/2;
      const dx=(i+0.5)*pitch;
      ctx.beginPath();
      for(const x of [cx-dx-BAR/2+off,cx+dx-BAR/2+off]){
        if(lit&&ctx.roundRect)ctx.roundRect(x,mid-half,w,half*2,w/2);else ctx.rect(x,mid-half,w,half*2);
      }
      ctx.fill();
    };
    for(let i=0;i<pairs;i++)pair(i,levels?levels[i]??0:0);
    ctx.globalAlpha=1;
  }
}
