export const requiredJobs = Object.freeze(['scope', 'documentation', 'javascript', 'windows', 'android', 'emulator']);
export function evaluateGate(required, results, { artifactRequired = false, artifactPresent = false } = {}) {
  const failures = required.filter(name => results[name] !== 'success');
  if (artifactRequired && !artifactPresent) failures.push('artefato Android ausente');
  return { passed: failures.length === 0, failures };
}
if (process.argv[1]?.endsWith('ci-gate.mjs')) {
  const results = JSON.parse(process.env.JOB_RESULTS || '{}');
  const statuses = Object.fromEntries(Object.entries(results).map(([name, value]) => [name, value?.result]));
  const scope = results.scope?.outputs?.scope;
  const validScope = scope === 'full' || scope === 'docs';
  const required = scope === 'docs' ? ['scope', 'documentation'] : requiredJobs;
  const result = evaluateGate(required, statuses);
  if (!validScope) result.failures.push('escopo inválido');
  if (scope === 'docs') for (const name of ['javascript', 'windows', 'android', 'emulator']) {
    if (statuses[name] !== 'skipped') result.failures.push(`${name}: esperado skipped`);
  }
  result.passed = result.failures.length === 0;
  console.log(JSON.stringify({ scope, results, ...result }, null, 2));
  if (!result.passed) process.exitCode = 1;
}
