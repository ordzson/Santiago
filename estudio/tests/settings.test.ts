import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULTS, parseSettings} from '../src/app/settings.ts';
test('valores por defecto',()=>{
  assert.deepEqual(parseSettings({}),DEFAULTS);
  assert.deepEqual(DEFAULTS.intro,{enabled:true,title:'Episodio 1',duration:5});
  assert.equal(DEFAULTS.original,false);
});
test('el resultado no comparte referencias con DEFAULTS',()=>{const s=parseSettings({});s.frame.size=150;s.intro.title='x';assert.equal(DEFAULTS.frame.size,104);assert.equal(DEFAULTS.intro.title,'Episodio 1');});
test('basura, JSON inválido o tipos erróneos devuelven los valores por defecto',()=>{
  for(const raw of [null,undefined,'texto',42,true,[],[1,2],'{"fontSize":30}'])assert.deepEqual(parseSettings(raw),DEFAULTS);
  assert.deepEqual(parseSettings({fontSize:'x',speed:NaN,endRule:'nunca',frame:'x',intro:7,endMessage:5}),DEFAULTS);
});
test('recorta la fuente a 17–32',()=>{assert.equal(parseSettings({fontSize:5}).fontSize,17);assert.equal(parseSettings({fontSize:99}).fontSize,32);assert.equal(parseSettings({fontSize:25}).fontSize,25);});
test('recorta la velocidad a 8–70',()=>{assert.equal(parseSettings({speed:1}).speed,8);assert.equal(parseSettings({speed:500}).speed,70);assert.equal(parseSettings({speed:40}).speed,40);});
test('recorta el tamaño del encuadre a 72–150',()=>{assert.equal(parseSettings({frame:{size:10}}).frame.size,72);assert.equal(parseSettings({frame:{size:400}}).frame.size,150);assert.equal(parseSettings({frame:{size:120,corner:'bottom-left',shape:'square',enabled:true,guide:true}}).frame.corner,'bottom-left');});
test('intro.duration es entero entre 3 y 10',()=>{
  assert.equal(parseSettings({intro:{duration:1}}).intro.duration,3);
  assert.equal(parseSettings({intro:{duration:60}}).intro.duration,10);
  assert.equal(parseSettings({intro:{duration:6.6}}).intro.duration,7);
  assert.equal(parseSettings({intro:{duration:'8'}}).intro.duration,5);
  assert.equal(parseSettings({intro:{duration:8}}).intro.duration,8);
});
test('intro.title se recorta a 60 y puede quedar vacío',()=>{
  assert.equal(parseSettings({intro:{title:'a'.repeat(100)}}).intro.title.length,60);
  assert.equal(parseSettings({intro:{title:''}}).intro.title,'');
  assert.equal(parseSettings({intro:{title:'   '}}).intro.title,'');
  assert.equal(parseSettings({intro:{title:'Fe que obra'}}).intro.title,'Fe que obra');
  assert.equal(parseSettings({intro:{title:12}}).intro.title,'Episodio 1');
});
test('intro.enabled solo se desactiva con false',()=>{assert.equal(parseSettings({intro:{enabled:false}}).intro.enabled,false);assert.equal(parseSettings({intro:{}}).intro.enabled,true);});
test('ajustes viejos sin intro ni original usan los valores por defecto en esos campos',()=>{
  const s=parseSettings({fontSize:28,speed:30,night:true,endRule:'book',endMessage:'Fin',countdown:false,frame:{enabled:true,corner:'top-left',shape:'square',size:90,guide:true}});
  assert.deepEqual(s.intro,DEFAULTS.intro);assert.equal(s.original,false);
  assert.equal(s.fontSize,28);assert.equal(s.night,true);assert.equal(s.endRule,'book');assert.equal(s.countdown,false);assert.equal(s.frame.corner,'top-left');
});
test('la clave antigua greek:true pasa a original:true',()=>{assert.equal(parseSettings({greek:true}).original,true);assert.equal(parseSettings({greek:false}).original,false);});
test('original tiene prioridad sobre greek',()=>{assert.equal(parseSettings({original:false,greek:true}).original,false);assert.equal(parseSettings({original:true}).original,true);});
test('voice es booleano, por defecto true y acepta solo booleanos',()=>{
  assert.equal(DEFAULTS.voice,true);
  assert.equal(parseSettings({}).voice,true);
  assert.equal(parseSettings({voice:false}).voice,false);
  assert.equal(parseSettings({voice:true}).voice,true);
  for(const v of ['false',0,null,'x',{}])assert.equal(parseSettings({voice:v}).voice,true);
});
