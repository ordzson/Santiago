import { Component, ElementRef, AfterViewInit, effect, input, output, signal, viewChild, computed, OnDestroy, untracked } from '@angular/core';
import { Chapter, OriginalNote, tokenize } from './content';
import { IconComponent } from './icon';
import { EDGE_PX, IDLE, SLOP_PX, PressEffect, PressState, pressCancel, pressDown, pressMove, pressUp } from './press';
import type { Box, BurstKind } from './particles-engine';
export interface Frame { enabled: boolean; corner: string; shape: string; size: number; guide: boolean }
/** `rect` va en coordenadas de viewport (getBoundingClientRect); quien lo monte lo pasa al sistema de coordenadas de las partículas. */
export interface ReaderBurst { kind: BurstKind; rect: Box }
/** Velocidad máxima (px/s) del desplazamiento de borde mientras se pinta; crece con la cercanía al borde. */
const EDGE_SPEED=560;
/** La carga visual acelera hacia el umbral (anticipación): lenta al principio, urgente justo antes de cruzar 2 s o 4 s. */
const chargeCurve=(level:number)=>Math.pow(level,1.6);
@Component({selector:'v-reader',standalone:true,imports:[IconComponent],template:`
<div class="reading-sheet" [class.live]="live()" [class.night]="night()" [style.--reading-size.px]="fontSize()" [style.--frame-size.px]="frame().size">
  <div class="sheet-ribbon" aria-hidden="true"></div>
  @for (current of [chapter()]; track current) { <div class="page-sweep" aria-hidden="true"></div> }
  <header class="page-top" [class.camera-row]="frame().enabled && frame().corner.startsWith('top')" [class.frame-left]="frame().corner.endsWith('left')">
    <div class="page-heading"><span class="page-book">{{book()}}</span><span class="chapter-meta">Capítulo {{chapter().number}} <span>· {{version()}}</span></span></div>
    @if (frame().enabled && frame().corner.startsWith('top')) { <div class="presenter-space" [class.square]="frame().shape === 'square'" [class.no-guide]="live() && !frame().guide"><v-icon name="camera"/><span>Tu imagen</span></div> }
  </header>
  <div class="reading-scroll" #scroller (scroll)="onScroll()" (wheel)="manualScroll()" (pointerdown)="onPointerDown($event)" (contextmenu)="onContextMenu($event)" tabindex="0" aria-label="Texto bíblico; desplázate para leer">
    <div class="reading-content" #content>
      @for (current of [chapter()]; track current) { <div class="chapter-heading"><span class="chapter-numeral">{{current.number}}</span><h2>{{current.title || book()}}</h2></div> }
      <p class="sr-only" id="reading-keys">Utiliza las flechas izquierda y derecha para recorrer las palabras, Inicio y Fin para ir a los extremos, y Enter para tocar la palabra. H resalta el versículo y E lo elige para el cierre. Escape muestra el panel.</p>
      <article class="scripture" [attr.aria-label]="book() + ' ' + chapter().number" aria-describedby="reading-keys" (keydown)="onKey($event)">
      @for (verse of verses(); track verse.number) {
        <p class="verse" [attr.data-verse]="verse.number" [class.verse-lit]="verseMarks().has(verse.number)" [class.verse-special]="specials().has(verse.number)"><span class="verse-number" aria-hidden="true">{{verse.number}}</span><span class="verse-words">@for (word of verse.words; track word.index) { @if (word.space) {{{word.text}}} @else {<button class="word" [attr.tabindex]="live() && focusedWord() === verse.number + ':' + word.index ? 0 : -1" (focus)="focusedWord.set(verse.number + ':' + word.index)" [class.word-lit]="wordMarks().has(verse.number + ':' + word.index)" [class.has-note]="original() && word.note" [attr.aria-label]="wordLabel(verse.number, word)" [attr.aria-pressed]="wordPressed(verse.number, word.index)" (click)="tapWord($event, verse.number, word.index, word.note)">{{word.text}}</button>} }</span></p>
      }
      </article>
      <div class="passage-end"><span></span><v-icon name="leaf"/><span></span></div>
      @if (live()) {<button class="chapter-finish" (click)="advance.emit()">Terminar capítulo <v-icon name="arrow"/></button>}
    </div>
  </div>
  <footer class="page-bottom" [class.camera-row]="frame().enabled && frame().corner.startsWith('bottom')" [class.frame-left]="frame().corner.endsWith('left')">
    <div class="page-folio"><span>{{book()}} {{chapter().number}}</span><span class="folio-line" [style.--p]="progress()"></span><span>{{progress()}}<small>%</small></span></div>
    @if (frame().enabled && frame().corner.startsWith('bottom')) {<div class="presenter-space" [class.square]="frame().shape === 'square'" [class.no-guide]="live() && !frame().guide"><v-icon name="camera"/><span>Tu imagen</span></div>}
  </footer>
  <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">{{announcement()}}</div>
</div>
`,styleUrl:'./reader.css'})
export class ReaderComponent implements AfterViewInit, OnDestroy {
  chapter=input.required<Chapter>(); book=input('Santiago'); bookId=input('santiago'); version=input('NBLA'); notes=input<OriginalNote[]>([]);
  fontSize=input(23); night=input(false); live=input(false); playing=input(false); speed=input(26);
  /** Modo «idioma original»: las palabras con nota abren la nota al tocarlas. */
  original=input(false);
  /** Versículos «elegidos para el cierre» del capítulo actual (el almacén vive en la app). */
  specials=input<ReadonlySet<number>>(new Set());
  frame=input<Frame>({enabled:false,corner:'top-right',shape:'circle',size:110,guide:true});
  note=output<OriginalNote>(); advance=output<void>(); pause=output<void>();
  specialToggle=output<number>(); burst=output<ReaderBurst>();
  scroll=viewChild.required<ElementRef<HTMLElement>>('scroller'); content=viewChild.required<ElementRef<HTMLElement>>('content');
  wordMarks=signal(new Set<string>());verseMarks=signal(new Set<number>());progress=signal(0);announcement=signal('');
  focusedWord=signal('1:0');
  verses=computed(()=>this.chapter().verses.map(v=>({...v,words:tokenize(v.text,this.notes().filter(n=>n.book===this.bookId() && n.chapter===this.chapter().number && n.verse===v.number))})));
  private raf=0;
  // Estado del gesto de pulsación (la máquina pura vive en press.ts).
  private press:PressState=IDLE; private pressRaf=0; private pressClock=0;
  private pointer={x:0,y:0,type:'mouse',id:-1};
  private chargeEl:HTMLElement|null=null; private swallow=false; private swallowTimer?:ReturnType<typeof setTimeout>;
  /** Palabras marcadas de un versículo cuyo resaltado se quita durante una pulsación; se restauran si el paso a 4 s lo vuelve a resaltar. */
  private stash=new Map<number,string[]>();
  private readonly swallowClick=(event:Event)=>{if(!this.swallow)return;this.swallow=false;event.preventDefault();event.stopPropagation();};
  /** No pasivo y solo tras los 2 s: antes de eso el desplazamiento nativo manda. */
  private readonly blockTouchScroll=(event:TouchEvent)=>{if(['lit','painting','special'].includes(this.press.phase)&&event.cancelable)event.preventDefault();};
  private readonly onWindowMove=(event:PointerEvent)=>{
    if(event.pointerId!==this.pointer.id)return;
    this.pointer.x=event.clientX;this.pointer.y=event.clientY;
    const wasPressing=this.press.phase==='pressing';
    const r=pressMove(this.press,{x:event.clientX,y:event.clientY,t:performance.now(),verseUnder:this.verseAt(event.clientX,event.clientY,this.press.phase)});
    this.press=r.state;this.apply(r.effects);
    if(wasPressing&&r.effects.some(e=>e.type==='cancel'))this.scrollTakeover();
  };
  private readonly onWindowUp=(event:PointerEvent)=>{
    if(event.pointerId!==this.pointer.id)return;
    const r=pressUp(this.press,performance.now());
    this.apply(r.effects);this.endPress();
  };
  private readonly onWindowCancel=(event:PointerEvent)=>{
    if(event.pointerId!==this.pointer.id)return;
    const wasPressing=this.press.phase==='pressing';
    this.apply(pressCancel(this.press).effects);this.endPress();
    if(wasPressing)this.scrollTakeover();
  };
  constructor(){
    effect(()=>{this.chapter();this.bookId();untracked(()=>this.reset());});
    effect(()=>{if(!this.live())this.endPress();});
    effect(onCleanup=>{
      if(!this.playing() || !this.live())return;
      const velocity=this.speed();let previous=0;let position=this.scroll().nativeElement.scrollTop;
      const tick=(time:number)=>{
        const el=this.scroll().nativeElement;
        if(previous)position+=Math.min(time-previous,64)*velocity/1000;
        previous=time;el.scrollTop=position;
        if(el.scrollTop+el.clientHeight>=el.scrollHeight-2){this.pause.emit();return;}
        this.raf=requestAnimationFrame(tick);
      };
      this.raf=requestAnimationFrame(tick);onCleanup(()=>cancelAnimationFrame(this.raf));
    });
  }
  ngAfterViewInit(){
    const el=this.scroll().nativeElement;
    el.addEventListener('click',this.swallowClick,true);
    el.addEventListener('touchmove',this.blockTouchScroll,{passive:false});
  }
  onScroll(){const el=this.scroll().nativeElement; const max=el.scrollHeight-el.clientHeight;this.progress.set(max>0?Math.round(el.scrollTop/max*100):100);}
  /** Autoscroll: solo la rueda o un desplazamiento manual real lo pausan (no el simple toque ni la carga). */
  manualScroll(){if(this.playing())this.pause.emit();}
  private scrollTakeover(){if(this.pointer.type!=='mouse')this.manualScroll();}
  onContextMenu(event:Event){if(this.live())event.preventDefault();}

  // ---------- Gesto de pulsación larga ----------
  onPointerDown(event:PointerEvent){
    if(!this.live()||event.button!==0||!event.isPrimary||this.press.phase!=='idle')return;
    const verseEl=(event.target as Element).closest?.<HTMLElement>('.verse[data-verse]');
    if(!verseEl){this.watchTouch(event);return;}
    const verse=Number(verseEl.dataset['verse']);
    this.pointer={x:event.clientX,y:event.clientY,type:event.pointerType,id:event.pointerId};
    this.press=pressDown(this.press,{verse,x:event.clientX,y:event.clientY,t:performance.now(),lit:this.verseMarks().has(verse),special:this.specials().has(verse)}).state;
    window.addEventListener('pointermove',this.onWindowMove);window.addEventListener('pointerup',this.onWindowUp);window.addEventListener('pointercancel',this.onWindowCancel);
    this.pressRaf=requestAnimationFrame(this.pressFrame);
  }
  /** Toque fuera de un versículo con el autoscroll activo: si el dedo se desliza (o el navegador toma el gesto y emite pointercancel), es un desplazamiento manual y pausa. El ratón se pausa con la rueda. */
  private touch:{x:number;y:number;id:number}|null=null;
  private readonly onTouchMove=(event:PointerEvent)=>{
    const t=this.touch;if(!t||event.pointerId!==t.id)return;
    if(Math.hypot(event.clientX-t.x,event.clientY-t.y)>SLOP_PX){this.stopTouchWatch();this.manualScroll();}
  };
  private readonly onTouchEnd=(event:PointerEvent)=>{
    const t=this.touch;if(!t||event.pointerId!==t.id)return;
    this.stopTouchWatch();if(event.type==='pointercancel')this.manualScroll();
  };
  private watchTouch(event:PointerEvent){
    if(!this.playing()||event.pointerType==='mouse'||!event.isPrimary)return;
    this.stopTouchWatch();
    this.touch={x:event.clientX,y:event.clientY,id:event.pointerId};
    window.addEventListener('pointermove',this.onTouchMove);window.addEventListener('pointerup',this.onTouchEnd);window.addEventListener('pointercancel',this.onTouchEnd);
  }
  private stopTouchWatch(){
    this.touch=null;
    window.removeEventListener('pointermove',this.onTouchMove);window.removeEventListener('pointerup',this.onTouchEnd);window.removeEventListener('pointercancel',this.onTouchEnd);
  }
  /** Un tick por frame mientras haya pulsación activa; también pinta lo que el autoscroll de borde deslice bajo el dedo quieto. */
  private readonly pressFrame=(time:number)=>{
    const phase=this.press.phase;
    if(phase==='idle'||phase==='cancelled'||phase==='special'){this.pressRaf=0;return;}
    const dt=this.pressClock?Math.min(time-this.pressClock,64):16;this.pressClock=time;
    if(phase==='painting')this.edgeScroll(dt);
    const {x,y}=this.pointer;
    const r=pressMove(this.press,{x,y,t:performance.now(),verseUnder:this.verseAt(x,y,phase)});
    this.press=r.state;this.apply(r.effects);
    this.pressRaf=requestAnimationFrame(this.pressFrame);
  };
  private edgeScroll(dt:number){
    if(this.playing())return;
    const el=this.scroll().nativeElement;const box=el.getBoundingClientRect();const y=this.pointer.y;
    let k=0;
    if(y<box.top+EDGE_PX)k=-Math.min(1,1-(y-box.top)/EDGE_PX);
    else if(y>box.bottom-EDGE_PX)k=Math.min(1,1-(box.bottom-y)/EDGE_PX);
    if(k)el.scrollTop+=k*EDGE_SPEED*dt/1000;
  }
  private verseAt(x:number,y:number,phase:string):number|null{
    if(phase!=='lit'&&phase!=='painting')return null;
    const found=document.elementFromPoint(x,y)?.closest?.<HTMLElement>('.verse[data-verse]');
    return found&&this.content().nativeElement.contains(found)?Number(found.dataset['verse']):null;
  }
  private endPress(){
    cancelAnimationFrame(this.pressRaf);this.pressRaf=0;this.pressClock=0;
    window.removeEventListener('pointermove',this.onWindowMove);window.removeEventListener('pointerup',this.onWindowUp);window.removeEventListener('pointercancel',this.onWindowCancel);
    this.clearCharge();this.stash.clear();this.press=IDLE;
  }
  private apply(effects:PressEffect[]){
    const quiet=effects.some(e=>e.type==='toggleSpecial'); // en el paso a 4 s solo se anuncia el «elegido»
    for(const effect of effects){
      switch(effect.type){
        case 'charge':this.setCharge(effect.verse,effect.stage,effect.level);break;
        case 'setLit':this.setLit(effect.verse,effect.on,!quiet);break;
        case 'paint':this.setLit(effect.verse,effect.on,true);break;
        case 'toggleSpecial':this.toggleSpecial(effect.verse);break;
        case 'burst':this.emitBurst(effect.kind,this.verseEl(effect.verse));break;
        case 'haptic':try{navigator.vibrate?.(effect.kind==='lit'?12:[10,40,18]);}catch{}break;
        case 'swallowClick':this.swallow=true;clearTimeout(this.swallowTimer);this.swallowTimer=setTimeout(()=>this.swallow=false,450);break;
        case 'cancel':this.clearCharge();break;
      }
    }
  }
  private verseEl(verse:number){return this.content().nativeElement.querySelector<HTMLElement>(`.verse[data-verse="${verse}"]`);}
  private emitBurst(kind:BurstKind,el:Element|null){
    if(!el)return;const r=el.getBoundingClientRect();
    this.burst.emit({kind,rect:{left:r.left,top:r.top,width:r.width,height:r.height}});
  }
  /** Carga de luz: variables CSS directas sobre el versículo (sin pasar por señales: un frame por tick). */
  private setCharge(verse:number,stage:1|2,level:number){
    const el=this.verseEl(verse);if(!el)return;
    if(this.chargeEl&&this.chargeEl!==el)this.clearCharge();
    const box=el.getBoundingClientRect();
    el.style.setProperty('--px',(this.pointer.x-box.left).toFixed(1)+'px');
    el.style.setProperty('--py',(this.pointer.y-box.top).toFixed(1)+'px');
    el.style.setProperty('--charge',chargeCurve(level).toFixed(3));
    el.dataset['charge']=String(stage);this.chargeEl=el;
  }
  private clearCharge(){
    const el=this.chargeEl;if(!el)return;
    el.removeAttribute('data-charge');el.style.removeProperty('--charge');el.style.removeProperty('--px');el.style.removeProperty('--py');this.chargeEl=null;
  }

  // ---------- Marcas ----------
  private setLit(verse:number,on:boolean,announce:boolean){
    if(this.verseMarks().has(verse)===on)return;
    this.verseMarks.update(set=>{const next=new Set(set);on?next.add(verse):next.delete(verse);return next;});
    const prefix=verse+':';
    if(!on){
      const words=[...this.wordMarks()].filter(k=>k.startsWith(prefix));
      if(words.length){if(this.press.phase!=='idle')this.stash.set(verse,words);this.wordMarks.update(set=>{const next=new Set(set);words.forEach(k=>next.delete(k));return next;});}
    }else{
      const words=this.stash.get(verse);
      if(words){this.stash.delete(verse);this.wordMarks.update(set=>new Set([...set,...words]));}
    }
    if(announce)this.say(on?`Versículo ${verse} resaltado`:`Versículo ${verse} sin resaltar`);
  }
  private toggleSpecial(verse:number){
    this.say(this.specials().has(verse)?`Versículo ${verse} quitado del cierre`:`Versículo ${verse} elegido para el cierre`);
    this.specialToggle.emit(verse);
  }
  private markable(verse:number){return this.verseMarks().has(verse)||this.specials().has(verse);}
  wordLabel(verse:number,word:{text:string;note?:OriginalNote}){
    if(this.original()&&word.note)return `Ver ${word.note.language==='hebreo'?'hebreo':'griego'} de ${word.text}`;
    return this.markable(verse)?`Resaltar ${word.text}`:word.text;
  }
  wordPressed(verse:number,index:number){return this.markable(verse)?this.wordMarks().has(verse+':'+index):null;}
  tapWord(event:MouseEvent,verse:number,index:number,note?:OriginalNote){
    if(!this.live())return;
    if(this.original()&&note){this.note.emit(note);return;}
    if(!this.markable(verse))return;
    const key=verse+':'+index;const adding=!this.wordMarks().has(key);
    this.wordMarks.update(set=>{const next=new Set(set);adding?next.add(key):next.delete(key);return next;});
    if(adding)this.emitBurst('word',event.currentTarget as Element);
  }
  onKey(event:KeyboardEvent){
    if(!this.live()||event.ctrlKey||event.metaKey||event.altKey)return;
    const target=event.target as HTMLElement;
    if(!target.classList.contains('word'))return;
    const key=event.key.length===1?event.key.toLowerCase():event.key;
    if(key==='h'||key==='e'){
      const verseEl=target.closest<HTMLElement>('.verse[data-verse]');if(!verseEl)return;
      event.preventDefault();event.stopPropagation();
      const verse=Number(verseEl.dataset['verse']);
      if(key==='h'){const on=!this.verseMarks().has(verse);this.setLit(verse,on,true);if(on)this.emitBurst('lit',verseEl);}
      else{const adding=!this.specials().has(verse);this.toggleSpecial(verse);if(adding)this.emitBurst('special',verseEl);}
      return;
    }
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();event.stopPropagation();
    const words=Array.from((event.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('.word'));
    const index=words.indexOf(target as HTMLButtonElement);
    const next=event.key==='Home'?0:event.key==='End'?words.length-1:Math.min(words.length-1,Math.max(0,index+(event.key==='ArrowRight'?1:-1)));
    words[next]?.focus();
  }
  /** Vuelve la hoja al principio: sin marcas, sin pulsación en curso, sin desplazamiento y con el foco en la primera palabra. Se usa al cambiar de capítulo y al empezar o cerrar una escena. */
  reset(){
    this.endPress();this.stopTouchWatch();
    this.focusedWord.set(this.chapter().verses[0].number+':0');
    this.wordMarks.set(new Set());this.verseMarks.set(new Set());this.progress.set(0);
    const el=this.scroll()?.nativeElement;if(el){el.scrollTop=0;el.scrollTo(0,0);}
  }
  /** Anuncio para lectores de pantalla: un mensaje idéntico al anterior se vuelve a leer porque la región se vacía antes (con margen para que Angular pinte el vacío). */
  private say(message:string){
    clearTimeout(this.sayTimer);this.announcement.set('');
    this.sayTimer=setTimeout(()=>this.announcement.set(message),60);
  }
  private sayTimer?:ReturnType<typeof setTimeout>;
  /** Limpia resaltados y palabras del capítulo actual (no toca los elegidos). */
  clear(){this.wordMarks.set(new Set());this.verseMarks.set(new Set());}
  ngOnDestroy(){
    cancelAnimationFrame(this.raf);this.endPress();this.stopTouchWatch();clearTimeout(this.swallowTimer);clearTimeout(this.sayTimer);
    const el=this.scroll()?.nativeElement;el?.removeEventListener('click',this.swallowClick,true);el?.removeEventListener('touchmove',this.blockTouchScroll);
  }
}
