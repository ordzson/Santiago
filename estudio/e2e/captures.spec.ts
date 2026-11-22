import {test,expect} from '@playwright/test';
import {hold,litVerses,LIT_HOLD,openPanel,specialVerses,SPECIAL_HOLD} from './helpers';
test('capturas finales del diseño',async({browser})=>{
 const desktop=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const page=await desktop.newPage();await page.goto('/');await expect(page.locator('.chapter-heading')).toBeVisible();await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'.impeccable/review/desktop.png',fullPage:true});
 await page.getByRole('button',{name:'Cierre y ajustes de escena'}).click();await page.getByLabel('Cuenta atrás de 3 segundos al entrar').uncheck();await page.getByRole('button',{name:'Listo',exact:true}).click();await page.getByRole('button',{name:'Entrar en escena'}).click();await page.screenshot({path:'.impeccable/review/desktop-scene.png',fullPage:true});await desktop.close();
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});const phone=await mobile.newPage();await phone.goto('/');await expect(phone.locator('.chapter-heading')).toBeVisible();await phone.evaluate(()=>document.fonts.ready);await phone.screenshot({path:'.impeccable/review/mobile.png',fullPage:true});await phone.screenshot({path:'.impeccable/review/mobile-viewport.png'});
 await phone.getByRole('button',{name:'Cierre y ajustes de escena'}).click();await phone.getByLabel('Cuenta atrás de 3 segundos al entrar').uncheck();await phone.getByRole('button',{name:'Listo',exact:true}).click();await phone.getByRole('button',{name:'Entrar en escena'}).click();await phone.screenshot({path:'.impeccable/review/mobile-scene.png'});
 // Gestos reales: versículo 2 resaltado con una palabra marcada, versículo 3 elegido para el cierre.
 await hold(phone,2,LIT_HOLD);await expect(litVerses(phone)).toHaveCount(1);
 await phone.locator('.verse[data-verse="2"] .word').filter({hasText:'gozo,'}).click();await expect(phone.locator('.word-lit')).toHaveCount(1);
 await hold(phone,3,SPECIAL_HOLD);await expect(specialVerses(phone)).toHaveCount(1);
 await expect.poll(()=>phone.locator('.verse[data-charge]').count()).toBe(0);
 await phone.screenshot({path:'.impeccable/review/mobile-annotated.png'});
 await openPanel(phone);await phone.screenshot({path:'.impeccable/review/mobile-panel.png'});
 await phone.getByRole('button',{name:'Estudio',exact:true}).click();await phone.getByRole('checkbox',{name:'Reservar espacio para mi imagen'}).check();await phone.getByRole('button',{name:'Abajo izquierda',exact:true}).click();await phone.getByLabel('Mostrar guía al grabar').check();await phone.getByRole('button',{name:'Noche',exact:true}).click();await phone.getByRole('button',{name:'Entrar en escena'}).click();await phone.screenshot({path:'.impeccable/review/mobile-frame.png'});await mobile.close();
 const small=await browser.newContext({viewport:{width:320,height:568},isMobile:true,hasTouch:true,reducedMotion:'reduce'});const compact=await small.newPage();await compact.goto('/');await expect(compact.locator('.chapter-heading')).toBeVisible();await compact.evaluate(()=>document.fonts.ready);expect(await compact.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await compact.screenshot({path:'.impeccable/review/mobile-small.png',fullPage:true});await small.close();
});
