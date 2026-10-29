import { centsBetween, midiToHz } from './notes';

export type GuitarString = {
  /** Número da corda: 6 = mais grave, 1 = mais aguda. */
  number: 1 | 2 | 3 | 4 | 5 | 6;
  letter: string;
  solfege: string;
  octave: number;
  midi: number;
  hz: number;
};

const make = (number: GuitarString['number'], letter: string, solfege: string, octave: number, midi: number): GuitarString =>
  ({ number, letter, solfege, octave, midi, hz: midiToHz(midi) });

/** Afinação padrão E2 A2 D3 G3 B3 E4 (da 6ª à 1ª corda). */
export const GUITAR_STRINGS: readonly GuitarString[] = [
  make(6, 'E', 'Mi', 2, 40),
  make(5, 'A', 'Lá', 2, 45),
  make(4, 'D', 'Ré', 3, 50),
  make(3, 'G', 'Sol', 3, 55),
  make(2, 'B', 'Si', 3, 59),
  make(1, 'E', 'Mi', 4, 64),
];

/** Dentro de ±5 cents considera-se afinado (meta exploratória; ver proposal.md da GC-014). */
export const IN_TUNE_CENTS = 5;
/** A uma oitava, 2× ou ½× a corda-alvo, com tolerância de 50 cents. */
export const OCTAVE_TOLERANCE_CENTS = 50;
/** Meio semitom: além disso a nota observada já é outra nota, não a corda-alvo. */
export const SAME_NOTE_CENTS = 50;

export type TuningStatus = 'flat' | 'in-tune' | 'sharp';

export const tuningStatus = (cents: number): TuningStatus =>
  Math.abs(cents) <= IN_TUNE_CENTS ? 'in-tune' : cents < 0 ? 'flat' : 'sharp';

export type TargetComparison =
  | { kind: 'target'; cents: number; status: TuningStatus }
  | { kind: 'octave-above' | 'octave-below' | 'other-note'; cents: number };

/** Desvio relativo à corda-alvo, separado do desvio cromático; nunca declara afinada outra nota ou oitava. */
export function compareToTarget(hz: number, target: GuitarString): TargetComparison {
  const cents = centsBetween(hz, target.hz);
  if (Math.abs(cents) <= SAME_NOTE_CENTS) return { kind: 'target', cents, status: tuningStatus(cents) };
  if (Math.abs(cents - 1200) <= OCTAVE_TOLERANCE_CENTS) return { kind: 'octave-above', cents };
  if (Math.abs(cents + 1200) <= OCTAVE_TOLERANCE_CENTS) return { kind: 'octave-below', cents };
  return { kind: 'other-note', cents };
}
