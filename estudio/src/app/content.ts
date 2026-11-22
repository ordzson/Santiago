export interface Verse { number: number; text: string }
export interface Chapter { number: number; title?: string; verses: Verse[] }
export interface Book { id: string; name: string; chapters: Chapter[] }
export interface Bible { version: string; name?: string; demo?: boolean; copyright?: string; books: Book[] }
export interface GreekNote { book: string; chapter: number; verse: number; word: string; greek: string; transliteration: string; meaning: string; context?: string }
export interface Location { book: number; chapter: number }
export type ReadingMode = 'range' | 'book' | 'chapters';
export type EndRule = 'session' | 'chapter' | 'book' | 'manual';

const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const nonempty = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const positive = (v: unknown): v is number => Number.isInteger(v) && Number(v) > 0;
export function parseBible(raw: unknown): Bible {
  if (!record(raw) || !nonempty(raw['version']) || !Array.isArray(raw['books']) || !raw['books'].length) throw new Error('El archivo debe incluir version y una lista books con al menos un libro.');
  const ids = new Set<string>();
  for (const book of raw['books']) {
    if (!record(book) || !nonempty(book['id']) || !nonempty(book['name']) || !Array.isArray(book['chapters']) || !book['chapters'].length) throw new Error('Cada libro necesita id, name y chapters.');
    if (ids.has(book['id'])) throw new Error('Hay identificadores de libro repetidos.');
    ids.add(book['id']); let previous = 0;
    for (const chapter of book['chapters']) {
      if (!record(chapter) || !positive(chapter['number']) || chapter['number'] <= previous || !Array.isArray(chapter['verses']) || !chapter['verses'].length) throw new Error(`Revisa los capítulos de ${book['name']}: deben tener número creciente y versículos.`);
      previous = chapter['number']; let verseNumber = 0;
      for (const verse of chapter['verses']) {
        if (!record(verse) || !positive(verse['number']) || verse['number'] <= verseNumber || !nonempty(verse['text'])) throw new Error(`Revisa los versículos de ${book['name']} ${previous}: deben tener número creciente y texto.`);
        verseNumber = verse['number'];
      }
    }
  }
  return raw as unknown as Bible;
}
export function parseGreek(raw: unknown): GreekNote[] {
  if (!record(raw) || !Array.isArray(raw['notes'])) throw new Error('El archivo del griego debe contener una lista notes.');
  for (const note of raw['notes']) {
    if (!record(note) || !['book','word','greek','transliteration','meaning'].every(key => nonempty(note[key])) || !positive(note['chapter']) || !positive(note['verse'])) throw new Error('Cada nota necesita book, chapter, verse, word, greek, transliteration y meaning.');
  }
  return raw['notes'] as GreekNote[];
}
export function locations(bible: Bible): Location[] { return bible.books.flatMap((b, book) => b.chapters.map((_, chapter) => ({book, chapter}))); }
export function compare(a: Location, b: Location) { return a.book - b.book || a.chapter - b.chapter; }
export function sessionLocations(bible: Bible, mode: ReadingMode, start: Location, end: Location): Location[] {
  const all = locations(bible);
  if (mode === 'book') return all.filter(p => p.book === start.book);
  if (mode === 'range') return all.filter(p => compare(p, start) >= 0 && compare(p, end) <= 0);
  return all.filter(p => compare(p, start) >= 0);
}
export function shouldEnd(rule: EndRule, current: Location, next: Location | undefined) {
  return rule === 'chapter' || (rule === 'book' && (!next || next.book !== current.book)) || (rule === 'session' && !next);
}
export function tokenize(text: string, notes: GreekNote[]) {
  const spans = notes.flatMap(note => {
    const found: {start:number;end:number;note:GreekNote}[] = []; let at = 0;
    while ((at = text.toLocaleLowerCase('es').indexOf(note.word.toLocaleLowerCase('es'), at)) !== -1) {
      const end = at + note.word.length;
      if (!/\p{L}/u.test(text[at - 1] || '') && !/\p{L}/u.test(text[end] || '')) found.push({start:at,end,note});
      at = end;
    }
    return found;
  });
  let offset = 0;
  return text.split(/(\s+)/).filter(Boolean).map((text, index) => {
    const note = spans.find(s => offset >= s.start && offset < s.end)?.note;
    offset += text.length; return {text, index, note, space:/^\s+$/u.test(text)};
  });
}
