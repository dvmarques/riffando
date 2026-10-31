/** Referência A4 fixa nesta etapa (hipótese de escopo da GC-014); referência configurável fica fora do escopo. */
export const A4_HZ = 440;

const SHARP = '♯';
export const NOTE_LETTERS = ['C', `C${SHARP}`, 'D', `D${SHARP}`, 'E', 'F', `F${SHARP}`, 'G', `G${SHARP}`, 'A', `A${SHARP}`, 'B'] as const;
export const NOTE_SOLFEGE = ['Dó', `Dó${SHARP}`, 'Ré', `Ré${SHARP}`, 'Mi', 'Fá', `Fá${SHARP}`, 'Sol', `Sol${SHARP}`, 'Lá', `Lá${SHARP}`, 'Si'] as const;

export type NoteReading = {
  midi: number;
  /** Nome em cifra, ex.: "A" ou "F♯". */
  letter: string;
  /** Nome em solfejo pt-BR, ex.: "Lá" ou "Fá♯". */
  solfege: string;
  octave: number;
  /** Frequência exata da nota (Hz) segundo A4 = 440 Hz. */
  nominalHz: number;
  /** Desvio da nota mais próxima, em cents, no intervalo [-50, +50]. */
  cents: number;
};

export const midiToHz = (midi: number, a4 = A4_HZ) => a4 * 2 ** ((midi - 69) / 12);
export const centsBetween = (hz: number, referenceHz: number) => 1200 * Math.log2(hz / referenceHz);

/** Converte frequência em nota cromática; devolve null para valores não físicos (nunca inventa nota). */
export function frequencyToNote(hz: number, a4 = A4_HZ): NoteReading | null {
  if (!Number.isFinite(hz) || hz <= 0) return null;
  const midi = Math.round(69 + 12 * Math.log2(hz / a4));
  const index = ((midi % 12) + 12) % 12;
  const nominalHz = midiToHz(midi, a4);
  return {
    midi,
    letter: NOTE_LETTERS[index] as string,
    solfege: NOTE_SOLFEGE[index] as string,
    octave: Math.floor(midi / 12) - 1,
    nominalHz,
    cents: centsBetween(hz, nominalHz),
  };
}

export const noteLabel = (note: Pick<NoteReading, 'letter' | 'solfege' | 'octave'>) =>
  `${note.solfege}${note.octave} (${note.letter}${note.octave})`;
