import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { createCredentialSalt, hashPin, normalizeUsername } from './auth';
import { calculateLegacyXp, lessonXp, localDateKey, reviewXp, testXp } from './gamification';
import type { AppLanguage } from './i18n';

export type ReviewRecord = {
  lessonId: string;
  questionId: string;
  dueAt: string;
  intervalDays: number;
  strength: number;
};

export type SubjectScore = { correct: number; total: number; score: number };
export type TestMode = 'quick' | 'diagnostic' | 'mock' | 'fullMock';
export type TestAttempt = { id: string; stage: 'FLK1' | 'FLK2'; mode: TestMode; score: number; correct: number; total: number; completedAt: string; durationSeconds: number; subjectScores?: Record<string, SubjectScore> };

export type ThemeMode = 'system' | 'light' | 'dark';

export type LearnerState = {
  hydrated: boolean;
  onboarded: boolean;
  authenticated: boolean;
  name: string;
  username: string;
  pinHash: string;
  pinSalt: string;
  termsAcceptedAt: string;
  dailyGoal: number;
  language: AppLanguage;
  xp: number;
  completedLessons: string[];
  savedLessons: string[];
  quizScores: Record<string, number>;
  completionDates: Record<string, string>;
  reviewQueue: ReviewRecord[];
  activeDays: string[];
  audioEnabled: boolean;
  soundEffectsEnabled: boolean;
  persianFirst: boolean;
  themeMode: ThemeMode;
  testHistory: TestAttempt[];
};

type SettingsPatch = Partial<Pick<LearnerState, 'name' | 'dailyGoal' | 'audioEnabled' | 'soundEffectsEnabled' | 'persianFirst' | 'themeMode' | 'language'>>;

type StoreValue = {
  state: LearnerState;
  registerAccount: (details: { name: string; username: string; pin: string; dailyGoal: number }) => void;
  authenticate: (username: string, pin: string) => boolean;
  signOut: () => void;
  completeLesson: (lessonId: string, score: number, questionIds: string[], missedQuestionIds: string[]) => void;
  reviewAnswer: (questionId: string, correct: boolean) => void;
  toggleSaved: (lessonId: string) => void;
  updateSettings: (patch: SettingsPatch) => void;
  recordTestAttempt: (attempt: Omit<TestAttempt, 'id' | 'completedAt'>) => void;
  resetProgress: () => Promise<void>;
  streak: number;
  completedToday: number;
};

const STORAGE_KEY = '@haghdan/learner-v1';

const initialState: LearnerState = {
  hydrated: false,
  onboarded: false,
  authenticated: false,
  name: '',
  username: '',
  pinHash: '',
  pinSalt: '',
  termsAcceptedAt: '',
  dailyGoal: 2,
  language: 'fa',
  xp: 0,
  completedLessons: [],
  savedLessons: [],
  quizScores: {},
  completionDates: {},
  reviewQueue: [],
  activeDays: [],
  audioEnabled: false,
  soundEffectsEnabled: true,
  persianFirst: true,
  themeMode: 'system',
  testHistory: [],
};

const todayKey = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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
        const restored: LearnerState = {
          ...initialState,
          ...saved,
          // Older saved profiles pre-date this setting. Only an explicit false
          // should mute feedback; a missing or malformed value stays audible.
          soundEffectsEnabled: saved.soundEffectsEnabled !== false,
          hydrated: true,
        };
        if (typeof saved.xp !== 'number') restored.xp = calculateLegacyXp(restored);
        restored.authenticated = Boolean(restored.authenticated && restored.username && restored.pinHash && restored.pinSalt);
        setState(restored);
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

  const registerAccount = useCallback(({ name, username, pin, dailyGoal }: { name: string; username: string; pin: string; dailyGoal: number }) => {
    const normalizedUsername = normalizeUsername(username);
    const pinSalt = createCredentialSalt();
    setState((current) => ({
      ...current,
      onboarded: true,
      authenticated: true,
      name: name.trim(),
      username: normalizedUsername,
      pinSalt,
      pinHash: hashPin(pin, pinSalt, normalizedUsername),
      termsAcceptedAt: new Date().toISOString(),
      dailyGoal,
    }));
  }, []);

  const authenticate = useCallback((username: string, pin: string) => {
    const normalizedUsername = normalizeUsername(username);
    if (!state.pinHash || !state.pinSalt || normalizedUsername !== state.username) return false;
    const accepted = hashPin(pin, state.pinSalt, normalizedUsername) === state.pinHash;
    if (accepted) setState((current) => ({ ...current, authenticated: true }));
    return accepted;
  }, [state.pinHash, state.pinSalt, state.username]);

  const signOut = useCallback(() => setState((current) => ({ ...current, authenticated: false })), []);

  const completeLesson = useCallback((lessonId: string, score: number, questionIds: string[], missedQuestionIds: string[]) => {
    setState((current) => {
      const today = todayKey();
      const firstCompletion = !current.completedLessons.includes(lessonId);
      const lessonsBeforeToday = Object.values(current.completionDates).filter((date) => date === today).length;
      const lessonsAfterToday = lessonsBeforeToday + (current.completionDates[lessonId] === today ? 0 : 1);
      const missionBonus = (lessonsBeforeToday < 1 && lessonsAfterToday >= 1 ? 20 : 0)
        + (lessonsBeforeToday < current.dailyGoal && lessonsAfterToday >= current.dailyGoal ? 35 : 0);
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
        xp: current.xp + lessonXp(score, firstCompletion) + missionBonus,
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
      xp: current.xp + reviewXp(correct),
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

  const recordTestAttempt = useCallback((attempt: Omit<TestAttempt, 'id' | 'completedAt'>) => {
    setState((current) => {
      const today = todayKey();
      const firstTestToday = !current.testHistory.some((item) => localDateKey(new Date(item.completedAt)) === today);
      return { ...current, xp: current.xp + testXp(attempt.correct, attempt.total, attempt.mode) + (firstTestToday ? 25 : 0), testHistory: [{ ...attempt, id: Date.now().toString(), completedAt: new Date().toISOString() }, ...current.testHistory].slice(0, 50), activeDays: Array.from(new Set([...current.activeDays, today])) };
    });
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
      registerAccount,
      authenticate,
      signOut,
      completeLesson,
      reviewAnswer,
      toggleSaved,
      updateSettings,
      recordTestAttempt,
      resetProgress,
      streak,
      completedToday,
    }),
    [state, registerAccount, authenticate, signOut, completeLesson, reviewAnswer, toggleSaved, updateSettings, recordTestAttempt, resetProgress, streak, completedToday],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useLearner() {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useLearner must be used inside LearnerProvider');
  return value;
}
