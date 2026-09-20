import type { LessonSection, QuizQuestion } from './curriculum';

export type Bilingual<T> = { en: T; fa: T };
export type AuthoredUnit = {
  id: string;
  version: string;
  status: 'editorial-draft';
  objectives: Bilingual<string[]>;
  sections: Bilingual<LessonSection[]>;
  questions: Bilingual<QuizQuestion[]>;
  sources: Array<{ title: string; url: string }>;
};

export const section = (title: string, titleFa: string, body: string, bodyFa: string, term: string, termFa: string): Bilingual<LessonSection> => ({
  en: { title, body, termEn: term, termFa },
  fa: { title: titleFa, body: bodyFa, termEn: term, termFa },
});

export const question = (id: string, prompt: string, promptFa: string, answers: string[], answersFa: string[], correctIndex: number, explanation: string, explanationFa: string): Bilingual<QuizQuestion> => ({
  en: { id, prompt, answers, correctIndex, explanation },
  fa: { id, prompt: promptFa, answers: answersFa, correctIndex, explanation: explanationFa },
});

export function unit(id: string, objectives: Bilingual<string[]>, sections: Bilingual<LessonSection>[], questions: Bilingual<QuizQuestion>[], sources: AuthoredUnit['sources']): AuthoredUnit {
  return { id, version: '2026-09-16.1', status: 'editorial-draft', objectives,
    sections: { en: sections.map(s => s.en), fa: sections.map(s => s.fa) },
    questions: { en: questions.map(q => q.en), fa: questions.map(q => q.fa) }, sources };
}
