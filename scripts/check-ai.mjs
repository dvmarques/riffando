import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const temp = mkdtempSync(join(tmpdir(), 'riffando-generation-'));
const skills = ['explore', 'propose', 'apply-change', 'verify-change', 'update-change', 'sync-specs', 'archive-change'];
try {
  for (const base of ['.agents/skills', '.claude/skills']) {
    for (const skill of skills) assert(existsSync(join(root, base, `openspec-${skill}`, 'SKILL.md')));
  }
  assert(!existsSync(join(root, '.codex/skills')), 'Não duplicar skills Codex');
  const claude = readFileSync(join(root, 'CLAUDE.md'), 'utf8');
  assert.equal(claude.trim(), '# Claude Code — Riffando\n\nRead and follow [AGENTS.md](AGENTS.md) as the canonical instructions for this repository.\n\n@AGENTS.md\n\nFor project context, architecture, decisions, workflow and coding standards, follow the references defined in AGENTS.md.');
  // Recreate the official integrations independently, then compare every byte.
  cpSync(join(root, 'scripts'), join(temp, 'scripts'), { recursive: true });
  const script = join(temp, 'scripts/setup-openspec.mjs');
  // Resolve dependency from the real checkout, avoiding a second npm install.
  const { writeFileSync } = await import('node:fs');
  const source = readFileSync(script, 'utf8').replace("new URL('../node_modules/@fission-ai/openspec/bin/openspec.js', import.meta.url)", JSON.stringify(new URL('../node_modules/@fission-ai/openspec/bin/openspec.js', import.meta.url).href));
  writeFileSync(script, source);
  const result = spawnSync(process.execPath, [script], { cwd: temp, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr + result.stdout);
  function compare(relative) {
    const expected = join(temp, relative);
    const actual = join(root, relative);
    assert.deepEqual(readdirSync(actual).sort(), readdirSync(expected).sort(), relative);
    for (const entry of readdirSync(expected, { withFileTypes: true })) {
      const path = join(relative, entry.name);
      if (entry.isDirectory()) compare(path);
      else assert.equal(readFileSync(resolve(root, path), 'utf8'), readFileSync(resolve(temp, path), 'utf8'), path);
    }
  }
  compare('.agents');
  compare('.claude/skills');
  compare('.claude/commands');
  console.log('CLAUDE de referência e integrações oficiais reproduzidas byte a byte: OK.');
} finally {
  rmSync(temp, { recursive: true, force: true });
}
