/** Versículo «elegido para el cierre». El almacén vive en la app y sobrevive al cambio de capítulo. */
export interface ChosenVerse { bookId: string; bookName: string; chapter: number; verse: number; text: string }
export const sameVerse = (a: ChosenVerse, b: Pick<ChosenVerse, 'bookId' | 'chapter' | 'verse'>) => a.bookId === b.bookId && a.chapter === b.chapter && a.verse === b.verse;
/**
 * Alterna un elegido y devuelve la lista nueva en orden canónico (libro según `bookOrder`, capítulo, versículo).
 * No modifica la lista recibida.
 */
export function toggleChosen(list: readonly ChosenVerse[], entry: ChosenVerse, bookOrder: (bookId: string) => number): ChosenVerse[] {
  if (list.some(item => sameVerse(item, entry))) return list.filter(item => !sameVerse(item, entry));
  return [...list, entry].sort((a, b) => bookOrder(a.bookId) - bookOrder(b.bookId) || a.chapter - b.chapter || a.verse - b.verse);
}
/** Números de versículo elegidos en un capítulo concreto. */
export const chosenIn = (list: readonly ChosenVerse[], bookId: string | undefined, chapter: number | undefined) => new Set(list.filter(item => item.bookId === bookId && item.chapter === chapter).map(item => item.verse));
