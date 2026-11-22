import {test,expect,type Page} from '@playwright/test';
import {newPhone} from './helpers';

/** Portada de 3 s, sin cuenta atrás, con título propio. */
const WITH_INTRO={countdown:false,intro:{enabled:true,title:'Fe que obra',duration:3}};
const WITHOUT_INTRO={countdown:false,intro:{enabled:false,title:'Episodio 1',duration:3}};

/** Entra en escena y devuelve el instante (ms, reloj de la prueba) en que se pulsó. */
async function start(page:Page){
  await page.getByRole('button',{name:'Entrar en escena'}).click();
  return Date.now();
}
const wait=(page:Page,since:number,ms:number)=>page.waitForTimeout(Math.max(0,since+ms-Date.now()));

test('la portada muestra título y rótulo, no se salta y da paso a las cintas',async({browser})=>{
  const {context,page,errors}=await newPhone(browser,false,WITH_INTRO);
  // El rótulo esperado sale del recorrido de la preparación (el mismo que lee la portada).
  const expected=(await page.locator('.session-summary strong').innerText()).trim();
  expect(expected).toMatch(/^Santiago/);
  const t0=await start(page);

  const card=page.locator('.intro-stage v-title-card');
  await expect(card).toBeVisible();
  await expect(card.locator('.title')).toHaveText('Fe que obra');
  const label=(await card.locator('.label').innerText()).trim();
  expect(label,'rótulo de la portada = «Tu próxima lectura»').toBe(expected);
  await expect(page.locator('.intro-stage')).toHaveAttribute('aria-label',`Portada: Fe que obra, ${label}`);
  // Mientras dura: ni cintas ni páginas interactivas.
  await expect(page.locator('.control-ribbon')).toHaveCount(0);
  await expect(page.locator('.play-ribbon')).toHaveCount(0);

  // A ~1 s un clic y teclas no la quitan.
  await wait(page,t0,1000);
  await page.mouse.click(195,420);await page.keyboard.press('Space');await page.keyboard.press('Escape');
  await expect(card).toBeVisible();
  await expect(card.locator('.title')).toHaveText('Fe que obra');
  await expect(page.locator('.control-ribbon')).toHaveCount(0);
  await page.screenshot({path:'.impeccable/review/mobile-intro.png'});

  // A ~3,5 s la portada acabó y las cintas están a la vista.
  await wait(page,t0,3500);
  await expect(page.locator('.control-ribbon')).toBeVisible();
  await expect(page.locator('.play-ribbon')).toBeVisible();
  await expect(page.locator('.reading-sheet.live')).toBeVisible();
  await expect(page.locator('.intro-stage')).toHaveCount(0,{timeout:2000});
  await expect(card).toHaveCount(0);

  expect(errors).toEqual([]);
  await context.close();
});

test('con la portada desactivada las cintas aparecen de inmediato',async({browser})=>{
  const {context,page,errors}=await newPhone(browser,false,WITHOUT_INTRO);
  await start(page);
  await expect(page.locator('.control-ribbon')).toBeVisible({timeout:1000});
  await expect(page.locator('.play-ribbon')).toBeVisible({timeout:1000});
  await expect(page.locator('.intro-stage')).toHaveCount(0);
  await expect(page.locator('v-title-card')).toHaveCount(0);
  expect(errors).toEqual([]);
  await context.close();
});
