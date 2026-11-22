// Máquina de pulsación pura: sin DOM, sin temporizadores, sin Angular. Los tiempos llegan como `t` (ms).
export const LIT_MS=2000;
export const SPECIAL_MS=4000;
export const SLOP_PX=10;
export const CHARGE_DELAY_MS=350;
export const EDGE_PX=64;

export type PressPhase='idle'|'pressing'|'lit'|'painting'|'special'|'cancelled';
export type BurstKind='lit'|'paint'|'special';
export type HapticKind='lit'|'special';
export type PressEffect=
  | {type:'charge'; verse:number; stage:1|2; level:number}
  | {type:'setLit'; verse:number; on:boolean}
  | {type:'toggleSpecial'; verse:number}
  | {type:'paint'; verse:number; on:boolean}
  | {type:'swallowClick'}
  | {type:'burst'; verse:number; kind:BurstKind}
  | {type:'haptic'; kind:HapticKind}
  | {type:'cancel'};
export interface PressState {
  phase:PressPhase;
  verse:number;
  x:number; y:number; t:number;
  /** Estado de resaltado y de elegido del versículo al empezar la pulsación. */
  wasLit:boolean; wasSpecial:boolean;
  /** Modo de pintura: true = resaltar, false = quitar. Fijado a los 2 s. */
  mode:boolean;
  /** Versículos ya tratados en esta pulsación (el de origen cuenta). */
  painted:readonly number[];
}
export interface PressResult {state:PressState; effects:PressEffect[]}
export interface DownInput {verse:number; x:number; y:number; t:number; lit:boolean; special:boolean}
export interface MoveInput {x:number; y:number; t:number; verseUnder:number|null}

export const IDLE:PressState={phase:'idle',verse:-1,x:0,y:0,t:0,wasLit:false,wasSpecial:false,mode:false,painted:[]};
const clamp01=(v:number)=>Math.min(1,Math.max(0,v));
const result=(state:PressState,effects:PressEffect[]=[]):PressResult=>({state,effects});

export function pressDown(_state:PressState,input:DownInput):PressResult{
  return result({phase:'pressing',verse:input.verse,x:input.x,y:input.y,t:input.t,wasLit:input.lit,wasSpecial:input.special,mode:false,painted:[]});
}

export function pressTick(state:PressState,t:number):PressResult{
  const elapsed=t-state.t;
  if(state.phase==='pressing'){
    if(elapsed<CHARGE_DELAY_MS)return result(state);
    if(elapsed<LIT_MS)return result(state,[{type:'charge',verse:state.verse,stage:1,level:clamp01((elapsed-CHARGE_DELAY_MS)/(LIT_MS-CHARGE_DELAY_MS))}]);
    // Cruza los 2 s: alterna el resaltado y fija el modo de pintura.
    const on=!state.wasLit;
    const next:PressState={...state,phase:'lit',mode:on,painted:[state.verse]};
    const effects:PressEffect[]=[
      {type:'setLit',verse:state.verse,on},
      {type:'burst',verse:state.verse,kind:'lit'},
      {type:'haptic',kind:'lit'},
    ];
    const rest=pressTick(next,t); // por si el tick llega ya pasados los 4 s
    return result(rest.state,[...effects,...rest.effects]);
  }
  if(state.phase==='lit'){
    if(elapsed<SPECIAL_MS)return result(state,[{type:'charge',verse:state.verse,stage:2,level:clamp01((elapsed-LIT_MS)/(SPECIAL_MS-LIT_MS))}]);
    // Cruza los 4 s: alterna elegido y el resaltado vuelve al estado previo a la pulsación.
    return result({...state,phase:'special'},[
      {type:'toggleSpecial',verse:state.verse},
      {type:'setLit',verse:state.verse,on:state.wasLit},
      {type:'burst',verse:state.verse,kind:'special'},
      {type:'haptic',kind:'special'},
    ]);
  }
  return result(state);
}

export function pressMove(state:PressState,input:MoveInput):PressResult{
  if(state.phase==='idle'||state.phase==='cancelled'||state.phase==='special')return result(state);
  const ticked=pressTick(state,input.t);
  const s=ticked.state;
  const effects=[...ticked.effects];
  const moved=Math.hypot(input.x-s.x,input.y-s.y)>SLOP_PX;
  if(s.phase==='pressing'){
    if(!moved)return result(s,effects);
    return result({...s,phase:'cancelled'},[{type:'cancel'}]); // antes de 2 s: es scroll nativo
  }
  if(s.phase==='lit'){
    if(!moved)return result(s,effects);
    // Arrastre tras 2 s: empieza a pintar y se anula el paso a 4 s.
    effects.push({type:'charge',verse:s.verse,stage:2,level:0});
    return paintUnder({...s,phase:'painting'},input.verseUnder,effects);
  }
  if(s.phase==='painting')return paintUnder(s,input.verseUnder,effects);
  return result(s,effects);
}

function paintUnder(state:PressState,verse:number|null,effects:PressEffect[]):PressResult{
  if(verse===null||state.painted.includes(verse))return result(state,effects);
  return result({...state,painted:[...state.painted,verse]},[...effects,{type:'paint',verse,on:state.mode},{type:'burst',verse,kind:'paint'}]);
}

export function pressUp(state:PressState,t:number):PressResult{
  if(state.phase==='idle')return result(state);
  const ticked=pressTick(state,t);
  const s=ticked.state;
  const effects=ticked.effects.filter(e=>e.type!=='charge'); // al soltar no queda carga que animar
  // Soltar tras 2 s se traga el click siguiente; antes de 2 s no hay efectos de marca.
  if(s.phase==='lit'||s.phase==='painting'||s.phase==='special')effects.push({type:'swallowClick'});
  return result(IDLE,effects);
}

/** `pointercancel`: el navegador se queda con el gesto. Termina sin efectos de marca. */
export function pressCancel(state:PressState):PressResult{
  return result(IDLE,state.phase==='pressing'||state.phase==='lit'?[{type:'cancel'}]:[]);
}
