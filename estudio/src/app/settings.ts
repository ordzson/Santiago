import type {EndRule} from './content.ts';
export interface FrameSettings {enabled:boolean; corner:string; shape:string; size:number; guide:boolean}
export interface IntroSettings {enabled:boolean; title:string; duration:number}
export interface Settings {fontSize:number; speed:number; night:boolean; frame:FrameSettings; endRule:EndRule; endMessage:string; countdown:boolean; intro:IntroSettings; original:boolean; accent:AccentId}
export const INTRO_TITLE_MAX=60;
/** Acentos: día (`main`, `dark`) y noche (`night`, `soft` para rótulos, `num` para números resaltados). */
export const ACCENTS={
  carmin:{label:'Carmín',main:'#b92d40',dark:'#922235',night:'#e17581',soft:'#f2a0a9',num:'#f8b6bd'},
  indigo:{label:'Índigo',main:'#2f4f9e',dark:'#233b78',night:'#8aa4e8',soft:'#b0c2f2',num:'#c3d1f6'},
  bosque:{label:'Bosque',main:'#2f7a4f',dark:'#225c3b',night:'#7cc59a',soft:'#a6dcbb',num:'#bfe7ce'},
  petroleo:{label:'Petróleo',main:'#1f6f78',dark:'#16545b',night:'#6fc2c9',soft:'#a0dbe0',num:'#bce6ea'},
  ciruela:{label:'Ciruela',main:'#7a3b8f',dark:'#5c2a6c',night:'#c393d4',soft:'#dbb8e6',num:'#e6cbee'},
  ocre:{label:'Ocre',main:'#a8561c',dark:'#844313',night:'#e8a06a',soft:'#f2c29d',num:'#f6d2b5'}
} as const;
export type AccentId=keyof typeof ACCENTS;
/** Escribe el acento en `:root`; todo lo que hoy usa `--red*` lo hereda. */
export function applyAccent(id:AccentId,root:HTMLElement=document.documentElement){
  const a=ACCENTS[id]??ACCENTS.carmin;
  const vars:Record<string,string>={'--red':a.main,'--red-dark':a.dark,'--red-night':a.night,'--red-night-soft':a.soft,'--red-night-num':a.num};
  for(const [k,v] of Object.entries(vars))root.style.setProperty(k,v);
}
export const DEFAULTS:Settings={fontSize:22,speed:26,night:false,frame:{enabled:false,corner:'top-right',shape:'circle',size:104,guide:false},endRule:'session',endMessage:'Es todo por hoy.',countdown:true,intro:{enabled:true,title:'Episodio 1',duration:5},original:false,accent:'carmin'};
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
  if(typeof raw['accent']==='string' && raw['accent'] in ACCENTS)valid.accent=raw['accent'] as AccentId;
  valid.original=typeof raw['original']==='boolean'?raw['original']:raw['greek']===true;
  return valid;
}
