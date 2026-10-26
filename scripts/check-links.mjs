import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

function markdown(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (['node_modules', '.git', '.agents', '.claude'].includes(entry.name)) return [];
    const path = resolve(dir, entry.name);
    return entry.isDirectory() ? markdown(path) : path.endsWith('.md') ? [path] : [];
  });
}
const errors = [];
for (const file of markdown('.')) {
  // Exclude code examples: their links may intentionally describe future files.
  const body = readFileSync(file, 'utf8').replace(/```[\s\S]*?```/g, '');
  for (const match of body.matchAll(/!?\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
    const href = match[1];
    if (/^(?:[a-z]+:|#|\/\/)/i.test(href)) continue;
    const target = decodeURIComponent(href.split(/[?#]/)[0]);
    if (target && !existsSync(resolve(dirname(file), target))) errors.push(`${file}: ${href}`);
  }
}
if (errors.length) throw new Error(`Links locais inválidos:\n${errors.join('\n')}`);
console.log('Links locais Markdown: OK (existência de caminhos; não verifica âncoras/URLs externas).');
