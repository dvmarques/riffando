// GC-014: valores de referência do POC para o teste de paridade do Kotlin (MpmPitchDetector).
// Sinal em forma fechada (sem PRNG): Σ_{k=1..4} sin(2π k f n/fs)/k · 0,15, quantizado em PCM16.
// Reproduza: node experiments/gc-014/gen-parity-vectors.mjs
import { mpm, lagRange } from './lib/detectors.mjs';
import { STRINGS, midiToHz } from './lib/signal.mjs';

export function closedForm(fs, hz, n) {
  const x = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    let v = 0;
    for (let k = 1; k <= 4; k++) v += Math.sin((2 * Math.PI * k * hz * i) / fs) / k;
    x[i] = Math.max(-32768, Math.min(32767, Math.round(0.15 * v * 32768))) / 32768;
  }
  return x;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const fs = 48000;
  const n = Math.round(fs * 0.064);
  const cases = [...STRINGS.map(([name, midi]) => [name, midiToHz(midi)]), ['A2 +17c', 110 * 2 ** (17 / 1200)], ['C5', midiToHz(72)]];
  console.log(`// fs=${fs}, N=${n}, tauMax=${lagRange(fs).tauMax}`);
  for (const [name, hz] of cases) {
    const r = mpm(closedForm(fs, hz, n), fs);
    console.log(`${name}: f0=${hz.toFixed(6)} -> hz=${r.hz.toFixed(6)} conf=${r.conf.toFixed(6)}`);
  }
}
