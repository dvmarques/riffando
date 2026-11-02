import { GUITAR_STRINGS, compareToTarget, tuningStatus } from '@/domain/tuning/guitar';
import { centsBetween, frequencyToNote, midiToHz, noteLabel } from '@/domain/tuning/notes';
import { createSessionFilter } from '@/domain/tuning/session';

describe('conversão de frequência em nota', () => {
  it('reconhece A4 = 440 Hz e as cordas soltas com desvio nulo', () => {
    const a4 = frequencyToNote(440);
    expect(a4).toMatchObject({ letter: 'A', solfege: 'Lá', octave: 4, midi: 69 });
    expect(a4?.cents).toBeCloseTo(0, 6);
    const expected = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];
    expect(GUITAR_STRINGS.map((s) => `${s.letter}${s.octave}`)).toEqual(expected);
    expect(GUITAR_STRINGS.map((s) => s.number)).toEqual([6, 5, 4, 3, 2, 1]);
    for (const string of GUITAR_STRINGS) {
      const note = frequencyToNote(string.hz);
      expect(note?.midi).toBe(string.midi);
      expect(Math.abs(note?.cents ?? 99)).toBeLessThan(1e-6);
    }
  });

  it('mede cents positivos e negativos e escolhe a nota mais próxima nos limites', () => {
    expect(frequencyToNote(110 * 2 ** (20 / 1200))?.cents).toBeCloseTo(20, 6);
    expect(frequencyToNote(110 * 2 ** (-20 / 1200))?.cents).toBeCloseTo(-20, 6);
    const sharpBoundary = frequencyToNote(110 * 2 ** (49.9 / 1200));
    expect(sharpBoundary).toMatchObject({ letter: 'A', octave: 2 });
    const next = frequencyToNote(110 * 2 ** (50.1 / 1200));
    expect(next).toMatchObject({ letter: 'A♯', solfege: 'Lá♯', octave: 2 });
    expect(next?.cents).toBeCloseTo(-49.9, 6);
  });

  it('usa nomes em solfejo pt-BR e cifra, com oitava correta abaixo de C', () => {
    expect(noteLabel(frequencyToNote(midiToHz(60)) as never)).toBe('Dó4 (C4)');
    expect(noteLabel(frequencyToNote(midiToHz(59)) as never)).toBe('Si3 (B3)');
    expect(frequencyToNote(midiToHz(40))?.octave).toBe(2);
    expect(centsBetween(880, 440)).toBeCloseTo(1200, 9);
  });

  it('nunca inventa nota para valores não físicos', () => {
    for (const value of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) expect(frequencyToNote(value)).toBeNull();
  });
});

describe('estado de afinação e corda-alvo', () => {
  it('classifica grave/afinado/agudo com tolerância de 5 cents', () => {
    expect(tuningStatus(-5.1)).toBe('flat');
    expect(tuningStatus(-5)).toBe('in-tune');
    expect(tuningStatus(0)).toBe('in-tune');
    expect(tuningStatus(5)).toBe('in-tune');
    expect(tuningStatus(5.1)).toBe('sharp');
  });

  const a2 = GUITAR_STRINGS[1]!;

  it('mede o desvio relativo à corda-alvo, separado da nota cromática', () => {
    const flat = compareToTarget(a2.hz * 2 ** (-30 / 1200), a2);
    expect(flat).toMatchObject({ kind: 'target', status: 'flat' });
    expect(flat.cents).toBeCloseTo(-30, 6);
    expect(compareToTarget(a2.hz, a2)).toMatchObject({ kind: 'target', status: 'in-tune' });
  });

  it('sinaliza oitava acima/abaixo e outra nota sem declarar afinada', () => {
    expect(compareToTarget(a2.hz * 2, a2).kind).toBe('octave-above');
    expect(compareToTarget(a2.hz * 2 * 2 ** (40 / 1200), a2).kind).toBe('octave-above');
    expect(compareToTarget(a2.hz / 2, a2).kind).toBe('octave-below');
    expect(compareToTarget(GUITAR_STRINGS[0]!.hz, a2).kind).toBe('other-note');
    expect(compareToTarget(a2.hz * 2 * 2 ** (60 / 1200), a2).kind).toBe('other-note');
  });
});

describe('filtro de sessão', () => {
  it('descarta eventos sem sessão, de sessão antiga e fora de ordem', () => {
    const filter = createSessionFilter();
    expect(filter.accept({ sessionId: 1, sequence: 1 })).toBe(false);
    filter.begin(2);
    expect(filter.accept({ sessionId: 1, sequence: 5 })).toBe(false);
    expect(filter.accept({ sessionId: 2, sequence: 1 })).toBe(true);
    expect(filter.accept({ sessionId: 2, sequence: 1 })).toBe(false);
    expect(filter.accept({ sessionId: 2, sequence: 3 })).toBe(true);
    expect(filter.accept({ sessionId: 2, sequence: 2 })).toBe(false);
    filter.end();
    expect(filter.accept({ sessionId: 2, sequence: 9 })).toBe(false);
    filter.begin(3);
    expect(filter.accept({ sessionId: 2, sequence: 10 })).toBe(false);
    expect(filter.accept({ sessionId: 3, sequence: 1 })).toBe(true);
  });
});
