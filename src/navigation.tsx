import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { DefaultTheme, NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator, type NativeStackNavigationProp, type NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton, Brand, ProgressBar } from './components';
import { glossary, lessonById, lessons, pathwayById, pathways, type IconName, type Lesson, type Pathway, type QuizQuestion } from './curriculum';
import { questionsForStage, sqeTotals, stageSubjects, type SqeStage, type SqeTrack } from './sqe';
import { SoundPressable as Pressable, useSoundFeedback } from './sound';
import { useLearner, type ThemeMode } from './store';
import { createShadow, lightPalette, radius, space, themedAccentColor, themedSoftColor, type, useAppTheme, type AppPalette } from './theme';

export type RootStackParamList = {
  Main: undefined;
  Pathway: { pathwayId: string };
  Lesson: { lessonId: string };
  Test: { stage: SqeStage; count: number; mode: 'quick' | 'diagnostic' | 'mock'; subjectId?: string };
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
const tabInfo: Record<keyof TabParams, { label: string; icon: IconName }> = {
  Home: { label: 'خانه', icon: 'home' },
  Learn: { label: 'مسیرها', icon: 'book-open' },
  Review: { label: 'مرور', icon: 'refresh-cw' },
  Practice: { label: 'آزمون', icon: 'edit-3' },
  Profile: { label: 'حساب', icon: 'user' },
};

let palette = lightPalette;
let darkMode = false;
let s: ReturnType<typeof createStyles>;

export function HaghDanApp() {
  const { state } = useLearner();
  const theme = useAppTheme();
  palette = theme.palette;
  darkMode = theme.isDark;
  s = useMemo(() => createStyles(theme.palette), [theme.palette]);
  if (!state.hydrated) return <Loading />;
  if (!state.onboarded) return <Onboarding />;
  return (
    <NavigationContainer theme={{ ...DefaultTheme, dark: darkMode, colors: { ...DefaultTheme.colors, primary: palette.primary, background: palette.background, card: palette.surface, text: palette.ink, border: palette.line } }}>
      <Root.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.background } }}>
        <Root.Screen name="Main" component={MainTabs} />
        <Root.Screen name="Pathway" component={PathwayScreen} />
        <Root.Screen name="Lesson" component={LessonScreen} />
        <Root.Screen name="Test" component={TestScreen} />
      </Root.Navigator>
    </NavigationContainer>
  );
}

function Loading() {
  return <View style={s.loading}><View style={s.loadingLogo}><Feather name="book-open" size={28} color={palette.white} /></View><ActivityIndicator size="large" color={palette.primary} /><Text style={s.muted}>در حال آماده‌سازی حق‌دان…</Text></View>;
}

function MainTabs() {
  const { width } = useWindowDimensions();
  const { playTap } = useSoundFeedback();
  const desktop = width >= 980;
  return (
    <Tabs.Navigator screenListeners={{ tabPress: playTap }} screenOptions={({ route }) => ({
      headerShown: false,
      tabBarPosition: desktop ? 'left' : 'bottom',
      tabBarActiveTintColor: palette.primary,
      tabBarActiveBackgroundColor: desktop ? palette.primarySoft : 'transparent',
      tabBarInactiveTintColor: palette.muted,
      tabBarHideOnKeyboard: true,
      tabBarLabel: tabInfo[route.name].label,
      tabBarIcon: ({ color, size }) => <Feather name={tabInfo[route.name].icon} color={color} size={size} />,
      tabBarLabelStyle: s.tabLabel,
      tabBarStyle: desktop ? s.tabsDesktop : s.tabsMobile,
      tabBarItemStyle: s.tabItem,
    })}>
      <Tabs.Screen name="Home" component={Home} />
      <Tabs.Screen name="Learn" component={Learn} />
      <Tabs.Screen name="Review" component={Review} />
      <Tabs.Screen name="Practice" component={Practice} />
      <Tabs.Screen name="Profile" component={Profile} />
    </Tabs.Navigator>
  );
}

function Onboarding() {
  const { finishOnboarding } = useLearner();
  const [name, setName] = useState('');
  const [goal, setGoal] = useState(2);
  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.onboardScroll} keyboardShouldPersistTaps="handled">
          <View style={s.onboardCard}>
            <Brand />
            <View style={s.iconHero}><Feather name="compass" size={28} color={palette.primary} /></View>
            <Text style={s.onboardTitle}>حقوق را با زبان خودتان یاد بگیرید</Text>
            <Text style={s.body}>درس‌های کوتاه فارسی، اصطلاحات انگلیسی و مرور هوشمند برای شناخت حقوق انگلستان و ولز.</Text>
            <Text style={s.label}>نام شما</Text>
            <TextInput value={name} onChangeText={setName} placeholder="مثلاً سارا" placeholderTextColor={palette.muted} style={s.input} textAlign="right" accessibilityLabel="نام شما" />
            <Text style={s.label}>هدف روزانه</Text>
            <Text style={s.hint}>چند درس کوتاه در روز؟ بعداً قابل تغییر است.</Text>
            <GoalPicker value={goal} onChange={setGoal} />
            <ActionButton label="شروع یادگیری" icon="arrow-left" onPress={() => finishOnboarding(name, goal)} fullWidth />
            <Notice />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Home() {
  const nav = useRootNav();
  const { state, streak, completedToday } = useLearner();
  const next = lessons.find((item) => !state.completedLessons.includes(item.id)) ?? lessons[0]!;
  const mastery = Math.round((state.completedLessons.length / lessons.length) * 100);
  const due = state.reviewQueue.filter((item) => new Date(item.dueAt) <= new Date()).length;
  return (
    <Page>
      <Header eyebrow="داشبورد یادگیری" title={'سلام ' + state.name} subtitle="امروز یک مفهوم حقوقی را روشن‌تر کنید." />
      <View style={s.hero}>
        <View style={s.heroCopy}>
          <Pill icon="zap" text="پیشنهاد امروز" />
          <Text style={s.heroTitle}>{next.title}</Text>
          <Text style={s.english}>{next.englishTitle}</Text>
          <Text style={s.body}>{next.summary}</Text>
          <View style={s.metaRow}><Meta icon="clock" text={next.duration + ' دقیقه'} /><Meta icon="layers" text={next.sections.length + ' بخش'} /></View>
          <ActionButton label="شروع درس" icon="arrow-left" onPress={() => nav.navigate('Lesson', { lessonId: next.id })} />
        </View>
        <View style={s.goalCard}><Feather name="book-open" size={40} color={palette.white} /><Text style={s.goalBig}>{completedToday}/{state.dailyGoal}</Text><Text style={s.goalCaption}>هدف امروز</Text></View>
      </View>
      <View style={s.stats}><Stat icon="award" value={mastery + '٪'} label="پیشرفت کل" color={palette.primary} soft={palette.primarySoft} /><Stat icon="check-circle" value={String(state.completedLessons.length)} label="درس کامل" color={palette.teal} soft={palette.tealSoft} /><Stat icon="refresh-cw" value={String(due)} label="مرور آماده" color={palette.rose} soft={palette.roseSoft} /><Stat icon="activity" value={String(streak)} label="روز پیوسته" color={palette.goldInk} soft={palette.saffronSoft} /></View>
      <SectionTitle title="مسیرهای پیشنهادی" />
      <View style={s.grid}>{pathways.slice(0, 3).map((item) => <PathCard key={item.id} item={item} onPress={() => nav.navigate('Pathway', { pathwayId: item.id })} />)}</View>
      <Notice />
    </Page>
  );
}

function Learn() {
  const nav = useRootNav();
  const { state } = useLearner();
  const [track, setTrack] = useState<SqeTrack>('FLK1');
  const [query, setQuery] = useState('');
  const tracks: { key: SqeTrack; label: string }[] = [
    { key: 'FLK1', label: 'FLK1' }, { key: 'FLK2', label: 'FLK2' },
    { key: 'SQE2', label: 'SQE2' }, { key: 'EVERYDAY', label: 'حقوق روزمره' },
  ];
  const source = track === 'EVERYDAY' ? pathways.filter((item) => !item.track) : stageSubjects(track);
  const key = query.trim().toLocaleLowerCase();
  const visible = key ? source.filter((item) => [item.title, item.englishTitle, item.description].some((value) => value.toLocaleLowerCase().includes(key))) : source;
  const unitCount = source.reduce((sum, item) => sum + item.lessonIds.length, 0);
  return (
    <Page>
      <Header eyebrow="برنامه کامل SQE" title="یادگیری ساختاریافته" subtitle="FLK1 و FLK2 برای دانش کاربردی؛ SQE2 برای شش مهارت عملی." />
      <View style={s.specBanner}>
        <View style={s.specIcon}><Feather name="award" size={24} color={palette.white} /></View>
        <View style={s.flexEnd}><Text style={s.specTitle}>منطبق با ساختار SRA · نسخه ۲۰۲۵/۲۶</Text><Text style={s.specText}>۱۴ بخش SQE1 · ۶ مهارت SQE2 · {sqeTotals.practiceQuestions} پرسش تمرینی · اخلاق حرفه‌ای pervasive</Text></View>
      </View>
      <View style={s.trackTabs}>{tracks.map((item) => <Pressable key={item.key} accessibilityRole="tab" accessibilityState={{ selected: track === item.key }} onPress={() => { setTrack(item.key); setQuery(''); }} style={({ pressed }) => [s.trackTab, track === item.key && s.trackTabActive, pressed && s.pressed]}><Text style={[s.trackTabText, track === item.key && s.trackTabTextActive]}>{item.label}</Text></Pressable>)}</View>
      <View style={s.searchBox}><Feather name="search" size={20} color={palette.muted} /><TextInput value={query} onChangeText={setQuery} placeholder="جست‌وجوی موضوع یا اصطلاح…" placeholderTextColor={palette.muted} style={s.searchInput} textAlign="right" accessibilityLabel="جست‌وجوی سرفصل‌ها" /></View>
      <View style={s.library}><View style={s.iconHero}><Feather name={track === 'SQE2' ? 'target' : 'book-open'} size={25} color={palette.primary} /></View><View style={s.flexEnd}><Text style={s.cardTitle}>{source.length} بخش · {unitCount} واحد یادگیری</Text><Text style={s.hint}>{state.completedLessons.filter((id) => source.some((path) => path.lessonIds.includes(id))).length} واحد تکمیل شده؛ همه واحدها بدون قفل در دسترس‌اند.</Text></View></View>
      <View style={s.grid}>{visible.map((item) => <PathCard key={item.id} item={item} onPress={() => nav.navigate('Pathway', { pathwayId: item.id })} />)}</View>
      {!visible.length ? <Empty icon="search" title="نتیجه‌ای در این بخش نبود" body="عبارت دیگری را امتحان کنید یا بخش دیگری را انتخاب کنید." /> : null}
      <Notice />
    </Page>
  );
}

type PathProps = NativeStackScreenProps<RootStackParamList, 'Pathway'>;
function PathwayScreen({ route, navigation }: PathProps) {
  const item = pathwayById[route.params.pathwayId];
  const { state } = useLearner();
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
        <Text style={s.pathHeroTitle}>{item.title}</Text><Text style={[s.english, { color: accentColor }]}>{item.englishTitle}</Text><Text style={s.body}>{item.description}</Text>
        <View style={s.between}><Text style={s.smallStrong}>{complete} از {item.lessonIds.length} درس</Text><Text style={s.smallStrong}>{percent}٪</Text></View>
        <ProgressBar value={percent} color={accentColor} trackColor={darkMode ? palette.line : palette.white} />
        {item.track === 'FLK1' || item.track === 'FLK2' ? <ActionButton label={`تمرین ۲۰ سؤال از ${item.title}`} icon="edit-3" variant="secondary" onPress={() => navigation.navigate('Test', { stage: item.track as SqeStage, count: 20, mode: 'diagnostic', subjectId: item.id })} /> : null}
      </View>
      <View style={s.list}>{item.lessonIds.map((id, index) => {
        const lesson = lessonById[id]!;
        const done = state.completedLessons.includes(id);
        return <Pressable key={id} accessibilityRole="button" onPress={() => navigation.navigate('Lesson', { lessonId: id })} style={({ pressed }) => [s.lessonRow, pressed && s.pressed]}>
          <View style={[s.lessonNumber, done && s.done]}>{done ? <Feather name="check" size={18} color={palette.white} /> : <Text style={s.number}>{index + 1}</Text>}</View>
          <View style={s.flexEnd}><Text style={s.cardTitle}>{lesson.title}</Text><Text style={s.englishSmall}>{lesson.englishTitle}</Text><View style={s.metaRow}><Meta icon="clock" text={lesson.duration + ' دقیقه'} />{state.quizScores[id] !== undefined ? <Meta icon="award" text={state.quizScores[id] + '٪'} /> : null}</View></View>
          <Feather name="chevron-left" size={22} color={palette.muted} />
        </Pressable>;
      })}</View>
      <Notice />
    </ScrollView></SafeAreaView>
  );
}

type LessonProps = NativeStackScreenProps<RootStackParamList, 'Lesson'>;
function LessonScreen({ route, navigation }: LessonProps) {
  const item = lessonById[route.params.lessonId];
  const { state, completeLesson, toggleSaved } = useLearner();
  const [section, setSection] = useState(0);
  const [quiz, setQuiz] = useState(-1);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);
  const { playCorrect, playIncorrect } = useSoundFeedback();
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
      if (correct) playCorrect();
      else playIncorrect();
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
    completeLesson(item.id, score, item.quiz.map((entry) => entry.id), missed);
    setAnswers(final); setFinished(true);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const result = Math.round((item.quiz.filter((entry) => answers[entry.id] === entry.correctIndex).length / item.quiz.length) * 100);
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.lessonTop}><RoundIcon icon="x" label="بستن درس" onPress={navigation.goBack} /><View style={s.flex}><ProgressBar value={progress} /></View><RoundIcon icon="bookmark" label="ذخیره درس" active={saved} onPress={() => toggleSaved(item.id)} /></View>
      <ScrollView contentContainerStyle={s.lessonPage}>
        {finished ? <View style={s.result}><View style={s.resultIcon}><Feather name="award" size={38} color={palette.white} /></View><Text style={s.eyebrow}>درس تکمیل شد</Text><Text style={s.pathHeroTitle}>{item.title}</Text><Text style={s.score}>{result}٪</Text><Text style={s.centerBody}>پیشرفت ذخیره شد و پرسش‌ها به برنامه مرور فاصله‌دار اضافه شدند.</Text><ActionButton label="بازگشت به مسیر" icon="arrow-left" onPress={navigation.goBack} fullWidth /></View>
        : quiz < 0 ? <LessonSection item={item} index={section} />
        : question ? <QuizCard question={question} selected={selected} revealed={revealed} onSelect={setSelected} /> : null}
      </ScrollView>
      {!finished ? <View style={s.lessonFooter}><ActionButton label={quiz < 0 ? (section === item.sections.length - 1 ? 'شروع آزمون کوتاه' : 'بخش بعد') : revealed ? (quiz === item.quiz.length - 1 ? 'ثبت نتیجه' : 'پرسش بعد') : 'بررسی پاسخ'} icon="arrow-left" onPress={advance} disabled={quiz >= 0 && selected === null} sound={quiz < 0 || revealed} fullWidth /></View> : null}
    </SafeAreaView>
  );
}

function LessonSection({ item, index }: { item: Lesson; index: number }) {
  const part = item.sections[index]!;
  return <View style={s.reading}>
    <Text style={s.eyebrow}>بخش {index + 1} از {item.sections.length}</Text>
    <Text style={s.readingTitle}>{part.title}</Text>
    <Text style={s.readingBody}>{part.body}</Text>
    {part.bullets?.length ? <View style={s.learningList}>{part.bullets.map((bullet, bulletIndex) => <View key={bulletIndex} style={s.learningPoint}><View style={s.bulletDot} /><Text style={s.learningText}>{bullet}</Text></View>)}</View> : null}
    {part.example ? <View style={s.exampleCard}><Feather name="briefcase" size={20} color={palette.goldInk} /><View style={s.flexEnd}><Text style={s.exampleLabel}>مثال و تمرین کاربردی</Text><Text style={s.exampleText}>{part.example}</Text></View></View> : null}
    {part.checklist?.length ? <View style={s.checklistCard}><Text style={s.checklistTitle}>چک‌لیست این بخش</Text>{part.checklist.map((entry, entryIndex) => <View key={entryIndex} style={s.checkRow}><Feather name="check-square" size={18} color={palette.teal} /><Text style={s.checkText}>{entry}</Text></View>)}</View> : null}
    {part.callout ? <View style={s.callout}><Feather name="info" size={20} color={palette.primary} /><Text style={s.calloutText}>{part.callout}</Text></View> : null}
    <View style={s.term}><Text style={s.hint}>واژه کلیدی</Text><Text style={s.termFa}>{part.termFa}</Text><Text style={s.english}>{part.termEn}</Text></View>
    {part.source ? <View style={s.sourceNote}><Feather name="external-link" size={15} color={palette.muted} /><Text style={s.sourceText}>{part.source}</Text></View> : null}
    <Notice />
  </View>;
}

function QuizCard({ question, selected, revealed, onSelect }: { question: QuizQuestion; selected: number | null; revealed: boolean; onSelect: (value: number) => void }) {
  const isCorrect = selected === question.correctIndex;
  return <View style={s.reading}><View style={s.iconHero}><Feather name="help-circle" size={25} color={palette.primary} /></View><Text style={s.eyebrow}>سنجش یادگیری</Text><Text style={s.quizTitle}>{question.prompt}</Text><View style={s.quizAnswers}>{question.answers.map((answer, index) => {
    const chosen = selected === index;
    const good = revealed && index === question.correctIndex;
    const bad = revealed && chosen && !good;
    return <Pressable key={answer} disabled={revealed} accessibilityRole="radio" accessibilityState={{ checked: chosen }} onPress={() => onSelect(index)} style={({ pressed }) => [s.answer, chosen && s.answerChosen, good && s.answerGood, bad && s.answerBad, pressed && !revealed && s.pressed]}><View style={[s.radio, chosen && s.radioChosen, good && s.done, bad && s.radioBad]}>{chosen || good ? <Feather name={good ? 'check' : bad ? 'x' : 'circle'} size={13} color={palette.white} /> : null}</View><Text style={s.answerText}>{answer}</Text></Pressable>;
  })}</View>{revealed ? <View style={[s.feedback, isCorrect ? s.feedbackGood : s.feedbackBad]} accessibilityLiveRegion="polite"><View style={s.feedbackSymbol}>{isCorrect ? <Text style={s.feedbackEmoji} accessibilityLabel="تشویق">👏</Text> : <Feather name="info" size={20} color={palette.rose} />}</View><View style={s.flexEnd}><Text style={s.smallStrong}>{isCorrect ? 'آفرین! درست بود' : 'اشکالی ندارد؛ دوباره مرور کنیم'}</Text><Text style={s.hint}>{question.explanation}</Text></View></View> : null}</View>;
}

type TestProps = NativeStackScreenProps<RootStackParamList, 'Test'>;
function TestScreen({ route, navigation }: TestProps) {
  const { stage, count, mode, subjectId } = route.params;
  const { recordTestAttempt } = useLearner();
  const pool = questionsForStage(stage).filter((item) => !subjectId || item.subjectId === subjectId);
  const questions = useMemo(() => [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(count, pool.length)), [stage, count, subjectId]);
  const duration = mode === 'mock' ? 153 * 60 : mode === 'diagnostic' ? 45 * 60 : 15 * 60;
  const [remaining, setRemaining] = useState(duration);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [startedAt] = useState(Date.now);
  const question = questions[index]!;
  const answered = Object.keys(answers).length;

  const finishTest = () => {
    if (finished) return;
    const right = questions.filter((item) => answers[item.id] === item.correctIndex).length;
    const percent = Math.round((right / questions.length) * 100);
    setCorrect(right); setScore(percent); setFinished(true);
    recordTestAttempt({ stage, mode, score: percent, correct: right, total: questions.length, durationSeconds: Math.round((Date.now() - startedAt) / 1000) });
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  useEffect(() => {
    if (finished) return;
    const timer = setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [finished]);

  useEffect(() => {
    if (remaining === 0 && !finished) finishTest();
  }, [remaining, finished]);

  const submit = () => {
    if (answered < questions.length) {
      Alert.alert('آزمون را تمام می‌کنید؟', `${questions.length - answered} سؤال بدون پاسخ است.`, [{ text: 'ادامه آزمون', style: 'cancel' }, { text: 'ثبت نتیجه', onPress: finishTest }]);
    } else finishTest();
  };
  const toggleFlag = () => setFlagged((items) => items.includes(question.id) ? items.filter((id) => id !== question.id) : [...items, question.id]);
  const time = `${Math.floor(remaining / 60).toString().padStart(2,'0')}:${(remaining % 60).toString().padStart(2,'0')}`;
  const modeTitle = mode === 'mock' ? 'نشست شبیه‌ساز' : mode === 'diagnostic' ? 'آزمون تشخیصی' : 'تمرین سریع';

  if (finished) {
    const breakdown = stageSubjects(stage).map((subject) => {
      const subjectQuestions = questions.filter((item) => item.subjectId === subject.id);
      const subjectCorrect = subjectQuestions.filter((item) => answers[item.id] === item.correctIndex).length;
      return { subject, total: subjectQuestions.length, correct: subjectCorrect, score: subjectQuestions.length ? Math.round(subjectCorrect / subjectQuestions.length * 100) : 0 };
    }).filter((item) => item.total);
    return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.testPage}><TopBar onBack={navigation.goBack} /><View style={s.result}><View style={[s.resultIcon,{backgroundColor:score>=70?palette.success:palette.saffron}]}><Feather name={score>=70?'award':'trending-up'} size={38} color={palette.white} /></View><Text style={s.eyebrow}>نتیجه {stage}</Text><Text style={s.pathHeroTitle}>{modeTitle} تکمیل شد</Text><Text style={s.score}>{score}٪</Text><Text style={s.centerBody}>{correct} پاسخ درست از {questions.length} · نتیجه در تاریخچه محلی ذخیره شد.</Text></View><SectionTitle title="عملکرد بر اساس بخش" /><View style={s.list}>{breakdown.map(({subject,total,correct:subjectCorrect,score:subjectScore})=><View key={subject.id} style={s.breakdownRow}><View style={s.flexEnd}><Text style={s.modeTitle}>{subject.title}</Text><Text style={s.hint}>{subjectCorrect} از {total} درست</Text></View><View style={s.breakdownScore}><Text style={s.smallStrong}>{subjectScore}٪</Text></View></View>)}</View><ActionButton label="بازگشت به آزمون‌ها" icon="arrow-left" onPress={navigation.goBack} fullWidth /><Notice /></ScrollView></SafeAreaView>;
  }

  return <SafeAreaView style={s.safe}>
    <View style={s.testTop}><RoundIcon icon="x" label="خروج از آزمون" onPress={navigation.goBack} /><View style={s.testHeading}><Text style={s.smallStrong}>{stage} · {modeTitle}</Text><Text style={s.hint}>سؤال {index + 1} از {questions.length}</Text></View><View style={[s.timer,remaining<300&&s.timerUrgent]}><Feather name="clock" size={16} color={remaining<300?palette.rose:palette.primary} /><Text style={[s.timerText,remaining<300&&{color:palette.rose}]}>{time}</Text></View></View>
    <ProgressBar value={((index + 1) / questions.length) * 100} />
    <ScrollView contentContainerStyle={s.testPage}>
      <View style={s.questionMeta}><Text style={s.hint}>{pathwayById[question.subjectId]?.title}</Text><Pressable accessibilityRole="button" accessibilityState={{selected:flagged.includes(question.id)}} onPress={toggleFlag} style={({pressed})=>[s.flagButton,flagged.includes(question.id)&&s.flagActive,pressed&&s.pressed]}><Feather name="flag" size={17} color={flagged.includes(question.id)?palette.saffron:palette.muted} /><Text style={s.hint}>{flagged.includes(question.id)?'علامت‌گذاری شد':'علامت‌گذاری'}</Text></Pressable></View>
      <Text style={s.quizTitle}>{question.prompt}</Text>
      <View style={s.quizAnswers}>{question.answers.map((answer,answerIndex)=>{const chosen=answers[question.id]===answerIndex;return <Pressable key={answerIndex} accessibilityRole="radio" accessibilityState={{checked:chosen}} onPress={()=>setAnswers((items)=>({...items,[question.id]:answerIndex}))} style={({pressed})=>[s.answer,chosen&&s.answerChosen,pressed&&s.pressed]}><View style={[s.radio,chosen&&s.radioChosen]}>{chosen?<Feather name="check" size={13} color={palette.white}/>:null}</View><Text style={s.answerText}>{answer}</Text></Pressable>})}</View>
      <View style={s.questionNav}><ActionButton label="قبلی" icon="arrow-right" variant="quiet" onPress={()=>setIndex(Math.max(0,index-1))} disabled={index===0} /><ActionButton label={index===questions.length-1?'ثبت آزمون':'بعدی'} icon="arrow-left" onPress={()=>index===questions.length-1?submit():setIndex(index+1)} /></View>
      <Text style={s.centerBody}>{answered} پاسخ داده شده · {flagged.length} علامت‌گذاری شده</Text>
    </ScrollView>
  </SafeAreaView>;
}

function Review() {
  const { state, reviewAnswer } = useLearner();
  const { playCorrect, playIncorrect } = useSoundFeedback();
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const due = state.reviewQueue.filter((entry) => new Date(entry.dueAt) <= new Date());
  const record = due[0];
  const lesson = record ? lessonById[record.lessonId] : undefined;
  const question = lesson?.quiz.find((entry) => entry.id === record!.questionId);
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
  return <Page><Header eyebrow="حافظه فعال" title="مرور فاصله‌دار" subtitle="پرسش‌ها در زمان مناسب برای تثبیت حافظه برمی‌گردند." /><View style={s.stats}><Stat icon="inbox" value={String(due.length)} label="اکنون آماده" color={palette.primary} soft={palette.primarySoft} /><Stat icon="calendar" value={String(state.reviewQueue.length - due.length)} label="برای بعد" color={palette.teal} soft={palette.tealSoft} /></View>{question ? <View style={s.list}><Text style={s.hint}>{lesson?.title}</Text><QuizCard question={question} selected={selected} revealed={revealed} onSelect={setSelected} /><ActionButton label={revealed ? 'ثبت و ادامه' : 'بررسی پاسخ'} icon="arrow-left" onPress={advance} disabled={selected === null} sound={revealed} fullWidth /></View> : <Empty icon="check-circle" title="مرور امروز تمام شد" body={state.reviewQueue.length ? 'پرسش‌های بعدی طبق برنامه ظاهر می‌شوند.' : 'پس از اولین درس، پرسش‌ها خودکار به اینجا اضافه می‌شوند.'} />}<Notice /></Page>;
}

function Practice() {
  const nav = useRootNav();
  const { state } = useLearner();
  const modes: { mode: 'quick' | 'diagnostic' | 'mock'; count: number; title: string; subtitle: string; icon: IconName }[] = [
    { mode: 'quick', count: 10, title: 'تمرین سریع', subtitle: '۱۰ سؤال · حدود ۱۵ دقیقه', icon: 'zap' },
    { mode: 'diagnostic', count: 30, title: 'آزمون تشخیصی', subtitle: '۳۰ سؤال · تحلیل سطح آمادگی', icon: 'activity' },
    { mode: 'mock', count: 90, title: 'شبیه‌ساز یک نشست کامل', subtitle: '۹۰ سؤال · زمان رسمی ۱۵۳ دقیقه', icon: 'clock' },
  ];
  const best = (stage: SqeStage) => {
    const scores = state.testHistory.filter((item) => item.stage === stage).map((item) => item.score);
    return scores.length ? Math.max(...scores) + '٪' : '—';
  };
  return <Page>
    <Header eyebrow="بانک تمرین SQE1" title="تمرین و آزمون" subtitle={`${sqeTotals.practiceQuestions} پرسش پنج‌گزینه‌ای ساختاریافته با زمان‌سنج، علامت‌گذاری و ذخیره نتیجه.`} />
    <View style={s.examGrid}>{(['FLK1','FLK2'] as SqeStage[]).map((stage) => <View key={stage} style={s.examPanel}><View style={s.between}><View style={[s.pathIcon,{backgroundColor:stage==='FLK1'?palette.primarySoft:palette.tealSoft}]}><Feather name={stage==='FLK1'?'briefcase':'home'} size={23} color={stage==='FLK1'?palette.primary:palette.teal} /></View><View style={s.flexEnd}><Text style={s.examStage}>{stage}</Text><Text style={s.hint}>{stageSubjects(stage).length} بخش · بهترین نتیجه {best(stage)}</Text></View></View><View style={s.list}>{modes.map((item) => <Pressable key={item.mode} accessibilityRole="button" onPress={() => nav.navigate('Test',{stage,count:item.count,mode:item.mode})} style={({pressed})=>[s.modeRow,pressed&&s.pressed]}><View style={s.modeIcon}><Feather name={item.icon} size={19} color={palette.primary} /></View><View style={s.flexEnd}><Text style={s.modeTitle}>{item.title}</Text><Text style={s.hint}>{item.subtitle}</Text></View><Feather name="chevron-left" size={20} color={palette.muted} /></Pressable>)}</View></View>)}</View>
    <View style={s.examNote}><Feather name="info" size={20} color={palette.primary} /><View style={s.flexEnd}><Text style={s.smallStrong}>فرمت واقعی SQE1</Text><Text style={s.hint}>هر FLK در آزمون رسمی ۱۸۰ سؤال دارد و در دو نشست ۹۰ سؤالی برگزار می‌شود. شبیه‌ساز این اپ یک نشست ۹۰ سؤالی را تمرین می‌کند.</Text></View></View>
    <SectionTitle title="نتایج اخیر" />
    {state.testHistory.length ? <View style={s.list}>{state.testHistory.slice(0,6).map((item)=><View key={item.id} style={s.historyRow}><View style={[s.scoreBadge,{backgroundColor:item.score>=70?palette.tealSoft:palette.saffronSoft}]}><Text style={s.scoreBadgeText}>{item.score}٪</Text></View><View style={s.flexEnd}><Text style={s.cardTitle}>{item.stage} · {item.total} سؤال</Text><Text style={s.hint}>{new Date(item.completedAt).toLocaleDateString('fa-IR')} · {item.correct} پاسخ درست</Text></View></View>)}</View>:<Empty icon="bar-chart-2" title="هنوز نتیجه‌ای ثبت نشده" body="یک تمرین سریع شروع کنید؛ نتیجه و تاریخچه روی همین دستگاه ذخیره می‌شود." />}
    <Notice />
  </Page>;
}

function Profile() {
  const { state, streak, updateSettings, resetProgress } = useLearner();
  const { playTap } = useSoundFeedback();
  const [name, setName] = useState(state.name);
  const reset = () => Alert.alert('پاک‌کردن پیشرفت؟', 'همه درس‌ها و امتیازهای محلی حذف می‌شوند.', [{ text: 'انصراف', style: 'cancel' }, { text: 'پاک کردن', style: 'destructive', onPress: () => void resetProgress() }]);
  return (
    <Page>
      <Header eyebrow="حساب محلی" title="تنظیمات یادگیری" subtitle="اطلاعات شما فقط روی همین دستگاه ذخیره می‌شود." />
      <View style={s.profile}>
        <View style={s.avatar}><Feather name="user" size={30} color={palette.white} /></View>
        <View style={s.flexEnd}><Text style={s.profileName}>{state.name}</Text><Text style={s.profileMeta}>{state.completedLessons.length} درس · {streak} روز پیوسته</Text></View>
      </View>
      <View style={s.settings}>
        <Text style={s.sectionTitle}>مشخصات</Text>
        <Text style={s.label}>نام نمایشی</Text>
        <View style={s.nameRow}>
          <TextInput value={name} onChangeText={setName} style={s.nameInput} textAlign="right" />
          <Pressable accessibilityRole="button" accessibilityLabel="ذخیره نام" onPress={() => updateSettings({ name: name.trim() || state.name })} style={({ pressed }) => [s.save, pressed && s.pressed]}><Text style={s.saveText}>ذخیره</Text></Pressable>
        </View>
        <Text style={s.label}>هدف روزانه</Text>
        <GoalPicker value={state.dailyGoal} onChange={(dailyGoal) => updateSettings({ dailyGoal })} />
      </View>
      <View style={s.settings}>
        <Text style={s.sectionTitle}>ترجیحات</Text>
        <View style={s.preferenceHeading}>
          <Text style={s.label}>ظاهر برنامه</Text>
          <Text style={s.hint}>روشن، تاریک یا هماهنگ با تنظیمات دستگاه</Text>
        </View>
        <ThemePicker value={state.themeMode} onChange={(themeMode) => updateSettings({ themeMode })} />
        <View style={s.settingRow}>
          <View style={s.iconSmall}><Feather name="volume-2" size={19} color={palette.primary} /></View>
          <View style={s.flexEnd}><Text style={s.cardTitle}>بازخورد صوتی</Text><Text style={s.hint}>صدای کوتاه برای لمس، پاسخ درست و پاسخ نادرست</Text></View>
          <Switch accessibilityLabel="بازخورد صوتی" value={state.soundEffectsEnabled} onValueChange={(soundEffectsEnabled) => { if (state.soundEffectsEnabled) playTap(); updateSettings({ soundEffectsEnabled }); }} trackColor={{ false: palette.line, true: palette.primarySoft }} thumbColor={state.soundEffectsEnabled ? palette.primary : palette.muted} />
        </View>
        <View style={s.settingRow}>
          <View style={s.iconSmall}><Feather name="align-right" size={19} color={palette.primary} /></View>
          <View style={s.flexEnd}><Text style={s.cardTitle}>فارسی در اولویت</Text><Text style={s.hint}>اصطلاح انگلیسی زیر عنوان باقی می‌ماند</Text></View>
          <Switch value={state.persianFirst} onValueChange={(persianFirst) => updateSettings({ persianFirst })} trackColor={{ false: palette.line, true: palette.primarySoft }} thumbColor={state.persianFirst ? palette.primary : palette.muted} />
        </View>
      </View>
      <View style={s.settings}>
        <Text style={s.sectionTitle}>شفافیت محتوا و انتشار</Text>
        <View style={s.settingRow}><View style={s.iconSmall}><Feather name="database" size={19} color={palette.primary} /></View><View style={s.flexEnd}><Text style={s.cardTitle}>نسخه محتوایی ۲۰۲۵/۲۶</Text><Text style={s.hint}>{sqeTotals.lessons} واحد SQE · {sqeTotals.practiceQuestions} پرسش تمرینی ساختاریافته</Text></View></View>
        <View style={s.settingRow}><View style={s.iconSmall}><Feather name="lock" size={19} color={palette.teal} /></View><View style={s.flexEnd}><Text style={s.cardTitle}>حریم خصوصی آفلاین</Text><Text style={s.hint}>بدون حساب، تبلیغ یا analytics؛ پیشرفت فقط روی دستگاه ذخیره می‌شود.</Text></View></View>
        <View style={s.settingRow}><View style={s.iconSmall}><Feather name="alert-circle" size={19} color={palette.rose} /></View><View style={s.flexEnd}><Text style={s.cardTitle}>محصول مستقل</Text><Text style={s.hint}>وابسته یا مورد تأیید SRA یا Kaplan SQE نیست؛ آموزش عمومی، نه مشاوره حقوقی.</Text></View></View>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="پاک‌کردن داده و شروع دوباره" onPress={reset} style={({ pressed }) => [s.danger, pressed && s.pressed]}><Feather name="trash-2" size={18} color={palette.rose} /><Text style={s.dangerText}>پاک‌کردن داده و شروع دوباره</Text></Pressable>
      <Notice />
    </Page>
  );
}

function ThemePicker({ value, onChange }: { value: ThemeMode; onChange: (value: ThemeMode) => void }) {
  const choices: Array<{ value: ThemeMode; label: string; icon: IconName }> = [
    { value: 'system', label: 'دستگاه', icon: 'smartphone' },
    { value: 'light', label: 'روشن', icon: 'sun' },
    { value: 'dark', label: 'تاریک', icon: 'moon' },
  ];
  return (
    <View style={s.themePicker} accessibilityRole="radiogroup">
      {choices.map((choice) => {
        const selected = value === choice.value;
        return (
          <Pressable
            key={choice.value}
            accessibilityRole="radio"
            accessibilityLabel={'حالت ' + choice.label}
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
function Page({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={[s.page, width >= 1100 && s.pageWide]}>{children}</ScrollView></SafeAreaView>;
}
function Header({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return <View style={s.header}><Brand /><View style={s.flexEnd}><Text style={s.eyebrow}>{eyebrow}</Text><Text style={s.pageTitle}>{title}</Text><Text style={s.body}>{subtitle}</Text></View></View>;
}
function TopBar({ onBack }: { onBack: () => void }) { return <View style={s.topBar}><Brand /><RoundIcon icon="arrow-right" label="بازگشت" onPress={onBack} /></View>; }
function RoundIcon({ icon, label, onPress, active }: { icon: IconName; label: string; onPress: () => void; active?: boolean }) { return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [s.round, pressed && s.pressed]}><Feather name={icon} size={21} color={active ? palette.primary : palette.ink} /></Pressable>; }
function GoalPicker({ value, onChange }: { value: number; onChange: (value: number) => void }) { return <View style={s.goalRow}>{[1, 2, 3].map((item) => <Pressable key={item} accessibilityRole="radio" accessibilityState={{ checked: value === item }} onPress={() => onChange(item)} style={({ pressed }) => [s.goalChoice, value === item && s.goalActive, pressed && s.pressed]}><Text style={[s.goalNumber, value === item && s.goalNumberActive]}>{item}</Text><Text style={s.hint}>درس</Text></Pressable>)}</View>; }
function SectionTitle({ title }: { title: string }) { return <Text style={s.sectionTitle}>{title}</Text>; }
function Pill({ icon, text }: { icon: IconName; text: string }) { return <View style={s.pill}><Feather name={icon} size={14} color={palette.goldInk} /><Text style={s.pillText}>{text}</Text></View>; }
function Meta({ icon, text }: { icon: IconName; text: string }) { return <View style={s.meta}><Feather name={icon} size={14} color={palette.muted} /><Text style={s.hint}>{text}</Text></View>; }
function Stat({ icon, value, label, color, soft }: { icon: IconName; value: string; label: string; color: string; soft: string }) { return <View style={s.stat}><View style={[s.iconSmall, { backgroundColor: soft }]}><Feather name={icon} size={20} color={color} /></View><Text style={s.statValue}>{value}</Text><Text style={s.hint}>{label}</Text></View>; }
function PathCard({ item, onPress }: { item: Pathway; onPress: () => void }) {
  const { state } = useLearner();
  const complete = item.lessonIds.filter((id) => state.completedLessons.includes(id)).length;
  const percent = Math.round((complete / item.lessonIds.length) * 100);
  const softColor = themedSoftColor(item.color, item.softColor, darkMode);
  const accentColor = themedAccentColor(item.color, darkMode);
  return <Pressable accessibilityRole="button" accessibilityLabel={`مسیر ${item.title}`} onPress={onPress} style={({ pressed }) => [s.pathCard, pressed && s.pressed]}><View style={s.between}><View style={[s.pathIcon, { backgroundColor: softColor }]}><Feather name={item.icon} size={23} color={accentColor} /></View><View style={s.chip}><Text style={s.chipText}>{item.level}</Text></View></View><Text style={s.cardTitle}>{item.title}</Text><Text style={[s.englishSmall, { color: accentColor }]}>{item.englishTitle}</Text><Text style={s.hint}>{item.description}</Text><View style={s.cardFoot}><View style={s.between}><Text style={s.smallStrong}>{percent ? percent + '٪' : 'شروع نشده'}</Text><Text style={s.hint}>{item.lessonIds.length} درس</Text></View><ProgressBar value={percent} color={accentColor} trackColor={softColor} /></View></Pressable>;
}
function Empty({ icon, title, body }: { icon: IconName; title: string; body: string }) { return <View style={s.empty}><View style={s.iconHero}><Feather name={icon} size={30} color={palette.primary} /></View><Text style={s.sectionTitle}>{title}</Text><Text style={s.centerBody}>{body}</Text></View>; }
function Notice() { return <View style={s.notice}><Feather name="shield" size={16} color={palette.muted} /><Text style={s.noticeText}>آموزش عمومی حقوق انگلستان و ولز؛ نه مشاوره حقوقی. قانون و مهلت‌ها ممکن است تغییر کنند.</Text></View>; }
function useRootNav() { return useNavigation<NativeStackNavigationProp<RootStackParamList>>(); }

const createStyles = (palette: AppPalette) => {
  const shadow = createShadow(palette);
  return StyleSheet.create({
  flex: { flex: 1 },
  flexEnd: { flex: 1, alignItems: 'flex-end' },
  safe: { flex: 1, backgroundColor: palette.background },
  pressed: { opacity: 0.72 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: palette.background },
  loadingLogo: { width: 62, height: 62, borderRadius: 21, backgroundColor: palette.primaryAction, alignItems: 'center', justifyContent: 'center' },
  tabsMobile: { height: 72, paddingTop: 7, paddingBottom: 7, borderTopColor: palette.line, backgroundColor: palette.surface },
  tabsDesktop: { width: 190, paddingTop: 28, paddingHorizontal: 9, borderRightColor: palette.line, backgroundColor: palette.surface },
  tabItem: { minHeight: 54, borderRadius: radius.md },
  tabLabel: { fontSize: 11, fontWeight: '700', writingDirection: 'rtl' },
  page: { width: '100%', maxWidth: 1160, alignSelf: 'center', padding: 20, paddingBottom: 108, gap: 26 },
  pageWide: { paddingHorizontal: 38, paddingTop: 34 },
  detailPage: { width: '100%', maxWidth: 900, alignSelf: 'center', padding: 20, paddingBottom: 70, gap: 20 },
  onboardScroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  onboardCard: { width: '100%', maxWidth: 610, alignSelf: 'center', gap: 18, padding: 28, borderWidth: 1, borderColor: palette.line, borderRadius: radius.xl, backgroundColor: palette.surface, ...shadow },
  onboardTitle: { color: palette.ink, fontSize: 30, lineHeight: 43, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  header: { gap: 25 },
  pageTitle: { color: palette.ink, fontSize: 33, lineHeight: 45, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  eyebrow: { color: palette.primary, fontSize: 11, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl', marginBottom: 6 },
  body: { color: palette.muted, fontSize: 15, lineHeight: 26, textAlign: 'right', writingDirection: 'rtl', marginTop: 6 },
  centerBody: { color: palette.muted, fontSize: 14, lineHeight: 24, textAlign: 'center', writingDirection: 'rtl' },
  label: { color: palette.ink, fontSize: 14, fontWeight: '800', textAlign: 'right', writingDirection: 'rtl' },
  hint: { color: palette.muted, fontSize: 11, lineHeight: 19, textAlign: 'right', writingDirection: 'rtl' },
  muted: { color: palette.muted, fontSize: 14, writingDirection: 'rtl' },
  input: { minHeight: 52, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.background, borderRadius: radius.md, paddingHorizontal: 15, color: palette.ink, fontSize: 16, writingDirection: 'rtl' },
  iconHero: { width: 54, height: 54, borderRadius: 18, backgroundColor: palette.primarySoft, alignItems: 'center', justifyContent: 'center' },
  iconSmall: { width: 42, height: 42, borderRadius: 14, backgroundColor: palette.primarySoft, alignItems: 'center', justifyContent: 'center' },
  goalRow: { flexDirection: 'row-reverse', gap: 10 },
  goalChoice: { flex: 1, minHeight: 66, borderWidth: 1, borderColor: palette.line, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.surface },
  goalActive: { borderColor: palette.primary, backgroundColor: palette.primarySoft },
  goalNumber: { color: palette.ink, fontSize: 20, fontFamily: type.latinBold },
  goalNumberActive: { color: palette.primary },
  hero: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 22, padding: 23, borderWidth: 1, borderColor: palette.line, borderRadius: radius.xl, backgroundColor: palette.surface, ...shadow },
  heroCopy: { flex: 2, minWidth: 260, alignItems: 'flex-end', gap: 8 },
  heroTitle: { color: palette.ink, fontSize: 26, lineHeight: 38, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  goalCard: { flex: 1, minWidth: 180, minHeight: 210, borderRadius: radius.lg, backgroundColor: palette.brandSurface, alignItems: 'center', justifyContent: 'center', gap: 7 },
  goalBig: { color: palette.white, fontSize: 38, fontFamily: type.latinBold, marginTop: 8 },
  goalCaption: { color: palette.onPrimaryMuted, fontSize: 12, fontWeight: '700', writingDirection: 'rtl' },
  english: { color: palette.primary, fontFamily: type.latinSemibold, fontSize: 13, textAlign: 'right' },
  englishSmall: { color: palette.primary, fontFamily: type.latinMedium, fontSize: 10, textAlign: 'right', marginTop: 2 },
  pill: { minHeight: 30, paddingHorizontal: 11, borderRadius: radius.round, backgroundColor: palette.saffronSoft, flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  pillText: { color: palette.goldInk, fontSize: 11, fontWeight: '800', writingDirection: 'rtl' },
  metaRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12, marginTop: 7 },
  meta: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5 },
  stats: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12 },
  stat: { flexGrow: 1, flexBasis: 145, minWidth: 135, padding: 17, alignItems: 'flex-end', borderWidth: 1, borderColor: palette.line, borderRadius: radius.lg, backgroundColor: palette.surface, ...shadow },
  statValue: { color: palette.ink, fontSize: 24, fontFamily: type.latinBold, marginTop: 10 },
  sectionTitle: { color: palette.ink, fontSize: 22, lineHeight: 32, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  grid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 15 },
  pathCard: { flexGrow: 1, flexBasis: 285, minWidth: 270, maxWidth: 555, padding: 19, borderWidth: 1, borderColor: palette.line, borderRadius: radius.lg, backgroundColor: palette.surface, ...shadow },
  between: { width: '100%', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  pathIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  chip: { minHeight: 28, paddingHorizontal: 10, borderRadius: radius.round, backgroundColor: palette.surfaceMuted, justifyContent: 'center' },
  chipText: { color: palette.inkSoft, fontSize: 10, fontWeight: '800', writingDirection: 'rtl' },
  cardTitle: { color: palette.ink, fontSize: 16, lineHeight: 24, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl', marginTop: 12 },
  cardFoot: { gap: 8, marginTop: 17 },
  library: { flexDirection: 'row-reverse', alignItems: 'center', gap: 15, padding: 18, borderRadius: radius.lg, backgroundColor: palette.primarySoft },
  topBar: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  round: { width: 48, height: 48, borderRadius: radius.md, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center' },
  pathHero: { padding: 27, borderRadius: radius.xl, alignItems: 'flex-end', gap: 7 },
  pathHeroIcon: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  pathHeroTitle: { color: palette.ink, fontSize: 27, lineHeight: 39, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  smallStrong: { color: palette.inkSoft, fontSize: 11, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  list: { gap: 11 },
  lessonRow: { minHeight: 102, flexDirection: 'row-reverse', alignItems: 'center', gap: 13, padding: 15, borderWidth: 1, borderColor: palette.line, borderRadius: radius.lg, backgroundColor: palette.surface, ...shadow },
  lessonNumber: { width: 42, height: 42, borderRadius: 14, backgroundColor: palette.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  done: { backgroundColor: palette.success, borderColor: palette.success },
  number: { color: palette.inkSoft, fontSize: 14, fontFamily: type.latinBold },
  lessonTop: { minHeight: 72, flexDirection: 'row-reverse', alignItems: 'center', gap: 13, paddingHorizontal: 17, borderBottomWidth: 1, borderBottomColor: palette.line, backgroundColor: palette.surface },
  lessonPage: { flexGrow: 1, width: '100%', maxWidth: 760, alignSelf: 'center', justifyContent: 'center', padding: 20 },
  lessonFooter: { padding: 14, borderTopWidth: 1, borderTopColor: palette.line, backgroundColor: palette.surface },
  reading: { gap: 14, padding: 25, alignItems: 'flex-end', borderWidth: 1, borderColor: palette.line, borderRadius: radius.xl, backgroundColor: palette.surface, ...shadow },
  readingTitle: { color: palette.ink, fontSize: 28, lineHeight: 41, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  readingBody: { color: palette.inkSoft, fontSize: 17, lineHeight: 32, textAlign: 'right', writingDirection: 'rtl' },
  callout: { width: '100%', flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 10, padding: 15, borderRadius: radius.md, backgroundColor: palette.primarySoft },
  calloutText: { flex: 1, color: palette.primaryDark, fontSize: 13, lineHeight: 22, textAlign: 'right', writingDirection: 'rtl' },
  term: { width: '100%', padding: 17, borderWidth: 1, borderColor: palette.line, borderRadius: radius.lg, backgroundColor: palette.background, alignItems: 'flex-end' },
  termFa: { color: palette.ink, fontSize: 20, fontWeight: '900', writingDirection: 'rtl', marginTop: 4 },
  quizTitle: { color: palette.ink, fontSize: 23, lineHeight: 35, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  quizAnswers: { width: '100%', alignSelf: 'stretch', gap: 11 },
  answer: { minHeight: 59, flexDirection: 'row-reverse', alignItems: 'center', gap: 11, padding: 13, borderWidth: 1, borderColor: palette.line, borderRadius: radius.md, backgroundColor: palette.background },
  answerChosen: { borderColor: palette.primary, backgroundColor: palette.primarySoft },
  answerGood: { borderColor: palette.success, backgroundColor: palette.tealSoft },
  answerBad: { borderColor: palette.rose, backgroundColor: palette.roseSoft },
  radio: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: palette.line, alignItems: 'center', justifyContent: 'center' },
  radioChosen: { borderColor: palette.primaryAction, backgroundColor: palette.primaryAction },
  radioBad: { borderColor: palette.rose, backgroundColor: palette.rose },
  answerText: { flex: 1, color: palette.inkSoft, fontSize: 14, lineHeight: 23, textAlign: 'right', writingDirection: 'rtl' },
  feedback: { width: '100%', flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: radius.md },
  feedbackGood: { backgroundColor: palette.tealSoft },
  feedbackBad: { backgroundColor: palette.roseSoft },
  feedbackSymbol: { width: 30, minHeight: 30, alignItems: 'center', justifyContent: 'center' },
  feedbackEmoji: { fontSize: 27, lineHeight: 32 },
  result: { gap: 10, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: palette.line, borderRadius: radius.xl, backgroundColor: palette.surface, ...shadow },
  resultIcon: { width: 70, height: 70, borderRadius: 23, backgroundColor: palette.success, alignItems: 'center', justifyContent: 'center' },
  score: { color: palette.primary, fontSize: 46, fontFamily: type.latinBold },
  empty: { minHeight: 280, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 25, borderWidth: 1, borderColor: palette.line, borderRadius: radius.xl, backgroundColor: palette.surface, ...shadow },
  searchBox: { minHeight: 57, flexDirection: 'row-reverse', alignItems: 'center', gap: 10, paddingHorizontal: 15, borderWidth: 1, borderColor: palette.line, borderRadius: radius.lg, backgroundColor: palette.surface, ...shadow },
  searchInput: { flex: 1, minHeight: 53, color: palette.ink, fontSize: 16, writingDirection: 'rtl' },
  glossary: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 10 },
  glossaryCard: { flexGrow: 1, flexBasis: 175, minWidth: 150, padding: 14, alignItems: 'flex-end', borderWidth: 1, borderColor: palette.line, borderRadius: radius.md, backgroundColor: palette.surface },
  searchResult: { minHeight: 80, flexDirection: 'row-reverse', alignItems: 'center', gap: 12, padding: 14, borderWidth: 1, borderColor: palette.line, borderRadius: radius.lg, backgroundColor: palette.surface },
  profile: { flexDirection: 'row-reverse', alignItems: 'center', gap: 15, padding: 21, borderRadius: radius.xl, backgroundColor: palette.brandSurface },
  avatar: { width: 60, height: 60, borderRadius: 20, backgroundColor: palette.primaryAction, alignItems: 'center', justifyContent: 'center' },
  profileName: { color: palette.white, fontSize: 21, fontWeight: '900', writingDirection: 'rtl' },
  profileMeta: { color: palette.onPrimaryMuted, fontSize: 11, writingDirection: 'rtl', marginTop: 4 },
  settings: { gap: 13, padding: 19, borderWidth: 1, borderColor: palette.line, borderRadius: radius.lg, backgroundColor: palette.surface, ...shadow },
  nameRow: { flexDirection: 'row-reverse', gap: 8 },
  nameInput: { flex: 1, minHeight: 49, paddingHorizontal: 13, color: palette.ink, fontSize: 15, writingDirection: 'rtl', borderWidth: 1, borderColor: palette.line, borderRadius: radius.md, backgroundColor: palette.background },
  save: { minWidth: 80, minHeight: 49, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: palette.primarySoft },
  saveText: { color: palette.primary, fontSize: 13, fontWeight: '900', writingDirection: 'rtl' },
  settingRow: { minHeight: 68, flexDirection: 'row-reverse', alignItems: 'center', gap: 11, borderTopWidth: 1, borderTopColor: palette.line, paddingTop: 12 },
  preferenceHeading: { alignItems: 'flex-end', gap: 3, marginTop: 2 },
  themePicker: { flexDirection: 'row-reverse', gap: 8, padding: 6, borderRadius: radius.lg, backgroundColor: palette.background, borderWidth: 1, borderColor: palette.line },
  themeChoice: { flex: 1, minHeight: 70, alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 8, borderRadius: radius.md, borderWidth: 1, borderColor: 'transparent' },
  themeChoiceActive: { backgroundColor: palette.primarySoft, borderColor: palette.primary },
  themeIcon: { width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.surfaceMuted },
  themeIconActive: { backgroundColor: palette.surface },
  themeChoiceText: { color: palette.muted, fontSize: 12, fontWeight: '800', writingDirection: 'rtl' },
  themeChoiceTextActive: { color: palette.primary },
  danger: { minHeight: 53, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: palette.borderRose, borderRadius: radius.md, backgroundColor: palette.roseSoft },
  dangerText: { color: palette.rose, fontSize: 13, fontWeight: '900', writingDirection: 'rtl' },
  notice: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 8, padding: 13, borderRadius: radius.md, backgroundColor: palette.surfaceMuted },
  noticeText: { flex: 1, color: palette.muted, fontSize: 10, lineHeight: 18, textAlign: 'right', writingDirection: 'rtl' },
  specBanner: { flexDirection: 'row-reverse', alignItems: 'center', gap: 14, padding: 18, borderRadius: radius.lg, backgroundColor: palette.brandSurface },
  specIcon: { width: 50, height: 50, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.primaryAction },
  specTitle: { color: palette.white, fontSize: 15, lineHeight: 24, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  specText: { color: palette.onPrimaryMuted, fontSize: 11, lineHeight: 19, textAlign: 'right', writingDirection: 'rtl', marginTop: 3 },
  trackTabs: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, padding: 6, borderRadius: radius.lg, backgroundColor: palette.surfaceMuted },
  trackTab: { minHeight: 46, flexGrow: 1, minWidth: 92, paddingHorizontal: 15, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md },
  trackTabActive: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, ...shadow },
  trackTabText: { color: palette.muted, fontSize: 12, fontWeight: '800', writingDirection: 'rtl' },
  trackTabTextActive: { color: palette.primary },
  examGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 15 },
  examPanel: { flexGrow: 1, flexBasis: 360, minWidth: 280, gap: 18, padding: 20, borderWidth: 1, borderColor: palette.line, borderRadius: radius.xl, backgroundColor: palette.surface, ...shadow },
  examStage: { color: palette.ink, fontSize: 23, fontFamily: type.latinBold },
  modeRow: { minHeight: 76, flexDirection: 'row-reverse', alignItems: 'center', gap: 11, padding: 12, borderRadius: radius.md, backgroundColor: palette.background, borderWidth: 1, borderColor: palette.line },
  modeIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.primarySoft },
  modeTitle: { color: palette.ink, fontSize: 14, lineHeight: 22, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  examNote: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 11, padding: 16, borderRadius: radius.lg, backgroundColor: palette.primarySoft },
  historyRow: { minHeight: 76, flexDirection: 'row-reverse', alignItems: 'center', gap: 13, padding: 14, borderWidth: 1, borderColor: palette.line, borderRadius: radius.lg, backgroundColor: palette.surface },
  scoreBadge: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  scoreBadgeText: { color: palette.ink, fontSize: 15, fontFamily: type.latinBold },
  testPage: { flexGrow: 1, width: '100%', maxWidth: 820, alignSelf: 'center', padding: 20, paddingBottom: 70, gap: 20 },
  testTop: { minHeight: 76, flexDirection: 'row-reverse', alignItems: 'center', gap: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: palette.line, backgroundColor: palette.surface },
  testHeading: { flex: 1, alignItems: 'flex-end' },
  timer: { minWidth: 86, minHeight: 44, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: radius.md, backgroundColor: palette.primarySoft },
  timerUrgent: { backgroundColor: palette.roseSoft },
  timerText: { color: palette.primary, fontSize: 14, fontFamily: type.latinBold, fontVariant: ['tabular-nums'] },
  questionMeta: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  flagButton: { minHeight: 44, paddingHorizontal: 12, flexDirection: 'row-reverse', alignItems: 'center', gap: 7, borderRadius: radius.md, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface },
  flagActive: { borderColor: palette.saffron, backgroundColor: palette.saffronSoft },
  questionNav: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 8 },
  breakdownRow: { minHeight: 74, flexDirection: 'row-reverse', alignItems: 'center', gap: 12, padding: 14, borderWidth: 1, borderColor: palette.line, borderRadius: radius.lg, backgroundColor: palette.surface },
  breakdownScore: { minWidth: 58, minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: palette.primarySoft },
  learningList: { width: '100%', gap: 10, padding: 15, borderRadius: radius.md, backgroundColor: palette.background },
  learningPoint: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 10 },
  bulletDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.primary, marginTop: 8 },
  learningText: { flex: 1, color: palette.inkSoft, fontSize: 14, lineHeight: 25, textAlign: 'right', writingDirection: 'rtl' },
  exampleCard: { width: '100%', flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 11, padding: 16, borderRadius: radius.md, backgroundColor: palette.saffronSoft, borderWidth: 1, borderColor: palette.borderGold },
  exampleLabel: { color: palette.goldInk, fontSize: 12, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  exampleText: { color: palette.goldBody, fontSize: 13, lineHeight: 23, textAlign: 'right', writingDirection: 'rtl', marginTop: 4 },
  checklistCard: { width: '100%', gap: 10, padding: 16, borderRadius: radius.md, backgroundColor: palette.tealSoft },
  checklistTitle: { color: palette.teal, fontSize: 13, fontWeight: '900', textAlign: 'right', writingDirection: 'rtl' },
  checkRow: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 9 },
  checkText: { flex: 1, color: palette.tealInk, fontSize: 13, lineHeight: 22, textAlign: 'right', writingDirection: 'rtl' },
  sourceNote: { width: '100%', flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 8, paddingTop: 4 },
  sourceText: { flex: 1, color: palette.muted, fontSize: 10, lineHeight: 18, textAlign: 'right', writingDirection: 'rtl' },
  });
};

s = createStyles(lightPalette);
