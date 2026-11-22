import {test,expect} from '@playwright/test';
import {enterScene,hold,litVerses,LIT_HOLD,newPhone,openPanel} from './helpers';

test('una escena nueva empieza limpia: sin marcas y arriba del capítulo',async({browser})=>{
  const {context,page,errors}=await newPhone(browser);
  await enterScene(page);
  await hold(page,2,LIT_HOLD);await expect(litVerses(page)).toHaveCount(1);
  await page.locator('.reading-scroll').evaluate(el=>{el.scrollTop=300;});
  expect(await page.locator('.reading-scroll').evaluate(el=>el.scrollTop)).toBeGreaterThan(100);
  await openPanel(page);
  await page.getByRole('button',{name:'Estudio'}).click();
  await expect(page.getByRole('button',{name:'Entrar en escena'})).toBeVisible();
  await expect(litVerses(page)).toHaveCount(0);
  await enterScene(page);
  await expect(litVerses(page)).toHaveCount(0);
  await expect(page.locator('.word-lit')).toHaveCount(0);
  expect(await page.locator('.reading-scroll').evaluate(el=>el.scrollTop)).toBe(0);
  expect(errors).toEqual([]);await context.close();
});

test('con autoscroll, deslizar el dedo fuera de un versículo pausa y un toque quieto no',async({browser})=>{
  const {context,page,errors}=await newPhone(browser);
  await enterScene(page);
  const play=page.locator('.play-ribbon');
  const touch=(type:string,x:number,y:number)=>page.evaluate(([t,px,py])=>{
    const target=t==='pointerdown'?document.querySelector('.chapter-heading')!:window;
    target.dispatchEvent(new PointerEvent(t as string,{bubbles:true,composed:true,pointerId:7,pointerType:'touch',isPrimary:true,button:0,clientX:px as number,clientY:py as number}));
  },[type,x,y] as const);
  const box=(await page.locator('.chapter-heading').boundingBox())!;
  const x=box.x+20,y=box.y+box.height/2;

  await play.click();await expect(play).toHaveAttribute('aria-pressed','true');
  // Toque quieto fuera de los versículos: no pausa.
  await touch('pointerdown',x,y);await touch('pointerup',x,y);
  await page.waitForTimeout(250);
  await expect(play).toHaveAttribute('aria-pressed','true');
  // Deslizamiento: pausa.
  await touch('pointerdown',x,y);await touch('pointermove',x,y+4);
  await page.waitForTimeout(150);
  await expect(play).toHaveAttribute('aria-pressed','true');
  await touch('pointermove',x,y+40);
  await expect(play).toHaveAttribute('aria-pressed','false');
  expect(errors).toEqual([]);await context.close();
});
