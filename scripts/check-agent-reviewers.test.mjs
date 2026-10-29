import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { checkReviewers } from './check-agent-reviewers.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
function fixture(run) {
  const temp = mkdtempSync(join(tmpdir(), 'riffando-reviewers-'));
  try {
    cpSync(join(root, '.codex/agents'), join(temp, '.codex/agents'), { recursive: true });
    cpSync(join(root, '.claude/agents'), join(temp, '.claude/agents'), { recursive: true });
    run(temp);
  } finally { rmSync(temp, { recursive: true, force: true }); }
}
function change(path, before, after) {
  const original = readFileSync(path, 'utf8');
  assert(original.includes(before));
  writeFileSync(path, original.replace(before, after));
}
test('revisores equivalentes passam', () => fixture(checkReviewers));
test('detecta instruções divergentes do revisor de arquitetura', () => fixture(temp => {
  change(join(temp, '.codex/agents/architecture-reviewer.toml'), 'Não edite nem instale nada.', 'Edite arquivos.');
  assert.throws(() => checkReviewers(temp), /Revisor divergente/);
}));
test('detecta descrição divergente do revisor de acessibilidade', () => fixture(temp => {
  change(join(temp, '.codex/agents/mobile-accessibility-reviewer.toml'), 'Revisão consultiva de acessibilidade', 'Revisão de acessibilidade');
  assert.throws(() => checkReviewers(temp), /Revisor divergente/);
}));
test('detecta revisor ausente em um dos agentes', () => fixture(temp => {
  unlinkSync(join(temp, '.codex/agents/mobile-accessibility-reviewer.toml'));
  assert.throws(() => checkReviewers(temp), /Conjuntos de revisores divergentes/);
}));
test('detecta nome que não corresponde ao arquivo', () => fixture(temp => {
  change(join(temp, '.claude/agents/architecture-reviewer.md'), 'name: architecture-reviewer', 'name: outro');
  assert.throws(() => checkReviewers(temp), /Nome não corresponde/);
}));
test('detecta ferramentas Claude alteradas', () => fixture(temp => {
  change(join(temp, '.claude/agents/architecture-reviewer.md'), 'tools: Read, Grep, Glob', 'tools: Read, Edit');
  assert.throws(() => checkReviewers(temp), /Formato Claude inesperado/);
}));
