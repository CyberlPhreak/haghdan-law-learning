import { contractContent } from './contract-content';
import { tortContent } from './tort-content';

export const authoredContent = [...contractContent, ...tortContent];
export const authoredUnits = Object.fromEntries(authoredContent.map(unit => [unit.id, unit]));
export const authoredSubject = Object.fromEntries([
  ...contractContent.map(unit => [unit.id, 'flk1-contract']),
  ...tortContent.map(unit => [unit.id, 'flk1-tort']),
]);
