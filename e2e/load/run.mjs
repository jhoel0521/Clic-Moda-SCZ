// Corre el laboratorio de carga completo y resume percentiles + consumo de cada contenedor.
//   node e2e/load/run.mjs [read|write|all]      (por defecto: all)
// Sale con el código de k6: falla si un umbral (p95, p99, errores, stock vendido de más) no se cumple.
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url));
const compose = ['compose', '-f', join(dir, 'docker-compose.yml')];
const scenario = process.argv[2] ?? 'all';
if (!['read', 'write', 'all'].includes(scenario)) {
  console.error('Uso: pnpm load [read|write|all]');
  process.exit(2);
}

const docker = (args, options = {}) => spawnSync('docker', args, { encoding: 'utf8', ...options });
const toMb = (text) => {
  const [value, unit] = text.trim().match(/^([\d.]+)(\w+)/).slice(1);
  return Number(value) * ({ KiB: 1 / 1024, MiB: 1, GiB: 1024, B: 1 / 1048576 }[unit] ?? 1);
};

function sample(peaks) {
  const out = docker(['stats', '--no-stream', '--format', '{{.Name}}|{{.CPUPerc}}|{{.MemUsage}}']).stdout ?? '';
  for (const line of out.trim().split('\n').filter(Boolean)) {
    const [name, cpu, mem] = line.split('|');
    if (!name.startsWith('clic-moda-load-')) continue;
    const peak = peaks.get(name) ?? { cpu: 0, mem: 0, limit: 0 };
    const [used, limit] = mem.split('/');
    peaks.set(name, { cpu: Math.max(peak.cpu, parseFloat(cpu)), mem: Math.max(peak.mem, toMb(used)), limit: toMb(limit) });
  }
}

function report(peaks) {
  console.log('\nConsumo máximo por contenedor (límite configurado: LOAD_CPUS / LOAD_MEM)');
  for (const [name, p] of [...peaks].sort()) {
    const percent = p.limit ? Math.round((p.mem / p.limit) * 100) : 0;
    console.log(`  ${name.padEnd(28)} CPU ${p.cpu.toFixed(0).padStart(4)}%   memoria ${p.mem.toFixed(0)} MB de ${p.limit.toFixed(0)} MB (${percent}%)`);
  }
  const ids = docker([...compose, 'ps', '-aq']).stdout.trim().split('\n').filter(Boolean);
  const killed = ids.filter((id) => docker(['inspect', '-f', '{{.State.OOMKilled}}', id]).stdout.trim() === 'true');
  console.log(killed.length ? `  ✖ Docker mató ${killed.length} contenedor(es) por falta de memoria (OOM)` : '  ✓ Ningún contenedor fue matado por memoria');
}

const run = (args) => spawnSync('docker', [...compose, ...args], { stdio: 'inherit' }).status ?? 1;

console.log(`Levantando base y API (escenario: ${scenario})…`);
if (run(['up', '-d', '--build', '--wait', 'api']) !== 0) {
  run(['logs', '--tail', '40', 'setup', 'api']);
  process.exit(1);
}
const peaks = new Map();
const timer = setInterval(() => sample(peaks), 4000);
const k6 = spawn('docker', [...compose, 'run', '--rm', '--build', '-e', `SCENARIO=${scenario}`, 'k6'], { stdio: 'inherit' });
k6.on('exit', (code) => {
  clearInterval(timer);
  sample(peaks);
  report(peaks);
  console.log('\nLimpiar: pnpm load:down');
  process.exit(code ?? 1);
});
