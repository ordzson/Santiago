import {test,expect} from '@playwright/test';
import {closePanel,enterScene,hold,litVerses,LIT_HOLD,openPanel,specialVerses,SPECIAL_HOLD} from './helpers';
test('capturas finales del diseño',async({browser})=>{
 const desktop=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const page=await desktop.newPage();await page.goto('/');await expect(page.locator('.chapter-heading')).toBeVisible();await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'.impeccable/review/desktop.png',fullPage:true});
 await page.getByRole('button',{name:'Cierre y ajustes de escena'}).click();await page.getByLabel('Cuenta atrás de 3 segundos al entrar').uncheck();await page.getByRole('button',{name:'Listo',exact:true}).click();await page.getByLabel('Mostrar portada').uncheck();await page.getByRole('button',{name:'Entrar en escena'}).click();await page.screenshot({path:'.impeccable/review/desktop-scene.png',fullPage:true});await desktop.close();
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});const phone=await mobile.newPage();await phone.goto('/');await expect(phone.locator('.chapter-heading')).toBeVisible();await phone.evaluate(()=>document.fonts.ready);await phone.screenshot({path:'.impeccable/review/mobile.png',fullPage:true});await phone.screenshot({path:'.impeccable/review/mobile-viewport.png'});
 await phone.getByRole('button',{name:'Cierre y ajustes de escena'}).click();await phone.getByLabel('Cuenta atrás de 3 segundos al entrar').uncheck();await phone.getByRole('button',{name:'Listo',exact:true}).click();await phone.getByLabel('Mostrar portada').uncheck();await phone.getByRole('button',{name:'Entrar en escena'}).click();await phone.screenshot({path:'.impeccable/review/mobile-scene.png'});
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

// Ronda final de capturas: portada, marcas, cierre, panel, preparación y diálogos de idioma original, en móvil y escritorio, día y noche.
const VIEWPORTS={mobile:{width:390,height:844,isMobile:true,hasTouch:true},desktop:{width:1440,height:1000,isMobile:false,hasTouch:false}};
const EN_BLOQUE=JSON.stringify({countdown:false,endRule:'session',endMessage:'Es todo por hoy.',intro:{enabled:true,title:'Fe que obra',duration:4}});
const SYNTHETIC_BIBLE={version:'Prueba sintética',name:'Biblia de prueba (sintética)',demo:true,copyright:'Datos inventados para pruebas.',books:[{id:'genesis',name:'Génesis',chapters:[{number:1,verses:[{number:1,text:'En el principio creó Dios los cielos y la tierra.'},{number:2,text:'La tierra estaba sin orden y vacía, y las tinieblas cubrían la superficie del abismo.'}]}]}]};
const SYNTHETIC_HEBREW={notes:[{book:'genesis',chapter:1,verse:1,word:'principio',original:'בְּרֵאשִׁית',transliteration:'bereshit',meaning:'En el principio (sintético)'}]};
const ok=(body:unknown)=>({status:200,contentType:'application/json',body:JSON.stringify(body)});

for(const [vpName,vp] of Object.entries(VIEWPORTS))for(const night of [false,true]){
  const tag=`${vpName}-${night?'night':'day'}`,out=(name:string)=>`.impeccable/review/${tag}-${name}.png`;
  test(`ronda final ${tag}`,async({browser})=>{
    test.setTimeout(90000);
    const context=await browser.newContext({viewport:{width:vp.width,height:vp.height},isMobile:vp.isMobile,hasTouch:vp.hasTouch,deviceScaleFactor:1,reducedMotion:'reduce'});
    const settings=JSON.stringify({...JSON.parse(EN_BLOQUE),night});
    await context.addInitScript(`try{if(!localStorage.getItem('verbo.settings'))localStorage.setItem('verbo.settings',${JSON.stringify(settings)});}catch{}`);
    const page=await context.newPage();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('/');await expect(page.locator('.chapter-heading')).toBeVisible();await page.evaluate(()=>document.fonts.ready);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'sin scroll horizontal en la preparación').toBe(true);
    await page.screenshot({path:out('prep'),fullPage:true});
    // Portada: composición estática (movimiento reducido) a mitad de la secuencia.
    await page.getByRole('button',{name:'Entrar en escena'}).click();
    await expect(page.locator('.title-card')).toBeVisible();await page.waitForTimeout(1800);
    await page.screenshot({path:out('intro')});
    await expect(page.locator('.control-ribbon')).toBeVisible({timeout:8000});await expect(page.locator('.intro-stage')).toHaveCount(0,{timeout:8000});await expect(page.locator('.reading-sheet.live')).toBeVisible();
    // Marcas: un versículo resaltado con una palabra, otro elegido.
    await hold(page,2,LIT_HOLD);await expect(litVerses(page)).toHaveCount(1);
    await page.locator('.verse[data-verse="2"] .word').filter({hasText:'gozo,'}).click();await expect(page.locator('.word-lit')).toHaveCount(1);
    await hold(page,3,SPECIAL_HOLD);await expect(specialVerses(page)).toHaveCount(1);
    await expect.poll(()=>page.locator('.verse[data-charge]').count()).toBe(0);
    await page.screenshot({path:out('marks')});
    await openPanel(page);await page.screenshot({path:out('panel')});
    // Diálogo del griego (nota sembrada de Santiago).
    await page.getByRole('button',{name:'Consultar griego'}).click();await closePanel(page);
    await page.locator('.verse').first().getByRole('button',{name:'Ver griego de siervo'}).click();
    await expect(page.getByRole('dialog',{name:'siervo',exact:true})).toBeVisible();await page.screenshot({path:out('greek')});
    await page.getByRole('button',{name:'Cerrar nota del griego'}).click();
    // Cierre con el elegido.
    await openPanel(page);await page.getByRole('button',{name:'Cerrar lectura'}).click();
    await expect(page.locator('.ending-screen')).toBeVisible();await page.waitForTimeout(1000);
    await page.screenshot({path:out('ending')});
    expect(errors).toEqual([]);await context.close();
  });
  test(`diálogo hebreo ${tag}`,async({browser})=>{
    const context=await browser.newContext({viewport:{width:vp.width,height:vp.height},isMobile:vp.isMobile,hasTouch:vp.hasTouch,deviceScaleFactor:1,reducedMotion:'reduce'});
    const settings=JSON.stringify({...JSON.parse(EN_BLOQUE),night,intro:{enabled:false,title:'Fe que obra',duration:4}});
    await context.addInitScript(`try{if(!localStorage.getItem('verbo.settings'))localStorage.setItem('verbo.settings',${JSON.stringify(settings)});}catch{}`);
    await context.route('**/data/biblia.json',r=>r.fulfill(ok(SYNTHETIC_BIBLE)));await context.route('**/data/hebreo.json',r=>r.fulfill(ok(SYNTHETIC_HEBREW)));await context.route('**/data/griego.json',r=>r.fulfill({status:404,body:''}));
    const page=await context.newPage();await page.goto('/');await expect(page.locator('.chapter-heading')).toBeVisible();await page.evaluate(()=>document.fonts.ready);
    await enterScene(page);await openPanel(page);await page.getByRole('button',{name:'Consultar hebreo'}).click();await closePanel(page);
    await page.locator('.verse').first().getByRole('button',{name:'Ver hebreo de principio'}).click();
    await expect(page.getByRole('dialog',{name:'principio',exact:true})).toBeVisible();await page.evaluate(()=>document.fonts.ready);
    await page.screenshot({path:out('hebrew')});await context.close();
  });
}
