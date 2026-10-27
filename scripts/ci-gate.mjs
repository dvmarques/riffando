export const requiredJobs = Object.freeze(['documentation', 'javascript', 'windows', 'android', 'emulator']);
export function evaluateGate(required, results, { artifactRequired = false, artifactPresent = false } = {}) {
  const failures = required.filter(name => results[name] !== 'success');
  if (artifactRequired && !artifactPresent) failures.push('artefato Android ausente');
  return { passed: failures.length === 0, failures };
}
if (process.argv[1]?.endsWith('ci-gate.mjs')) {
  const required = requiredJobs;
  const results = JSON.parse(process.env.JOB_RESULTS || '{}');
  const statuses = Object.fromEntries(Object.entries(results).map(([name, value]) => [name, value?.result]));
  const result = evaluateGate(required, statuses);
  console.log(JSON.stringify({ policy: 'Todos os jobs exigidos; sem filtros', results, ...result }, null, 2));
  if (!result.passed) process.exitCode = 1;
}
