import test from 'node:test';
import assert from 'node:assert/strict';
import { checkEnvironment, matrix } from '../../scripts/environment.mjs';
const env = { JAVA_HOME: '/jdk', ANDROID_HOME: '/sdk' };
const good = (file, args) => ({ status: 0, output: file.includes('sdkmanager') ? args.includes('--list') ? 'Installed packages:\nplatform-tools\nplatforms;android-' + matrix.compileSdk + '\nbuild-tools;' + matrix.buildTools + '\nAvailable Packages:' : '20.0' : file.includes('adb') ? 'Android Debug Bridge version 1.0.41' : file.includes('javac') ? 'javac 17.0.1' : file.includes('java') ? 'openjdk version "17.0.1"' : file.includes('npm') ? matrix.npm : 'v' + matrix.node });
for (const platform of ['win32', 'linux']) {
  test(platform + ': ambiente válido produz diagnóstico completo', () => assert.ok(checkEnvironment({ native: true, platform, runner: good, env, exists: () => true }).some(l => l.startsWith('ADB:'))));
  test(platform + ': Node ausente é diferente de saída inválida', () => {
    assert.throws(() => checkEnvironment({ platform, runner: () => ({ status: 1, missing: true, output: 'ENOENT' }) }), /Pré-requisito ausente: Node/);
    assert.throws(() => checkEnvironment({ platform, runner: () => ({ status: 0, output: 'inválido' }) }), /Falha de diagnóstico: Node/);
  });
  test(platform + ': versão incompatível, JDK e SDK divergentes falham', () => {
    assert.throws(() => checkEnvironment({ platform, runner: () => ({ status: 0, output: 'v22.0.0' }) }), /Pré-requisito incompatível: Node/);
    assert.throws(() => checkEnvironment({ native: true, platform, env: { ...env, ANDROID_SDK_ROOT: '/outro' }, runner: good, exists: () => true }), /raízes divergentes/);
    assert.throws(() => checkEnvironment({ native: true, platform, env, runner: (file, args) => file.includes('java') ? { status: 0, output: 'java version "25.0.1"' } : good(file, args), exists: () => true }), /Pré-requisito incompatível: JDK/);
  });
  test(platform + ': pacote disponível mas não instalado é rejeitado', () => {
    assert.throws(() => checkEnvironment({ native: true, platform, env, exists: () => true, runner: (file, args) => file.includes('sdkmanager') && args.includes('--list') ? { status: 0, output: 'Installed packages:\nAvailable Packages:\nplatform-tools' } : good(file, args) }), /Pré-requisito ausente: platform-tools/);
  });
  test(platform + ': erro de acesso/rede nunca vira sucesso ou versão incompatível', () => {
    assert.throws(() => checkEnvironment({ platform, runner: () => ({ status: 1, output: 'Acesso negado' }) }), /Falha de diagnóstico/);
  });
}
