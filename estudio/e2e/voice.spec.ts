import {test,expect,type Page} from '@playwright/test';
import {enterScene,newPhone,openPanel} from './helpers';

/** Chrome con micrófono falso: concede el permiso sin diálogo y emite un tono periódico. */
test.use({launchOptions:{executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']}});

/** Cuenta llamadas a `getUserMedia` y guarda los streams devueltos (`window.__gum`, `window.__streams`). */
const SPY=`(()=>{
  window.__gum=0;window.__streams=[];
  const md=navigator.mediaDevices;if(!md)return;
  const real=md.getUserMedia.bind(md);
  md.getUserMedia=async(c)=>{window.__gum++;const s=await real(c);window.__streams.push(s);return s;};
})();`;
/** Rechaza como si el usuario hubiera denegado el permiso. */
const DENY=`(()=>{
  window.__gum=0;
  navigator.mediaDevices.getUserMedia=async()=>{window.__gum++;throw new DOMException('Permission denied','NotAllowedError');};
})();`;

const gumCalls=(page:Page)=>page.evaluate(()=>(window as unknown as {__gum:number}).__gum);
const trackStates=(page:Page)=>page.evaluate(()=>(window as unknown as {__streams:MediaStream[]}).__streams.flatMap(s=>s.getAudioTracks().map(t=>t.readyState)));
/** Alto (px) del bloque con píxeles pintados en el canvas del pie; 0 si está vacío. */
const paintedHeight=(page:Page)=>page.evaluate(()=>{
  const c=document.querySelector('.page-bottom canvas') as HTMLCanvasElement;
  const d=c.getContext('2d')!.getImageData(0,0,c.width,c.height).data;
  let top=-1,bottom=-1;
  for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(d[(y*c.width+x)*4+3]>0){if(top<0)top=y;bottom=y;break;}
  return top<0?0:bottom-top+1;
});
/** Huella del contenido del canvas del pie. */
const canvasHash=(page:Page)=>page.evaluate(()=>{
  const c=document.querySelector('.page-bottom canvas') as HTMLCanvasElement;
  const d=c.getContext('2d')!.getImageData(0,0,c.width,c.height).data;
  let h=0;for(let i=0;i<d.length;i+=4)h=(h*31+d[i+3]+(d[i]<<1))|0;
  return h;
});
const progress=(page:Page)=>page.locator('.page-progress').evaluate(el=>Number((el as HTMLElement).style.getPropertyValue('--p')));
const restingLine=async(page:Page)=>{
  await expect.poll(()=>paintedHeight(page)).toBeGreaterThan(0);
  expect(await paintedHeight(page)).toBeLessThanOrEqual(3);
};

test('el interruptor de espectro está encendido por defecto y se persiste',async({browser})=>{
  const {context,page,errors}=await newPhone(browser,false);
  const toggle=page.getByLabel('Espectro de voz');
  await page.getByRole('button',{name:'Cierre y ajustes de escena'}).click();
  await page.getByRole('button',{name:'Listo',exact:true}).click();
  await expect(toggle).toBeChecked();
  await toggle.uncheck();
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('verbo.settings')||'{}').voice)).toBe(false);
  await page.reload();await expect(page.locator('.chapter-heading')).toBeVisible();
  await expect(page.getByLabel('Espectro de voz')).not.toBeChecked();
  expect(errors).toEqual([]);await context.close();
});

test('encendido: pide micrófono, las barras cambian entre frames y las pistas terminan al salir',async({browser})=>{
  const {context,page,errors}=await newPhone(browser);
  await page.addInitScript(SPY);await page.reload();await expect(page.locator('.chapter-heading')).toBeVisible();
  expect(await gumCalls(page)).toBe(0);
  await restingLine(page);
  await enterScene(page);
  await expect.poll(()=>gumCalls(page)).toBe(1);
  await expect.poll(()=>trackStates(page)).toEqual(['live']);
  // Las barras se dibujan (más altas que la línea de reposo) y el contenido varía entre frames.
  await expect.poll(()=>paintedHeight(page),{timeout:15000}).toBeGreaterThan(3);
  const hashes=new Set<number>();
  for(let i=0;i<30&&hashes.size<3;i++){hashes.add(await canvasHash(page));await page.waitForTimeout(100);}
  expect(hashes.size).toBeGreaterThan(1);
  // El pie no muestra porcentaje y no crece más de 8 px respecto a los 49 px originales.
  expect(await page.locator('.page-bottom').innerText()).not.toContain('%');
  const box=(await page.locator('.page-bottom').boundingBox())!;
  expect(box.height).toBeLessThanOrEqual(49+8);
  // Al salir de la escena el micrófono se libera y el pie vuelve a la línea de reposo.
  await openPanel(page);
  await page.getByRole('button',{name:'Estudio'}).click();
  await expect(page.locator('.recording')).toHaveCount(0);
  await expect.poll(()=>trackStates(page)).toEqual(['ended']);
  await restingLine(page);
  expect(errors).toEqual([]);await context.close();
});

test('apagado: no se llama a getUserMedia y el pie queda en reposo',async({browser})=>{
  const {context,page,errors}=await newPhone(browser,false,{countdown:false,voice:false,intro:{enabled:false,title:'Episodio 1',duration:5}});
  await page.addInitScript(SPY);await page.reload();await expect(page.locator('.chapter-heading')).toBeVisible();
  await enterScene(page);
  await page.waitForTimeout(1500);
  expect(await gumCalls(page)).toBe(0);
  await restingLine(page);
  const a=await canvasHash(page);await page.waitForTimeout(500);
  expect(await canvasHash(page)).toBe(a);
  expect(errors).toEqual([]);await context.close();
});

test('permiso denegado: sin errores de página y línea de reposo',async({browser})=>{
  const {context,page,errors}=await newPhone(browser);
  await page.addInitScript(DENY);await page.reload();await expect(page.locator('.chapter-heading')).toBeVisible();
  await enterScene(page);
  await expect.poll(()=>gumCalls(page)).toBe(1);
  await page.waitForTimeout(1000);
  await restingLine(page);
  expect(await page.locator('.page-bottom').innerText()).not.toContain('%');
  expect(errors).toEqual([]);await context.close();
});

test('barra de cabecera: va de 0 a 1 al desplazar y vuelve a 0 al cambiar de capítulo',async({browser})=>{
  const {context,page,errors}=await newPhone(browser);
  // Por defecto el recorrido es un capítulo; se extiende para poder avanzar al siguiente.
  await page.getByRole('button',{name:'Elegir hasta qué capítulo'}).click();
  await expect(page.getByLabel('Capítulo final')).toHaveValue(/.+/);
  await enterScene(page);
  await expect(page.locator('.page-progress')).toHaveAttribute('aria-hidden','true');
  expect(await progress(page)).toBeLessThan(0.05);
  await page.locator('.reading-scroll').evaluate(el=>{el.scrollTop=el.scrollHeight;});
  await expect.poll(()=>progress(page)).toBeGreaterThan(0.97);
  expect(await progress(page)).toBeLessThanOrEqual(1);
  await openPanel(page);
  await page.getByRole('button',{name:'Completar y avanzar capítulo'}).click();
  await expect(page.locator('.chapter-numeral')).toHaveText('2');
  await expect.poll(()=>progress(page)).toBeLessThan(0.05);
  expect(errors).toEqual([]);await context.close();
});
