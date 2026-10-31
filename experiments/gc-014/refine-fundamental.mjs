// GC-014: protótipo da refinação da fundamental (corrige o viés de inarmonicidade do período).
// Executar: node experiments/gc-014/refine-fundamental.mjs
import { mpm } from './lib/detectors.mjs';
import { STRINGS, centsBetween, midiToHz, mulberry32, synth } from './lib/signal.mjs';

const fs = 48000;
const N = Math.round(fs * 0.064);

/** Magnitude da DFT com janela de Hann na frequência f (Hz). */
export function hannMagnitude(x, fs, f) {
  const n = x.length;
  let re = 0, im = 0;
  const w = 2 * Math.PI * f / fs;
  for (let i = 0; i < n; i++) {
    const h = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1));
    re += x[i] * h * Math.cos(w * i);
    im -= x[i] * h * Math.sin(w * i);
  }
  return Math.hypot(re, im);
}

/**
 * Procura o pico da fundamental perto da estimativa do período (± searchCents) e interpola.
 * Devolve null quando o pico não se destaca do entorno (fundamental fraca/ruído).
 */
export function refineFundamental(x, fs, f0, { searchCents = 15, steps = 31, prominence = 6, minRatio = 0.3 } = {}) {
  const lo = f0 * 2 ** (-searchCents / 1200), hi = f0 * 2 ** (searchCents / 1200);
  const mags = [], freqs = [];
  for (let k = 0; k < steps; k++) { const f = lo + ((hi - lo) * k) / (steps - 1); freqs.push(f); mags.push(hannMagnitude(x, fs, f)); }
  let best = 0;
  for (let k = 1; k < steps; k++) if (mags[k] > mags[best]) best = k;
  if (best === 0 || best === steps - 1) return null; // pico na borda: ambíguo
  // entorno: ±(1,5·resolução) fora do lóbulo principal
  const bin = fs / x.length;
  const ref = [f0 - 3 * bin, f0 + 3 * bin, f0 - 4 * bin, f0 + 4 * bin].filter(f => f > 40).map(f => hannMagnitude(x, fs, f));
  const floor = ref.reduce((a, b) => a + b, 0) / ref.length;
  if (mags[best] < prominence * floor) return null;
  // a fundamental precisa ser comparável aos harmônicos 2 e 3; senão o pico pode ser ruído ou vazamento
  const harmonic = Math.max(hannMagnitude(x, fs, 2 * f0), hannMagnitude(x, fs, 3 * f0));
  if (mags[best] < minRatio * harmonic) return null;
  const [a, b, c] = [Math.log(mags[best - 1]), Math.log(mags[best]), Math.log(mags[best + 1])];
  const d = a - 2 * b + c;
  const off = d ? Math.max(-1, Math.min(1, (0.5 * (a - c)) / d)) : 0;
  const step = (hi - lo) / (steps - 1);
  return { hz: freqs[best] + off * step, magnitude: mags[best], floor };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const rows = [];
  for (const B of [5e-5, 1.5e-4, 3e-4]) for (const [fund, label] of [[1, 'f1=1'], [0.3, 'f1=0.3'], [0.1, 'f1=0.1'], [0, 'f1=0']]) for (const snr of [Infinity, 20, 10]) {
    const errM = [], errR = []; let fallback = 0, n = 0;
    for (const [name, midi] of STRINGS) for (let seed = 1; seed <= 3; seed++) {
      const f = midiToHz(midi), rng = mulberry32(100 * seed + midi);
      const x = synth({ fs, seconds: 0.2, f0: f, partials: [fund, 1, 0.8, 0.5, 0.3, 0.2, 0.1, 0.05].map((a, i) => (i === 0 ? fund : a)), levelDb: -20, rng, inharmonicity: B, noise: snr === Infinity ? null : { kind: 'white', rmsDbfs: -20 - snr } });
      const w = x.subarray(x.length - N);
      const m = mpm(w, fs); if (!m.hz || m.conf < 0.75) continue;
      n++;
      const truth = f * Math.sqrt(1 + B);
      errM.push(Math.abs(centsBetween(m.hz, truth)));
      const r = refineFundamental(w, fs, m.hz);
      if (r) errR.push(Math.abs(centsBetween(r.hz, truth))); else { fallback++; errR.push(Math.abs(centsBetween(m.hz, truth))); }
    }
    const med = a => { const s = [...a].sort((p, q) => p - q); return s.length ? s[Math.floor(s.length / 2)].toFixed(1) : '—'; };
    const p95 = a => { const s = [...a].sort((p, q) => p - q); return s.length ? s[Math.min(s.length - 1, Math.floor(0.95 * s.length))].toFixed(1) : '—'; };
    rows.push(`B=${B} ${label} SNR=${snr} n=${n} | MPM med/P95 ${med(errM)}/${p95(errM)} | refinado ${med(errR)}/${p95(errR)} | fallback ${fallback}`);
  }
  console.log(rows.join('\n'));
}
