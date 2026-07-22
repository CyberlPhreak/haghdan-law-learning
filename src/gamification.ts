import type { TestMode } from './store';

export type GameLevel = {
  level: number;
  title: string;
  threshold: number;
  icon: 'compass' | 'book-open' | 'search' | 'edit-3' | 'target' | 'layers' | 'award';
};

export type DailyMission = {
  id: 'first-lesson' | 'daily-goal' | 'practice';
  title: string;
  description: string;
  progress: number;
  target: number;
  xp: number;
  icon: 'book-open' | 'check-circle' | 'edit-3';
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: 'flag' | 'book-open' | 'layers' | 'edit-3' | 'target' | 'activity' | 'zap' | 'award';
  unlocked: boolean;
};

type GameState = {
  xp: number;
  dailyGoal: number;
  completedLessons: string[];
  completionDates: Record<string, string>;
  activeDays: string[];
  testHistory: Array<{ completedAt: string; score: number }>;
};

export const gameLevels: GameLevel[] = [
  { level: 1, title: 'شروع‌کننده', threshold: 0, icon: 'compass' },
  { level: 2, title: 'کاوشگر حقوق', threshold: 150, icon: 'book-open' },
  { level: 3, title: 'تحلیل‌گر', threshold: 400, icon: 'search' },
  { level: 4, title: 'استدلال‌گر', threshold: 800, icon: 'edit-3' },
  { level: 5, title: 'راهبردگر', threshold: 1400, icon: 'target' },
  { level: 6, title: 'پژوهشگر', threshold: 2200, icon: 'layers' },
  { level: 7, title: 'حق‌دان پیشرو', threshold: 3400, icon: 'award' },
];

export const lessonXp = (score: number, firstCompletion: boolean) =>
  firstCompletion ? 50 + Math.floor(Math.max(0, Math.min(100, score)) / 5) : 8;

export const reviewXp = (correct: boolean) => correct ? 4 : 2;

export const testXp = (correct: number, total: number, mode: TestMode) => {
  const accuracyBonus = total > 0 && correct / total >= 0.7 ? 15 : 0;
  const formatBonus = mode === 'fullMock' ? 60 : mode === 'mock' ? 25 : mode === 'diagnostic' ? 12 : 0;
  return 12 + correct * 2 + accuracyBonus + formatBonus;
};

export const localDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const calculateLegacyXp = (state: Omit<GameState, 'xp'>) => {
  const lessonPoints = state.completedLessons.reduce((sum, lessonId) => {
    const hasCompletionDate = Boolean(state.completionDates[lessonId]);
    return sum + (hasCompletionDate ? 60 : 50);
  }, 0);
  const testPoints = state.testHistory.reduce((sum, attempt) => sum + 12 + Math.round(attempt.score / 5), 0);
  return lessonPoints + testPoints;
};

const currentLevelFor = (xp: number) =>
  [...gameLevels].reverse().find((level) => xp >= level.threshold) ?? gameLevels[0]!;

const consecutiveDays = (activeDays: string[]) => {
  const unique = new Set(activeDays);
  let cursor = new Date();
  let streak = 0;
  if (!unique.has(localDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (unique.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

export function buildGameProfile(state: GameState) {
  const today = localDateKey();
  const completedToday = Object.values(state.completionDates).filter((date) => date === today).length;
  const testsToday = state.testHistory.filter((attempt) => localDateKey(new Date(attempt.completedAt)) === today).length;
  const streak = consecutiveDays(state.activeDays);
  const level = currentLevelFor(state.xp);
  const nextLevel = gameLevels.find((item) => item.level === level.level + 1);
  const levelSpan = nextLevel ? nextLevel.threshold - level.threshold : 1;
  const levelProgress = nextLevel ? Math.round(((state.xp - level.threshold) / levelSpan) * 100) : 100;

  const missions: DailyMission[] = [
    { id: 'first-lesson', title: 'شروع قدرتمند', description: 'یک درس کوتاه را امروز کامل کنید.', progress: Math.min(1, completedToday), target: 1, xp: 20, icon: 'book-open' },
    { id: 'daily-goal', title: 'هدف روزانه', description: `${state.dailyGoal} درس را تا پایان امروز کامل کنید.`, progress: Math.min(state.dailyGoal, completedToday), target: state.dailyGoal, xp: 35, icon: 'check-circle' },
    { id: 'practice', title: 'تمرین فعال', description: 'یک تمرین یا آزمون را به پایان برسانید.', progress: Math.min(1, testsToday), target: 1, xp: 25, icon: 'edit-3' },
  ];

  const bestScore = Math.max(0, ...state.testHistory.map((attempt) => attempt.score));
  const achievements: Achievement[] = [
    { id: 'first-step', title: 'اولین گام', description: 'اولین درس را کامل کنید.', icon: 'flag', unlocked: state.completedLessons.length >= 1 },
    { id: 'reader-5', title: 'پنج مفهوم', description: 'پنج درس را کامل کنید.', icon: 'book-open', unlocked: state.completedLessons.length >= 5 },
    { id: 'reader-15', title: 'کتابخانه در حرکت', description: 'پانزده درس را کامل کنید.', icon: 'layers', unlocked: state.completedLessons.length >= 15 },
    { id: 'first-test', title: 'ورود به میدان', description: 'اولین آزمون را ثبت کنید.', icon: 'edit-3', unlocked: state.testHistory.length >= 1 },
    { id: 'accurate', title: 'دقت هفتاد', description: 'در یک آزمون حداقل ۷۰٪ بگیرید.', icon: 'target', unlocked: bestScore >= 70 },
    { id: 'streak-3', title: 'سه روز پیوسته', description: 'سه روز متوالی فعال باشید.', icon: 'activity', unlocked: streak >= 3 },
    { id: 'streak-7', title: 'هفته طلایی', description: 'هفت روز متوالی فعال باشید.', icon: 'zap', unlocked: streak >= 7 },
    { id: 'xp-1000', title: 'هزار امتیاز', description: 'به ۱۰۰۰ XP برسید.', icon: 'award', unlocked: state.xp >= 1000 },
  ];

  return {
    xp: state.xp,
    level,
    nextLevel,
    levelProgress,
    xpToNext: nextLevel ? Math.max(0, nextLevel.threshold - state.xp) : 0,
    streak,
    missions,
    completedMissions: missions.filter((mission) => mission.progress >= mission.target).length,
    achievements,
    unlockedAchievements: achievements.filter((achievement) => achievement.unlocked).length,
  };
}
