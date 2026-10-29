// GC-014 POC: benchmark reproduzível de detecção de pitch (YIN × ACF refinada/MPM × baseline) sobre sinais sintéticos.
// Reproduza: node experiments/gc-014/run-benchmark.mjs   (≈ 6–9 min em Node 22; determinístico, exceto results/timing.md)
// Escreve results/report.md (métricas determinísticas) e results/timing.md (tempos de Node, NÃO representam Android).
import { mkdirSync, writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { VARIANTS, lagRange, makeAlgorithms, windowSamples } from './lib/detectors.mjs';
import { GATE_DBFS, aggregate, fix, pct } from './lib/metrics.mjs';
import { runStatic } from './lib/static-benchmark.mjs';
import { runStreaming, summarize } from './lib/stream.mjs';
import { mulberry32, partialProfile, synth, midiToHz } from './lib/signal.mjs';

const THR = 0.85; // limiar de confiança a priori (YIN: 1−CMNDF; MPM/ACF: pico normalizado); sensibilidade em §4
const THR_BY = Object.fromEntries(VARIANTS.map(v => [v, THR]));
const WINDOWS = [32, 48, 64, 85, 128];
const REF_MS = 85;
const CAT = {
  clean: '01 cordas soltas limpas', detune: '02 desafinadas', chroma: '03 faixa cromática', weak: '04 fundamental fraca',
  noiseL: '05 ruído leve', noiseM: '05 ruído moderado', low: '06 baixa amplitude', vib: '07 vibrato',
  odd: '08 oitava: ímpares fracos', dbl: '08 oitava: dobra de período', inh: '09 inarmonicidade alta', none: '10 sem tom/ambíguo',
};
const out = [];
const md = (...lines) => out.push(...lines, '');
const table = (head, rows) => md(`| ${head.join(' | ')} |`, `|${head.map((_, i) => (i ? '---:' : '---')).join('|')}|`, ...rows.map(r => `| ${r.join(' | ')} |`));
const log = msg => console.error(`[${((performance.now() - T0) / 1000).toFixed(0)} s] ${msg}`);
const T0 = performance.now();

log('estático 48 kHz');
const rows48 = runStatic({ fs: 48000, windowsMs: WINDOWS });
log('estático 16 kHz');
const rows16 = runStatic({ fs: 16000, windowsMs: [64, 85, 128], filter: c => ['01', '02', '03', '04', '05', '07', '08'].includes(c.category.slice(0, 2)) });
const idx = new Map();
for (const r of [...rows48, ...rows16]) {
  const key = `${r.fs}|${r.windowMs}|${r.variant}|${r.category}`;
  if (!idx.has(key)) idx.set(key, []);
  idx.get(key).push(r);
}
const pick = (fs, ms, variant, cats) => [].concat(...[].concat(cats).map(c => idx.get(`${fs}|${ms}|${variant}|${c}`) ?? []));
const agg = (fs, ms, variant, cats, o = {}) => aggregate(pick(fs, ms, variant, cats), o.thr ?? THR, o);
const cell5 = a => `${pct(a.ok5, a.n)} · ${fix(a.medianAbs)}/${fix(a.p95Abs)}`;

md('# GC-014 — Relatório do benchmark sintético (gerado por `run-benchmark.mjs`)',
  `Referência: ${48000} Hz, janela de ${REF_MS} ms, gate de nível ${GATE_DBFS} dBFS (RMS da janela), limiar de confiança ${THR} para todos os algoritmos. Intervalo de busca 70–1000 Hz. Sinais determinísticos (PRNG com sementes fixas), PCM16 simulado; cada caso é avaliado em dois instantes (0,30 s e 0,45 s). **Nada aqui foi medido em Android ou com microfone.**`);

// 1. Referência por categoria
md('## 1. Resultados por categoria (48 kHz, 85 ms)',
  'Células: **±5 c** = taxa de leituras aceitas com |erro| ≤ 5 cents sobre todas as amostras da categoria · mediana/P95 do |erro| (cents) entre as leituras aceitas com nota correta (|erro| ≤ 50 c). Leituras rejeitadas (gate ou baixa confiança) contam como não detectadas.');
const catRows = Object.values(CAT).filter(c => c !== CAT.none).map(c => {
  const n = agg(48000, REF_MS, 'YIN', c).n;
  return [c, n, ...VARIANTS.map(v => cell5(agg(48000, REF_MS, v, c)))];
});
table(['Categoria', 'n', ...VARIANTS], catRows);

md('### Falhas e rejeições por categoria (YIN | MPM | ACF baseline)',
  '`rej` = rejeitadas por baixa confiança; `gate` = abaixo do gate de nível; `oit` = erro de oitava; `harm` = harmônico/subharmônico não oitava; `outro` = demais erros > 50 c.');
table(['Categoria', ...['YIN', 'MPM (ACF refinada)', 'ACF global (baseline)'].map(v => `${v}: rej/gate/oit/harm/outro`)],
  Object.values(CAT).filter(c => c !== CAT.none).map(c => [c, ...['YIN', 'MPM (ACF refinada)', 'ACF global (baseline)'].map(v => {
    const a = agg(48000, REF_MS, v, c);
    return `${a.rejectedConf}/${a.gated}/${a.octave}/${a.harmonic}/${a.other}`;
  })]));

// 2. Sem tom / ambíguo
md('## 2. Silêncio, ruído e sinais ambíguos (48 kHz, 85 ms)',
  'Contagem de leituras **aceitas** (falsos positivos para silêncio/ruído; para sinais tonais/polifônicos indica apenas que o detector monofônico produziu uma nota). n = 2 instantes × sementes.');
const noneRows = pick(48000, REF_MS, 'YIN', CAT.none);
const subs = [...new Set(noneRows.map(r => r.sub))];
table(['Sinal', 'n', ...VARIANTS.map(v => `${v}: aceitas`)],
  subs.map(s => [s, noneRows.filter(r => r.sub === s).length, ...VARIANTS.map(v => {
    const rr = pick(48000, REF_MS, v, CAT.none).filter(r => r.sub === s);
    return aggregate(rr, THR).accepted;
  })]));

// 3. Janelas
md('## 3. Sensibilidade à duração da janela (48 kHz)',
  'Buffer total = janela; o cálculo usa W = N − τmax − 1 amostras de integração (τmax = fs/70). Células: ±5 c · mediana/P95 (c). `—` = nada aceito.');
const GROUPS = [
  ['Limpas + desafinadas + cromáticas', [CAT.clean, CAT.detune, CAT.chroma]],
  ['Fundamental fraca (harm. fortes)', [CAT.weak]],
  ['Ruído leve (SNR 30/20 dB)', [CAT.noiseL]],
  ['Ruído moderado (SNR 10/5 dB)', [CAT.noiseM]],
  ['Vibrato (vs. média instantânea da janela)', [CAT.vib]],
  ['Oitava: ímpares fracos', [CAT.odd]],
];
for (const [name, cats] of GROUPS) {
  md(`### ${name}`);
  table(['Janela', 'N (amostras)', 'W', ...VARIANTS], WINDOWS.map(ms => [`${ms} ms`, windowSamples(48000, ms), windowSamples(48000, ms) - lagRange(48000).tauMax - 1, ...VARIANTS.map(v => {
    const a = agg(48000, ms, v, cats);
    return a.accepted ? `${cell5(a)} (oit ${a.octave})` : '—';
  })]));
}

// 4. Limiar de confiança
md('## 4. Sensibilidade ao limiar de confiança (48 kHz, 85 ms)',
  '**Recall** = leituras com nota correta (±50 c) nas categorias 01–03, 05 leve, 05 moderado e 07 · **FP ruído** = aceitas em silêncio/ruído branco/ruído marrom/ruído ambiente · **FP polifônico** = aceitas em dueto/acordes · **Oitava** = erros de oitava na categoria 08 (ímpares fracos).');
const tonalCats = [CAT.clean, CAT.detune, CAT.chroma, CAT.noiseL, CAT.noiseM, CAT.vib];
const noTone = r => r.sub.startsWith('silêncio') || r.sub.startsWith('ruído');
const poly = r => /quinta|trítono|semitom|acorde/.test(r.sub);
table(['Limiar', ...['YIN', 'MPM (ACF refinada)'].flatMap(v => [`${v} recall`, 'FP ruído', 'FP polif.', 'oitava'])],
  [0.7, 0.8, 0.85, 0.9, 0.95].map(t => [t, ...['YIN', 'MPM (ACF refinada)'].flatMap(v => {
    const a = agg(48000, REF_MS, v, tonalCats, { thr: t });
    const none = pick(48000, REF_MS, v, CAT.none);
    return [pct(a.ok5 + a.ok50, a.n), aggregate(none.filter(noTone), t).accepted, `${aggregate(none.filter(poly), t).accepted}/${none.filter(poly).length}`, agg(48000, REF_MS, v, CAT.odd, { thr: t }).octave];
  })]));

// 5. Ablações
log('ablações');
md('## 5. Ablação do tratamento de oitava (48 kHz, 85 ms)',
  'Variação do limiar de seleção do YIN, do fator k do MPM (k = 1,0 equivale a escolher o maior pico-chave) e da guarda opcional de oitava 2τ (adota 2τ se o erro ali for < 50 % do erro em τ e este > 0,02; ver `octaveGuard`). Colunas: recall (±50 c) em 01–05, erros de oitava em 08 (ímpares fracos) e 08 (dobra de período), FP em ruído.');
const abl = [];
const ablCats = [CAT.clean, CAT.detune, CAT.chroma, CAT.weak, CAT.noiseL];
for (const [label, params, variant] of [
  ['YIN limiar 0,10', { yinThreshold: 0.1 }, 'YIN'], ['YIN limiar 0,15', { yinThreshold: 0.15 }, 'YIN'], ['YIN limiar 0,20 (padrão)', { yinThreshold: 0.2 }, 'YIN'], ['YIN limiar 0,30', { yinThreshold: 0.3 }, 'YIN'],
  ['MPM k 0,80', { mpmK: 0.8 }, 'MPM (ACF refinada)'], ['MPM k 0,90 (padrão)', { mpmK: 0.9 }, 'MPM (ACF refinada)'], ['MPM k 0,95', { mpmK: 0.95 }, 'MPM (ACF refinada)'], ['MPM k 1,00 (pico máximo)', { mpmK: 1 }, 'MPM (ACF refinada)'],
  ['YIN + guarda de oitava 2τ', { guard: true }, 'YIN'], ['MPM + guarda de oitava 2τ', { guard: true }, 'MPM (ACF refinada)'],
]) {
  const rows = runStatic({ fs: 48000, windowsMs: [REF_MS], algorithms: { [variant]: makeAlgorithms(params)[variant] }, filter: c => ['01', '02', '03', '04', '05', '08', '10'].includes(c.category.slice(0, 2)) });
  const of = cats => aggregate(rows.filter(r => [].concat(cats).includes(r.category)), THR);
  const rec = of(ablCats);
  abl.push([label, pct(rec.ok5 + rec.ok50, rec.n), of(CAT.odd).octave, of(CAT.dbl).octave, aggregate(rows.filter(r => r.category === CAT.none && noTone(r)), THR).accepted]);
}
table(['Configuração', 'Recall', 'Oitava (ímpares fracos)', 'Oitava (dobra de período)', 'FP ruído'], abl);

// 6. Baixa amplitude
md('## 6. Baixa amplitude sobre ruído ambiente de −54 dBFS (48 kHz, 85 ms)',
  'RMS do tom em dBFS (referência GC-013: guitarra a 50 cm/1 m ≈ −23…−9 dBFS). Com gate = decisão de produção proposta; sem gate = capacidade intrínseca do algoritmo (apenas confiança).');
const lowRows = pick(48000, REF_MS, 'YIN', CAT.low);
const levels = [-25, -35, -45, -50, -55];
table(['Nível', ...['YIN', 'MPM (ACF refinada)'].flatMap(v => [`${v} com gate (nota ok/n)`, 'sem gate (nota ok/n)'])],
  levels.map(l => [`${l} dBFS`, ...['YIN', 'MPM (ACF refinada)'].flatMap(v => {
    const rr = pick(48000, REF_MS, v, CAT.low).filter(r => r.sub.includes(` ${l} dBFS`));
    const g = aggregate(rr, THR);
    const ng = aggregate(rr, THR, { gate: false });
    return [`${g.ok5 + g.ok50}/${g.n} (gate: ${g.gated})`, `${ng.ok5 + ng.ok50}/${ng.n} (oit/harm/outro: ${ng.octave}/${ng.harmonic}/${ng.other})`];
  })]));
void lowRows;

// 7. Vibrato
md('## 7. Vibrato (48 kHz)',
  'Frequência instantânea conhecida. **Média da janela** = média (em cents) de f(t) nas N amostras analisadas; **centro nominal** = frequência central do vibrato (o que o afinador deveria mostrar). Células: mediana/P95 do |erro| (c) entre leituras aceitas · % aceitas.');
const vibRows = (ms, v) => pick(48000, ms, v, CAT.vib);
for (const depth of [10, 25, 50]) {
  md(`### Profundidade ±${depth} c (rates 4,5 e 6,5 Hz)`);
  table(['Janela', ...['YIN', 'MPM (ACF refinada)'].flatMap(v => [`${v}: vs média da janela`, 'vs centro nominal', 'aceitas'])],
    WINDOWS.map(ms => [`${ms} ms`, ...['YIN', 'MPM (ACF refinada)'].flatMap(v => {
      const rr = vibRows(ms, v).filter(r => r.sub.includes(`±${depth}c`));
      const a = aggregate(rr, THR);
      const b = aggregate(rr.map(r => ({ ...r, expectedHz: r.nominalHz })), THR);
      return [`${fix(a.medianAbs)}/${fix(a.p95Abs)}`, `${fix(b.medianAbs)}/${fix(b.p95Abs)}`, pct(a.accepted, a.n)];
    })]));
}

// 8. Faixa
md('## 8. Faixa operacional por nota (categoria 03, 85 ms)',
  'Notas MIDI 38 (D2, 73,4 Hz) … 83 (B5, 987,8 Hz). Células: leituras aceitas com ±5 c / n (2 instantes × 2 sementes = 4 por nota).');
const notes = [38, 42, 47, 52, 57, 62, 67, 72, 79, 83];
table(['Nota', 'Hz', 'YIN 48 kHz', 'MPM 48 kHz', 'YIN 16 kHz', 'MPM 16 kHz'], notes.map(m => [`MIDI ${m}`, fix(midiToHz(m)), ...[[48000, 'YIN'], [48000, 'MPM (ACF refinada)'], [16000, 'YIN'], [16000, 'MPM (ACF refinada)']].map(([fs, v]) => {
  const a = aggregate(pick(fs, REF_MS, v, CAT.chroma).filter(r => r.sub === `MIDI ${m}`), THR);
  return `${a.ok5}/${a.n} (med ${fix(a.medianAbs)})`;
})]));

md('## 9. Sensibilidade à taxa de amostragem (48 kHz × 16 kHz)',
  'A GC-013 prefere 48 kHz e usa 16 kHz como fallback. Mesmas durações em ms; N e τmax escalam com fs. Células: ±5 c · mediana/P95.');
const rateRows = [];
for (const [label, cats] of [['Limpas+desafinadas+cromáticas', [CAT.clean, CAT.detune, CAT.chroma]], ['Fundamental fraca', [CAT.weak]], ['Ruído leve', [CAT.noiseL]], ['Vibrato (média da janela)', [CAT.vib]], ['Oitava: ímpares fracos (oit)', [CAT.odd]]]) {
  for (const ms of [64, 85, 128]) {
    rateRows.push([label, `${ms} ms`, ...['YIN', 'MPM (ACF refinada)'].flatMap(v => [48000, 16000].map(fs => {
      const a = agg(fs, ms, v, cats);
      return a.accepted ? `${cell5(a)}${label.includes('oit') ? ` (${a.octave})` : ''}` : '—';
    }))]);
  }
}
table(['Grupo', 'Janela', 'YIN 48k', 'YIN 16k', 'MPM 48k', 'MPM 16k'], rateRows);

// 10. Streaming
log('sequências');
const stream = runStreaming({ windowsMs: [48, 64, 85, 128], thr: THR_BY });
md('## 10. Sequências: troca de nota, ataque e decaimento (48 kHz, hop de 20 ms)',
  'Estabilizador: K quadros consecutivos aceitos, dispersão ≤ 50 c, saída = mediana. **Tempo de estabilização** = do instante do evento (troca de nota/ataque) até o início do trecho em que *todas* as saídas seguintes ficam dentro da tolerância (até 0,8 s após a troca ou 1,0 s após o ataque); `falha` = nunca estabilizou. **Nota antiga** = tempo em que a saída ainda exibiu a nota anterior (>50 c). Modo “10 Hz” = última saída retida a cada 100 ms, fases 0/25/50/75 ms agregadas. Referência de tempo: o instante t da saída é o fim da janela (o atraso acústico–software do Android não está incluído).');
for (const kind of ['transition', 'pluck']) {
  md(`### ${kind === 'transition' ? 'Troca abrupta de nota (24 sequências)' : 'Palhetada: ataque, transiente, glissando +6 c e decaimento (12 sequências)'}`);
  const body = [];
  for (const variant of ['YIN', 'MPM (ACF refinada)']) {
    for (const ms of [48, 64, 85, 128]) {
      for (const K of [2, 3, 5]) {
        const cells = [];
        for (const mode of ['interno 50 Hz', '10 Hz']) {
          for (const tol of [5, 50]) {
            const rr = stream.filter(r => r.kind === kind && r.variant === variant && r.window === ms && r.K === K && r.mode === mode && r.tol === tol);
            const s = summarize(rr.map(r => r.settleS));
            cells.push(`${s.median === null ? '—' : Math.round(s.median * 1000)}/${s.p95 === null ? '—' : Math.round(s.p95 * 1000)}${s.fail ? ` (${s.fail}/${s.n} falha)` : ''}`);
          }
        }
        const stale = summarize(stream.filter(r => r.kind === kind && r.variant === variant && r.window === ms && r.K === K && r.mode === 'interno 50 Hz' && r.tol === 50).map(r => r.staleS));
        const fp = stream.filter(r => r.kind === kind && r.variant === variant && r.window === ms && r.K === K && r.mode === 'interno 50 Hz' && r.tol === 50).reduce((s, r) => s + r.fpPre, 0);
        body.push([variant, `${ms} ms`, K, ...cells, stale.median === null ? '—' : Math.round(stale.median * 1000), ...(kind === 'pluck' ? [fp] : [])]);
      }
    }
  }
  table(['Algoritmo', 'Janela', 'K', 'interno ±5c (med/P95 ms)', 'interno ±50c', '10 Hz ±5c', '10 Hz ±50c', 'nota antiga (med ms)', ...(kind === 'pluck' ? ['saídas antes do ataque'] : [])], body);
}

writeFileSync(new URL('./results/report.md', import.meta.url), `${out.join('\n')}\n`.replace(/\n{3,}/g, '\n\n'));
log('report.md escrito');

// 11. Custo (não determinístico)
const tim = ['# GC-014 — Tempo de execução em Node (não determinístico)',
  'Medidas em Node 22 (JIT V8) neste executor, **sem relação com Kotlin/ART, CPU do Galaxy S25 FE, bateria ou latência de áudio**. Servem apenas para comparar o custo relativo dos três algoritmos e o crescimento com a janela. Mediana de 15 execuções após aquecimento.', ''];
const rng = mulberry32(7);
const trows = [];
for (const fs of [48000, 16000]) {
  for (const ms of [48, 85, 128]) {
    const N = windowSamples(fs, ms);
    const x = synth({ fs, seconds: N / fs + 0.05, f0: 110, partials: partialProfile(rng), levelDb: -20, rng }).subarray(0, N);
    const W = N - lagRange(fs).tauMax - 1;
    const cols = Object.entries(makeAlgorithms()).map(([, run]) => {
      for (let i = 0; i < 5; i++) run(x, fs);
      const ts = [];
      for (let i = 0; i < 15; i++) { const t = performance.now(); run(x, fs); ts.push(performance.now() - t); }
      return ts.sort((a, b) => a - b)[7];
    });
    trows.push([fs, `${ms} ms`, N, W, `${((W * lagRange(fs).tauMax) / 1e6).toFixed(2)}`, ...cols.map(v => v.toFixed(2))]);
  }
}
const thead = ['fs (Hz)', 'Janela', 'N', 'W', 'W·τmax (M MAC)', ...VARIANTS.map(v => `${v} (ms)`)];
tim.push(`| ${thead.join(' | ')} |`, `|${thead.map((_, i) => (i ? '---:' : '---')).join('|')}|`, ...trows.map(r => `| ${r.join(' | ')} |`), '');
tim.push('Escala: o custo é ≈ W·τmax multiplicações-acumulações por quadro, para YIN e MPM (ACF baseline ≈ 3×). A 50 quadros/s (hop 20 ms) e 48 kHz, janela 85 ms: ≈ 50 × W·τmax MAC/s — ver coluna W·τmax. Otimizações (decimação, FFT) **não foram avaliadas**.', '');
writeFileSync(new URL('./results/timing.md', import.meta.url), tim.join('\n'));
log('timing.md escrito');
