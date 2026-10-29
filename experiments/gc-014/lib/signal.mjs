// GC-014 POC: geração determinística de sinais sintéticos (sem gravações, sem dependências).
export const A4 = 440;
export const STRINGS = [
  ['E2', 40], ['A2', 45], ['D3', 50], ['G3', 55], ['B3', 59], ['E4', 64],
];
export const midiToHz = midi => A4 * 2 ** ((midi - 69) / 12);
export const centsBetween = (hz, refHz) => 1200 * Math.log2(hz / refHz);
export const dbfsToLinear = db => 10 ** (db / 20);

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function gaussian(rng) {
  const u = Math.max(rng(), 1e-12);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
}

/** Perfil espectral de corda/captação: amplitudes relativas dos parciais 1..n. */
export function partialProfile(rng, { fundamental = 1, tilt = 0.8, count = 8 } = {}) {
  return Array.from({ length: count }, (_, i) => {
    const k = i + 1;
    const jitter = 0.75 + 0.5 * rng();
    return k === 1 ? fundamental : jitter * k ** -tilt;
  });
}

/**
 * Sintetiza um sinal PCM16 simulado (devolvido em ponto flutuante normalizado).
 * f0: número (Hz) ou função t→Hz (frequência instantânea); fase integrada por amostra.
 * level: RMS estacionário do componente tonal em dBFS (referência ±1,0).
 * noise: {kind:'white'|'brown', rmsDbfs} somado em valor absoluto.
 */
export function synth({
  fs, seconds, f0, partials, levelDb = -20, envelope = () => 1, noise = null,
  inharmonicity = 5e-5, rng, extra = null, quantize = true,
}) {
  const n = Math.round(fs * seconds);
  const x = new Float64Array(n);
  const power = partials.reduce((s, a) => s + a * a / 2, 0);
  const gain = power > 0 ? dbfsToLinear(levelDb) / Math.sqrt(power) : 0;
  const phase = partials.map(() => rng() * 2 * Math.PI);
  let base = 0;
  for (let i = 0; i < n; i++) {
    const t = i / fs;
    const f = typeof f0 === 'function' ? f0(t) : f0;
    base += (2 * Math.PI * f) / fs;
    let v = 0;
    for (let k = 1; k <= partials.length; k++) {
      v += partials[k - 1] * Math.sin(base * k * Math.sqrt(1 + inharmonicity * k * k) + phase[k - 1]);
    }
    x[i] = gain * v * envelope(t);
  }
  if (extra) extra(x, fs);
  if (noise) addNoise(x, noise, rng);
  if (quantize) {
    for (let i = 0; i < n; i++) x[i] = Math.max(-32768, Math.min(32767, Math.round(x[i] * 32768))) / 32768;
  }
  return x;
}

export function addNoise(x, { kind = 'white', rmsDbfs }, rng) {
  const n = x.length;
  const noise = new Float64Array(n);
  let acc = 0;
  for (let i = 0; i < n; i++) {
    const g = gaussian(rng);
    acc = kind === 'brown' ? 0.995 * acc + g : g;
    noise[i] = acc;
  }
  let p = 0;
  for (const v of noise) p += v * v;
  const scale = dbfsToLinear(rmsDbfs) / Math.sqrt(p / n || 1);
  for (let i = 0; i < n; i++) x[i] += noise[i] * scale;
}

export const rmsDbfs = (x, start = 0, end = x.length) => {
  let p = 0;
  for (let i = start; i < end; i++) p += x[i] * x[i];
  return 10 * Math.log10(p / (end - start) + 1e-20);
};
