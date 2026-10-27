import test from 'node:test';
import assert from 'node:assert/strict';
import { checkEnvironment, matrix, checkSdkConfiguration, checkGradleJvm, readSdkProperty } from '../../scripts/environment.mjs';
const env = { JAVA_HOME: '/jdk', ANDROID_HOME: '/sdk' };
const good = (file, args) => ({ status: 0, output: file === 'reg.exe' ? 'LongPathsEnabled    REG_DWORD    0x1' : file.endsWith('cmake.exe') ? 'cmake version ' + matrix.windowsCmake : file.endsWith('ninja.exe') ? matrix.windowsNinja : file.includes('cmdline-tools') ? (args.includes('--list') || args.includes('list')) ? 'Installed packages:\nplatform-tools\n' + matrix.platformPackage + '\nbuild-tools;' + matrix.buildTools + '\nndk;' + matrix.ndk + '\nAvailable Packages:' : '20.0' : file.includes('adb') ? 'Android Debug Bridge version 1.0.41' : file.includes('javac') ? 'javac 17.0.1' : file.includes('java') ? 'openjdk version "17.0.1"' : file.includes('npm') ? matrix.npm : 'v' + matrix.node });
for (const platform of ['win32', 'linux']) {
  test(platform + ': ambiente válido produz diagnóstico completo', () => assert.ok(checkEnvironment({ native: true, platform, runner: good, env, exists: () => true, read: p => p.endsWith('source.properties') ? 'Pkg.Revision = 23.0' : 'sdk.dir=/sdk' }).some(l => l.startsWith('ADB:'))));
  test(platform + ': Node ausente é diferente de saída inválida', () => {
    assert.throws(() => checkEnvironment({ platform, runner: () => ({ status: 1, missing: true, output: 'ENOENT' }) }), /Pré-requisito ausente: Node/);
    assert.throws(() => checkEnvironment({ platform, runner: () => ({ status: 0, output: 'inválido' }) }), /Falha de diagnóstico: Node/);
  });
  test(platform + ': versão incompatível, JDK e SDK divergentes falham', () => {
    assert.throws(() => checkEnvironment({ platform, runner: () => ({ status: 0, output: 'v22.0.0' }) }), /Pré-requisito incompatível: Node/);
    assert.throws(() => checkEnvironment({ native: true, platform, env: { ...env, ANDROID_SDK_ROOT: '/outro' }, runner: good, exists: () => true, read: p => p.endsWith('source.properties') ? 'Pkg.Revision = 23.0' : 'sdk.dir=/sdk' }), /raízes divergentes/);
    assert.throws(() => checkEnvironment({ native: true, platform, env, runner: (file, args) => file.includes('java') ? { status: 0, output: 'java version "25.0.1"' } : good(file, args), exists: () => true, read: p => p.endsWith('source.properties') ? 'Pkg.Revision = 23.0' : 'sdk.dir=/sdk' }), /Pré-requisito incompatível: JDK/);
  });
  test(platform + ': pacote disponível mas não instalado é rejeitado', () => {
    assert.throws(() => checkEnvironment({ native: true, platform, env, exists: () => true, read: p => p.endsWith('source.properties') ? 'Pkg.Revision = 23.0' : 'sdk.dir=/sdk', runner: (file, args) => file.includes('cmdline-tools') && (args.includes('--list') || args.includes('list')) ? { status: 0, output: 'Installed packages:\nAvailable Packages:\nplatform-tools' } : good(file, args) }), /Pré-requisito ausente: platform-tools/);
  });
  test(platform + ': erro de acesso/rede nunca vira sucesso ou versão incompatível', () => {
    assert.throws(() => checkEnvironment({ platform, runner: () => ({ status: 1, output: 'Acesso negado' }) }), /Falha de diagnóstico/);
  });
}

test('SDK efetivo Gradle divergente é rejeitado antes de compilar', () => {
  assert.throws(() => checkSdkConfiguration({ env, exists: () => true, read: () => 'sdk.dir=/outro' }), /SDK efetivo Gradle/);
});
test('SDK CLI recebe raiz explícita, mesmo com ferramentas em outro local', () => {
  const commands=[];
  checkEnvironment({ native: true, env: { ...env, ANDROID_CMDLINE_TOOLS_ROOT: '/tools' }, platform: 'linux', exists: () => true, read: p => p.endsWith('source.properties') ? 'Pkg.Revision = 23.0' : 'sdk.dir=/sdk', runner: (file,args) => {commands.push(args); return file.replaceAll('\\', '/').includes('/tools/') ? args.includes('list') ? good('/cmdline-tools/android',args) : {status:0,output:'23.0'} : good(file,args);} });
  assert.ok(commands.some(args=>args.includes('--sdk=/sdk')));
});
test('launcher 17 não pode mascarar daemon 25 ou critério divergente', () => {
  assert.throws(() => checkGradleJvm('Launcher JVM: 17.0.1\nDaemon JVM: 25.0.1', {exists:()=>false}), /JVM daemon Gradle/);
  assert.throws(() => checkGradleJvm('Launcher JVM: 17.0.1\nDaemon JVM: 17.0.1', {exists:()=>true,read:()=> 'toolchainVersion=25'}), /Critério JVM daemon/);
  assert.doesNotThrow(() => checkGradleJvm('Launcher JVM: 17.0.1\nDaemon JVM: 17.0.1', {exists:()=>false}));
});

test('local.properties não ignora espaços nem permite duplicidade de SDK', () => {
  assert.equal(readSdkProperty('  sdk.dir=/outro'), '/outro');
  assert.throws(() => readSdkProperty('sdk.dir=/sdk\nsdk.dir=/outro'), /duplicado/);
  assert.throws(() => checkSdkConfiguration({env,exists:()=>true,read:()=> '  sdk.dir=/outro'}), /SDK efetivo Gradle/);
  assert.throws(() => readSdkProperty('sdk\\.dir=/outro'), /chave escapada/);
});

test('Windows rejeita Ninja antigo e caminhos longos desativados antes do build', () => {
  const options = {native:true,platform:'win32',env,exists:()=>true,read:p=>p.endsWith('source.properties') ? 'Pkg.Revision = 23.0' : 'sdk.dir=/sdk'};
  assert.throws(()=>checkEnvironment({...options,runner:(file,args)=>file.endsWith('ninja.exe') ? {status:0,output:'1.10.2'} : good(file,args)}), /Pré-requisito incompatível: Ninja Windows/);
  assert.throws(()=>checkEnvironment({...options,runner:(file,args)=>file==='reg.exe' ? {status:0,output:'LongPathsEnabled REG_DWORD 0x0'} : good(file,args)}), /Pré-requisito incompatível: Caminhos longos Windows/);
});

test('Windows consulta a chave de registro exata sem duplicar separadores', () => {
  let key;
  checkEnvironment({native:true,platform:'win32',env,exists:()=>true,read:p=>p.endsWith('source.properties') ? 'Pkg.Revision = 23.0' : 'sdk.dir=/sdk',runner:(file,args)=>{if(file==='reg.exe') key=args[1]; return good(file,args);}});
  assert.equal(key, String.raw`HKLM\SYSTEM\CurrentControlSet\Control\FileSystem`);
});
