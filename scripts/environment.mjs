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
export function checkEnvironment({ native = false, runner = run, env = process.env, exists = fs.existsSync, read = fs.readFileSync, platform = process.platform } = {}) {
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
  const toolsRoot = env.ANDROID_CMDLINE_TOOLS_ROOT || path.join(sdk, 'cmdline-tools', matrix.commandLineToolsDirectory);
  const propertiesPath = path.join(toolsRoot, 'source.properties');
  if (!exists(propertiesPath)) throw new EnvironmentError('Pré-requisito ausente', 'Android command-line tools', matrix.commandLineTools, toolsRoot, 'android --version', 'Configure ANDROID_CMDLINE_TOOLS_ROOT para a revisão da matriz');
  const revision = read(propertiesPath, 'utf8').match(/Pkg.Revision\s*=\s*([^\r\n]+)/)?.[1]?.trim();
  if (revision !== matrix.commandLineTools) throw new EnvironmentError('Pré-requisito incompatível', 'Android command-line tools', matrix.commandLineTools, revision || 'desconhecida', propertiesPath, 'Instale a revisão fixada');
  const modern = path.join(toolsRoot, 'bin', platform === 'win32' ? 'android.exe' : 'android');
  const manager = exists(modern) ? modern : path.join(toolsRoot, 'bin', platform === 'win32' ? 'sdkmanager.bat' : 'sdkmanager');
  const modernCli = manager === modern;
  check(manager, [modernCli ? '-V' : '--version'], 'Android command-line tools');
  const listArgs = modernCli ? ['sdk', 'list'] : ['--list'];
  const installed = check(manager, listArgs, 'Android SDK').split(/Available packages:/i)[0];
  if (!/Installed packages:/i.test(installed)) throw new EnvironmentError('Falha de diagnóstico', 'Android SDK', 'seção Installed packages', installed.slice(0,200), manager + ' sdk list', 'Confira a saída das ferramentas da matriz');
  for (const pkg of ['platform-tools', matrix.platformPackage, 'build-tools;' + matrix.buildTools, 'ndk;' + matrix.ndk]) {
    const paths = installed.split('\n').map(line => line.trim().split(/\s+/)[0]);
    if (!paths.includes(pkg) && !paths.includes(pkg.replaceAll(';', '/'))) throw new EnvironmentError('Pré-requisito ausente', pkg, 'pacote instalado', 'ausente', manager + ' sdk list', 'Instale o pacote pelo Android SDK Manager');
  }
  check(path.join(sdk, 'platform-tools', platform === 'win32' ? 'adb.exe' : 'adb'), ['version'], 'ADB');
  if (!exists(path.join(sdk, 'licenses', 'android-sdk-license'))) throw new EnvironmentError('Pré-requisito ausente', 'Licenças Android', 'licenças aceitas pelo desenvolvedor', 'não identificadas', 'sdkmanager --licenses', 'Leia e aceite as licenças aplicáveis manualmente');
  return logs;
}
