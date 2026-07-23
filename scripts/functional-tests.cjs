const assert = require('node:assert/strict');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.Node10,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filename,
  }).outputText;
  module._compile(output, filename);
};

const tests = [];
const test = (name, run) => tests.push({ name, run });

const auth = require('../src/auth.ts');
const gamification = require('../src/gamification.ts');
const { buildLearningAnalytics } = require('../src/analytics.ts');
const {
  buildBalancedTestQuestions,
  questionsForStage,
  sqeLessons,
  sqePathways,
  sqeQuestions,
  sqeTotals,
  stageSubjects,
} = require('../src/sqe.ts');
const { allocateBlueprintCounts, examSubjectTargets } = require('../src/sqe-spec.ts');
const { sqe2Stations, stationLessonIdsForSkill } = require('../src/sqe2-stations.ts');
const { lessons, pathways, lessonById, pathwayById } = require('../src/curriculum.ts');
const { legalTranslationStringCount, localizeLesson, localizeQuestion } = require('../src/legal-content.ts');
const { askStudyAssistant, findKnowledgeMatches, privacySafeLearnerId } = require('../src/ai-chat.ts');
const sraCoverage = require('../src/sra-coverage.json');

const unique = (values) => new Set(values).size === values.length;
const localDateKey = gamification.localDateKey;
const makeState = (patch = {}) => ({
  hydrated: true,
  onboarded: true,
  authenticated: true,
  accountMode: 'local',
  userId: '',
  email: '',
  name: 'Test learner',
  username: 'test_learner',
  pinHash: 'hash',
  pinSalt: 'salt',
  termsAcceptedAt: new Date().toISOString(),
  dailyGoal: 2,
  language: 'en',
  xp: 0,
  completedLessons: [],
  savedLessons: [],
  quizScores: {},
  completionDates: {},
  reviewQueue: [],
  activeDays: [],
  audioEnabled: false,
  soundEffectsEnabled: true,
  persianFirst: false,
  themeMode: 'system',
  testHistory: [],
  ...patch,
});

test('SHA-256 matches standard vectors and PIN hashing is normalized', () => {
  assert.equal(auth.sha256(''), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  assert.equal(auth.sha256('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  const first = auth.hashPin('123456', 'fixed-salt', ' Sara_Law ');
  const second = auth.hashPin('123456', 'fixed-salt', 'sara_law');
  assert.equal(first, second);
  assert.notEqual(first, auth.hashPin('123455', 'fixed-salt', 'sara_law'));
  assert.notEqual(auth.createCredentialSalt(), auth.createCredentialSalt());
});

test('username and PIN validation accepts valid multilingual input and rejects unsafe forms', () => {
  assert.equal(auth.validateUsername('sara.law_1'), '');
  assert.equal(auth.validateUsername('حقوق_سارا'), '');
  assert.equal(auth.normalizeUsername('  SARA.LAW  '), 'sara.law');
  assert.equal(auth.validateUsername('ab'), 'usernameLength');
  assert.equal(auth.validateUsername('_sara'), 'usernameEdges');
  assert.equal(auth.validateUsername('sara..law'), 'usernameRepeated');
  assert.equal(auth.validateUsername('sara law'), 'usernameCharacters');
  assert.equal(auth.validatePin('1234'), '');
  assert.equal(auth.validatePin('123456'), '');
  assert.equal(auth.validatePin('123'), 'pinFormat');
  assert.equal(auth.validatePin('12a4'), 'pinFormat');
});

test('curriculum IDs, pathway references, questions, and answer keys are internally valid', () => {
  assert.equal(pathways.length, 25);
  assert.equal(lessons.length, 152);
  assert.equal(sqeLessons.length, 137);
  assert.equal(sqeQuestions.length, 1068);
  assert.equal(sqe2Stations.length, 24);
  assert.ok(unique(pathways.map((item) => item.id)));
  assert.ok(unique(lessons.map((item) => item.id)));
  assert.ok(unique(sqeQuestions.map((item) => item.id)));
  for (const pathway of pathways) {
    assert.equal(pathwayById[pathway.id], pathway);
    assert.ok(pathway.lessonIds.length > 0, `${pathway.id} has no lessons`);
    for (const lessonId of pathway.lessonIds) {
      assert.ok(lessonById[lessonId], `${pathway.id} references missing lesson ${lessonId}`);
      assert.equal(lessonById[lessonId].pathwayId, pathway.id);
    }
  }
  for (const lesson of lessons) {
    assert.ok(pathwayById[lesson.pathwayId], `${lesson.id} has missing pathway`);
    assert.ok(lesson.duration > 0);
    assert.ok(lesson.sections.length >= 2);
    assert.ok(lesson.quiz.length >= 2);
    for (const question of lesson.quiz) {
      assert.ok(question.answers.length >= 3);
      assert.ok(question.correctIndex >= 0 && question.correctIndex < question.answers.length);
      assert.ok(unique(question.answers), `${question.id} contains duplicate answers`);
    }
  }
  for (const question of sqeQuestions) {
    assert.equal(question.answers.length, 5);
    assert.ok(question.correctIndex >= 0 && question.correctIndex < 5);
    assert.ok(lessonById[question.unitId]);
  }
});

test('SQE stage, station, and SRA coverage totals remain complete', () => {
  assert.deepEqual(sqeTotals, {
    flk1Subjects: 7,
    flk2Subjects: 7,
    sqe2Skills: 6,
    lessons: 137,
    practiceQuestions: 1068,
    sqe2Stations: 24,
  });
  assert.equal(stageSubjects('FLK1').length, 7);
  assert.equal(stageSubjects('FLK2').length, 7);
  assert.equal(stageSubjects('SQE2').length, 6);
  assert.equal(stationLessonIdsForSkill('sqe2-interview').length, 2);
  assert.equal(stationLessonIdsForSkill('sqe2-advocacy').length, 2);
  assert.equal(stationLessonIdsForSkill('sqe2-analysis').length, 5);
  assert.equal(sqe2Stations.filter((station) => station.includesNegotiation).length, 3);
  assert.equal(sraCoverage.requirements.length, 113);
  assert.ok(unique(sraCoverage.requirements.map((item) => item.id)));
});

test('blueprint allocation and generated mocks return exact, unique, balanced sets', () => {
  for (const stage of ['FLK1', 'FLK2']) {
    assert.deepEqual(allocateBlueprintCounts(stage, 180), examSubjectTargets[stage]);
    for (const count of [0, 1, 10, 30, 90, 180]) {
      const allocations = allocateBlueprintCounts(stage, count);
      assert.equal(Object.values(allocations).reduce((sum, value) => sum + value, 0), count);
      assert.ok(Object.values(allocations).every((value) => Number.isInteger(value) && value >= 0));
      const questions = buildBalancedTestQuestions(stage, count);
      assert.equal(questions.length, count);
      assert.ok(unique(questions.map((question) => question.id)));
      assert.ok(questions.every((question) => question.stage === stage));
    }
    const full = buildBalancedTestQuestions(stage, 180);
    const actual = Object.fromEntries(Object.keys(examSubjectTargets[stage]).map((subjectId) => [
      subjectId,
      full.filter((question) => question.subjectId === subjectId).length,
    ]));
    assert.deepEqual(actual, examSubjectTargets[stage]);
    assert.ok(questionsForStage(stage).length >= 180);
  }
  const subjectSet = buildBalancedTestQuestions('FLK1', 20, 'flk1-contract');
  assert.equal(subjectSet.length, 20);
  assert.ok(subjectSet.every((question) => question.subjectId === 'flk1-contract'));
  for (const unsafeCount of [-10, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.equal(Object.values(allocateBlueprintCounts('FLK1', unsafeCount)).reduce((sum, value) => sum + value, 0), 0);
    assert.deepEqual(buildBalancedTestQuestions('FLK1', unsafeCount), []);
  }
  assert.equal(buildBalancedTestQuestions('FLK1', 10.9).length, 10);
  assert.equal(buildBalancedTestQuestions('FLK1', 999).length, 180);
});

test('translations preserve answer keys and cover every installed curriculum string', () => {
  assert.equal(legalTranslationStringCount, 2103);
  const sourceLesson = lessons.find((lesson) => lesson.id === 'sources-of-law');
  assert.ok(sourceLesson);
  for (const language of ['en', 'zh', 'ar', 'es']) {
    const localized = localizeLesson(sourceLesson, language);
    assert.equal(localized.id, sourceLesson.id);
    assert.equal(localized.quiz.length, sourceLesson.quiz.length);
    assert.notEqual(localized.title, sourceLesson.title);
    for (let index = 0; index < sourceLesson.quiz.length; index += 1) {
      const sourceQuestion = sourceLesson.quiz[index];
      const translated = localizeQuestion(sourceQuestion, language);
      assert.equal(translated.correctIndex, sourceQuestion.correctIndex);
      assert.equal(translated.answers.length, sourceQuestion.answers.length);
    }
  }
  assert.equal(localizeLesson(sourceLesson, 'fa'), sourceLesson);
  for (const key of ['learn.level.practical', 'learn.level.beginner', 'learn.level.applied', 'learn.level.beginnerIntermediate']) {
    assert.match(fs.readFileSync(require.resolve('../src/i18n.tsx'), 'utf8'), new RegExp(`'${key.replaceAll('.', '\\.')}'`, 'g'));
  }
});

test('gamification XP, levels, missions, streaks, and achievements respect boundaries', () => {
  assert.equal(gamification.lessonXp(100, true), 70);
  assert.equal(gamification.lessonXp(-20, true), 50);
  assert.equal(gamification.lessonXp(200, true), 70);
  assert.equal(gamification.lessonXp(100, false), 8);
  assert.equal(gamification.reviewXp(true), 4);
  assert.equal(gamification.reviewXp(false), 2);
  assert.equal(gamification.testXp(7, 10, 'quick'), 41);
  assert.equal(gamification.testXp(7, 10, 'diagnostic'), 53);
  assert.equal(gamification.testXp(126, 180, 'fullMock'), 339);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const state = makeState({
    xp: 1000,
    dailyGoal: 2,
    completedLessons: ['a', 'b'],
    completionDates: { a: localDateKey(today), b: localDateKey(today) },
    activeDays: [localDateKey(yesterday), localDateKey(today)],
    testHistory: [{ completedAt: today.toISOString(), score: 75 }],
  });
  const profile = gamification.buildGameProfile(state);
  assert.equal(profile.level.level, 4);
  assert.equal(profile.streak, 2);
  assert.equal(profile.completedMissions, 3);
  assert.ok(profile.achievements.find((item) => item.id === 'accurate').unlocked);
  assert.ok(profile.achievements.find((item) => item.id === 'xp-1000').unlocked);
});

test('learning analytics calculate bounded progress and subject evidence', () => {
  const lesson = lessons.find((item) => item.pathwayId === 'flk1-business');
  assert.ok(lesson);
  const now = new Date();
  const state = makeState({
    completedLessons: [lesson.id],
    quizScores: { [lesson.id]: 80 },
    completionDates: { [lesson.id]: localDateKey(now) },
    activeDays: [localDateKey(now)],
    reviewQueue: [{ lessonId: lesson.id, questionId: 'q', dueAt: now.toISOString(), intervalDays: 1, strength: 60 }],
    testHistory: [{
      id: 'test-1',
      stage: 'FLK1',
      mode: 'quick',
      score: 70,
      correct: 7,
      total: 10,
      completedAt: now.toISOString(),
      durationSeconds: 300,
      subjectScores: { 'flk1-business': { correct: 7, total: 10, score: 70 } },
    }],
  });
  const analytics = buildLearningAnalytics(state, 'en-GB');
  assert.equal(analytics.averageQuiz, 80);
  assert.equal(analytics.averageTest, 70);
  assert.equal(analytics.reviewStrength, 60);
  assert.equal(analytics.studyMinutes, lesson.duration);
  assert.equal(analytics.activity.length, 7);
  assert.ok(analytics.readiness >= 0 && analytics.readiness <= 100);
  const business = analytics.subjectInsights.find((item) => item.id === 'flk1-business');
  assert.equal(business.evidenceCount, 2);
  assert.equal(business.score, 75);
  assert.equal(business.status, 'strong');
});

test('offline AI retrieval, safety identifiers, fallback, and empty-message errors work', async () => {
  const matches = findKnowledgeMatches('consideration contract', 3, 'en');
  assert.ok(matches.length > 0);
  assert.ok(matches.some((match) => match.englishTitle.toLocaleLowerCase().includes('consideration') || match.excerpts.length > 0));
  assert.equal(findKnowledgeMatches('the and what', 3, 'en').length, 0);
  assert.equal(privacySafeLearnerId('sara'), privacySafeLearnerId('sara'));
  assert.notEqual(privacySafeLearnerId('sara'), privacySafeLearnerId('sarah'));
  assert.match(privacySafeLearnerId('sara'), /^learner_[0-9a-f]{8}$/);

  const reply = await askStudyAssistant({
    messages: [{ id: '1', role: 'user', text: 'Explain consideration in contract law.' }],
    language: 'en',
    safetyId: 'learner_test',
  });
  assert.equal(reply.mode, 'offline');
  assert.ok(reply.sourceTitles.length > 0);
  assert.match(reply.text, /not legal advice/i);
  await assert.rejects(
    askStudyAssistant({ messages: [], language: 'en', safetyId: 'learner_test' }),
    /empty_message/,
  );
});

test('cloud schema and client retain required security boundaries', () => {
  const migration = fs.readFileSync('supabase/migrations/202607230001_cloud_accounts.sql', 'utf8');
  const cloud = fs.readFileSync('src/cloud.ts', 'utf8');
  const deletion = fs.readFileSync('supabase/functions/delete-account/index.ts', 'utf8');
  for (const table of ['profiles', 'learner_settings', 'learner_progress']) {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`));
  }
  assert.equal((migration.match(/\(select auth\.uid\(\)\) = user_id/g) || []).length, 15);
  assert.ok(!cloud.includes('SUPABASE_SERVICE_ROLE_KEY'));
  assert.ok(cloud.includes('persistSession: true'));
  assert.ok(cloud.includes('resetPasswordForEmail'));
  assert.ok(cloud.includes("provider: 'google'"));
  assert.ok(deletion.includes('auth.admin.deleteUser'));
  assert.ok(deletion.includes("request.headers.get('Authorization')"));
});

test('local sign-out locks the account without erasing credentials or progress', () => {
  const source = fs.readFileSync('src/store.tsx', 'utf8');
  const localBranch = source.match(/if \(!supabase\) \{[\s\S]*?\n    \}\n    if \(supabase\)/)?.[0] ?? '';
  assert.match(localBranch, /const signedOut = \{ \.\.\.stateRef\.current, authenticated: false \}/);
  assert.match(localBranch, /stateRef\.current = signedOut;[\s\S]*setState\(signedOut\);[\s\S]*return;/);
  assert.doesNotMatch(localBranch, /\.\.\.initialState/);
});

const waitForServer = (child) => new Promise((resolve, reject) => {
  let stderr = '';
  const timeout = setTimeout(() => reject(new Error(`AI proxy did not start${stderr ? `: ${stderr.trim()}` : ''}`)), 5_000);
  child.once('error', reject);
  child.once('exit', (code) => {
    clearTimeout(timeout);
    reject(new Error(`AI proxy exited before startup (${code})${stderr ? `: ${stderr.trim()}` : ''}`));
  });
  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });
  child.stdout.on('data', (chunk) => {
    if (chunk.toString().includes('AI proxy listening')) {
      clearTimeout(timeout);
      resolve();
    }
  });
});

test('AI proxy enforces health, origin, CORS, routing, and missing-key behavior', async () => {
  const port = 18787;
  const child = spawn(process.execPath, ['server/ai-chat.mjs'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      ALLOWED_ORIGINS: 'http://allowed.test',
      HOST: '127.0.0.1',
      OPENAI_API_KEY: '',
      PORT: String(port),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  try {
    await waitForServer(child);
    const allowed = await fetch(`http://127.0.0.1:${port}/health`, {
      headers: { Origin: 'http://allowed.test' },
    });
    assert.equal(allowed.status, 200);
    assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://allowed.test');
    assert.deepEqual(await allowed.json(), { ok: true, model: 'gpt-5.6-terra' });

    const rejected = await fetch(`http://127.0.0.1:${port}/health`, {
      headers: { Origin: 'http://blocked.test' },
    });
    assert.equal(rejected.status, 403);
    assert.equal(rejected.headers.get('access-control-allow-origin'), 'null');

    const preflight = await fetch(`http://127.0.0.1:${port}/ai/chat`, {
      method: 'OPTIONS',
      headers: { Origin: 'http://allowed.test' },
    });
    assert.equal(preflight.status, 204);

    const unavailable = await fetch(`http://127.0.0.1:${port}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'http://allowed.test' },
      body: JSON.stringify({ messages: [{ role: 'user', text: 'test' }] }),
    });
    assert.equal(unavailable.status, 503);
    assert.deepEqual(await unavailable.json(), { error: 'assistant_not_configured' });

    const missing = await fetch(`http://127.0.0.1:${port}/missing`);
    assert.equal(missing.status, 404);
    assert.equal(missing.headers.get('cache-control'), 'no-store');
  } finally {
    child.kill('SIGTERM');
  }
});

(async () => {
  let failures = 0;
  for (const { name, run } of tests) {
    try {
      await run();
      console.log(`PASS: ${name}`);
    } catch (error) {
      failures += 1;
      console.error(`FAIL: ${name}`);
      console.error(error);
    }
  }
  console.log(`Functional tests: ${tests.length - failures}/${tests.length} passed`);
  if (failures) process.exitCode = 1;
})();
