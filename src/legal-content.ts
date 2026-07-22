import type { Lesson, QuizQuestion } from './curriculum';
import type { AppLanguage } from './i18n';
import { legalContentPacks } from './legal-content-packs';

type TranslatedLanguage = Exclude<AppLanguage, 'fa'>;

const sourceIndex = new Map(legalContentPacks.source.map((source, index) => [source, index]));
const normalizeSource = (value: string) => value.replace(/\s*\n\s*/g, ' ');

export function localizeLegalText(value: string, language: AppLanguage) {
  if (language === 'fa') return value;
  const index = sourceIndex.get(normalizeSource(value));
  return index === undefined ? value : legalContentPacks.translations[language as TranslatedLanguage][index] ?? value;
}

export function localizeQuestion<T extends QuizQuestion>(question: T, language: AppLanguage): T {
  if (language === 'fa') return question;
  return {
    ...question,
    prompt: localizeLegalText(question.prompt, language),
    answers: question.answers.map((answer) => localizeLegalText(answer, language)),
    explanation: localizeLegalText(question.explanation, language),
  };
}

export function localizeLesson(lesson: Lesson, language: AppLanguage): Lesson {
  if (language === 'fa') return lesson;
  return {
    ...lesson,
    title: localizeLegalText(lesson.title, language),
    summary: localizeLegalText(lesson.summary, language),
    sections: lesson.sections.map((section) => ({
      ...section,
      title: localizeLegalText(section.title, language),
      body: localizeLegalText(section.body, language),
      callout: section.callout ? localizeLegalText(section.callout, language) : undefined,
      bullets: section.bullets?.map((entry) => localizeLegalText(entry, language)),
      example: section.example ? localizeLegalText(section.example, language) : undefined,
      checklist: section.checklist?.map((entry) => localizeLegalText(entry, language)),
      source: section.source ? localizeLegalText(section.source, language) : undefined,
      termFa: localizeLegalText(section.termFa, language),
    })),
    quiz: lesson.quiz.map((question) => localizeQuestion(question, language)),
  };
}

export const legalTranslationStringCount = legalContentPacks.stringCount;
export const legalTranslationStatus = legalContentPacks.status;
