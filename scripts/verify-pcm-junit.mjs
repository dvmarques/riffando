// Confirma que o AGP executou testes JUnit reais, não apenas criou uma task vazia.
// Invocar de dentro de android/ imediatamente após :riffando-audio:testDebugUnitTest.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const report = resolve(
  '..', 'modules', 'riffando-audio', 'android', 'build',
  'test-results', 'testDebugUnitTest', 'TEST-br.com.riffando.audio.PcmSignalAccumulatorTest.xml',
);

const xml = readFileSync(report, 'utf8');
const suite = xml.match(/<testsuite\b[^>]*>/)?.[0];
const count = name => {
  const value = suite?.match(new RegExp(`\\b${name}="(\\d+)"`))?.[1];
  return value === undefined ? NaN : Number(value);
};
const observed = (xml.match(/<testcase\b/g) ?? []).length;
const results = {
  tests: count('tests'),
  errors: count('errors'),
  failures: count('failures'),
  skipped: count('skipped'),
  observed,
};
if (results.tests !== 4 || results.observed !== 4 ||
    results.errors !== 0 || results.failures !== 0 || results.skipped !== 0) {
  throw new Error(`JUnit PCM inválido: ${JSON.stringify(results)}`);
}
console.log(`JUnit PCM confirmado: ${results.tests} testes Kotlin executados, sem falhas, erros ou skips.`);
