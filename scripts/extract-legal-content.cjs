/* eslint-disable no-console */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const output = process.argv[2];
if (!output) throw new Error('Usage: node scripts/extract-legal-content.cjs <output.json>');
const buildDir = path.join(os.tmpdir(), 'haghdan-content-build');
fs.mkdirSync(buildDir, { recursive: true });
const compilation = spawnSync(process.execPath, [
  path.join(root, 'node_modules', 'typescript', 'bin', 'tsc'),
  'src/curriculum.ts', 'src/sqe.ts', 'src/sqe-knowledge.ts', 'src/sqe-spec.ts', 'src/sqe2-stations.ts',
  '--outDir', buildDir, '--module', 'commonjs', '--target', 'es2022', '--moduleResolution', 'node',
  '--esModuleInterop', '--skipLibCheck', '--jsx', 'react-jsx',
], { cwd: root, encoding: 'utf8' });
if (compilation.status !== 0) throw new Error(compilation.stdout + compilation.stderr);

const curriculum = require(path.join(buildDir, 'curriculum.js'));
const sqe = require(path.join(buildDir, 'sqe.js'));
const strings = new Set();
const collect = (value) => {
  if (typeof value === 'string' && /[\u0600-\u06ff]/.test(value)) strings.add(value.replace(/\s*\n\s*/g, ' '));
  else if (Array.isArray(value)) value.forEach(collect);
  else if (value && typeof value === 'object') Object.values(value).forEach(collect);
};
collect([curriculum.pathways, curriculum.lessons, sqe.sqeQuestions]);
fs.writeFileSync(output, JSON.stringify([...strings]));
console.log(`Extracted ${strings.size} curriculum strings.`);
