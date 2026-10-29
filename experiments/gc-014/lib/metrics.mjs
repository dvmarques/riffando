// GC-014 POC: classificação de erro, política de aceitação e agregação (mediana, P95, taxas).
import { centsBetween } from './signal.mjs';

export const GATE_DBFS = -50; // hipótese: RMS da janela abaixo disso é "sem sinal" (ruído ambiente medido: −54 dBFS)
export const TOL_CLEAN_CENTS = 5; // meta exploratória
export const TOL_NOTE_CENTS = 50; // nota correta

export function percentile(values, p) {
  if (!values.length) return null;
  const a = [...values].sort((x, y) => x - y);
  const pos = (a.length - 1) * p;
  const lo = Math.floor(pos);
  return a[lo] + (a[Math.min(lo + 1, a.length - 1)] - a[lo]) * (pos - lo);
}

/** ok5 | ok50 | octave | harmonic | other, relativo à frequência esperada. */
export function classify(hz, expectedHz) {
  const cents = centsBetween(hz, expectedHz);
  const abs = Math.abs(cents);
  if (abs <= TOL_CLEAN_CENTS) return { cls: 'ok5', cents };
  if (abs <= TOL_NOTE_CENTS) return { cls: 'ok50', cents };
  const ratio = hz / expectedHz;
  for (const m of [2, 4, 0.5, 0.25]) if (Math.abs(centsBetween(ratio, m)) <= TOL_NOTE_CENTS) return { cls: 'octave', cents };
  for (const m of [3, 5, 6, 1 / 3, 1 / 5, 2 / 3, 3 / 2]) if (Math.abs(centsBetween(ratio, m)) <= TOL_NOTE_CENTS) return { cls: 'harmonic', cents };
  return { cls: 'other', cents };
}

export const isAccepted = (row, thr) => row.hz !== null && row.rms >= GATE_DBFS && row.conf >= thr;

/** Agrega linhas {hz, conf, rms, expectedHz} com a política (limiar de confiança, gate opcional). */
export function aggregate(rows, thr, { gate = true } = {}) {
  const out = { n: rows.length, accepted: 0, gated: 0, rejectedConf: 0, ok5: 0, ok50: 0, octave: 0, harmonic: 0, other: 0 };
  const errs = [];
  for (const row of rows) {
    if (gate && row.rms < GATE_DBFS) { out.gated++; continue; }
    if (row.hz === null || row.conf < thr) { out.rejectedConf++; continue; }
    out.accepted++;
    if (row.expectedHz === null) continue;
    const { cls, cents } = classify(row.hz, row.expectedHz);
    out[cls]++;
    if (cls === 'ok5' || cls === 'ok50') errs.push(Math.abs(cents));
  }
  return {
    ...out,
    medianAbs: percentile(errs, 0.5),
    p95Abs: percentile(errs, 0.95),
    maxAbs: errs.length ? Math.max(...errs) : null,
  };
}

export const pct = (v, n) => (n ? `${((100 * v) / n).toFixed(1)}%` : '—');
export const fix = (v, d = 1) => (v === null || v === undefined ? '—' : v.toFixed(d));
