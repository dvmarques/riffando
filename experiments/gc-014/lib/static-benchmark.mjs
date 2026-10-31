// GC-014 POC: benchmark estático (um quadro por janela) sobre o corpus sintético.
import { makeAlgorithms, windowSamples } from './detectors.mjs';
import { END_TIMES, buildCorpus } from './corpus.mjs';
import { centsBetween, mulberry32, rmsDbfs } from './signal.mjs';

/** Gera as linhas brutas {case, variant, hz, conf, rms, expectedHz, nominalHz} para fs e janelas dados. */
export function runStatic({ fs, windowsMs, seedBase = 0, filter = () => true, algorithms = makeAlgorithms() }) {
  const rows = [];
  for (const c of buildCorpus(seedBase).filter(filter)) {
    const made = c.make(fs, mulberry32(c.seed));
    const x = made.x ?? made;
    for (const end of END_TIMES) {
      for (const ms of windowsMs) {
        const N = windowSamples(fs, ms);
        const e = Math.round(end * fs);
        const seg = x.subarray(e - N, e);
        let expectedHz = c.expectedHz;
        if (made.instHz) { // média da frequência instantânea (em cents) na janela
          let acc = 0;
          for (let i = e - N; i < e; i++) acc += centsBetween(made.instHz(i / fs), c.expectedHz);
          expectedHz = c.expectedHz * 2 ** (acc / N / 1200);
        }
        const rms = rmsDbfs(seg);
        for (const [variant, run] of Object.entries(algorithms)) {
          const r = run(seg, fs);
          rows.push({ id: c.id, category: c.category, sub: c.sub, fs, windowMs: ms, variant, hz: r.hz, conf: r.conf, rms, expectedHz, nominalHz: c.expectedHz });
        }
      }
    }
  }
  return rows;
}
