import {test,expect,type BrowserContext} from '@playwright/test';
import {closePanel,enterScene,newPhone,openPanel} from './helpers';

// Datos sintéticos de prueba: nunca viven en public/data.
const BIBLE={version:'Prueba sintética',name:'Biblia de prueba (sintética)',demo:true,copyright:'Datos inventados para pruebas.',books:[{id:'genesis',name:'Génesis',chapters:[{number:1,verses:[
  {number:1,text:'En el principio creó Dios los cielos y la tierra.'},
  {number:2,text:'La tierra estaba sin orden y vacía, y las tinieblas cubrían la superficie del abismo.'},
  {number:3,text:'Entonces dijo Dios: Sea la luz. Y hubo luz.'}]}]}]};
const NOTE={book:'genesis',chapter:1,verse:1,word:'principio',original:'בְּרֵאשִׁית',transliteration:'bereshit',meaning:'En el principio (sintético)'};
const HEBREW={notes:[NOTE]};
const json=(body:unknown)=>({status:200,contentType:'application/json',body:JSON.stringify(body)});

async function serveSynthetic(context:BrowserContext,hebrew:unknown=HEBREW){
  await context.route('**/data/biblia.json',r=>r.fulfill(json(BIBLE)));
  await context.route('**/data/hebreo.json',r=>r.fulfill(json(hebrew)));
  await context.route('**/data/griego.json',r=>r.fulfill({status:404,body:''}));
}

test('hebreo: interruptor, diálogo rtl y fuente local',async({browser})=>{
  const {context,page,errors}=await newPhone(browser);
  await serveSynthetic(context);await page.reload();
  await expect(page.locator('.chapter-heading')).toBeVisible();
  await enterScene(page);
  await openPanel(page);
  const toggle=page.getByRole('button',{name:'Consultar hebreo'});
  await expect(toggle).toBeEnabled();await expect(toggle.locator('.original-glyph')).toHaveText('א');
  await toggle.click();await expect(toggle).toHaveAttribute('aria-pressed','true');
  await closePanel(page);
  await page.locator('.verse').first().getByRole('button',{name:'Ver hebreo de principio'}).click();
  const dialog=page.getByRole('dialog',{name:'principio',exact:true});await expect(dialog).toBeVisible();
  const word=dialog.locator('.original-word[lang="he"][dir="rtl"]');
  await expect(word).toHaveText('בְּרֵאשִׁית');
  await expect(dialog.locator('.note-reference')).toHaveText('Hebreo · Génesis 1:1');
  await expect(dialog.locator('.transliteration')).toHaveText('bereshit');
  await page.evaluate(()=>document.fonts.ready);
  expect(await page.evaluate(()=>document.fonts.check('44px "Noto Serif Hebrew"','בְּרֵאשִׁית'))).toBe(true);
  expect(await word.evaluate(el=>getComputedStyle(el).fontFamily)).toContain('Noto Serif Hebrew');
  // Sin cortes: el contenido del término cabe en su caja y en el diálogo.
  const box=(await word.boundingBox())!,frame=(await dialog.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(frame.x);expect(box.x+box.width).toBeLessThanOrEqual(frame.x+frame.width);
  expect(await word.evaluate(el=>el.scrollHeight<=el.clientHeight+1&&el.scrollWidth<=el.clientWidth+1)).toBe(true);
  await page.screenshot({path:'.impeccable/review/mobile-hebrew.png'});
  await page.getByRole('button',{name:'Cerrar nota del hebreo'}).click();
  await expect(dialog).toBeHidden();
  expect(errors).toEqual([]);await context.close();
});

test('hebreo: carga manual, conteos y error en la casilla equivocada',async({browser})=>{
  const {context,page,errors}=await newPhone(browser);
  await context.route('**/data/hebreo.json',r=>r.fulfill({status:404,body:''}));
  await page.reload();await expect(page.locator('.chapter-heading')).toBeVisible();
  await page.getByRole('button',{name:'Mi contenido'}).click();
  const dialog=page.getByRole('dialog',{name:/contenido/i});await expect(dialog).toBeVisible();
  await expect(dialog.getByText(/notas del griego · 0 del hebreo/)).toBeVisible();
  const hebrew=dialog.locator('.upload-field',{hasText:'Cargar notas del hebreo'}).locator('input[type=file]');
  // Un término latino en el archivo hebreo se rechaza con un error claro.
  await hebrew.setInputFiles({name:'hebreo.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({notes:[{...NOTE,original:'bereshit'}]}))});
  await expect(dialog.getByRole('alert')).toContainText('no tiene un término en hebreo');
  await expect(dialog.getByText(/· 0 del hebreo/)).toBeVisible();
  // Un archivo válido suma al conteo sin tocar las notas del griego.
  await hebrew.setInputFiles({name:'hebreo.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(HEBREW))});
  await expect(dialog.getByText(/· 1 del hebreo/)).toBeVisible();
  await expect(dialog.getByText(/[1-9]\d* notas del griego/)).toBeVisible();
  await expect(dialog.getByRole('alert')).toHaveCount(0);
  expect(errors).toEqual([]);await context.close();
});
