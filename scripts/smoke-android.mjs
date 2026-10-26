import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
const pkg = 'br.com.riffando.app';
fs.mkdirSync('artifacts/smoke', { recursive: true });
function adb(...args) {
  const r = spawnSync('adb', args, { encoding: 'utf8', timeout: 30_000 });
  if (r.status !== 0 || r.error) throw new Error('ADB: ' + (r.stderr || r.error?.message));
  return r.stdout;
}
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function tree(label) {
  adb('shell', 'uiautomator', 'dump', '/sdcard/window.xml');
  const xml = adb('shell', 'cat', '/sdcard/window.xml');
  fs.writeFileSync('artifacts/smoke/' + label + '.xml', xml);
  const r = spawnSync('adb', ['exec-out', 'screencap', '-p'], { timeout: 30_000 });
  if (r.status !== 0) throw new Error('Falha de screenshot');
  fs.writeFileSync('artifacts/smoke/' + label + '.png', r.stdout);
  return xml;
}
async function waitText(text, label) {
  for (let i = 0; i < 10; i++) {
    const xml = await tree(label);
    if (xml.includes(text)) return xml;
    await delay(1000);
  }
  throw new Error('Texto ausente no APK offline: ' + text);
}
async function tap(text) {
  for (let i = 0; i < 5; i++) {
    const xml = await tree('action');
    const node = xml.match(/<node[^>]*>/g)?.find(n => n.includes('content-desc="' + text + '"') || n.includes('text="' + text + '"'));
    const bounds = node?.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);
    if (bounds && Number(bounds[4]) > Number(bounds[2])) {
      adb('shell', 'input', 'tap', String((Number(bounds[1]) + Number(bounds[3])) / 2), String((Number(bounds[2]) + Number(bounds[4])) / 2));
      await delay(500);
      return;
    }
    adb('shell', 'input', 'swipe', '400', '1600', '400', '400', '400');
    await delay(500);
  }
  throw new Error('Ação inacessível: ' + text);
}
const evidence = { sha: process.env.GITHUB_SHA || 'local', package: pkg, android: adb('shell', 'getprop', 'ro.build.version.release').trim(), api: adb('shell', 'getprop', 'ro.build.version.sdk').trim(), model: adb('shell', 'getprop', 'ro.product.model').trim(), checks: [], talkBack: 'Pendente: avaliação manual; smoke automatizado não comprova leitura/foco.' };
try {
  adb('install', '-r', 'artifacts/riffando-validation.apk');
  const permissions = adb('shell', 'dumpsys', 'package', pkg);
  if (permissions.includes('android.permission.RECORD_AUDIO')) throw new Error('Permissão de áudio inesperada no APK');
  adb('shell', 'cmd', 'connectivity', 'airplane-mode', 'enable');
  adb('shell', 'svc', 'wifi', 'disable');
  adb('shell', 'svc', 'data', 'disable');
  if (adb('shell', 'settings', 'get', 'global', 'airplane_mode_on').trim() !== '1') throw new Error('Modo avião não confirmado');
  for (const scale of ['1.0', '2.0']) {
    adb('shell', 'settings', 'put', 'system', 'font_scale', scale);
    adb('shell', 'am', 'force-stop', pkg);
    adb('shell', 'monkey', '-p', pkg, '-c', 'android.intent.category.LAUNCHER', '1');
    await waitText('Riffando', 'inicio-' + scale);
    await tap('Conhecer a fundação');
    await waitText('Sobre esta versão', 'informacoes-' + scale);
    adb('shell', 'input', 'keyevent', '4');
    await waitText('Riffando', 'voltar-android-' + scale);
    await tap('Conhecer a fundação');
    await tap('Voltar ao início');
    await waitText('Riffando', 'voltar-acao-' + scale);
    evidence.checks.push('Inicialização fria offline, navegação/voltar Android/ação e reabertura com fonte ' + scale);
  }
  evidence.passed = true;
} catch (error) { evidence.passed = false; evidence.error = error.message; process.exitCode = 1; }
finally {
  fs.writeFileSync('artifacts/smoke/evidence.json', JSON.stringify(evidence, null, 2));
  fs.writeFileSync('artifacts/smoke/logcat.txt', adb('logcat', '-d', '-t', '500'));
  adb('shell', 'settings', 'put', 'system', 'font_scale', '1.0');
  adb('shell', 'cmd', 'connectivity', 'airplane-mode', 'disable');
}
console.log(JSON.stringify(evidence, null, 2));
