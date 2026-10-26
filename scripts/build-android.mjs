import fs from 'node:fs';
import path from 'node:path';
import { checkEnvironment, matrix } from './environment.mjs';
import { run, execute } from './process.mjs';
let stage = 'pré-requisitos';
try {
  console.log(checkEnvironment({ native: true }).join('\n'));
  stage = 'prebuild';
  execute(process.execPath, ['node_modules/expo/bin/cli', 'prebuild', '--platform', 'android', '--no-install'], { env: { ...process.env, CI: '1', EXPO_NO_TELEMETRY: '1' } });
  stage = 'diagnóstico Gradle';
  const gradle = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
  const runtime = run(gradle, ['--version'], { cwd: 'android' });
  if (runtime.status !== 0) throw new Error('Falha de diagnóstico Gradle: ' + runtime.output);
  console.log(runtime.output);
  if (Number(runtime.output.match(/(?:Launcher JVM:|JVM:)\s*(\d+)/)?.[1]) !== matrix.javaMajor) throw new Error('Pré-requisito incompatível: JVM efetiva do Gradle. Alinhe JAVA_HOME, Gradle JDK e config/toolchain.json.');
  // The generated release variant uses a debug signing key for internal validation only.
  stage = 'Gradle assembleRelease';
  execute(gradle, ['assembleRelease', '--no-daemon', '-PreactNativeArchitectures=x86_64,arm64-v8a'], { cwd: 'android' });
  fs.mkdirSync('artifacts', { recursive: true });
  fs.copyFileSync(path.join('android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk'), 'artifacts/riffando-validation.apk');
  console.log('APK interno gerado: artifacts/riffando-validation.apk. Não publicar na loja.');
} catch (error) { console.error((stage === 'pré-requisitos' || stage === 'diagnóstico Gradle' ? 'Build Android interrompido' : 'Falha de compilação (' + stage + ')') + ': ' + error.message); process.exitCode = 1; }
