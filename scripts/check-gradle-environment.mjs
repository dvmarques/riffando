import { checkEnvironment, checkSdkConfiguration, checkGradleJvm } from './environment.mjs';
import { run } from './process.mjs';
try {
  console.log(checkEnvironment({ native: true }).join('\n'));
  checkSdkConfiguration();
  const result = run(process.platform === 'win32' ? 'gradlew.bat' : './gradlew', ['--version'], { cwd: 'android' });
  if (result.status !== 0) throw new Error('Falha de diagnóstico Gradle: ' + result.output);
  checkGradleJvm(result.output);
  console.log(result.output);
} catch (error) { console.error(error.message); process.exitCode = 1; }
