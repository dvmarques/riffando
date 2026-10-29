import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { checkReviewers } from './check-agent-reviewers.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
test('detecta divergência nas instruções dos revisores', () => {
  const temp = mkdtempSync(join(tmpdir(), 'riffando-reviewers-'));
  try {
    cpSync(join(root, '.codex/agents'), join(temp, '.codex/agents'), { recursive: true });
    cpSync(join(root, '.claude/agents'), join(temp, '.claude/agents'), { recursive: true });
    checkReviewers(temp);
    const path = join(temp, '.codex/agents/architecture-reviewer.toml');
    writeFileSync(path, readFileSync(path, 'utf8').replace('Não edite nem instale nada.', 'Edite arquivos.'));
    assert.throws(() => checkReviewers(temp), /Revisor divergente/);
  } finally { rmSync(temp, { recursive: true, force: true }); }
});
