const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, filename);
const { sqeLessons, sqePathways, sqeQuestions } = require('../src/sqe.ts');
const { authoredUnits } = require('../src/authored-content.ts');
const rows = sqePathways.map(path => {
  const units = sqeLessons.filter(lesson => lesson.pathwayId === path.id);
  return { subject: path.englishTitle, totalUnits: units.length, authoredBilingualDrafts: units.filter(unit => authoredUnits[unit.id]).length,
    unitsNeedingExpansionOrSeparateStationReview: units.filter(unit => !authoredUnits[unit.id]).map(unit => unit.id),
    subtopicCoverage: 'not yet independently verified, including units with authored drafts', independentLegalReview: 'pending' };
});
console.log(JSON.stringify({ status: 'NOT_READY_FOR_PUBLICATION', syllabusReference: 'SRA specification applicable from 1 September 2026',
  authoredScenarioQuestions: sqeQuestions.filter(q => q.id.startsWith('authored-')).length,
  legacyGeneratedQuestionsNeedingReplacement: sqeQuestions.filter(q => !q.id.startsWith('authored-')).length,
  blockers: ['Legacy question replacement', 'Subtopic-level teaching and assessment mapping', 'Independent bilingual legal review', 'FLK2 accounts questions need wills/property scenario classification', 'SQE2 station and rubric review'],
  note: 'Coverage is not established by counts. Map every current SRA subtopic to substantive teaching and reviewed assessment evidence. SQE2 stations need rubric and legal review.', subjects: rows }, null, 2));
if (process.argv.includes('--release')) process.exitCode = 1;
