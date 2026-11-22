import { Component, ElementRef, effect, input, output, signal, viewChild, computed, OnDestroy } from '@angular/core';
import { Chapter, GreekNote, tokenize } from './content';
import { IconComponent } from './icon';
export type Tool = 'word' | 'verse' | 'pen' | 'greek';
export interface Frame { enabled: boolean; corner: string; shape: string; size: number; guide: boolean }
interface Point {x:number;y:number}
@Component({selector:'v-reader',standalone:true,imports:[IconComponent],template:`
<div class="reading-sheet" [class.live]="live()" [class.night]="night()" [style.--reading-size.px]="fontSize()" [style.--frame-size.px]="frame().size">
  <div class="sheet-ribbon" aria-hidden="true"></div>
  <header class="page-top" [class.camera-row]="frame().enabled && frame().corner.startsWith('top')" [class.frame-left]="frame().corner.endsWith('left')">
    <div class="page-heading"><span class="page-book">{{book()}}</span><span class="chapter-meta">Capítulo {{chapter().number}} <span>· {{version()}}</span></span></div>
    @if (frame().enabled && frame().corner.startsWith('top')) { <div class="presenter-space" [class.square]="frame().shape === 'square'" [class.no-guide]="live() && !frame().guide"><v-icon name="camera"/><span>Tu imagen</span></div> }
  </header>
  <div class="reading-scroll" #scroller (scroll)="onScroll()" (wheel)="manualScroll()" (touchstart)="manualScroll()" tabindex="0" aria-label="Texto bíblico; desplázate para leer">
    <div class="reading-content" #content>
      <div class="chapter-heading"><span class="chapter-numeral">{{chapter().number}}</span><h2>{{chapter().title || book()}}</h2></div>
      <p class="sr-only" id="reading-keys">Utiliza las flechas izquierda y derecha para recorrer las palabras, Inicio y Fin para ir a los extremos, y Enter para aplicar la herramienta. Escape muestra las herramientas.</p>
      <article class="scripture" [class.pen-active]="live() && tool() === 'pen'" [attr.aria-label]="book() + ' ' + chapter().number" aria-describedby="reading-keys" (keydown)="navigateWords($event)">
      @for (verse of verses(); track verse.number) {
        <p class="verse" [class.verse-lit]="verseMarks().has(verse.number)"><button class="verse-number" tabindex="-1" [attr.aria-label]="'Resaltar versículo ' + verse.number" [attr.aria-pressed]="verseMarks().has(verse.number)" (click)="toggleVerse(verse.number)">{{verse.number}}</button><span class="verse-words">@for (word of verse.words; track word.index) { @if (word.space) {{{word.text}}} @else {<button class="word" [attr.tabindex]="live() && focusedWord() === verse.number + ':' + word.index ? 0 : -1" (focus)="focusedWord.set(verse.number + ':' + word.index)" [class.word-lit]="wordMarks().has(verse.number + ':' + word.index)" [class.has-note]="tool() === 'greek' && word.note" [attr.aria-label]="tool() === 'greek' ? (word.note ? 'Ver griego de ' + word.text : word.text + ': sin nota disponible') : 'Resaltar ' + word.text" [attr.aria-pressed]="wordMarks().has(verse.number + ':' + word.index)" (click)="tapWord(verse.number, word.index, word.note)">{{word.text}}</button>} }</span></p>
      }
      </article>
      <div class="passage-end"><span></span><v-icon name="leaf"/><span></span></div>
      @if (live()) {<button class="chapter-finish" (click)="advance.emit()">Terminar capítulo <v-icon name="arrow"/></button>}
      <svg class="ink-layer" [class.enabled]="live() && tool() === 'pen'" [attr.viewBox]="'0 0 1000 ' + canvasHeight()" preserveAspectRatio="none" (pointerdown)="penDown($event)" (pointermove)="penMove($event)" (pointerup)="penUp($event)" (pointercancel)="penUp($event)" aria-label="Lienzo para dibujar sobre el texto">
        @for (path of drawings(); track $index) {<path [attr.d]="path"/>}
        <path [attr.d]="activePath()"/>
      </svg>
    </div>
  </div>
  <footer class="page-bottom" [class.camera-row]="frame().enabled && frame().corner.startsWith('bottom')" [class.frame-left]="frame().corner.endsWith('left')">
    <div class="page-folio"><span>{{book()}} {{chapter().number}}</span><span class="folio-line"></span><span>{{progress()}}<small>%</small></span></div>
    @if (frame().enabled && frame().corner.startsWith('bottom')) {<div class="presenter-space" [class.square]="frame().shape === 'square'" [class.no-guide]="live() && !frame().guide"><v-icon name="camera"/><span>Tu imagen</span></div>}
  </footer>
</div>
`,styleUrl:'./reader.css'})
export class ReaderComponent implements OnDestroy {
  chapter=input.required<Chapter>(); book=input('Santiago'); bookId=input('santiago'); version=input('NBLA'); notes=input<GreekNote[]>([]);
  fontSize=input(23); night=input(false); live=input(false); tool=input<Tool>('word'); playing=input(false); speed=input(26);
  frame=input<Frame>({enabled:false,corner:'top-right',shape:'circle',size:110,guide:true});
  note=output<GreekNote>(); missingNote=output<void>(); advance=output<void>(); pause=output<void>();
  scroll=viewChild.required<ElementRef<HTMLElement>>('scroller'); content=viewChild.required<ElementRef<HTMLElement>>('content');
  wordMarks=signal(new Set<string>());verseMarks=signal(new Set<number>());drawings=signal<string[]>([]);activePath=signal('');canvasHeight=signal(2000); progress=signal(0);
  focusedWord=signal('1:0');
  verses=computed(()=>this.chapter().verses.map(v=>({...v,words:tokenize(v.text,this.notes().filter(n=>n.book===this.bookId() && n.chapter===this.chapter().number && n.verse===v.number))})));
  private frameSignature=computed(()=>JSON.stringify(this.frame()));
  private raf=0; private observer?:ResizeObserver; private drawing=false; private activePointer=-1; private points:Point[]=[];
  constructor(){
    effect(()=>{this.focusedWord.set(this.chapter().verses[0].number+':0');this.bookId();this.wordMarks.set(new Set());this.verseMarks.set(new Set());this.drawings.set([]);this.progress.set(0);this.scroll()?.nativeElement.scrollTo(0,0);});
    effect(()=>{this.fontSize();this.frameSignature();this.drawings.set([]);});
    effect(()=>{
      const element=this.content().nativeElement;
      this.observer=new ResizeObserver(()=>this.canvasHeight.set(element.offsetHeight));this.observer.observe(element);
    });
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
  onScroll(){const el=this.scroll().nativeElement; const max=el.scrollHeight-el.clientHeight;this.progress.set(max>0?Math.round(el.scrollTop/max*100):100);}
  manualScroll(){if(this.playing())this.pause.emit();}
  toggleVerse(n:number){if(!this.live())return;this.verseMarks.update(set=>{const next=new Set(set);next.has(n)?next.delete(n):next.add(n);return next;});}
  tapWord(verse:number,index:number,note?:GreekNote){
    if(!this.live())return;
    if(this.tool()==='greek'){note?this.note.emit(note):this.missingNote.emit();return;}
    if(this.tool()==='verse'){this.toggleVerse(verse);return;}
    if(this.tool()!=='word')return;
    const key=verse+':'+index;this.wordMarks.update(set=>{const next=new Set(set);next.has(key)?next.delete(key):next.add(key);return next;});
  }
  navigateWords(event:KeyboardEvent){
    if(!this.live() || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    const target=event.target as HTMLButtonElement;
    if(!target.classList.contains('word'))return;
    event.preventDefault();event.stopPropagation();
    const words=Array.from((event.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>('.word'));
    const index=words.indexOf(target);
    const next=event.key==='Home'?0:event.key==='End'?words.length-1:Math.min(words.length-1,Math.max(0,index+(event.key==='ArrowRight'?1:-1)));
    words[next]?.focus();
  }
  private point(event:PointerEvent):Point{const box=this.content().nativeElement.getBoundingClientRect();return{x:(event.clientX-box.left)/box.width*1000,y:event.clientY-box.top};}
  private path(){return this.points.map((p,i)=>(i?'L':'M')+p.x.toFixed(1)+' '+p.y.toFixed(1)).join(' ');}
  penDown(event:PointerEvent){if(this.tool()!=='pen' || !this.live() || this.drawing)return;event.preventDefault();this.pause.emit();this.drawing=true;this.activePointer=event.pointerId;this.points=[this.point(event)];(event.currentTarget as Element).setPointerCapture(event.pointerId);this.activePath.set(this.path());}
  penMove(event:PointerEvent){if(!this.drawing || event.pointerId!==this.activePointer)return;this.points.push(this.point(event));this.activePath.set(this.path());}
  penUp(event:PointerEvent){if(!this.drawing || event.pointerId!==this.activePointer)return;this.drawing=false;if(this.points.length>1)this.drawings.update(paths=>[...paths,this.path()]);this.activePath.set('');}
  undo(){this.drawings.update(paths=>paths.slice(0,-1));}
  clear(){this.wordMarks.set(new Set());this.verseMarks.set(new Set());this.drawings.set([]);}
  ngOnDestroy(){cancelAnimationFrame(this.raf);this.observer?.disconnect();}
}
