import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseBible, parseOriginal, sceneLabel, sessionLocations, shouldEnd, tokenize} from '../src/app/content.ts';
const bible=parseBible({version:'Prueba',books:[{id:'a',name:'A',chapters:[{number:1,verses:[{number:1,text:'Uno'}]},{number:2,verses:[{number:1,text:'Dos'}]}]},{id:'b',name:'B',chapters:[{number:1,verses:[{number:1,text:'Tres'}]}]}]});
test('un recorrido cruza libros en orden sin duplicar capítulos',()=>assert.deepEqual(sessionLocations(bible,'range',{book:0,chapter:1},{book:1,chapter:0}),[{book:0,chapter:1},{book:1,chapter:0}]));
test('libro completo siempre empieza en el primer capítulo y termina en su límite',()=>assert.deepEqual(sessionLocations(bible,'book',{book:0,chapter:1},{book:1,chapter:0}),[{book:0,chapter:0},{book:0,chapter:1}]));
test('capítulos sucesivos incluyen el siguiente libro',()=>assert.deepEqual(sessionLocations(bible,'chapters',{book:0,chapter:1},{book:0,chapter:1}),[{book:0,chapter:1},{book:1,chapter:0}]));
test('un rango invertido no crea una sesión',()=>assert.equal(sessionLocations(bible,'range',{book:1,chapter:0},{book:0,chapter:0}).length,0));
test('se rechazan datos vacíos, capítulos desordenados y versículos duplicados',()=>{assert.throws(()=>parseBible({}));assert.throws(()=>parseBible({version:'X',books:[{id:'a',name:'A',chapters:[{number:1,verses:[{number:1,text:'a'},{number:1,text:'b'}]}]}]}));});
test('cierre al cambiar de libro y cierre manual',()=>{assert.equal(shouldEnd('book',{book:0,chapter:1},{book:1,chapter:0}),true);assert.equal(shouldEnd('book',{book:0,chapter:0},{book:0,chapter:1}),false);assert.equal(shouldEnd('manual',{book:0,chapter:1},undefined),false);assert.equal(shouldEnd('chapter',{book:0,chapter:1},undefined),true);});
test('el griego solo se vincula a frases completas existentes',()=>{const notes=parseOriginal({notes:[{book:'a',chapter:1,verse:1,word:'fe',greek:'πίστις',transliteration:'pistis',meaning:'fe'}]},'griego');const words=tokenize('La fe persevera, feliz.',notes);assert.equal(words.filter(w=>w.note).length,1);assert.equal(words.find(w=>w.note)?.text,'fe');assert.equal(words.map(w=>w.text).join(''),'La fe persevera, feliz.');});
test('una nota inválida muestra error',()=>assert.throws(()=>parseOriginal({notes:[{word:'fe'}]},'griego')));

const ch=(n:number)=>({number:n,verses:[{number:1,text:'x'}]});
const lb=parseBible({version:'L',books:[{id:'s',name:'Santiago',chapters:[ch(1),ch(2),ch(3),ch(4),ch(5)]},{id:'p',name:'1 Pedro',chapters:[ch(1),ch(2),ch(3)]},{id:'j',name:'Judas',chapters:[ch(1)]}]});
const at=(book:number,chapter:number)=>({book,chapter});
test('rótulo: libro completo',()=>assert.equal(sceneLabel(lb,'book',at(0,2),at(0,2)),'Santiago'));
test('rótulo: capítulos sucesivos usa el capítulo inicial',()=>assert.equal(sceneLabel(lb,'chapters',at(0,2),at(0,2)),'Santiago 3'));
test('rótulo: rango en un solo capítulo',()=>assert.equal(sceneLabel(lb,'range',at(0,0),at(0,0)),'Santiago 1'));
test('rótulo: rango que cubre todo el libro',()=>assert.equal(sceneLabel(lb,'range',at(0,0),at(0,4)),'Santiago'));
test('rótulo: rango de capítulos en el mismo libro',()=>assert.equal(sceneLabel(lb,'range',at(0,0),at(0,2)),'Santiago 1 – 3'));
test('rótulo: libros distintos con capítulo en ambos extremos',()=>assert.equal(sceneLabel(lb,'range',at(0,3),at(1,1)),'Santiago 4 – 1 Pedro 2'));
test('rótulo: libros distintos con bordes naturales',()=>{assert.equal(sceneLabel(lb,'range',at(0,0),at(1,2)),'Santiago – 1 Pedro');assert.equal(sceneLabel(lb,'range',at(0,3),at(1,2)),'Santiago 4 – 1 Pedro');});
test('rótulo: usa el número real del capítulo, no el índice',()=>{const b=parseBible({version:'N',books:[{id:'x',name:'X',chapters:[ch(5),ch(6),ch(7)]}]});assert.equal(sceneLabel(b,'range',at(0,0),at(0,1)),'X 5 – 6');});

const base={book:'a',chapter:1,verse:1,word:'fe',transliteration:'x',meaning:'fe'};
test('griego: acepta greek y original y normaliza a original',()=>{
  const a=parseOriginal({notes:[{...base,greek:'πίστις'}]},'griego')[0];
  const b=parseOriginal({notes:[{...base,original:'πίστις'}]},'griego')[0];
  assert.equal(a.original,'πίστις');assert.equal(a.language,'griego');assert.equal('greek' in a,false);assert.deepEqual(a,b);
});
test('hebreo: acepta hebrew y original',()=>{
  const a=parseOriginal({notes:[{...base,hebrew:'אֱמוּנָה'}]},'hebreo')[0];
  const b=parseOriginal({notes:[{...base,original:'אֱמוּנָה'}]},'hebreo')[0];
  assert.equal(a.original,'אֱמוּנָה');assert.equal(a.language,'hebreo');assert.equal('hebrew' in a,false);assert.deepEqual(a,b);
});
test('término latino en archivo hebreo → error que nombra la nota',()=>assert.throws(()=>parseOriginal({notes:[{...base,original:'emunah'}]},'hebreo'),/«fe».*hebreo/));
test('término hebreo en archivo griego → error',()=>assert.throws(()=>parseOriginal({notes:[{...base,greek:'אֱמוּנָה'}]},'griego'),/«fe».*griego/));
test('error de lista nombra el idioma',()=>assert.throws(()=>parseOriginal({},'hebreo'),/El archivo del hebreo debe contener una lista notes\./));
test('tokenize asocia una nota hebrea por su palabra española',()=>{
  const notes=parseOriginal({notes:[{...base,original:'אֱמוּנָה'}]},'hebreo');
  const words=tokenize('La fe persevera, feliz.',notes);
  assert.equal(words.filter(w=>w.note).length,1);assert.equal(words.find(w=>w.note)?.note?.language,'hebreo');assert.equal(words.map(w=>w.text).join(''),'La fe persevera, feliz.');
});
test('mezcla griego+hebreo conserva language de cada nota',()=>{
  const all=[...parseOriginal({notes:[{...base,word:'fe',greek:'πίστις'}]},'griego'),...parseOriginal({notes:[{...base,word:'paz',hebrew:'שָׁלוֹם'}]},'hebreo')];
  assert.deepEqual(all.map(n=>n.language),['griego','hebreo']);
  const words=tokenize('fe y paz',all);assert.deepEqual(words.filter(w=>w.note).map(w=>w.note!.language),['griego','hebreo']);
});
test('el griego.json instalado carga sus 286 notas',()=>{
  const raw=JSON.parse(readFileSync(new URL('../public/data/griego.json',import.meta.url),'utf8'));
  const notes=parseOriginal(raw,'griego');assert.equal(notes.length,286);assert.ok(notes.every(n=>n.language==='griego'&&n.original.length>0));
});
