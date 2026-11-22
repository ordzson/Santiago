import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chosenIn, toggleChosen, type ChosenVerse} from '../src/app/chosen.ts';
const order=(id:string)=>['a','b'].indexOf(id);
const item=(bookId:string,chapter:number,verse:number):ChosenVerse=>({bookId,bookName:bookId.toUpperCase(),chapter,verse,text:`${bookId}${chapter}:${verse}`});
test('los elegidos se guardan en orden canónico aunque se elijan desordenados',()=>{
  let list:ChosenVerse[]=[];
  for(const e of [item('b',1,1),item('a',2,1),item('a',1,3),item('a',1,2)])list=toggleChosen(list,e,order);
  assert.deepEqual(list.map(e=>e.text),['a1:2','a1:3','a2:1','b1:1']);
});
test('elegir dos veces el mismo versículo lo quita y no muta la lista original',()=>{
  const first=toggleChosen([],item('a',1,2),order);const second=toggleChosen(first,item('a',1,2),order);
  assert.equal(first.length,1);assert.equal(second.length,0);
});
test('chosenIn devuelve solo los versículos del capítulo pedido',()=>{
  const list=[item('a',1,2),item('a',2,1),item('b',1,1)];
  assert.deepEqual([...chosenIn(list,'a',1)],[2]);assert.equal(chosenIn(list,undefined,1).size,0);
});
