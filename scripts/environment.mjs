import fs from 'node:fs';
import path from 'node:path';
import { run } from './process.mjs';
export const matrix = JSON.parse(fs.readFileSync(new URL('../config/toolchain.json', import.meta.url), 'utf8'));
export class EnvironmentError extends Error {
  constructor(kind, item, expected, actual, command, correction) {
    super(kind + ': ' + item + '. Esperado: ' + expected + '; observado: ' + actual + '. Comando: ' + command + '. ' + correction + '. Matriz: config/toolchain.json');
    this.kind = kind;
  }
}
export function checkEnvironment({ native = false, runner = run, env = process.env, exists = fs.existsSync, platform = process.platform } = {}) {
  const logs = [];
  const check = (file, args, item) => {
    const r = runner(file, args);
    if (r.status !== 0) throw new EnvironmentError(r.missing ? 'Pré-requisito ausente' : 'Falha de diagnóstico', item, 'comando disponível', r.output, [file, ...args].join(' '), 'Confira instalação, PATH e acesso; execute o diagnóstico novamente');
    logs.push(item + ': ' + r.output.trim());
    return r.output;
  };
  const version = (file, args, item, expected) => {
    const output = check(file, args, item);
    const observed = output.match(/\d+\.\d+\.\d+/)?.[0];
    if (!observed) throw new EnvironmentError('Falha de diagnóstico', item, expected, output, file, 'Confira a saída do executável');
    if (observed !== expected) throw new EnvironmentError('Pré-requisito incompatível', item, expected, observed, file, 'Use a versão fixada no guia de execução');
  };
  version('node', ['--version'], 'Node', matrix.node);
  version(platform === 'win32' ? 'npm.cmd' : 'npm', ['--version'], 'npm', matrix.npm);
  if (!native) return logs;
  if (!env.JAVA_HOME) throw new EnvironmentError('Pré-requisito ausente', 'JAVA_HOME', 'JDK ' + matrix.javaMajor, 'não definido', 'java -version', 'Configure JAVA_HOME e PATH para o JDK da matriz');
  for (const binary of ['java', 'javac']) {
    for (const file of [binary, path.join(env.JAVA_HOME, 'bin', binary + (platform === 'win32' ? '.exe' : ''))]) {
      const output = check(file, ['-version'], 'JDK ' + file);
      if (Number(output.match(/(?:version \"?|javac )(\d+)/)?.[1]) !== matrix.javaMajor) throw new EnvironmentError('Pré-requisito incompatível', 'JDK', matrix.javaMajor, output.trim(), file + ' -version', 'Alinhe JAVA_HOME e PATH');
    }
  }
  const sdk = env.ANDROID_HOME || env.ANDROID_SDK_ROOT;
  if (!sdk || !exists(sdk)) throw new EnvironmentError('Pré-requisito ausente', 'Android SDK', 'ANDROID_HOME válido', sdk || 'não definido', 'sdkmanager --list', 'Instale o SDK e configure ANDROID_HOME');
  if (env.ANDROID_HOME && env.ANDROID_SDK_ROOT && path.resolve(env.ANDROID_HOME) !== path.resolve(env.ANDROID_SDK_ROOT)) throw new EnvironmentError('Pré-requisito incompatível', 'Android SDK', 'mesma raiz', 'raízes divergentes', 'sdkmanager --list', 'Alinhe ANDROID_HOME e ANDROID_SDK_ROOT');
  const manager = path.join(sdk, 'cmdline-tools', matrix.commandLineTools, 'bin', platform === 'win32' ? 'sdkmanager.bat' : 'sdkmanager');
  check(manager, ['--version'], 'Android command-line tools');
  const installed = check(manager, ['--list'], 'Android SDK').split('Available Packages:')[0];
  for (const pkg of ['platform-tools', matrix.platformPackage, 'build-tools;' + matrix.buildTools]) {
    if (!installed.includes(pkg)) throw new EnvironmentError('Pré-requisito ausente', pkg, 'pacote instalado', 'ausente', manager + ' --list', 'Instale o pacote pelo Android SDK Manager');
  }
  check(path.join(sdk, 'platform-tools', platform === 'win32' ? 'adb.exe' : 'adb'), ['version'], 'ADB');
  if (!exists(path.join(sdk, 'licenses', 'android-sdk-license'))) throw new EnvironmentError('Pré-requisito ausente', 'Licenças Android', 'licenças aceitas pelo desenvolvedor', 'não identificadas', 'sdkmanager --licenses', 'Leia e aceite as licenças aplicáveis manualmente');
  return logs;
}
