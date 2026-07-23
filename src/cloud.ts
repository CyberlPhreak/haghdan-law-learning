import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';
import { createClient, processLock, type Session, type User } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

import type { LearnerState } from './store';

WebBrowser.maybeCompleteAuthSession();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? '';

export const cloudConfigured = /^https:\/\/.+\.supabase\.co$/i.test(supabaseUrl) && supabasePublishableKey.length > 20;

export const supabase = cloudConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        lock: processLock,
        flowType: 'implicit',
      },
    })
  : null;

if (supabase && Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}

export const authCallbackUrl = makeRedirectUri({ scheme: 'haghdan', path: 'auth/callback' });
export const passwordRecoveryUrl = makeRedirectUri({ scheme: 'haghdan', path: 'auth/recovery' });

export type AuthResult =
  | { ok: true; status: 'signedIn' | 'verificationSent' | 'resetSent' | 'passwordUpdated' | 'cancelled' | 'deleted' }
  | { ok: false; status: 'error'; message: string };

export type CloudSnapshot = {
  profile: {
    display_name: string;
    username: string;
    terms_accepted_at: string | null;
    updated_at: string;
  } | null;
  settings: {
    daily_goal: number;
    language: LearnerState['language'];
    audio_enabled: boolean;
    sound_effects_enabled: boolean;
    persian_first: boolean;
    theme_mode: LearnerState['themeMode'];
    updated_at: string;
  } | null;
  progress: {
    xp: number;
    completed_lessons: string[];
    saved_lessons: string[];
    quiz_scores: Record<string, number>;
    completion_dates: Record<string, string>;
    review_queue: LearnerState['reviewQueue'];
    active_days: string[];
    test_history: LearnerState['testHistory'];
    updated_at: string;
  } | null;
};

const messageFor = (error: unknown) => error instanceof Error ? error.message : 'cloud_request_failed';

export async function createSessionFromUrl(url: string) {
  if (!supabase) return null;
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) throw new Error(String(params.error_description || errorCode));
  if (typeof params.code === 'string') {
    const { data, error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (error) throw error;
    return data.session;
  }
  const accessToken = typeof params.access_token === 'string' ? params.access_token : '';
  const refreshToken = typeof params.refresh_token === 'string' ? params.refresh_token : '';
  if (!accessToken || !refreshToken) return null;
  const { data, error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
  if (error) throw error;
  return data.session;
}

export async function signUpWithEmail(details: {
  email: string;
  password: string;
  displayName: string;
  username: string;
  termsAcceptedAt: string;
}) : Promise<AuthResult> {
  if (!supabase) return { ok: false, status: 'error', message: 'cloud_not_configured' };
  const { data, error } = await supabase.auth.signUp({
    email: details.email.trim().toLocaleLowerCase('en-US'),
    password: details.password,
    options: {
      emailRedirectTo: authCallbackUrl,
      data: {
        display_name: details.displayName.trim(),
        username: details.username,
        terms_accepted_at: details.termsAcceptedAt,
      },
    },
  });
  if (error) return { ok: false, status: 'error', message: error.message };
  return { ok: true, status: data.session ? 'signedIn' : 'verificationSent' };
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return { ok: false, status: 'error', message: 'cloud_not_configured' };
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLocaleLowerCase('en-US'),
    password,
  });
  return error ? { ok: false, status: 'error', message: error.message } : { ok: true, status: 'signedIn' };
}

export async function signInWithGoogle(): Promise<AuthResult> {
  if (!supabase) return { ok: false, status: 'error', message: 'cloud_not_configured' };
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: authCallbackUrl,
      skipBrowserRedirect: Platform.OS !== 'web',
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  });
  if (error) return { ok: false, status: 'error', message: error.message };
  if (Platform.OS === 'web') return { ok: true, status: 'signedIn' };
  if (!data.url) return { ok: false, status: 'error', message: 'oauth_url_missing' };
  const result = await WebBrowser.openAuthSessionAsync(data.url, authCallbackUrl);
  if (result.type !== 'success') return { ok: true, status: 'cancelled' };
  try {
    await createSessionFromUrl(result.url);
    return { ok: true, status: 'signedIn' };
  } catch (oauthError) {
    return { ok: false, status: 'error', message: messageFor(oauthError) };
  }
}

export async function resendVerification(email: string): Promise<AuthResult> {
  if (!supabase) return { ok: false, status: 'error', message: 'cloud_not_configured' };
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email.trim().toLocaleLowerCase('en-US'),
    options: { emailRedirectTo: authCallbackUrl },
  });
  return error ? { ok: false, status: 'error', message: error.message } : { ok: true, status: 'verificationSent' };
}

export async function sendPasswordReset(email: string): Promise<AuthResult> {
  if (!supabase) return { ok: false, status: 'error', message: 'cloud_not_configured' };
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLocaleLowerCase('en-US'),
    { redirectTo: passwordRecoveryUrl },
  );
  return error ? { ok: false, status: 'error', message: error.message } : { ok: true, status: 'resetSent' };
}

export async function changePassword(password: string): Promise<AuthResult> {
  if (!supabase) return { ok: false, status: 'error', message: 'cloud_not_configured' };
  const { error } = await supabase.auth.updateUser({ password });
  return error ? { ok: false, status: 'error', message: error.message } : { ok: true, status: 'passwordUpdated' };
}

export async function fetchCloudSnapshot(userId: string): Promise<CloudSnapshot> {
  if (!supabase) throw new Error('cloud_not_configured');
  const [profile, settings, progress] = await Promise.all([
    supabase.from('profiles').select('display_name, username, terms_accepted_at, updated_at').eq('user_id', userId).maybeSingle(),
    supabase.from('learner_settings').select('daily_goal, language, audio_enabled, sound_effects_enabled, persian_first, theme_mode, updated_at').eq('user_id', userId).maybeSingle(),
    supabase.from('learner_progress').select('xp, completed_lessons, saved_lessons, quiz_scores, completion_dates, review_queue, active_days, test_history, updated_at').eq('user_id', userId).maybeSingle(),
  ]);
  const error = profile.error || settings.error || progress.error;
  if (error) throw error;
  return {
    profile: profile.data as CloudSnapshot['profile'],
    settings: settings.data as CloudSnapshot['settings'],
    progress: progress.data as CloudSnapshot['progress'],
  };
}

export async function syncCloudState(state: LearnerState, user: User) {
  if (!supabase) throw new Error('cloud_not_configured');
  const timestamp = new Date().toISOString();
  const results = await Promise.all([
    supabase.from('profiles').upsert({
      user_id: user.id,
      display_name: state.name.trim() || user.user_metadata?.full_name || 'Learner',
      username: state.username,
      terms_accepted_at: state.termsAcceptedAt || timestamp,
      updated_at: timestamp,
    }, { onConflict: 'user_id' }),
    supabase.from('learner_settings').upsert({
      user_id: user.id,
      daily_goal: state.dailyGoal,
      language: state.language,
      audio_enabled: state.audioEnabled,
      sound_effects_enabled: state.soundEffectsEnabled,
      persian_first: state.persianFirst,
      theme_mode: state.themeMode,
      updated_at: timestamp,
    }, { onConflict: 'user_id' }),
    supabase.from('learner_progress').upsert({
      user_id: user.id,
      xp: state.xp,
      completed_lessons: state.completedLessons,
      saved_lessons: state.savedLessons,
      quiz_scores: state.quizScores,
      completion_dates: state.completionDates,
      review_queue: state.reviewQueue,
      active_days: state.activeDays,
      test_history: state.testHistory,
      updated_at: timestamp,
    }, { onConflict: 'user_id' }),
  ]);
  const error = results.find((result) => result.error)?.error;
  if (error) throw error;
  return timestamp;
}

export async function resetCloudProgress(userId: string) {
  if (!supabase) return;
  const { error } = await supabase.from('learner_progress').upsert({
    user_id: userId,
    xp: 0,
    completed_lessons: [],
    saved_lessons: [],
    quiz_scores: {},
    completion_dates: {},
    review_queue: [],
    active_days: [],
    test_history: [],
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  if (error) throw error;
}

export async function deleteCloudAccount() {
  if (!supabase) throw new Error('cloud_not_configured');
  const { error } = await supabase.functions.invoke('delete-account', { body: {} });
  if (error) throw error;
  await supabase.auth.signOut({ scope: 'local' });
}

export type { Session, User };
