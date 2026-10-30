import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = (path) => fs.readFileSync(path, 'utf8');
const dir = 'modules/riffando-audio/android/src/main/java/br/com/riffando/audio/';
const module = read(`${dir}RiffandoAudioModule.kt`);
const pipeline = read(`${dir}PitchPipeline.kt`);
const detector = read(`${dir}MpmPitchDetector.kt`);

test('o afinador reutiliza a captura existente: um único AudioRecord e nenhum PCM cru ao JS', () => {
  assert.equal((module.match(/AudioRecord\.Builder\(\)/g) ?? []).length, 1);
  assert.match(module, /AsyncFunction\("startTuner"\)/);
  assert.match(module, /Events\("onMetrics", "onCaptureError", "onPitch"\)/);
  assert.match(module, /AUDIO_MODE_CONFLICT/);
  const payload = module.slice(module.indexOf('sendEvent("onPitch"'), module.indexOf('"analysisMicros"'));
  assert.doesNotMatch(payload, /buffer|ShortArray|samples/);
  for (const field of ['sessionId', 'sequence', 'state', 'frequencyHz', 'confidence', 'windowMs', 'sampleRateHz']) {
    assert.ok(payload.includes(`"${field}"`), field);
  }
});

test('parâmetros do afinador seguem a change: janela 64 ms, ≤ 10 eventos/s, gate, confiança e estabilizador', () => {
  assert.match(detector, /WINDOW_SECONDS = 0\.064/);
  assert.match(detector, /HOP_SECONDS = 0\.02/);
  assert.match(detector, /EMIT_INTERVAL_NANOS = 100_000_000L/);
  assert.match(detector, /GATE_DBFS = -50\.0/);
  assert.match(detector, /GATE_REOPEN_DBFS = -47\.0/);
  assert.match(detector, /MIN_CONFIDENCE = 0\.90/);
  assert.match(detector, /STABILITY_FRAMES = 3/);
  assert.match(detector, /MAX_SPREAD_CENTS = 50\.0/);
  assert.match(detector, /SEARCH_MIN_HZ = 70\.0/);
  assert.match(detector, /SEARCH_MAX_HZ = 1000\.0/);
});

test('o código do afinador não grava arquivos, não usa rede e não registra amostras', () => {
  for (const source of [pipeline, detector]) {
    assert.doesNotMatch(source, /FileOutputStream|File\(|java\.net|HttpURLConnection|okhttp|Log\.[a-z]\(/);
  }
  assert.doesNotMatch(module, /FileOutputStream|java\.net|HttpURLConnection/);
});
