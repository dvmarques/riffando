import assert from 'node:assert/strict';
import test from 'node:test';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, renameSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { classifyEvent, isDocumentationOnly, parseGitDiff } from '../../scripts/ci-scope.mjs';

const event = { pull_request: { base: { sha: 'a'.repeat(40) }, head: { sha: 'b'.repeat(40) } } };
test('reduz apenas caminhos documentais e de agentes explicitamente permitidos', () => {
  assert.equal(isDocumentationOnly(['README.md', 'docs/guia.md', '.codex/agents/reviewer.toml', 'openspec/changes/x/.openspec.yaml']), true);
  for (const path of ['app/index.tsx', 'package.json', 'package-lock.json', '.github/workflows/ci.yml', 'scripts/ci-gate.mjs', 'docs/tool.js', 'novo.arquivo']) {
    assert.equal(isDocumentationOnly(['README.md', path]), false, path);
  }
  assert.equal(isDocumentationOnly([]), false);
});
test('PR usa base e head e falha sem SHA ou quando o diff falha', () => {
  assert.equal(classifyEvent('pull_request', event, (base, head) => { assert.equal(base, event.pull_request.base.sha); assert.equal(head, event.pull_request.head.sha); return ['README.md']; }), 'docs');
  assert.equal(classifyEvent('pull_request', event, () => ['app/index.tsx']), 'full');
  assert.throws(() => classifyEvent('pull_request', {}, () => []), /SHA/);
  assert.throws(() => classifyEvent('pull_request', event, () => { throw new Error('git falhou'); }), /git falhou/);
});
test('main e execução manual exigem matriz completa', () => {
  for (const name of ['push', 'workflow_dispatch']) assert.equal(classifyEvent(name, {}, () => { throw Error('diff indevido'); }), 'full');
});

test('CLI usa Git real e considera renome de código para documentação', () => {
  const dir = mkdtempSync(join(tmpdir(), 'riffando-scope-'));
  const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim();
  try {
    git('init'); git('config', 'user.name', 'Teste'); git('config', 'user.email', 'teste@example.invalid'); git('config', 'commit.gpgsign', 'false');
    writeFileSync(join(dir, 'app.js'), 'x'); git('add', '.'); git('commit', '-m', 'base');
    const base = git('rev-parse', 'HEAD');
    renameSync(join(dir, 'app.js'), join(dir, 'README.md')); git('add', '-A'); git('commit', '-m', 'renome');
    const head = git('rev-parse', 'HEAD');
    const eventPath = join(dir, 'event.json'); const output = join(dir, 'output');
    writeFileSync(eventPath, JSON.stringify({ pull_request: { base: { sha: base }, head: { sha: head } } }));
    const cli = fileURLToPath(new URL('../../scripts/ci-scope.mjs', import.meta.url));
    const result = spawnSync(process.execPath, [cli], { cwd: dir, env: { ...process.env, GITHUB_EVENT_NAME: 'pull_request', GITHUB_EVENT_PATH: eventPath, GITHUB_OUTPUT: output }, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Escopo CI: full/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('diff bruto rejeita modos de symlink e registros truncados', () => {
  const link = ':000000 120000 0000000 abcdef0 A\0docs/link.md\0';
  assert.equal(isDocumentationOnly(parseGitDiff(link)), false);
  assert.throws(() => parseGitDiff(':000000 100644 0000000 abcdef0 A\0README.md'), /truncado/);
});
test('diff Git real usa merge-base e reconhece documentação com espaços', () => {
  const dir = mkdtempSync(join(tmpdir(), 'riffando-scope-base-'));
  const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim();
  try {
    git('init'); git('config', 'user.name', 'Teste'); git('config', 'user.email', 'teste@example.invalid'); git('config', 'commit.gpgsign', 'false');
    writeFileSync(join(dir, 'README.md'), 'base'); git('add', '.'); git('commit', '-m', 'base');
    git('branch', 'docs'); writeFileSync(join(dir, 'app.js'), 'novo'); git('add', '.'); git('commit', '-m', 'app');
    const base = git('rev-parse', 'HEAD'); git('checkout', 'docs');
    writeFileSync(join(dir, 'guia com espaço.md'), 'texto'); git('add', '.'); git('commit', '-m', 'docs');
    const head = git('rev-parse', 'HEAD'); const eventPath = join(dir, 'event.json'); const output = join(dir, 'output');
    writeFileSync(eventPath, JSON.stringify({ pull_request: { base: { sha: base }, head: { sha: head } } }));
    const cli = fileURLToPath(new URL('../../scripts/ci-scope.mjs', import.meta.url));
    const run = env => spawnSync(process.execPath, [cli], { cwd: dir, env, encoding: 'utf8' });
    const env = { ...process.env, GITHUB_EVENT_NAME: 'pull_request', GITHUB_EVENT_PATH: eventPath, GITHUB_OUTPUT: output };
    const result = run(env); assert.equal(result.status, 0, result.stderr); assert.match(result.stdout, /Escopo CI: docs/);
    const missing = { ...env }; delete missing.GITHUB_OUTPUT; assert.notEqual(run(missing).status, 0);
    delete missing.GITHUB_EVENT_PATH; assert.notEqual(run(missing).status, 0);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
