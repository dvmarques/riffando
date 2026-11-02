// GC-014 POC: sequências temporais (troca de nota, ataque e decaimento), estabilização e emissão a 10 Hz.
import { makeAlgorithms, windowSamples } from './detectors.mjs';
import { GATE_DBFS, percentile, TOL_CLEAN_CENTS, TOL_NOTE_CENTS } from './metrics.mjs';
import { STRINGS, centsBetween, dbfsToLinear, gaussian, midiToHz, mulberry32, partialProfile, rmsDbfs, synth } from './signal.mjs';

export const HOP_S = 0.02;
export const EMIT_PERIOD_S = 0.1;
export const EMIT_PHASES_S = [0, 0.025, 0.05, 0.075];
const SEQ_FS = 48000;
const FLOOR = { kind: 'white', rmsDbfs: -54 }; // ruído ambiente medido na GC-013

const ramp = (t, t0, t1) => Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));

/** Transições abruptas entre notas (mudança rápida), com troca de fase/parciais e rampas de 2 ms. */
export function buildTransitions(seedBase = 0) {
  const hz = m => midiToHz(m);
  const pairs = [
    ['E2→A2', hz(40), hz(45)], ['A2→D3', hz(45), hz(50)], ['D3→G3', hz(50), hz(55)], ['G3→B3', hz(55), hz(59)],
    ['B3→E4', hz(59), hz(64)], ['E4→E2', hz(64), hz(40)], ['E2→F2 (semitom)', hz(40), hz(41)],
    ['A2→A2 +30c (ajuste de tarraxa)', hz(45), hz(45) * 2 ** (30 / 1200)],
  ];
  const out = [];
  pairs.forEach(([name, from, to], p) => {
    for (let v = 0; v < 3; v++) {
      const seed = seedBase + 100 * p + v + 1;
      const rng = mulberry32(seed);
      const tc = 0.4;
      const a = synth({ fs: SEQ_FS, seconds: 1.2, f0: from, partials: partialProfile(rng), levelDb: -20, rng, quantize: false });
      const b = synth({ fs: SEQ_FS, seconds: 1.2, f0: to, partials: partialProfile(rng), levelDb: -20, rng, quantize: false });
      const x = new Float64Array(a.length);
      for (let i = 0; i < x.length; i++) {
        const t = i / SEQ_FS;
        const gb = ramp(t, tc, tc + 0.002);
        x[i] = a[i] * (1 - gb) + b[i] * gb;
      }
      noiseAndQuantize(x, rng);
      out.push({ kind: 'transition', name, seed, x, tc, from, to });
    }
  });
  return out;
}

/** Notas tocadas com ataque, transiente de palheta, deslizamento de afinação (+6 c) e decaimento exponencial. */
export function buildPlucks(seedBase = 0) {
  const out = [];
  STRINGS.forEach(([name, midi], s) => {
    for (let v = 0; v < 2; v++) {
      const seed = seedBase + 5000 + 10 * s + v + 1;
      const rng = mulberry32(seed);
      const f = midiToHz(midi);
      const onset = 0.2;
      const instHz = t => (t < onset ? f : f * 2 ** ((6 / 1200) * Math.exp(-(t - onset) / 0.08)));
      const envelope = t => (t < onset ? 0 : ramp(t, onset, onset + 0.003) * Math.exp(-(t - onset) / 1.2));
      const x = synth({
        fs: SEQ_FS, seconds: 2.2, f0: instHz, partials: partialProfile(rng), levelDb: -14, envelope, rng, quantize: false,
        extra: (buf, fs) => {
          const g = dbfsToLinear(-14);
          for (let i = Math.round(onset * fs); i < Math.round((onset + 0.03) * fs); i++) buf[i] += 0.3 * g * Math.exp(-(i / fs - onset) / 0.004) * gaussian(rng);
        },
      });
      noiseAndQuantize(x, rng);
      out.push({ kind: 'pluck', name, seed, x, tc: onset, from: null, to: f });
    }
  });
  return out;
}

function noiseAndQuantize(x, rng) {
  const n = x.length;
  const floor = new Float64Array(n);
  let p = 0;
  for (let i = 0; i < n; i++) { floor[i] = gaussian(rng); p += floor[i] ** 2; }
  const g = dbfsToLinear(FLOOR.rmsDbfs) / Math.sqrt(p / n);
  for (let i = 0; i < n; i++) x[i] = Math.max(-32768, Math.min(32767, Math.round((x[i] + floor[i] * g) * 32768))) / 32768;
}

/** Quadros causais: cada saída em t usa as N amostras que terminam em t. */
export function analyzeFrames(x, windowMs, algorithms = makeAlgorithms()) {
  const N = windowSamples(SEQ_FS, windowMs);
  const hop = Math.round(HOP_S * SEQ_FS);
  const frames = [];
  for (let end = N; end <= x.length; end += hop) {
    const seg = x.subarray(end - N, end);
    const rms = rmsDbfs(seg);
    const results = {};
    for (const [name, run] of Object.entries(algorithms)) results[name] = run(seg, SEQ_FS);
    frames.push({ t: end / SEQ_FS, rms, results });
  }
  return frames;
}

/** Estabilizador: exige K quadros aceitos consecutivos com dispersão ≤ 50 cents e devolve a mediana. */
export function stabilize(frames, variant, thr, K) {
  const accepted = frames.map(f => {
    const r = f.results[variant];
    return f.rms >= GATE_DBFS && r.hz !== null && r.conf >= thr ? r.hz : null;
  });
  return frames.map((f, i) => {
    if (i < K - 1) return { t: f.t, hz: null };
    const win = accepted.slice(i - K + 1, i + 1);
    if (win.some(v => v === null)) return { t: f.t, hz: null };
    const sorted = [...win].sort((a, b) => a - b);
    if (centsBetween(sorted[K - 1], sorted[0]) > TOL_NOTE_CENTS) return { t: f.t, hz: null };
    return { t: f.t, hz: sorted[Math.floor(K / 2)] };
  });
}

/** Retém a última saída interna a cada tick (zero-order hold) — modela o limite de ~10 eventos/s ao JS. */
export function sampleTicks(outs, phase, endT) {
  const ticks = [];
  let j = 0;
  let last = { hz: null };
  for (let tick = phase; tick <= endT; tick += EMIT_PERIOD_S) {
    while (j < outs.length && outs[j].t <= tick) last = outs[j++];
    ticks.push({ t: tick, hz: last.hz });
  }
  return ticks;
}

/** Tempo até todas as saídas seguintes estarem dentro de `tol` cents (até endEval) e tempo exibindo a nota antiga. */
export function settle(outs, { tc, to, from }, tol, endEval) {
  const seq = outs.filter(o => o.t > tc && o.t <= endEval);
  let first = seq.length;
  for (let i = seq.length - 1; i >= 0; i--) {
    const ok = seq[i].hz !== null && Math.abs(centsBetween(seq[i].hz, to)) <= tol;
    if (!ok) break;
    first = i;
  }
  const dt = seq.length > 1 ? seq[1].t - seq[0].t : HOP_S;
  const stale = from === null ? 0 : seq.filter(o => o.hz !== null && Math.abs(centsBetween(o.hz, from)) <= TOL_NOTE_CENTS && Math.abs(centsBetween(from, to)) > TOL_NOTE_CENTS).length * dt;
  return { settleS: first < seq.length ? seq[first].t - tc : null, staleS: stale };
}

export function summarize(values) {
  const ok = values.filter(v => v !== null);
  return { n: values.length, fail: values.length - ok.length, median: percentile(ok, 0.5), p95: percentile(ok, 0.95) };
}

/**
 * Executa todas as sequências para um conjunto de janelas e variantes.
 * Retorna linhas {kind, window, variant, K, mode, tol, settleS, staleS, fpPre, ...}.
 */
export function runStreaming({ windowsMs, thr, Ks = [2, 3, 5], seedBase = 0, sequences = [...buildTransitions(seedBase), ...buildPlucks(seedBase)] }) {
  const rows = [];
  for (const ms of windowsMs) {
    for (const seq of sequences) {
      const frames = analyzeFrames(seq.x, ms);
      const endEval = seq.kind === 'pluck' ? seq.tc + 1 : 1.2;
      for (const variant of Object.keys(frames[0].results).filter(v => v !== 'ACF global (baseline)')) {
        for (const K of Ks) {
          const outs = stabilize(frames, variant, thr[variant], K);
          const modes = [['interno 50 Hz', outs], ...EMIT_PHASES_S.map(ph => [`10 Hz (fase ${ph * 1000} ms)`, sampleTicks(outs, ph, 1.2)])];
          for (const [mode, series] of modes) {
            for (const tol of [TOL_CLEAN_CENTS, TOL_NOTE_CENTS]) {
              const { settleS, staleS } = settle(series, seq, tol, endEval);
              const pre = seq.kind === 'pluck' ? series.filter(o => o.t <= seq.tc && o.hz !== null).length : 0;
              rows.push({ kind: seq.kind, seq: seq.name, seed: seq.seed, window: ms, variant, K, mode: mode.startsWith('10') ? '10 Hz' : mode, tol, settleS, staleS, fpPre: pre });
            }
          }
        }
      }
    }
  }
  return rows;
}
