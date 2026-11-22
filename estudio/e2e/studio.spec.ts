import {test,expect} from '@playwright/test';
test('preparación y escena en escritorio y teléfono',async({browser})=>{
  const desktop=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const page=await desktop.newPage();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await expect(page.locator('.chapter-heading')).toBeVisible();await page.evaluate(()=>document.fonts.ready);
  
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1,reducedMotion:'reduce'});
  const phone=await mobile.newPage();phone.on('pageerror',e=>errors.push(e.message));
  await phone.goto('/');await expect(phone.locator('.chapter-heading')).toBeVisible();await phone.evaluate(()=>document.fonts.ready);
  
  expect(await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await phone.getByRole('button',{name:'Cierre y ajustes de escena'}).click();
  await expect(phone.getByRole('dialog',{name:'A tu manera.',exact:true})).toBeVisible();
  await phone.getByLabel('Cuenta atrás de 3 segundos al entrar').uncheck();
  await phone.getByRole('button',{name:'Listo',exact:true}).click();
  await phone.getByRole('button',{name:'Entrar en escena'}).click();
  await expect(phone.locator('.recording')).toBeVisible();await expect(phone.locator('.control-ribbon')).toBeVisible();
  await phone.screenshot({path:'.impeccable/review/mobile-scene.png'});
  await expect(phone.locator('.word[tabindex="0"]')).toHaveCount(1);
  await phone.locator('.word[tabindex="0"]').focus();
  await phone.keyboard.press('ArrowRight');
  await expect(phone.locator('.word[tabindex="0"]')).toBeFocused();
  await phone.keyboard.press('Escape');await expect(phone.locator('.scene-controls')).toHaveClass(/visible/);
  await phone.keyboard.press('Escape');
  await expect(phone.locator('.scene-controls')).not.toHaveClass(/visible/);
  const word=phone.locator('.verse').nth(1).locator('.word').first();await word.click();await expect(word).toHaveClass(/word-lit/);
  await word.click();await expect(word).not.toHaveClass(/word-lit/);
  await phone.getByRole('button',{name:'Mostrar u ocultar herramientas'}).click();
  await phone.getByRole('button',{name:'Resaltar versículos'}).click();
  await phone.getByRole('button',{name:'Resaltar versículos'}).focus();
  await phone.waitForTimeout(5200);await expect(phone.locator('.scene-controls')).toHaveClass(/visible/);
  await phone.getByRole('button',{name:'Resaltar versículo 2',exact:true}).click();await phone.getByRole('button',{name:'Resaltar versículo 3',exact:true}).click();
  await expect(phone.locator('.verse-lit')).toHaveCount(2);
  await phone.getByRole('button',{name:'Consultar griego'}).click();
  await phone.locator('.verse').first().getByRole('button',{name:'Ver griego de siervo'}).click();
  await expect(phone.getByRole('dialog',{name:'siervo',exact:true})).toBeVisible();await expect(phone.locator('.greek-word')).toHaveText('δοῦλος');
  await phone.screenshot({path:'.impeccable/review/mobile-greek.png'});
  await phone.getByRole('button',{name:'Cerrar nota del griego'}).click();
  await phone.getByRole('button',{name:'Dibujar con el dedo'}).click();
  const canvas=phone.locator('.ink-layer');const box=(await canvas.boundingBox())!;
  await phone.mouse.move(box.x+65,box.y+180);await phone.mouse.down();await phone.mouse.move(box.x+240,box.y+205,{steps:8});await phone.mouse.up();
  await expect(phone.locator('.ink-layer path')).toHaveCount(2);
  await phone.getByRole('button',{name:'Deshacer último trazo'}).click();await expect(phone.locator('.ink-layer path')).toHaveCount(1);
  await phone.getByRole('button',{name:'Iniciar o pausar autoscroll'}).click();
  const before=await phone.locator('.reading-scroll').evaluate(el=>el.scrollTop);await phone.waitForTimeout(500);
  expect(await phone.locator('.reading-scroll').evaluate(el=>el.scrollTop)).toBeGreaterThan(before);
  await phone.getByRole('button',{name:'Iniciar o pausar autoscroll'}).click();
  await phone.getByRole('button',{name:'Completar y avanzar capítulo'}).click();
  await expect(phone.locator('.chapter-numeral')).toHaveText('2');
  await phone.getByRole('button',{name:'Completar lectura'}).click();await expect(phone.locator('.ending-screen')).toBeVisible();
  await phone.screenshot({path:'.impeccable/review/mobile-ending.png'});
  expect(errors).toEqual([]);await desktop.close();await mobile.close();
});

test('encuadre, datos externos y límites de los tres modos',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});const page=await context.newPage();
  await page.goto('/');await expect(page.locator('.chapter-heading')).toBeVisible();
  await page.getByRole('checkbox',{name:'Reservar espacio para mi imagen'}).check();
  for(const corner of ['Arriba izquierda','Arriba derecha','Abajo izquierda','Abajo derecha']){
    await page.getByRole('button',{name:corner,exact:true}).click();
    const camera=(await page.locator('.presenter-space').boundingBox())!;const text=(await page.locator('.reading-scroll').boundingBox())!;
    expect(camera.y+camera.height<=text.y+1 || camera.y>=text.y+text.height-1).toBe(true);
  }
  await page.getByRole('button',{name:'Noche',exact:true}).click();await expect(page.locator('.reading-sheet')).toHaveClass(/night/);
  await page.getByRole('button',{name:'Mi contenido',exact:true}).click();
  const synthetic={version:'Prueba de integración',books:[{id:'a',name:'Libro A',chapters:[1,2].map(number=>({number,verses:[{number:1,text:'Contenido sintético para pruebas.'}]}))},{id:'b',name:'Libro B',chapters:[{number:1,verses:[{number:1,text:'Contenido sintético del segundo libro.'}]}]}]};
  await page.locator('input[type=file]').first().setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{bad')});await expect(page.getByRole('alert')).toContainText('El JSON no es válido');
  await page.locator('input[type=file]').first().setInputFiles({name:'test.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(synthetic))});
  await expect(page.locator('.content-status')).toContainText('2 libros');await page.getByRole('button',{name:'Cerrar ventana'}).click();
  await page.getByRole('button',{name:'Cierre y ajustes de escena'}).click();await page.getByLabel('Cuenta atrás de 3 segundos al entrar').uncheck();await page.getByLabel('Mostrar la pantalla de cierre').selectOption('manual');await page.getByRole('button',{name:'Listo',exact:true}).click();
  await page.getByLabel('Capítulo inicial').selectOption({label:'Cap. 2'});await page.getByLabel('Libro final').selectOption({label:'Libro B'});
  await page.getByRole('button',{name:'Entrar en escena'}).click();await page.getByRole('button',{name:'Mostrar u ocultar herramientas'}).click();await page.getByRole('button',{name:'Completar y avanzar capítulo'}).click();await expect(page.locator('.page-book')).toHaveText('Libro B');
  await page.getByRole('button',{name:'Completar lectura'}).click();await expect(page.locator('.ending-screen')).toHaveCount(0);await page.getByRole('button',{name:'Cerrar lectura',exact:true}).click();await expect(page.locator('.ending-screen')).toBeVisible();
  await page.getByRole('button',{name:'Mostrar u ocultar herramientas'}).click();await page.getByRole('button',{name:'Volver al estudio'}).click();
  await page.getByRole('button',{name:'Un libro',exact:false}).click();await page.getByRole('button',{name:'Entrar en escena'}).click();await expect(page.locator('.chapter-numeral')).toHaveText('1');await page.getByRole('button',{name:'Mostrar u ocultar herramientas'}).click();await page.getByRole('button',{name:'Completar y avanzar capítulo'}).click();await expect(page.locator('.page-book')).toHaveText('Libro A');await expect(page.locator('.chapter-numeral')).toHaveText('2');await page.getByRole('button',{name:'Completar y avanzar capítulo'}).click();await expect(page.locator('.page-book')).toHaveText('Libro B');
  await page.getByRole('button',{name:'Estudio',exact:true}).click();await page.getByRole('button',{name:'Capítulo a capítulo',exact:false}).click();await page.getByRole('button',{name:'Entrar en escena'}).click();await page.getByRole('button',{name:'Mostrar u ocultar herramientas'}).click();await page.getByRole('button',{name:'Completar y avanzar capítulo'}).click();await expect(page.locator('.page-book')).toHaveText('Libro B');
  await context.close();
});
