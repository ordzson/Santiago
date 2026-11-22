import {AfterViewInit, Component, ElementRef, OnDestroy, effect, inject, input, viewChild} from '@angular/core';
import {ChosenVerse} from './chosen';
import {EngravingComponent} from './engraving';
import {IconComponent} from './icon';
import {TitleCardComponent} from './title-card';
import {fitSize, pickColumns, pickSizes} from './ending-fit';

/**
 * Composición del cierre (la luz y el polvo los pone la app debajo y encima):
 * cabecera de una línea (`título · rótulo`), los versículos elegidos en orden canónico, el mensaje final y la hoja.
 * - 0 elegidos: grabado y mensaje grande.
 * - 1: cita grande centrada. 2–3: apilados con reglas. 4+: columnas en escritorio, pila compacta en móvil.
 * La letra baja por escalones hasta caber (mínimo 15 px, ver `ending-fit.ts`); si aun así no cabe, la lista
 * hace scroll interno. Las acciones del cierre las pone la app (`.ending-actions`): aquí se les reserva sitio abajo.
 */
@Component({
  selector:'v-ending',
  standalone:true,
  imports:[TitleCardComponent,EngravingComponent,IconComponent],
  template:`
    <header class="head"><v-title-card [compact]="true" phase="in" [title]="title()" [label]="label()" [night]="night()"/></header>
    <section class="body">
      @if(chosen().length){
        <ol #picks class="picks" [attr.data-count]="chosen().length" aria-label="Versículos elegidos">
          @for(verse of chosen(); track verse.bookId+':'+verse.chapter+':'+verse.verse){
            <li class="pick"><i class="mark" aria-hidden="true"></i><blockquote><p class="text">{{verse.text}}</p><cite>{{verse.bookName}} {{verse.chapter}}:{{verse.verse}}</cite></blockquote></li>
          }
        </ol>
      }@else{<v-engraving class="art"/>}
    </section>
    <footer class="foot"><span class="rule" aria-hidden="true"></span><h2>{{message()}}</h2><span class="leaf"><v-icon name="leaf"/></span></footer>
  `,
  host:{class:'ending','[class.none]':'!chosen().length','[class.one]':'chosen().length===1'},
  styles:`
    :host{
      --ease:cubic-bezier(.16,1,.3,1);
      position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;
      /* Abajo se reserva el sitio de las acciones (.ending-actions: 44 px a 32 px del borde). */
      padding:max(28px,env(safe-area-inset-top)) 28px 88px;text-align:center;color:var(--ink);
      --compact-size:15px;
    }
    .head{flex:none;width:100%;display:flex;justify-content:center;padding:0 36px 20px}
    .body{flex:1 1 auto;min-height:0;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center}
    .foot{flex:none;display:flex;flex-direction:column;align-items:center;padding-top:22px}

    .rule{display:block;width:30px;height:2px;background:var(--red);margin-bottom:22px}
    h2{
      margin:0;font:400 clamp(26px,6.6vw,34px)/1.2 var(--display);letter-spacing:-.03em;
      max-width:20ch;text-wrap:balance;overflow-wrap:anywhere;
    }
    .leaf{margin-top:18px;color:var(--red);display:inline-flex}

    /* Sin elegidos: el mensaje es el cierre. */
    :host(.none) .body{flex:0 0 auto;margin-block:auto 0}
    :host(.none){padding-bottom:64px}
    :host(.none) .head{padding-bottom:0}
    :host(.none) .foot{padding-top:26px;margin-bottom:auto}
    :host(.none) .art{width:min(100%,330px);height:160px}
    :host(.none) .rule{margin-bottom:30px}
    :host(.none) h2{font-size:clamp(40px,10.6vw,45px);line-height:1.18;letter-spacing:-.035em;max-width:14ch}
    :host(.none) .leaf{margin-top:40px}

    .picks{
      --fs:22px;--cols:1;
      list-style:none;margin:0;padding:0;width:100%;max-width:720px;
      flex:0 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:var(--rule) transparent;
      /* Columnas CSS: equilibran el alto y mantienen el orden canónico de arriba abajo, columna a columna. */
      columns:var(--cols);column-gap:56px;text-align:left;
    }
    .picks[data-cols="2"]{max-width:1000px}
    .picks[data-cols="3"]{max-width:1240px}
    .pick{
      display:grid;grid-template-columns:14px minmax(0,1fr);column-gap:14px;align-items:start;
      padding:calc(var(--fs) * .62) 0;break-inside:avoid;
    }
    .pick+.pick{border-top:1px solid var(--rule)}
    .picks:not([data-cols="1"]) .pick{border-top:0}
    .mark{
      display:block;width:14px;height:22px;margin-top:calc(var(--fs) * .2);background:var(--red);
      clip-path:polygon(0 0,100% 0,100% 100%,50% 76%,0 100%);
    }
    blockquote{margin:0;min-width:0}
    .text{
      margin:0;font:400 var(--fs)/1.4 var(--serif);color:var(--ink);
      text-wrap:pretty;overflow-wrap:anywhere;hyphens:manual;
    }
    cite{
      display:block;margin-top:calc(var(--fs) * .32);
      font:500 15px/1.4 var(--ui);font-style:normal;letter-spacing:.04em;color:var(--muted);
    }

    /* Una cita: grande, centrada, con el marcapáginas arriba. */
    :host(.one) .picks{max-width:820px;text-align:center}
    :host(.one) .pick{grid-template-columns:minmax(0,1fr);justify-items:center;row-gap:18px;padding:0}
    :host(.one) .mark{width:18px;height:28px;margin:0}
    :host(.one) .text{line-height:1.36;letter-spacing:-.01em;text-wrap:balance}
    :host(.one) cite{margin-top:calc(var(--fs) * .5);font-size:16px;letter-spacing:.08em;text-transform:uppercase}

    /* Pila compacta (4+ elegidos en pantalla estrecha): la referencia cierra la cita en su última línea. */
    .picks[data-dense] .pick{padding-block:calc(var(--fs) * .42);column-gap:12px;grid-template-columns:12px minmax(0,1fr)}
    .picks[data-dense] .mark{width:12px;height:19px;margin-top:0}
    .picks[data-dense] .text{display:inline;line-height:1.34}
    .picks[data-dense] cite{display:inline;margin:0 0 0 .55em;white-space:nowrap;font-size:15px}
    :host(.dense){padding-inline:20px}
    :host(.dense) .head{padding-bottom:12px}
    :host(.dense) .foot{padding-top:14px}
    :host(.dense) .rule{margin-bottom:12px}
    :host(.dense) h2{font-size:24px}
    :host(.dense) .leaf{margin-top:10px}

    @media (prefers-reduced-motion:no-preference){
      .pick{animation:pick-in .9s var(--ease) both}
      .pick:nth-child(2){animation-delay:.12s}.pick:nth-child(3){animation-delay:.24s}.pick:nth-child(n+4){animation-delay:.34s}
      .foot{animation:pick-in 1s var(--ease) .45s both}
    }
    @keyframes pick-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
  `
})
export class EndingComponent implements AfterViewInit, OnDestroy {
  title=input('');
  label=input('');
  chosen=input<readonly ChosenVerse[]>([]);
  message=input('');
  night=input(false);
  private picks=viewChild<ElementRef<HTMLElement>>('picks');
  private host=inject<ElementRef<HTMLElement>>(ElementRef);
  private observer?:ResizeObserver;
  private frame=0;
  constructor(){
    // Cambia el contenido → reajusta tras pintar el DOM nuevo.
    effect(()=>{this.chosen();this.message();this.label();this.title();this.night();this.schedule();});
  }
  ngAfterViewInit(){
    if(typeof ResizeObserver==='function'){this.observer=new ResizeObserver(()=>this.schedule());this.observer.observe(this.host.nativeElement);}
    document.fonts?.ready.then(()=>this.schedule());
  }
  ngOnDestroy(){this.observer?.disconnect();cancelAnimationFrame(this.frame);}
  private schedule(){cancelAnimationFrame(this.frame);this.frame=requestAnimationFrame(()=>this.fit());}
  /** Columnas según el ancho y la letra más grande que quepa sin que la lista haga scroll. */
  private fit(){
    const list=this.picks()?.nativeElement;
    if(!list)return;
    const count=this.chosen().length;
    const cols=pickColumns(count,list.parentElement?.clientWidth??0);
    list.dataset['cols']=String(cols);
    list.style.setProperty('--cols',String(cols));
    const dense=count>=4&&cols===1;
    if(dense)list.setAttribute('data-dense','');else list.removeAttribute('data-dense');
    this.host.nativeElement.classList.toggle('dense',dense);
    const px=fitSize(pickSizes(count),size=>{list.style.setProperty('--fs',size+'px');return list.scrollHeight<=list.clientHeight+1&&list.scrollWidth<=list.clientWidth+1;});
    list.style.setProperty('--fs',px+'px');
  }
}
