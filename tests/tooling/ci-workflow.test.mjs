import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8').replace(/\r\n/g, '\n');
// Parse real do YAML: comentários não contam como configuração.
const workflow = parse(read('../../.github/workflows/ci.yml'));
const jobs = workflow.jobs;
const pinnedNpm = JSON.parse(read('../../package.json')).packageManager.replace('npm@', '');
const stripJsComments = source => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\s\/\/.*$/gm, '');
const runs = job => (job.steps ?? []).map(step => step.run).filter(Boolean);
const normalize = condition => String(condition).replace(/\s+/g, ' ').trim();

const notDraft = "github.event_name != 'pull_request' || github.event.pull_request.draft == false";
const expectedNames = {
  documentation: 'Documentação e OpenSpec (${{ matrix.os }})',
  javascript: 'Qualidade e exportação Android',
  windows: 'Instalação e scripts Windows',
  android: 'APK Android nativo',
  emulator: 'Smoke Android offline',
  gate: 'Fundação — gate agregado',
};

const collectPermissions = node => {
  const found = [];
  if (node && typeof node === 'object') {
    if ('permissions' in node) found.push(node.permissions);
    for (const value of Object.values(node)) found.push(...collectPermissions(value));
  }
  return found;
};

test('workflow mantém permissões mínimas e telemetria/ruído de npm desativados', () => {
  assert.deepEqual(workflow.permissions, { contents: 'read' });
  for (const permissions of collectPermissions(workflow)) {
    assert.deepEqual(permissions, { contents: 'read' });
  }
  for (const variable of ['NPM_CONFIG_AUDIT', 'NPM_CONFIG_FUND']) {
    assert.equal(workflow.env[variable], 'false', variable);
  }
});

test('todo job obrigatório tem exatamente a condição de não executar em PR Draft', () => {
  assert.deepEqual(Object.keys(jobs).sort(), Object.keys(expectedNames).sort());
  for (const [name, job] of Object.entries(jobs)) {
    const expected = name === 'gate' ? `always() && (${notDraft})` : notDraft;
    assert.equal(normalize(job.if), expected, name);
  }
});

test('disparos do workflow preservam ready_for_review, push na main e execução manual', () => {
  const triggers = workflow.on;
  assert.deepEqual(Object.keys(triggers).sort(), ['pull_request', 'push', 'workflow_dispatch']);
  assert.deepEqual(triggers.push.branches, ['main']);
  assert.deepEqual(triggers.pull_request.branches, ['main']);
  assert.deepEqual(triggers.pull_request.types, ['opened', 'synchronize', 'reopened', 'ready_for_review']);
});

test('nomes dos checks e dependências do gate não mudam', () => {
  for (const [name, expected] of Object.entries(expectedNames)) {
    assert.equal(jobs[name].name, expected, name);
  }
  assert.deepEqual(jobs.documentation.strategy.matrix.os, ['ubuntu-latest', 'windows-latest']);
  assert.deepEqual([...jobs.gate.needs].sort(), ['android', 'documentation', 'emulator', 'javascript', 'windows']);
  assert.equal(jobs.emulator.needs, 'android');
});

test('jobs que instalam dependências fixam o npm do packageManager', () => {
  for (const [name, job] of Object.entries(jobs)) {
    if (!runs(job).some(command => command.includes('npm ci'))) continue;
    assert.ok(runs(job).includes(`npm install --global npm@${pinnedNpm}`), name);
  }
});

test('cache de build Gradle só é habilitado em CI e a prova negativa não o usa', () => {
  const build = stripJsComments(read('../../scripts/build-android.mjs'));
  const probe = stripJsComments(read('../../scripts/probe-android-compilation.mjs'));
  assert.match(build, /\.\.\.\(process\.env\.CI === 'true' \? \['--build-cache'\] : \[\]\)/);
  assert.equal(build.match(/build-cache/g).length, 1);
  assert.doesNotMatch(probe, /build-cache|gradle\.caching/i);
  assert.match(probe, /compileReleaseKotlin/);
});

test('jobs Windows e Linux continuam compilando o APK nativo', () => {
  assert.ok(runs(jobs.windows).includes('npm run build:android'));
  assert.ok(runs(jobs.android).includes('npm run build:android'));
  assert.ok(runs(jobs.android).some(command => command.includes(':riffando-audio:testDebugUnitTest') && command.includes('node ../scripts/verify-pcm-junit.mjs')));
  assert.ok(runs(jobs.android).includes('node scripts/probe-android-compilation.mjs'));
  assert.ok(jobs.emulator.steps.some(step => step.with?.script === 'node scripts/smoke-android.mjs'));
});
// Majors cujo action.yml declara `using: node20` (verificado em 28/10/2026).
// Isto é o runtime interno das actions, independente do Node instalado por setup-node.
const node20Actions = {
  'android-actions/setup-android': ['v3'],
  'actions/upload-artifact': ['v4'],
  'actions/download-artifact': ['v4'],
};

test('nenhuma action usa major com runtime interno Node.js 20 e o Node do projeto é preservado', () => {
  for (const [name, job] of Object.entries(jobs)) {
    for (const step of job.steps ?? []) {
      if (!step.uses) continue;
      const [action, ref] = step.uses.split('@');
      assert.ok(!node20Actions[action]?.includes(ref), `${name}: ${step.uses}`);
      if (action === 'actions/setup-node') assert.equal(step.with['node-version'], '24.21.0', name);
    }
  }
});
