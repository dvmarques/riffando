import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function checkReviewers(root) {
  for (const name of ['architecture-reviewer', 'mobile-accessibility-reviewer']) {
    const md = readFileSync(resolve(root, `.claude/agents/${name}.md`), 'utf8').replace(/\r\n/g, '\n');
    const match = md.match(/^---\nname: (.+)\ndescription: (.+)\ntools: Read, Grep, Glob\n---\n\n([\s\S]*?)\s*$/);
    assert(match, `Formato Claude inesperado: ${name}`);
    const toml = readFileSync(resolve(root, `.codex/agents/${name}.toml`), 'utf8').replace(/\r\n/g, '\n');
    const values = Object.fromEntries(toml.trim().split('\n').map(line => {
      const item = line.match(/^(name|description|developer_instructions) = (".*")$/);
      assert(item, `Formato Codex inesperado: ${name}`);
      return [item[1], JSON.parse(item[2])];
    }));
    assert.deepEqual(values, { name: match[1], description: match[2], developer_instructions: match[3] }, `Revisor divergente: ${name}`);
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  checkReviewers(resolve(fileURLToPath(new URL('..', import.meta.url))));
  console.log('Revisores Codex e Claude equivalentes: OK.');
}
