/**
 * Línea de tiempo de la portada (pura, sin DOM): qué cambia y cuándo, dada la duración D.
 * Contrato: luz 0–0,9 s · título desde 0,4 s · sostén · últimos 0,9 s «inundación» (la luz se expande,
 * título y rótulo se elevan, la página aparece). Al llegar a D empieza la lectura; la luz termina de apagarse después.
 */
export type IntroLumen='off'|'rise'|'hold'|'flood';
export type IntroCard='in'|'out';

/** Vista de la portada: lo que pintan `v-lumen`, `v-title-card` y el velo de papel. */
export interface IntroView{lumen:IntroLumen;card:IntroCard;veil:boolean}
export interface IntroStep{at:number;view?:Partial<IntroView>;ambient?:boolean;done?:boolean;end?:boolean}

export const INTRO_START:IntroView={lumen:'off',card:'in',veil:true};
/** Tiempo para que el primer fotograma se pinte con la luz apagada antes de abrirla (así transiciona). */
export const INTRO_LEAD_MS=60;
export const INTRO_RISE_MS=900;
export const INTRO_FLOOD_MS=900;
/** Atraso del velo respecto al inicio de la inundación: la luz crece primero y la página emerge dentro de ella. */
export const INTRO_VEIL_DELAY_MS=150;
/** La luz se apaga 350 ms antes del final; su transición de salida (600 ms) acaba tras el inicio de la lectura. */
export const INTRO_LIGHT_OFF_BEFORE_MS=350;
/** Tiempo tras D en que se retira la portada del DOM (deja acabar la salida de la luz). */
export const INTRO_TAIL_MS=700;

export function introSteps(durationSeconds:number,reduced:boolean):IntroStep[]{
  const d=Math.round(durationSeconds*1000),flood=d-INTRO_FLOOD_MS;
  const steps:IntroStep[]=[{at:INTRO_LEAD_MS,view:{lumen:reduced?'hold':'rise'},ambient:true}];
  if(!reduced)steps.push({at:INTRO_LEAD_MS+INTRO_RISE_MS,view:{lumen:'hold'}});
  steps.push(
    reduced?{at:flood,view:{card:'out',veil:false},ambient:false}:{at:flood,view:{card:'out',lumen:'flood'},ambient:false},
    ...(reduced?[]:[{at:flood+INTRO_VEIL_DELAY_MS,view:{veil:false}} as IntroStep]),
    {at:d-INTRO_LIGHT_OFF_BEFORE_MS,view:{lumen:'off'}},
    {at:d,done:true},
    {at:d+INTRO_TAIL_MS,end:true}
  );
  return steps.sort((a,b)=>a.at-b.at);
}
