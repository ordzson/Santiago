import {expect,type Browser,type BrowserContext,type Page} from '@playwright/test';

/** Ajustes de escena sin cuenta atrás ni portada: las pruebas validan estado, no la animación de entrada. */
const QUIET=JSON.stringify({countdown:false,intro:{enabled:false,title:'Episodio 1',duration:5}});

export async function newPhone(browser:Browser,quiet=true):Promise<{context:BrowserContext;page:Page;errors:string[]}>{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1,reducedMotion:'reduce'});
  if(quiet)await context.addInitScript(`try{if(!localStorage.getItem('verbo.settings'))localStorage.setItem('verbo.settings',${JSON.stringify(QUIET)});}catch{}`);
  const page=await context.newPage();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await expect(page.locator('.chapter-heading')).toBeVisible();await page.evaluate(()=>document.fonts.ready);
  return {context,page,errors};
}

export async function enterScene(page:Page){
  await page.getByRole('button',{name:'Entrar en escena'}).click();
  await expect(page.locator('.recording')).toBeVisible();
  await expect(page.locator('.reading-sheet.live')).toBeVisible();
  await expect(page.locator('.control-ribbon')).toBeVisible();
}

export async function openPanel(page:Page){
  if(!(await page.locator('.scene-controls.visible').count()))await page.locator('.control-ribbon').click();
  await expect(page.locator('.scene-controls')).toHaveClass(/visible/);
}
export async function closePanel(page:Page){
  if(await page.locator('.scene-controls.visible').count())await page.locator('.control-ribbon').click();
  await expect(page.locator('.scene-controls')).not.toHaveClass(/visible/);
}

/** Punto dentro del versículo (primera línea) en coordenadas de viewport; lo trae a la vista si hace falta. */
async function versePoint(page:Page,verse:number){
  const el=page.locator(`.verse[data-verse="${verse}"]`);
  await el.scrollIntoViewIfNeeded();
  const box=(await el.boundingBox())!;
  const scroller=(await page.locator('.reading-scroll').boundingBox())!;
  const x=box.x+box.width*0.5,y=Math.min(box.y+22,box.y+box.height-4);
  expect(y,`versículo ${verse} visible`).toBeGreaterThan(scroller.y+70);
  expect(y,`versículo ${verse} visible`).toBeLessThan(scroller.y+scroller.height-70);
  return {x,y};
}

/** Pulsación real con ratón: mantiene `ms` sobre `verse` y, si se pide, arrastra por `drag` antes de soltar. */
export async function hold(page:Page,verse:number,ms:number,drag:number[]=[]){
  const start=await versePoint(page,verse);
  await page.mouse.move(start.x,start.y);await page.mouse.down();
  await page.waitForTimeout(ms);
  for(const target of drag){const p=await versePoint(page,target);await page.mouse.move(p.x,p.y,{steps:6});await page.waitForTimeout(120);}
  await page.mouse.up();
}
export const LIT_HOLD=2400;
export const SPECIAL_HOLD=4400;

export const litVerses=(page:Page)=>page.locator('.verse.verse-lit');
export const specialVerses=(page:Page)=>page.locator('.verse.verse-special');
export const verseNumbers=async(locator:ReturnType<Page['locator']>)=>(await locator.evaluateAll(els=>els.map(e=>Number((e as HTMLElement).dataset['verse'])))).sort((a,b)=>a-b);
