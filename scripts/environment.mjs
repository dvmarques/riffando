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
export function readCanonicalProperty(properties, key) {
  let value;
  for (const line of properties.split(/\r?\n/)) {
    if (/^\s*(?:[#!]|$)/.test(line)) continue;
    const continuation = line.match(/\\+$/)?.[0].length || 0;
    const entry = line.match(/^\s*([^:=\s]+)\s*[=:]\s*(.*)$/);
    if (continuation % 2 || !entry || entry[1].includes('\\')) throw new EnvironmentError('Falha de diagnóstico', 'local.properties', 'chaves sem escapes, entradas chave=valor em uma linha', line, 'android/local.properties', 'Regere local.properties com sintaxe canônica, sem continuação ou chave escapada');
    if (entry[1] !== key) continue;
    if (value !== undefined) throw new EnvironmentError('Falha de diagnóstico', key + ' duplicado', 'uma definição', 'múltiplas definições', 'android/local.properties', 'Mantenha somente o SDK efetivo');
    value = entry[2].replace(/\\(.)/g, (_, escaped) => {
      if (!['\\', ':', '=', ' '].includes(escaped)) throw new EnvironmentError('Falha de diagnóstico', 'escape sdk.dir', 'caminho canônico', escaped, 'android/local.properties', 'Regere o caminho com escapes padrão');
      return escaped;
    });
    if (!value) throw new EnvironmentError('Pré-requisito incompatível', 'sdk.dir', 'caminho do SDK', 'vazio', 'android/local.properties', 'Configure a raiz do SDK');
  }
  return value;
}

export const readSdkProperty = properties => readCanonicalProperty(properties, 'sdk.dir');

export function checkSdkConfiguration({ env = process.env, exists = fs.existsSync, read = fs.readFileSync, platform = process.platform } = {}) {
  const sdk = env.ANDROID_HOME || env.ANDROID_SDK_ROOT;
  const normalize = value => { const resolved = path.resolve(value).replaceAll('\\', '/').replace(/\/$/, ''); return platform === 'win32' ? resolved.toLowerCase() : resolved; };
  if (!sdk || !exists(sdk)) throw new EnvironmentError('Pré-requisito ausente', 'Android SDK', 'ANDROID_HOME válido', sdk || 'não definido', 'android sdk list', 'Configure a raiz do SDK');
  if (env.ANDROID_HOME && env.ANDROID_SDK_ROOT && normalize(env.ANDROID_HOME) !== normalize(env.ANDROID_SDK_ROOT)) throw new EnvironmentError('Pré-requisito incompatível', 'Android SDK', 'mesma raiz', 'raízes divergentes', 'android sdk list', 'Alinhe ANDROID_HOME e ANDROID_SDK_ROOT');
  const local = path.resolve('android/local.properties');
  if (exists(local)) {
    let properties;
    try { properties = read(local, 'utf8'); } catch (error) { throw new EnvironmentError('Falha de diagnóstico', 'local.properties', 'arquivo legível', error.message, local, 'Confira acesso ao arquivo'); }
    const configured = readSdkProperty(properties);
    if (configured && normalize(configured) !== normalize(sdk)) throw new EnvironmentError('Pré-requisito incompatível', 'SDK efetivo Gradle', sdk, configured, local, 'Alinhe sdk.dir e ANDROID_HOME');
  }
  return sdk;
}

export function checkGradleJvm(output, { env = process.env, runner = run, exists = fs.existsSync, read = fs.readFileSync } = {}) {
  const launcher = Number(output.match(/(?:Launcher JVM:|JVM:)\s*(\d+)/)?.[1]);
  if (launcher !== matrix.javaMajor) throw new EnvironmentError('Pré-requisito incompatível', 'JVM launcher Gradle', matrix.javaMajor, launcher || output.slice(0,200), 'gradlew --version', 'Alinhe JAVA_HOME e Gradle JDK');
  const criteria = path.resolve('android/gradle/gradle-daemon-jvm.properties');
  if (exists(criteria)) {
    const version = readCanonicalProperty(read(criteria, 'utf8'), 'toolchainVersion');
    if (Number(version) !== matrix.javaMajor) throw new EnvironmentError('Pré-requisito incompatível', 'Critério JVM daemon Gradle', matrix.javaMajor, version || 'desconhecido', criteria, 'Alinhe os critérios do daemon à matriz');
  }
  const daemon = output.match(/^Daemon JVM:\s*(.+)$/m)?.[1]?.trim();
  if (!daemon) throw new EnvironmentError('Falha de diagnóstico', 'JVM daemon Gradle', 'Daemon JVM identificada', 'ausente', 'gradlew --version', 'Confira a saída da versão de Gradle fixada');
  if (/^\d/.test(daemon)) {
    if (Number(daemon.match(/^\d+/)?.[0]) !== matrix.javaMajor) throw new EnvironmentError('Pré-requisito incompatível', 'JVM daemon Gradle', matrix.javaMajor, daemon, 'gradlew --version', 'Alinhe o daemon à matriz');
    return;
  }
  const home = daemon.replace(/\s+\(.*$/, '');
  if (!path.isAbsolute(home)) throw new EnvironmentError('Falha de diagnóstico', 'JVM daemon Gradle', 'caminho verificável', daemon, 'gradlew --version', 'Confira critérios e org.gradle.java.home');
  const result = runner(path.join(home, 'bin', process.platform === 'win32' ? 'java.exe' : 'java'), ['-version']);
  const major = Number(result.output?.match(/version \"?(\d+)/)?.[1]);
  if (result.status !== 0 || major !== matrix.javaMajor) throw new EnvironmentError(result.status !== 0 ? 'Falha de diagnóstico' : 'Pré-requisito incompatível', 'JVM daemon Gradle', matrix.javaMajor, result.output, home, 'Alinhe o JDK efetivo do daemon');
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
  const sdk = checkSdkConfiguration({ env, exists, read, platform });
  const toolsRoot = env.ANDROID_CMDLINE_TOOLS_ROOT || path.join(sdk, 'cmdline-tools', matrix.commandLineToolsDirectory);
  const propertiesPath = path.join(toolsRoot, 'source.properties');
  if (!exists(propertiesPath)) throw new EnvironmentError('Pré-requisito ausente', 'Android command-line tools', matrix.commandLineTools, toolsRoot, 'android --version', 'Configure ANDROID_CMDLINE_TOOLS_ROOT para a revisão da matriz');
  const revision = read(propertiesPath, 'utf8').match(/Pkg.Revision\s*=\s*([^\r\n]+)/)?.[1]?.trim();
  if (revision !== matrix.commandLineTools) throw new EnvironmentError('Pré-requisito incompatível', 'Android command-line tools', matrix.commandLineTools, revision || 'desconhecida', propertiesPath, 'Instale a revisão fixada');
  const modern = path.join(toolsRoot, 'bin', platform === 'win32' ? 'android.exe' : 'android');
  const manager = exists(modern) ? modern : path.join(toolsRoot, 'bin', platform === 'win32' ? 'sdkmanager.bat' : 'sdkmanager');
  const modernCli = manager === modern;
  check(manager, [modernCli ? '-V' : '--version'], 'Android command-line tools');
  const listArgs = modernCli ? ['--sdk=' + sdk, 'sdk', 'list'] : ['--sdk_root=' + sdk, '--list'];
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
