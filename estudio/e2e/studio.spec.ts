import {test,expect} from '@playwright/test';
import {closePanel,enterScene,hold,litVerses,LIT_HOLD,newPhone,openPanel,specialVerses,SPECIAL_HOLD,verseNumbers} from './helpers';

test('preparación y escena en escritorio y teléfono',async({browser})=>{
  const desktop=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const page=await desktop.newPage();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await expect(page.locator('.chapter-heading')).toBeVisible();await page.evaluate(()=>document.fonts.ready);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const {context:mobile,page:phone,errors:phoneErrors}=await newPhone(browser,false);
  expect(await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await phone.getByRole('button',{name:'Cierre y ajustes de escena'}).click();
  await expect(phone.getByRole('dialog',{name:'A tu manera.',exact:true})).toBeVisible();
  await phone.getByLabel('Cuenta atrás de 3 segundos al entrar').uncheck();
  await phone.getByRole('button',{name:'Listo',exact:true}).click();
  await phone.getByLabel('Mostrar portada').uncheck();
  // Por defecto el recorrido es un capítulo; se extiende hasta el siguiente.
  await expect(phone.getByLabel('Capítulo final')).toHaveCount(0);
  await phone.getByRole('button',{name:'Elegir hasta qué capítulo'}).click();
  await expect(phone.getByLabel('Capítulo final')).toHaveValue(/.+/);
  await enterScene(phone);
  // En lectura solo se ven las dos cintas; el panel está retirado.
  await expect(phone.locator('.play-ribbon')).toBeVisible();
  await expect(phone.locator('.scene-controls')).not.toHaveClass(/visible/);
  await phone.screenshot({path:'.impeccable/review/mobile-scene.png'});
  await expect(phone.locator('.word[tabindex="0"]')).toHaveCount(1);
  await phone.locator('.word[tabindex="0"]').focus();
  await phone.keyboard.press('ArrowRight');
  await expect(phone.locator('.word[tabindex="0"]')).toBeFocused();
  await phone.keyboard.press('Escape');await expect(phone.locator('.scene-controls')).toHaveClass(/visible/);
  await phone.keyboard.press('Escape');
  await expect(phone.locator('.scene-controls')).not.toHaveClass(/visible/);
  // El panel nuevo: idioma original, limpiar marcas, pista de gestos y navegación (sin Luz, Versículo, Trazo ni Scroll).
  await openPanel(phone);
  await expect(phone.getByRole('button',{name:'Consultar griego'})).toBeVisible();
  await expect(phone.getByRole('button',{name:'Limpiar marcas de este capítulo'})).toBeVisible();
  await expect(phone.locator('.press-hint').first()).toContainText('Mantén 1 s para resaltar');
  for(const gone of ['Resaltar versículos','Dibujar con el dedo','Deshacer último trazo'])await expect(phone.getByRole('button',{name:gone})).toHaveCount(0);
  await phone.getByRole('button',{name:'Completar y avanzar capítulo'}).click();
  await expect(phone.locator('.chapter-numeral')).toHaveText('2');
  await openPanel(phone);
  await phone.getByRole('button',{name:'Completar lectura'}).click();await expect(phone.locator('.ending-screen')).toBeVisible();
  // Sin elegidos el cierre muestra el grabado y el mensaje (la captura con elegidos vive en ending.spec.ts).
  await expect(phone.locator('.ending-screen v-ending .pick')).toHaveCount(0);
  expect([...errors,...phoneErrors]).toEqual([]);await desktop.close();await mobile.close();
});

test('pulsación con ratón: resaltar, quitar y pintar varios versículos',async({browser})=>{
  const {context,page,errors}=await newPhone(browser);
  await enterScene(page);
  // Mantener 2 s resalta; repetir quita.
  await hold(page,2,LIT_HOLD);
  await expect(litVerses(page)).toHaveCount(1);
  expect(await verseNumbers(litVerses(page))).toEqual([2]);
  await hold(page,2,LIT_HOLD);
  await expect(litVerses(page)).toHaveCount(0);
  // Un toque corto no resalta nada.
  const box=(await page.locator('.verse[data-verse="2"]').boundingBox())!;await page.mouse.click(box.x+box.width/2,box.y+22);
  await expect(litVerses(page)).toHaveCount(0);
  // Pulsar 2 s y arrastrar sobre dos versículos más: tres resaltados.
  await hold(page,1,LIT_HOLD,[2,3]);
  await expect(litVerses(page)).toHaveCount(3);
  expect(await verseNumbers(litVerses(page))).toEqual([1,2,3]);
  await expect(specialVerses(page)).toHaveCount(0);
  // La pausa en reposo no sigue cargando: sin carga residual.
  await expect(page.locator('.verse[data-charge]')).toHaveCount(0);
  expect(errors).toEqual([]);await context.close();
});

test('palabras: solo se marcan dentro de un versículo resaltado',async({browser})=>{
  const {context,page,errors}=await newPhone(browser);
  await enterScene(page);
  const word=(verse:number)=>page.locator(`.verse[data-verse="${verse}"] .word`).nth(2);
  // Sin resaltar: el toque no hace nada.
  await word(2).click();
  await expect(page.locator('.word-lit')).toHaveCount(0);
  await expect(word(2)).not.toHaveAttribute('aria-pressed',/.*/);
  // Resaltado el versículo 2, el toque alterna.
  await hold(page,2,LIT_HOLD);await expect(litVerses(page)).toHaveCount(1);
  await word(2).click();await expect(word(2)).toHaveClass(/word-lit/);await expect(word(2)).toHaveAttribute('aria-pressed','true');
  await word(2).click();await expect(word(2)).not.toHaveClass(/word-lit/);
  // Otro versículo sin resaltar sigue sin marcar.
  await word(3).click();await expect(page.locator('.word-lit')).toHaveCount(0);
  // Quitar el resaltado borra sus palabras marcadas.
  await word(2).click();await expect(page.locator('.word-lit')).toHaveCount(1);
  await hold(page,2,LIT_HOLD);
  await expect(litVerses(page)).toHaveCount(0);await expect(page.locator('.word-lit')).toHaveCount(0);
  expect(errors).toEqual([]);await context.close();
});

test('pulsación de 4 s elige el versículo y conserva el resaltado previo',async({browser})=>{
  const {context,page,errors}=await newPhone(browser);
  await enterScene(page);
  // Versículo 3: resaltado de antemano → tras 4 s es elegido y sigue resaltado.
  await hold(page,3,LIT_HOLD);await expect(litVerses(page)).toHaveCount(1);
  await hold(page,3,SPECIAL_HOLD);
  await expect(specialVerses(page)).toHaveCount(1);
  expect(await verseNumbers(specialVerses(page))).toEqual([3]);
  expect(await verseNumbers(litVerses(page))).toEqual([3]);
  // Versículo 2: sin resaltar de antemano → elegido y sin resaltar.
  await hold(page,2,SPECIAL_HOLD);
  await expect(specialVerses(page)).toHaveCount(2);
  expect(await verseNumbers(specialVerses(page))).toEqual([2,3]);
  expect(await verseNumbers(litVerses(page))).toEqual([3]);
  // El contador del panel suma los elegidos.
  await openPanel(page);
  await expect(page.locator('.chosen-count')).toContainText('2 para el cierre');
  // «Limpiar marcas» quita resaltados y no toca los elegidos.
  await page.getByRole('button',{name:'Limpiar marcas de este capítulo'}).click();
  await expect(litVerses(page)).toHaveCount(0);await expect(specialVerses(page)).toHaveCount(2);
  await expect(page.locator('.chosen-count')).toContainText('2 para el cierre');
  expect(errors).toEqual([]);await context.close();
});

test('teclado: H resalta y E elige el versículo con foco',async({browser})=>{
  const {context,page,errors}=await newPhone(browser);
  await enterScene(page);
  await page.locator('.word[tabindex="0"]').focus();
  await page.keyboard.press('h');
  await expect(litVerses(page)).toHaveCount(1);
  await expect(page.locator('.reading-sheet [role=status]')).toContainText('Versículo 1 resaltado');
  await page.keyboard.press('e');
  await expect(specialVerses(page)).toHaveCount(1);
  await expect(page.locator('.reading-sheet [role=status]')).toContainText('elegido para el cierre');
  await page.keyboard.press('h');await expect(litVerses(page)).toHaveCount(0);
  await page.keyboard.press('e');await expect(specialVerses(page)).toHaveCount(0);
  expect(errors).toEqual([]);await context.close();
});

test('idioma original, cinta de play y navegación del panel',async({browser})=>{
  const {context,page,errors}=await newPhone(browser);
  await enterScene(page);
  // Sin el interruptor, las palabras con nota no abren nada.
  await expect(page.locator('.verse').first().getByRole('button',{name:'siervo'})).toBeVisible();
  await openPanel(page);
  const toggle=page.getByRole('button',{name:'Consultar griego'});
  await expect(toggle).toBeEnabled();await expect(toggle).toHaveAttribute('aria-pressed','false');
  await toggle.click();await expect(toggle).toHaveAttribute('aria-pressed','true');
  await page.screenshot({path:'.impeccable/review/mobile-panel.png'});
  await closePanel(page);
  await page.locator('.verse').first().getByRole('button',{name:'Ver griego de siervo'}).click();
  await expect(page.getByRole('dialog',{name:'siervo',exact:true})).toBeVisible();await expect(page.locator('.original-word')).toHaveText('δοῦλος');
  await page.screenshot({path:'.impeccable/review/mobile-greek.png'});
  await page.getByRole('button',{name:'Cerrar nota del griego'}).click();
  await expect(page.getByRole('dialog',{name:'siervo',exact:true})).toBeHidden();
  // Cinta play: el texto se desplaza y volver a pulsarla lo detiene.
  const scroller=page.locator('.reading-scroll');const play=page.getByRole('button',{name:'Iniciar o pausar autoscroll'});
  await expect(play).toHaveAttribute('aria-pressed','false');
  const before=await scroller.evaluate(el=>el.scrollTop);
  await play.click();await expect(play).toHaveAttribute('aria-pressed','true');
  await expect.poll(()=>scroller.evaluate(el=>el.scrollTop),{timeout:5000}).toBeGreaterThan(before+2);
  await play.click();await expect(play).toHaveAttribute('aria-pressed','false');
  await page.waitForTimeout(800); // desaceleración suave
  const stopped=await scroller.evaluate(el=>el.scrollTop);await page.waitForTimeout(400);
  expect(await scroller.evaluate(el=>el.scrollTop)).toBe(stopped);
  expect(errors).toEqual([]);await context.close();
});

test('cintas a la izquierda con el encuadre arriba-derecha, sin solapar',async({browser})=>{
  const {context,page,errors}=await newPhone(browser);
  await page.getByRole('checkbox',{name:'Reservar espacio para mi imagen'}).check();
  const overlap=(a:{x:number;y:number;width:number;height:number},b:{x:number;y:number;width:number;height:number})=>a.x<b.x+b.width&&b.x<a.x+a.width&&a.y<b.y+b.height&&b.y<a.y+a.height;
  const check=async(corner:string,expectLeft:boolean)=>{
    await page.getByRole('button',{name:corner,exact:true}).click();
    await enterScene(page);
    const frame=page.locator('.preview-frame');
    if(expectLeft)await expect(frame).toHaveClass(/ribbons-left/);else await expect(frame).not.toHaveClass(/ribbons-left/);
    const f=(await frame.boundingBox())!,c=(await page.locator('.control-ribbon').boundingBox())!,p=(await page.locator('.play-ribbon').boundingBox())!;
    const cam=page.locator('.presenter-space');
    // Orden: ajustes junto al borde, play hacia dentro.
    if(expectLeft){expect(c.x-f.x).toBeLessThan(p.x-f.x);expect(c.x-f.x).toBeLessThan(f.width/2);}
    else{expect(c.x).toBeGreaterThan(p.x);expect(c.x+c.width-f.x).toBeGreaterThan(f.width/2);}
    expect(overlap(c,p),'las cintas no se solapan entre sí').toBe(false);
    if(await cam.count()){const camBox=(await cam.first().boundingBox())!;
      expect(overlap(c,camBox),'ajustes vs encuadre').toBe(false);expect(overlap(p,camBox),'play vs encuadre').toBe(false);}
    await page.getByRole('button',{name:'Mostrar u ocultar herramientas'}).click();
    await page.getByRole('button',{name:'Estudio',exact:true}).click();
    await expect(page.locator('.recording')).toHaveCount(0);
  };
  await check('Arriba derecha',true);
  await check('Arriba izquierda',false);
  await check('Abajo derecha',false);
  expect(errors).toEqual([]);await context.close();
});

test('encuadre, datos externos y límites de los tres modos',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});const page=await context.newPage();
  await page.goto('/');await expect(page.locator('.chapter-heading')).toBeVisible();
  await page.getByRole('checkbox',{name:'Reservar espacio para mi imagen'}).check();
  for(const corner of ['Arriba izquierda','Arriba derecha','Abajo izquierda','Abajo derecha']){
    await page.getByRole('button',{name:corner,exact:true}).click();
    await expect(page.locator('.presenter-space')).toBeVisible();
    await expect.poll(async()=>{const camera=await page.locator('.presenter-space').boundingBox();const text=await page.locator('.reading-scroll').boundingBox();
      if(!camera||!text)return false;return camera.y+camera.height<=text.y+1 || camera.y>=text.y+text.height-1;},{timeout:3000}).toBe(true);
  }
  await page.getByRole('button',{name:'Noche',exact:true}).click();await expect(page.locator('.reading-sheet')).toHaveClass(/night/);
  await page.getByRole('button',{name:'Mi contenido',exact:true}).click();
  const synthetic={version:'Prueba de integración',books:[{id:'a',name:'Libro A',chapters:[1,2].map(number=>({number,verses:[{number:1,text:'Contenido sintético para pruebas.'}]}))},{id:'b',name:'Libro B',chapters:[{number:1,verses:[{number:1,text:'Contenido sintético del segundo libro.'}]}]}]};
  await page.locator('input[type=file]').first().setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{bad')});await expect(page.getByRole('alert')).toContainText('El JSON no es válido');
  await page.locator('input[type=file]').first().setInputFiles({name:'test.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(synthetic))});
  await expect(page.locator('.content-status')).toContainText('2 libros');await page.getByRole('button',{name:'Cerrar ventana'}).click();
  await page.getByRole('button',{name:'Cierre y ajustes de escena'}).click();await page.getByLabel('Cuenta atrás de 3 segundos al entrar').uncheck();await page.getByLabel('Mostrar la pantalla de cierre').selectOption('manual');await page.getByRole('button',{name:'Listo',exact:true}).click();
  await page.getByLabel('Capítulo inicial').selectOption({label:'Cap. 2'});await expect(page.getByLabel('Libro final')).toHaveCount(0);await expect(page.locator('.session-summary strong')).toHaveText('Libro A 2');await page.getByRole('button',{name:'Elegir hasta qué capítulo'}).click();await page.getByLabel('Libro final').selectOption({label:'Libro B'});
  await page.getByRole('button',{name:'Entrar en escena'}).click();await page.getByRole('button',{name:'Mostrar u ocultar herramientas'}).click();await page.getByRole('button',{name:'Completar y avanzar capítulo'}).click();await expect(page.locator('.page-book')).toHaveText('Libro B');
  await page.getByRole('button',{name:'Completar lectura'}).click();await expect(page.locator('.ending-screen')).toHaveCount(0);await page.getByRole('button',{name:'Cerrar lectura',exact:true}).click();await expect(page.locator('.ending-screen')).toBeVisible();
  await page.getByRole('button',{name:'Mostrar u ocultar herramientas'}).click();await page.getByRole('button',{name:'Volver al estudio'}).click();
  await page.getByRole('button',{name:'Un libro',exact:false}).click();await page.getByRole('button',{name:'Entrar en escena'}).click();await expect(page.locator('.chapter-numeral')).toHaveText('1');await page.getByRole('button',{name:'Mostrar u ocultar herramientas'}).click();await page.getByRole('button',{name:'Completar y avanzar capítulo'}).click();await expect(page.locator('.page-book')).toHaveText('Libro A');await expect(page.locator('.chapter-numeral')).toHaveText('2');await page.getByRole('button',{name:'Completar y avanzar capítulo'}).click();await expect(page.locator('.page-book')).toHaveText('Libro B');
  await page.getByRole('button',{name:'Estudio',exact:true}).click();await page.getByRole('button',{name:'Capítulo a capítulo',exact:false}).click();await page.getByRole('button',{name:'Entrar en escena'}).click();await page.getByRole('button',{name:'Mostrar u ocultar herramientas'}).click();await page.getByRole('button',{name:'Completar y avanzar capítulo'}).click();await expect(page.locator('.page-book')).toHaveText('Libro B');
  await context.close();
});
