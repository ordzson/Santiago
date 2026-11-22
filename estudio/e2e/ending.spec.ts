import {test,expect,type Page} from '@playwright/test';
import {enterScene,hold,newPhone,openPanel,SPECIAL_HOLD} from './helpers';

/** Sin cuenta atrás ni portada; `endRule` según la prueba. */
const settings=(endRule:string)=>({countdown:false,endRule,endMessage:'Es todo por hoy.',intro:{enabled:false,title:'Episodio 1',duration:3}});

const veilOpacity=(page:Page)=>page.locator('.fade-veil').evaluate(el=>Number(getComputedStyle(el).opacity));
/** Un toque en una zona libre del cierre (no sobre las acciones). */
const tapEnding=(page:Page)=>page.mouse.click(195,300);

test('cierre con elegidos en orden, fundido a negro, guarda y regreso a la preparación',async({browser})=>{
  const {context,page,errors}=await newPhone(browser,false,settings('session'));
  await enterScene(page);
  // v.2 del cap. 1 y v.1 del cap. 2, elegidos con la pulsación larga.
  await hold(page,2,SPECIAL_HOLD);await expect(page.locator('.verse.verse-special')).toHaveCount(1);
  await openPanel(page);
  await page.getByRole('button',{name:'Completar y avanzar capítulo'}).click();
  await expect(page.locator('.chapter-numeral')).toHaveText('2');
  await hold(page,1,SPECIAL_HOLD);await expect(page.locator('.verse.verse-special')).toHaveCount(1);
  await openPanel(page);
  await expect(page.locator('.chosen-count')).toContainText('2 para el cierre');
  await page.getByRole('button',{name:'Completar lectura'}).click();

  // Cierre: ambos, en orden canónico y con su referencia.
  const ending=page.locator('.ending-screen');
  await expect(ending).toBeVisible();
  const picks=ending.locator('v-ending .pick');
  await expect(picks).toHaveCount(2);
  await expect(picks.locator('cite')).toHaveText(['Santiago 1:2','Santiago 2:1']);
  for(const text of await picks.locator('.text').allInnerTexts())expect(text.trim().length).toBeGreaterThan(10);
  await expect(ending.locator('v-ending h2')).toHaveText('Es todo por hoy.');
  await expect(page.locator('.fade-veil')).toHaveCount(0);
  await page.waitForTimeout(900);
  await page.screenshot({path:'.impeccable/review/mobile-ending.png'});

  // Un toque inicia el fundido: el velo crece.
  await tapEnding(page);const t0=Date.now();
  await expect(page.locator('.fade-veil')).toBeVisible();
  await page.waitForTimeout(1000);
  const early=await veilOpacity(page);
  expect(early,'a ~1 s el velo ya se ve').toBeGreaterThan(0.01);
  expect(early,'a ~1 s aún no es negro').toBeLessThan(0.6);
  // Un clic a los 2 s no navega ni acelera el fundido.
  await page.waitForTimeout(Math.max(0,t0+2000-Date.now()));
  const mid=await veilOpacity(page);
  expect(mid).toBeGreaterThan(early);expect(mid).toBeLessThan(1);
  await page.mouse.click(195,420);await page.keyboard.press('Space');await page.keyboard.press('Enter');
  await expect(page.locator('.fade-veil')).not.toHaveClass(/black/);
  await expect(page.getByRole('button',{name:'Entrar en escena'})).toBeHidden();
  expect(await veilOpacity(page)).toBeLessThan(1);

  // Tras ~6,8 s es negro y la guarda (600 ms) ya pasó: un clic vuelve a la preparación.
  await page.waitForTimeout(Math.max(0,t0+6800-Date.now()));
  await expect(page.locator('.fade-veil')).toHaveClass(/black/);
  expect(await veilOpacity(page)).toBe(1);
  await page.mouse.click(195,420);
  await expect(page.getByRole('button',{name:'Entrar en escena'})).toBeVisible();
  await expect(page.locator('.recording')).toHaveCount(0);
  await expect(page.locator('.fade-veil')).toHaveCount(0);
  expect(errors).toEqual([]);await context.close();
});

test('«Continuar lectura» no repite los elegidos del tramo anterior',async({browser})=>{
  const {context,page,errors}=await newPhone(browser,false,settings('chapter'));
  await enterScene(page);
  await hold(page,2,SPECIAL_HOLD);await expect(page.locator('.verse.verse-special')).toHaveCount(1);
  await openPanel(page);
  await page.getByRole('button',{name:'Completar y avanzar capítulo'}).click();
  // Regla «cada capítulo»: el primer cierre muestra solo Santiago 1:2.
  const picks=page.locator('.ending-screen v-ending .pick');
  await expect(picks.locator('cite')).toHaveText(['Santiago 1:2']);
  await page.getByRole('button',{name:'Mostrar u ocultar herramientas'}).click();
  await page.getByRole('button',{name:/Continuar lectura/}).click();
  await expect(page.locator('.ending-screen')).toHaveCount(0);
  await expect(page.locator('.chapter-numeral')).toHaveText('2');
  await expect(page.locator('.verse.verse-special')).toHaveCount(0);
  // En el cap. 2 se elige 2:1; el segundo cierre trae solo ese.
  await hold(page,1,SPECIAL_HOLD);await expect(page.locator('.verse.verse-special')).toHaveCount(1);
  await openPanel(page);
  await page.getByRole('button',{name:'Cerrar lectura',exact:true}).click();
  await expect(picks).toHaveCount(1);
  await expect(picks.locator('cite')).toHaveText(['Santiago 2:1']);
  expect(errors).toEqual([]);await context.close();
});
