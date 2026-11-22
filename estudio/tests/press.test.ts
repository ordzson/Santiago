import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CHARGE_DELAY_MS,EDGE_PX,IDLE,LIT_MS,SLOP_PX,SPECIAL_MS,pressCancel,pressDown,pressMove,pressTick,pressUp} from '../src/app/press.ts';
import type {PressEffect,PressState} from '../src/app/press.ts';

const down=(lit=false,special=false,verse=3):PressState=>pressDown(IDLE,{verse,x:100,y:200,t:1000,lit,special}).state;
const at=(ms:number)=>1000+ms;
const types=(effects:PressEffect[])=>effects.map(e=>e.type);
const find=<T extends PressEffect['type']>(effects:PressEffect[],type:T)=>effects.filter((e):e is Extract<PressEffect,{type:T}>=>e.type===type);

test('constantes del contrato',()=>{assert.deepEqual([LIT_MS,SPECIAL_MS,SLOP_PX,CHARGE_DELAY_MS,EDGE_PX],[1350,4000,10,350,64]);});
test('pressDown no produce efectos',()=>{const r=pressDown(IDLE,{verse:3,x:1,y:2,t:5,lit:false,special:false});assert.equal(r.state.phase,'pressing');assert.deepEqual(r.effects,[]);});
test('mover más de SLOP_PX antes de 1,35 s cancela',()=>{
  const r=pressMove(down(),{x:100,y:200+SLOP_PX+1,t:at(500),verseUnder:3});
  assert.deepEqual(r.effects,[{type:'cancel'}]);
  assert.equal(r.state.phase,'cancelled');
  // ya cancelada: ni 1,35 s ni soltar producen nada
  assert.deepEqual(pressTick(r.state,at(2500)).effects,[]);
  assert.deepEqual(pressUp(r.state,at(2600)).effects,[]);
});
test('mover dentro de SLOP_PX no cancela',()=>{
  const r=pressMove(down(),{x:100+SLOP_PX,y:200,t:at(500),verseUnder:3});
  assert.equal(r.state.phase,'pressing');assert.ok(!types(r.effects).includes('cancel'));
});
test('a los 1,35 s resalta un versículo no resaltado y fija modo añadir',()=>{
  const r=pressTick(down(false),at(LIT_MS));
  assert.deepEqual(find(r.effects,'setLit'),[{type:'setLit',verse:3,on:true}]);
  assert.deepEqual(find(r.effects,'burst'),[{type:'burst',verse:3,kind:'lit'}]);
  assert.deepEqual(find(r.effects,'haptic'),[{type:'haptic',kind:'lit'}]);
  assert.equal(r.state.phase,'lit');assert.equal(r.state.mode,true);
});
test('a los 1,35 s quita el resaltado de uno resaltado y fija modo quitar',()=>{
  const r=pressTick(down(true),at(LIT_MS));
  assert.deepEqual(find(r.effects,'setLit'),[{type:'setLit',verse:3,on:false}]);
  assert.equal(r.state.mode,false);
});
test('antes de 1,35 s no hay resaltado',()=>{assert.deepEqual(find(pressTick(down(),at(LIT_MS-1)).effects,'setLit'),[]);});
test('arrastre tras 1,35 s pinta cada versículo una sola vez con el modo fijado',()=>{
  let s=pressTick(down(false),at(LIT_MS)).state;
  const all:PressEffect[]=[];
  for(const [i,v] of [3,4,4,5,4,3,5].entries()){
    const r=pressMove(s,{x:100,y:200+SLOP_PX+5+i,t:at(LIT_MS+100+i*50),verseUnder:v});s=r.state;all.push(...r.effects);
  }
  assert.deepEqual(find(all,'paint'),[{type:'paint',verse:4,on:true},{type:'paint',verse:5,on:true}]);
  assert.equal(find(all,'burst').filter(e=>e.kind==='paint').length,2);
  assert.equal(s.phase,'painting');
});
test('el modo quitar pinta con on:false',()=>{
  let s=pressTick(down(true),at(LIT_MS)).state;
  const r=pressMove(s,{x:100,y:230,t:at(2100),verseUnder:4});
  assert.deepEqual(find(r.effects,'paint'),[{type:'paint',verse:4,on:false}]);
});
test('arrastrar sin versículo debajo no pinta',()=>{
  const s=pressTick(down(),at(LIT_MS)).state;
  const r=pressMove(s,{x:100,y:230,t:at(2100),verseUnder:null});
  assert.deepEqual(find(r.effects,'paint'),[]);assert.equal(r.state.phase,'painting');
});
test('arrastrar tras 1,35 s anula el paso a 4 s',()=>{
  const s=pressMove(pressTick(down(),at(LIT_MS)).state,{x:100,y:230,t:at(2100),verseUnder:4}).state;
  const r=pressTick(s,at(SPECIAL_MS+500));
  assert.deepEqual(r.effects,[]);
  assert.equal(pressUp(r.state,at(SPECIAL_MS+600)).effects.some(e=>e.type==='toggleSpecial'),false);
});
test('un movimiento tardío cuenta primero el cruce de 1,35 s',()=>{
  // sin tick intermedio: el move llega a los 2,5 s con desplazamiento grande
  const r=pressMove(down(),{x:100,y:260,t:at(2500),verseUnder:4});
  assert.equal(r.state.phase,'painting');
  assert.deepEqual(find(r.effects,'setLit'),[{type:'setLit',verse:3,on:true}]);
  assert.deepEqual(find(r.effects,'paint'),[{type:'paint',verse:4,on:true}]);
});
test('a los 4 s alterna elegido y restaura el resaltado previo (no resaltado)',()=>{
  const s=pressTick(down(false),at(LIT_MS)).state;
  const r=pressTick(s,at(SPECIAL_MS));
  assert.deepEqual(find(r.effects,'toggleSpecial'),[{type:'toggleSpecial',verse:3}]);
  assert.deepEqual(find(r.effects,'setLit'),[{type:'setLit',verse:3,on:false}]);
  assert.deepEqual(find(r.effects,'burst'),[{type:'burst',verse:3,kind:'special'}]);
  assert.deepEqual(find(r.effects,'haptic'),[{type:'haptic',kind:'special'}]);
  assert.equal(r.state.phase,'special');
});
test('a los 4 s restaura el resaltado previo (resaltado)',()=>{
  const s=pressTick(down(true),at(LIT_MS)).state;
  assert.deepEqual(find(pressTick(s,at(SPECIAL_MS)).effects,'setLit'),[{type:'setLit',verse:3,on:true}]);
});
test('un tick tardío (>4 s) encadena resaltar y elegir en orden',()=>{
  const r=pressTick(down(false),at(4500));
  assert.deepEqual(types(r.effects).filter(t=>t==='setLit'||t==='toggleSpecial'),['setLit','toggleSpecial','setLit']);
  assert.deepEqual(find(r.effects,'setLit').map(e=>e.on),[true,false]);
  assert.equal(r.state.phase,'special');
});
test('no repite efectos al seguir ticando',()=>{
  const s=pressTick(down(),at(SPECIAL_MS)).state;
  assert.deepEqual(pressTick(s,at(SPECIAL_MS+1000)).effects,[]);
});
test('soltar tras 1,35 s produce swallowClick; en las tres fases',()=>{
  const lit=pressTick(down(),at(LIT_MS)).state;
  assert.deepEqual(pressUp(lit,at(2500)).effects,[{type:'swallowClick'}]);
  const painting=pressMove(lit,{x:100,y:230,t:at(2100),verseUnder:4}).state;
  assert.deepEqual(pressUp(painting,at(2500)).effects,[{type:'swallowClick'}]);
  const special=pressTick(lit,at(SPECIAL_MS)).state;
  assert.deepEqual(pressUp(special,at(4500)).effects,[{type:'swallowClick'}]);
  assert.equal(pressUp(lit,at(2500)).state.phase,'idle');
});
test('soltar justo al cruzar 1,35 s resalta y traga el click',()=>{
  const r=pressUp(down(),at(LIT_MS));
  assert.deepEqual(types(r.effects).filter(t=>t==='setLit'||t==='swallowClick'),['setLit','swallowClick']);
});
test('soltar antes de 1,35 s no produce efectos de marca',()=>{
  const r=pressUp(down(),at(1300));
  assert.deepEqual(r.effects,[]);assert.equal(r.state.phase,'idle');
  assert.deepEqual(pressUp(down(),at(100)).effects,[]);
});
test('soltar sin pulsación activa no hace nada',()=>{assert.deepEqual(pressUp(IDLE,5000).effects,[]);});
test('charge.level sube de 0 a 1 entre CHARGE_DELAY_MS y 1,35 s',()=>{
  const s=down();
  assert.deepEqual(pressTick(s,at(CHARGE_DELAY_MS-1)).effects,[]);
  const level=(ms:number)=>find(pressTick(s,at(ms)).effects,'charge')[0];
  assert.deepEqual(level(CHARGE_DELAY_MS),{type:'charge',verse:3,stage:1,level:0});
  const mid=level((CHARGE_DELAY_MS+LIT_MS)/2);assert.equal(mid.stage,1);assert.ok(Math.abs(mid.level-0.5)<1e-9);
  const late=level(LIT_MS-1);assert.ok(late.level>0.99&&late.level<1);
  let prev=-1;for(let ms=CHARGE_DELAY_MS;ms<LIT_MS;ms+=50){const l=level(ms).level;assert.ok(l>=prev);prev=l;}
});
test('charge.level vuelve a subir de 0 a 1 entre 1,35 s y 4 s (etapa 2)',()=>{
  const lit=pressTick(down(),at(LIT_MS));
  assert.deepEqual(find(lit.effects,'charge'),[{type:'charge',verse:3,stage:2,level:0}]);
  const level=(ms:number)=>find(pressTick(lit.state,at(ms)).effects,'charge')[0];
  const mid=level((LIT_MS+SPECIAL_MS)/2);assert.equal(mid.stage,2);assert.ok(Math.abs(mid.level-0.5)<1e-9);
  const late=level(SPECIAL_MS-1);assert.ok(late.level>0.99&&late.level<1);
});
test('mover dentro del margen durante la etapa 2 no pinta ni cancela',()=>{
  const s=pressTick(down(),at(LIT_MS)).state;
  const r=pressMove(s,{x:104,y:203,t:at(3000),verseUnder:4});
  assert.equal(r.state.phase,'lit');assert.deepEqual(find(r.effects,'paint'),[]);assert.ok(!types(r.effects).includes('cancel'));
});
test('pressCancel (pointercancel) termina la pulsación sin marcas',()=>{
  assert.deepEqual(pressCancel(down()).effects,[{type:'cancel'}]);
  assert.equal(pressCancel(down()).state.phase,'idle');
  assert.deepEqual(pressCancel(IDLE).effects,[]);
});
test('el reductor no muta el estado anterior',()=>{
  const s=down();const copy=structuredClone(s);pressTick(s,at(LIT_MS));pressMove(s,{x:500,y:500,t:at(100),verseUnder:4});assert.deepEqual(s,copy);
});
