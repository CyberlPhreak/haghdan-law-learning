const fs = require('node:fs');
const { spawnSync } = require('node:child_process');

const fail = (message) => { console.error('FAIL:', message); process.exitCode = 1; };
const pass = (message) => console.log('PASS:', message);
const requireFile = (path, minBytes = 1) => {
  if (!fs.existsSync(path)) return fail(`Missing ${path}`);
  const size = fs.statSync(path).size;
  if (size < minBytes) return fail(`${path} is unexpectedly small (${size} bytes)`);
  pass(`${path} (${size} bytes)`);
};

const app = JSON.parse(fs.readFileSync('app.json', 'utf8')).expo;
if (app.ios?.bundleIdentifier === 'com.haghdan.learning' && app.android?.package === 'com.haghdan.learning') pass('Native identifiers configured');
else fail('Native identifiers are missing or inconsistent');

const themeSource = fs.readFileSync('src/theme.ts', 'utf8');
const storeSource = fs.readFileSync('src/store.tsx', 'utf8');
const navigationSource = fs.readFileSync('src/navigation.tsx', 'utf8');
if (app.userInterfaceStyle === 'automatic' && themeSource.includes('darkPalette') && storeSource.includes('themeMode') && navigationSource.includes('ThemePicker')) pass('Persisted system, light and dark appearance modes configured');
else fail('Complete appearance-mode configuration is missing');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const soundSource = fs.readFileSync('src/sound.tsx', 'utf8');
if (packageJson.dependencies?.['expo-audio'] === '1.1.1' && soundSource.includes('SoundProvider') && storeSource.includes('soundEffectsEnabled')) pass('Optional local sound feedback configured');
else fail('Sound feedback configuration is missing');
const quizAnswerLayouts = navigationSource.match(/style=\{s\.quizAnswers\}/g) || [];
if (quizAnswerLayouts.length === 2 && navigationSource.includes("quizAnswers: { width: '100%', alignSelf: 'stretch'")) pass('Native quiz answers stretch to the mobile card width');
else fail('Mobile quiz-answer width guard is missing');

['assets/icon.png','assets/adaptive-icon.png','assets/splash-icon.png','assets/favicon.png','assets/sounds/tap.wav','assets/sounds/correct-clap.wav','assets/sounds/incorrect.wav','docs/PRIVACY_POLICY.md','docs/TERMS_AND_DISCLAIMER.md','docs/EDITORIAL_POLICY.md','eas.json','PUBLISHING.md'].forEach(path => requireFile(path, path.endsWith('.png') || path.endsWith('.wav') ? 1000 : 100));

const curriculum = fs.readFileSync('src/sqe.ts', 'utf8');
const knowledge = fs.readFileSync('src/sqe-knowledge.ts', 'utf8');
const unitRows = curriculum.match(/^\s+'[^'\n]+~[^'\n]+~[^'\n]+~[^'\n]+',?$/gm) || [];
if (unitRows.length >= 100) pass(`Curriculum contains ${unitRows.length} structured units`);
else fail(`Expected at least 100 curriculum units, found ${unitRows.length}`);
const knowledgeEntries = knowledge.match(/^  "[^"]+": \[/gm) || [];
if (knowledgeEntries.length === 79) pass('All 79 FLK units include substantive Persian rule notes');
else fail('Expected substantive notes for 79 FLK units, found ' + knowledgeEntries.length);
if (curriculum.includes('Array.from({ length: 12 }')) pass('Twelve-question-per-FLK-unit bank configured');
else fail('Expanded question-bank generator is missing');
if (curriculum.includes("title: 'سناریوی تمرینی هدایت‌شده'") && curriculum.includes("title: 'Exam clinic و جمع‌بندی'")) pass('Five-part learning flow configured');
else fail('Deep learning sections are missing');

const tsc = spawnSync('.\\node_modules\\.bin\\tsc.cmd', ['--noEmit'], { stdio: 'inherit', shell: true });
if (tsc.status === 0) pass('TypeScript');
else fail('TypeScript failed');

const expo = spawnSync(process.execPath, ['scripts/run-expo.cjs', 'install', '--check'], { stdio: 'inherit' });
if (expo.status === 0) pass('Expo dependency compatibility');
else fail('Expo dependency compatibility failed');

if (process.exitCode) process.exit(process.exitCode);
console.log('Release check complete. External account setup and legal editorial sign-off remain publisher responsibilities.');
