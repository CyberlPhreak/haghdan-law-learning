import { lessons, pathways } from './curriculum';
import type { LearnerState } from './store';

export type ActivityDatum = { key: string; label: string; value: number; active: boolean };
export type SubjectInsight = {
  id: string;
  title: string;
  englishTitle: string;
  track: string;
  score: number;
  coverage: number;
  evidenceCount: number;
  status: 'strong' | 'developing' | 'focus';
};

export type LearningAnalytics = {
  readiness: number;
  mastery: number;
  averageQuiz: number;
  averageTest: number;
  reviewStrength: number;
  studyMinutes: number;
  completedCount: number;
  attemptedTests: number;
  activity: ActivityDatum[];
  subjectInsights: SubjectInsight[];
  strengths: SubjectInsight[];
  weaknesses: SubjectInsight[];
};

const average = (values: number[]) => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;

const dateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const statusFor = (score: number): SubjectInsight['status'] => score >= 75 ? 'strong' : score >= 60 ? 'developing' : 'focus';

export function buildLearningAnalytics(state: LearnerState, locale = 'fa-IR'): LearningAnalytics {
  const quizValues = Object.values(state.quizScores);
  const testValues = state.testHistory.map((attempt) => attempt.score);
  const averageQuiz = average(quizValues);
  const averageTest = average(testValues);
  const mastery = Math.round((state.completedLessons.length / Math.max(1, lessons.length)) * 100);
  const reviewStrength = average(state.reviewQueue.map((entry) => entry.strength));
  const studyMinutes = lessons.filter((lesson) => state.completedLessons.includes(lesson.id)).reduce((sum, lesson) => sum + lesson.duration, 0);

  const readinessSignals: Array<{ value: number; weight: number }> = [];
  if (testValues.length) readinessSignals.push({ value: averageTest, weight: 0.55 });
  if (quizValues.length) readinessSignals.push({ value: averageQuiz, weight: 0.3 });
  readinessSignals.push({ value: mastery, weight: testValues.length || quizValues.length ? 0.15 : 1 });
  const readinessWeight = readinessSignals.reduce((sum, signal) => sum + signal.weight, 0);
  const readiness = Math.round(readinessSignals.reduce((sum, signal) => sum + signal.value * signal.weight, 0) / readinessWeight);

  const subjectInsights = pathways.map<SubjectInsight>((pathway) => {
    const lessonScores = pathway.lessonIds.map((lessonId) => state.quizScores[lessonId]).filter((score): score is number => score !== undefined);
    const testScores = state.testHistory.flatMap((attempt) => {
      const result = attempt.subjectScores?.[pathway.id];
      return result ? [result.score] : [];
    });
    const evidence = [...lessonScores, ...testScores];
    const score = average(evidence);
    const completed = pathway.lessonIds.filter((lessonId) => state.completedLessons.includes(lessonId)).length;
    const coverage = Math.round((completed / Math.max(1, pathway.lessonIds.length)) * 100);
    return {
      id: pathway.id,
      title: pathway.title,
      englishTitle: pathway.englishTitle,
      track: pathway.track ?? 'EVERYDAY',
      score,
      coverage,
      evidenceCount: evidence.length,
      status: statusFor(score),
    };
  }).filter((insight) => insight.track === 'FLK1' || insight.track === 'FLK2');

  const measuredSubjects = subjectInsights.filter((insight) => insight.evidenceCount > 0);
  const strengths = [...measuredSubjects].filter((insight) => insight.score >= 70).sort((first, second) => second.score - first.score || second.coverage - first.coverage).slice(0, 3);
  const weaknesses = [...measuredSubjects].filter((insight) => insight.score < 70).sort((first, second) => first.score - second.score || first.coverage - second.coverage).slice(0, 3);

  const today = new Date();
  const activity = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const key = dateKey(date);
    const lessonsCompleted = Object.values(state.completionDates).filter((completionDate) => completionDate === key).length;
    const testsCompleted = state.testHistory.filter((attempt) => dateKey(new Date(attempt.completedAt)) === key).length;
    const active = state.activeDays.includes(key) || lessonsCompleted + testsCompleted > 0;
    return { key, label: new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date), value: lessonsCompleted + testsCompleted || (active ? 1 : 0), active };
  });

  return {
    readiness,
    mastery,
    averageQuiz,
    averageTest,
    reviewStrength,
    studyMinutes,
    completedCount: state.completedLessons.length,
    attemptedTests: state.testHistory.length,
    activity,
    subjectInsights,
    strengths,
    weaknesses,
  };
}
