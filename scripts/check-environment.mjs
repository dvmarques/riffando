import { checkEnvironment } from './environment.mjs';
try { console.log(checkEnvironment({ native: process.argv.includes('--android') }).join('\n')); }
catch (error) { console.error(error.message); process.exitCode = 1; }
