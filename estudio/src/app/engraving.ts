import {AfterViewInit, Component, ElementRef, viewChild} from '@angular/core';
@Component({selector:'v-engraving',standalone:true,template:`<canvas #art width="660" height="300" aria-hidden="true"></canvas>`,styles:`:host{display:block}canvas{width:100%;height:100%;object-fit:contain}`})
export class EngravingComponent implements AfterViewInit {
  art=viewChild.required<ElementRef<HTMLCanvasElement>>('art');
  ngAfterViewInit(){
    const ctx=this.art().nativeElement.getContext('2d')!; ctx.scale(2,2); ctx.strokeStyle='#6c6657'; ctx.lineWidth=.65;
    const line=(x:number,y:number,a:number,b:number)=>{ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(a,b);ctx.stroke()};
    // Original geometric engraved rays: a single carmine seed travels outward.
    const ox=166,oy=113;
    for(let i=0;i<47;i++){const a=Math.PI*1.06+i*.058;const r=36+Math.sin(i*2.3)*4; const R=86+Math.sin(i*.7)*13;line(ox+Math.cos(a)*r,oy+Math.sin(a)*r,ox+Math.cos(a)*R,oy+Math.sin(a)*R);}
    for(let j=0;j<3;j++){ctx.beginPath();ctx.ellipse(166,112,44+j*4,10+j*3,0,Math.PI*.05,Math.PI*.95);ctx.stroke();}
    ctx.strokeStyle='#bd3042';ctx.lineWidth=1.4;line(170,35,179,21);line(179,21,183,20);line(179,21,177,17);
    ctx.strokeStyle='#6c6657';ctx.lineWidth=.55;
    for(let i=0;i<14;i++){const y=122+i*1.6;line(77+i*2,y,130+i*1.4,y-4);line(195-i*.5,y-4,251-i*2,y);}
  }
}
