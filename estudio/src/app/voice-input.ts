import {Injectable, signal} from '@angular/core';
import {VOICE_TUNING} from './voice-spectrum';
export type VoiceState='off'|'asking'|'on'|'denied'|'unavailable';
/** Entrada de micrófono solo para dibujar el espectro: no se graba, no se envía y no suena (nunca llega a `destination`). */
@Injectable({providedIn:'root'})
export class VoiceInput {
  readonly state=signal<VoiceState>('off');
  private ctx:AudioContext|null=null;
  private stream:MediaStream|null=null;
  private source:MediaStreamAudioSourceNode|null=null;
  private node:AnalyserNode|null=null;
  /** Invalida peticiones en vuelo: `stop()` durante `getUserMedia` no debe dejar el micrófono abierto. */
  private token=0;
  get analyser():AnalyserNode|null{return this.state()==='on'?this.node:null;}
  get sampleRate():number{return this.ctx?.sampleRate??48000;}
  /** Llamar síncronamente desde el gesto del usuario (crea/reanuda el `AudioContext` dentro de él). */
  start():void{
    this.stop();
    const id=++this.token;
    try{
      const md=typeof navigator!=='undefined'?navigator.mediaDevices:undefined;
      const Ctor=typeof AudioContext!=='undefined'?AudioContext:undefined;
      if(!md||typeof md.getUserMedia!=='function'||!Ctor){this.state.set('unavailable');return;}
      this.state.set('asking');
      const ctx=new Ctor();this.ctx=ctx;
      void ctx.resume?.().catch(()=>{});
      md.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}}).then(stream=>{
        if(id!==this.token){stream.getTracks().forEach(t=>t.stop());return;}
        try{
          const analyser=ctx.createAnalyser();
          analyser.fftSize=VOICE_TUNING.fftSize;analyser.smoothingTimeConstant=VOICE_TUNING.smoothingTimeConstant;
          analyser.minDecibels=VOICE_TUNING.minDecibels;analyser.maxDecibels=VOICE_TUNING.maxDecibels;
          const source=ctx.createMediaStreamSource(stream);
          source.connect(analyser);
          this.stream=stream;this.source=source;this.node=analyser;
          void ctx.resume?.().catch(()=>{});
          this.state.set('on');
        }catch{stream.getTracks().forEach(t=>t.stop());this.release();this.state.set('unavailable');}
      },(err:unknown)=>{
        if(id!==this.token)return;
        this.release();
        const name=(err as {name?:string})?.name;
        this.state.set(name==='NotAllowedError'||name==='SecurityError'||name==='PermissionDeniedError'?'denied':'unavailable');
      });
    }catch{this.release();this.state.set('unavailable');}
  }
  stop():void{
    this.token++;
    this.release();
    this.state.set('off');
  }
  private release():void{
    try{this.source?.disconnect();}catch{}
    this.stream?.getTracks().forEach(t=>{try{t.stop();}catch{}});
    const ctx=this.ctx;
    if(ctx&&ctx.state!=='closed')void ctx.close().catch(()=>{});
    this.ctx=null;this.stream=null;this.source=null;this.node=null;
  }
}
