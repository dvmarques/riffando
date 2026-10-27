import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { run, execute } from './process.mjs';
const source = path.resolve('android/app/src/main/java/br/com/riffando/app/MainActivity.kt');
const original = fs.readFileSync(source);
const gradle = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
fs.mkdirSync('artifacts', { recursive: true });
try {
  fs.appendFileSync(source, '\nRIFFANDO_COMPILE_PROBE_INVALID\n');
  const result = run(gradle, [':app:compileReleaseKotlin', '--no-daemon'], { cwd: 'android', timeout: 600_000 });
  fs.writeFileSync('artifacts/compilation-probe.log', result.output);
  assert.notEqual(result.status, 0, 'Compilador aceitou código inválido');
  assert.match(result.output, /MainActivity\.kt/, 'Falha não localizada no arquivo da prova');
  assert.match(result.output, /Expecting|Syntax error|Unresolved reference/i, 'Falha não comprovada como erro de compilação Kotlin');
  console.log('Prova negativa: compilador rejeitou MainActivity.kt inválido.');
} finally {
  fs.writeFileSync(source, original);
}
assert.deepEqual(fs.readFileSync(source), original, 'Arquivo não restaurado');
execute(gradle, ['assembleRelease', '--no-daemon', '-PreactNativeArchitectures=x86_64,arm64-v8a'], { cwd: 'android' });
fs.copyFileSync('android/app/build/outputs/apk/release/app-release.apk', 'artifacts/riffando-validation.apk');
console.log('Fonte restaurada e APK válido recompilado.');
