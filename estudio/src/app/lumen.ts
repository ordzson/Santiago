import {Component, input} from '@angular/core';

/** Fases de la luz de atril. La portada recorre off → rise → hold → flood → off; el cierre usa hold/dim. */
export type LumenPhase='off'|'rise'|'hold'|'flood'|'dim';
export const LUMEN_PHASES:readonly LumenPhase[]=['off','rise','hold','flood','dim'];

/**
 * Luz de atril: rayos cálidos que caen desde arriba-centro, resplandor y viñeta.
 * Va como hijo absoluto de `.preview-frame` (sobre el lector, bajo las cintas), sin capturar el puntero.
 * Solo anima `transform`, `opacity` y un `filter` acotado (desenfoque de los rayos durante la inundación).
 * Día: viñeta de tinta para que la luz se lea sobre marfil. Noche: luz aditiva dorada (`screen`).
 * Reduced motion: sin desplazamientos ni giro; solo cambian las opacidades de cada fase.
 */
@Component({
  selector:'v-lumen',
  standalone:true,
  template:`<div class="vignette"></div><div class="glow"></div><div class="rays"><i></i></div>`,
  host:{'[attr.data-phase]':'phase()','[class.night]':'night()','aria-hidden':'true'},
  styles:`
    :host{
      position:absolute;inset:0;display:block;overflow:hidden;pointer-events:none;
      visibility:hidden;transition:visibility 0s linear .7s;
      --ease:cubic-bezier(.16,1,.3,1);
      --dur:.7s;
      /* Estado por fase (se transicionan en las tres capas). */
      --o-vig:0;--o-glow:0;--s-glow:.55;--o-rays:0;--s-rays:.5;--blur:0px;--bright:1;
      /* Día: oro cálido sobre marfil; la viñeta de tinta hace que la luz se lea. */
      --ray-a:rgba(222,172,62,.46);--ray-b:rgba(226,184,84,.30);--ray-c:rgba(230,196,112,.17);
      --glow-core:rgba(255,248,226,.92);--glow-mid:rgba(238,196,104,.30);
      --vig:rgba(44,37,31,.11);
    }
    :host(.night){
      --ray-a:rgba(255,210,122,.34);--ray-b:rgba(243,181,74,.22);--ray-c:rgba(243,181,74,.12);
      --glow-core:rgba(255,214,132,.46);--glow-mid:rgba(243,181,74,.16);
      --vig:rgba(0,0,0,.42);
    }
    :host(:not([data-phase=off])){visibility:visible;transition-delay:0s}

    /* Fases. --dur es la duración de la transición HACIA esa fase; salir es más rápido que entrar. */
    :host([data-phase=off]){--dur:.6s}
    :host([data-phase=rise]){--dur:.9s;--o-vig:1;--o-glow:.85;--s-glow:1;--o-rays:.8;--s-rays:1}
    :host([data-phase=hold]){--dur:.7s;--o-vig:1;--o-glow:1;--s-glow:1;--o-rays:1;--s-rays:1}
    :host([data-phase=flood]){--dur:.9s;--o-vig:.35;--o-glow:1;--s-glow:2.6;--o-rays:.75;--s-rays:1.35;--blur:7px;--bright:1.35}
    :host([data-phase=dim]){--dur:.8s;--o-vig:1;--o-glow:.55;--s-glow:1.1;--o-rays:.5;--s-rays:1.05}

    .vignette,.glow,.rays{position:absolute;transition-duration:var(--dur);transition-timing-function:var(--ease)}

    .vignette{
      inset:0;opacity:var(--o-vig);
      background:radial-gradient(ellipse 85% 80% at 50% 38%,transparent 52%,var(--vig) 100%);
      transition-property:opacity;
    }

    .glow{
      left:-20%;right:-20%;top:-42%;height:92%;
      opacity:var(--o-glow);transform:scale(var(--s-glow));transform-origin:50% 46%;
      background:radial-gradient(ellipse 50% 50% at 50% 46%,var(--glow-core) 0%,var(--glow-mid) 42%,transparent 72%);
      transition-property:opacity,transform;
    }
    :host(.night) .glow{mix-blend-mode:screen}

    .rays{
      inset:-6% -15% -10% -15%;
      opacity:var(--o-rays);transform:scale(var(--s-rays));transform-origin:50% 6%;
      filter:blur(var(--blur)) brightness(var(--bright));
      transition-property:opacity,transform,filter;
    }
    :host(.night) .rays{mix-blend-mode:screen}
    .rays i{
      position:absolute;inset:0;transform-origin:50% 6%;
      /* Haz de 90° centrado hacia abajo: cuñas de ancho y fuerza irregulares, como luz por una ventana alta. */
      background:conic-gradient(from 135deg at 50% 6%,
        transparent 0deg,transparent 5deg,
        var(--ray-c) 9deg,transparent 14deg,
        transparent 17deg,var(--ray-b) 22deg,transparent 27deg,
        var(--ray-a) 33deg,var(--ray-c) 37deg,transparent 40deg,
        var(--ray-b) 44deg,var(--ray-a) 47deg,transparent 52deg,
        transparent 54deg,var(--ray-c) 58deg,transparent 62deg,
        var(--ray-b) 67deg,transparent 73deg,
        transparent 76deg,var(--ray-c) 80deg,transparent 85deg,transparent 90deg);
      -webkit-mask-image:radial-gradient(ellipse 80% 108% at 50% 6%,#000 0%,rgba(0,0,0,.55) 46%,transparent 100%);
      mask-image:radial-gradient(ellipse 80% 108% at 50% 6%,#000 0%,rgba(0,0,0,.55) 46%,transparent 100%);
      animation:lumen-sway 18s ease-in-out infinite alternate;animation-play-state:paused;
    }
    /* Giro de ±3° (solo transform), únicamente mientras la luz está sostenida. */
    :host([data-phase=hold]) .rays i,:host([data-phase=dim]) .rays i{animation-play-state:running}
    @keyframes lumen-sway{from{transform:rotate(-3deg)}to{transform:rotate(3deg)}}

    @media (prefers-reduced-motion:reduce){
      :host([data-phase]){--dur:.45s;--s-glow:1;--s-rays:1;--blur:0px;--bright:1}
      .rays i{animation:none}
    }
  `
})
export class LumenComponent {
  /** `off` apagada · `rise` se abre · `hold` sostenida (rayos oscilan) · `flood` inundación · `dim` atenuada. */
  phase=input<LumenPhase>('off');
  /** Escena nocturna: luz aditiva dorada en lugar de viñeta de tinta sobre marfil. */
  night=input(false);
}
