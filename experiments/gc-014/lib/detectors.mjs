// GC-014 POC: detectores monofônicos comparáveis. Mesmo buffer, mesma faixa de lags, mesmo custo O(W·τmax).
// Código de pesquisa em Node: referência de algoritmo, NÃO a implementação Kotlin nem medida de latência Android.
export const F_MIN = 70;
export const F_MAX = 1000;

export function lagRange(fs) {
  return { tauMin: Math.floor(fs / F_MAX), tauMax: Math.ceil(fs / F_MIN) };
}

/** Número de amostras do buffer para uma duração em ms (mesma taxa efetiva do PCM). */
export const windowSamples = (fs, ms) => Math.round((fs * ms) / 1000);

function parabolic(a, b, c) {
  const d = a - 2 * b + c;
  return d ? Math.max(-1, Math.min(1, (0.5 * (a - c)) / d)) : 0;
}

/** Soma r[τ] = Σ x[i]x[i+τ] e m[τ] = Σ (x[i]² + x[i+τ]²) para i em [0, W). */
function correlations(x, fs) {
  const { tauMax } = lagRange(fs);
  const W = x.length - tauMax - 1;
  if (W < 8) throw new Error(`janela curta demais para ${fs} Hz: ${x.length} amostras`);
  const r = new Float64Array(tauMax + 2);
  const m = new Float64Array(tauMax + 2);
  let head = 0;
  for (let i = 0; i < W; i++) head += x[i] * x[i];
  let tail = head; // Σ x[i+τ]² para τ=0
  for (let tau = 0; tau <= tauMax + 1; tau++) {
    if (tau > 0) tail += x[W - 1 + tau] * x[W - 1 + tau] - x[tau - 1] * x[tau - 1];
    let s = 0;
    for (let i = 0; i < W; i++) s += x[i] * x[i + tau];
    r[tau] = s;
    m[tau] = head + tail;
  }
  return { r, m, W, tauMax };
}

/** YIN: diferença quadrática, CMNDF, primeiro vale abaixo do limiar e interpolação parabólica. */
export function yin(x, fs, { threshold = 0.2 } = {}) {
  const { tauMin, tauMax } = lagRange(fs);
  const W = x.length - tauMax - 1;
  const cm = new Float64Array(tauMax + 2).fill(1);
  let run = 0;
  for (let tau = 1; tau <= tauMax + 1; tau++) {
    let d = 0;
    for (let i = 0; i < W; i++) {
      const v = x[i] - x[i + tau];
      d += v * v;
    }
    run += d;
    cm[tau] = run > 0 ? (d * tau) / run : 1;
  }
  let tau = -1;
  for (let t = tauMin; t <= tauMax; t++) {
    if (cm[t] < threshold) {
      while (t + 1 <= tauMax && cm[t + 1] < cm[t]) t++;
      tau = t;
      break;
    }
  }
  if (tau < 0) {
    tau = tauMin;
    for (let t = tauMin; t <= tauMax; t++) if (cm[t] < cm[tau]) tau = t;
  }
  const off = tau > tauMin && tau < tauMax ? parabolic(cm[tau - 1], cm[tau], cm[tau + 1]) : 0;
  return { hz: fs / (tau + off), conf: Math.max(0, 1 - cm[tau]), tau: tau + off };
}

/** MPM: NSDF = 2r/m, máximos-chave entre cruzamentos por zero, primeiro ≥ k·máximo, interpolação. */
export function mpm(x, fs, { k = 0.9 } = {}) {
  const { tauMin, tauMax } = lagRange(fs);
  const { r, m } = correlations(x, fs);
  const nsdf = new Float64Array(tauMax + 2);
  for (let t = 0; t <= tauMax + 1; t++) nsdf[t] = m[t] > 0 ? (2 * r[t]) / m[t] : 0;
  const peaks = [];
  let t = 1;
  while (t <= tauMax && nsdf[t] > 0) t++; // ignora o lóbulo inicial em τ=0
  while (t <= tauMax) {
    while (t <= tauMax && nsdf[t] <= 0) t++;
    let best = -1;
    while (t <= tauMax && nsdf[t] > 0) {
      if (t >= tauMin && (best < 0 || nsdf[t] > nsdf[best])) best = t;
      t++;
    }
    if (best > tauMin && best < tauMax) peaks.push(best);
  }
  if (!peaks.length) return { hz: null, conf: 0, tau: null };
  const top = Math.max(...peaks.map(p => nsdf[p]));
  const tau = peaks.find(p => nsdf[p] >= k * top) ?? peaks[0];
  const off = parabolic(-nsdf[tau - 1], -nsdf[tau], -nsdf[tau + 1]);
  const peakValue = nsdf[tau] - 0.25 * (nsdf[tau - 1] - nsdf[tau + 1]) * off;
  return { hz: fs / (tau + off), conf: Math.max(0, Math.min(1, peakValue)), tau: tau + off };
}

/** Baseline ingênuo do POC anterior: ACF normalizada, pico global, sem interpolação. */
export function acfGlobal(x, fs) {
  const { tauMin, tauMax } = lagRange(fs);
  const W = x.length - tauMax - 1;
  let best = -Infinity;
  let lag = tauMin;
  for (let tau = tauMin; tau <= tauMax; tau++) {
    let xy = 0;
    let xx = 0;
    let yy = 0;
    for (let i = 0; i < W; i++) {
      xy += x[i] * x[i + tau];
      xx += x[i] * x[i];
      yy += x[i + tau] * x[i + tau];
    }
    const c = xx > 0 && yy > 0 ? xy / Math.sqrt(xx * yy) : 0;
    if (c > best) {
      best = c;
      lag = tau;
    }
  }
  return { hz: fs / lag, conf: Math.max(0, best), tau: lag };
}

/** Algoritmos avaliados; `params` permite ablações (limiar do YIN, fator k do MPM). */
export function makeAlgorithms({ yinThreshold = 0.2, mpmK = 0.9 } = {}) {
  return {
    'ACF global (baseline)': (x, fs) => acfGlobal(x, fs),
    YIN: (x, fs) => yin(x, fs, { threshold: yinThreshold }),
    'MPM (ACF refinada)': (x, fs) => mpm(x, fs, { k: mpmK }),
  };
}
export const VARIANTS = Object.keys(makeAlgorithms());
