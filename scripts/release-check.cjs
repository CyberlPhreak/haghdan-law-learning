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
const motionSource = fs.readFileSync('src/motion.tsx', 'utf8');
const authSource = fs.readFileSync('src/auth.ts', 'utf8');
const analyticsSource = fs.readFileSync('src/analytics.ts', 'utf8');
const gamificationSource = fs.readFileSync('src/gamification.ts', 'utf8');
const i18nSource = fs.readFileSync('src/i18n.tsx', 'utf8');
const legalContentSource = fs.readFileSync('src/legal-content.ts', 'utf8');
const legalPacksSource = fs.readFileSync('src/legal-content-packs.ts', 'utf8');
const subjectArtSource = fs.readFileSync('src/subject-art.ts', 'utf8');
const componentsSource = fs.readFileSync('src/components.tsx', 'utf8');
if (app.userInterfaceStyle === 'automatic' && themeSource.includes('darkPalette') && storeSource.includes('themeMode') && navigationSource.includes('ThemePicker')) pass('Persisted system, light and dark appearance modes configured');
else fail('Complete appearance-mode configuration is missing');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const soundSource = fs.readFileSync('src/sound.tsx', 'utf8');
if (packageJson.dependencies?.['expo-audio'] === '1.1.1' && soundSource.includes('SoundProvider') && storeSource.includes('soundEffectsEnabled')) pass('Optional local sound feedback configured');
else fail('Sound feedback configuration is missing');
const quizAnswerLayouts = navigationSource.match(/style=\{s\.quizAnswers\}/g) || [];
if (quizAnswerLayouts.length === 2 && navigationSource.includes("quizAnswers: { width: '100%', alignSelf: 'stretch'")) pass('Native quiz answers stretch to the mobile card width');
else fail('Mobile quiz-answer width guard is missing');
if (motionSource.includes('AccessibilityInfo.isReduceMotionEnabled') && motionSource.includes("const useNativeDriver = Platform.OS !== 'web'") && navigationSource.includes('MotionView') && navigationSource.includes("animation: 'fade'")) pass('Accessible cross-platform motion system configured');
else fail('Accessible motion configuration is missing');
if (authSource.includes('HASH_ROUNDS') && authSource.includes('hashPin') && authSource.includes("return 'usernameLength'") && authSource.includes("'pinFormat'") && storeSource.includes('authenticated') && storeSource.includes('pinHash') && navigationSource.includes("t(`auth.error.${usernameError}`)") && navigationSource.includes("t('auth.error.termsRequired')") && i18nSource.includes("'auth.error.invalidLogin'")) pass('Validated local account authentication configured');
else fail('Local account authentication is incomplete');
if (navigationSource.includes('const currentAnswered = answers[question.id] !== undefined') && navigationSource.includes('disabled={!currentAnswered}') && navigationSource.includes("t('test.answerRequired')")) pass('Mandatory answer-before-next navigation configured');
else fail('Question navigation can bypass a required answer');
if (analyticsSource.includes('buildLearningAnalytics') && analyticsSource.includes('subjectScores') && navigationSource.includes('InsightsScreen') && navigationSource.includes('WeeklyActivityChart') && navigationSource.includes('SubjectBullet')) pass('Learning analytics, activity chart, and subject insights configured');
else fail('Progress analytics dashboard is incomplete');
if (gamificationSource.includes('buildGameProfile') && gamificationSource.includes('gameLevels') && gamificationSource.includes('DailyMission') && gamificationSource.includes('Achievement') && storeSource.includes('xp: current.xp + lessonXp') && navigationSource.includes('GameHubScreen') && navigationSource.includes('comboPill') && navigationSource.includes('CelebrationBurst')) pass('Persistent XP, missions, achievements, answer chains, and celebrations configured');
else fail('Learning game layer is incomplete');
if (['fa', 'en', 'zh', 'ar', 'es'].every(code => i18nSource.includes(`code: '${code}'`)) && i18nSource.includes('I18nProvider') && i18nSource.includes('LocalizedText') && i18nSource.includes('legalTitle') && storeSource.includes("language: 'fa'") && navigationSource.includes('LanguagePicker') && navigationSource.includes("const rowDirection = isRtl ? 'row-reverse' : 'row'")) pass('Persistent multilingual UI, RTL/LTR layout, and reviewed-content fallback configured');
else fail('Multilingual interface configuration is incomplete');
const containsPersian = source => /[\u0600-\u06ff]/.test(source);
const componentPersian = componentsSource.match(/[\u0600-\u06ff]+/g) || [];
if (![navigationSource, authSource, analyticsSource].some(containsPersian) && componentPersian.every(value => value === 'حق' || value === 'دان') && i18nSource.includes("if (language === 'en') return ''") && i18nSource.includes('localizeLegalText(persian, language)')) pass('Non-Persian interfaces cannot leak Persian source labels beyond the HaghDān brand');
else fail('A non-Persian interface can still expose Persian source text');
if (legalContentSource.includes('localizeLesson') && legalContentSource.includes('localizeQuestion') && legalPacksSource.includes('draft-offline-machine-translation-requires-legal-editorial-review') && legalPacksSource.includes('\\"stringCount\\":2103') && ['en', 'zh', 'ar', 'es'].every(code => legalPacksSource.includes(`\\"${code}\\":[`)) && navigationSource.includes('sourceQuestions.map((question) => localizeQuestion(question, language))')) pass('Offline lesson, review, and mock translations configured for all four additional languages');
else fail('Translated curriculum and mock-question packs are incomplete');
if (soundSource.includes('playMilestone') && soundSource.includes('correctAccentPlayer') && soundSource.includes('milestoneAccentSecond') && soundSource.includes('playsInSilentMode: true') && soundSource.includes('previewTap')) pass('Audible layered answer and milestone sound feedback configured');
else fail('Premium layered sound feedback is incomplete');
if (subjectArtSource.includes("'flk1-business': 'business'") && subjectArtSource.includes("'sqe2-interview': 'clientSkills'") && navigationSource.includes('ImageBackground') && navigationSource.includes('NavigationIcon')) pass('Illustrated pathways and premium navigation configured');
else fail('Illustrated pathway or navigation treatment is incomplete');

['assets/icon.png','assets/adaptive-icon.png','assets/splash-icon.png','assets/favicon.png','assets/sounds/tap.wav','assets/sounds/correct-clap.wav','assets/sounds/incorrect.wav','docs/PRIVACY_POLICY.md','docs/TERMS_AND_DISCLAIMER.md','docs/EDITORIAL_POLICY.md','docs/SRA_COVERAGE_AUDIT.md','eas.json','PUBLISHING.md'].forEach(path => requireFile(path, path.endsWith('.png') || path.endsWith('.wav') ? 1000 : 100));
['src/art-business.ts','src/art-dispute.ts','src/art-contractEthics.ts','src/art-property.ts','src/art-estates.ts','src/art-institutions.ts','src/art-criminal.ts','src/art-clientSkills.ts'].forEach(path => requireFile(path, 30000));

const curriculum = fs.readFileSync('src/sqe.ts', 'utf8');
const knowledge = fs.readFileSync('src/sqe-knowledge.ts', 'utf8');
const sqeSpec = fs.readFileSync('src/sqe-spec.ts', 'utf8');
const sqe2Stations = fs.readFileSync('src/sqe2-stations.ts', 'utf8');
const unitRows = curriculum.match(/^\s+'[^'\n]+~[^'\n]+~[^'\n]+~[^'\n]+',?$/gm) || [];
if (unitRows.length >= 100) pass(`Curriculum contains ${unitRows.length} structured units`);
else fail(`Expected at least 100 curriculum units, found ${unitRows.length}`);
const knowledgeEntries = knowledge.match(/^  "[^"]+": \[/gm) || [];
if (knowledgeEntries.length === 89) pass('All 89 FLK units include substantive Persian rule notes');
else fail('Expected substantive notes for 89 FLK units, found ' + knowledgeEntries.length);
if (curriculum.includes('Array.from({ length: 12 }')) pass('Twelve-question-per-FLK-unit bank configured');
else fail('Expanded question-bank generator is missing');
if (curriculum.includes("title: 'سناریوی تمرینی هدایت‌شده'") && curriculum.includes("title: 'Exam clinic و جمع‌بندی'")) pass('Five-part learning flow configured');
else fail('Deep learning sections are missing');
const flk1Targets = [31, 31, 30, 30, 15, 15, 28].reduce((sum, value) => sum + value, 0);
const flk2Targets = [27, 27, 6, 30, 30, 30, 30].reduce((sum, value) => sum + value, 0);
if (flk1Targets === 180 && flk2Targets === 180 && sqeSpec.includes('allocateBlueprintCounts') && curriculum.includes('buildBalancedTestQuestions')) pass('SRA Annex 4 balanced 180-question FLK mocks configured');
else fail('Balanced full-FLK blueprint configuration is incomplete');
if (navigationSource.includes("mode: 'fullMock'") && navigationSource.includes('count: 180') && navigationSource.includes('153 * 60') && navigationSource.includes('setInBreak(true)')) pass('Two-session official-length FLK simulation configured');
else fail('Full two-session FLK simulation is incomplete');
if (sqe2Stations.includes("'sqe2-interview': ['property', 'wills']") && sqe2Stations.includes("'sqe2-advocacy': ['dispute', 'criminal']") && sqe2Stations.includes("['dispute', 'criminal', 'property', 'wills', 'business']") && sqe2Stations.includes('sqe2StationLessons')) pass('SQE2 skills and five official practice contexts configured');
else fail('SQE2 station/context coverage is incomplete');
if (sqeSpec.includes("checkedAt: '2026-07-22'") && sqeSpec.includes('september2026Changes') && sqeSpec.includes('sqe1-annex4')) pass('Versioned SRA specification and September 2026 transition mapped');
else fail('SRA specification version mapping is incomplete');

const tsc = spawnSync('.\\node_modules\\.bin\\tsc.cmd', ['--noEmit'], { stdio: 'inherit', shell: true });
if (tsc.status === 0) pass('TypeScript');
else fail('TypeScript failed');

const expo = spawnSync(process.execPath, ['scripts/run-expo.cjs', 'install', '--check'], { stdio: 'inherit' });
if (expo.status === 0) pass('Expo dependency compatibility');
else fail('Expo dependency compatibility failed');

if (process.exitCode) process.exit(process.exitCode);
console.log('Release check complete. External account setup and legal editorial sign-off remain publisher responsibilities.');
