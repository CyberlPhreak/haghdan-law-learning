import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { DefaultTheme, NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator, type NativeStackNavigationProp, type NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { buildLearningAnalytics, type LearningAnalytics, type SubjectInsight } from './analytics';
import { askStudyAssistant, assistantSuggestions, onlineAssistantConfigured, privacySafeLearnerId, type ChatMessage } from './ai-chat';
import { normalizeUsername, validatePin, validateUsername } from './auth';
import { ActionButton, Brand, ProgressBar } from './components';
import { glossary, lessonById, lessons, pathwayById, pathways, type IconName, type Lesson, type Pathway, type QuizQuestion } from './curriculum';
import { buildGameProfile, gameLevels, lessonXp, localDateKey, testXp, type Achievement, type DailyMission } from './gamification';
import { languageOptions, LocalizedText as Text, useI18n, type AppLanguage } from './i18n';
import { localizeLesson, localizeQuestion } from './legal-content';
import { MotionView, motion } from './motion';
import { legalDocuments, product, type LegalDocumentId } from './product';
import { buildBalancedTestQuestions, sqeTotals, stageSubjects, type SqeStage, type SqeTrack } from './sqe';
import { sraSpecification } from './sqe-spec';
import { SoundPressable as Pressable, useSoundFeedback } from './sound';
import { useLearner, type SubjectScore, type TestMode, type ThemeMode } from './store';
import { subjectArtFor } from './subject-art';
import { createShadow, lightPalette, radius, space, themedAccentColor, themedSoftColor, type, useAppTheme, type AppPalette } from './theme';

export type RootStackParamList = {
  Main: undefined;
  Pathway: { pathwayId: string };
  Lesson: { lessonId: string };
  Test: { stage: SqeStage; count: number; mode: TestMode; subjectId?: string };
  Insights: undefined;
  GameHub: undefined;
  AIChat: undefined;
  Support: undefined;
  Legal: { document: LegalDocumentId };
};

type TabParams = {
  Home: undefined;
  Learn: undefined;
  Review: undefined;
  Practice: undefined;
  Profile: undefined;
};

const Root = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabParams>();
const tabInfo: Record<keyof TabParams, { key: string; icon: IconName }> = {
  Home: { key: 'nav.home', icon: 'home' },
  Learn: { key: 'nav.learn', icon: 'book-open' },
  Review: { key: 'nav.review', icon: 'refresh-cw' },
  Practice: { key: 'nav.practice', icon: 'edit-3' },
  Profile: { key: 'nav.profile', icon: 'user' },
};

let palette = lightPalette;
let darkMode = false;
let s: ReturnType<typeof createStyles>;

export function HaghDanApp() {
  const { state, cloud } = useLearner();
  const theme = useAppTheme();
  const { isRtl } = useI18n();
  palette = theme.palette;
  darkMode = theme.isDark;
  s = useMemo(() => createStyles(theme.palette, isRtl), [theme.palette, isRtl]);
  if (!state.hydrated || (cloud.configured && cloud.checking && !cloud.recoveryMode)) return <Loading />;
  if (!state.authenticated || cloud.recoveryMode) return <Authentication />;
  return (
    <NavigationContainer theme={{ ...DefaultTheme, dark: darkMode, colors: { ...DefaultTheme.colors, primary: palette.primary, background: palette.background, card: palette.surface, text: palette.ink, border: palette.line } }}>
      <Root.Navigator screenOptions={{ headerShown: false, animation: isRtl ? 'slide_from_left' : 'slide_from_right', contentStyle: { backgroundColor: palette.background } }}>
        <Root.Screen name="Main" component={MainTabs} />
        <Root.Screen name="Pathway" component={PathwayScreen} />
        <Root.Screen name="Lesson" component={LessonScreen} />
        <Root.Screen name="Test" component={TestScreen} />
        <Root.Screen name="Insights" component={InsightsScreen} />
        <Root.Screen name="GameHub" component={GameHubScreen} />
        <Root.Screen name="AIChat" component={AIChatScreen} />
        <Root.Screen name="Support" component={SupportScreen} />
        <Root.Screen name="Legal" component={LegalScreen} />
      </Root.Navigator>
    </NavigationContainer>
  );
}

function Loading() {
  const { t } = useI18n();
  return <View style={s.loading}><View style={s.loadingLogo}><Feather name="book-open" size={28} color={palette.white} /></View><ActivityIndicator size="large" color={palette.primary} /><Text style={s.muted}>{t('common.loading')}</Text></View>;
}

function MainTabs() {
  const { width } = useWindowDimensions();
  const { playTap } = useSoundFeedback();
  const { t } = useI18n();
  const desktop = width >= 980;
  return (
    <Tabs.Navigator screenListeners={{ tabPress: playTap }} screenOptions={({ route }) => ({
      headerShown: false,
      tabBarPosition: desktop ? 'left' : 'bottom',
      tabBarActiveTintColor: palette.primary,
      tabBarActiveBackgroundColor: palette.primarySoft,
      tabBarInactiveTintColor: palette.muted,
      tabBarHideOnKeyboard: true,
      animation: 'fade',
      tabBarLabel: ({ focused }) => <Text numberOfLines={1} style={[s.navLabel, desktop && s.navLabelDesktop, focused && s.navLabelActive]}>{t(tabInfo[route.name].key)}</Text>,
      tabBarIcon: ({ focused }) => <NavigationIcon route={route.name} focused={focused} />,
      tabBarBackground: () => desktop ? <DesktopNavigationBackdrop /> : undefined,
      tabBarStyle: desktop ? s.tabsDesktop : s.tabsMobile,
      tabBarItemStyle: [s.tabItem, desktop && s.tabItemDesktop],
    })}>
      <Tabs.Screen name="Home" component={Home} />
      <Tabs.Screen name="Learn" component={Learn} />
      <Tabs.Screen name="Review" component={Review} />
      <Tabs.Screen name="Practice" component={Practice} />
      <Tabs.Screen name="Profile" component={Profile} />
    </Tabs.Navigator>
  );
}

function NavigationIcon({ route, focused }: { route: keyof TabParams; focused: boolean }) {
  const item = tabInfo[route];
  return (
    <View style={[s.navIcon, focused && s.navIconActive]}>
      <Feather name={item.icon} size={19} color={focused ? palette.white : palette.muted} />
      {focused ? <View style={s.navActiveDot} /> : null}
    </View>
  );
}

function DesktopNavigationBackdrop() {
  const { state } = useLearner();
  const { t, formatNumber } = useI18n();
  const progress = Math.round((state.completedLessons.length / Math.max(1, lessons.length)) * 100);
  return (
    <View accessible={false} style={s.sidebarBackdrop}>
      <View style={s.sidebarGlow} />
      <ImageBackground source={subjectArtFor('flk1-system')} resizeMode="cover" style={s.sidebarArtwork} imageStyle={s.sidebarArtworkImage} accessible={false} accessibilityIgnoresInvertColors>
        <View style={s.sidebarArtworkScrim} />
        <View style={s.sidebarArtworkContent}>
          <View style={s.sidebarArtworkIcon}><Feather name="compass" size={21} color={palette.saffron} /></View>
          <Text style={s.sidebarArtworkTitle}>{t('home.library')}</Text>
          <Text style={s.sidebarArtworkMeta}>{t('home.libraryProgress', { done: formatNumber(state.completedLessons.length), total: formatNumber(lessons.length) })}</Text>
          <View style={s.sidebarProgress}><ProgressBar value={progress} color={palette.saffron} trackColor={palette.overlayBorder} /></View>
        </View>
      </ImageBackground>
    </View>
  );
}

type AuthErrors = Partial<Record<'name' | 'username' | 'email' | 'pin' | 'confirmPin' | 'terms' | 'form', string>>;
type CloudAuthMode = 'login' | 'signup' | 'forgot' | 'verify' | 'recovery';

function Authentication() {
  const {
    state,
    cloud,
    registerAccount,
    authenticate,
    signInWithGoogle,
    resendVerification,
    sendPasswordReset,
    updatePassword,
    deleteAccount,
    updateSettings,
  } = useLearner();
  const { t, isRtl } = useI18n();
  const hasLocalAccount = !cloud.configured && Boolean(state.username && state.pinHash);
  const [mode, setMode] = useState<CloudAuthMode>(cloud.recoveryMode ? 'recovery' : cloud.pendingVerificationEmail ? 'verify' : 'login');
  const [name, setName] = useState(state.name);
  const [username, setUsername] = useState(state.username);
  const [email, setEmail] = useState(state.email || cloud.pendingVerificationEmail);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [goal, setGoal] = useState(2);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<AuthErrors>({});
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const isSignup = cloud.configured ? mode === 'signup' : !hasLocalAccount;
  const isRecovery = cloud.configured && mode === 'recovery';
  const resetLocalAccount = () => Alert.alert(t('auth.resetLocalTitle'), t('auth.resetLocalBody'), [{ text: t('profile.cancel'), style: 'cancel' }, { text: t('auth.resetLocalAction'), style: 'destructive', onPress: () => void deleteAccount() }]);

  useEffect(() => {
    if (cloud.recoveryMode) setMode('recovery');
    else if (cloud.pendingVerificationEmail) {
      setEmail(cloud.pendingVerificationEmail);
      setMode('verify');
    }
  }, [cloud.pendingVerificationEmail, cloud.recoveryMode]);

  const messageForError = (message: string) => {
    const normalized = message.toLocaleLowerCase('en-US');
    if (normalized.includes('invalid login') || normalized === 'invalid_credentials') return t('auth.error.invalidLogin');
    if (normalized.includes('email not confirmed')) return t('auth.error.verifyFirst');
    if (normalized.includes('already registered') || normalized.includes('already exists')) return t('auth.error.accountExists');
    return t('auth.error.cloud');
  };

  const submit = async () => {
    const nextErrors: AuthErrors = {};
    setNotice('');

    if (cloud.configured && mode === 'forgot') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = t('auth.error.email');
      if (Object.keys(nextErrors).length) return setErrors(nextErrors);
      setBusy(true);
      const result = await sendPasswordReset(email);
      setBusy(false);
      if (result.ok) setNotice(t('auth.resetSent'));
      else setErrors({ form: messageForError(result.message) });
      return;
    }

    if (cloud.configured && mode === 'verify') {
      setBusy(true);
      const result = await resendVerification(email);
      setBusy(false);
      if (result.ok) setNotice(t('auth.resendSent'));
      else setErrors({ form: messageForError(result.message) });
      return;
    }

    if (isRecovery) {
      if (pin.length < 8) nextErrors.pin = t('auth.error.passwordLength');
      if (pin !== confirmPin) nextErrors.confirmPin = t('auth.error.passwordMismatch');
      if (Object.keys(nextErrors).length) return setErrors(nextErrors);
      setBusy(true);
      const result = await updatePassword(pin);
      setBusy(false);
      if (result.ok) setNotice(t('auth.passwordUpdated'));
      else setErrors({ form: messageForError(result.message) });
      return;
    }

    if (cloud.configured) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = t('auth.error.email');
      if (pin.length < 8) nextErrors.pin = t('auth.error.passwordLength');
    } else {
      const usernameError = validateUsername(username);
      const pinError = validatePin(pin);
      if (usernameError) nextErrors.username = t(`auth.error.${usernameError}`);
      if (pinError) nextErrors.pin = t(`auth.error.${pinError}`);
    }

    if (!isSignup) {
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length) return;
      setBusy(true);
      const result = await authenticate(cloud.configured ? email : username, pin);
      setBusy(false);
      if (!result.ok) {
        setErrors({ form: messageForError(result.message) });
        if (cloud.configured && result.message.toLocaleLowerCase('en-US').includes('email not confirmed')) setMode('verify');
      }
      return;
    }

    const usernameError = validateUsername(username);
    if (usernameError) nextErrors.username = t(`auth.error.${usernameError}`);
    if (name.trim().length < 2) nextErrors.name = t('auth.error.displayName');
    if (pin && pin !== confirmPin) nextErrors.confirmPin = cloud.configured ? t('auth.error.passwordMismatch') : t('auth.error.pinMismatch');
    if (!termsAccepted) nextErrors.terms = t('auth.error.termsRequired');
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setBusy(true);
    const result = await registerAccount({
      name,
      username: normalizeUsername(username),
      pin: cloud.configured ? undefined : pin,
      email: cloud.configured ? email : undefined,
      password: cloud.configured ? pin : undefined,
      dailyGoal: goal,
    });
    setBusy(false);
    if (result.ok && result.status === 'verificationSent') setMode('verify');
    else if (!result.ok) setErrors({ form: messageForError(result.message) });
  };

  const google = async () => {
    setErrors({});
    setNotice('');
    if (!termsAccepted) {
      setErrors({ terms: t('auth.error.termsRequired') });
      return;
    }
    setBusy(true);
    const result = await signInWithGoogle(new Date().toISOString());
    setBusy(false);
    if (!result.ok) setErrors({ form: messageForError(result.message) });
  };

  const setAuthMode = (next: CloudAuthMode) => {
    setMode(next);
    setErrors({});
    setNotice('');
    setPin('');
    setConfirmPin('');
  };

  const heading = isRecovery
    ? { icon: 'key' as IconName, eyebrow: t('auth.recoveryTitle'), title: t('auth.choosePassword'), body: t('auth.recoveryBody') }
    : mode === 'forgot'
      ? { icon: 'mail' as IconName, eyebrow: t('auth.resetTitle'), title: t('auth.resetPassword'), body: t('auth.resetBody') }
      : mode === 'verify'
        ? { icon: 'check-circle' as IconName, eyebrow: t('auth.verifyTitle'), title: t('auth.checkInbox'), body: t('auth.verifyBody', { email }) }
        : {
            icon: isSignup ? 'shield' as IconName : 'log-in' as IconName,
            eyebrow: isSignup ? t('auth.learningAccount') : cloud.configured ? t('auth.cloudSecure') : t('auth.secure'),
            title: isSignup ? t('auth.create') : t('auth.welcome'),
            body: isSignup ? (cloud.configured ? t('auth.cloudCreateBody') : t('auth.createBody')) : (cloud.configured ? t('auth.cloudLoginBody') : t('auth.loginBody')),
          };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.onboardScroll} keyboardShouldPersistTaps="handled">
          <MotionView style={s.onboardCard} distance={18} duration={motion.relaxed}>
            <Brand />
            <View style={s.authLanguage}>
              <View style={s.preferenceHeading}><Text style={s.label}>{t('language.title')}</Text><Text style={s.hint}>{t('language.helper')}</Text></View>
              <LanguagePicker value={state.language} onChange={(language) => updateSettings({ language })} compact />
            </View>
            <View style={s.authIntro}>
              <View style={s.iconHero}><Feather name={heading.icon} size={27} color={palette.primary} /></View>
              <View style={s.flexEnd}><Text style={s.eyebrow}>{heading.eyebrow}</Text><Text style={s.onboardTitle}>{heading.title}</Text></View>
            </View>
            <Text style={s.body}>{heading.body}</Text>

            {isSignup ? <>
              <RequiredLabel text={t('auth.displayName')} />
              <TextInput value={name} onChangeText={(value) => { setName(value); setErrors((items) => ({ ...items, name: undefined, form: undefined })); }} placeholder={t('auth.displayNamePlaceholder')} placeholderTextColor={palette.muted} style={[s.input, Boolean(errors.name) && s.inputError]} textAlign={isRtl ? 'right' : 'left'} accessibilityLabel={t('auth.displayName')} autoComplete="name" />
              <FieldError message={errors.name} />
            </> : null}

            {isSignup || !cloud.configured ? <>
              <RequiredLabel text={t('auth.username')} />
              <TextInput value={username} onChangeText={(value) => { setUsername(value); setErrors((items) => ({ ...items, username: undefined, form: undefined })); }} placeholder="sara_law" placeholderTextColor={palette.muted} style={[s.input, Boolean(errors.username) && s.inputError]} textAlign={isRtl ? 'right' : 'left'} accessibilityLabel={t('auth.username')} autoCapitalize="none" autoCorrect={false} maxLength={24} />
              <FieldError message={errors.username} />
            </> : null}

            {cloud.configured && mode !== 'verify' ? <>
              <RequiredLabel text={t('auth.email')} />
              <TextInput value={email} onChangeText={(value) => { setEmail(value); setErrors((items) => ({ ...items, email: undefined, form: undefined })); }} placeholder="you@example.com" placeholderTextColor={palette.muted} style={[s.input, s.ltrInput, Boolean(errors.email) && s.inputError]} textAlign="left" accessibilityLabel={t('auth.email')} keyboardType="email-address" autoComplete="email" autoCapitalize="none" autoCorrect={false} />
              <FieldError message={errors.email} />
            </> : null}

            {mode !== 'forgot' && mode !== 'verify' ? <>
              <RequiredLabel text={cloud.configured ? t('auth.password') : t('auth.pin')} />
              <TextInput value={pin} onChangeText={(value) => { setPin(cloud.configured ? value : value.replace(/\D/g, '')); setErrors((items) => ({ ...items, pin: undefined, form: undefined })); }} placeholder={cloud.configured ? t('auth.passwordHint') : t('auth.pinHint')} placeholderTextColor={palette.muted} style={[s.input, Boolean(errors.pin) && s.inputError]} textAlign={isRtl ? 'right' : 'left'} accessibilityLabel={cloud.configured ? t('auth.password') : t('auth.pin')} keyboardType={cloud.configured ? 'default' : 'number-pad'} secureTextEntry maxLength={cloud.configured ? 128 : 6} autoComplete={isSignup ? 'new-password' : 'current-password'} />
              <FieldError message={errors.pin} />
            </> : null}

            {(isSignup || isRecovery) ? <>
              <RequiredLabel text={cloud.configured ? t('auth.confirmPassword') : t('auth.confirmPin')} />
              <TextInput value={confirmPin} onChangeText={(value) => { setConfirmPin(cloud.configured ? value : value.replace(/\D/g, '')); setErrors((items) => ({ ...items, confirmPin: undefined, form: undefined })); }} placeholder={cloud.configured ? t('auth.confirmPasswordHint') : t('auth.confirmPinHint')} placeholderTextColor={palette.muted} style={[s.input, Boolean(errors.confirmPin) && s.inputError]} textAlign={isRtl ? 'right' : 'left'} accessibilityLabel={cloud.configured ? t('auth.confirmPassword') : t('auth.confirmPin')} keyboardType={cloud.configured ? 'default' : 'number-pad'} secureTextEntry maxLength={cloud.configured ? 128 : 6} autoComplete="new-password" />
              <FieldError message={errors.confirmPin} />
            </> : null}

            {isSignup ? <>
              <Text style={s.label}>{t('auth.dailyGoal')}</Text>
              <Text style={s.hint}>{t('auth.goalHelper')}</Text>
              <GoalPicker value={goal} onChange={setGoal} />
              <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: termsAccepted }} onPress={() => { setTermsAccepted((value) => !value); setErrors((items) => ({ ...items, terms: undefined })); }} style={({ pressed }) => [s.termsRow, Boolean(errors.terms) && s.termsRowError, pressed && s.pressed]}>
                <View style={[s.checkbox, termsAccepted && s.checkboxChecked]}>{termsAccepted ? <Feather name="check" size={15} color={palette.white} /> : null}</View>
                <Text style={s.termsText}>{t('auth.terms')}</Text>
              </Pressable>
              <View style={s.authLegalLinks}>
                <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(product.termsUrl)}><Text style={s.inlineLink}>{t('support.terms')}</Text></Pressable>
                <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(product.privacyUrl)}><Text style={s.inlineLink}>{t('support.privacy')}</Text></Pressable>
              </View>
              <FieldError message={errors.terms} />
            </> : null}

            <FieldError message={errors.form} centered />
            {notice ? <View style={s.authNotice}><Feather name="check-circle" size={17} color={palette.teal} /><Text style={s.authSecurityText}>{notice}</Text></View> : null}
            <ActionButton
              label={mode === 'forgot' ? t('auth.sendReset') : mode === 'verify' ? t('auth.resend') : isRecovery ? t('auth.updatePassword') : isSignup ? t('auth.createAction') : t('auth.login')}
              icon={mode === 'forgot' || mode === 'verify' ? 'mail' : 'arrow-left'}
              onPress={() => void submit()}
              fullWidth
              disabled={busy}
            />
            {busy ? <ActivityIndicator accessibilityLabel={t('common.loading')} color={palette.primary} /> : null}

            {cloud.configured && (mode === 'login' || mode === 'signup') ? <>
              {!isSignup ? <>
                <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: termsAccepted }} onPress={() => { setTermsAccepted((value) => !value); setErrors((items) => ({ ...items, terms: undefined })); }} style={({ pressed }) => [s.termsRow, Boolean(errors.terms) && s.termsRowError, pressed && s.pressed]}>
                  <View style={[s.checkbox, termsAccepted && s.checkboxChecked]}>{termsAccepted ? <Feather name="check" size={15} color={palette.white} /> : null}</View>
                  <Text style={s.termsText}>{t('auth.googleTerms')}</Text>
                </Pressable>
                <View style={s.authLegalLinks}>
                  <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(product.termsUrl)}><Text style={s.inlineLink}>{t('support.terms')}</Text></Pressable>
                  <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(product.privacyUrl)}><Text style={s.inlineLink}>{t('support.privacy')}</Text></Pressable>
                </View>
                <FieldError message={errors.terms} />
              </> : null}
              <View style={s.authDivider}><View style={s.authDividerLine} /><Text style={s.hint}>{t('auth.or')}</Text><View style={s.authDividerLine} /></View>
              <ActionButton label={t('auth.google')} icon="globe" variant="secondary" onPress={() => void google()} fullWidth disabled={busy} />
              <View style={s.authSwitches}>
                <Pressable accessibilityRole="button" onPress={() => setAuthMode(isSignup ? 'login' : 'signup')} style={({ pressed }) => [s.authReset, pressed && s.pressed]}><Text style={s.authLinkText}>{isSignup ? t('auth.switchLogin') : t('auth.switchSignup')}</Text></Pressable>
                {mode === 'login' ? <Pressable accessibilityRole="button" onPress={() => setAuthMode('forgot')} style={({ pressed }) => [s.authReset, pressed && s.pressed]}><Text style={s.authResetText}>{t('auth.forgotPassword')}</Text></Pressable> : null}
              </View>
            </> : null}
            {cloud.configured && (mode === 'forgot' || mode === 'verify') ? <Pressable accessibilityRole="button" onPress={() => setAuthMode('login')} style={({ pressed }) => [s.authReset, pressed && s.pressed]}><Text style={s.authLinkText}>{t('auth.backLogin')}</Text></Pressable> : null}
            {hasLocalAccount ? <Pressable accessibilityRole="button" accessibilityLabel={t('auth.forgot')} onPress={resetLocalAccount} style={({ pressed }) => [s.authReset, pressed && s.pressed]}><Text style={s.authResetText}>{t('auth.forgot')}</Text></Pressable> : null}
            <View style={s.authSecurity}><Feather name={cloud.configured ? 'cloud' : 'lock'} size={17} color={palette.teal} /><Text style={s.authSecurityText}>{cloud.configured ? t('auth.cloudSecurity') : t('auth.localSecurity')}</Text></View>
            <Notice />
          </MotionView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function RequiredLabel({ text }: { text: string }) {
  return <Text style={s.label}>{text} <Text style={s.requiredMark}>*</Text></Text>;
}

function FieldError({ message, centered = false }: { message?: string; centered?: boolean }) {
  return message ? <Text accessibilityLiveRegion="polite" style={[s.fieldError, centered && s.fieldErrorCentered]}>{message}</Text> : null;
}

function Home() {
  const nav = useRootNav();
  const { state, streak, completedToday } = useLearner();
  const { t, formatNumber, legalTitle, secondaryLegalTitle, language, locale } = useI18n();
  const analytics = useMemo(() => buildLearningAnalytics(state, locale), [state, locale]);
  const game = useMemo(() => buildGameProfile(state), [state]);
  const next = lessons.find((item) => !state.completedLessons.includes(item.id)) ?? lessons[0]!;
  const mastery = Math.round((state.completedLessons.length / lessons.length) * 100);
  const due = state.reviewQueue.filter((item) => new Date(item.dueAt) <= new Date()).length;
  return (
    <Page>
      <Header eyebrow={t('home.eyebrow')} title={t('home.greeting', { name: state.name })} subtitle={t('home.subtitle')} />
      <View style={s.hero}>
        <View style={s.heroGlow} />
        <View style={s.heroGlowSmall} />
        <View style={s.heroCopy}>
          <Pill icon="zap" text={t('home.today')} />
          <Text style={s.heroTitle}>{legalTitle(next.title, next.englishTitle)}</Text>
          {secondaryLegalTitle(next.title, next.englishTitle) ? <Text style={s.english}>{secondaryLegalTitle(next.title, next.englishTitle)}</Text> : null}
          <Text style={s.body}>{language === 'fa' ? next.summary : t('learn.pathwayDescription')}</Text>
          <View style={s.metaRow}><Meta icon="clock" text={t('home.minutes', { count: formatNumber(next.duration) })} /><Meta icon="layers" text={t('home.sections', { count: formatNumber(next.sections.length) })} /></View>
          <ActionButton label={t('home.startLesson')} icon="arrow-left" onPress={() => nav.navigate('Lesson', { lessonId: next.id })} />
        </View>
        <View style={s.goalCard}><View style={s.goalIcon}><Feather name="book-open" size={28} color={palette.white} /></View><Text style={s.goalBig}>{formatNumber(completedToday)}/{formatNumber(state.dailyGoal)}</Text><Text style={s.goalCaption}>{t('home.dailyGoal')}</Text><View style={s.goalProgress}><ProgressBar value={(completedToday / state.dailyGoal) * 100} color={palette.white} trackColor={palette.overlayBorder} /></View></View>
      </View>
      <GameStatusCard game={game} onPress={() => nav.navigate('GameHub')} />
      <AssistantPromo onPress={() => nav.navigate('AIChat')} />
      <View style={s.stats}><Stat icon="award" value={formatNumber(mastery) + '%'} label={t('home.mastery')} color={palette.primary} soft={palette.primarySoft} /><Stat icon="check-circle" value={formatNumber(state.completedLessons.length)} label={t('home.complete')} color={palette.teal} soft={palette.tealSoft} /><Stat icon="refresh-cw" value={formatNumber(due)} label={t('home.reviewReady')} color={palette.rose} soft={palette.roseSoft} /><Stat icon="activity" value={formatNumber(streak)} label={t('home.streak')} color={palette.goldInk} soft={palette.saffronSoft} /></View>
      <HomeInsights analytics={analytics} onPress={() => nav.navigate('Insights')} />
      <SectionTitle title={t('home.pathways')} />
      <View style={s.grid}>{pathways.slice(0, 3).map((item) => <PathCard key={item.id} item={item} onPress={() => nav.navigate('Pathway', { pathwayId: item.id })} />)}</View>
      <Notice />
    </Page>
  );
}

function AssistantPromo({ onPress }: { onPress: () => void }) {
  const { t } = useI18n();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={t('home.assistant')} onPress={onPress} style={({ pressed }) => [s.assistantPromo, pressed && s.cardPressed]}>
      <View style={s.assistantPromoIcon}><Feather name="message-circle" size={23} color={palette.white} /></View>
      <View style={s.flexEnd}><Text style={s.assistantPromoTitle}>{t('home.assistant')}</Text><Text style={s.assistantPromoText}>{t('home.assistantBody')}</Text></View>
      <DirectionalChevron size={23} color={palette.primary} />
    </Pressable>
  );
}

type GameProfile = ReturnType<typeof buildGameProfile>;

function GameStatusCard({ game, onPress }: { game: GameProfile; onPress: () => void }) {
  const { t, formatNumber } = useI18n();
  const levelTitle = t(`game.level.${game.level.level}`);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${t('game.club')}, ${t('common.level')} ${formatNumber(game.level.level)}, ${levelTitle}`} onPress={onPress} style={({ pressed }) => [s.gameStatus, pressed && s.cardPressed]}>
      <View style={s.gameStatusGlow} />
      <View style={s.gameStatusTop}>
        <View style={s.levelMedallion}><Feather name={game.level.icon} size={23} color={palette.goldInk} /></View>
        <View style={s.flexEnd}><Text style={s.gameEyebrow}>{t('game.club')} · {t('common.level')} {formatNumber(game.level.level)}</Text><Text style={s.gameStatusTitle}>{levelTitle}</Text></View>
        <DirectionalChevron size={23} color={palette.onPrimaryMuted} />
      </View>
      <View style={s.gameProgressCopy}><Text style={s.gameProgressText}>{game.nextLevel ? t('game.toNext', { count: formatNumber(game.xpToNext) }) : t('game.maxLevel')}</Text><Text style={s.gameXp}>{formatNumber(game.xp)} XP</Text></View>
      <ProgressBar value={game.levelProgress} color={palette.saffron} trackColor={palette.overlayBorder} />
      <View style={s.gameStatusSignals}>
        <GameSignal icon="activity" value={formatNumber(game.streak)} label={t('game.streak')} />
        <GameSignal icon="check-circle" value={`${formatNumber(game.completedMissions)}/3`} label={t('game.missionsToday')} />
        <GameSignal icon="award" value={formatNumber(game.unlockedAchievements)} label={t('game.badgesUnlocked')} />
      </View>
    </Pressable>
  );
}

function GameSignal({ icon, value, label }: { icon: IconName; value: string; label: string }) {
  return <View style={s.gameSignal}><Feather name={icon} size={16} color={palette.saffron} /><Text style={s.gameSignalValue}>{value}</Text><Text style={s.gameSignalLabel}>{label}</Text></View>;
}

type GameHubProps = NativeStackScreenProps<RootStackParamList, 'GameHub'>;
function GameHubScreen({ navigation }: GameHubProps) {
  const { state } = useLearner();
  const { t, formatNumber } = useI18n();
  const game = useMemo(() => buildGameProfile(state), [state]);
  const levelTitle = t(`game.level.${game.level.level}`);
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.gamePage}>
        <TopBar onBack={navigation.goBack} />
        <MotionView style={s.gameScreenMotion} distance={14} duration={motion.relaxed}>
          <View style={s.gameHero}>
            <View style={s.gameHeroGlow} />
            <View style={s.gameHeroMedallion}><Feather name={game.level.icon} size={34} color={palette.goldInk} /></View>
            <View style={s.gameHeroCopy}>
              <Text style={s.gameHeroEyebrow}>{t('common.level')} {formatNumber(game.level.level)} · {formatNumber(game.xp)} XP</Text>
              <Text style={s.gameHeroTitle}>{levelTitle}</Text>
              <Text style={s.gameHeroText}>{game.nextLevel ? t('game.progressMessage', { count: formatNumber(game.xpToNext), level: t(`game.level.${game.nextLevel.level}`) }) : t('game.maxMessage')}</Text>
              <View style={s.gameHeroProgress}><ProgressBar value={game.levelProgress} color={palette.saffron} trackColor={palette.overlayBorder} /></View>
            </View>
          </View>

          <View style={s.gameSectionHeading}><View style={s.gameHeadingIcon}><Feather name="target" size={20} color={palette.primary} /></View><View style={s.flexEnd}><Text style={s.sectionTitle}>{t('game.missionsHeading')}</Text><Text style={s.hint}>{t('game.missionsSummary', { done: formatNumber(game.completedMissions) })}</Text></View></View>
          <View style={s.missionList}>{game.missions.map((mission, index) => <MissionCard key={mission.id} mission={mission} delay={index * motion.stagger} />)}</View>

          <View style={s.gameSectionHeading}><View style={s.gameHeadingIcon}><Feather name="award" size={20} color={palette.primary} /></View><View style={s.flexEnd}><Text style={s.sectionTitle}>{t('game.badgesHeading')}</Text><Text style={s.hint}>{t('game.badgesSummary', { done: formatNumber(game.unlockedAchievements), total: formatNumber(game.achievements.length) })}</Text></View></View>
          <View style={s.achievementGrid}>{game.achievements.map((achievement, index) => <AchievementCard key={achievement.id} achievement={achievement} delay={index * 28} />)}</View>

          <View style={s.levelRoadmap}>
            <View style={s.gameSectionHeading}><View style={s.gameHeadingIcon}><Feather name="map" size={20} color={palette.primary} /></View><View style={s.flexEnd}><Text style={s.sectionTitle}>{t('game.roadmap')}</Text><Text style={s.hint}>{t('game.roadmapNote')}</Text></View></View>
            {gameLevels.map((level) => {
              const reached = state.xp >= level.threshold;
              const current = level.level === game.level.level;
              return <View key={level.level} style={[s.levelRow, current && s.levelRowCurrent]}><View style={[s.levelNode, reached && s.levelNodeReached]}>{reached ? <Feather name="check" size={16} color={palette.white} /> : <Text style={s.levelNodeText}>{formatNumber(level.level)}</Text>}</View><View style={s.flexEnd}><Text style={[s.levelTitle, !reached && s.levelTitleLocked]}>{t(`game.level.${level.level}`)}</Text><Text style={s.hint}>{formatNumber(level.threshold)} XP</Text></View>{current ? <View style={s.currentLevelPill}><Text style={s.currentLevelText}>{t('common.current')}</Text></View> : null}</View>;
            })}
          </View>
          <Notice />
        </MotionView>
      </ScrollView>
    </SafeAreaView>
  );
}

function MissionCard({ mission, delay }: { mission: DailyMission; delay: number }) {
  const { t, formatNumber } = useI18n();
  const done = mission.progress >= mission.target;
  const progress = Math.round((mission.progress / Math.max(1, mission.target)) * 100);
  const title = t(`game.mission.${mission.id}.title`);
  const description = t(`game.mission.${mission.id}.description`, { count: formatNumber(mission.target) });
  return <MotionView style={[s.missionCard, done && s.missionCardDone]} delay={delay} distance={8} accessibilityLabel={`${title}, ${done ? t('common.completed') : `${formatNumber(mission.progress)}/${formatNumber(mission.target)}`}`}><View style={[s.missionIcon, done && s.missionIconDone]}><Feather name={done ? 'check' : mission.icon} size={21} color={done ? palette.white : palette.primary} /></View><View style={s.missionCopy}><View style={s.between}><Text style={s.missionReward}>+{formatNumber(mission.xp)} XP</Text><Text style={s.missionTitle}>{title}</Text></View><Text style={s.missionText}>{done ? t('game.done') : description}</Text><View style={s.missionProgress}><ProgressBar value={progress} color={done ? palette.success : palette.primary} /></View></View></MotionView>;
}

function AchievementCard({ achievement, delay }: { achievement: Achievement; delay: number }) {
  const { t } = useI18n();
  const title = t(`game.achievement.${achievement.id}.title`);
  const description = t(`game.achievement.${achievement.id}.description`);
  return <MotionView style={[s.achievementCard, achievement.unlocked && s.achievementUnlocked]} delay={delay} distance={8} accessible accessibilityLabel={`${title}, ${achievement.unlocked ? t('game.unlocked') : t('game.locked')}`}><View style={[s.achievementIcon, achievement.unlocked && s.achievementIconUnlocked]}><Feather name={achievement.unlocked ? achievement.icon : 'lock'} size={23} color={achievement.unlocked ? palette.goldInk : palette.muted} /></View><Text style={[s.achievementTitle, !achievement.unlocked && s.achievementTitleLocked]}>{title}</Text><Text style={s.achievementText}>{description}</Text></MotionView>;
}

function Learn() {
  const nav = useRootNav();
  const { state } = useLearner();
  const { t, formatNumber, isRtl, language } = useI18n();
  const [track, setTrack] = useState<SqeTrack>('FLK1');
  const [query, setQuery] = useState('');
  const tracks: { key: SqeTrack; label: string }[] = [
    { key: 'FLK1', label: 'FLK1' }, { key: 'FLK2', label: 'FLK2' },
    { key: 'SQE2', label: 'SQE2' }, { key: 'EVERYDAY', label: t('learn.everyday') },
  ];
  const source = track === 'EVERYDAY' ? pathways.filter((item) => !item.track) : stageSubjects(track);
  const key = query.trim().toLocaleLowerCase();
  const visible = key ? source.filter((item) => [item.title, item.englishTitle, item.description].some((value) => value.toLocaleLowerCase().includes(key))) : source;
  const unitCount = source.reduce((sum, item) => sum + item.lessonIds.length, 0);
  return (
    <Page>
      <Header eyebrow={t('learn.eyebrow')} title={t('learn.title')} subtitle={t('learn.subtitle')} />
      <View style={s.specBanner}>
        <View style={s.specIcon}><Feather name="award" size={24} color={palette.white} /></View>
        <View style={s.flexEnd}><Text style={s.specTitle}>{t('learn.specTitle')}</Text><Text style={s.specText}>{t('learn.specText', { sqe1: formatNumber(sqeTotals.flk1Subjects + sqeTotals.flk2Subjects), sqe2: formatNumber(sqeTotals.sqe2Skills), stations: formatNumber(sqeTotals.sqe2Stations), questions: formatNumber(sqeTotals.practiceQuestions) })}</Text></View>
      </View>
      <View style={s.trackTabs}>{tracks.map((item) => <Pressable key={item.key} accessibilityRole="tab" accessibilityState={{ selected: track === item.key }} onPress={() => { setTrack(item.key); setQuery(''); }} style={({ pressed }) => [s.trackTab, track === item.key && s.trackTabActive, pressed && s.pressed]}><Text style={[s.trackTabText, track === item.key && s.trackTabTextActive]}>{item.label}</Text></Pressable>)}</View>
      <View style={s.searchBox}><Feather name="search" size={20} color={palette.muted} /><TextInput value={query} onChangeText={setQuery} placeholder={t('learn.search')} placeholderTextColor={palette.muted} style={s.searchInput} textAlign={isRtl ? 'right' : 'left'} accessibilityLabel={t('learn.search')} /></View>
      <View style={s.library}><View style={s.iconHero}><Feather name={track === 'SQE2' ? 'target' : 'book-open'} size={25} color={palette.primary} /></View><View style={s.flexEnd}><Text style={s.cardTitle}>{t('learn.units', { sections: formatNumber(source.length), units: formatNumber(unitCount) })}</Text><Text style={s.hint}>{t('learn.available', { done: formatNumber(state.completedLessons.filter((id) => source.some((path) => path.lessonIds.includes(id))).length) })}</Text></View></View>
      {language !== 'fa' ? <View style={s.translationNotice}><Feather name="globe" size={20} color={palette.primary} /><Text style={s.translationNoticeText}>{t('learn.translationNote', { language: languageOptions.find((item) => item.code === language)?.nativeName ?? language })}</Text></View> : null}
      <View style={s.grid}>{visible.map((item) => <PathCard key={item.id} item={item} onPress={() => nav.navigate('Pathway', { pathwayId: item.id })} />)}</View>
      {!visible.length ? <Empty icon="search" title={t('learn.noResultsTitle')} body={t('learn.noResultsBody')} /> : null}
      <Notice />
    </Page>
  );
}

type PathProps = NativeStackScreenProps<RootStackParamList, 'Pathway'>;
function PathwayScreen({ route, navigation }: PathProps) {
  const item = pathwayById[route.params.pathwayId];
  const { state } = useLearner();
  const { t, formatNumber, legalTitle, secondaryLegalTitle, language } = useI18n();
  if (!item) return null;
  const complete = item.lessonIds.filter((id) => state.completedLessons.includes(id)).length;
  const percent = Math.round((complete / item.lessonIds.length) * 100);
  const softColor = themedSoftColor(item.color, item.softColor, darkMode);
  const accentColor = themedAccentColor(item.color, darkMode);
  return (
    <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.detailPage}>
      <TopBar onBack={navigation.goBack} />
      <View style={[s.pathHero, { backgroundColor: softColor }]}>
        <View style={[s.pathHeroIcon, { backgroundColor: item.color }]}><Feather name={item.icon} size={30} color={palette.white} /></View>
        <Text style={s.pathHeroTitle}>{legalTitle(item.title, item.englishTitle)}</Text>{secondaryLegalTitle(item.title, item.englishTitle) ? <Text style={[s.english, { color: accentColor }]}>{secondaryLegalTitle(item.title, item.englishTitle)}</Text> : null}<Text style={s.body}>{language === 'fa' ? item.description : t('learn.pathwayDescription')}</Text>
        <View style={s.between}><Text style={s.smallStrong}>{formatNumber(complete)}/{formatNumber(item.lessonIds.length)} {t('common.lessons')}</Text><Text style={s.smallStrong}>{formatNumber(percent)}%</Text></View>
        <ProgressBar value={percent} color={accentColor} trackColor={darkMode ? palette.line : palette.white} />
        {item.track === 'FLK1' || item.track === 'FLK2' ? <ActionButton label={t('practice.subject', { subject: legalTitle(item.title, item.englishTitle) })} icon="edit-3" variant="secondary" onPress={() => navigation.navigate('Test', { stage: item.track as SqeStage, count: 20, mode: 'diagnostic', subjectId: item.id })} /> : null}
      </View>
      <View style={s.list}>{item.lessonIds.map((id, index) => {
        const lesson = lessonById[id]!;
        const done = state.completedLessons.includes(id);
        return <Pressable key={id} accessibilityRole="button" onPress={() => navigation.navigate('Lesson', { lessonId: id })} style={({ pressed }) => [s.lessonRow, pressed && s.pressed]}>
          <View style={[s.lessonNumber, done && s.done]}>{done ? <Feather name="check" size={18} color={palette.white} /> : <Text style={s.number}>{index + 1}</Text>}</View>
          <View style={s.flexEnd}><Text style={s.cardTitle}>{legalTitle(lesson.title, lesson.englishTitle)}</Text>{secondaryLegalTitle(lesson.title, lesson.englishTitle) ? <Text style={s.englishSmall}>{secondaryLegalTitle(lesson.title, lesson.englishTitle)}</Text> : null}<View style={s.metaRow}><Meta icon="clock" text={t('home.minutes', { count: formatNumber(lesson.duration) })} />{state.quizScores[id] !== undefined ? <Meta icon="award" text={formatNumber(state.quizScores[id]) + '%'} /> : null}</View></View>
          <DirectionalChevron size={22} color={palette.muted} />
        </Pressable>;
      })}</View>
      <Notice />
    </ScrollView></SafeAreaView>
  );
}

type LessonProps = NativeStackScreenProps<RootStackParamList, 'Lesson'>;
function LessonScreen({ route, navigation }: LessonProps) {
  const sourceItem = lessonById[route.params.lessonId];
  const { state, completeLesson, toggleSaved } = useLearner();
  const { t, formatNumber, legalTitle, language } = useI18n();
  const item = useMemo(() => sourceItem ? localizeLesson(sourceItem, language) : undefined, [sourceItem, language]);
  const [section, setSection] = useState(0);
  const [quiz, setQuiz] = useState(-1);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [earnedXp, setEarnedXp] = useState(0);
  const { playCorrect, playIncorrect, playMilestone } = useSoundFeedback();
  if (!item) return null;
  const total = item.sections.length + item.quiz.length;
  const step = quiz < 0 ? section : item.sections.length + quiz;
  const progress = finished ? 100 : Math.round(((step + 1) / total) * 100);
  const question = quiz >= 0 ? item.quiz[quiz] : undefined;
  const saved = state.savedLessons.includes(item.id);

  const advance = () => {
    if (quiz < 0) {
      if (section < item.sections.length - 1) setSection(section + 1);
      else setQuiz(0);
      return;
    }
    if (!question || selected === null) return;
    if (!revealed) {
      setAnswers({ ...answers, [question.id]: selected });
      setRevealed(true);
      const correct = selected === question.correctIndex;
      if (correct) {
        setCombo((value) => {
          const next = value + 1;
          setBestCombo((best) => Math.max(best, next));
          return next;
        });
        playCorrect();
      } else {
        setCombo(0);
        playIncorrect();
      }
      void Haptics.notificationAsync(correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning);
      return;
    }
    const final = { ...answers, [question.id]: selected };
    if (quiz < item.quiz.length - 1) {
      setAnswers(final); setQuiz(quiz + 1); setSelected(null); setRevealed(false); return;
    }
    const correct = item.quiz.filter((entry) => final[entry.id] === entry.correctIndex).length;
    const score = Math.round((correct / item.quiz.length) * 100);
    const missed = item.quiz.filter((entry) => final[entry.id] !== entry.correctIndex).map((entry) => entry.id);
    const today = localDateKey();
    const lessonsBeforeToday = Object.values(state.completionDates).filter((date) => date === today).length;
    const lessonsAfterToday = lessonsBeforeToday + (state.completionDates[item.id] === today ? 0 : 1);
    const missionBonus = (lessonsBeforeToday < 1 && lessonsAfterToday >= 1 ? 20 : 0) + (lessonsBeforeToday < state.dailyGoal && lessonsAfterToday >= state.dailyGoal ? 35 : 0);
    setEarnedXp(lessonXp(score, !state.completedLessons.includes(item.id)) + missionBonus);
    completeLesson(item.id, score, item.quiz.map((entry) => entry.id), missed);
    setAnswers(final); setFinished(true);
    playMilestone();
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const result = Math.round((item.quiz.filter((entry) => answers[entry.id] === entry.correctIndex).length / item.quiz.length) * 100);
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.lessonTop}><RoundIcon icon="x" label={t('lesson.close')} onPress={navigation.goBack} /><View style={s.flex}><ProgressBar value={progress} /></View><RoundIcon icon="bookmark" label={t('lesson.save')} active={saved} onPress={() => toggleSaved(item.id)} /></View>
      <ScrollView contentContainerStyle={s.lessonPage}>
        <MotionView style={s.lessonMotion} replayKey={`${section}-${quiz}-${finished}`} distance={10}>
        {finished ? <View style={s.result}><CelebrationBurst icon="award" tone={result >= 70 ? 'success' : 'gold'} /><Text style={s.eyebrow}>{t('lesson.complete')}</Text><Text style={s.pathHeroTitle}>{legalTitle(item.title, item.englishTitle)}</Text><Text style={s.score}>{formatNumber(result)}%</Text><View style={s.rewardRow}><RewardChip icon="zap" value={`+${formatNumber(earnedXp)} XP`} label="XP" /><RewardChip icon="activity" value={formatNumber(bestCombo)} label={t('lesson.chain', { count: formatNumber(bestCombo) })} /></View><Text style={s.centerBody}>{t('lesson.progressSaved')}</Text><ActionButton label={t('lesson.backPath')} icon="arrow-right" onPress={navigation.goBack} fullWidth /></View>
        : quiz < 0 ? <LessonSection item={item} index={section} />
        : question ? <QuizCard question={question} selected={selected} revealed={revealed} combo={combo} onSelect={setSelected} /> : null}
        </MotionView>
      </ScrollView>
      {!finished ? <View style={s.lessonFooter}>{quiz >= 0 && selected === null ? <Text style={s.requiredAnswer}>{t('lesson.answerRequired')}</Text> : null}<ActionButton label={quiz < 0 ? (section === item.sections.length - 1 ? t('lesson.startQuiz') : t('lesson.nextSection')) : revealed ? (quiz === item.quiz.length - 1 ? t('lesson.submit') : t('lesson.nextQuestion')) : t('lesson.checkAnswer')} icon="arrow-left" onPress={advance} disabled={quiz >= 0 && selected === null} sound={quiz < 0 || revealed} fullWidth /></View> : null}
    </SafeAreaView>
  );
}

function LessonSection({ item, index }: { item: Lesson; index: number }) {
  const part = item.sections[index]!;
  const { t, formatNumber, language } = useI18n();
  return <View style={s.reading}>
    <Text style={s.eyebrow}>{t('lesson.section', { current: formatNumber(index + 1), total: formatNumber(item.sections.length) })}</Text>
    {language !== 'fa' ? <View style={s.translationInline}><Feather name="globe" size={17} color={palette.primary} /><Text style={s.translationInlineText}>{t('language.contentFallback')}</Text></View> : null}
    <Text style={s.readingTitle}>{part.title}</Text>
    <Text style={s.readingBody}>{part.body}</Text>
    {part.bullets?.length ? <View style={s.learningList}>{part.bullets.map((bullet, bulletIndex) => <View key={bulletIndex} style={s.learningPoint}><View style={s.bulletDot} /><Text style={s.learningText}>{bullet}</Text></View>)}</View> : null}
    {part.example ? <View style={s.exampleCard}><Feather name="briefcase" size={20} color={palette.goldInk} /><View style={s.flexEnd}><Text style={s.exampleLabel}>{t('lesson.example')}</Text><Text style={s.exampleText}>{part.example}</Text></View></View> : null}
    {part.checklist?.length ? <View style={s.checklistCard}><Text style={s.checklistTitle}>{t('lesson.checklist')}</Text>{part.checklist.map((entry, entryIndex) => <View key={entryIndex} style={s.checkRow}><Feather name="check-square" size={18} color={palette.teal} /><Text style={s.checkText}>{entry}</Text></View>)}</View> : null}
    {part.callout ? <View style={s.callout}><Feather name="info" size={20} color={palette.primary} /><Text style={s.calloutText}>{part.callout}</Text></View> : null}
    <View style={s.term}><Text style={s.hint}>{t('lesson.keyTerm')}</Text><Text style={s.termFa}>{language === 'fa' ? part.termFa : part.termEn}</Text><Text style={s.english}>{language === 'fa' ? part.termEn : part.termFa}</Text></View>
    {part.source ? <View style={s.sourceNote}><Feather name="external-link" size={15} color={palette.muted} /><Text style={s.sourceText}>{part.source}</Text></View> : null}
    <Notice />
  </View>;
}

function QuizCard({ question, selected, revealed, combo = 0, onSelect }: { question: QuizQuestion; selected: number | null; revealed: boolean; combo?: number; onSelect: (value: number) => void }) {
  const isCorrect = selected === question.correctIndex;
  const { t, formatNumber, language } = useI18n();
  return <View style={s.reading}><View style={s.quizHeader}><View style={s.iconHero}><Feather name="help-circle" size={25} color={palette.primary} /></View>{combo > 0 ? <MotionView style={s.comboPill} replayKey={combo} distance={5} duration={motion.quick} accessibilityLiveRegion="polite"><Feather name="zap" size={15} color={palette.goldInk} /><Text style={s.comboText}>{t('lesson.chain', { count: formatNumber(combo) })}</Text></MotionView> : null}</View><Text style={s.eyebrow}>{t('lesson.assessment')}</Text>{language !== 'fa' ? <View style={s.translationInline}><Feather name="globe" size={17} color={palette.primary} /><Text style={s.translationInlineText}>{t('language.contentFallback')}</Text></View> : null}<Text style={s.quizTitle}>{question.prompt}</Text><View style={s.quizAnswers}>{question.answers.map((answer, index) => {
    const chosen = selected === index;
    const good = revealed && index === question.correctIndex;
    const bad = revealed && chosen && !good;
    return <Pressable key={answer} disabled={revealed} accessibilityRole="radio" accessibilityState={{ checked: chosen }} onPress={() => onSelect(index)} style={({ pressed }) => [s.answer, chosen && s.answerChosen, good && s.answerGood, bad && s.answerBad, pressed && !revealed && s.pressed]}><View style={[s.radio, chosen && s.radioChosen, good && s.done, bad && s.radioBad]}>{chosen || good ? <Feather name={good ? 'check' : bad ? 'x' : 'circle'} size={13} color={palette.white} /> : null}</View><Text style={s.answerText}>{answer}</Text></Pressable>;
  })}</View>{revealed ? <MotionView style={[s.feedback, isCorrect ? s.feedbackGood : s.feedbackBad]} distance={6} duration={motion.quick} accessibilityLiveRegion="polite"><View style={s.feedbackSymbol}>{isCorrect ? <Text style={s.feedbackEmoji} accessibilityLabel={t('lesson.correctFeedback')}>👏</Text> : <Feather name="info" size={20} color={palette.rose} />}</View><View style={s.flexEnd}><Text style={s.smallStrong}>{isCorrect ? t('lesson.correctFeedback') : t('lesson.retryFeedback')}</Text><Text style={s.hint}>{question.explanation}</Text></View></MotionView> : null}</View>;
}

function CelebrationBurst({ icon, tone }: { icon: IconName; tone: 'success' | 'gold' }) {
  const color = tone === 'success' ? palette.success : palette.saffron;
  return <View style={s.celebrationStage} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    {[s.sparkOne, s.sparkTwo, s.sparkThree, s.sparkFour, s.sparkFive, s.sparkSix].map((position, index) => <MotionView key={index} style={[s.celebrationSpark, position]} delay={index * 35} distance={index % 2 ? 10 : -10} duration={motion.standard}><Feather name={index % 2 ? 'star' : 'circle'} size={index % 2 ? 17 : 10} color={index % 3 ? palette.saffron : palette.primary} /></MotionView>)}
    <MotionView style={[s.resultIcon, { backgroundColor: color }]} distance={12} duration={motion.relaxed}><Feather name={icon} size={38} color={palette.white} /></MotionView>
  </View>;
}

function RewardChip({ icon, value, label }: { icon: IconName; value: string; label: string }) {
  return <View style={s.rewardChip}><View style={s.rewardChipIcon}><Feather name={icon} size={17} color={palette.goldInk} /></View><View style={s.flexEnd}><Text style={s.rewardValue}>{value}</Text><Text style={s.rewardLabel}>{label}</Text></View></View>;
}

type TestProps = NativeStackScreenProps<RootStackParamList, 'Test'>;
function TestScreen({ route, navigation }: TestProps) {
  const { stage, count, mode, subjectId } = route.params;
  const { state, recordTestAttempt } = useLearner();
  const { playMilestone } = useSoundFeedback();
  const { t, formatNumber, legalTitle, language } = useI18n();
  const sourceQuestions = useMemo(() => buildBalancedTestQuestions(stage, count, subjectId), [stage, count, subjectId]);
  const questions = useMemo(() => sourceQuestions.map((question) => localizeQuestion(question, language)), [sourceQuestions, language]);
  const duration = mode === 'mock' || mode === 'fullMock' ? 153 * 60 : mode === 'diagnostic' ? 45 * 60 : 15 * 60;
  const [remaining, setRemaining] = useState(duration);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [inBreak, setInBreak] = useState(false);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [earnedXp, setEarnedXp] = useState(0);
  const [startedAt] = useState(Date.now);
  const question = questions[index]!;
  const answered = Object.keys(answers).length;
  const currentAnswered = answers[question.id] !== undefined;

  const finishTest = () => {
    if (finished) return;
    const right = questions.filter((item) => answers[item.id] === item.correctIndex).length;
    const percent = Math.round((right / questions.length) * 100);
    const subjectScores = Object.fromEntries(stageSubjects(stage).map<[string, SubjectScore]>((subject) => {
      const subjectQuestions = questions.filter((item) => item.subjectId === subject.id);
      const subjectCorrect = subjectQuestions.filter((item) => answers[item.id] === item.correctIndex).length;
      return [subject.id, { correct: subjectCorrect, total: subjectQuestions.length, score: subjectQuestions.length ? Math.round((subjectCorrect / subjectQuestions.length) * 100) : 0 }];
    }).filter(([, result]) => result.total > 0));
    const firstTestToday = !state.testHistory.some((item) => localDateKey(new Date(item.completedAt)) === localDateKey());
    setEarnedXp(testXp(right, questions.length, mode) + (firstTestToday ? 25 : 0));
    setCorrect(right); setScore(percent); setFinished(true);
    recordTestAttempt({ stage, mode, score: percent, correct: right, total: questions.length, durationSeconds: Math.round((Date.now() - startedAt) / 1000), subjectScores });
    playMilestone();
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  useEffect(() => {
    if (finished || inBreak) return;
    const timer = setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [finished, inBreak]);

  useEffect(() => {
    if (remaining !== 0 || finished || inBreak) return;
    if (mode === 'fullMock' && index < 90) setInBreak(true);
    else finishTest();
  }, [remaining, finished, inBreak, index, mode]);

  const submit = () => {
    if (answered < questions.length) {
      Alert.alert(t('test.finishTitle'), t('test.unanswered', { count: formatNumber(questions.length - answered) }), [{ text: t('test.continue'), style: 'cancel' }, { text: t('test.submitResult'), onPress: finishTest }]);
    } else finishTest();
  };
  const toggleFlag = () => setFlagged((items) => items.includes(question.id) ? items.filter((id) => id !== question.id) : [...items, question.id]);
  const time = `${Math.floor(remaining / 60).toString().padStart(2,'0')}:${(remaining % 60).toString().padStart(2,'0')}`;
  const modeTitle = mode === 'fullMock' ? t('practice.full') : mode === 'mock' ? t('practice.mock') : mode === 'diagnostic' ? t('practice.diagnostic') : t('practice.quick');
  const sessionNumber = mode === 'fullMock' && index >= 90 ? 2 : 1;
  const sessionQuestion = mode === 'fullMock' ? (index % 90) + 1 : index + 1;
  const nextQuestion = () => {
    if (mode === 'fullMock' && index === 89) {
      setInBreak(true);
      return;
    }
    if (index === questions.length - 1) submit();
    else setIndex(index + 1);
  };

  if (finished) {
    const breakdown = stageSubjects(stage).map((subject) => {
      const subjectQuestions = questions.filter((item) => item.subjectId === subject.id);
      const subjectCorrect = subjectQuestions.filter((item) => answers[item.id] === item.correctIndex).length;
      return { subject, total: subjectQuestions.length, correct: subjectCorrect, score: subjectQuestions.length ? Math.round(subjectCorrect / subjectQuestions.length * 100) : 0 };
    }).filter((item) => item.total);
    return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.testPage}><TopBar onBack={navigation.goBack} /><View style={s.result}><CelebrationBurst icon={score>=70?'award':'trending-up'} tone={score>=70?'success':'gold'} /><Text style={s.eyebrow}>{t('test.result', { stage })}</Text><Text style={s.pathHeroTitle}>{modeTitle}</Text><Text style={s.score}>{formatNumber(score)}%</Text><View style={s.rewardRow}><RewardChip icon="zap" value={`+${formatNumber(earnedXp)} XP`} label="XP" /><RewardChip icon="check-circle" value={formatNumber(correct)} label={t('common.correct')} /></View><Text style={s.centerBody}>{formatNumber(correct)}/{formatNumber(questions.length)} {t('common.correct')}</Text></View><SectionTitle title={t('test.breakdown')} /><View style={s.list}>{breakdown.map(({subject,total,correct:subjectCorrect,score:subjectScore})=><View key={subject.id} style={s.breakdownRow}><View style={s.flexEnd}><Text style={s.modeTitle}>{legalTitle(subject.title, subject.englishTitle)}</Text><Text style={s.hint}>{formatNumber(subjectCorrect)}/{formatNumber(total)} {t('common.correct')}</Text></View><View style={s.breakdownScore}><Text style={s.smallStrong}>{formatNumber(subjectScore)}%</Text></View></View>)}</View><ActionButton label={t('test.back')} icon="arrow-right" onPress={navigation.goBack} fullWidth /><Notice /></ScrollView></SafeAreaView>;
  }

  if (inBreak) {
    return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.testPage}><TopBar onBack={navigation.goBack} /><View style={s.result}><View style={s.resultIcon}><Feather name="coffee" size={36} color={palette.white} /></View><Text style={s.eyebrow}>{t('test.sessionOneComplete', { stage })}</Text><Text style={s.pathHeroTitle}>{t('test.breakTitle')}</Text><Text style={s.centerBody}>{t('test.breakBody', { count: formatNumber(Math.min(90, answered)) })}</Text><ActionButton label={t('test.startSecond')} icon="arrow-left" onPress={() => { setIndex(90); setRemaining(153 * 60); setInBreak(false); }} fullWidth /></View><View style={s.examNote}><Feather name="shield" size={20} color={palette.primary} /><View style={s.flexEnd}><Text style={s.smallStrong}>{t('test.boundaryTitle')}</Text><Text style={s.hint}>{t('test.boundaryBody')}</Text></View></View><Notice /></ScrollView></SafeAreaView>;
  }

  return <SafeAreaView style={s.safe}>
    <View style={s.testTop}><RoundIcon icon="x" label={t('test.exit')} onPress={navigation.goBack} /><View style={s.testHeading}><Text style={s.smallStrong}>{stage} · {modeTitle}{mode === 'fullMock' ? ` · ${formatNumber(sessionNumber)}` : ''}</Text><Text style={s.hint}>{t('test.question', { current: formatNumber(sessionQuestion), total: formatNumber(mode === 'fullMock' ? 90 : questions.length) })}</Text></View><View style={[s.timer,remaining<300&&s.timerUrgent]}><Feather name="clock" size={16} color={remaining<300?palette.rose:palette.primary} /><Text style={[s.timerText,remaining<300&&{color:palette.rose}]}>{time}</Text></View></View>
    <ProgressBar value={((index + 1) / questions.length) * 100} />
    <ScrollView contentContainerStyle={s.testPage}>
      <MotionView style={s.testMotion} replayKey={index} distance={10}>
      <View style={s.questionMeta}><Text style={s.hint}>{pathwayById[question.subjectId] ? legalTitle(pathwayById[question.subjectId]!.title, pathwayById[question.subjectId]!.englishTitle) : ''}</Text><Pressable accessibilityRole="button" accessibilityState={{selected:flagged.includes(question.id)}} onPress={toggleFlag} style={({pressed})=>[s.flagButton,flagged.includes(question.id)&&s.flagActive,pressed&&s.pressed]}><Feather name="flag" size={17} color={flagged.includes(question.id)?palette.saffron:palette.muted} /><Text style={s.hint}>{flagged.includes(question.id)?t('test.flagged'):t('test.flag')}</Text></Pressable></View>
      {language !== 'fa' ? <View style={s.translationInline}><Feather name="globe" size={17} color={palette.primary} /><Text style={s.translationInlineText}>{t('language.contentFallback')}</Text></View> : null}
      <Text style={s.quizTitle}>{question.prompt}</Text>
      <View style={s.quizAnswers}>{question.answers.map((answer,answerIndex)=>{const chosen=answers[question.id]===answerIndex;return <Pressable key={answerIndex} accessibilityRole="radio" accessibilityState={{checked:chosen}} onPress={()=>setAnswers((items)=>({...items,[question.id]:answerIndex}))} style={({pressed})=>[s.answer,chosen&&s.answerChosen,pressed&&s.pressed]}><View style={[s.radio,chosen&&s.radioChosen]}>{chosen?<Feather name="check" size={13} color={palette.white}/>:null}</View><Text style={s.answerText}>{answer}</Text></Pressable>})}</View>
      {!currentAnswered ? <Text accessibilityLiveRegion="polite" style={s.requiredAnswer}>{t('test.answerRequired')}</Text> : null}
      <View style={s.questionNav}><ActionButton label={t('test.previous')} icon="arrow-right" variant="quiet" onPress={()=>setIndex(Math.max(0,index-1))} disabled={index===0 || (mode === 'fullMock' && index === 90)} /><ActionButton label={index===questions.length-1?t('test.finish'):t('test.next')} icon="arrow-left" onPress={nextQuestion} disabled={!currentAnswered} /></View>
      <Text style={s.centerBody}>{formatNumber(answered)}/{formatNumber(questions.length)} · {formatNumber(flagged.length)} {t('test.flagged')}</Text>
      </MotionView>
    </ScrollView>
  </SafeAreaView>;
}

function Review() {
  const { state, reviewAnswer } = useLearner();
  const { playCorrect, playIncorrect } = useSoundFeedback();
  const { t, formatNumber, legalTitle, language } = useI18n();
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const due = state.reviewQueue.filter((entry) => new Date(entry.dueAt) <= new Date());
  const record = due[0];
  const lesson = record ? lessonById[record.lessonId] : undefined;
  const sourceQuestion = lesson?.quiz.find((entry) => entry.id === record!.questionId);
  const question = useMemo(() => sourceQuestion ? localizeQuestion(sourceQuestion, language) : undefined, [sourceQuestion, language]);
  const advance = () => {
    if (!record || !question || selected === null) return;
    if (!revealed) {
      const correct = selected === question.correctIndex;
      setRevealed(true);
      if (correct) playCorrect();
      else playIncorrect();
      void Haptics.notificationAsync(correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning);
      return;
    }
    reviewAnswer(record!.questionId, selected === question.correctIndex);
    setSelected(null); setRevealed(false);
  };
  return <Page><Header eyebrow={t('nav.review')} title={t('review.title')} subtitle={t('review.subtitle')} /><View style={s.stats}><Stat icon="inbox" value={formatNumber(due.length)} label={t('review.now')} color={palette.primary} soft={palette.primarySoft} /><Stat icon="calendar" value={formatNumber(state.reviewQueue.length - due.length)} label={t('review.later')} color={palette.teal} soft={palette.tealSoft} /></View>{question ? <View style={s.list}><Text style={s.hint}>{lesson ? legalTitle(lesson.title, lesson.englishTitle) : ''}</Text><QuizCard question={question} selected={selected} revealed={revealed} onSelect={setSelected} /><ActionButton label={revealed ? t('lesson.nextQuestion') : t('lesson.checkAnswer')} icon="arrow-left" onPress={advance} disabled={selected === null} sound={revealed} fullWidth /></View> : <Empty icon="check-circle" title={t('review.done')} body={t('review.subtitle')} />}<Notice /></Page>;
}

function Practice() {
  const nav = useRootNav();
  const { state } = useLearner();
  const { t, formatNumber, locale } = useI18n();
  const modes: { mode: TestMode; count: number; title: string; subtitle: string; icon: IconName }[] = [
    { mode: 'quick', count: 10, title: t('practice.quick'), subtitle: `${formatNumber(10)} ${t('common.questions')} · 15 min`, icon: 'zap' },
    { mode: 'diagnostic', count: 30, title: t('practice.diagnostic'), subtitle: `${formatNumber(30)} ${t('common.questions')} · diagnostic`, icon: 'activity' },
    { mode: 'mock', count: 90, title: t('practice.mock'), subtitle: `${formatNumber(90)} ${t('common.questions')} · 153 min`, icon: 'clock' },
    { mode: 'fullMock', count: 180, title: t('practice.full'), subtitle: `${formatNumber(180)} ${t('common.questions')} · 2 × 153 min`, icon: 'shield' },
  ];
  const best = (stage: SqeStage) => {
    const scores = state.testHistory.filter((item) => item.stage === stage).map((item) => item.score);
    return scores.length ? formatNumber(Math.max(...scores)) + '%' : '—';
  };
  return <Page>
    <Header eyebrow="SQE1" title={t('practice.title')} subtitle={t('practice.subtitle', { count: formatNumber(sqeTotals.practiceQuestions) })} />
    <View style={s.examGrid}>{(['FLK1','FLK2'] as SqeStage[]).map((stage) => <View key={stage} style={s.examPanel}><View style={s.between}><View style={[s.pathIcon,{backgroundColor:stage==='FLK1'?palette.primarySoft:palette.tealSoft}]}><Feather name={stage==='FLK1'?'briefcase':'home'} size={23} color={stage==='FLK1'?palette.primary:palette.teal} /></View><View style={s.flexEnd}><Text style={s.examStage}>{stage}</Text><Text style={s.hint}>{formatNumber(stageSubjects(stage).length)} · {best(stage)}</Text></View></View><View style={s.list}>{modes.map((item) => <Pressable key={item.mode} accessibilityRole="button" onPress={() => nav.navigate('Test',{stage,count:item.count,mode:item.mode})} style={({pressed})=>[s.modeRow,pressed&&s.pressed]}><View style={s.modeIcon}><Feather name={item.icon} size={19} color={palette.primary} /></View><View style={s.flexEnd}><Text style={s.modeTitle}>{item.title}</Text><Text style={s.hint}>{item.subtitle}</Text></View><DirectionalChevron size={20} color={palette.muted} /></Pressable>)}</View></View>)}</View>
    <View style={s.examNote}><Feather name="info" size={20} color={palette.primary} /><View style={s.flexEnd}><Text style={s.smallStrong}>{t('practice.full')}</Text><Text style={s.hint}>{t('practice.subtitle', { count: formatNumber(180) })} · Annex 4 · 2 × 90 · 2 × 153 min</Text></View></View>
    <SectionTitle title={t('practice.recent')} />
    {state.testHistory.length ? <View style={s.list}>{state.testHistory.slice(0,6).map((item)=><View key={item.id} style={s.historyRow}><View style={[s.scoreBadge,{backgroundColor:item.score>=70?palette.tealSoft:palette.saffronSoft}]}><Text style={s.scoreBadgeText}>{formatNumber(item.score)}%</Text></View><View style={s.flexEnd}><Text style={s.cardTitle}>{item.stage} · {formatNumber(item.total)} {t('common.questions')}</Text><Text style={s.hint}>{new Date(item.completedAt).toLocaleDateString(locale)} · {formatNumber(item.correct)} {t('common.correct')}</Text></View></View>)}</View>:<Empty icon="bar-chart-2" title={t('practice.empty')} body={t('practice.subtitle', { count: formatNumber(sqeTotals.practiceQuestions) })} />}
    <Notice />
  </Page>;
}

type InsightsProps = NativeStackScreenProps<RootStackParamList, 'Insights'>;
function InsightsScreen({ navigation }: InsightsProps) {
  const { state, streak } = useLearner();
  const { t, formatNumber, legalTitle, locale } = useI18n();
  const analytics = useMemo(() => buildLearningAnalytics(state, locale), [state, locale]);
  const [track, setTrack] = useState<SqeStage>('FLK1');
  const visibleSubjects = analytics.subjectInsights.filter((item) => item.track === track);
  const readinessLabel = analytics.readiness >= 75 ? t('insights.readyGood') : analytics.readiness >= 55 ? t('insights.readyProgress') : t('insights.readyFoundation');
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={[s.detailPage, s.insightsPage]}>
        <TopBar onBack={navigation.goBack} />
        <MotionView style={s.insightsMotion} distance={14} duration={motion.relaxed}>
          <View style={s.insightsHero}>
            <View style={s.insightsGlow} />
            <View style={s.readinessScore}><Text style={s.readinessNumber}>{formatNumber(analytics.readiness)}%</Text><Text style={s.readinessCaption}>{t('insights.index')}</Text></View>
            <View style={s.insightsHeroCopy}><View style={s.insightsBadge}><Feather name="activity" size={15} color={palette.goldInk} /><Text style={s.insightsBadgeText}>{readinessLabel}</Text></View><Text style={s.insightsTitle}>{t('insights.reportTitle')}</Text><Text style={s.insightsSubtitle}>{t('insights.reportSubtitle')}</Text><View style={s.readinessProgress}><ProgressBar value={analytics.readiness} color={palette.saffron} trackColor={palette.overlayBorder} /></View><Text style={s.readinessTarget}>{t('insights.target')}</Text></View>
          </View>

          <View style={s.insightMetrics}>
            <InsightMetric icon="book-open" value={formatNumber(analytics.completedCount)} label={t('insights.completedLessons')} color={palette.primary} soft={palette.primarySoft} />
            <InsightMetric icon="clock" value={formatNumber(analytics.studyMinutes)} label={t('insights.studyMinutes')} color={palette.teal} soft={palette.tealSoft} />
            <InsightMetric icon="award" value={`${formatNumber(analytics.averageTest)}%`} label={t('insights.averageTest')} color={palette.saffron} soft={palette.saffronSoft} />
            <InsightMetric icon="activity" value={formatNumber(streak)} label={t('insights.activeDays')} color={palette.rose} soft={palette.roseSoft} />
          </View>

          <SectionTitle title={t('insights.rhythm')} />
          <WeeklyActivityChart items={analytics.activity} />

          <View style={s.insightColumns}>
            <InsightPanel title={t('insights.strengths')} subtitle={t('insights.strengthsSubtitle')} icon="trending-up" color={palette.teal} soft={palette.tealSoft} items={analytics.strengths} empty={t('insights.strengthsEmpty')} />
            <InsightPanel title={t('insights.priorities')} subtitle={t('insights.prioritiesSubtitle')} icon="target" color={palette.rose} soft={palette.roseSoft} items={analytics.weaknesses} empty={t('insights.prioritiesEmpty')} />
          </View>

          <View style={s.between}><SectionTitle title={t('insights.masteryMap')} /><View style={s.insightLegend}><View style={[s.legendDot, { backgroundColor: palette.primary }]} /><Text style={s.hint}>{t('insights.measurable')}</Text></View></View>
          <View style={s.trackTabs}>{(['FLK1', 'FLK2'] as SqeStage[]).map((item) => <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: track === item }} onPress={() => setTrack(item)} style={({ pressed }) => [s.trackTab, track === item && s.trackTabActive, pressed && s.pressed]}><Text style={[s.trackTabText, track === item && s.trackTabTextActive]}>{item}</Text></Pressable>)}</View>
          <View style={s.masteryList}>{visibleSubjects.map((item) => <SubjectBullet key={item.id} item={item} />)}</View>

          <View style={s.insightNote}><View style={s.insightNoteIcon}><Feather name="compass" size={22} color={palette.primary} /></View><View style={s.flexEnd}><Text style={s.modeTitle}>{t('insights.smartNext')}</Text><Text style={s.hint}>{analytics.weaknesses[0] ? t('insights.smartWeakness', { subject: legalTitle(analytics.weaknesses[0].title, analytics.weaknesses[0].englishTitle) }) : t('insights.smartStart')}</Text></View></View>
          <Notice />
        </MotionView>
      </ScrollView>
    </SafeAreaView>
  );
}

function HomeInsights({ analytics, onPress }: { analytics: LearningAnalytics; onPress: () => void }) {
  const focus = analytics.weaknesses[0];
  const { t, formatNumber, legalTitle } = useI18n();
  return <View style={s.insightsTeaser}><View style={s.teaserTop}><View style={s.teaserIcon}><Feather name="bar-chart-2" size={24} color={palette.white} /></View><View style={s.flexEnd}><Text style={s.teaserEyebrow}>{t('insights.eyebrow')}</Text><Text style={s.teaserTitle}>{t('insights.readiness', { count: formatNumber(analytics.readiness) })}</Text></View></View><View style={s.teaserProgress}><ProgressBar value={analytics.readiness} color={palette.saffron} trackColor={palette.overlayBorder} /></View><View style={s.teaserBottom}><View style={s.teaserSignal}><Feather name={focus ? 'target' : 'activity'} size={17} color={palette.saffron} /><Text style={s.teaserSignalText}>{focus ? t('insights.focus', { subject: legalTitle(focus.title, focus.englishTitle) }) : t('insights.firstTest')}</Text></View><ActionButton label={t('insights.view')} icon="arrow-left" variant="secondary" onPress={onPress} /></View></View>;
}

function InsightMetric({ icon, value, label, color, soft }: { icon: IconName; value: string; label: string; color: string; soft: string }) {
  return <View style={s.insightMetric}><View style={[s.insightMetricIcon, { backgroundColor: soft }]}><Feather name={icon} size={19} color={color} /></View><Text style={s.insightMetricValue}>{value}</Text><Text style={s.insightMetricLabel}>{label}</Text></View>;
}

function WeeklyActivityChart({ items }: { items: LearningAnalytics['activity'] }) {
  const { t, formatNumber } = useI18n();
  const max = Math.max(1, ...items.map((item) => item.value));
  const activeDays = items.filter((item) => item.active).length;
  return <View style={s.activityCard} accessible accessibilityRole="summary" accessibilityLabel={t('insights.activeSummary', { count: formatNumber(activeDays) })}><View style={s.activityHeader}><View style={s.activitySummary}><Text style={s.activitySummaryValue}>{formatNumber(activeDays)}</Text><Text style={s.hint}>{t('insights.activeDay')}</Text></View><View style={s.flexEnd}><Text style={s.modeTitle}>{t('insights.consistencyTitle')}</Text><Text style={s.hint}>{t('insights.consistencyBody')}</Text></View></View><View style={s.activityBars}>{items.map((item) => { const height = item.value ? Math.max(18, Math.round((item.value / max) * 104)) : 8; return <View key={item.key} style={s.activityColumn} accessible accessibilityLabel={t('insights.activityLabel', { day: item.label, count: formatNumber(item.value) })}><View style={s.activityValueSlot}>{item.value ? <Text style={s.activityValue}>{formatNumber(item.value)}</Text> : null}</View><View style={[s.activityBar, { height, backgroundColor: item.active ? palette.primary : palette.line }]} /><Text style={[s.activityDay, item.active && s.activityDayActive]}>{item.label}</Text></View>; })}</View></View>;
}

function InsightPanel({ title, subtitle, icon, color, soft, items, empty }: { title: string; subtitle: string; icon: IconName; color: string; soft: string; items: SubjectInsight[]; empty: string }) {
  const { t, formatNumber, legalTitle } = useI18n();
  return <View style={s.insightPanel}><View style={s.panelHeader}><View style={[s.panelIcon, { backgroundColor: soft }]}><Feather name={icon} size={21} color={color} /></View><View style={s.flexEnd}><Text style={s.panelTitle}>{title}</Text><Text style={s.hint}>{subtitle}</Text></View></View>{items.length ? <View style={s.panelList}>{items.map((item) => <View key={item.id} style={s.panelRow}><View style={[s.panelScore, { backgroundColor: soft }]}><Text style={[s.panelScoreText, { color }]}>{formatNumber(item.score)}%</Text></View><View style={s.flexEnd}><Text style={s.panelSubject}>{legalTitle(item.title, item.englishTitle)}</Text><Text style={s.englishSmall}>{item.track} · {t('insights.assessments', { count: formatNumber(item.evidenceCount) })}</Text></View></View>)}</View> : <View style={s.panelEmpty}><Text style={s.hint}>{empty}</Text></View>}</View>;
}

function SubjectBullet({ item }: { item: SubjectInsight }) {
  const { t, formatNumber, legalTitle, secondaryLegalTitle } = useI18n();
  const measured = item.evidenceCount > 0;
  const value = measured ? item.score : item.coverage;
  const status = measured ? (item.status === 'strong' ? t('insights.statusStrong') : item.status === 'developing' ? t('insights.statusDeveloping') : t('insights.statusFocus')) : t('insights.statusUnmeasured');
  const color = !measured ? palette.muted : item.status === 'strong' ? palette.teal : item.status === 'developing' ? palette.saffron : palette.rose;
  const soft = !measured ? palette.surfaceMuted : item.status === 'strong' ? palette.tealSoft : item.status === 'developing' ? palette.saffronSoft : palette.roseSoft;
  const secondary = secondaryLegalTitle(item.title, item.englishTitle);
  return <View style={s.masteryRow}><View style={s.masteryHeading}><View style={[s.masteryStatus, { backgroundColor: soft }]}><Text style={[s.masteryStatusText, { color }]}>{status}</Text></View><View style={s.flexEnd}><Text style={s.masteryTitle}>{legalTitle(item.title, item.englishTitle)}</Text>{secondary ? <Text style={s.englishSmall}>{secondary}</Text> : null}</View></View><View style={s.masteryNumbers}><Text style={s.hint}>{measured ? t('insights.assessments', { count: formatNumber(item.evidenceCount) }) : t('insights.lessonCoverage', { count: formatNumber(item.coverage) })}</Text><Text style={[s.masteryScore, { color }]}>{formatNumber(value)}%</Text></View><ProgressBar value={value} color={color} trackColor={soft} /></View>;
}

function Profile() {
  const nav = useRootNav();
  const { state, cloud, streak, updateSettings, signOut, resetProgress } = useLearner();
  const { previewTap } = useSoundFeedback();
  const { t, formatNumber, isRtl } = useI18n();
  const [name, setName] = useState(state.name);
  const [nameError, setNameError] = useState('');
  const saveName = () => {
    if (name.trim().length < 2) {
      setNameError(t('profile.nameError'));
      return;
    }
    updateSettings({ name: name.trim() });
    setNameError('');
  };
  const reset = () => Alert.alert(t('profile.resetTitle'), t('profile.resetBody'), [{ text: t('profile.cancel'), style: 'cancel' }, { text: t('profile.erase'), style: 'destructive', onPress: () => void resetProgress() }]);
  return (
    <Page>
      <Header eyebrow={t('profile.eyebrow')} title={t('profile.title')} subtitle={state.accountMode === 'cloud' ? t('profile.cloudSubtitle') : t('profile.subtitle')} />
      <View style={s.profile}>
        <View style={s.avatar}><Feather name="user" size={30} color={palette.white} /></View>
        <View style={s.flexEnd}><Text style={s.profileName}>{state.name}</Text><Text style={s.profileHandle}>@{state.username}</Text><Text style={s.profileMeta}>{formatNumber(state.completedLessons.length)} {t('common.lessons')} · {formatNumber(streak)} {t('home.streak')}</Text></View>
      </View>
      <View style={s.settings}>
        <Text style={s.sectionTitle}>{t('profile.details')}</Text>
        <RequiredLabel text={t('auth.displayName')} />
        <View style={s.nameRow}>
          <TextInput value={name} onChangeText={(value) => { setName(value); setNameError(''); }} style={[s.nameInput, Boolean(nameError) && s.inputError]} textAlign={isRtl ? 'right' : 'left'} accessibilityLabel={t('auth.displayName')} />
          <Pressable accessibilityRole="button" accessibilityLabel={t('common.save')} onPress={saveName} style={({ pressed }) => [s.save, pressed && s.pressed]}><Text style={s.saveText}>{t('common.save')}</Text></Pressable>
        </View>
        <FieldError message={nameError} />
        <View style={s.accountIdentity}><View style={s.iconSmall}><Feather name="at-sign" size={19} color={palette.primary} /></View><View style={s.flexEnd}><Text style={s.label}>{t('auth.username')}</Text><Text style={s.accountUsername}>{state.username}</Text>{state.email ? <Text style={s.accountEmail}>{state.email}</Text> : null}</View></View>
        {state.accountMode === 'cloud' ? <View style={s.accountIdentity}><View style={s.iconSmall}><Feather name="cloud" size={19} color={cloud.syncStatus === 'error' ? palette.rose : palette.teal} /></View><View style={s.flexEnd}><Text style={s.label}>{t('profile.cloudSync')}</Text><Text style={s.hint}>{cloud.syncStatus === 'syncing' ? t('profile.syncing') : cloud.syncStatus === 'error' ? t('profile.syncError') : t('profile.synced')}</Text></View></View> : null}
        <Text style={s.label}>{t('auth.dailyGoal')}</Text>
        <GoalPicker value={state.dailyGoal} onChange={(dailyGoal) => updateSettings({ dailyGoal })} />
      </View>
      <View style={s.settings}>
        <Text style={s.sectionTitle}>{t('profile.preferences')}</Text>
        <View style={s.preferenceHeading}>
          <Text style={s.label}>{t('language.title')}</Text>
          <Text style={s.hint}>{t('profile.contentLanguageHelper')}</Text>
        </View>
        <LanguagePicker value={state.language} onChange={(language) => updateSettings({ language })} />
        <View style={s.preferenceHeading}>
          <Text style={s.label}>{t('profile.appearance')}</Text>
          <Text style={s.hint}>{t('profile.appearanceHelper')}</Text>
        </View>
        <ThemePicker value={state.themeMode} onChange={(themeMode) => updateSettings({ themeMode })} />
        <View style={s.settingRow}>
          <View style={s.iconSmall}><Feather name="volume-2" size={19} color={palette.primary} /></View>
          <View style={s.flexEnd}><Text style={s.cardTitle}>{t('profile.sound')}</Text><Text style={s.hint}>{t('profile.soundHelper')}</Text></View>
          <Switch accessibilityLabel={t('profile.sound')} value={state.soundEffectsEnabled} onValueChange={(soundEffectsEnabled) => { updateSettings({ soundEffectsEnabled }); if (soundEffectsEnabled) previewTap(); }} trackColor={{ false: palette.line, true: palette.primarySoft }} thumbColor={state.soundEffectsEnabled ? palette.primary : palette.muted} />
        </View>
      </View>
      <View style={s.settings}>
        <Text style={s.sectionTitle}>{t('profile.contentTransparency')}</Text>
        <View style={s.settingRow}><View style={s.iconSmall}><Feather name="database" size={19} color={palette.primary} /></View><View style={s.flexEnd}><Text style={s.cardTitle}>{t('profile.specCurrent')}</Text><Text style={s.hint}>{t('profile.specSummary', { lessons: formatNumber(sqeTotals.lessons), stations: formatNumber(sqeTotals.sqe2Stations) })}</Text></View></View>
        <View style={s.settingRow}><View style={s.iconSmall}><Feather name="lock" size={19} color={palette.teal} /></View><View style={s.flexEnd}><Text style={s.cardTitle}>{state.accountMode === 'cloud' ? t('profile.cloudPrivacy') : t('profile.offlinePrivacy')}</Text><Text style={s.hint}>{state.accountMode === 'cloud' ? t('profile.cloudPrivacyDetail') : 'PIN · offline-first · no analytics SDK'}</Text></View></View>
        <View style={s.settingRow}><View style={s.iconSmall}><Feather name="alert-circle" size={19} color={palette.rose} /></View><View style={s.flexEnd}><Text style={s.cardTitle}>{t('profile.independent')}</Text><Text style={s.hint}>{t('profile.independentDetail')}</Text></View></View>
      </View>
      <View style={s.settings}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('assistant.title')} onPress={() => nav.navigate('AIChat')} style={({ pressed }) => [s.supportEntry, pressed && s.pressed]}><View style={s.iconSmall}><Feather name="message-circle" size={19} color={palette.primary} /></View><View style={s.flexEnd}><Text style={s.modeTitle}>{t('assistant.title')}</Text><Text style={s.hint}>{onlineAssistantConfigured ? t('assistant.online') : t('assistant.offline')}</Text></View><DirectionalChevron size={20} color={palette.muted} /></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={t('support.title')} onPress={() => nav.navigate('Support')} style={({ pressed }) => [s.supportEntry, pressed && s.pressed]}><View style={s.iconSmall}><Feather name="help-circle" size={19} color={palette.teal} /></View><View style={s.flexEnd}><Text style={s.modeTitle}>{t('support.title')}</Text><Text style={s.hint}>{t('support.subtitle')}</Text></View><DirectionalChevron size={20} color={palette.muted} /></Pressable>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={t('profile.signOut')} onPress={() => void signOut()} style={({ pressed }) => [s.signOut, pressed && s.pressed]}><Feather name="log-out" size={18} color={palette.primary} /><Text style={s.signOutText}>{t('profile.signOut')}</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={t('profile.reset')} onPress={reset} style={({ pressed }) => [s.danger, pressed && s.pressed]}><Feather name="trash-2" size={18} color={palette.rose} /><Text style={s.dangerText}>{t('profile.reset')}</Text></Pressable>
      <Notice />
    </Page>
  );
}

type AIChatProps = NativeStackScreenProps<RootStackParamList, 'AIChat'>;
function AIChatScreen({ navigation }: AIChatProps) {
  const { state } = useLearner();
  const { t, language, isRtl } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const scroll = useRef<ScrollView>(null);
  useEffect(() => {
    requestAnimationFrame(() => scroll.current?.scrollToEnd({ animated: true }));
  }, [messages, busy]);

  const send = async (suggested?: string) => {
    const text = (suggested ?? input).trim();
    if (!text || busy) return;
    if (text.length > 2_000) {
      setError(t('assistant.tooLong'));
      return;
    }
    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setError('');
    setBusy(true);
    try {
      const answer = await askStudyAssistant({
        messages: nextMessages,
        language,
        safetyId: privacySafeLearnerId(state.username),
      });
      setMessages((current) => [...current, { id: `assistant-${Date.now()}`, role: 'assistant', ...answer }]);
    } catch {
      setError(t('assistant.error'));
    } finally {
      setBusy(false);
    }
  };
  const clear = () => Alert.alert(t('assistant.clearTitle'), t('assistant.clearBody'), [
    { text: t('profile.cancel'), style: 'cancel' },
    { text: t('assistant.clear'), style: 'destructive', onPress: () => { setMessages([]); setError(''); } },
  ]);

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.chatPage}>
          <TopBar onBack={navigation.goBack} />
          <View style={s.chatHeading}>
            <View style={s.chatHeadingIcon}><Feather name="message-circle" size={24} color={palette.white} /></View>
            <View style={s.flexEnd}><Text style={s.eyebrow}>{t('assistant.eyebrow')}</Text><Text style={s.pageTitle}>{t('assistant.title')}</Text><Text style={s.body}>{t('assistant.subtitle')}</Text></View>
          </View>
          <View style={s.assistantMode}><Feather name={onlineAssistantConfigured ? 'cloud' : 'book-open'} size={16} color={onlineAssistantConfigured ? palette.teal : palette.goldInk} /><Text style={s.assistantModeText}>{onlineAssistantConfigured ? t('assistant.online') : t('assistant.offline')}</Text></View>
          <View style={s.assistantPrivacy}><Feather name="shield" size={17} color={palette.rose} /><Text style={s.assistantPrivacyText}>{t('assistant.privacy')}</Text></View>
          <ScrollView ref={scroll} style={s.chatMessages} contentContainerStyle={s.chatMessagesContent} keyboardShouldPersistTaps="handled">
            {!messages.length ? <View style={s.chatEmpty}><Text style={s.centerBody}>{t('assistant.empty')}</Text><Text style={s.label}>{t('assistant.suggestions')}</Text><View style={s.suggestionList}>{assistantSuggestions[language].map((suggestion) => <Pressable key={suggestion} accessibilityRole="button" onPress={() => void send(suggestion)} style={({ pressed }) => [s.suggestion, pressed && s.pressed]}><Text style={s.suggestionText}>{suggestion}</Text><DirectionalChevron size={17} color={palette.primary} /></Pressable>)}</View></View> : null}
            {messages.map((message) => <View key={message.id} style={[s.chatBubble, message.role === 'user' ? s.chatBubbleUser : s.chatBubbleAssistant]}><Text style={[s.chatBubbleText, message.role === 'user' && s.chatBubbleTextUser]}>{message.text}</Text>{message.role === 'assistant' ? <Text style={s.chatSource}>{message.mode === 'online' ? t('assistant.online') : t('assistant.offline')}</Text> : null}</View>)}
            {busy ? <View style={[s.chatBubble, s.chatBubbleAssistant, s.chatTyping]}><ActivityIndicator color={palette.primary} /><Text style={s.hint}>{t('common.loading')}</Text></View> : null}
            {error ? <FieldError message={error} /> : null}
          </ScrollView>
          <View style={s.chatComposer}>
            <TextInput value={input} onChangeText={(value) => { setInput(value); setError(''); }} placeholder={t('assistant.placeholder')} placeholderTextColor={palette.muted} multiline maxLength={2_000} textAlign={isRtl ? 'right' : 'left'} style={s.chatInput} accessibilityLabel={t('assistant.placeholder')} />
            <Pressable accessibilityRole="button" accessibilityLabel={t('assistant.send')} accessibilityState={{ disabled: busy || !input.trim() }} disabled={busy || !input.trim()} onPress={() => void send()} style={({ pressed }) => [s.chatSend, (busy || !input.trim()) && s.disabled, pressed && s.pressed]}><Feather name={isRtl ? 'arrow-left' : 'arrow-right'} size={20} color={palette.white} /></Pressable>
          </View>
          {messages.length ? <Pressable accessibilityRole="button" onPress={clear} style={({ pressed }) => [s.chatClear, pressed && s.pressed]}><Feather name="trash-2" size={15} color={palette.muted} /><Text style={s.hint}>{t('assistant.clear')}</Text></Pressable> : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const openExternal = async (url: string) => {
  if (await Linking.canOpenURL(url)) await Linking.openURL(url);
};

type SupportProps = NativeStackScreenProps<RootStackParamList, 'Support'>;
function SupportScreen({ navigation }: SupportProps) {
  const { state, deleteAccount } = useLearner();
  const { t } = useI18n();
  const deleteTitle = state.accountMode === 'cloud' ? t('support.deleteCloud') : t('support.delete');
  const deleteBody = state.accountMode === 'cloud' ? t('support.deleteCloudBody') : t('support.deleteBody');
  const erase = () => Alert.alert(deleteTitle, deleteBody, [
    { text: t('profile.cancel'), style: 'cancel' },
    {
      text: t('auth.resetLocalAction'),
      style: 'destructive',
      onPress: () => {
        void deleteAccount().then((result) => {
          if (!result.ok) Alert.alert(t('support.deleteFailed'), t('support.deleteFailedBody'));
        });
      },
    },
  ]);
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.detailPage}>
        <TopBar onBack={navigation.goBack} />
        <Header eyebrow={t('support.eyebrow')} title={t('support.title')} subtitle={t('support.subtitle')} />
        <View style={s.supportGroup}>
          <SupportRow icon="help-circle" title={t('support.contact')} body={t('support.contactBody')} onPress={() => void openExternal(product.supportUrl)} />
          <SupportRow icon="alert-triangle" title={t('support.report')} body={t('support.reportBody')} onPress={() => void openExternal(product.contentReportUrl)} />
          <SupportRow icon="shield" title={t('support.privacyRequest')} body={t('support.privacyRequestBody')} onPress={() => void openExternal(product.privacyRequestUrl)} />
        </View>
        <View style={s.supportGroup}>
          <SupportRow icon="lock" title={t('support.privacy')} body={t('support.readInApp')} onPress={() => navigation.navigate('Legal', { document: 'privacy' })} />
          <SupportRow icon="file-text" title={t('support.terms')} body={t('support.readInApp')} onPress={() => navigation.navigate('Legal', { document: 'terms' })} />
          <SupportRow icon="copy" title={t('support.rights')} body={t('support.readInApp')} onPress={() => navigation.navigate('Legal', { document: 'rights' })} />
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={deleteTitle} onPress={erase} style={({ pressed }) => [s.dangerSupport, pressed && s.pressed]}><Feather name="trash-2" size={18} color={palette.rose} /><View style={s.flexEnd}><Text style={s.dangerText}>{deleteTitle}</Text><Text style={s.hint}>{deleteBody}</Text></View></Pressable>
        <Text style={s.supportVersion}>{t('support.version', { version: product.version })} · {product.copyright}</Text>
        <Notice />
      </ScrollView>
    </SafeAreaView>
  );
}

function SupportRow({ icon, title, body, onPress }: { icon: IconName; title: string; body: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={({ pressed }) => [s.supportRow, pressed && s.pressed]}><View style={s.iconSmall}><Feather name={icon} size={19} color={palette.primary} /></View><View style={s.flexEnd}><Text style={s.modeTitle}>{title}</Text><Text style={s.hint}>{body}</Text></View><DirectionalChevron size={20} color={palette.muted} /></Pressable>;
}

type LegalProps = NativeStackScreenProps<RootStackParamList, 'Legal'>;
function LegalScreen({ route, navigation }: LegalProps) {
  const { t } = useI18n();
  const document = legalDocuments[route.params.document];
  const publicUrl = route.params.document === 'privacy' ? product.privacyUrl : route.params.document === 'terms' ? product.termsUrl : product.rightsUrl;
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.detailPage}>
        <TopBar onBack={navigation.goBack} />
        <View style={s.legalHero}><View style={s.iconHero}><Feather name={route.params.document === 'privacy' ? 'lock' : route.params.document === 'terms' ? 'file-text' : 'copy'} size={27} color={palette.primary} /></View><View style={s.flexEnd}><Text style={s.pageTitle}>{document.title}</Text><Text style={s.hint}>{t('legal.updated', { date: document.updated })}</Text></View></View>
        <View style={s.legalDocument}>{document.sections.map((section) => <View key={section.heading} style={s.legalSection}><Text style={s.sectionTitle}>{section.heading}</Text><Text style={s.body}>{section.body}</Text></View>)}</View>
        <ActionButton label={t('support.openWeb')} icon="external-link" variant="secondary" onPress={() => void openExternal(publicUrl)} />
        <Text style={s.supportVersion}>{product.copyright}</Text>
        <Notice />
      </ScrollView>
    </SafeAreaView>
  );
}

function ThemePicker({ value, onChange }: { value: ThemeMode; onChange: (value: ThemeMode) => void }) {
  const { t } = useI18n();
  const choices: Array<{ value: ThemeMode; label: string; icon: IconName }> = [
    { value: 'system', label: t('theme.system'), icon: 'smartphone' },
    { value: 'light', label: t('theme.light'), icon: 'sun' },
    { value: 'dark', label: t('theme.dark'), icon: 'moon' },
  ];
  return (
    <View style={s.themePicker} accessibilityRole="radiogroup">
      {choices.map((choice) => {
        const selected = value === choice.value;
        return (
          <Pressable
            key={choice.value}
            accessibilityRole="radio"
            accessibilityLabel={t('theme.mode', { mode: choice.label })}
            accessibilityState={{ checked: selected, selected }}
            aria-checked={selected}
            onPress={() => onChange(choice.value)}
            style={({ pressed }) => [s.themeChoice, selected && s.themeChoiceActive, pressed && s.pressed]}
          >
            <View style={[s.themeIcon, selected && s.themeIconActive]}><Feather name={choice.icon} size={18} color={selected ? palette.primary : palette.muted} /></View>
            <Text style={[s.themeChoiceText, selected && s.themeChoiceTextActive]}>{choice.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function LanguagePicker({ value, onChange, compact = false }: { value: AppLanguage; onChange: (value: AppLanguage) => void; compact?: boolean }) {
  const { t } = useI18n();
  return <View style={[s.languagePicker, compact && s.languagePickerCompact]} accessibilityRole="radiogroup" accessibilityLabel={t('language.title')}>
    {languageOptions.map((option) => {
      const selected = value === option.code;
      return <Pressable key={option.code} accessibilityRole="radio" accessibilityLabel={`${option.nativeName}, ${option.englishName}`} accessibilityState={{ checked: selected, selected }} onPress={() => onChange(option.code)} style={({ pressed }) => [s.languageChoice, compact && s.languageChoiceCompact, selected && s.languageChoiceActive, pressed && s.pressed]}>
        <View style={[s.languageCode, selected && s.languageCodeActive]}>{selected ? <Feather name="check" size={14} color={palette.white} /> : <Text style={s.languageCodeText}>{option.shortLabel}</Text>}</View>
        <View style={s.languageChoiceCopy}><Text numberOfLines={1} style={[s.languageNative, selected && s.languageNativeActive]}>{option.nativeName}</Text>{compact ? null : <Text numberOfLines={1} style={s.languageEnglish}>{option.englishName}</Text>}</View>
      </Pressable>;
    })}
  </View>;
}

function Page({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={[s.page, width >= 1100 && s.pageWide]}><MotionView style={s.pageMotion} distance={14} duration={motion.relaxed}>{children}</MotionView></ScrollView></SafeAreaView>;
}
function Header({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return <View style={s.header}><Brand /><View style={s.flexEnd}><View style={s.headerEyebrow}><View style={s.headerDot} /><Text style={s.eyebrow}>{eyebrow}</Text></View><Text style={s.pageTitle}>{title}</Text><Text style={s.body}>{subtitle}</Text></View></View>;
}
function TopBar({ onBack }: { onBack: () => void }) { const { t, isRtl } = useI18n(); return <View style={s.topBar}><Brand /><RoundIcon icon={isRtl ? 'arrow-right' : 'arrow-left'} label={t('common.back')} onPress={onBack} /></View>; }
function DirectionalChevron({ size, color }: { size: number; color: string }) { const { isRtl } = useI18n(); return <Feather name={isRtl ? 'chevron-left' : 'chevron-right'} size={size} color={color} />; }
function RoundIcon({ icon, label, onPress, active }: { icon: IconName; label: string; onPress: () => void; active?: boolean }) { return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [s.round, pressed && s.pressed]}><Feather name={icon} size={21} color={active ? palette.primary : palette.ink} /></Pressable>; }
function GoalPicker({ value, onChange }: { value: number; onChange: (value: number) => void }) { const { t, formatNumber } = useI18n(); return <View style={s.goalRow}>{[1, 2, 3].map((item) => <Pressable key={item} accessibilityRole="radio" accessibilityLabel={`${formatNumber(item)} ${t('common.lessons')}`} accessibilityState={{ checked: value === item }} onPress={() => onChange(item)} style={({ pressed }) => [s.goalChoice, value === item && s.goalActive, pressed && s.pressed]}><Text style={[s.goalNumber, value === item && s.goalNumberActive]}>{formatNumber(item)}</Text><Text style={s.hint}>{t('common.lesson')}</Text></Pressable>)}</View>; }
function SectionTitle({ title }: { title: string }) { return <View style={s.sectionHeading}><View style={s.sectionMarker} /><Text style={s.sectionTitle}>{title}</Text></View>; }
function Pill({ icon, text }: { icon: IconName; text: string }) { return <View style={s.pill}><Feather name={icon} size={14} color={palette.goldInk} /><Text style={s.pillText}>{text}</Text></View>; }
function Meta({ icon, text }: { icon: IconName; text: string }) { return <View style={s.meta}><Feather name={icon} size={14} color={palette.muted} /><Text style={s.hint}>{text}</Text></View>; }
function Stat({ icon, value, label, color, soft }: { icon: IconName; value: string; label: string; color: string; soft: string }) { return <View style={s.stat}><View style={[s.statAccent, { backgroundColor: color }]} /><View style={[s.iconSmall, { backgroundColor: soft }]}><Feather name={icon} size={20} color={color} /></View><Text style={s.statValue}>{value}</Text><Text style={s.hint}>{label}</Text></View>; }
function PathCard({ item, onPress }: { item: Pathway; onPress: () => void }) {
  const { state } = useLearner();
  const { t, formatNumber, legalTitle, secondaryLegalTitle, language } = useI18n();
  const complete = item.lessonIds.filter((id) => state.completedLessons.includes(id)).length;
  const percent = Math.round((complete / item.lessonIds.length) * 100);
  const progressLabel = percent ? `${formatNumber(percent)}% ${t('common.completed')}` : t('common.notStarted');
  const levelLabel = item.track === 'SQE2'
    ? t('learn.level.practical')
    : item.track
      ? item.level
      : t(item.id === 'immigration' ? 'learn.level.beginnerIntermediate' : ['housing', 'police'].includes(item.id) ? 'learn.level.applied' : 'learn.level.beginner');
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${legalTitle(item.title, item.englishTitle)}, ${progressLabel}`} onPress={onPress} style={({ pressed }) => [s.pathCard, pressed && s.pathCardPressed]}>
      <ImageBackground source={subjectArtFor(item.id)} resizeMode="cover" style={s.pathArtwork} imageStyle={s.pathArtworkImage} accessible={false} accessibilityIgnoresInvertColors>
        <View style={s.pathArtScrim} />
        <View style={s.pathArtFade} />
        <View style={s.pathArtFadeSoft} />
        <View style={s.pathCardContent}>
          <View style={s.between}>
            <View style={s.pathIconOnImage}><Feather name={item.icon} size={22} color={palette.white} /></View>
            <View style={s.pathLevel}><Text style={s.pathLevelText}>{levelLabel}</Text></View>
          </View>
          <View style={s.pathCopyOnImage}>
            <Text style={s.pathTitleOnImage}>{legalTitle(item.title, item.englishTitle)}</Text>
            {secondaryLegalTitle(item.title, item.englishTitle) ? <Text style={s.pathEnglishOnImage}>{secondaryLegalTitle(item.title, item.englishTitle)}</Text> : null}
            <Text numberOfLines={2} style={s.pathDescriptionOnImage}>{language === 'fa' ? item.description : t('learn.pathwayDescription')}</Text>
          </View>
          <View style={s.pathFooterOnImage}>
            <View style={s.between}><Text style={s.pathProgressText}>{progressLabel}</Text><Text style={s.pathLessonText}>{formatNumber(item.lessonIds.length)} {t('common.lessons')}</Text></View>
            <ProgressBar value={percent} color={palette.saffron} trackColor={palette.overlayBorder} />
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
}
function Empty({ icon, title, body }: { icon: IconName; title: string; body: string }) { return <View style={s.empty}><View style={s.iconHero}><Feather name={icon} size={30} color={palette.primary} /></View><Text style={s.sectionTitle}>{title}</Text><Text style={s.centerBody}>{body}</Text></View>; }
function Notice() { const { t } = useI18n(); return <View style={s.notice}><Feather name="shield" size={16} color={palette.muted} /><Text style={s.noticeText}>{t('notice.legal')}</Text></View>; }
function useRootNav() { return useNavigation<NativeStackNavigationProp<RootStackParamList>>(); }

const createStyles = (palette: AppPalette, isRtl = true) => {
  const shadow = createShadow(palette);
  // Web follows document.dir; reversing again here would turn RTL rows back into LTR.
  const rowDirection = Platform.OS === 'web' ? 'row' : isRtl ? 'row-reverse' : 'row';
  const logicalEnd = isRtl ? 'flex-end' : 'flex-start';
  return StyleSheet.create({
  flex: { flex: 1 },
  flexEnd: { flex: 1, alignItems: logicalEnd },
  safe: { flex: 1, backgroundColor: palette.background },
  pressed: { opacity: 0.84, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.5 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: palette.background },
  loadingLogo: { width: 62, height: 62, borderRadius: 21, backgroundColor: palette.primaryAction, alignItems: 'center', justifyContent: 'center' },
  tabsMobile: { position: 'absolute', left: 12, right: 12, bottom: 10, height: 82, paddingHorizontal: 6, paddingTop: 6, paddingBottom: 6, borderTopWidth: 0, borderWidth: 1, borderColor: palette.line, borderRadius: 26, backgroundColor: palette.surface, ...shadow },
  tabsDesktop: { width: 214, margin: 12, paddingTop: 24, paddingHorizontal: 10, paddingBottom: 18, borderRightWidth: 0, borderWidth: 1, borderColor: palette.line, borderRadius: 28, backgroundColor: palette.surface, ...shadow },
  tabItem: { minHeight: 62, marginHorizontal: 2, marginVertical: 2, borderRadius: 18, overflow: 'hidden' },
  tabItemDesktop: { minHeight: 64, marginHorizontal: 0, marginVertical: 3 },
  navIcon: { position: 'relative', width: 31, height: 31, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.surfaceMuted },
  navIconActive: { backgroundColor: palette.primaryAction },
  navLabel: { color: palette.muted, fontSize: 10, lineHeight: 15, fontWeight: '700', textAlign: 'center', writingDirection: 'rtl' },
  navLabelDesktop: { fontSize: 12, lineHeight: 18, textAlign: 'right' },
  navLabelActive: { color: palette.primaryDark, fontWeight: '900' },
  navActiveDot: { position: 'absolute', width: 7, height: 7, top: -2, right: -2, borderRadius: 4, backgroundColor: palette.saffron, borderWidth: 1, borderColor: palette.surface },
  sidebarBackdrop: { ...StyleSheet.absoluteFillObject, pointerEvents: 'none', overflow: 'hidden', borderRadius: 28, backgroundColor: palette.surface },
  sidebarGlow: { position: 'absolute', width: 190, height: 190, top: -110, left: -80, borderRadius: 95, backgroundColor: palette.primarySoft, opacity: 0.72 },
  sidebarArtwork: { position: 'absolute', left: 12, right: 12, bottom: 12, height: 190, overflow: 'hidden', justifyContent: 'flex-end' },
  sidebarArtworkImage: { borderRadius: 22 },
  sidebarArtworkScrim: { ...StyleSheet.absoluteFillObject, borderRadius: 22, backgroundColor: palette.imageScrimStrong, opacity: 0.7 },
  sidebarArtworkContent: { padding: 16, alignItems: logicalEnd },
  sidebarArtworkIcon: { width: 39, height: 39, marginBottom: 11, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.overlaySurface, borderWidth: 1, borderColor: palette.overlayBorder },
  sidebarArtworkTitle: { color: palette.white, fontSize: 14, lineHeight: 22, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  sidebarArtworkMeta: { color: palette.onPrimaryMuted, fontSize: 10, lineHeight: 17, textAlign: 'right', writingDirection: 'rtl', marginTop: 4 },
  sidebarProgress: { width: '100%', marginTop: 12 },
  page: { width: '100%', maxWidth: 1160, alignSelf: 'center', padding: 20, paddingBottom: 108 },
  pageMotion: { width: '100%', gap: 26 },
  pageWide: { paddingHorizontal: 38, paddingTop: 34 },
  detailPage: { width: '100%', maxWidth: 900, alignSelf: 'center', padding: 20, paddingBottom: 70, gap: 20 },
  onboardScroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  onboardCard: { width: '100%', maxWidth: 610, alignSelf: 'center', gap: 18, padding: 28, borderWidth: 1, borderColor: palette.line, borderRadius: radius.xl, backgroundColor: palette.surface, ...shadow },
  onboardTitle: { color: palette.ink, fontSize: 30, lineHeight: 43, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  authIntro: { flexDirection: rowDirection, alignItems: 'center', gap: 14 },
  requiredMark: { color: palette.rose },
  inputError: { borderColor: palette.rose, backgroundColor: palette.roseSoft },
  fieldError: { color: palette.rose, fontSize: 11, lineHeight: 18, textAlign: 'right', writingDirection: 'rtl', marginTop: -11 },
  fieldErrorCentered: { textAlign: 'center', marginTop: 0 },
  termsRow: { minHeight: 66, flexDirection: rowDirection, alignItems: 'flex-start', gap: 11, padding: 13, borderWidth: 1, borderColor: palette.line, borderRadius: radius.md, backgroundColor: palette.background },
  termsRowError: { borderColor: palette.rose, backgroundColor: palette.roseSoft },
  checkbox: { width: 25, height: 25, borderRadius: 8, borderWidth: 2, borderColor: palette.line, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxChecked: { borderColor: palette.primaryAction, backgroundColor: palette.primaryAction },
  termsText: { flex: 1, color: palette.inkSoft, fontSize: 12, lineHeight: 21, textAlign: 'right', writingDirection: 'rtl' },
  authLegalLinks: { flexDirection: rowDirection, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 18 },
  inlineLink: { color: palette.primary, fontSize: 12, lineHeight: 20, fontWeight: '900', textDecorationLine: 'underline' },
  authSecurity: { flexDirection: rowDirection, alignItems: 'center', gap: 8, padding: 12, borderRadius: radius.md, backgroundColor: palette.tealSoft },
  authNotice: { flexDirection: rowDirection, alignItems: 'center', gap: 8, padding: 12, borderWidth: 1, borderColor: palette.teal, borderRadius: radius.md, backgroundColor: palette.tealSoft },
  authDivider: { flexDirection: rowDirection, alignItems: 'center', gap: 10 },
  authDividerLine: { flex: 1, height: 1, backgroundColor: palette.line },
  authSwitches: { flexDirection: rowDirection, flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  authLanguage: { gap: 12, padding: 14, borderRadius: radius.lg, backgroundColor: palette.surfaceMuted, borderWidth: 1, borderColor: palette.line },
  authSecurityText: { flex: 1, color: palette.tealInk, fontSize: 11, lineHeight: 19, textAlign: 'right', writingDirection: 'rtl' },
  authReset: { minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  authResetText: { color: palette.rose, fontSize: 12, fontWeight: '800', writingDirection: 'rtl' },
  authLinkText: { color: palette.primary, fontSize: 12, fontWeight: '800', writingDirection: 'rtl' },
  header: { gap: 25 },
  headerEyebrow: { flexDirection: rowDirection, alignItems: 'center', gap: 8, marginBottom: 6 },
  headerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.saffron },
  pageTitle: { color: palette.ink, fontSize: 33, lineHeight: 45, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  eyebrow: { color: palette.primary, fontSize: 11, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl', marginBottom: 6 },
  body: { color: palette.muted, fontSize: 15, lineHeight: 26, textAlign: 'right', writingDirection: 'rtl', marginTop: 6 },
  centerBody: { color: palette.muted, fontSize: 14, lineHeight: 24, textAlign: 'center', writingDirection: 'rtl' },
  label: { color: palette.ink, fontSize: 14, fontWeight: '800', textAlign: 'right', writingDirection: 'rtl' },
  hint: { color: palette.muted, fontSize: 11, lineHeight: 19, textAlign: 'right', writingDirection: 'rtl' },
  muted: { color: palette.muted, fontSize: 14, writingDirection: 'rtl' },
  input: { minHeight: 52, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.background, borderRadius: radius.md, paddingHorizontal: 15, color: palette.ink, fontSize: 16, writingDirection: isRtl ? 'rtl' : 'ltr' },
  ltrInput: { writingDirection: 'ltr' },
  iconHero: { width: 54, height: 54, borderRadius: 18, backgroundColor: palette.primarySoft, alignItems: 'center', justifyContent: 'center' },
  iconSmall: { width: 42, height: 42, borderRadius: 14, backgroundColor: palette.primarySoft, alignItems: 'center', justifyContent: 'center' },
  goalRow: { flexDirection: rowDirection, gap: 10 },
  goalChoice: { flex: 1, minHeight: 66, borderWidth: 1, borderColor: palette.line, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.surface },
  goalActive: { borderColor: palette.primary, backgroundColor: palette.primarySoft },
  goalNumber: { color: palette.ink, fontSize: 20, fontFamily: type.latinBold },
  goalNumberActive: { color: palette.primary },
  hero: { position: 'relative', overflow: 'hidden', flexDirection: rowDirection, flexWrap: 'wrap', gap: 22, padding: 23, borderWidth: 1, borderColor: palette.line, borderRadius: radius.xl, backgroundColor: palette.surface, ...shadow },
  heroGlow: { position: 'absolute', width: 260, height: 260, borderRadius: 130, top: -150, left: -80, backgroundColor: palette.primarySoft, opacity: 0.72, pointerEvents: 'none' },
  heroGlowSmall: { position: 'absolute', width: 120, height: 120, borderRadius: 60, bottom: -70, right: 120, backgroundColor: palette.saffronSoft, opacity: 0.62, pointerEvents: 'none' },
  heroCopy: { flex: 2, minWidth: 260, alignItems: logicalEnd, gap: 8 },
  heroTitle: { color: palette.ink, fontSize: 26, lineHeight: 38, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  goalCard: { flex: 1, minWidth: 180, minHeight: 210, padding: 20, borderRadius: radius.lg, backgroundColor: palette.brandSurface, alignItems: 'center', justifyContent: 'center', gap: 7 },
  goalIcon: { width: 58, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.overlaySurface, borderWidth: 1, borderColor: palette.overlayBorder },
  goalProgress: { width: '100%', maxWidth: 150, marginTop: 8 },
  goalBig: { color: palette.white, fontSize: 38, fontFamily: type.latinBold, marginTop: 8 },
  goalCaption: { color: palette.onPrimaryMuted, fontSize: 12, fontWeight: '700', writingDirection: 'rtl' },
  english: { color: palette.primary, fontFamily: type.latinSemibold, fontSize: 13, textAlign: 'right' },
  englishSmall: { color: palette.primary, fontFamily: type.latinMedium, fontSize: 10, textAlign: 'right', marginTop: 2 },
  pill: { minHeight: 30, paddingHorizontal: 11, borderRadius: radius.round, backgroundColor: palette.saffronSoft, flexDirection: rowDirection, alignItems: 'center', gap: 6 },
  pillText: { color: palette.goldInk, fontSize: 11, fontWeight: '800', writingDirection: 'rtl' },
  metaRow: { flexDirection: rowDirection, flexWrap: 'wrap', gap: 12, marginTop: 7 },
  meta: { flexDirection: rowDirection, alignItems: 'center', gap: 5 },
  stats: { flexDirection: rowDirection, flexWrap: 'wrap', gap: 12 },
  stat: { position: 'relative', overflow: 'hidden', flexGrow: 1, flexBasis: 145, minWidth: 135, padding: 17, alignItems: logicalEnd, borderWidth: 1, borderColor: palette.line, borderRadius: radius.lg, backgroundColor: palette.surface, ...shadow },
  statAccent: { position: 'absolute', top: 0, right: 0, bottom: 0, width: 4 },
  statValue: { color: palette.ink, fontSize: 24, fontFamily: type.latinBold, marginTop: 10 },
  insightsTeaser: { position: 'relative', overflow: 'hidden', gap: 16, padding: 20, borderRadius: radius.xl, backgroundColor: palette.brandSurface, ...shadow },
  assistantPromo: { minHeight: 92, flexDirection: rowDirection, alignItems: 'center', gap: 14, padding: 18, borderWidth: 1, borderColor: palette.secondaryBorder, borderRadius: radius.xl, backgroundColor: palette.surface, ...shadow },
  assistantPromoIcon: { width: 50, height: 50, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.primaryAction },
  assistantPromoTitle: { color: palette.ink, fontSize: 17, lineHeight: 25, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  assistantPromoText: { color: palette.muted, fontSize: 12, lineHeight: 20, textAlign: 'right', writingDirection: 'rtl', marginTop: 3 },
  teaserTop: { flexDirection: rowDirection, alignItems: 'center', gap: 13 },
  teaserIcon: { width: 51, height: 51, borderRadius: 17, backgroundColor: palette.primaryAction, alignItems: 'center', justifyContent: 'center' },
  teaserEyebrow: { color: palette.saffron, fontSize: 11, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  teaserTitle: { color: palette.white, fontSize: 20, lineHeight: 30, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl', marginTop: 3 },
  teaserProgress: { width: '100%' },
  teaserBottom: { flexDirection: rowDirection, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  teaserSignal: { flex: 1, minWidth: 210, flexDirection: rowDirection, alignItems: 'center', gap: 8 },
  teaserSignalText: { flex: 1, color: palette.onPrimaryMuted, fontSize: 12, lineHeight: 20, textAlign: 'right', writingDirection: 'rtl' },
  sectionHeading: { flexDirection: rowDirection, alignItems: 'center', gap: 10 },
  sectionMarker: { width: 5, height: 25, borderRadius: radius.round, backgroundColor: palette.saffron },
  sectionTitle: { flexShrink: 1, color: palette.ink, fontSize: 22, lineHeight: 32, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  grid: { flexDirection: rowDirection, flexWrap: 'wrap', gap: 15 },
  pathCard: { flexGrow: 1, flexBasis: 285, minWidth: 270, maxWidth: 555, minHeight: 300, overflow: 'hidden', borderWidth: 1, borderColor: palette.overlayBorder, borderRadius: radius.xl, backgroundColor: palette.brandSurface, ...shadow },
  pathCardPressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  pathArtwork: { flex: 1, minHeight: 300, padding: 20, justifyContent: 'center' },
  pathArtworkImage: { borderRadius: radius.xl },
  pathArtScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: palette.imageScrim },
  pathArtFade: { position: 'absolute', top: 0, bottom: 0, left: 0, width: '64%', backgroundColor: palette.imageScrimStrong },
  pathArtFadeSoft: { position: 'absolute', top: 0, bottom: 0, left: '58%', width: '18%', backgroundColor: palette.imageScrimStrong, opacity: 0.42 },
  pathCardContent: { zIndex: 1, width: '70%', minWidth: 215, minHeight: 258, alignSelf: 'flex-start', justifyContent: 'space-between', alignItems: 'stretch' },
  pathIconOnImage: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.overlaySurface, borderWidth: 1, borderColor: palette.overlayBorder },
  pathLevel: { minHeight: 29, maxWidth: 122, paddingHorizontal: 10, borderRadius: radius.round, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.overlaySurface, borderWidth: 1, borderColor: palette.overlayBorder },
  pathLevelText: { color: palette.white, fontSize: 10, lineHeight: 16, fontWeight: '800', writingDirection: 'rtl' },
  pathCopyOnImage: { alignItems: logicalEnd, marginVertical: 12 },
  pathTitleOnImage: { color: palette.white, fontSize: 19, lineHeight: 29, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  pathEnglishOnImage: { color: palette.saffron, fontFamily: type.latinSemibold, fontSize: 11, lineHeight: 17, textAlign: 'right', marginTop: 3 },
  pathDescriptionOnImage: { color: palette.onPrimaryMuted, fontSize: 12, lineHeight: 20, textAlign: 'right', writingDirection: 'rtl', marginTop: 9 },
  pathFooterOnImage: { gap: 8 },
  pathProgressText: { color: palette.white, fontSize: 10, lineHeight: 16, fontWeight: '800', writingDirection: 'rtl' },
  pathLessonText: { color: palette.onPrimaryMuted, fontSize: 10, lineHeight: 16, writingDirection: 'rtl' },
  between: { width: '100%', flexDirection: rowDirection, alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  pathIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  chip: { minHeight: 28, paddingHorizontal: 10, borderRadius: radius.round, backgroundColor: palette.surfaceMuted, justifyContent: 'center' },
  chipText: { color: palette.inkSoft, fontSize: 10, fontWeight: '800', writingDirection: 'rtl' },
  cardTitle: { color: palette.ink, fontSize: 16, lineHeight: 24, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl', marginTop: 12 },
  cardFoot: { gap: 8, marginTop: 17 },
  library: { flexDirection: rowDirection, alignItems: 'center', gap: 15, padding: 18, borderRadius: radius.lg, backgroundColor: palette.primarySoft },
  topBar: { flexDirection: rowDirection, alignItems: 'center', justifyContent: 'space-between' },
  round: { width: 48, height: 48, borderRadius: radius.md, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center' },
  pathHero: { padding: 27, borderRadius: radius.xl, alignItems: logicalEnd, gap: 7 },
  pathHeroIcon: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  pathHeroTitle: { color: palette.ink, fontSize: 27, lineHeight: 39, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  smallStrong: { color: palette.inkSoft, fontSize: 11, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  list: { gap: 11 },
  lessonRow: { minHeight: 102, flexDirection: rowDirection, alignItems: 'center', gap: 13, padding: 15, borderWidth: 1, borderColor: palette.line, borderRadius: radius.lg, backgroundColor: palette.surface, ...shadow },
  lessonNumber: { width: 42, height: 42, borderRadius: 14, backgroundColor: palette.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  done: { backgroundColor: palette.success, borderColor: palette.success },
  number: { color: palette.inkSoft, fontSize: 14, fontFamily: type.latinBold },
  lessonTop: { minHeight: 72, flexDirection: rowDirection, alignItems: 'center', gap: 13, paddingHorizontal: 17, borderBottomWidth: 1, borderBottomColor: palette.line, backgroundColor: palette.surface },
  lessonPage: { flexGrow: 1, width: '100%', maxWidth: 760, alignSelf: 'center', justifyContent: 'center', padding: 20 },
  lessonMotion: { width: '100%' },
  lessonFooter: { gap: 8, padding: 14, borderTopWidth: 1, borderTopColor: palette.line, backgroundColor: palette.surface },
  reading: { gap: 14, padding: 25, alignItems: logicalEnd, borderWidth: 1, borderColor: palette.line, borderRadius: radius.xl, backgroundColor: palette.surface, ...shadow },
  readingTitle: { color: palette.ink, fontSize: 28, lineHeight: 41, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  readingBody: { color: palette.inkSoft, fontSize: 17, lineHeight: 32, textAlign: 'right', writingDirection: 'rtl' },
  callout: { width: '100%', flexDirection: rowDirection, alignItems: 'flex-start', gap: 10, padding: 15, borderRadius: radius.md, backgroundColor: palette.primarySoft },
  calloutText: { flex: 1, color: palette.primaryDark, fontSize: 13, lineHeight: 22, textAlign: 'right', writingDirection: 'rtl' },
  term: { width: '100%', padding: 17, borderWidth: 1, borderColor: palette.line, borderRadius: radius.lg, backgroundColor: palette.background, alignItems: logicalEnd },
  termFa: { color: palette.ink, fontSize: 20, fontWeight: '900', writingDirection: 'rtl', marginTop: 4 },
  quizTitle: { color: palette.ink, fontSize: 23, lineHeight: 35, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  quizAnswers: { width: '100%', alignSelf: 'stretch', gap: 11 },
  answer: { minHeight: 59, flexDirection: rowDirection, alignItems: 'center', gap: 11, padding: 13, borderWidth: 1, borderColor: palette.line, borderRadius: radius.md, backgroundColor: palette.background },
  answerChosen: { borderColor: palette.primary, backgroundColor: palette.primarySoft },
  answerGood: { borderColor: palette.success, backgroundColor: palette.tealSoft },
  answerBad: { borderColor: palette.rose, backgroundColor: palette.roseSoft },
  radio: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: palette.line, alignItems: 'center', justifyContent: 'center' },
  radioChosen: { borderColor: palette.primaryAction, backgroundColor: palette.primaryAction },
  radioBad: { borderColor: palette.rose, backgroundColor: palette.rose },
  answerText: { flex: 1, color: palette.inkSoft, fontSize: 14, lineHeight: 23, textAlign: 'right', writingDirection: 'rtl' },
  feedback: { width: '100%', flexDirection: rowDirection, alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: radius.md },
  feedbackGood: { backgroundColor: palette.tealSoft },
  feedbackBad: { backgroundColor: palette.roseSoft },
  feedbackSymbol: { width: 30, minHeight: 30, alignItems: 'center', justifyContent: 'center' },
  feedbackEmoji: { fontSize: 27, lineHeight: 32 },
  requiredAnswer: { color: palette.rose, fontSize: 12, lineHeight: 20, fontWeight: '800', textAlign: 'center', writingDirection: 'rtl' },
  result: { gap: 10, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: palette.line, borderRadius: radius.xl, backgroundColor: palette.surface, ...shadow },
  resultIcon: { width: 70, height: 70, borderRadius: 23, backgroundColor: palette.success, alignItems: 'center', justifyContent: 'center' },
  score: { color: palette.primary, fontSize: 46, fontFamily: type.latinBold },
  empty: { minHeight: 280, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 25, borderWidth: 1, borderColor: palette.line, borderRadius: radius.xl, backgroundColor: palette.surface, ...shadow },
  searchBox: { minHeight: 57, flexDirection: rowDirection, alignItems: 'center', gap: 10, paddingHorizontal: 15, borderWidth: 1, borderColor: palette.line, borderRadius: radius.lg, backgroundColor: palette.surface, ...shadow },
  searchInput: { flex: 1, minHeight: 53, color: palette.ink, fontSize: 16, writingDirection: isRtl ? 'rtl' : 'ltr' },
  glossary: { flexDirection: rowDirection, flexWrap: 'wrap', gap: 10 },
  glossaryCard: { flexGrow: 1, flexBasis: 175, minWidth: 150, padding: 14, alignItems: logicalEnd, borderWidth: 1, borderColor: palette.line, borderRadius: radius.md, backgroundColor: palette.surface },
  searchResult: { minHeight: 80, flexDirection: rowDirection, alignItems: 'center', gap: 12, padding: 14, borderWidth: 1, borderColor: palette.line, borderRadius: radius.lg, backgroundColor: palette.surface },
  profile: { flexDirection: rowDirection, alignItems: 'center', gap: 15, padding: 21, borderRadius: radius.xl, backgroundColor: palette.brandSurface },
  avatar: { width: 60, height: 60, borderRadius: 20, backgroundColor: palette.primaryAction, alignItems: 'center', justifyContent: 'center' },
  profileName: { color: palette.white, fontSize: 21, fontWeight: '900', writingDirection: 'rtl' },
  profileHandle: { color: palette.onPrimaryMuted, fontSize: 12, fontFamily: type.latinSemibold, marginTop: 3 },
  profileMeta: { color: palette.onPrimaryMuted, fontSize: 11, writingDirection: 'rtl', marginTop: 4 },
  settings: { gap: 13, padding: 19, borderWidth: 1, borderColor: palette.line, borderRadius: radius.lg, backgroundColor: palette.surface, ...shadow },
  supportEntry: { flexDirection: rowDirection, alignItems: 'center', gap: 12, minHeight: 70, padding: 13, borderWidth: 1, borderColor: palette.secondaryBorder, borderRadius: radius.md, backgroundColor: palette.primarySoft },
  nameRow: { flexDirection: rowDirection, gap: 8 },
  nameInput: { flex: 1, minHeight: 49, paddingHorizontal: 13, color: palette.ink, fontSize: 15, writingDirection: isRtl ? 'rtl' : 'ltr', borderWidth: 1, borderColor: palette.line, borderRadius: radius.md, backgroundColor: palette.background },
  save: { minWidth: 80, minHeight: 49, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: palette.primarySoft },
  saveText: { color: palette.primary, fontSize: 13, fontWeight: '900', writingDirection: 'rtl' },
  accountIdentity: { minHeight: 76, flexDirection: rowDirection, alignItems: 'center', gap: 11, padding: 13, borderRadius: radius.md, backgroundColor: palette.background, borderWidth: 1, borderColor: palette.line },
  accountUsername: { color: palette.primary, fontSize: 14, fontFamily: type.latinSemibold, marginTop: 2 },
  accountEmail: { color: palette.muted, fontSize: 11, fontFamily: type.latinMedium, marginTop: 3, writingDirection: 'ltr' },
  settingRow: { minHeight: 68, flexDirection: rowDirection, alignItems: 'center', gap: 11, borderTopWidth: 1, borderTopColor: palette.line, paddingTop: 12 },
  preferenceHeading: { alignItems: logicalEnd, gap: 3, marginTop: 2 },
  themePicker: { flexDirection: rowDirection, gap: 8, padding: 6, borderRadius: radius.lg, backgroundColor: palette.background, borderWidth: 1, borderColor: palette.line },
  themeChoice: { flex: 1, minHeight: 70, alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 8, borderRadius: radius.md, borderWidth: 1, borderColor: 'transparent' },
  themeChoiceActive: { backgroundColor: palette.primarySoft, borderColor: palette.primary },
  themeIcon: { width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.surfaceMuted },
  themeIconActive: { backgroundColor: palette.surface },
  themeChoiceText: { color: palette.muted, fontSize: 12, fontWeight: '800', writingDirection: 'rtl' },
  themeChoiceTextActive: { color: palette.primary },
  languagePicker: { flexDirection: rowDirection, flexWrap: 'wrap', gap: 8, padding: 6, borderRadius: radius.lg, backgroundColor: palette.background, borderWidth: 1, borderColor: palette.line },
  languagePickerCompact: { padding: 4, gap: 6 },
  languageChoice: { flexGrow: 1, flexBasis: 145, minWidth: 130, minHeight: 62, flexDirection: rowDirection, alignItems: 'center', gap: 9, paddingHorizontal: 11, borderRadius: radius.md, borderWidth: 1, borderColor: 'transparent', backgroundColor: palette.surface },
  languageChoiceCompact: { flexBasis: 92, minWidth: 86, minHeight: 50, paddingHorizontal: 8 },
  languageChoiceActive: { borderColor: palette.primary, backgroundColor: palette.primarySoft },
  languageCode: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.surfaceMuted },
  languageCodeActive: { backgroundColor: palette.primaryAction },
  languageCodeText: { color: palette.muted, fontSize: 10, fontFamily: type.latinBold },
  languageChoiceCopy: { flex: 1, alignItems: logicalEnd },
  languageNative: { color: palette.inkSoft, fontSize: 13, lineHeight: 20, fontWeight: '900' },
  languageNativeActive: { color: palette.primary },
  languageEnglish: { color: palette.muted, fontSize: 9, lineHeight: 15, fontFamily: type.latinMedium },
  danger: { minHeight: 53, flexDirection: rowDirection, alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: palette.borderRose, borderRadius: radius.md, backgroundColor: palette.roseSoft },
  dangerText: { color: palette.rose, fontSize: 13, fontWeight: '900', writingDirection: 'rtl' },
  signOut: { minHeight: 53, flexDirection: rowDirection, alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: palette.secondaryBorder, borderRadius: radius.md, backgroundColor: palette.primarySoft },
  signOutText: { color: palette.primary, fontSize: 13, fontWeight: '900', writingDirection: 'rtl' },
  chatPage: { flex: 1, width: '100%', maxWidth: 900, alignSelf: 'center', padding: 20, gap: 14 },
  chatHeading: { flexDirection: rowDirection, alignItems: 'center', gap: 13 },
  chatHeadingIcon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.primaryAction },
  assistantMode: { flexDirection: rowDirection, alignItems: 'center', alignSelf: logicalEnd, gap: 7, minHeight: 30, paddingHorizontal: 11, borderRadius: radius.round, backgroundColor: palette.tealSoft },
  assistantModeText: { color: palette.tealInk, fontSize: 10, lineHeight: 16, fontWeight: '900', writingDirection: 'rtl' },
  assistantPrivacy: { flexDirection: rowDirection, alignItems: 'flex-start', gap: 9, padding: 13, borderWidth: 1, borderColor: palette.borderGold, borderRadius: radius.md, backgroundColor: palette.saffronSoft },
  assistantPrivacyText: { flex: 1, color: palette.goldBody, fontSize: 11, lineHeight: 19, textAlign: 'right', writingDirection: 'rtl' },
  chatMessages: { flex: 1, minHeight: 260, borderWidth: 1, borderColor: palette.line, borderRadius: radius.xl, backgroundColor: palette.surface },
  chatMessagesContent: { flexGrow: 1, gap: 11, padding: 16 },
  chatEmpty: { flex: 1, minHeight: 245, alignItems: 'center', justifyContent: 'center', gap: 13, padding: 10 },
  suggestionList: { width: '100%', gap: 8 },
  suggestion: { minHeight: 50, flexDirection: rowDirection, alignItems: 'center', gap: 9, paddingHorizontal: 13, borderWidth: 1, borderColor: palette.line, borderRadius: radius.md, backgroundColor: palette.background },
  suggestionText: { flex: 1, color: palette.inkSoft, fontSize: 12, lineHeight: 19, fontWeight: '800', textAlign: 'right', writingDirection: 'rtl' },
  chatBubble: { maxWidth: '84%', gap: 6, paddingHorizontal: 14, paddingVertical: 11, borderRadius: radius.lg },
  chatBubbleUser: { alignSelf: isRtl ? 'flex-start' : 'flex-end', backgroundColor: palette.primaryAction },
  chatBubbleAssistant: { alignSelf: isRtl ? 'flex-end' : 'flex-start', borderWidth: 1, borderColor: palette.line, backgroundColor: palette.background },
  chatBubbleText: { color: palette.inkSoft, fontSize: 14, lineHeight: 23, textAlign: 'right', writingDirection: 'rtl' },
  chatBubbleTextUser: { color: palette.white },
  chatSource: { color: palette.primary, fontSize: 9, lineHeight: 15, fontWeight: '800', textAlign: 'right', writingDirection: 'rtl' },
  chatTyping: { alignSelf: isRtl ? 'flex-end' : 'flex-start', paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.md, backgroundColor: palette.surfaceMuted },
  chatComposer: { flexDirection: rowDirection, alignItems: 'flex-end', gap: 9 },
  chatInput: { flex: 1, minHeight: 52, maxHeight: 126, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: palette.line, borderRadius: radius.lg, backgroundColor: palette.surface, color: palette.ink, fontSize: 14, lineHeight: 21, textAlign: isRtl ? 'right' : 'left', writingDirection: isRtl ? 'rtl' : 'ltr' },
  chatSend: { width: 52, height: 52, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.primaryAction },
  chatClear: { minHeight: 40, alignSelf: 'center', flexDirection: rowDirection, alignItems: 'center', gap: 7, paddingHorizontal: 12 },
  supportGroup: { gap: 2, paddingHorizontal: 16, borderWidth: 1, borderColor: palette.line, borderRadius: radius.xl, backgroundColor: palette.surface, ...shadow },
  supportRow: { minHeight: 72, flexDirection: rowDirection, alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: palette.line },
  dangerSupport: { minHeight: 72, flexDirection: rowDirection, alignItems: 'center', gap: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: palette.borderRose, borderRadius: radius.xl, backgroundColor: palette.roseSoft },
  supportVersion: { color: palette.muted, fontSize: 11, lineHeight: 18, textAlign: 'center' },
  legalHero: { flexDirection: rowDirection, alignItems: 'center', gap: 14, padding: 20, borderRadius: radius.xl, backgroundColor: palette.primarySoft },
  legalDocument: { gap: 20, padding: 22, borderWidth: 1, borderColor: palette.line, borderRadius: radius.xl, backgroundColor: palette.surface, ...shadow },
  legalSection: { gap: 7 },
  notice: { flexDirection: rowDirection, alignItems: 'flex-start', gap: 8, padding: 13, borderRadius: radius.md, backgroundColor: palette.surfaceMuted },
  noticeText: { flex: 1, color: palette.muted, fontSize: 10, lineHeight: 18, textAlign: 'right', writingDirection: 'rtl' },
  specBanner: { flexDirection: rowDirection, alignItems: 'center', gap: 14, padding: 18, borderRadius: radius.lg, backgroundColor: palette.brandSurface },
  specIcon: { width: 50, height: 50, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.primaryAction },
  specTitle: { color: palette.white, fontSize: 15, lineHeight: 24, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  specText: { color: palette.onPrimaryMuted, fontSize: 11, lineHeight: 19, textAlign: 'right', writingDirection: 'rtl', marginTop: 3 },
  trackTabs: { flexDirection: rowDirection, flexWrap: 'wrap', gap: 8, padding: 6, borderRadius: radius.lg, backgroundColor: palette.surfaceMuted },
  trackTab: { minHeight: 46, flexGrow: 1, minWidth: 92, paddingHorizontal: 15, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md },
  trackTabActive: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, ...shadow },
  trackTabText: { color: palette.muted, fontSize: 12, fontWeight: '800', writingDirection: 'rtl' },
  trackTabTextActive: { color: palette.primary },
  examGrid: { flexDirection: rowDirection, flexWrap: 'wrap', gap: 15 },
  examPanel: { flexGrow: 1, flexBasis: 360, minWidth: 280, gap: 18, padding: 20, borderWidth: 1, borderColor: palette.line, borderRadius: radius.xl, backgroundColor: palette.surface, ...shadow },
  examStage: { color: palette.ink, fontSize: 23, fontFamily: type.latinBold },
  modeRow: { minHeight: 76, flexDirection: rowDirection, alignItems: 'center', gap: 11, padding: 12, borderRadius: radius.md, backgroundColor: palette.background, borderWidth: 1, borderColor: palette.line },
  modeIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.primarySoft },
  modeTitle: { color: palette.ink, fontSize: 14, lineHeight: 22, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  examNote: { flexDirection: rowDirection, alignItems: 'flex-start', gap: 11, padding: 16, borderRadius: radius.lg, backgroundColor: palette.primarySoft },
  historyRow: { minHeight: 76, flexDirection: rowDirection, alignItems: 'center', gap: 13, padding: 14, borderWidth: 1, borderColor: palette.line, borderRadius: radius.lg, backgroundColor: palette.surface },
  scoreBadge: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  scoreBadgeText: { color: palette.ink, fontSize: 15, fontFamily: type.latinBold },
  insightsPage: { width: '100%', maxWidth: 1080 },
  insightsMotion: { width: '100%', gap: 25 },
  insightsHero: { position: 'relative', overflow: 'hidden', minHeight: 265, flexDirection: rowDirection, flexWrap: 'wrap', alignItems: 'center', gap: 25, padding: 27, borderRadius: radius.xl, backgroundColor: palette.brandSurface, ...shadow },
  insightsGlow: { position: 'absolute', width: 330, height: 330, borderRadius: 165, left: -145, bottom: -185, backgroundColor: palette.primaryAction, opacity: 0.42, pointerEvents: 'none' },
  readinessScore: { width: 158, minHeight: 158, borderRadius: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.overlaySurface, borderWidth: 1, borderColor: palette.overlayBorder },
  readinessNumber: { color: palette.white, fontSize: 43, fontFamily: type.latinBold },
  readinessCaption: { color: palette.onPrimaryMuted, fontSize: 11, fontWeight: '800', writingDirection: 'rtl', marginTop: 5 },
  insightsHeroCopy: { flex: 1, minWidth: 240, alignItems: logicalEnd, gap: 8 },
  insightsBadge: { minHeight: 31, flexDirection: rowDirection, alignItems: 'center', gap: 7, paddingHorizontal: 11, borderRadius: radius.round, backgroundColor: palette.saffronSoft },
  insightsBadgeText: { color: palette.goldInk, fontSize: 11, fontWeight: '900', writingDirection: 'rtl' },
  insightsTitle: { color: palette.white, fontSize: 28, lineHeight: 40, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  insightsSubtitle: { color: palette.onPrimaryMuted, fontSize: 14, lineHeight: 24, textAlign: 'right', writingDirection: 'rtl' },
  readinessProgress: { width: '100%', marginTop: 8 },
  readinessTarget: { color: palette.onPrimaryMuted, fontSize: 10, lineHeight: 17, textAlign: 'right', writingDirection: 'rtl' },
  insightMetrics: { flexDirection: rowDirection, flexWrap: 'wrap', gap: 12 },
  insightMetric: { flexGrow: 1, flexBasis: 140, minWidth: 135, minHeight: 135, alignItems: logicalEnd, justifyContent: 'space-between', padding: 16, borderWidth: 1, borderColor: palette.line, borderRadius: radius.lg, backgroundColor: palette.surface, ...shadow },
  insightMetricIcon: { width: 39, height: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  insightMetricValue: { color: palette.ink, fontSize: 26, fontFamily: type.latinBold },
  insightMetricLabel: { color: palette.muted, fontSize: 11, lineHeight: 18, textAlign: 'right', writingDirection: 'rtl' },
  activityCard: { gap: 20, padding: 20, borderWidth: 1, borderColor: palette.line, borderRadius: radius.xl, backgroundColor: palette.surface, ...shadow },
  activityHeader: { flexDirection: rowDirection, alignItems: 'center', gap: 15 },
  activitySummary: { minWidth: 76, minHeight: 67, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: palette.primarySoft },
  activitySummaryValue: { color: palette.primary, fontSize: 24, fontFamily: type.latinBold },
  activityBars: { minHeight: 158, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', gap: 7, paddingTop: 8 },
  activityColumn: { flex: 1, minWidth: 30, maxWidth: 76, alignItems: 'center', justifyContent: 'flex-end', gap: 6 },
  activityValueSlot: { height: 18, justifyContent: 'center' },
  activityValue: { color: palette.inkSoft, fontSize: 10, fontFamily: type.latinSemibold },
  activityBar: { width: '62%', minWidth: 17, maxWidth: 36, borderRadius: 10 },
  activityDay: { color: palette.muted, fontSize: 10, fontWeight: '700', writingDirection: 'rtl' },
  activityDayActive: { color: palette.primary },
  insightColumns: { flexDirection: rowDirection, flexWrap: 'wrap', gap: 15 },
  insightPanel: { flexGrow: 1, flexBasis: 330, minWidth: 280, gap: 16, padding: 19, borderWidth: 1, borderColor: palette.line, borderRadius: radius.xl, backgroundColor: palette.surface, ...shadow },
  panelHeader: { flexDirection: rowDirection, alignItems: 'center', gap: 12 },
  panelIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  panelTitle: { color: palette.ink, fontSize: 18, lineHeight: 27, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  panelList: { gap: 10 },
  panelRow: { flexDirection: rowDirection, alignItems: 'center', gap: 11, paddingTop: 10, borderTopWidth: 1, borderTopColor: palette.line },
  panelScore: { minWidth: 57, minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md },
  panelScoreText: { fontSize: 12, fontFamily: type.latinBold },
  panelSubject: { color: palette.inkSoft, fontSize: 13, lineHeight: 21, fontWeight: '800', textAlign: 'right', writingDirection: 'rtl' },
  panelEmpty: { minHeight: 88, justifyContent: 'center', padding: 14, borderRadius: radius.md, backgroundColor: palette.background },
  insightLegend: { flexDirection: rowDirection, alignItems: 'center', gap: 7 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  masteryList: { gap: 11 },
  masteryRow: { gap: 10, padding: 16, borderWidth: 1, borderColor: palette.line, borderRadius: radius.lg, backgroundColor: palette.surface },
  masteryHeading: { flexDirection: rowDirection, alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  masteryStatus: { minHeight: 29, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, borderRadius: radius.round },
  masteryStatusText: { fontSize: 10, fontWeight: '900', writingDirection: 'rtl' },
  masteryTitle: { color: palette.ink, fontSize: 14, lineHeight: 22, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  masteryNumbers: { flexDirection: rowDirection, alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  masteryScore: { fontSize: 14, fontFamily: type.latinBold },
  insightNote: { flexDirection: rowDirection, alignItems: 'flex-start', gap: 12, padding: 17, borderRadius: radius.lg, backgroundColor: palette.primarySoft, borderWidth: 1, borderColor: palette.secondaryBorder },
  insightNoteIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.surface },
  testPage: { flexGrow: 1, width: '100%', maxWidth: 820, alignSelf: 'center', padding: 20, paddingBottom: 70, gap: 20 },
  testMotion: { width: '100%', gap: 20 },
  testTop: { minHeight: 76, flexDirection: rowDirection, alignItems: 'center', gap: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: palette.line, backgroundColor: palette.surface },
  testHeading: { flex: 1, alignItems: logicalEnd },
  timer: { minWidth: 86, minHeight: 44, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: radius.md, backgroundColor: palette.primarySoft },
  timerUrgent: { backgroundColor: palette.roseSoft },
  timerText: { color: palette.primary, fontSize: 14, fontFamily: type.latinBold, fontVariant: ['tabular-nums'] },
  questionMeta: { flexDirection: rowDirection, alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  flagButton: { minHeight: 44, paddingHorizontal: 12, flexDirection: rowDirection, alignItems: 'center', gap: 7, borderRadius: radius.md, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface },
  flagActive: { borderColor: palette.saffron, backgroundColor: palette.saffronSoft },
  questionNav: { flexDirection: rowDirection, alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 8 },
  breakdownRow: { minHeight: 74, flexDirection: rowDirection, alignItems: 'center', gap: 12, padding: 14, borderWidth: 1, borderColor: palette.line, borderRadius: radius.lg, backgroundColor: palette.surface },
  breakdownScore: { minWidth: 58, minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: palette.primarySoft },
  learningList: { width: '100%', gap: 10, padding: 15, borderRadius: radius.md, backgroundColor: palette.background },
  learningPoint: { flexDirection: rowDirection, alignItems: 'flex-start', gap: 10 },
  bulletDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.primary, marginTop: 8 },
  learningText: { flex: 1, color: palette.inkSoft, fontSize: 14, lineHeight: 25, textAlign: 'right', writingDirection: 'rtl' },
  exampleCard: { width: '100%', flexDirection: rowDirection, alignItems: 'flex-start', gap: 11, padding: 16, borderRadius: radius.md, backgroundColor: palette.saffronSoft, borderWidth: 1, borderColor: palette.borderGold },
  exampleLabel: { color: palette.goldInk, fontSize: 12, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  exampleText: { color: palette.goldBody, fontSize: 13, lineHeight: 23, textAlign: 'right', writingDirection: 'rtl', marginTop: 4 },
  checklistCard: { width: '100%', gap: 10, padding: 16, borderRadius: radius.md, backgroundColor: palette.tealSoft },
  checklistTitle: { color: palette.teal, fontSize: 13, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  checkRow: { flexDirection: rowDirection, alignItems: 'flex-start', gap: 9 },
  checkText: { flex: 1, color: palette.tealInk, fontSize: 13, lineHeight: 22, textAlign: 'right', writingDirection: 'rtl' },
  sourceNote: { width: '100%', flexDirection: rowDirection, alignItems: 'flex-start', gap: 8, paddingTop: 4 },
  sourceText: { flex: 1, color: palette.muted, fontSize: 10, lineHeight: 18, textAlign: 'right', writingDirection: 'rtl' },
  translationNotice: { flexDirection: rowDirection, alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: radius.lg, backgroundColor: palette.primarySoft, borderWidth: 1, borderColor: palette.secondaryBorder },
  translationNoticeText: { flex: 1, color: palette.primaryDark, fontSize: 12, lineHeight: 21 },
  translationInline: { width: '100%', flexDirection: rowDirection, alignItems: 'flex-start', gap: 8, padding: 11, borderRadius: radius.md, backgroundColor: palette.primarySoft },
  translationInlineText: { flex: 1, color: palette.primaryDark, fontSize: 11, lineHeight: 19 },
  cardPressed: { opacity: 0.9, borderColor: palette.pressBorder, transform: [{ scale: 0.992 }] },
  gameStatus: { position: 'relative', overflow: 'hidden', gap: 14, padding: 20, borderRadius: radius.xl, backgroundColor: palette.brandSurface, ...shadow },
  gameStatusGlow: { position: 'absolute', width: 230, height: 230, borderRadius: 115, left: -90, bottom: -150, backgroundColor: palette.primaryAction, opacity: 0.45, pointerEvents: 'none' },
  gameStatusTop: { flexDirection: rowDirection, alignItems: 'center', gap: 13 },
  levelMedallion: { width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.saffronSoft, borderWidth: 1, borderColor: palette.borderGold },
  gameEyebrow: { color: palette.saffron, fontSize: 11, lineHeight: 18, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  gameStatusTitle: { color: palette.white, fontSize: 21, lineHeight: 30, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl', marginTop: 2 },
  gameProgressCopy: { flexDirection: rowDirection, alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  gameProgressText: { color: palette.onPrimaryMuted, fontSize: 11, lineHeight: 18, writingDirection: 'rtl' },
  gameXp: { color: palette.white, fontSize: 13, fontFamily: type.latinBold },
  gameStatusSignals: { flexDirection: rowDirection, flexWrap: 'wrap', gap: 8 },
  gameSignal: { flex: 1, minWidth: 92, minHeight: 69, alignItems: 'center', justifyContent: 'center', gap: 2, padding: 8, borderRadius: radius.md, backgroundColor: palette.overlaySurface, borderWidth: 1, borderColor: palette.overlayBorder },
  gameSignalValue: { color: palette.white, fontSize: 14, fontFamily: type.latinBold },
  gameSignalLabel: { color: palette.onPrimaryMuted, fontSize: 9, lineHeight: 15, textAlign: 'center', writingDirection: 'rtl' },
  gamePage: { width: '100%', maxWidth: 980, alignSelf: 'center', padding: 20, paddingBottom: 70, gap: 20 },
  gameScreenMotion: { width: '100%', gap: 24 },
  gameHero: { position: 'relative', overflow: 'hidden', minHeight: 220, flexDirection: rowDirection, flexWrap: 'wrap', alignItems: 'center', gap: 22, padding: 25, borderRadius: radius.xl, backgroundColor: palette.brandSurface, ...shadow },
  gameHeroGlow: { position: 'absolute', width: 310, height: 310, borderRadius: 155, left: -120, bottom: -190, backgroundColor: palette.primaryAction, opacity: 0.5, pointerEvents: 'none' },
  gameHeroMedallion: { width: 92, height: 92, borderRadius: 31, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.saffronSoft, borderWidth: 2, borderColor: palette.borderGold },
  gameHeroCopy: { flex: 1, minWidth: 230, alignItems: logicalEnd, gap: 5 },
  gameHeroEyebrow: { color: palette.saffron, fontSize: 12, lineHeight: 20, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  gameHeroTitle: { color: palette.white, fontSize: 29, lineHeight: 40, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  gameHeroText: { color: palette.onPrimaryMuted, fontSize: 13, lineHeight: 23, textAlign: 'right', writingDirection: 'rtl' },
  gameHeroProgress: { width: '100%', marginTop: 10 },
  gameSectionHeading: { flexDirection: rowDirection, alignItems: 'center', gap: 12 },
  gameHeadingIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.primarySoft },
  missionList: { gap: 11 },
  missionCard: { minHeight: 112, flexDirection: rowDirection, alignItems: 'center', gap: 13, padding: 15, borderWidth: 1, borderColor: palette.line, borderRadius: radius.lg, backgroundColor: palette.surface, ...shadow },
  missionCardDone: { borderColor: palette.success, backgroundColor: palette.tealSoft },
  missionIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.primarySoft },
  missionIconDone: { backgroundColor: palette.success },
  missionCopy: { flex: 1, alignItems: 'stretch', gap: 4 },
  missionReward: { color: palette.goldInk, fontSize: 11, fontFamily: type.latinBold },
  missionTitle: { flex: 1, color: palette.ink, fontSize: 15, lineHeight: 23, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  missionText: { color: palette.muted, fontSize: 11, lineHeight: 19, textAlign: 'right', writingDirection: 'rtl' },
  missionProgress: { width: '100%', marginTop: 5 },
  achievementGrid: { flexDirection: rowDirection, flexWrap: 'wrap', gap: 11 },
  achievementCard: { flexGrow: 1, flexBasis: 190, minWidth: 145, maxWidth: 310, minHeight: 165, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 15, borderWidth: 1, borderColor: palette.line, borderRadius: radius.lg, backgroundColor: palette.surfaceMuted, opacity: 0.72 },
  achievementUnlocked: { backgroundColor: palette.surface, borderColor: palette.borderGold, opacity: 1, ...shadow },
  achievementIcon: { width: 50, height: 50, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.background },
  achievementIconUnlocked: { backgroundColor: palette.saffronSoft },
  achievementTitle: { color: palette.ink, fontSize: 14, lineHeight: 22, fontWeight: '900', textAlign: 'center', writingDirection: 'rtl' },
  achievementTitleLocked: { color: palette.muted },
  achievementText: { color: palette.muted, fontSize: 10, lineHeight: 17, textAlign: 'center', writingDirection: 'rtl' },
  levelRoadmap: { gap: 10, padding: 19, borderWidth: 1, borderColor: palette.line, borderRadius: radius.xl, backgroundColor: palette.surface, ...shadow },
  levelRow: { minHeight: 66, flexDirection: rowDirection, alignItems: 'center', gap: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: palette.line },
  levelRowCurrent: { marginHorizontal: -7, paddingHorizontal: 7, borderRadius: radius.md, backgroundColor: palette.primarySoft },
  levelNode: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.surfaceMuted, borderWidth: 1, borderColor: palette.line },
  levelNodeReached: { backgroundColor: palette.primaryAction, borderColor: palette.primaryAction },
  levelNodeText: { color: palette.muted, fontSize: 11, fontFamily: type.latinBold },
  levelTitle: { color: palette.ink, fontSize: 14, lineHeight: 21, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  levelTitleLocked: { color: palette.muted },
  currentLevelPill: { minHeight: 29, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center', borderRadius: radius.round, backgroundColor: palette.surface },
  currentLevelText: { color: palette.primary, fontSize: 10, fontWeight: '900', writingDirection: 'rtl' },
  quizHeader: { width: '100%', flexDirection: rowDirection, alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  comboPill: { minHeight: 36, flexDirection: rowDirection, alignItems: 'center', gap: 6, paddingHorizontal: 12, borderRadius: radius.round, backgroundColor: palette.saffronSoft, borderWidth: 1, borderColor: palette.borderGold },
  comboText: { color: palette.goldInk, fontSize: 12, lineHeight: 18, fontWeight: '900', writingDirection: 'rtl' },
  celebrationStage: { position: 'relative', width: 150, height: 104, alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' },
  celebrationSpark: { position: 'absolute', width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  sparkOne: { top: 5, left: 13 },
  sparkTwo: { top: 1, right: 15 },
  sparkThree: { top: 48, left: 0 },
  sparkFour: { top: 51, right: 0 },
  sparkFive: { bottom: 0, left: 27 },
  sparkSix: { bottom: 2, right: 26 },
  rewardRow: { width: '100%', flexDirection: rowDirection, flexWrap: 'wrap', justifyContent: 'center', gap: 9 },
  rewardChip: { flexGrow: 1, flexBasis: 150, minWidth: 138, maxWidth: 230, minHeight: 70, flexDirection: rowDirection, alignItems: 'center', gap: 10, padding: 11, borderRadius: radius.md, backgroundColor: palette.saffronSoft, borderWidth: 1, borderColor: palette.borderGold },
  rewardChipIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.surface },
  rewardValue: { color: palette.goldInk, fontSize: 15, fontFamily: type.latinBold },
  rewardLabel: { color: palette.goldBody, fontSize: 10, lineHeight: 16, textAlign: 'right', writingDirection: 'rtl' },
  });
};

s = createStyles(lightPalette, true);
