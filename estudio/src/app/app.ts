import { Component, signal, computed, viewChild, ElementRef, HostListener, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Bible, OriginalNote, OriginalLanguage, Location, ReadingMode, EndRule, parseBible, parseOriginal, sessionLocations, compare, locations, shouldEnd } from './content';
import { ReaderComponent, ReaderBurst } from './reader';
import { ParticlesComponent } from './particles';
import { ChosenVerse, chosenIn, toggleChosen } from './chosen';
import { Settings, DEFAULTS, parseSettings } from './settings';
import { IconComponent } from './icon';
import { EngravingComponent } from './engraving';
@Component({selector:'app-root',standalone:true,imports:[FormsModule,ReaderComponent,ParticlesComponent,IconComponent,EngravingComponent],templateUrl:'./app.html'})
export class AppComponent implements OnDestroy {
  bible=signal<Bible|null>(null);notes=signal<OriginalNote[]>([]);loading=signal(true);loadError=signal('');notice=signal('');
  scene=signal(false);finished=signal(false);controls=signal(true);playing=signal(false);countdown=signal<number|null>(null);activeNote=signal<OriginalNote|null>(null);
  // Elegidos para el cierre: sobreviven al cambio de capítulo y quedan en orden canónico (libro, capítulo, versículo).
  chosen=signal<ChosenVerse[]>([]);
  specials=computed(()=>chosenIn(this.chosen(),this.currentBook()?.id,this.currentChapter()?.number));
  toggleSpecial(verse:number){
    const book=this.currentBook(),chapter=this.currentChapter(),found=chapter?.verses.find(v=>v.number===verse);
    if(!book||!chapter||!found)return;
    const order=(id:string)=>this.bible()?.books.findIndex(b=>b.id===id)??-1;
    this.chosen.update(list=>toggleChosen(list,{bookId:book.id,bookName:book.name,chapter:chapter.number,verse,text:found.text},order));
  }
  /** Idiomas con notas en el libro actual: deciden glifo, nombre y disponibilidad del interruptor «Idioma original». */
  bookLanguages=computed(()=>{const id=this.currentBook()?.id;return new Set(this.notes().filter(n=>n.book===id).map(n=>n.language));});
  originalAvailable=computed(()=>this.bookLanguages().size>0);
  originalOn=computed(()=>this.originalAvailable()&&this.originalActive());
  originalActive=signal(false);
  get originalGlyph(){const l=this.bookLanguages();return l.has('griego')&&l.has('hebreo')?'α א':l.has('hebreo')?'א':'α';}
  get originalName(){const l=this.bookLanguages();return l.has('griego')&&l.has('hebreo')?'Consultar idioma original':l.has('hebreo')?'Consultar hebreo':'Consultar griego';}
  toggleOriginal(){this.settings.original=!this.settings.original;this.originalActive.set(this.settings.original);this.saveSettings();this.scheduleHide();}
  /** Cintas a la izquierda cuando el encuadre del presentador ocupa arriba-derecha. */
  get ribbonsLeft(){return this.settings.frame.enabled&&this.settings.frame.corner==='top-right';}
  clearMarks(){this.reader()?.clear();this.scheduleHide();}
  onBurst(event:ReaderBurst){this.particles()?.burst(event.kind,event.rect);}
  mode:ReadingMode='range';start:Location={book:0,chapter:0};end:Location={book:0,chapter:0};current=signal<Location>({book:0,chapter:0});
  settings:Settings=this.loadSettings();session:Location[]=[];endAt=signal<Location|null>(null);
  reader=viewChild(ReaderComponent);particles=viewChild(ParticlesComponent);dialog=viewChild.required<ElementRef<HTMLDialogElement>>('dialog');noteDialog=viewChild.required<ElementRef<HTMLDialogElement>>('noteDialog');
  dialogType=signal<'settings'|'content'|'help'>('settings');importError=signal('');importing=signal(false);
  private noticeTimer?:ReturnType<typeof setTimeout>;private hideTimer?:ReturnType<typeof setTimeout>;private countdownTimer?:ReturnType<typeof setInterval>;private wakeLock:WakeLockSentinel|null=null;
  modes:{id:ReadingMode;icon:string;label:string;description:string}[]=[{id:'range',icon:'range',label:'Un recorrido',description:'De un capítulo a otro'},{id:'book',icon:'book',label:'Un libro',description:'De principio a fin'},{id:'chapters',icon:'chapters',label:'Capítulo a capítulo',description:'A tu propio ritmo'}];
  currentBook=computed(()=>this.bible()?.books[this.current().book]);currentChapter=computed(()=>this.currentBook()?.chapters[this.current().chapter]);
  selectionError(){return this.mode==='range' && compare(this.start,this.end)>0?'El final debe estar después del inicio.':'';}
  get selectionLabel(){const b=this.bible();if(!b)return '';const start=b.books[this.start.book];const end=b.books[this.end.book];if(this.mode==='book')return start.name+' · '+start.chapters.length+' capítulos';if(this.mode==='chapters')return start.name+' '+start.chapters[this.start.chapter].number+' en adelante';return start.name+' '+start.chapters[this.start.chapter].number+' — '+(start.id===end.id?'':end.name+' ')+end.chapters[this.end.chapter].number;}
  get previewLabel(){const b=this.currentBook();return b ? b.name+' '+this.currentChapter()!.number : '';}
  get canPrevious(){const b=this.bible();if(!b)return false;if(this.mode==='chapters')return locations(b).findIndex(p=>compare(p,this.current())===0)>0;return this.session.findIndex(p=>compare(p,this.current())===0)>0 || this.mode==='book' && this.current().book>0;}
  get canNext(){const b=this.bible();if(!b)return false;if(this.mode==='chapters')return locations(b).findIndex(p=>compare(p,this.current())===0)<locations(b).length-1;return this.session.findIndex(p=>compare(p,this.current())===0)<this.session.length-1 || this.mode==='book' && this.current().book<b.books.length-1;}
  constructor(){this.originalActive.set(this.settings.original);this.loadContent();}
  async loadContent(){
    this.loading.set(true);this.loadError.set('');
    try{
      const response=await fetch('data/biblia.json');if(!response.ok)throw new Error('No se encontró data/biblia.json. Puedes cargar tu archivo para empezar.');
      this.setBible(parseBible(await response.json()));
    }catch(error){this.loadError.set(error instanceof Error?error.message:'No se pudo cargar el contenido.');}
    // Archivos de notas opcionales e independientes: si uno falta o no es válido, el otro sigue funcionando.
    const loaded=await Promise.all((['griego','hebreo'] as OriginalLanguage[]).map(async language=>{
      try{const response=await fetch(`data/${language}.json`);return response.ok?parseOriginal(await response.json(),language):[];}catch{return [] as OriginalNote[];}
    }));
    this.notes.set(loaded.flat());
    this.loading.set(false);
  }
  setBible(value:Bible){this.bible.set(value);this.start={book:0,chapter:0};this.end={book:0,chapter:Math.min(1,value.books[0].chapters.length-1)};this.current.set({...this.start});this.session=[];}
  chooseMode(mode:ReadingMode){this.mode=mode;this.updateSelection();}
  changeBook(which:'start'|'end'){this[which].chapter=0;if(which==='start' && this.mode==='range' && compare(this.start,this.end)>0)this.end={...this.start};this.updateSelection();}
  updateSelection(){this.current.set({...this.start,chapter:this.mode==='book'?0:this.start.chapter});this.saveSettings();}
  changeSettings(){this.settings.frame={...this.settings.frame};this.saveSettings();}
  private loadSettings():Settings{
    try{return parseSettings(JSON.parse(localStorage.getItem('verbo.settings')||'null'));}catch{return structuredClone(DEFAULTS);}
  }
  saveSettings(){try{localStorage.setItem('verbo.settings',JSON.stringify(this.settings));}catch{}}
  startScene(){
    const bible=this.bible();if(!bible || this.selectionError())return;
    this.session=sessionLocations(bible,this.mode,this.start,this.end);if(!this.session.length)return;
    this.current.set({...this.session[0]});this.finished.set(false);this.scene.set(true);this.controls.set(false);this.playing.set(false);this.chosen.set([]);this.endAt.set(null);
    if(this.settings.countdown){this.countdown.set(3);this.countdownTimer=setInterval(()=>{const remaining=this.countdown()!;if(remaining<=1){clearInterval(this.countdownTimer);this.countdown.set(null);}else this.countdown.set(remaining-1);},1000);}
    this.acquireWakeLock();
  }
  async acquireWakeLock(){try{if('wakeLock' in navigator && !this.wakeLock)this.wakeLock=await navigator.wakeLock.request('screen');}catch{}}
  async exitScene(){this.playing.set(false);clearInterval(this.countdownTimer);this.countdown.set(null);this.scene.set(false);this.finished.set(false);this.controls.set(true);await this.wakeLock?.release();this.wakeLock=null;}
  toggleControls(){this.controls.update(v=>!v);if(this.controls())this.scheduleHide();}
  holdControls(){clearTimeout(this.hideTimer);}
  scheduleHide(){clearTimeout(this.hideTimer);this.hideTimer=setTimeout(()=>{if(!this.dialog().nativeElement.open && !this.noteDialog().nativeElement.open && !document.activeElement?.closest('.scene-controls'))this.controls.set(false);},5000);}
  togglePlay(){this.playing.update(v=>!v);if(this.controls())this.scheduleHide();}
  move(direction:number,complete=false){
    const bible=this.bible();if(!bible)return;this.playing.set(false);
    const all=this.mode==='chapters'?locations(bible):this.session;
    const index=all.findIndex(p=>compare(p,this.current())===0);let next=all[index+direction];
    const sessionBoundary=!next;
    if(!next && this.mode==='book'){
      const nextBook=this.current().book+direction;
      if(nextBook>=0 && nextBook<bible.books.length){this.session=sessionLocations(bible,'book',{book:nextBook,chapter:0},{book:nextBook,chapter:0});next=direction>0?this.session[0]:this.session[this.session.length-1];}
    }
    if(complete && ((this.settings.endRule==='session' && sessionBoundary) || shouldEnd(this.settings.endRule==='session'?'manual':this.settings.endRule,this.current(),next))){this.endAt.set(next || null);this.finishScene();return;}
    if(next){this.current.set({...next});this.scheduleHide();}
    else if(direction>0){if(this.settings.endRule==='manual'){this.announce('Llegaste al final del recorrido. Puedes cerrar la lectura cuando quieras.');}else{this.endAt.set(null);this.finishScene();}}
  }
  finishScene(){this.playing.set(false);this.finished.set(true);this.controls.set(false);this.activeNote.set(null);}
  continueScene(){const next=this.endAt();this.chosen.set([]);if(next){this.current.set({...next});this.endAt.set(null);this.finished.set(false);}else{this.startScene();}}
  showNote(note:OriginalNote){this.playing.set(false);this.activeNote.set(note);this.noteDialog().nativeElement.showModal();}
  openDialog(type:'settings'|'content'|'help'){this.playing.set(false);this.dialogType.set(type);this.importError.set('');this.dialog().nativeElement.showModal();}
  closeDialog(){this.dialog().nativeElement.close();if(this.scene())this.scheduleHide();}
  backdropClick(event:MouseEvent,dialog:HTMLDialogElement){if(event.target===dialog)dialog.close();}
  /** Notas cargadas de un idioma, para el estado de «Tu contenido». */
  noteCount(language:OriginalLanguage){return this.notes().filter(n=>n.language===language).length;}
  async importFile(event:Event,kind:'bible'|OriginalLanguage){
    const input=event.target as HTMLInputElement;const file=input.files?.[0];if(!file)return;this.importing.set(true);this.importError.set('');
    try{if(file.size>35*1024*1024)throw new Error('El archivo supera 35 MB. Divide o reduce el JSON antes de cargarlo.');const raw=JSON.parse(await file.text());
      if(kind==='bible'){this.setBible(parseBible(raw));this.notes.set([]);this.loadError.set('');}
      else{const incoming=parseOriginal(raw,kind);this.notes.update(list=>[...list.filter(n=>n.language!==kind),...incoming].sort((a,b)=>(a.language===b.language?0:a.language==='griego'?-1:1)));}
      this.announce(kind==='bible'?'Biblia cargada. Ya puedes preparar tu lectura.':`Notas del ${kind} cargadas.`);
    }catch(error){this.importError.set(error instanceof SyntaxError?'El JSON no es válido. Revisa comas, comillas y el formato del archivo.':error instanceof Error?error.message:'No se pudo leer el archivo.');}finally{this.importing.set(false);input.value='';}
  }
  async fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else this.announce('Usa «Añadir a pantalla de inicio» para abrir sin la barra del navegador.');}catch{this.announce('La pantalla completa no está disponible en este navegador.');}}
  announce(message:string){this.notice.set(message);clearTimeout(this.noticeTimer);this.noticeTimer=setTimeout(()=>this.notice.set(''),4000);}
  @HostListener('document:visibilitychange') visibility(){if(document.hidden){this.playing.set(false);this.wakeLock?.release();this.wakeLock=null;}else if(this.scene())this.acquireWakeLock();}
  @HostListener('document:keydown',['$event']) key(event:KeyboardEvent){
    if(!this.scene() || this.dialog().nativeElement.open || this.noteDialog().nativeElement.open || this.countdown()!==null)return;
    if(event.key==='Escape'){event.preventDefault();this.toggleControls();return;}
    if(['INPUT','SELECT','TEXTAREA','BUTTON'].includes((event.target as Element)?.tagName))return;
    if(event.code==='Space'){event.preventDefault();this.togglePlay();}if(event.key==='ArrowRight')this.move(1,true);if(event.key==='ArrowLeft')this.move(-1);
  }
  ngOnDestroy(){clearTimeout(this.noticeTimer);clearTimeout(this.hideTimer);clearInterval(this.countdownTimer);this.wakeLock?.release();}
}
