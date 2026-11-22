import {Component, input} from '@angular/core';

/** Fases de la tarjeta: `off` oculta · `in` entra (título → regla → rótulo) y se sostiene · `out` se eleva y desvanece. */
export type TitleCardPhase='off'|'in'|'out';
export const TITLE_CARD_PHASES:readonly TitleCardPhase[]=['off','in','out'];

/**
 * Tarjeta de portada: título en Noto Serif, regla carmín y rótulo en Gelasio cursiva.
 * Va dentro de la portada, sobre `v-lumen`. La entrada es una secuencia fija desde que la fase pasa a `in`
 * (título 0,4 s con desenfoque→nitidez, interletra y máscara de revelado; regla 1,0 s; rótulo 1,35 s).
 * `out` solo cambia el contenedor, así las animaciones de entrada no se reinician.
 * `compact` es la versión de una línea para la cabecera del cierre: sin regla y sin entrada escalonada.
 * Reduced motion: composición estática; `out` es un fundido de opacidad.
 */
@Component({
  selector:'v-title-card',
  standalone:true,
  template:`<div class="card" [class.solo]="!title()"><p class="title" [class.empty]="!title()">{{title()}}</p><span class="rule" aria-hidden="true"></span>@if(label()){<p class="label">{{label()}}</p>}</div>`,
  host:{class:'title-card','[attr.data-phase]':'phase()','[class.night]':'night()','[class.compact]':'compact()'},
  styles:`
    :host{
      --ease:cubic-bezier(.16,1,.3,1);
      --ink:#2c251f;--rule:#b92d40;--label:#4a3f35;
      position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
      padding:0 9%;text-align:center;pointer-events:none;
      opacity:0;visibility:hidden;
    }
    :host(.night){--ink:#eee4d2;--rule:#e17581;--label:#d8cbb6}
    :host(:not([data-phase=off])){opacity:1;visibility:visible}

    .card{
      display:flex;flex-direction:column;align-items:center;gap:20px;max-width:min(100%,760px);
      transition:opacity .5s cubic-bezier(.3,0,.5,1),transform .9s var(--ease),filter .6s ease-out;
    }
    :host([data-phase=out]) .card{opacity:0;transform:translateY(-30px) scale(1.025);filter:blur(5px)}

    .title{
      /* El relleno lateral deja sitio al desenfoque: la máscara recorta en la caja del elemento. */
      margin:0;padding:.14em .45em;
      font:400 clamp(36px,11.2vw,84px)/1.1 var(--display);letter-spacing:-.03em;color:var(--ink);
      text-wrap:balance;overflow-wrap:anywhere;max-width:calc(100% + 2 * .45em);
      /* Máscara de revelado: un borde suave que barre de izquierda a derecha. */
      -webkit-mask-image:linear-gradient(90deg,#000 0,#000 38.4%,transparent 61.5%);
      mask-image:linear-gradient(90deg,#000 0,#000 38.4%,transparent 61.5%);
      -webkit-mask-size:260% 100%;mask-size:260% 100%;
      -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;
    }
    .title.empty{display:none}

    .rule{display:block;width:46px;height:2px;background:var(--rule);transform-origin:50% 50%}
    .label{
      margin:0;font:italic 400 clamp(19px,5.4vw,28px)/1.35 var(--serif);color:var(--label);
      overflow-wrap:anywhere;text-wrap:balance;max-width:100%;
    }
    /* Sin título: el rótulo ocupa su lugar. */
    .solo .label{font-size:clamp(30px,9vw,60px);line-height:1.15;color:var(--ink);letter-spacing:-.02em}

    :host(:not([data-phase=off])) .title{animation:card-title 1.3s var(--ease) .4s both}
    :host(:not([data-phase=off])) .rule{animation:card-rule .85s var(--ease) 1s both}
    :host(:not([data-phase=off])) .label{animation:card-label 1s var(--ease) 1.35s both}
    @keyframes card-title{
      from{opacity:0;filter:blur(16px);letter-spacing:.07em;transform:translateY(14px);-webkit-mask-position:100% 0;mask-position:100% 0}
      55%{opacity:1}
      to{opacity:1;filter:blur(0);letter-spacing:-.03em;transform:none;-webkit-mask-position:0 0;mask-position:0 0}
    }
    @keyframes card-rule{from{opacity:0;transform:scaleX(0)}to{opacity:1;transform:none}}
    @keyframes card-label{from{opacity:0;filter:blur(6px);transform:translateY(9px)}to{opacity:1;filter:blur(0);transform:none}}

    /* Cabecera compacta del cierre: «Título · Rótulo» en una línea, versalitas. */
    :host(.compact){position:static;inset:auto;padding:0;display:block}
    :host(.compact) .card{flex-direction:row;flex-wrap:wrap;justify-content:center;gap:0 .6em;max-width:100%}
    :host(.compact) .title,:host(.compact) .label{
      font:500 var(--compact-size,12px)/1.5 var(--ui);font-variant-caps:all-small-caps;letter-spacing:.14em;color:var(--label);
      -webkit-mask-image:none;mask-image:none;padding:0;text-transform:none;
    }
    :host(.compact) .rule{display:none}
    :host(.compact) .title:not(.empty)+.rule+.label::before{content:"·";margin-right:.6em}
    :host(.compact) .title,:host(.compact) .label{animation:card-fade .9s var(--ease) both!important}
    @keyframes card-fade{from{opacity:0}to{opacity:1}}

    @media (prefers-reduced-motion:reduce){
      :host(:not([data-phase=off])) .title,:host(:not([data-phase=off])) .rule,:host(:not([data-phase=off])) .label{animation:none!important}
      .card{transition:opacity .9s linear}
      :host([data-phase=out]) .card{transform:none;filter:none}
    }
  `
})
export class TitleCardComponent {
  /** Texto libre del episodio; vacío → solo el rótulo. */
  title=input('');
  /** Rótulo calculado del recorrido (`sceneLabel`). */
  label=input('');
  phase=input<TitleCardPhase>('off');
  night=input(false);
  /** Una línea para la cabecera del cierre. */
  compact=input(false);
}
