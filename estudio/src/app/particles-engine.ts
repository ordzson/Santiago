// Motor de partículas puro: sin DOM, sin Angular, sin temporizadores. Los tiempos llegan en ms y el azar se inyecta.
// El componente `v-particles` (particles.ts) lo dibuja sobre un <canvas>. Vive aparte para poder probarse en Node.
export const MAX_PARTICLES=500;
export const MAX_DT_MS=64;
export const AMBIENT_PHONE=70;
export const AMBIENT_DESKTOP=120;
export const AMBIENT_FADE_MS=600;
export const PHONE_MAX_WIDTH=600;
export const RING_MS=700;

export type BurstKind='lit'|'paint'|'word'|'special';
export type Theme='day'|'night';
export type Tone='amber'|'deep'|'gold'|'carmine';
export type Sprite='dot'|'spark';
export type Rnd=()=>number;
/** Rectángulo en coordenadas locales del canvas (px CSS). */
export interface Box {left:number; top:number; width:number; height:number}

export interface Particle {
  x:number; y:number;
  /** Velocidad en px/s. */
  vx:number; vy:number;
  /** Rozamiento por segundo (la velocidad decae como e^(-drag·t)) y empuje vertical en px/s² (negativo = sube). */
  drag:number; lift:number;
  age:number; life:number;
  size:number; tone:Tone; sprite:Sprite;
  /** Alfa máximo. */
  alpha:number;
  ambient:boolean;
  phase:number; rate:number;
}
export interface Ring {x:number; y:number; age:number; life:number; maxR:number}
export interface Field {
  particles:Particle[];
  rings:Ring[];
  width:number; height:number;
  phone:boolean;
  reduced:boolean;
  ambientOn:boolean;
  /** 0–1: presencia del polvo ambiental (entra al encender, se desvanece 600 ms al apagar). */
  ambientLevel:number;
}

export const clampDt=(ms:number)=>!(ms>0)?0:Math.min(ms,MAX_DT_MS);
export const isPhoneWidth=(width:number)=>width<PHONE_MAX_WIDTH;
export const ambientTarget=(phone:boolean)=>phone?AMBIENT_PHONE:AMBIENT_DESKTOP;

export function createField(opts:{width?:number;height?:number;reduced?:boolean}={}):Field{
  const width=opts.width??0;
  return {particles:[],rings:[],width,height:opts.height??0,phone:isPhoneWidth(width),reduced:opts.reduced??false,ambientOn:false,ambientLevel:0};
}
export function resizeField(field:Field,width:number,height:number){field.width=width;field.height=height;field.phone=isPhoneWidth(width);}
export function setReduced(field:Field,reduced:boolean){field.reduced=reduced;if(reduced)clearField(field);}
export function clearField(field:Field){field.particles.length=0;field.rings.length=0;field.ambientOn=false;field.ambientLevel=0;}

/** Colores por tema: día `source-over`, noche `lighter`. */
export const PALETTE:Record<Theme,{composite:'source-over'|'lighter'; tones:Record<Tone,string>}>={
  day:{composite:'source-over',tones:{amber:'#c9962e',gold:'#e0b54a',deep:'#a8741f',carmine:'#b92d40'}},
  night:{composite:'lighter',tones:{amber:'#f3b54a',gold:'#ffd27a',deep:'#f3b54a',carmine:'#e17581'}}
};
export const spriteKey=(sprite:Sprite,color:string)=>`${sprite}:${color}`;

const range=(rnd:Rnd,a:number,b:number)=>a+(b-a)*rnd();
const int=(rnd:Rnd,a:number,b:number)=>a+Math.floor(rnd()*(b-a+1));
const pick=<T>(rnd:Rnd,items:readonly T[])=>items[Math.min(items.length-1,Math.floor(rnd()*items.length))];

/** Conteo contratado por tipo. `accent` son las motas carmín del versículo elegido. */
export function burstCount(kind:BurstKind,rnd:Rnd):{main:number;accent:number}{
  switch(kind){
    case 'lit': return {main:int(rnd,28,40),accent:0};
    case 'paint': return {main:int(rnd,9,11),accent:0};
    case 'word': return {main:int(rnd,10,14),accent:0};
    case 'special': return {main:int(rnd,60,80),accent:int(rnd,6,8)};
  }
}

/** Envolvente de alfa: entrada rápida (≈12 % de la vida) y salida suave en el último 45 %. */
export function envelope(age:number,life:number){
  if(!(life>0)||age<=0||age>=life)return 0;
  const t=Math.min(1,age/life);
  const inn=Math.min(1,t/.12);
  const out=t<.55?1:1-(t-.55)/.45;
  return Math.max(0,inn*inn*(3-2*inn))*Math.max(0,out*out*(3-2*out));
}
export const easeOutExpo=(t:number)=>t>=1?1:1-Math.pow(2,-10*t);

/** Alfa y tamaño de dibujo de una partícula en este instante. */
export function renderState(p:Particle,level:number){
  if(p.ambient){
    const tw=.55+.45*Math.sin(p.phase+p.age*p.rate/1000);
    const fadeIn=Math.min(1,p.age/1200);
    return {alpha:p.alpha*tw*fadeIn*level,size:p.size};
  }
  const e=envelope(p.age,p.life);
  return {alpha:p.alpha*e,size:p.size*(.55+.45*Math.min(1,e*1.4))};
}

function spawnOnEdge(rnd:Rnd,r:Box){
  // Sesgo al borde superior: 55 % arriba, 15 % por cada lado y por abajo.
  const roll=rnd();
  if(roll<.55)return {x:r.left+rnd()*r.width,y:r.top,edge:'top' as const};
  if(roll<.70)return {x:r.left+rnd()*r.width,y:r.top+r.height,edge:'bottom' as const};
  if(roll<.85)return {x:r.left,y:r.top+rnd()*r.height,edge:'left' as const};
  return {x:r.left+r.width,y:r.top+rnd()*r.height,edge:'right' as const};
}

function mote(rnd:Rnd,r:Box,o:{vy:[number,number];life:[number,number];size:[number,number];tones:readonly Tone[]}):Particle{
  const s=spawnOnEdge(rnd,r);
  const side=s.edge==='left'?-1:s.edge==='right'?1:0;
  return {
    x:s.x,y:s.y,
    vx:side*range(rnd,6,22)+range(rnd,-14,14),
    vy:-range(rnd,o.vy[0],o.vy[1])+(s.edge==='bottom'?range(rnd,0,14):0),
    drag:.9,lift:-10,
    age:0,life:range(rnd,o.life[0],o.life[1]),
    size:range(rnd,o.size[0],o.size[1]),tone:pick(rnd,o.tones),sprite:'dot',
    alpha:range(rnd,.7,1),ambient:false,phase:0,rate:0
  };
}
function spark(rnd:Rnd,r:Box):Particle{
  const a=rnd()*Math.PI*2,sp=range(rnd,40,110);
  return {
    x:r.left+rnd()*r.width,y:r.top+rnd()*r.height,
    vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-18,
    drag:3.2,lift:0,
    age:0,life:600,size:range(rnd,3,5),tone:pick(rnd,['gold','amber'] as const),sprite:'spark',
    alpha:range(rnd,.8,1),ambient:false,phase:0,rate:0
  };
}
function radial(rnd:Rnd,r:Box,tone:Tone,sprite:Sprite):Particle{
  const cx=r.left+r.width/2,cy=r.top+r.height/2;
  const a=rnd()*Math.PI*2,sp=range(rnd,120,280);
  // Nace dentro del rectángulo (elipse interior) para que la salida se lea como un estallido del versículo.
  const ex=Math.cos(a)*r.width*.4*rnd(),ey=Math.sin(a)*r.height*.4*rnd();
  return {
    x:cx+ex,y:cy+ey,
    vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,
    drag:2.4,lift:-22,
    age:0,life:range(rnd,1600,2200),size:range(rnd,2,5),tone,sprite,
    alpha:range(rnd,.75,1),ambient:false,phase:0,rate:0
  };
}

/**
 * Emite un estallido sobre `rect`. Devuelve cuántas partículas entraron al pool (0 con movimiento reducido o sin hueco).
 * Respeta el tope global de 500 partículas vivas.
 */
export function emitBurst(field:Field,kind:BurstKind,rect:Box,rnd:Rnd=Math.random):number{
  if(field.reduced)return 0;
  const {main,accent}=burstCount(kind,rnd);
  const room=Math.max(0,MAX_PARTICLES-field.particles.length);
  const fresh:Particle[]=[];
  const push=(p:Particle)=>{if(fresh.length<room)fresh.push(p);};
  for(let i=0;i<main;i++){
    if(kind==='lit')push(mote(rnd,rect,{vy:[22,64],life:[900,1400],size:[2,5],tones:['amber','amber','deep']}));
    else if(kind==='paint')push(mote(rnd,rect,{vy:[18,48],life:[800,1200],size:[2,4],tones:['amber','gold']}));
    else if(kind==='word')push(spark(rnd,rect));
    else push(radial(rnd,rect,pick(rnd,['gold','gold','amber'] as const),i%5===0?'spark':'dot'));
  }
  for(let i=0;i<accent;i++)push(radial(rnd,rect,'carmine','dot'));
  for(const p of fresh)field.particles.push(p);
  if(kind==='special'){
    field.rings.push({x:rect.left+rect.width/2,y:rect.top+rect.height/2,age:0,life:RING_MS,maxR:Math.max(rect.width,rect.height)*.5+48});
  }
  return fresh.length;
}

/** Enciende o apaga el polvo ambiental. Con movimiento reducido no hace nada (no dibuja). */
export function setAmbient(field:Field,on:boolean){
  if(field.reduced){field.ambientOn=false;return;}
  field.ambientOn=on;
}

/** Mota de polvo dentro del haz: un cono centrado arriba que se ensancha hacia abajo. */
export function dustMote(field:Field,rnd:Rnd,anywhere:boolean):Particle{
  const w=Math.max(1,field.width),h=Math.max(1,field.height);
  const y=anywhere?rnd()*h:-4;
  const spread=.22+.55*Math.min(1,Math.max(0,y)/h);
  const x=w*(.5+(rnd()-.5)*spread*2*.9);
  return {
    x,y,vx:range(rnd,-5,5),vy:range(rnd,4,13),
    drag:0,lift:0,age:anywhere?range(rnd,0,4000):0,life:Infinity,
    size:range(rnd,1.2,3.2),tone:pick(rnd,['gold','amber'] as const),sprite:'dot',
    alpha:range(rnd,.35,.8),ambient:true,phase:rnd()*Math.PI*2,rate:range(rnd,1.2,3.4)
  };
}

/** Número de partículas vivas (lo que expone `data-live`). */
export const liveCount=(field:Field)=>field.particles.length;
/** El bucle de animación solo corre mientras haya vida o ambiente. */
export const needsFrame=(field:Field)=>!field.reduced&&(field.particles.length>0||field.rings.length>0||field.ambientOn||field.ambientLevel>0);

/** Avanza la simulación `dtMs` (acotado a 64 ms). Muta el campo, retira lo que murió y devuelve las partículas vivas. */
export function advance(field:Field,dtMs:number,rnd:Rnd=Math.random):number{
  if(field.reduced){clearField(field);return 0;}
  const dt=clampDt(dtMs),s=dt/1000;
  // Nivel ambiental: entra en ~1,2 s y se apaga en 600 ms.
  if(field.ambientOn)field.ambientLevel=Math.min(1,field.ambientLevel+dt/1200);
  else field.ambientLevel=Math.max(0,field.ambientLevel-dt/AMBIENT_FADE_MS);
  if(!field.ambientOn&&field.ambientLevel<=0&&field.particles.some(p=>p.ambient)){
    field.particles=field.particles.filter(p=>!p.ambient);
  }
  const target=ambientTarget(field.phone);
  let dust=0;
  const alive:Particle[]=[];
  for(const p of field.particles){
    p.age+=dt;
    if(p.ambient){
      p.x+=p.vx*s;p.y+=p.vy*s;
      if(p.y>field.height+6||p.x<-6||p.x>field.width+6){
        if(!field.ambientOn){continue;}
        Object.assign(p,dustMote(field,rnd,false),{age:0});
      }
      // Al encogerse el objetivo (p. ej. del escritorio al teléfono) sobran motas: se retiran las más viejas del exceso.
      if(++dust>target&&field.ambientOn)continue;
      alive.push(p);continue;
    }
    if(p.age>=p.life)continue;
    const k=Math.exp(-p.drag*s);
    p.vx*=k;p.vy=p.vy*k+p.lift*s;
    p.x+=p.vx*s;p.y+=p.vy*s;
    alive.push(p);
  }
  field.particles=alive;
  if(field.ambientOn){
    // Rellena de forma escalonada (≤ 6 por frame) hasta el objetivo, sin pasar del tope.
    let missing=Math.min(6,target-dust,MAX_PARTICLES-field.particles.length);
    while(missing-->0)field.particles.push(dustMote(field,rnd,true));
  }
  const rings:Ring[]=[];
  for(const r of field.rings){r.age+=dt;if(r.age<r.life)rings.push(r);}
  field.rings=rings;
  return field.particles.length;
}

/** Geometría del anillo dorado: radio, alfa y grosor en el instante `age`. */
export function ringState(r:Ring){
  const t=Math.min(1,r.age/r.life);
  return {radius:r.maxR*easeOutExpo(t),alpha:.85*Math.pow(1-t,1.5),width:.6+2*(1-t)};
}
