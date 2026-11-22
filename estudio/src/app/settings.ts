import type {EndRule} from './content.ts';
export interface FrameSettings {enabled:boolean; corner:string; shape:string; size:number; guide:boolean}
export interface IntroSettings {enabled:boolean; title:string; duration:number}
export interface Settings {fontSize:number; speed:number; night:boolean; frame:FrameSettings; endRule:EndRule; endMessage:string; countdown:boolean; intro:IntroSettings; original:boolean}
export const INTRO_TITLE_MAX=60;
export const DEFAULTS:Settings={fontSize:22,speed:26,night:false,frame:{enabled:false,corner:'top-right',shape:'circle',size:104,guide:false},endRule:'session',endMessage:'Es todo por hoy.',countdown:true,intro:{enabled:true,title:'Episodio 1',duration:5},original:false};
const clamp=(value:number,min:number,max:number)=>Math.min(max,Math.max(min,value));
const isRecord=(value:unknown):value is Record<string,any>=>typeof value==='object' && value!==null && !Array.isArray(value);
export function parseSettings(raw:unknown):Settings{
  const valid:Settings=structuredClone(DEFAULTS);
  if(!isRecord(raw))return valid;
  if(Number.isFinite(raw['fontSize']))valid.fontSize=clamp(raw['fontSize'],17,32);
  if(Number.isFinite(raw['speed']))valid.speed=clamp(raw['speed'],8,70);
  valid.night=raw['night']===true;
  if(['session','chapter','book','manual'].includes(raw['endRule']))valid.endRule=raw['endRule'];
  if(typeof raw['endMessage']==='string' && raw['endMessage'].trim())valid.endMessage=raw['endMessage'].slice(0,100);
  valid.countdown=raw['countdown']!==false;
  const frame=raw['frame'];
  if(isRecord(frame)){
    valid.frame.enabled=frame['enabled']===true;valid.frame.guide=frame['guide']===true;
    if(['top-left','top-right','bottom-left','bottom-right'].includes(frame['corner']))valid.frame.corner=frame['corner'];
    if(['circle','square'].includes(frame['shape']))valid.frame.shape=frame['shape'];
    if(Number.isFinite(frame['size']))valid.frame.size=clamp(frame['size'],72,150);
  }
  const intro=raw['intro'];
  if(isRecord(intro)){
    valid.intro.enabled=intro['enabled']!==false;
    if(typeof intro['title']==='string')valid.intro.title=intro['title'].trim().slice(0,INTRO_TITLE_MAX);
    if(Number.isFinite(intro['duration']))valid.intro.duration=clamp(Math.round(intro['duration']),3,10);
  }
  valid.original=typeof raw['original']==='boolean'?raw['original']:raw['greek']===true;
  return valid;
}
