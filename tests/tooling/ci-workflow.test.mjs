import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const workflow = read('../../.github/workflows/ci.yml');
const [header, jobsSection] = workflow.split('\njobs:\n');
const jobs = Object.fromEntries(
  jobsSection
    .split(/\n(?=  [a-z][\w-]*:\n)/)
    .map(block => [block.match(/^\s*([a-z][\w-]*):/)[1], block]),
);
const pinnedNpm = JSON.parse(read('../../package.json')).packageManager.replace('npm@', '');

test('workflow mantém permissões mínimas e telemetria/ruído de npm desativados', () => {
  assert.match(header, /^permissions:\n {2}contents: read$/m);
  assert.doesNotMatch(workflow, /:\s*write\b/);
  for (const variable of ['NPM_CONFIG_AUDIT', 'NPM_CONFIG_FUND']) {
    assert.match(header, new RegExp(`^ {2}${variable}: 'false'$`, 'm'));
  }
});

test('todo job obrigatório preserva a condição de não executar em PR Draft', () => {
  for (const [name, block] of Object.entries(jobs)) {
    assert.match(block, /github\.event\.pull_request\.draft == false/, name);
  }
  assert.match(jobs.gate, /if: always\(\) && /);
});

test('jobs que instalam dependências fixam o npm do packageManager', () => {
  for (const [name, block] of Object.entries(jobs)) {
    if (!block.includes('npm ci')) continue;
    assert.ok(block.includes(`npm install --global npm@${pinnedNpm}`), name);
  }
});

test('cache de build Gradle só é habilitado em CI e a prova negativa não o usa', () => {
  const build = read('../../scripts/build-android.mjs');
  const probe = read('../../scripts/probe-android-compilation.mjs');
  assert.match(build, /process\.env\.CI \? \['--build-cache'\] : \[\]/);
  assert.doesNotMatch(probe, /--build-cache/);
  assert.match(probe, /compileReleaseKotlin/);
});

test('jobs Windows e Linux continuam compilando o APK nativo', () => {
  assert.match(jobs.windows, /npm run build:android/);
  assert.match(jobs.android, /npm run build:android/);
  assert.match(jobs.android, /node scripts\/probe-android-compilation\.mjs/);
  assert.match(jobs.emulator, /scripts\/smoke-android\.mjs/);
});
