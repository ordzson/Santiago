/** Ajuste de tamaño del cierre: lógica pura (sin decoradores) para poder probarla en node. */
export const ENDING_MIN_PX=15;
/** Tamaño máximo de la letra del versículo según cuántos hay: 1 → cita grande; 2–3 → apilados; 4+ → compactos. */
export const maxPickSize=(count:number)=>count<=1?36:count<=3?28:26;
/** Escalón de tamaños de mayor a menor, nunca por debajo de 15 px. */
export function pickSizes(count:number):number[]{
  const top=maxPickSize(count),sizes:number[]=[];
  for(let px=top;px>=ENDING_MIN_PX;px-=px>24?2:1)sizes.push(px);
  return sizes;
}
/** Primer tamaño que cabe; si ninguno cabe, el mínimo (la lista hará scroll interno). */
export function fitSize(sizes:readonly number[],fits:(px:number)=>boolean):number{
  for(const px of sizes)if(fits(px))return px;
  return sizes[sizes.length-1]??ENDING_MIN_PX;
}
/** Columnas de la lista: 1 salvo con 4+ elegidos y espacio (≈340 px por columna); 7+ admiten 3. */
export function pickColumns(count:number,width:number,perColumn=340):number{
  if(count<4)return 1;
  return Math.max(1,Math.min(count>=7?3:2,Math.floor(width/perColumn)));
}
