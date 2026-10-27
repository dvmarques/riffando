import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { evaluateGate, requiredJobs } from '../../scripts/ci-gate.mjs';
const required = requiredJobs;
const passed = Object.fromEntries(required.map(job => [job, 'success']));
test('gate aprova somente conjunto completo com artefato quando exigido', () => {
  assert.equal(evaluateGate(required, passed, { artifactRequired: true, artifactPresent: true }).passed, true);
  assert.equal(evaluateGate(required, passed, { artifactRequired: true }).passed, false);
});
for (const job of required) for (const state of ['failure', 'cancelled', 'skipped', 'queued', 'in_progress', undefined]) {
  test(job + ' ' + state + ' impede aprovação', () => assert.equal(evaluateGate(required, { ...passed, [job]: state }).passed, false));
}
test('resultado vazio não pode mascarar jobs que não rodaram', () => assert.equal(evaluateGate(required, {}).passed, false));

test('CLI do gate interpreta toJSON(needs) e rejeita cada job real ausente ou sem sucesso', () => {
  const cli = fileURLToPath(new URL('../../scripts/ci-gate.mjs', import.meta.url));
  const needs = Object.fromEntries(requiredJobs.map(job => [job, {result:'success',outputs:{}}]));
  const invoke = results => spawnSync(process.execPath, [cli], {env:{...process.env,JOB_RESULTS:JSON.stringify(results)},encoding:'utf8',timeout:10000});
  const good = invoke(needs);
  assert.equal(good.status, 0, good.stderr);
  assert.equal(JSON.parse(good.stdout).passed, true);
  for (const job of requiredJobs) {
    for (const state of ['failure','cancelled','skipped',undefined]) {
      const input = {...needs};
      if (state === undefined) delete input[job]; else input[job] = {result:state};
      const result = invoke(input);
      assert.equal(result.status, 1, job + ':' + state);
      assert.ok(JSON.parse(result.stdout).failures.includes(job));
    }
  }
});

test('gate exige todos os jobs do workflow e mantém a mesma lista no agregador', () => {
  const workflow = readFileSync(new URL('../../.github/workflows/ci.yml', import.meta.url), 'utf8');
  const jobs = workflow.split(/\r?\njobs:\r?\n/)[1];
  const names = [...jobs.matchAll(/^  ([a-z][\w-]*):\r?$/gm)].map(match=>match[1]).filter(name=>name!=='gate');
  const needs = jobs.match(/(?:^|\n)  gate:[\s\S]*?\n    needs: \[([^\]]+)\]/)[1].split(',').map(name=>name.trim());
  assert.deepEqual([...requiredJobs].sort(), names.sort());
  assert.deepEqual([...requiredJobs].sort(), needs.sort());
});
