import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateGate } from '../../scripts/ci-gate.mjs';
const required = ['documentation-linux', 'documentation-windows', 'install', 'lint', 'types', 'tests', 'export', 'android'];
const passed = Object.fromEntries(required.map(job => [job, 'success']));
test('gate aprova somente conjunto completo com artefato quando exigido', () => {
  assert.equal(evaluateGate(required, passed, { artifactRequired: true, artifactPresent: true }).passed, true);
  assert.equal(evaluateGate(required, passed, { artifactRequired: true }).passed, false);
});
for (const job of required) for (const state of ['failure', 'cancelled', 'skipped', 'queued', 'in_progress', undefined]) {
  test(job + ' ' + state + ' impede aprovação', () => assert.equal(evaluateGate(required, { ...passed, [job]: state }).passed, false));
}
test('resultado vazio não pode mascarar jobs que não rodaram', () => assert.equal(evaluateGate(required, {}).passed, false));
