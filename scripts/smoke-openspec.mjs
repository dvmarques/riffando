import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const cli = fileURLToPath(new URL('../node_modules/@fission-ai/openspec/bin/openspec.js', import.meta.url));
const temp = mkdtempSync(join(tmpdir(), 'riffando-smoke-'));
function run(args) {
  const result = spawnSync(process.execPath, [cli, ...args], {
    cwd: temp, env: { ...process.env, XDG_CONFIG_HOME: join(temp, 'config'), XDG_DATA_HOME: join(temp, 'data'), OPENSPEC_TELEMETRY: '0' }, encoding: 'utf8',
  });
  assert.equal(result.status, 0, `${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}
try {
  mkdirSync(join(temp, 'openspec'));
  cpSync(join(root, 'openspec/config.yaml'), join(temp, 'openspec/config.yaml'));
  run(['new', 'change', 'smoke-tooling', '--json']);
  const change = join(temp, 'openspec/changes/smoke-tooling');
  for (const artifact of ['proposal', 'design', 'specs', 'tasks']) {
    const instructions = JSON.parse(run(['instructions', artifact, '--change', 'smoke-tooling', '--json']));
    assert(instructions.template, `Template ausente: ${artifact}`);
    if (artifact !== 'specs') writeFileSync(join(change, `${artifact}.md`), artifact === 'tasks' ? '## 1. Smoke\n\n- [x] 1.1 Validar ferramenta temporária.\n' : '## Context\n\nSmoke isolado, sem aplicativo.\n');
    else {
      mkdirSync(join(change, 'specs/smoke'), { recursive: true });
      writeFileSync(join(change, 'specs/smoke/spec.md'), '## Purpose\n\nValidar o ciclo de ferramentas em diretório descartável.\n\n## ADDED Requirements\n\n### Requirement: Smoke isolado\n\nA ferramenta MUST validar uma change temporária.\n\n#### Scenario: Validação\n\n- **WHEN** o smoke executa\n- **THEN** o CLI valida o artefato\n');
    }
  }
  const status = JSON.parse(run(['status', '--change', 'smoke-tooling', '--json']));
  assert.equal(status.isPlanningComplete, true);
  const apply = JSON.parse(run(['instructions', 'apply', '--change', 'smoke-tooling', '--json']));
  assert.equal(apply.tasks.length, 1);
  assert.equal(apply.tasks[0].done, true);
  run(['validate', '--all', '--strict', '--no-interactive']);
  run(['instructions', 'archive', '--change', 'smoke-tooling', '--json']);
  run(['archive', 'smoke-tooling', '--yes']);
  assert(!existsSync(change));
  assert(readFileSync(join(temp, 'openspec/specs/smoke/spec.md'), 'utf8').includes('Smoke isolado'));
  run(['validate', '--all', '--strict', '--no-interactive']);
  console.log('CLI: criação, templates, status, tarefas/apply, validação, archive e sync temporários: OK.');
} finally {
  rmSync(temp, { recursive: true, force: true });
}
