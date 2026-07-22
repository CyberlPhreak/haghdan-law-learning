const fs = require('node:fs');
const path = require('node:path');

const subjects = [
  'flk1-tort', 'flk1-public', 'flk1-services', 'flk2-accounts', 'flk2-land',
  'flk2-trusts', 'flk2-criminal-practice', 'sqe2-advocacy', 'sqe2-analysis',
  'sqe2-research', 'sqe2-writing', 'sqe2-drafting', 'foundations', 'housing',
  'employment', 'immigration', 'police',
];

for (const subject of subjects) {
  const source = path.join('assets', 'subjects', `${subject}.jpg`);
  const target = path.join('src', `art-${subject}.ts`);
  const dataUri = `data:image/jpeg;base64,${fs.readFileSync(source).toString('base64')}`;
  fs.writeFileSync(target, `const image = '${dataUri}';\nexport default image;\n`);
}

console.log(`Embedded ${subjects.length} subject artworks.`);
