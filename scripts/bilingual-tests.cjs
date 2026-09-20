const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }, fileName: filename }).outputText, filename);
const { normalizeLanguage } = require('../src/languages.ts');
const { remainingExamSeconds, elapsedExamSeconds } = require('../src/exam-time.ts');
assert.equal(remainingExamSeconds(10000, 1500), 9);
assert.equal(remainingExamSeconds(10000, 100000), 0, 'Suspending a tab must not stop exam time');
assert.equal(elapsedExamSeconds(9180, 9000), 180);
assert.equal(elapsedExamSeconds(9180, -50), 9180);
assert.equal(elapsedExamSeconds(9180, 9300), 0);
const { acknowledgeStudySection, normalizeStudyProgress, studyResumeSection } = require('../src/study-progress.ts');
const { authoredContent: contractContent } = require('../src/authored-content.ts');
const { localizeLesson, localizeQuestion } = require('../src/legal-content.ts');
const { lessonById, lessons } = require('../src/curriculum.ts');
const { sqeQuestions, buildAuthoredPracticeQuestions, buildFullMockQuestions } = require('../src/sqe.ts');
const { firstSessionTargets } = require('../src/sqe-spec.ts');
const { buildLearningAnalytics } = require('../src/analytics.ts');

for (const old of ['zh', 'ar', 'es', 'xx', 42]) assert.equal(normalizeLanguage(old), 'en');
assert.equal(normalizeLanguage('fa'), 'fa');
assert.equal(normalizeLanguage('en'), 'en');
assert.equal(normalizeLanguage(undefined), 'fa');

let progress = {};
progress = acknowledgeStudySection(progress, 'contract-formation', '2026-09-16.1', 0, 5, '2026-09-16T10:00:00Z');
assert.equal(studyResumeSection(progress['contract-formation'], '2026-09-16.1', 5), 1);
assert.equal(progress['contract-formation'].completedAt, null);
progress = JSON.parse(JSON.stringify(progress));
assert.deepEqual(normalizeStudyProgress(progress), progress);
for (let section = 1; section < 5; section++) progress = acknowledgeStudySection(progress, 'contract-formation', '2026-09-16.1', section, 5, '2026-09-16T10:10:00Z');
assert.equal(progress['contract-formation'].completedAt, '2026-09-16T10:10:00Z');
assert.equal(acknowledgeStudySection(progress, 'contract-formation', '2026-09-16.1', 4, 5)['contract-formation'].completedSections.length, 5);
assert.equal(studyResumeSection(progress['contract-formation'], 'new-edition', 5), 0);
assert.equal(acknowledgeStudySection(progress, 'contract-formation', 'new-edition', 0, 5)['contract-formation'].completedAt, null);
assert.equal(acknowledgeStudySection(progress, 'x', 'v1', 9, 2), progress);
assert.deepEqual(normalizeStudyProgress({ broken: { section: -1 } }), {});

const baseline = { quizScores: {}, completedLessons: [], reviewQueue: [], testHistory: [], activeDays: [], completionDates: {}, studyProgress: progress };
const analytics = buildLearningAnalytics(baseline, 'en-GB');
assert.equal(analytics.readingCompleted, 1);
assert.equal(analytics.averageQuiz, 0);
assert.equal(analytics.completedCount, 0);
assert.equal(analytics.readiness, 0, 'Reading is not assessment evidence');

let englishWords = 0;
assert.equal(buildAuthoredPracticeQuestions('FLK1', 1000).length, 24, 'Never pad authored practice with legacy questions');
assert.deepEqual(buildAuthoredPracticeQuestions('FLK2', 10), []);
for (const invalid of [-1, NaN, Infinity]) assert.deepEqual(buildAuthoredPracticeQuestions('FLK1', invalid), []);
assert.ok(buildAuthoredPracticeQuestions('FLK1', 10, 'flk1-contract').every(question => question.subjectId === 'flk1-contract' && question.id.startsWith('authored-')));
for (const stage of ['FLK1', 'FLK2']) {
  for (let run = 0; run < 10; run++) {
    const full = buildFullMockQuestions(stage);
    assert.equal(full.length, 180);
    assert.equal(new Set(full.map(question => question.id)).size, 180);
    const first = full.slice(0, 90);
    const second = full.slice(90);
    for (const [subject, count] of Object.entries(firstSessionTargets[stage])) {
      assert.equal(first.filter(question => question.subjectId === subject).length, count);
      if (subject !== 'flk2-accounts') assert.equal(second.filter(question => question.subjectId === subject).length, 0);
    }
    assert.ok(first.every(question => firstSessionTargets[stage][question.subjectId]));
  }
}
const prompts = new Set();
for (const unit of contractContent) {
  const source = lessonById[unit.id];
  assert.ok(source, unit.id);
  assert.equal(source.contentVersion, unit.version);
  assert.equal(unit.sections.en.length, unit.sections.fa.length);
  assert.ok(unit.sections.en.length >= 4);
  for (const language of ['en', 'fa']) {
    const localized = localizeLesson(source, language);
    assert.deepEqual(localized.sections, unit.sections[language]);
    assert.deepEqual(localized.quiz, unit.questions[language]);
    for (const section of localized.sections) {
      assert.ok(section.body.length >= 400);
      assert.ok(section.body.includes('\n\n'));
      if (language === 'en') {
        assert.doesNotMatch(section.body, /[\u0600-\u06ff]/);
        englishWords += section.body.split(/\s+/).length;
      } else assert.match(section.body, /[\u0600-\u06ff]/);
    }
  }
  for (const question of unit.questions.fa) {
    const bankQuestion = sqeQuestions.find(q => q.id === question.id);
    assert.ok(bankQuestion, question.id);
    const en = localizeQuestion(bankQuestion, 'en');
    assert.equal(question.correctIndex, en.correctIndex);
    assert.equal(en.answers.length, 5);
    assert.equal(new Set(en.answers).size, 5);
    assert.doesNotMatch(en.prompt + en.answers.join(' ') + en.explanation, /[\u0600-\u06ff]/);
    assert.ok(en.explanation.length > 150);
    assert.ok(!prompts.has(en.prompt));
    prompts.add(en.prompt);
  }
  for (const source of unit.sources) assert.equal(new URL(source.url).protocol, 'https:');
}
console.log(`PASS: language migration; persisted reading/resume/versioning; separate analytics; ${contractContent.length} bilingual units; ${prompts.size} unique authored questions; ${englishWords} English teaching words.`);
console.log('These checks validate structure and integration, not legal accuracy or full syllabus coverage.');
