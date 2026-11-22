import {Component, DestroyRef, ElementRef, afterNextRender, inject, input, signal, viewChild} from '@angular/core';
import {PALETTE, advance, createField, emitBurst, liveCount, needsFrame, renderState, resizeField, ringState, setAmbient, setReduced, spriteKey} from './particles-engine';
import type {BurstKind, Sprite} from './particles-engine';

// La lógica (pool, emisión, vida, topes) vive en `particles-engine.ts`, pura y probada en Node.
export * from './particles-engine';

const SPRITE_PX=64;
const MAX_DPR=2;

/** Sprite precalculado: punto con halo o chispa de cuatro puntas con halo. Se dibuja una vez y luego solo se estampa. */
function makeSprite(sprite:Sprite,color:string):HTMLCanvasElement{
  const c=document.createElement('canvas');c.width=c.height=SPRITE_PX;
  const g=c.getContext('2d')!,m=SPRITE_PX/2;
  const halo=g.createRadialGradient(m,m,0,m,m,m);
  halo.addColorStop(0,color);halo.addColorStop(.18,color);
  halo.addColorStop(.42,color+'55');halo.addColorStop(1,color+'00');
  g.fillStyle=halo;g.fillRect(0,0,SPRITE_PX,SPRITE_PX);
  if(sprite==='spark'){
    g.fillStyle=color;g.beginPath();
    const long=m*.95,short=m*.12;
    g.moveTo(m,m-long);g.lineTo(m+short,m-short);g.lineTo(m+long,m);g.lineTo(m+short,m+short);
    g.lineTo(m,m+long);g.lineTo(m-short,m+short);g.lineTo(m-long,m);g.lineTo(m-short,m-short);g.closePath();g.fill();
  }
  return c;
}

/**
 * Capa de partículas. Va como hijo absoluto de `.preview-frame` (encima del lector, debajo de cintas y panel).
 * `burst` recibe un `DOMRect` en coordenadas de ventana; `ambient` enciende el polvo del haz de luz.
 */
@Component({
  selector:'v-particles',
  standalone:true,
  template:`<canvas #layer aria-hidden="true"></canvas>`,
  host:{'[attr.data-live]':'live()','aria-hidden':'true'},
  styles:`:host{position:absolute;inset:0;display:block;pointer-events:none;contain:strict}canvas{display:block;width:100%;height:100%}`
})
export class ParticlesComponent {
  theme=input<'day'|'night'>('day');
  live=signal(0);
  private layer=viewChild.required<ElementRef<HTMLCanvasElement>>('layer');
  private host=inject<ElementRef<HTMLElement>>(ElementRef);
  private field=createField();
  private sprites=new Map<string,HTMLCanvasElement>();
  private ctx:CanvasRenderingContext2D|null=null;
  private dpr=1;
  private raf=0;
  private last=0;
  private ready=false;

  constructor(){
    const destroyRef=inject(DestroyRef);
    afterNextRender(()=>{
      const canvas=this.layer().nativeElement;
      this.ctx=canvas.getContext('2d');
      const motion=matchMedia('(prefers-reduced-motion: reduce)');
      setReduced(this.field,motion.matches);
      const onMotion=()=>{setReduced(this.field,motion.matches);this.draw();this.live.set(liveCount(this.field));if(!motion.matches)this.kick();};
      const onVisibility=()=>{if(document.hidden)this.halt();else this.kick();};
      const observer=new ResizeObserver(()=>this.resize());
      motion.addEventListener('change',onMotion);
      document.addEventListener('visibilitychange',onVisibility);
      observer.observe(this.host.nativeElement);
      this.ready=true;
      this.resize();
      destroyRef.onDestroy(()=>{this.halt();observer.disconnect();motion.removeEventListener('change',onMotion);document.removeEventListener('visibilitychange',onVisibility);});
    });
  }

  /** Estallido sobre un rectángulo (coordenadas de ventana, p. ej. `getBoundingClientRect()` de un versículo). */
  burst(kind:BurstKind,rect:DOMRect){
    if(!this.ready||this.field.reduced)return;
    const origin=this.host.nativeElement.getBoundingClientRect();
    const added=emitBurst(this.field,kind,{left:rect.left-origin.left,top:rect.top-origin.top,width:rect.width,height:rect.height});
    if(added||this.field.rings.length)this.kick();
  }

  /** Polvo en el haz de luz: se enciende, y al apagar se desvanece en 600 ms. */
  ambient(on:boolean){
    if(!this.ready)return;
    setAmbient(this.field,on);
    this.kick();
  }

  private resize(){
    const el=this.host.nativeElement,canvas=this.layer().nativeElement;
    const w=el.clientWidth,h=el.clientHeight;
    this.dpr=Math.min(window.devicePixelRatio||1,MAX_DPR);
    canvas.width=Math.max(1,Math.round(w*this.dpr));canvas.height=Math.max(1,Math.round(h*this.dpr));
    resizeField(this.field,w,h);
    this.draw();
  }

  private kick(){
    if(this.raf||document.hidden||!needsFrame(this.field))return;
    this.last=0;
    this.raf=requestAnimationFrame(t=>this.frame(t));
  }
  private halt(){if(this.raf)cancelAnimationFrame(this.raf);this.raf=0;}

  private frame(now:number){
    this.raf=0;
    const dt=this.last?now-this.last:16;this.last=now;
    const live=advance(this.field,dt);
    this.draw();
    if(live!==this.live())this.live.set(live);
    if(needsFrame(this.field)&&!document.hidden)this.raf=requestAnimationFrame(t=>this.frame(t));
    else this.last=0;
  }

  private sprite(kind:Sprite,color:string){
    const key=spriteKey(kind,color);
    let s=this.sprites.get(key);
    if(!s){s=makeSprite(kind,color);this.sprites.set(key,s);}
    return s;
  }

  private draw(){
    const ctx=this.ctx;if(!ctx)return;
    const f=this.field,pal=PALETTE[this.theme()];
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    if(f.reduced)return;
    ctx.setTransform(this.dpr,0,0,this.dpr,0,0);
    ctx.globalCompositeOperation=pal.composite;
    for(const r of f.rings){
      const s=ringState(r);
      ctx.globalAlpha=s.alpha;ctx.strokeStyle=pal.tones.gold;ctx.lineWidth=s.width;
      ctx.beginPath();ctx.arc(r.x,r.y,s.radius,0,Math.PI*2);ctx.stroke();
    }
    for(const p of f.particles){
      const s=renderState(p,f.ambientLevel);
      if(s.alpha<=.005)continue;
      const side=s.size*(p.sprite==='spark'?5:4);
      ctx.globalAlpha=Math.min(1,s.alpha);
      ctx.drawImage(this.sprite(p.sprite,pal.tones[p.tone]),p.x-side/2,p.y-side/2,side,side);
    }
    ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  }
}
