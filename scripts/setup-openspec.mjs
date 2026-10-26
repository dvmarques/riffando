import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

// OpenSpec profiles are machine-level. Isolate ours so setup is reproducible
// without changing the developer's preferences for other repositories.
// XDG_DATA_HOME hides user schema overrides; CODEX_HOME keeps legacy cleanup
// from deleting the developer's global ~/.codex/prompts/opsx-*.md files.
const configDir = mkdtempSync(join(tmpdir(), 'riffando-openspec-'));
const cli = new URL('../node_modules/@fission-ai/openspec/bin/openspec.js', import.meta.url);
const env = {
  ...process.env,
  XDG_CONFIG_HOME: join(configDir, 'config'),
  XDG_DATA_HOME: join(configDir, 'data'),
  CODEX_HOME: join(configDir, 'codex'),
  OPENSPEC_TELEMETRY: '0',
  OPENSPEC_NO_UPDATE_CHECK: '1',
};
function run(args) {
  const result = spawnSync(process.execPath, [fileURLToPath(cli), ...args], { env, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`OpenSpec failed (${result.status}): ${args.join(' ')}`);
}
try {
  run(['config', 'set', 'profile', 'custom']);
  run(['config', 'set', 'delivery', 'both']);
  run(['config', 'set', 'workflows', JSON.stringify(['explore', 'propose', 'apply', 'verify', 'update', 'sync', 'archive'])]);
  if (process.argv.includes('--check')) {
    run(['update', '--dry-run', '--json']);
  } else if (process.argv.includes('--update')) {
    run(['update', '--force']);
  } else {
    run(['init', '--tools', 'codex,claude', '--profile', 'custom', '--language', 'pt-BR', '--no-animation']);
  }
} finally {
  rmSync(configDir, { recursive: true, force: true });
}
