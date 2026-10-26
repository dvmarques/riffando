import test from 'node:test';
import assert from 'node:assert/strict';
import { ESLint } from 'eslint';
const lint = new ESLint({ overrideConfig: { rules: { 'import/no-cycle': 'off' } } });
for (const source of ['react-native', '@/shared/ui/Screen', '../infrastructure/storage', '../../app/index']) {
  test('domínio rejeita ' + source, async () => {
    const result = await lint.lintText('import value from "' + source + '"; export default value;', { filePath: 'src/domain/probe.ts' });
    assert.ok(result[0].messages.some(message => message.ruleId === 'architecture/boundaries'));
  });
}
test('domínio aceita dependência pura local', async () => {
  const result = await lint.lintText('import type { Note } from "./note"; export type { Note };', { filePath: 'src/domain/probe.ts' });
  assert.ok(!result[0].messages.some(message => message.ruleId === 'architecture/boundaries'));
});
