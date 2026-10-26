import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const temp = mkdtempSync(join(tmpdir(), 'riffando-generation-'));
// Git may check out text as CRLF on Windows; compare canonical LF content.
const text = path => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
// Skills próprias não são geradas pelo OpenSpec; ficam fora da comparação e são verificadas por check:agent-skills.
const customSkills = ['adaptive-ai-workflow'];
const skillRoots = ['.agents/skills', '.claude/skills'];
const skills = ['explore', 'propose', 'apply-change', 'verify-change', 'update-change', 'sync-specs', 'archive-change'];
try {
  for (const base of ['.agents/skills', '.claude/skills']) {
    for (const skill of skills) assert(existsSync(join(root, base, `openspec-${skill}`, 'SKILL.md')));
    for (const skill of customSkills) assert(existsSync(join(root, base, skill, 'SKILL.md')), `Skill própria ausente: ${base}/${skill}`);
  }
  assert(!existsSync(join(root, '.codex/skills')), 'Não duplicar skills Codex');
  const claude = text(join(root, 'CLAUDE.md'));
  assert.equal(claude.trim(), '# Claude Code — Riffando\n\nRead and follow [AGENTS.md](AGENTS.md) as the canonical instructions for this repository.\n\n@AGENTS.md\n\nFor project context, architecture, decisions, workflow and coding standards, follow the references defined in AGENTS.md.');
  // Recreate the official integrations independently, then compare their content.
  cpSync(join(root, 'scripts'), join(temp, 'scripts'), { recursive: true });
  const script = join(temp, 'scripts/setup-openspec.mjs');
  // Resolve dependency from the real checkout, avoiding a second npm install.
  const original = readFileSync(script, 'utf8');
  const source = original.replace("new URL('../node_modules/@fission-ai/openspec/bin/openspec.js', import.meta.url)", JSON.stringify(new URL('../node_modules/@fission-ai/openspec/bin/openspec.js', import.meta.url).href));
  assert.notEqual(source, original, 'Caminho do CLI OpenSpec não encontrado em setup-openspec.mjs');
  writeFileSync(script, source);
  // Setup must not clean the developer's global Codex prompts.
  const codexHome = join(temp, 'user-codex');
  const globalPrompt = join(codexHome, 'prompts/opsx-explore.md');
  mkdirSync(join(codexHome, 'prompts'), { recursive: true });
  writeFileSync(globalPrompt, 'prompt global do desenvolvedor\n');
  const result = spawnSync(process.execPath, [script], { cwd: temp, encoding: 'utf8', env: { ...process.env, CODEX_HOME: codexHome } });
  assert.equal(result.status, 0, result.stderr + result.stdout);
  assert(existsSync(globalPrompt), 'Setup removeu prompt Codex global fora do repositório');
  rmSync(codexHome, { recursive: true, force: true });
  function compare(relative) {
    const expected = join(temp, relative);
    const actual = join(root, relative);
    const generated = name => !(skillRoots.includes(relative.replaceAll('\\', '/')) && customSkills.includes(name));
    assert.deepEqual(readdirSync(actual).filter(generated).sort(), readdirSync(expected).sort(), relative);
    for (const entry of readdirSync(expected, { withFileTypes: true })) {
      const path = join(relative, entry.name);
      if (entry.isDirectory()) compare(path);
      else assert.equal(text(resolve(root, path)), text(resolve(temp, path)), path);
    }
  }
  compare('.agents');
  compare('.claude/skills');
  compare('.claude/commands');
  console.log('CLAUDE de referência e integrações oficiais reproduzidas com conteúdo idêntico após normalizar CRLF/LF: OK.');
} finally {
  rmSync(temp, { recursive: true, force: true });
}
