import fs from 'node:fs';
import path from 'node:path';
import { checkEnvironment, matrix } from './environment.mjs';
import { run, execute } from './process.mjs';
try {
  console.log(checkEnvironment({ native: true }).join('\n'));
  execute(process.execPath, ['node_modules/expo/bin/cli', 'prebuild', '--platform', 'android', '--no-install'], { env: { ...process.env, CI: '1', EXPO_NO_TELEMETRY: '1' } });
  const gradle = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
  const runtime = run(gradle, ['--version'], { cwd: 'android' });
  if (runtime.status !== 0) throw new Error('Falha de diagnóstico Gradle: ' + runtime.output);
  console.log(runtime.output);
  if (Number(runtime.output.match(/(?:Launcher JVM:|JVM:)\s*(\d+)/)?.[1]) !== matrix.javaMajor) throw new Error('Pré-requisito incompatível: JVM efetiva do Gradle. Alinhe JAVA_HOME, Gradle JDK e config/toolchain.json.');
  // The generated release variant uses a debug signing key for internal validation only.
  execute(gradle, ['assembleRelease', '--no-daemon', '-PreactNativeArchitectures=x86_64,arm64-v8a'], { cwd: 'android' });
  fs.mkdirSync('artifacts', { recursive: true });
  fs.copyFileSync(path.join('android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk'), 'artifacts/riffando-validation.apk');
  console.log('APK interno gerado: artifacts/riffando-validation.apk. Não publicar na loja.');
} catch (error) { console.error('Build Android interrompido: ' + error.message); process.exitCode = 1; }
