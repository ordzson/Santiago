import {Component, input} from '@angular/core';
const paths: Record<string,string> = {
  arrow:'M4 12h16m-6-6 6 6-6 6', back:'M20 12H4m6-6-6 6 6 6', chevron:'m9 5 7 7-7 7', down:'m6 9 6 6 6-6',
  play:'m8 5 11 7-11 7V5Z', pause:'M8 5v14M16 5v14', book:'M12 6C8 3 4 4 2 5v14c4-2 7-1 10 1m0-14c4-3 8-2 10-1v14c-4-2-7-1-10 1V6Z',
  range:'M5 5v14m14-14v14M8 12h8m-3-3 3 3-3 3', chapters:'M5 4h14v16H5zM9 8h6M9 12h6M9 16h3',
  sparkle:'m12 3 2.3 6.7L21 12l-6.7 2.3L12 21l-2.3-6.7L3 12l6.7-2.3L12 3Z',
  pen:'m16 3 5 5-12 12-6 1 1-6L16 3ZM13 6l5 5', verse:'M5 5h14M5 12h14M5 19h9M3 8h18v8H3z',
  sliders:'M4 7h16M4 17h16M9 4v6M15 14v6', close:'m6 6 12 12M6 18 18 6', check:'m5 12 4 4 10-10',
  fullscreen:'M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6', undo:'M4 9h10a6 6 0 1 1 0 12M4 9l5-5M4 9l5 5',
  camera:'M4 7h4l2-3h4l2 3h4v13H4V7Zm12 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  upload:'M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5', help:'M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2-3 4m.1 3h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  eye:'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  stop:'M6 6h12v12H6z', leaf:'M5 20c1-8 7-13 14-16 2 9-2 16-9 14M5 20l8-9', trash:'M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7',
  volume:'m4 9 5 0 5-5v16l-5-5H4V9Zm13-1c3 2 3 6 0 8', sun:'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z'
};
@Component({selector:'v-icon',standalone:true,template:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="path()"/></svg>`,styles:`:host{display:inline-flex;width:20px;height:20px;flex:none}svg{width:100%;height:100%}`})
export class IconComponent { name=input('arrow'); path=()=>paths[this.name()] || paths['book']; }
