// GC-014 POC: corpus sintético determinístico por categoria. Cada caso pode gerar vários sinais (sementes).
import { STRINGS, addNoise, midiToHz, partialProfile, synth } from './signal.mjs';

export const SECONDS = 0.5;
export const END_TIMES = [0.3, 0.45]; // fins de janela avaliados em cada sinal estático (s)

const hz = midi => midiToHz(midi);
const lineup = STRINGS.map(([name, midi]) => ({ name, hz: hz(midi) }));

/**
 * Descreve cada caso: {category, sub, expectedHz|null, make(fs, rng)}; make devolve o PCM ou {x, instHz} (vibrato).
 * `seedBase` separa corpus de calibração (limiares) do de avaliação.
 */
export function buildCorpus(seedBase = 0) {
  const cases = [];
  let counter = 0;
  const add = (category, sub, expectedHz, make, extra = {}) => {
    counter++;
    cases.push({ id: `${category}#${counter}`, category, sub, expectedHz, make, seed: seedBase + counter, ...extra });
  };
  const tone = (rng, fs, f0, o = {}) => synth({
    fs, seconds: SECONDS, f0, partials: o.partials ?? partialProfile(rng), levelDb: o.levelDb ?? -20, rng,
    noise: o.noise ?? null, inharmonicity: o.inharmonicity, envelope: o.envelope,
  });

  // 1. Cordas soltas limpas (nível medido na GC-013: RMS −23…−9 dBFS a 1 m/50 cm).
  for (const s of lineup) {
    for (let v = 0; v < 4; v++) add('01 cordas soltas limpas', s.name, s.hz, (fs, rng) => tone(rng, fs, s.hz, { levelDb: -24 + 5 * v }));
  }
  // 2. Desafinações ± cents.
  for (const s of lineup) {
    for (const d of [-40, -20, -10, -5, 5, 10, 20, 40]) {
      for (let v = 0; v < 2; v++) {
        const f = s.hz * 2 ** (d / 1200);
        add('02 desafinadas', `${s.name} ${d > 0 ? '+' : ''}${d}c`, f, (fs, rng) => tone(rng, fs, f, { levelDb: -18 - 6 * v }));
      }
    }
  }
  // 3. Notas cromáticas e extremos da faixa (D2 … B5).
  for (const midi of [38, 42, 47, 52, 57, 62, 67, 72, 79, 83]) {
    for (let v = 0; v < 2; v++) add('03 faixa cromática', `MIDI ${midi}`, hz(midi), (fs, rng) => tone(rng, fs, hz(midi), { levelDb: -22 }));
  }
  // 4. Harmônicos fortes, fundamental enfraquecida (inclui ausente: o período comum permanece o de f0).
  for (const s of lineup) {
    for (const ratio of [0.4, 0.15, 0]) {
      for (let v = 0; v < 2; v++) {
        add('04 fundamental fraca', `${s.name} f1=${ratio}`, s.hz, (fs, rng) => tone(rng, fs, s.hz, { partials: [ratio, 1, 0.8, 0.5, 0.3, 0.2, 0.1, 0.05] }));
      }
    }
  }
  // 5. Ruído branco leve/moderado (SNR relativo ao tom).
  for (const s of lineup) {
    for (const snr of [30, 20, 10, 5]) {
      for (let v = 0; v < 3; v++) {
        add(`05 ruído ${snr >= 20 ? 'leve' : 'moderado'}`, `${s.name} SNR ${snr} dB`, s.hz, (fs, rng) => tone(rng, fs, s.hz, { levelDb: -20, noise: { kind: 'white', rmsDbfs: -20 - snr } }));
      }
    }
  }
  // 6. Baixa amplitude sobre o ruído ambiente medido na GC-013 (RMS −54 dBFS).
  for (const s of lineup) {
    for (const level of [-25, -35, -45, -50, -55]) {
      for (let v = 0; v < 2; v++) add('06 baixa amplitude', `${s.name} ${level} dBFS`, s.hz, (fs, rng) => tone(rng, fs, s.hz, { levelDb: level, noise: { kind: 'white', rmsDbfs: -54 } }));
    }
  }
  // 7. Vibrato com frequência instantânea conhecida (fase aleatória por semente).
  for (const s of lineup) {
    for (const depth of [10, 25, 50]) {
      for (const rate of [4.5, 6.5]) {
        add('07 vibrato', `${s.name} ±${depth}c ${rate} Hz`, s.hz, (fs, rng) => {
          const ph = rng() * 2 * Math.PI;
          const instHz = t => s.hz * 2 ** ((depth / 1200) * Math.sin(2 * Math.PI * rate * t + ph));
          return { x: tone(rng, fs, instHz), instHz };
        });
      }
    }
  }
  // 8. Falhas de oitava: corda tocada no ponto médio (harmônicos ímpares ≈ r; período aparente T/2) e dobra de período (modulação em f/2).
  for (const s of lineup) {
    for (const ratio of [0.2, 0.1, 0.05, 0.02]) {
      add('08 oitava: ímpares fracos', `${s.name} ímpares=${ratio}`, s.hz, (fs, rng) => tone(rng, fs, s.hz, { partials: [ratio, 1, ratio, 0.5, ratio * 0.5, 0.3, ratio * 0.3, 0.15] }));
    }
    for (const m of [0.1, 0.2, 0.4]) {
      add('08 oitava: dobra de período', `${s.name} m=${m}`, s.hz, (fs, rng) => synth({
        fs, seconds: SECONDS, f0: s.hz, partials: partialProfile(rng), levelDb: -20, rng,
        envelope: t => 1 + m * Math.cos(Math.PI * s.hz * t),
      }));
    }
  }
  // 9. Inarmonicidade elevada (estresse: B = 3e-4 contra 5e-5 padrão).
  for (const s of lineup) {
    for (let v = 0; v < 2; v++) add('09 inarmonicidade alta', s.name, s.hz, (fs, rng) => tone(rng, fs, s.hz, { inharmonicity: 3e-4 }));
  }
  // 10. Silêncio, ruído e sinais ambíguos (não há f0 esperada: qualquer saída aceita é falso positivo, salvo nota abaixo).
  const none = (sub, make, note = '') => add('10 sem tom/ambíguo', sub, null, make, { note });
  none('silêncio digital', fs => new Float64Array(Math.round(fs * SECONDS)));
  for (let v = 0; v < 4; v++) {
    none('ruído ambiente −54 dBFS', (fs, rng) => { const x = new Float64Array(Math.round(fs * SECONDS)); addNoise(x, { rmsDbfs: -54 }, rng); return quant(x); });
    none('ruído branco −30 dBFS', (fs, rng) => { const x = new Float64Array(Math.round(fs * SECONDS)); addNoise(x, { rmsDbfs: -30 }, rng); return quant(x); });
    none('ruído marrom −35 dBFS', (fs, rng) => { const x = new Float64Array(Math.round(fs * SECONDS)); addNoise(x, { kind: 'brown', rmsDbfs: -35 }, rng); return quant(x); });
    none('varredura 100→900 Hz', (fs, rng) => synth({ fs, seconds: SECONDS, f0: t => 100 + 1600 * t, partials: [1], levelDb: -25, rng }));
  }
  for (const f of [50, 60]) {
    none(`zumbido de rede ${f} Hz`, (fs, rng) => synth({ fs, seconds: SECONDS, f0: f, partials: [1, 0.5, 0.35, 0.2, 0.1], levelDb: -35, rng }), 'tonal real: pode ser aceito legitimamente se ≥ 70 Hz');
  }
  // Polifonia/dueto: monofônico deve rejeitar ou, ao menos, não ter confiança alta.
  for (const [sub, midis] of [['quinta E2+B2', [40, 47]], ['quinta A2+E3', [45, 52]], ['trítono E3+Bb3', [52, 58]], ['semitom E4+F4', [64, 65]], ['acorde Em aberto', [40, 47, 52, 55, 59, 64]], ['acorde G aberto', [43, 47, 50, 55, 59, 67]]]) {
    none(sub, (fs, rng) => {
      const sum = new Float64Array(Math.round(fs * SECONDS));
      for (const m of midis) {
        const part = synth({ fs, seconds: SECONDS, f0: hz(m), partials: partialProfile(rng), levelDb: -26, rng, quantize: false });
        for (let i = 0; i < sum.length; i++) sum[i] += part[i];
      }
      return quant(sum);
    }, 'polifônico: sem f0 única; aceitar implica nota arbitrária');
  }
  return cases;
}

function quant(x) {
  for (let i = 0; i < x.length; i++) x[i] = Math.max(-32768, Math.min(32767, Math.round(x[i] * 32768))) / 32768;
  return x;
}

export { lineup };
