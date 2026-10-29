import test from 'node:test';
import assert from 'node:assert/strict';
import { makeAlgorithms, windowSamples } from '../../experiments/gc-014/lib/detectors.mjs';
import { GATE_DBFS, aggregate, classify } from '../../experiments/gc-014/lib/metrics.mjs';
import { centsBetween, mulberry32, partialProfile, rmsDbfs, synth, STRINGS, midiToHz } from '../../experiments/gc-014/lib/signal.mjs';
import { sampleTicks, settle, stabilize } from '../../experiments/gc-014/lib/stream.mjs';

const FS = 48000;
const tone = (hz, seed = 1, o = {}) => synth({ fs: FS, seconds: 0.3, f0: hz, partials: partialProfile(mulberry32(seed)), levelDb: -20, rng: mulberry32(seed + 1), ...o });
const lastWindow = (x, ms) => x.subarray(x.length - windowSamples(FS, ms));

test('POC GC-014: sinais sintéticos são determinísticos para a mesma semente', () => {
  assert.deepEqual(tone(110, 5), tone(110, 5));
  assert.notDeepEqual(tone(110, 5), tone(110, 6));
});

test('POC GC-014: YIN e MPM leem as seis cordas soltas dentro de 5 cents com janela de 85 ms', () => {
  const algorithms = makeAlgorithms();
  for (const [name, midi] of STRINGS) {
    const hz = midiToHz(midi);
    const seg = lastWindow(tone(hz), 85);
    for (const variant of ['YIN', 'MPM (ACF refinada)']) {
      const r = algorithms[variant](seg, FS);
      assert.ok(Math.abs(centsBetween(r.hz, hz)) <= 5, `${variant} ${name}: ${centsBetween(r.hz, hz).toFixed(2)} c`);
      assert.ok(r.conf >= 0.85);
    }
  }
});

test('POC GC-014: silêncio e ruído não passam pelo gate/confiança', () => {
  const silent = new Float64Array(windowSamples(FS, 85));
  assert.ok(rmsDbfs(silent) < GATE_DBFS);
  const noise = synth({ fs: FS, seconds: 0.3, f0: 100, partials: [0], rng: mulberry32(3), noise: { kind: 'white', rmsDbfs: -30 } });
  const r = makeAlgorithms().YIN(lastWindow(noise, 85), FS);
  assert.ok(r.conf < 0.85, `confiança do ruído ${r.conf}`);
});

test('POC GC-014: classificação distingue nota correta, oitava e harmônico', () => {
  assert.equal(classify(110.1, 110).cls, 'ok5');
  assert.equal(classify(110 * 2 ** (20 / 1200), 110).cls, 'ok50');
  assert.equal(classify(220, 110).cls, 'octave');
  assert.equal(classify(55, 110).cls, 'octave');
  assert.equal(classify(330, 110).cls, 'harmonic');
  assert.equal(classify(131, 110).cls, 'other');
});

test('POC GC-014: agregação separa gate, baixa confiança e erros', () => {
  const rows = [
    { hz: 110, conf: 0.99, rms: -20, expectedHz: 110 },
    { hz: 220, conf: 0.99, rms: -20, expectedHz: 110 },
    { hz: 110, conf: 0.5, rms: -20, expectedHz: 110 },
    { hz: 110, conf: 0.99, rms: -60, expectedHz: 110 },
    { hz: null, conf: 0, rms: -20, expectedHz: 110 },
  ];
  const a = aggregate(rows, 0.85);
  assert.deepEqual([a.n, a.accepted, a.ok5, a.octave, a.gated, a.rejectedConf], [5, 2, 1, 1, 1, 2]);
});

test('POC GC-014: estabilizador exige K quadros consistentes e a emissão a 10 Hz retém a última saída', () => {
  const mk = (t, hz) => ({ t, rms: -20, results: { YIN: { hz, conf: 0.95 } } });
  const frames = [mk(0.1, 100), mk(0.12, 100), mk(0.14, 150), mk(0.16, 150), mk(0.18, 150), mk(0.2, 150)];
  const outs = stabilize(frames, 'YIN', 0.85, 3);
  assert.deepEqual(outs.map(o => o.hz), [null, null, null, null, 150, 150]);
  const ticks = sampleTicks(outs, 0, 0.2);
  assert.deepEqual(ticks.map(t => t.hz), [null, null, 150]);
  const { settleS } = settle(outs, { tc: 0.13, to: 150, from: 100 }, 5, 0.2);
  assert.ok(Math.abs(settleS - 0.05) < 1e-9);
});
