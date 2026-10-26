import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Ignore machine-level OpenSpec config and user schema overrides.
const home = mkdtempSync(join(tmpdir(), 'riffando-validate-'));
const cli = fileURLToPath(new URL('../node_modules/@fission-ai/openspec/bin/openspec.js', import.meta.url));
try {
  const result = spawnSync(process.execPath, [cli, 'validate', '--all', '--strict', '--no-interactive'], {
    env: { ...process.env, XDG_CONFIG_HOME: join(home, 'config'), XDG_DATA_HOME: join(home, 'data'), OPENSPEC_TELEMETRY: '0', OPENSPEC_NO_UPDATE_CHECK: '1' }, stdio: 'inherit',
  });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  rmSync(home, { recursive: true, force: true });
}
