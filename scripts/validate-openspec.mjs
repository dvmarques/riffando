import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../node_modules/@fission-ai/openspec/bin/openspec.js', import.meta.url));
const result = spawnSync(process.execPath, [cli, 'validate', '--all', '--strict', '--no-interactive'], {
  env: { ...process.env, OPENSPEC_TELEMETRY: '0', OPENSPEC_NO_UPDATE_CHECK: '1' }, stdio: 'inherit',
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
