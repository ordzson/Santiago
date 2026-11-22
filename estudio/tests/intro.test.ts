import {test} from 'node:test';
import assert from 'node:assert/strict';
import {INTRO_FLOOD_MS, INTRO_TAIL_MS, introSteps} from '../src/app/intro.ts';

const fold=(steps:ReturnType<typeof introSteps>,until:number)=>steps.filter(s=>s.at<=until).reduce((v,s)=>({...v,...s.view}),{lumen:'off',card:'in',veil:true} as Record<string,unknown>);

test('la portada cabe en D: la lectura empieza exactamente en D y la inundación ocupa los últimos 0,9 s',()=>{
  for(const d of [3,5,10]){
    const steps=introSteps(d,false);
    assert.equal(steps.find(s=>s.done)!.at,d*1000);
    assert.equal(steps.find(s=>s.view?.lumen==='flood')!.at,d*1000-INTRO_FLOOD_MS);
    assert.equal(steps.find(s=>s.end)!.at,d*1000+INTRO_TAIL_MS);
    assert.deepEqual(steps.map(s=>s.at),[...steps.map(s=>s.at)].sort((a,b)=>a-b));
  }
});
test('secuencia: luz se abre, se sostiene, inunda y se apaga; la tarjeta sale al inundar',()=>{
  const steps=introSteps(5,false);
  assert.equal(fold(steps,100)['lumen'],'rise');
  assert.equal(fold(steps,1500)['lumen'],'hold');
  assert.equal(fold(steps,1500)['card'],'in');
  assert.equal(fold(steps,1500)['veil'],true);
  const mid=fold(steps,4300);
  assert.deepEqual([mid['lumen'],mid['card'],mid['veil']],['flood','out',false]);
  assert.equal(fold(steps,4700)['lumen'],'off');
});
test('polvo: se enciende al abrir la luz y se apaga al inundar',()=>{
  const steps=introSteps(5,false);
  assert.deepEqual(steps.filter(s=>s.ambient!==undefined).map(s=>[s.at,s.ambient]),[[60,true],[4100,false]]);
});
test('reduced motion: sin giro ni inundación, composición sostenida y fundido final de opacidad',()=>{
  const steps=introSteps(4,true);
  assert.ok(!steps.some(s=>s.view?.lumen==='rise'||s.view?.lumen==='flood'));
  assert.equal(fold(steps,500)['lumen'],'hold');
  const end=fold(steps,3200);
  assert.deepEqual([end['card'],end['veil']],['out',false]);
  assert.equal(steps.find(s=>s.done)!.at,4000);
});
