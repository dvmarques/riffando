import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Only explicitly recognized documentation and agent definitions qualify.
export function isDocumentationOnly(paths) {
  if (!paths.length) return false;
  return paths.every(path => /^(?:[^/]+\.md|docs\/.+\.md|openspec\/.+\.md|openspec\/changes\/.+\/\.openspec\.yaml|\.agents\/skills\/.+\/SKILL\.md|\.claude\/(?:agents|skills|commands)\/.+\.md|\.codex\/agents\/[a-z0-9-]+\.toml)$/.test(path));
}
export function parseGitDiff(output) {
  if (!output) return [];
  const tokens = output.split('\0');
  if (tokens.pop() !== '') throw new Error('Diff Git truncado');
  if (tokens.length % 2 !== 0) throw new Error('Diff Git inválido');
  const paths = [];
  for (let i = 0; i < tokens.length; i += 2) {
    const match = tokens[i].match(/^:([0-7]{6}) ([0-7]{6}) [0-9a-f]+ [0-9a-f]+ [ADMT]$/i);
    if (!match || !tokens[i + 1]) throw new Error('Registro de diff Git inválido');
    paths.push(tokens[i + 1]);
    if (![match[1], match[2]].every(mode => mode === '000000' || mode === '100644')) paths.push('<modo-nao-documental>');
  }
  return paths;
}
export function classifyEvent(eventName, event, diff) {
  if (eventName !== 'pull_request') return 'full';
  const base = event.pull_request?.base?.sha;
  const head = event.pull_request?.head?.sha;
  if (!/^[0-9a-f]{40}$/i.test(base ?? '') || !/^[0-9a-f]{40}$/i.test(head ?? '')) throw new Error('SHA da PR ausente ou inválido');
  return isDocumentationOnly(diff(base, head)) ? 'docs' : 'full';
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
  const scope = classifyEvent(process.env.GITHUB_EVENT_NAME, event, (base, head) => {
    const output = execFileSync('git', ['diff', '--no-renames', '--raw', '-z', `${base}...${head}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    return parseGitDiff(output);
  });
  appendFileSync(process.env.GITHUB_OUTPUT, `scope=${scope}\n`);
  console.log(`Escopo CI: ${scope}`);
}
