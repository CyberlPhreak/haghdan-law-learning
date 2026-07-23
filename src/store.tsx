import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { createCredentialSalt, hashPin, normalizeUsername } from './auth';
import {
  changePassword as changeCloudPassword,
  cloudConfigured,
  createSessionFromUrl,
  deleteCloudAccount,
  fetchCloudSnapshot,
  resendVerification as resendCloudVerification,
  resetCloudProgress,
  sendPasswordReset as sendCloudPasswordReset,
  signInWithEmail,
  signInWithGoogle as signInWithGoogleCloud,
  signUpWithEmail,
  supabase,
  syncCloudState,
  type AuthResult,
  type CloudSnapshot,
  type Session,
  type User,
} from './cloud';
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
  accountMode: 'local' | 'cloud';
  userId: string;
  email: string;
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
  cloud: CloudMeta;
  registerAccount: (details: { name: string; username: string; pin?: string; email?: string; password?: string; dailyGoal: number }) => Promise<AuthResult>;
  authenticate: (identifier: string, credential: string) => Promise<AuthResult>;
  signInWithGoogle: (termsAcceptedAt: string) => Promise<AuthResult>;
  resendVerification: (email: string) => Promise<AuthResult>;
  sendPasswordReset: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  completeLesson: (lessonId: string, score: number, questionIds: string[], missedQuestionIds: string[]) => void;
  reviewAnswer: (questionId: string, correct: boolean) => void;
  toggleSaved: (lessonId: string) => void;
  updateSettings: (patch: SettingsPatch) => void;
  recordTestAttempt: (attempt: Omit<TestAttempt, 'id' | 'completedAt'>) => void;
  resetProgress: () => Promise<void>;
  deleteAccount: () => Promise<AuthResult>;
  streak: number;
  completedToday: number;
};

export type CloudMeta = {
  configured: boolean;
  checking: boolean;
  pendingVerificationEmail: string;
  recoveryMode: boolean;
  syncStatus: 'offline' | 'idle' | 'syncing' | 'synced' | 'error';
  lastSyncedAt: string;
  error: string;
};

const STORAGE_KEY = '@haghdan/learner-v1';

const initialState: LearnerState = {
  hydrated: false,
  onboarded: false,
  authenticated: false,
  accountMode: 'local',
  userId: '',
  email: '',
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

const progressResetPatch = {
  xp: 0,
  completedLessons: [] as string[],
  savedLessons: [] as string[],
  quizScores: {} as Record<string, number>,
  completionDates: {} as Record<string, string>,
  reviewQueue: [] as ReviewRecord[],
  activeDays: [] as string[],
  testHistory: [] as TestAttempt[],
};

const hasProgress = (state: LearnerState) => (
  state.xp > 0
  || state.completedLessons.length > 0
  || state.savedLessons.length > 0
  || state.testHistory.length > 0
);

const stateFromCloud = (
  current: LearnerState,
  snapshot: CloudSnapshot,
  session: Session,
): LearnerState => {
  const profile = snapshot.profile;
  const settings = snapshot.settings;
  const progress = snapshot.progress;
  const metadata = session.user.user_metadata ?? {};
  return {
    ...current,
    hydrated: true,
    onboarded: true,
    authenticated: true,
    accountMode: 'cloud',
    userId: session.user.id,
    email: session.user.email ?? '',
    name: profile?.display_name || metadata.full_name || metadata.name || current.name || 'Learner',
    username: profile?.username || metadata.username || current.username || `learner_${session.user.id.slice(0, 8)}`,
    pinHash: '',
    pinSalt: '',
    termsAcceptedAt: profile?.terms_accepted_at || current.termsAcceptedAt || new Date().toISOString(),
    dailyGoal: settings?.daily_goal ?? current.dailyGoal,
    language: settings?.language ?? current.language,
    audioEnabled: settings?.audio_enabled ?? current.audioEnabled,
    soundEffectsEnabled: settings?.sound_effects_enabled ?? current.soundEffectsEnabled,
    persianFirst: settings?.persian_first ?? current.persianFirst,
    themeMode: settings?.theme_mode ?? current.themeMode,
    xp: progress?.xp ?? 0,
    completedLessons: progress?.completed_lessons ?? [],
    savedLessons: progress?.saved_lessons ?? [],
    quizScores: progress?.quiz_scores ?? {},
    completionDates: progress?.completion_dates ?? {},
    reviewQueue: progress?.review_queue ?? [],
    activeDays: progress?.active_days ?? [],
    testHistory: progress?.test_history ?? [],
  };
};

export function LearnerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LearnerState>(initialState);
  const stateRef = useRef(state);
  const [cloudUser, setCloudUser] = useState<User | null>(null);
  const [cloud, setCloud] = useState<CloudMeta>({
    configured: cloudConfigured,
    checking: cloudConfigured,
    pendingVerificationEmail: '',
    recoveryMode: false,
    syncStatus: cloudConfigured ? 'idle' : 'offline',
    lastSyncedAt: '',
    error: '',
  });

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

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
        restored.authenticated = cloudConfigured
          ? false
          : Boolean(restored.authenticated && restored.username && restored.pinHash && restored.pinSalt);
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

  useEffect(() => {
    if (!state.hydrated || !supabase) return undefined;
    let mounted = true;

    const applySession = async (session: Session | null, event?: string) => {
      if (!mounted) return;
      if (!session) {
        setCloudUser(null);
        setState((current) => ({ ...current, authenticated: false }));
        setCloud((current) => ({
          ...current,
          checking: false,
          recoveryMode: event === 'PASSWORD_RECOVERY' ? true : current.recoveryMode,
          syncStatus: 'idle',
        }));
        return;
      }

      setCloud((current) => ({ ...current, checking: true, error: '', recoveryMode: event === 'PASSWORD_RECOVERY' || current.recoveryMode }));
      try {
        const current = stateRef.current;
        const snapshot = await fetchCloudSnapshot(session.user.id);
        const migrateLocal = !current.userId
          && current.onboarded
          && Boolean(current.name || current.username || hasProgress(current));
        let next = stateFromCloud(current, snapshot, session);
        if (migrateLocal) {
          next = {
            ...current,
            hydrated: true,
            onboarded: true,
            authenticated: true,
            accountMode: 'cloud',
            userId: session.user.id,
            email: session.user.email ?? current.email,
            name: current.name || next.name,
            username: current.username || next.username,
            pinHash: '',
            pinSalt: '',
            termsAcceptedAt: current.termsAcceptedAt || next.termsAcceptedAt,
          };
          await syncCloudState(next, session.user);
        }
        if (!mounted) return;
        stateRef.current = next;
        setState(next);
        setCloudUser(session.user);
        setCloud((currentMeta) => ({
          ...currentMeta,
          checking: false,
          pendingVerificationEmail: '',
          syncStatus: 'synced',
          lastSyncedAt: new Date().toISOString(),
          error: '',
        }));
      } catch (error) {
        if (!mounted) return;
        setCloudUser(session.user);
        setState((current) => ({
          ...current,
          authenticated: true,
          accountMode: 'cloud',
          userId: session.user.id,
          email: session.user.email ?? current.email,
          pinHash: '',
          pinSalt: '',
        }));
        setCloud((current) => ({
          ...current,
          checking: false,
          syncStatus: 'error',
          error: error instanceof Error ? error.message : 'cloud_sync_failed',
        }));
      }
    };

    const consumeUrl = async (url: string | null) => {
      if (!url || (!url.includes('auth/callback') && !url.includes('auth/recovery'))) return;
      if (url.includes('auth/recovery')) {
        setCloud((current) => ({ ...current, recoveryMode: true }));
      }
      try {
        const session = await createSessionFromUrl(url);
        if (session) await applySession(session, url.includes('auth/recovery') ? 'PASSWORD_RECOVERY' : 'SIGNED_IN');
      } catch (error) {
        if (mounted) {
          setCloud((current) => ({
            ...current,
            checking: false,
            error: error instanceof Error ? error.message : 'auth_link_failed',
          }));
        }
      }
    };

    const listener = Linking.addEventListener('url', ({ url }) => {
      void consumeUrl(url);
    });
    void Linking.getInitialURL().then(consumeUrl);
    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setCloud((current) => ({ ...current, checking: false, error: error.message }));
      } else {
        void applySession(data.session);
      }
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setTimeout(() => {
        void applySession(session, event);
      }, 0);
    });

    return () => {
      mounted = false;
      listener.remove();
      authListener.subscription.unsubscribe();
    };
  }, [state.hydrated]);

  useEffect(() => {
    if (!cloudUser || !state.hydrated || !state.authenticated || state.accountMode !== 'cloud') return undefined;
    const timeout = setTimeout(() => {
      setCloud((current) => ({ ...current, syncStatus: 'syncing', error: '' }));
      void syncCloudState(state, cloudUser)
        .then((timestamp) => {
          setCloud((current) => ({ ...current, syncStatus: 'synced', lastSyncedAt: timestamp, error: '' }));
        })
        .catch((error) => {
          setCloud((current) => ({
            ...current,
            syncStatus: 'error',
            error: error instanceof Error ? error.message : 'cloud_sync_failed',
          }));
        });
    }, 900);
    return () => clearTimeout(timeout);
  }, [cloudUser, state]);

  const registerAccount = useCallback(async ({
    name,
    username,
    pin,
    email,
    password,
    dailyGoal,
  }: {
    name: string;
    username: string;
    pin?: string;
    email?: string;
    password?: string;
    dailyGoal: number;
  }): Promise<AuthResult> => {
    const normalizedUsername = normalizeUsername(username);
    const termsAcceptedAt = new Date().toISOString();
    if (cloudConfigured) {
      if (!email || !password) return { ok: false, status: 'error', message: 'email_and_password_required' };
      setState((current) => ({
        ...current,
        onboarded: true,
        authenticated: false,
        accountMode: 'cloud',
        userId: '',
        email: email.trim().toLocaleLowerCase('en-US'),
        name: name.trim(),
        username: normalizedUsername,
        pinSalt: '',
        pinHash: '',
        termsAcceptedAt,
        dailyGoal,
      }));
      const result = await signUpWithEmail({
        email,
        password,
        displayName: name,
        username: normalizedUsername,
        termsAcceptedAt,
      });
      if (result.ok && result.status === 'verificationSent') {
        setCloud((current) => ({ ...current, pendingVerificationEmail: email.trim().toLocaleLowerCase('en-US'), error: '' }));
      }
      return result;
    }
    if (!pin) return { ok: false, status: 'error', message: 'pin_required' };
    const pinSalt = createCredentialSalt();
    setState((current) => ({
      ...current,
      onboarded: true,
      authenticated: true,
      accountMode: 'local',
      name: name.trim(),
      username: normalizedUsername,
      pinSalt,
      pinHash: hashPin(pin, pinSalt, normalizedUsername),
      termsAcceptedAt,
      dailyGoal,
    }));
    return { ok: true, status: 'signedIn' };
  }, []);

  const authenticate = useCallback(async (identifier: string, credential: string): Promise<AuthResult> => {
    if (cloudConfigured) return signInWithEmail(identifier, credential);
    const normalizedUsername = normalizeUsername(identifier);
    const current = stateRef.current;
    if (!current.pinHash || !current.pinSalt || normalizedUsername !== current.username) {
      return { ok: false, status: 'error', message: 'invalid_credentials' };
    }
    const accepted = hashPin(credential, current.pinSalt, normalizedUsername) === current.pinHash;
    if (!accepted) return { ok: false, status: 'error', message: 'invalid_credentials' };
    setState((saved) => ({ ...saved, authenticated: true }));
    return { ok: true, status: 'signedIn' };
  }, []);

  const signInWithGoogle = useCallback((termsAcceptedAt: string) => {
    setState((current) => ({
      ...current,
      onboarded: true,
      accountMode: 'cloud',
      termsAcceptedAt: current.termsAcceptedAt || termsAcceptedAt,
    }));
    return signInWithGoogleCloud();
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    const result = await resendCloudVerification(email);
    if (result.ok) setCloud((current) => ({ ...current, pendingVerificationEmail: email, error: '' }));
    return result;
  }, []);

  const sendPasswordReset = useCallback((email: string) => sendCloudPasswordReset(email), []);

  const updatePassword = useCallback(async (password: string) => {
    const result = await changeCloudPassword(password);
    if (result.ok) setCloud((current) => ({ ...current, recoveryMode: false, error: '' }));
    return result;
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) {
      const signedOut = { ...stateRef.current, authenticated: false };
      stateRef.current = signedOut;
      setState(signedOut);
      return;
    }
    if (supabase) await supabase.auth.signOut();
    const current = stateRef.current;
    const cleared = {
      ...initialState,
      hydrated: true,
      language: current.language,
      audioEnabled: current.audioEnabled,
      soundEffectsEnabled: current.soundEffectsEnabled,
      persianFirst: current.persianFirst,
      themeMode: current.themeMode,
    };
    stateRef.current = cleared;
    setCloudUser(null);
    setState(cleared);
    setCloud((currentMeta) => ({
      ...currentMeta,
      pendingVerificationEmail: '',
      recoveryMode: false,
      syncStatus: cloudConfigured ? 'idle' : 'offline',
      lastSyncedAt: '',
      error: '',
    }));
  }, []);

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
    const current = stateRef.current;
    if (current.accountMode === 'cloud' && current.userId) await resetCloudProgress(current.userId);
    setState((saved) => ({ ...saved, ...progressResetPatch }));
  }, []);

  const deleteAccount = useCallback(async (): Promise<AuthResult> => {
    try {
      if (stateRef.current.accountMode === 'cloud' && stateRef.current.userId) {
        await deleteCloudAccount();
      }
      await AsyncStorage.removeItem(STORAGE_KEY);
      const cleared = { ...initialState, hydrated: true };
      stateRef.current = cleared;
      setCloudUser(null);
      setState(cleared);
      setCloud((current) => ({
        ...current,
        pendingVerificationEmail: '',
        recoveryMode: false,
        syncStatus: cloudConfigured ? 'idle' : 'offline',
        lastSyncedAt: '',
        error: '',
      }));
      return { ok: true, status: 'deleted' };
    } catch (error) {
      return {
        ok: false,
        status: 'error',
        message: error instanceof Error ? error.message : 'delete_account_failed',
      };
    }
  }, []);

  const streak = useMemo(() => calculateStreak(state.activeDays), [state.activeDays]);
  const completedToday = useMemo(
    () => Object.values(state.completionDates).filter((date) => date === todayKey()).length,
    [state.completionDates],
  );

  const value = useMemo<StoreValue>(
    () => ({
      state,
      cloud,
      registerAccount,
      authenticate,
      signInWithGoogle,
      resendVerification,
      sendPasswordReset,
      updatePassword,
      signOut,
      completeLesson,
      reviewAnswer,
      toggleSaved,
      updateSettings,
      recordTestAttempt,
      resetProgress,
      deleteAccount,
      streak,
      completedToday,
    }),
    [state, cloud, registerAccount, authenticate, signInWithGoogle, resendVerification, sendPasswordReset, updatePassword, signOut, completeLesson, reviewAnswer, toggleSaved, updateSettings, recordTestAttempt, resetProgress, deleteAccount, streak, completedToday],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useLearner() {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useLearner must be used inside LearnerProvider');
  return value;
}
