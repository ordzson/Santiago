import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ENDING_MIN_PX,fitSize,pickColumns,pickSizes} from '../src/app/ending-fit.ts';

test('los escalones bajan de mayor a menor y terminan en 15 px',()=>{
  for(const n of [1,2,3,4,7]){const s=pickSizes(n);assert.equal(s[s.length-1],ENDING_MIN_PX);assert.deepEqual(s,[...s].sort((a,b)=>b-a));}
  assert.equal(pickSizes(1)[0],36);assert.equal(pickSizes(3)[0],28);assert.equal(pickSizes(7)[0],26);
});
test('fitSize elige el primero que cabe y, si ninguno, el mínimo',()=>{
  assert.equal(fitSize([30,26,22,18,15],px=>px<=22),22);
  assert.equal(fitSize([30,26,22,18,15],()=>false),15);
});
test('columnas: pila con menos de 4; 2–3 solo con ancho',()=>{
  assert.equal(pickColumns(3,1400),1);assert.equal(pickColumns(7,390),1);
  assert.equal(pickColumns(5,1000),2);assert.equal(pickColumns(7,1200),3);assert.equal(pickColumns(7,700),2);
});
