import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type ReviewRecord = {
  lessonId: string;
  questionId: string;
  dueAt: string;
  intervalDays: number;
  strength: number;
};

export type LearnerState = {
  hydrated: boolean;
  onboarded: boolean;
  name: string;
  dailyGoal: number;
  completedLessons: string[];
  savedLessons: string[];
  quizScores: Record<string, number>;
  completionDates: Record<string, string>;
  reviewQueue: ReviewRecord[];
  activeDays: string[];
  audioEnabled: boolean;
  persianFirst: boolean;
};

type SettingsPatch = Partial<Pick<LearnerState, 'name' | 'dailyGoal' | 'audioEnabled' | 'persianFirst'>>;

type StoreValue = {
  state: LearnerState;
  finishOnboarding: (name: string, dailyGoal: number) => void;
  completeLesson: (lessonId: string, score: number, questionIds: string[], missedQuestionIds: string[]) => void;
  reviewAnswer: (questionId: string, correct: boolean) => void;
  toggleSaved: (lessonId: string) => void;
  updateSettings: (patch: SettingsPatch) => void;
  resetProgress: () => Promise<void>;
  streak: number;
  completedToday: number;
};

const STORAGE_KEY = '@haghdan/learner-v1';

const initialState: LearnerState = {
  hydrated: false,
  onboarded: false,
  name: '',
  dailyGoal: 2,
  completedLessons: [],
  savedLessons: [],
  quizScores: {},
  completionDates: {},
  reviewQueue: [],
  activeDays: [],
  audioEnabled: false,
  persianFirst: true,
};

const todayKey = () => new Date().toISOString().slice(0, 10);

const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

const calculateStreak = (days: string[]) => {
  const unique = new Set(days);
  let cursor = new Date();
  let value = 0;
  const today = cursor.toISOString().slice(0, 10);
  if (!unique.has(today)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (unique.has(cursor.toISOString().slice(0, 10))) {
    value += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return value;
};

const StoreContext = createContext<StoreValue | null>(null);

export function LearnerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LearnerState>(initialState);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!mounted) return;
        if (!raw) {
          setState({ ...initialState, hydrated: true });
          return;
        }
        const saved = JSON.parse(raw) as Partial<LearnerState>;
        setState({ ...initialState, ...saved, hydrated: true });
      })
      .catch(() => {
        if (mounted) setState({ ...initialState, hydrated: true });
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    const { hydrated: _hydrated, ...persisted } = state;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persisted)).catch(() => undefined);
  }, [state]);

  const finishOnboarding = useCallback((name: string, dailyGoal: number) => {
    setState((current) => ({
      ...current,
      onboarded: true,
      name: name.trim() || 'همراه حق‌دان',
      dailyGoal,
    }));
  }, []);

  const completeLesson = useCallback((lessonId: string, score: number, questionIds: string[], missedQuestionIds: string[]) => {
    setState((current) => {
      const today = todayKey();
      const remaining = current.reviewQueue.filter((item) => item.lessonId !== lessonId);
      const created = questionIds.map<ReviewRecord>((questionId) => {
        const missed = missedQuestionIds.includes(questionId);
        return {
          lessonId,
          questionId,
          dueAt: missed ? new Date().toISOString() : addDays(1),
          intervalDays: 1,
          strength: missed ? 28 : 55,
        };
      });
      return {
        ...current,
        completedLessons: Array.from(new Set([...current.completedLessons, lessonId])),
        quizScores: { ...current.quizScores, [lessonId]: score },
        completionDates: { ...current.completionDates, [lessonId]: today },
        reviewQueue: [...remaining, ...created],
        activeDays: Array.from(new Set([...current.activeDays, today])),
      };
    });
  }, []);

  const reviewAnswer = useCallback((questionId: string, correct: boolean) => {
    setState((current) => ({
      ...current,
      reviewQueue: current.reviewQueue.map((item) => {
        if (item.questionId !== questionId) return item;
        const intervalDays = correct ? Math.min(30, Math.max(2, Math.round(item.intervalDays * 2.5))) : 1;
        return {
          ...item,
          intervalDays,
          strength: Math.max(12, Math.min(100, item.strength + (correct ? 18 : -16))),
          dueAt: addDays(intervalDays),
        };
      }),
      activeDays: Array.from(new Set([...current.activeDays, todayKey()])),
    }));
  }, []);

  const toggleSaved = useCallback((lessonId: string) => {
    setState((current) => ({
      ...current,
      savedLessons: current.savedLessons.includes(lessonId)
        ? current.savedLessons.filter((id) => id !== lessonId)
        : [...current.savedLessons, lessonId],
    }));
  }, []);

  const updateSettings = useCallback((patch: SettingsPatch) => {
    setState((current) => ({ ...current, ...patch }));
  }, []);

  const resetProgress = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setState({ ...initialState, hydrated: true });
  }, []);

  const streak = useMemo(() => calculateStreak(state.activeDays), [state.activeDays]);
  const completedToday = useMemo(
    () => Object.values(state.completionDates).filter((date) => date === todayKey()).length,
    [state.completionDates],
  );

  const value = useMemo<StoreValue>(
    () => ({
      state,
      finishOnboarding,
      completeLesson,
      reviewAnswer,
      toggleSaved,
      updateSettings,
      resetProgress,
      streak,
      completedToday,
    }),
    [state, finishOnboarding, completeLesson, reviewAnswer, toggleSaved, updateSettings, resetProgress, streak, completedToday],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useLearner() {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useLearner must be used inside LearnerProvider');
  return value;
}
