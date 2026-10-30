// Confirma que o AGP executou testes JUnit reais, não apenas criou uma task vazia.
// Invocar de dentro de android/ imediatamente após :riffando-audio:testDebugUnitTest.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const directory = resolve(
  '..', 'modules', 'riffando-audio', 'android', 'build', 'test-results', 'testDebugUnitTest',
);
// Suites e quantidades esperadas (captura GC-013 e afinador GC-014): divergência indica teste removido ou não executado.
const expected = {
  PcmSignalAccumulatorTest: 4,
  CaptureLifecycleTest: 6,
  PitchPipelineTest: 10,
};

const results = {};
let total = 0;
for (const [name, count] of Object.entries(expected)) {
  const xml = readFileSync(resolve(directory, `TEST-br.com.riffando.audio.${name}.xml`), 'utf8');
  const suite = xml.match(/<testsuite\b[^>]*>/)?.[0];
  const read = attribute => {
    const value = suite?.match(new RegExp(`\\b${attribute}="(\\d+)"`))?.[1];
    return value === undefined ? NaN : Number(value);
  };
  const observed = (xml.match(/<testcase\b/g) ?? []).length;
  const result = {
    tests: read('tests'), errors: read('errors'), failures: read('failures'),
    skipped: read('skipped'), observed,
  };
  results[name] = result;
  if (result.tests !== count || result.observed !== count || result.errors !== 0 ||
      result.failures !== 0 || result.skipped !== 0) {
    throw new Error(`JUnit PCM inválido em ${name}: ${JSON.stringify(results)}`);
  }
  total += result.tests;
}
console.log(`JUnit PCM confirmado: ${total} testes Kotlin executados em ${Object.keys(expected).length} suites, sem falhas, erros ou skips.`);
