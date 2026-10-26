import { spawnSync } from 'node:child_process';
export function run(file, args = [], options = {}) {
  const result = spawnSync(file, args, { encoding: 'utf8', timeout: 120_000, shell: process.platform === 'win32' && /\.(cmd|bat)$/.test(file), ...options });
  if (result.error) return { status: 1, output: result.error.message, missing: result.error.code === 'ENOENT' };
  return { status: result.status ?? 1, output: (result.stdout ?? '') + (result.stderr ?? '') };
}
export function execute(file, args, options = {}) {
  const result = run(file, args, { stdio: 'inherit', timeout: 1_800_000, ...options });
  if (result.status !== 0) throw new Error('Falha ao executar ' + file + ': ' + (result.output ?? 'consulte o log da etapa'));
}
