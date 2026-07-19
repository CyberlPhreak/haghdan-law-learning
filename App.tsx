import { Feather } from '@expo/vector-icons';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  useFonts,
} from '@expo-google-fonts/manrope';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import {
  ActionButton,
  Brand,
  Chip,
  IconButton,
  PathwayCard,
  ProgressBar,
  SectionHeader,
  Surface,
} from './src/components';
import {
  lessonPages,
  lessonQuiz,
  pathways,
  reviewItems,
  type IconName,
  type Pathway,
} from './src/data';
import { palette, radius, shadow, space, type } from './src/theme';

type RootScreen = 'home' | 'paths' | 'review' | 'profile';
type Screen = RootScreen | 'path' | 'lesson';

type NavItem = {
  key: RootScreen;
  label: string;
  icon: IconName;
};

const navItems: NavItem[] = [
  { key: 'home', label: 'امروز', icon: 'home' },
  { key: 'paths', label: 'مسیرها', icon: 'map' },
  { key: 'review', label: 'مرور', icon: 'repeat' },
  { key: 'profile', label: 'پروفایل', icon: 'user' },
];

export default function App() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedPathId, setSelectedPathId] = useState('foundations');
  const [completedToday, setCompletedToday] = useState(false);

  const selectedPath = useMemo(
    () => pathways.find((path) => path.id === selectedPathId) ?? pathways[0]!,
    [selectedPathId],
  );

  if (!fontsLoaded) {
    return <View style={styles.loadingScreen} />;
  }

  const activeRoot: RootScreen = screen === 'path' || screen === 'lesson' ? 'paths' : screen;

  const navigate = (next: RootScreen) => setScreen(next);
  const openPath = (pathway: Pathway) => {
    setSelectedPathId(pathway.id);
    setScreen('path');
  };
  const startLesson = () => setScreen('lesson');
  const finishLesson = () => {
    setCompletedToday(true);
    setScreen('home');
  };

  if (screen === 'lesson') {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <SafeAreaView style={styles.app} edges={['top', 'right', 'left', 'bottom']}>
          <LessonScreen onBack={() => setScreen('path')} onComplete={finishLesson} isDesktop={isDesktop} />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  const currentScreen = (
    <>
      {screen === 'home' ? (
        <HomeScreen
          isDesktop={isDesktop}
          completedToday={completedToday}
          onStart={startLesson}
          onOpenPath={openPath}
          onNavigate={navigate}
        />
      ) : null}
      {screen === 'paths' ? <PathsScreen onOpenPath={openPath} /> : null}
      {screen === 'review' ? <ReviewScreen isDesktop={isDesktop} onStartReview={startLesson} /> : null}
      {screen === 'profile' ? <ProfileScreen isDesktop={isDesktop} /> : null}
      {screen === 'path' ? (
        <PathScreen pathway={selectedPath} isDesktop={isDesktop} onBack={() => setScreen('paths')} onStart={startLesson} />
      ) : null}
    </>
  );

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.app} edges={['top', 'right', 'left', 'bottom']}>
        {isDesktop ? (
          <View style={styles.desktopShell}>
            <DesktopSidebar active={activeRoot} onNavigate={navigate} />
            <ScrollView style={styles.contentScroll} contentContainerStyle={styles.desktopScrollContent} showsVerticalScrollIndicator={false}>
              {currentScreen}
            </ScrollView>
          </View>
        ) : (
          <View style={styles.mobileShell}>
            <MobileHeader />
            <ScrollView style={styles.contentScroll} contentContainerStyle={styles.mobileScrollContent} showsVerticalScrollIndicator={false}>
              {currentScreen}
            </ScrollView>
            <BottomNavigation active={activeRoot} onNavigate={navigate} />
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function HomeScreen({
  isDesktop,
  completedToday,
  onStart,
  onOpenPath,
  onNavigate,
}: {
  isDesktop: boolean;
  completedToday: boolean;
  onStart: () => void;
  onOpenPath: (pathway: Pathway) => void;
  onNavigate: (screen: RootScreen) => void;
}) {
  const foundation = pathways[0]!;
  return (
    <View style={styles.page}>
      <View style={styles.welcomeRow}>
        <View style={styles.welcomeCopy}>
          <Text style={styles.dateLabel}>یکشنبه، ۲۸ تیر</Text>
          <Text style={styles.welcomeTitle}>سلام، آماده‌ای یک قدم جلوتر بروی؟</Text>
        </View>
        <Chip label="۱۲ روز پیوسته" icon="zap" tone="gold" />
      </View>

      <View style={[styles.heroGrid, isDesktop && styles.heroGridDesktop]}>
        <View style={[styles.dailyHero, isDesktop && styles.dailyHeroDesktop]}>
          <View style={styles.heroGlowOne} />
          <View style={styles.heroGlowTwo} />
          <View style={styles.dailyHeroCopy}>
            <Chip label={completedToday ? 'برنامه‌ی امروز تکمیل شد' : 'برنامه‌ی امروز · ۷ دقیقه'} icon={completedToday ? 'check' : 'clock'} tone={completedToday ? 'teal' : 'gold'} />
            <Text style={styles.dailyEyebrow}>مسیر فعلی</Text>
            <Text style={styles.dailyTitle}>{completedToday ? 'آفرین! امروز یادگیری را زنده نگه داشتی.' : 'دادگاه‌ها چگونه به هم مرتبط‌اند؟'}</Text>
            <Text style={styles.dailyDescription}>
              {completedToday
                ? 'مرور هوشمند فردا بر اساس پاسخ‌های امروز تنظیم می‌شود.'
                : 'در یک جلسه‌ی کوتاه، Court hierarchy و Judicial precedent را با مثال یاد بگیر.'}
            </Text>
            <ActionButton
              label={completedToday ? 'مرور دستاورد امروز' : 'ادامه‌ی یادگیری'}
              onPress={onStart}
              icon={completedToday ? 'award' : 'arrow-left'}
            />
          </View>
          <View style={styles.heroProgressCard}>
            <View style={styles.heroProgressIcon}>
              <Feather name={completedToday ? 'check' : 'book-open'} size={29} color={palette.primaryDark} />
            </View>
            <Text style={styles.heroProgressValue}>{completedToday ? '۱۰۰٪' : '۴۲٪'}</Text>
            <Text style={styles.heroProgressLabel}>{completedToday ? 'هدف روزانه' : 'پیشرفت مسیر'}</Text>
            <ProgressBar value={completedToday ? 100 : 42} color={palette.saffron} trackColor="rgba(255,255,255,0.24)" />
            <Text style={styles.heroProgressMeta}>{completedToday ? '۲۰ امتیاز تازه' : '۳ از ۸ درس کامل'}</Text>
          </View>
        </View>

        <Surface style={[styles.reviewNudge, isDesktop && styles.reviewNudgeDesktop]}>
          <View style={styles.reviewNudgeTop}>
            <View style={styles.reviewIcon}>
              <Feather name="repeat" size={22} color={palette.teal} />
            </View>
            <Chip label="۵ مورد" tone="teal" />
          </View>
          <View style={styles.reviewNudgeCopy}>
            <Text style={styles.reviewNudgeTitle}>مرور هوشمند آماده است</Text>
            <Text style={styles.reviewNudgeText}>مفاهیمی را مرور کن که درست قبل از فراموش‌شدن هستند.</Text>
          </View>
          <ActionButton label="شروع مرور" onPress={() => onNavigate('review')} variant="secondary" fullWidth icon="repeat" />
        </Surface>
      </View>

      <View style={styles.statsGrid}>
        <StatCard icon="layers" value="۷۶" label="مفهوم در بانک دانش" color={palette.primary} softColor={palette.primarySoft} />
        <StatCard icon="target" value="۸۲٪" label="میانگین تسلط" color={palette.teal} softColor={palette.tealSoft} />
        <StatCard icon="award" value="۴۸۰" label="امتیاز یادگیری" color="#A96C05" softColor={palette.saffronSoft} />
      </View>

      <View style={styles.sectionBlock}>
        <SectionHeader eyebrow="ادامه بده" title="مسیر یادگیری تو" action={{ label: 'نمایش نقشه', onPress: () => onOpenPath(foundation) }} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`ادامه مسیر ${foundation.title}`}
          onPress={() => onOpenPath(foundation)}
          style={({ pressed }) => [styles.continueCard, pressed && styles.pressedCard]}
        >
          <View style={styles.continueMain}>
            <View style={[styles.continueIcon, { backgroundColor: foundation.softColor }]}>
              <Feather name={foundation.icon} size={26} color={foundation.color} />
            </View>
            <View style={styles.continueCopy}>
              <Text style={styles.continueTitle}>{foundation.title}</Text>
              <Text style={styles.continueEnglish}>{foundation.englishTitle}</Text>
              <Text style={styles.continueLesson}>درس بعدی: سلسله‌مراتب دادگاه‌ها</Text>
            </View>
          </View>
          <View style={styles.continueProgress}>
            <View style={styles.continueProgressCopy}>
              <Text style={styles.continuePercent}>۴۲٪ تکمیل شده</Text>
              <Text style={styles.continueTime}>۷ دقیقه تا گام بعدی</Text>
            </View>
            <ProgressBar value={42} />
          </View>
        </Pressable>
      </View>

      <View style={styles.sectionBlock}>
        <SectionHeader eyebrow="با کنجکاوی انتخاب کن" title="مسیرهای پیشنهادی" action={{ label: 'همه‌ی مسیرها', onPress: () => onNavigate('paths') }} />
        <View style={styles.pathGrid}>
          {pathways.slice(1, 4).map((pathway) => (
            <PathwayCard key={pathway.id} pathway={pathway} onPress={() => onOpenPath(pathway)} />
          ))}
        </View>
      </View>

      <Disclaimer />
    </View>
  );
}

function StatCard({ icon, value, label, color, softColor }: { icon: IconName; value: string; label: string; color: string; softColor: string }) {
  return (
    <Surface style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: softColor }]}>
        <Feather name={icon} size={20} color={color} />
      </View>
      <View style={styles.statCopy}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </Surface>
  );
}

function PathsScreen({ onOpenPath }: { onOpenPath: (pathway: Pathway) => void }) {
  return (
    <View style={styles.page}>
      <PageIntro
        eyebrow="کتابخانه‌ی حق‌دان"
        title="از یک پرسش شروع کن؛ با یک نقشه پیش برو"
        description="مسیرها کوتاه، مرحله‌بندی‌شده و دو‌زبانه‌اند تا هم مفهوم حقوقی را بفهمی و هم واژه‌ی انگلیسی آن را به خاطر بسپاری."
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow} style={styles.filterScroll}>
        <Chip label="همه" icon="grid" tone="primary" />
        <Chip label="زندگی روزمره" icon="coffee" />
        <Chip label="مهاجرت" icon="globe" />
        <Chip label="کار و کسب‌وکار" icon="briefcase" />
        <Chip label="حقوق عمومی" icon="shield" />
      </ScrollView>
      <View style={styles.pathGrid}>
        {pathways.map((pathway) => (
          <PathwayCard key={pathway.id} pathway={pathway} onPress={() => onOpenPath(pathway)} />
        ))}
      </View>
      <Disclaimer />
    </View>
  );
}

function PathScreen({
  pathway,
  isDesktop,
  onBack,
  onStart,
}: {
  pathway: Pathway;
  isDesktop: boolean;
  onBack: () => void;
  onStart: () => void;
}) {
  const hasLessons = pathway.lessons.length > 0;
  return (
    <View style={styles.page}>
      <View style={styles.subpageBar}>
        <IconButton icon="arrow-right" label="بازگشت به مسیرها" onPress={onBack} />
        <Text style={styles.subpageBarTitle}>جزئیات مسیر</Text>
      </View>

      <View style={[styles.pathHero, isDesktop && styles.pathHeroDesktop, { backgroundColor: pathway.color }]}>
        <View style={styles.pathHeroGlow} />
        <View style={styles.pathHeroCopy}>
          <Chip label={pathway.level} icon="bar-chart-2" tone="gold" />
          <Text style={styles.pathHeroTitle}>{pathway.title}</Text>
          <Text style={styles.pathHeroEnglish}>{pathway.englishTitle}</Text>
          <Text style={styles.pathHeroDescription}>{pathway.description}</Text>
          <View style={styles.pathHeroMeta}>
            <View style={styles.heroMetaItem}>
              <Feather name="book-open" size={17} color={palette.white} />
              <Text style={styles.heroMetaText}>{pathway.lessonsCount} درس</Text>
            </View>
            <View style={styles.heroMetaItem}>
              <Feather name="clock" size={17} color={palette.white} />
              <Text style={styles.heroMetaText}>حدود ۷۰ دقیقه</Text>
            </View>
          </View>
        </View>
        <View style={styles.pathHeroProgress}>
          <Text style={styles.pathHeroProgressValue}>{pathway.progress}٪</Text>
          <Text style={styles.pathHeroProgressLabel}>پیشرفت مسیر</Text>
          <ProgressBar value={pathway.progress} color={palette.saffron} trackColor="rgba(255,255,255,0.22)" />
        </View>
      </View>

      {hasLessons ? (
        <View style={[styles.mapLayout, isDesktop && styles.mapLayoutDesktop]}>
          <View style={styles.mapMain}>
            <SectionHeader eyebrow="نقشه‌ی یادگیری" title="هر گام، یک مفهوم ماندگار" />
            <Surface style={styles.lessonMap}>
              {pathway.lessons.map((lesson, index) => {
                const complete = lesson.state === 'complete';
                const current = lesson.state === 'current';
                const locked = lesson.state === 'locked';
                return (
                  <Pressable
                    key={lesson.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${lesson.title}، ${locked ? 'قفل' : current ? 'درس فعلی' : 'کامل شده'}`}
                    accessibilityState={{ disabled: locked }}
                    disabled={locked}
                    onPress={onStart}
                    style={({ pressed }) => [styles.lessonRow, current && styles.lessonRowCurrent, pressed && styles.pressedCard]}
                  >
                    <View style={styles.lessonRail}>
                      <View style={[
                        styles.lessonNode,
                        complete && styles.lessonNodeComplete,
                        current && styles.lessonNodeCurrent,
                        locked && styles.lessonNodeLocked,
                      ]}>
                        <Feather
                          name={complete ? 'check' : locked ? 'lock' : 'play'}
                          size={18}
                          color={complete || current ? palette.white : palette.muted}
                        />
                      </View>
                      {index < pathway.lessons.length - 1 ? <View style={[styles.lessonConnector, complete && styles.lessonConnectorComplete]} /> : null}
                    </View>
                    <View style={styles.lessonCopy}>
                      <View style={styles.lessonTitleRow}>
                        <Text style={[styles.lessonTitle, locked && styles.lessonTextLocked]}>{lesson.title}</Text>
                        {current ? <Chip label="گام بعدی" tone="gold" /> : null}
                      </View>
                      <Text style={[styles.lessonEnglish, locked && styles.lessonTextLocked]}>{lesson.englishTitle}</Text>
                      <View style={styles.lessonMeta}>
                        <Feather name="clock" size={13} color={palette.muted} />
                        <Text style={styles.lessonMetaText}>{lesson.duration} دقیقه</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </Surface>
          </View>
          <View style={styles.mapAside}>
            <Surface style={styles.nextLessonCard}>
              <View style={styles.nextLessonIcon}>
                <Feather name="compass" size={25} color={palette.primary} />
              </View>
              <Text style={styles.nextLessonKicker}>گام بعدی</Text>
              <Text style={styles.nextLessonTitle}>سلسله‌مراتب دادگاه‌ها</Text>
              <Text style={styles.nextLessonEnglish}>Court hierarchy</Text>
              <Text style={styles.nextLessonText}>دو مفهوم، یک مثال و یک پرسش فعال برای تثبیت یادگیری.</Text>
              <ActionButton label="شروع درس · ۷ دقیقه" onPress={onStart} fullWidth />
            </Surface>
            <Surface style={styles.pathTip}>
              <View style={styles.tipIcon}><Feather name="headphones" size={20} color={palette.teal} /></View>
              <View style={styles.tipCopy}>
                <Text style={styles.tipTitle}>نسخه‌ی شنیداری</Text>
                <Text style={styles.tipText}>در نسخه‌ی بعد، هر درس با صدای فارسی و کنترل سرعت در دسترس خواهد بود.</Text>
              </View>
            </Surface>
          </View>
        </View>
      ) : (
        <Surface style={styles.comingSoon}>
          <View style={[styles.comingSoonIcon, { backgroundColor: pathway.softColor }]}>
            <Feather name={pathway.icon} size={30} color={pathway.color} />
          </View>
          <Text style={styles.comingSoonTitle}>این مسیر در حال بازبینی تخصصی است</Text>
          <Text style={styles.comingSoonText}>ساختار یادگیری آماده است؛ محتوای حقوقی پیش از انتشار باید توسط متخصص همان حوزه بررسی و تأیید شود.</Text>
          <ActionButton label="بازگشت به مسیرها" onPress={onBack} variant="secondary" icon="arrow-right" />
        </Surface>
      )}
      <Disclaimer />
    </View>
  );
}

function LessonScreen({ onBack, onComplete, isDesktop }: { onBack: () => void; onComplete: () => void; isDesktop: boolean }) {
  const [step, setStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const totalSteps = lessonPages.length + 1;
  const isQuiz = step === lessonPages.length;
  const progress = ((step + 1) / totalSteps) * 100;

  const submitAnswer = () => {
    if (selectedAnswer === null) return;
    setAnswered(true);
    const correct = selectedAnswer === lessonQuiz.correctIndex;
    AccessibilityInfo.announceForAccessibility(correct ? 'پاسخ درست است' : 'پاسخ نیاز به مرور دارد');
  };

  const advance = () => {
    if (step < lessonPages.length) {
      setStep((current) => current + 1);
      return;
    }
    if (!answered) {
      submitAnswer();
      return;
    }
    onComplete();
  };

  const page = lessonPages[step];
  return (
    <View style={styles.lessonScreen}>
      <View style={styles.lessonTopBar}>
        <IconButton icon="x" label="خروج از درس" onPress={onBack} />
        <View style={styles.lessonTopProgress}>
          <View style={styles.lessonTopCopy}>
            <Text style={styles.lessonTopTitle}>سلسله‌مراتب دادگاه‌ها</Text>
            <Text style={styles.lessonTopStep}>گام {step + 1} از {totalSteps}</Text>
          </View>
          <ProgressBar value={progress} />
        </View>
        <Chip label="۲۰ امتیاز" icon="award" tone="gold" />
      </View>

      <ScrollView style={styles.lessonScroll} contentContainerStyle={styles.lessonScrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.lessonContentWrap, isDesktop && styles.lessonContentDesktop]}>
          {!isQuiz && page ? (
            <Surface style={styles.readingCard}>
              <View style={styles.readingHeader}>
                <Chip label={page.kicker} tone="primary" />
                <IconButton icon="volume-2" label="پخش نسخه‌ی صوتی" onPress={() => AccessibilityInfo.announceForAccessibility('نسخه صوتی در نسخه بعد اضافه می‌شود')} />
              </View>
              <Text style={styles.readingTitle}>{page.title}</Text>
              <Text style={styles.readingBody}>{page.body}</Text>
              <View style={styles.legalDiagram}>
                <View style={styles.diagramLevelTop}>
                  <Text style={styles.diagramEn}>Supreme Court</Text>
                  <Text style={styles.diagramFa}>دیوان عالی</Text>
                </View>
                <View style={styles.diagramArrow}><Feather name="arrow-down" size={18} color={palette.primary} /></View>
                <View style={styles.diagramLevelMiddle}>
                  <Text style={styles.diagramEn}>Court of Appeal</Text>
                  <Text style={styles.diagramFa}>دادگاه تجدیدنظر</Text>
                </View>
                <View style={styles.diagramArrow}><Feather name="arrow-down" size={18} color={palette.primary} /></View>
                <View style={styles.diagramLevelBottom}>
                  <Text style={styles.diagramEn}>Lower courts</Text>
                  <Text style={styles.diagramFa}>دادگاه‌های پایین‌تر</Text>
                </View>
              </View>
              <View style={styles.callout}>
                <View style={styles.calloutIcon}><Feather name="key" size={20} color={palette.teal} /></View>
                <Text style={styles.calloutText}>{page.callout}</Text>
              </View>
              <View style={styles.termCard}>
                <View style={styles.termBadge}><Text style={styles.termBadgeText}>واژه‌ی کلیدی</Text></View>
                <View style={styles.termCopy}>
                  <Text style={styles.termFa}>{page.termFa}</Text>
                  <Text style={styles.termEn}>{page.termEn}</Text>
                </View>
              </View>
            </Surface>
          ) : (
            <Surface style={styles.quizCard}>
              <View style={styles.quizIcon}>
                <Feather name="help-circle" size={28} color={palette.primary} />
              </View>
              <Text style={styles.quizKicker}>یادآوری فعال</Text>
              <Text style={styles.quizQuestion}>{lessonQuiz.question}</Text>
              <Text style={styles.quizHint}>یک پاسخ را انتخاب کن.</Text>
              <View style={styles.answersList}>
                {lessonQuiz.answers.map((answer, index) => {
                  const selected = selectedAnswer === index;
                  const correct = answered && index === lessonQuiz.correctIndex;
                  const incorrect = answered && selected && index !== lessonQuiz.correctIndex;
                  return (
                    <Pressable
                      key={answer}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected, disabled: answered }}
                      disabled={answered}
                      onPress={() => setSelectedAnswer(index)}
                      style={({ pressed }) => [
                        styles.answerOption,
                        selected && styles.answerSelected,
                        correct && styles.answerCorrect,
                        incorrect && styles.answerIncorrect,
                        pressed && !answered && styles.pressedCard,
                      ]}
                    >
                      <View style={[
                        styles.answerMarker,
                        selected && styles.answerMarkerSelected,
                        correct && styles.answerMarkerCorrect,
                        incorrect && styles.answerMarkerIncorrect,
                      ]}>
                        {answered && (correct || incorrect) ? (
                          <Feather name={correct ? 'check' : 'x'} size={16} color={palette.white} />
                        ) : (
                          <Text style={[styles.answerNumber, selected && styles.answerNumberSelected]}>{index + 1}</Text>
                        )}
                      </View>
                      <Text style={styles.answerText}>{answer}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {answered ? (
                <View style={[styles.feedback, selectedAnswer === lessonQuiz.correctIndex ? styles.feedbackCorrect : styles.feedbackReview]} accessibilityLiveRegion="polite">
                  <View style={styles.feedbackTitleRow}>
                    <Feather name={selectedAnswer === lessonQuiz.correctIndex ? 'check-circle' : 'refresh-cw'} size={20} color={selectedAnswer === lessonQuiz.correctIndex ? palette.success : '#8B5A00'} />
                    <Text style={styles.feedbackTitle}>{selectedAnswer === lessonQuiz.correctIndex ? 'درست گفتی' : 'یک بار دیگر در مرور می‌بینیم'}</Text>
                  </View>
                  <Text style={styles.feedbackText}>{lessonQuiz.explanation}</Text>
                </View>
              ) : null}
            </Surface>
          )}
        </View>
      </ScrollView>

      <View style={styles.lessonBottomBar}>
        <View style={styles.lessonBottomInner}>
          <ActionButton label="قبلی" onPress={() => setStep((current) => Math.max(0, current - 1))} icon="arrow-right" variant="quiet" disabled={step === 0} />
          <Text style={styles.autosaveText}>پیشرفتت خودکار ذخیره می‌شود</Text>
          <ActionButton
            label={!isQuiz ? 'ادامه' : answered ? 'پایان درس' : 'ثبت پاسخ'}
            onPress={advance}
            icon={!isQuiz || answered ? 'arrow-left' : 'check'}
            disabled={isQuiz && selectedAnswer === null}
          />
        </View>
      </View>
    </View>
  );
}

function ReviewScreen({ isDesktop, onStartReview }: { isDesktop: boolean; onStartReview: () => void }) {
  return (
    <View style={styles.page}>
      <PageIntro
        eyebrow="مرور هوشمند"
        title="درست قبل از فراموشی، دوباره به یاد بیاور"
        description="حق‌دان مفاهیمی را که به مرور نیاز دارند در زمان مناسب برمی‌گرداند؛ جلسه‌ی امروز حدود پنج دقیقه است."
      />
      <View style={[styles.reviewHero, isDesktop && styles.reviewHeroDesktop]}>
        <View style={styles.reviewHeroCopy}>
          <Chip label="آماده برای امروز" icon="sun" tone="gold" />
          <Text style={styles.reviewHeroTitle}>۵ مفهوم منتظر مرور توست</Text>
          <Text style={styles.reviewHeroText}>با پاسخ فعال، قدرت حافظه‌ی هر مفهوم تازه می‌شود و زمان مرور بعدی دقیق‌تر خواهد بود.</Text>
          <ActionButton label="شروع جلسه‌ی مرور" onPress={onStartReview} icon="repeat" />
        </View>
        <View style={styles.reviewGauge}>
          <View style={styles.reviewGaugeRing}>
            <Text style={styles.reviewGaugeValue}>۵</Text>
            <Text style={styles.reviewGaugeLabel}>مفهوم</Text>
          </View>
          <View style={styles.reviewGaugeMeta}>
            <View style={styles.reviewGaugeRow}><Text style={styles.reviewGaugeMetaValue}>۳</Text><Text style={styles.reviewGaugeMetaLabel}>در آستانه‌ی فراموشی</Text></View>
            <View style={styles.reviewGaugeRow}><Text style={styles.reviewGaugeMetaValue}>۲</Text><Text style={styles.reviewGaugeMetaLabel}>برای تثبیت</Text></View>
          </View>
        </View>
      </View>
      <View style={styles.sectionBlock}>
        <SectionHeader eyebrow="بانک دانش" title="قدرت مفاهیم" />
        <Surface style={styles.reviewList}>
          {reviewItems.map((item, index) => (
            <View key={item.english} style={[styles.reviewRow, !isDesktop && styles.reviewRowMobile, index < reviewItems.length - 1 && styles.reviewRowBorder]}>
              <View style={styles.reviewRowMain}>
                <View style={[styles.strengthDot, { backgroundColor: item.strength < 50 ? palette.roseSoft : item.strength < 75 ? palette.saffronSoft : palette.tealSoft }]}>
                  <Feather name={item.strength < 50 ? 'alert-circle' : item.strength < 75 ? 'clock' : 'check'} size={18} color={item.strength < 50 ? palette.rose : item.strength < 75 ? '#8B5A00' : palette.teal} />
                </View>
                <View style={styles.reviewRowCopy}>
                  <Text style={styles.reviewRowTitle}>{item.title}</Text>
                  <Text style={styles.reviewRowEnglish}>{item.english}</Text>
                </View>
              </View>
              <View style={[styles.reviewStrength, !isDesktop && styles.reviewStrengthMobile]}>
                <View style={styles.reviewStrengthCopy}>
                  <Text style={styles.reviewDue}>{item.due}</Text>
                  <Text style={styles.reviewStrengthValue}>{item.strength}٪ قدرت</Text>
                </View>
                <ProgressBar value={item.strength} color={item.strength < 50 ? palette.rose : item.strength < 75 ? palette.saffron : palette.teal} />
              </View>
            </View>
          ))}
        </Surface>
      </View>
      <Disclaimer />
    </View>
  );
}

function ProfileScreen({ isDesktop }: { isDesktop: boolean }) {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [persianFirst, setPersianFirst] = useState(true);
  return (
    <View style={styles.page}>
      <PageIntro eyebrow="پروفایل یادگیری" title="رشدت را ببین و ریتم خودت را بساز" description="هدف روزانه، زبان نمایش و ترجیحات یادگیری را از اینجا مدیریت کن." />
      <View style={[styles.profileLayout, isDesktop && styles.profileLayoutDesktop]}>
        <View style={styles.profileMain}>
          <Surface style={styles.profileCard}>
            <View style={styles.avatar}><Text style={styles.avatarText}>م</Text></View>
            <View style={styles.profileIdentity}>
              <Text style={styles.profileName}>مینا رضایی</Text>
              <Text style={styles.profileSince}>عضو حق‌دان از تیر ۱۴۰۵</Text>
              <View style={styles.profileChips}><Chip label="سطح ۴" icon="award" tone="gold" /><Chip label="۱۲ روز پیوسته" icon="zap" tone="primary" /></View>
            </View>
          </Surface>
          <View style={styles.profileStats}>
            <StatCard icon="book-open" value="۱۴" label="درس کامل" color={palette.primary} softColor={palette.primarySoft} />
            <StatCard icon="layers" value="۷۶" label="مفهوم آموخته" color={palette.teal} softColor={palette.tealSoft} />
            <StatCard icon="clock" value="۲.۸" label="ساعت یادگیری" color="#A96C05" softColor={palette.saffronSoft} />
          </View>
          <Surface style={styles.settingsCard}>
            <Text style={styles.settingsTitle}>تنظیمات یادگیری</Text>
            <SettingRow icon="headphones" title="نسخه‌ی صوتی درس‌ها" description="پخش صوت فارسی در شروع هر بخش" value={audioEnabled} onToggle={() => setAudioEnabled((value) => !value)} />
            <SettingRow icon="type" title="نمایش فارسی در اولویت" description="واژه‌ی انگلیسی به‌عنوان ترجمه‌ی همراه" value={persianFirst} onToggle={() => setPersianFirst((value) => !value)} />
            <SettingRow icon="bell" title="یادآوری روزانه" description="هر روز ساعت ۱۹:۳۰" value onToggle={() => undefined} />
          </Surface>
        </View>
        <View style={styles.profileAside}>
          <Surface style={styles.goalCard}>
            <View style={styles.goalIcon}><Feather name="target" size={24} color={palette.primary} /></View>
            <Text style={styles.goalKicker}>هدف هفتگی</Text>
            <Text style={styles.goalTitle}>۵ جلسه‌ی کوتاه</Text>
            <ProgressBar value={80} />
            <View style={styles.goalMeta}><Text style={styles.goalMetaStrong}>۴ از ۵</Text><Text style={styles.goalMetaText}>فقط یک جلسه مانده</Text></View>
          </Surface>
          <Surface style={styles.jurisdictionCard}>
            <Text style={styles.jurisdictionLabel}>حوزه‌ی حقوقی فعال</Text>
            <View style={styles.jurisdictionRow}>
              <View style={styles.jurisdictionFlag}><Text style={styles.jurisdictionFlagText}>E&W</Text></View>
              <View style={styles.jurisdictionCopy}>
                <Text style={styles.jurisdictionTitle}>انگلستان و ولز</Text>
                <Text style={styles.jurisdictionEnglish}>England & Wales</Text>
              </View>
            </View>
            <Text style={styles.jurisdictionNote}>افزودن حوزه‌های حقوقی دیگر در نقشه‌ی راه محصول است.</Text>
          </Surface>
        </View>
      </View>
      <Disclaimer />
    </View>
  );
}

function SettingRow({ icon, title, description, value, onToggle }: { icon: IconName; title: string; description: string; value: boolean; onToggle: () => void }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingMain}>
        <View style={styles.settingIcon}><Feather name={icon} size={19} color={palette.primary} /></View>
        <View style={styles.settingCopy}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <Pressable accessibilityRole="switch" accessibilityState={{ checked: value }} onPress={onToggle} style={({ pressed }) => [styles.toggle, value && styles.toggleActive, pressed && styles.pressedCard]}>
        <View style={[styles.toggleThumb, value && styles.toggleThumbActive]} />
      </Pressable>
    </View>
  );
}

function DesktopSidebar({ active, onNavigate }: { active: RootScreen; onNavigate: (screen: RootScreen) => void }) {
  return (
    <View style={styles.sidebar}>
      <Brand inverted />
      <View style={styles.sidebarNav}>
        {navItems.map((item) => {
          const selected = item.key === active;
          return (
            <Pressable key={item.key} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => onNavigate(item.key)} style={({ pressed }) => [styles.sidebarItem, selected && styles.sidebarItemActive, pressed && styles.sidebarItemPressed]}>
              <Feather name={item.icon} size={20} color={selected ? palette.primaryDark : '#D5D0F0'} />
              <Text style={[styles.sidebarLabel, selected && styles.sidebarLabelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.sidebarSpacer} />
      <View style={styles.sidebarStreak}>
        <View style={styles.sidebarStreakIcon}><Feather name="zap" size={22} color="#6E4900" /></View>
        <View style={styles.sidebarStreakCopy}>
          <Text style={styles.sidebarStreakValue}>۱۲ روز</Text>
          <Text style={styles.sidebarStreakLabel}>روند پیوسته</Text>
        </View>
      </View>
      <View style={styles.sidebarLegal}>
        <Feather name="info" size={14} color="#AFA8D4" />
        <Text style={styles.sidebarLegalText}>آموزش عمومی، نه مشاوره‌ی حقوقی</Text>
      </View>
    </View>
  );
}

function MobileHeader() {
  return (
    <View style={styles.mobileHeader}>
      <IconButton icon="bell" label="اعلان‌ها" onPress={() => AccessibilityInfo.announceForAccessibility('اعلان تازه‌ای ندارید')} />
      <Brand />
    </View>
  );
}

function BottomNavigation({ active, onNavigate }: { active: RootScreen; onNavigate: (screen: RootScreen) => void }) {
  return (
    <View style={styles.bottomNav}>
      {navItems.map((item) => {
        const selected = item.key === active;
        return (
          <Pressable key={item.key} accessibilityRole="tab" accessibilityState={{ selected }} onPress={() => onNavigate(item.key)} style={({ pressed }) => [styles.bottomNavItem, pressed && styles.pressedCard]}>
            <View style={[styles.bottomNavIcon, selected && styles.bottomNavIconActive]}>
              <Feather name={item.icon} size={20} color={selected ? palette.primary : palette.muted} />
            </View>
            <Text style={[styles.bottomNavLabel, selected && styles.bottomNavLabelActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <View style={styles.pageIntro}>
      <Text style={styles.pageIntroEyebrow}>{eyebrow}</Text>
      <Text style={styles.pageIntroTitle}>{title}</Text>
      <Text style={styles.pageIntroDescription}>{description}</Text>
    </View>
  );
}

function Disclaimer() {
  return (
    <View style={styles.disclaimer}>
      <Feather name="info" size={17} color={palette.muted} />
      <Text style={styles.disclaimerText}>محتوای حق‌دان برای آموزش عمومی است و جایگزین مشاوره‌ی حقوقی متناسب با شرایط شما نیست.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingScreen: { flex: 1, backgroundColor: palette.background },
  app: { flex: 1, width: '100%', maxWidth: '100%', overflow: 'hidden', backgroundColor: palette.background },
  desktopShell: { flex: 1, flexDirection: 'row-reverse' },
  mobileShell: { flex: 1, width: '100%', maxWidth: '100%', overflow: 'hidden' },
  contentScroll: { flex: 1 },
  desktopScrollContent: { alignItems: 'center', paddingHorizontal: 40, paddingTop: 40, paddingBottom: 64 },
  mobileScrollContent: { width: '100%', maxWidth: '100%', alignItems: 'center', paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40 },
  page: { width: '100%', maxWidth: 1180, minWidth: 0, gap: space.xl },
  welcomeRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  welcomeCopy: { flex: 1, minWidth: 220, alignItems: 'flex-end' },
  dateLabel: { color: palette.muted, fontSize: 12, lineHeight: 19, textAlign: 'right', writingDirection: 'rtl' },
  welcomeTitle: { color: palette.ink, fontSize: 26, lineHeight: 36, fontWeight: '800', textAlign: 'right', writingDirection: 'rtl', marginTop: 4 },
  heroGrid: { gap: 16 },
  heroGridDesktop: { flexDirection: 'row-reverse', alignItems: 'stretch' },
  dailyHero: { width: '100%', minWidth: 0, minHeight: 370, borderRadius: radius.xl, padding: 24, backgroundColor: palette.primaryDark, overflow: 'hidden', gap: 28, ...shadow },
  dailyHeroDesktop: { flex: 1, minHeight: 350, flexDirection: 'row-reverse', alignItems: 'center', padding: 36 },
  heroGlowOne: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: '#5B4BCB', opacity: 0.48, top: -170, right: -80 },
  heroGlowTwo: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: '#0D968E', opacity: 0.28, bottom: -130, left: -50 },
  dailyHeroCopy: { flex: 1, width: '100%', minWidth: 0, alignItems: 'flex-end', zIndex: 1 },
  dailyEyebrow: { color: '#D5D0F0', fontSize: 12, fontWeight: '700', textAlign: 'right', writingDirection: 'rtl', marginTop: 28 },
  dailyTitle: { width: '100%', maxWidth: 570, color: palette.white, fontSize: 31, lineHeight: 45, fontWeight: '800', textAlign: 'right', writingDirection: 'rtl', marginTop: 8 },
  dailyDescription: { width: '100%', maxWidth: 580, color: '#D8D4EE', fontSize: 15, lineHeight: 27, textAlign: 'right', writingDirection: 'rtl', marginTop: 14, marginBottom: 24 },
  heroProgressCard: { width: 190, alignSelf: 'center', minHeight: 230, borderRadius: radius.lg, padding: 20, backgroundColor: 'rgba(255,255,255,0.11)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  heroProgressIcon: { width: 56, height: 56, borderRadius: 19, backgroundColor: palette.saffronSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  heroProgressValue: { color: palette.white, fontFamily: type.latinBold, fontSize: 30 },
  heroProgressLabel: { color: '#D8D4EE', fontSize: 12, writingDirection: 'rtl', marginTop: 2, marginBottom: 16 },
  heroProgressMeta: { color: palette.saffronSoft, fontSize: 11, writingDirection: 'rtl', marginTop: 10 },
  reviewNudge: { padding: 22, gap: 22 },
  reviewNudgeDesktop: { width: 290 },
  reviewNudgeTop: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  reviewIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: palette.tealSoft, alignItems: 'center', justifyContent: 'center' },
  reviewNudgeCopy: { alignItems: 'flex-end', flex: 1 },
  reviewNudgeTitle: { color: palette.ink, fontSize: 18, lineHeight: 27, fontWeight: '800', textAlign: 'right', writingDirection: 'rtl' },
  reviewNudgeText: { color: palette.muted, fontSize: 13, lineHeight: 23, textAlign: 'right', writingDirection: 'rtl', marginTop: 8 },
  statsGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 14 },
  statCard: { minWidth: 210, flexGrow: 1, flexBasis: 220, padding: 18, flexDirection: 'row-reverse', alignItems: 'center', gap: 14 },
  statIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  statCopy: { flex: 1, alignItems: 'flex-end' },
  statValue: { color: palette.ink, fontFamily: type.latinBold, fontSize: 22 },
  statLabel: { color: palette.muted, fontSize: 12, lineHeight: 19, textAlign: 'right', writingDirection: 'rtl', marginTop: 2 },
  sectionBlock: { gap: 18 },
  continueCard: { borderRadius: radius.lg, padding: 22, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, gap: 20, ...shadow },
  continueMain: { flexDirection: 'row-reverse', alignItems: 'center', gap: 16 },
  continueIcon: { width: 56, height: 56, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  continueCopy: { flex: 1, minWidth: 0, alignItems: 'flex-end' },
  continueTitle: { color: palette.ink, fontSize: 18, lineHeight: 27, fontWeight: '800', textAlign: 'right', writingDirection: 'rtl' },
  continueEnglish: { color: palette.primary, fontFamily: type.latinSemibold, fontSize: 11, marginTop: 2 },
  continueLesson: { color: palette.muted, fontSize: 12, lineHeight: 19, textAlign: 'right', writingDirection: 'rtl', marginTop: 7 },
  continueProgress: { gap: 9 },
  continueProgressCopy: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  continuePercent: { color: palette.inkSoft, fontSize: 11, fontWeight: '700', writingDirection: 'rtl' },
  continueTime: { color: palette.muted, fontSize: 11, writingDirection: 'rtl' },
  pathGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', alignItems: 'stretch', gap: 16 },
  pressedCard: { opacity: 0.78 },
  pageIntro: { width: '100%', minWidth: 0, alignItems: 'flex-end', maxWidth: 760, alignSelf: 'flex-end' },
  pageIntroEyebrow: { color: palette.primary, fontSize: 11, lineHeight: 18, fontWeight: '800', textAlign: 'right', writingDirection: 'rtl', marginBottom: 7 },
  pageIntroTitle: { color: palette.ink, fontSize: 34, lineHeight: 47, fontWeight: '800', textAlign: 'right', writingDirection: 'rtl' },
  pageIntroDescription: { color: palette.muted, fontSize: 15, lineHeight: 27, textAlign: 'right', writingDirection: 'rtl', marginTop: 12 },
  filterScroll: { marginHorizontal: -4 },
  filterRow: { flexDirection: 'row-reverse', gap: 9, paddingHorizontal: 4 },
  subpageBar: { minHeight: 48, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  subpageBarTitle: { color: palette.inkSoft, fontSize: 13, fontWeight: '700', writingDirection: 'rtl' },
  pathHero: { minHeight: 380, borderRadius: radius.xl, padding: 26, overflow: 'hidden', gap: 26, ...shadow },
  pathHeroDesktop: { minHeight: 330, flexDirection: 'row-reverse', alignItems: 'center', padding: 40 },
  pathHeroGlow: { position: 'absolute', width: 320, height: 320, borderRadius: 160, backgroundColor: 'rgba(255,255,255,0.1)', left: -110, bottom: -190 },
  pathHeroCopy: { flex: 1, alignItems: 'flex-end', zIndex: 1 },
  pathHeroTitle: { maxWidth: 650, color: palette.white, fontSize: 32, lineHeight: 46, fontWeight: '800', textAlign: 'right', writingDirection: 'rtl', marginTop: 22 },
  pathHeroEnglish: { color: palette.saffronSoft, fontFamily: type.latinSemibold, fontSize: 12, letterSpacing: 0.3, marginTop: 5 },
  pathHeroDescription: { maxWidth: 640, color: '#E8E5F7', fontSize: 14, lineHeight: 25, textAlign: 'right', writingDirection: 'rtl', marginTop: 15 },
  pathHeroMeta: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 18, marginTop: 22 },
  heroMetaItem: { flexDirection: 'row-reverse', alignItems: 'center', gap: 7 },
  heroMetaText: { color: palette.white, fontSize: 12, writingDirection: 'rtl' },
  pathHeroProgress: { width: 200, minHeight: 170, borderRadius: radius.lg, padding: 22, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  pathHeroProgressValue: { color: palette.white, fontFamily: type.latinBold, fontSize: 35 },
  pathHeroProgressLabel: { color: '#E8E5F7', fontSize: 12, writingDirection: 'rtl', marginTop: 3, marginBottom: 18 },
  mapLayout: { gap: 18 },
  mapLayoutDesktop: { flexDirection: 'row-reverse', alignItems: 'flex-start' },
  mapMain: { flex: 1, gap: 18 },
  mapAside: { gap: 16 },
  lessonMap: { padding: 12 },
  lessonRow: { minHeight: 92, flexDirection: 'row-reverse', alignItems: 'stretch', borderRadius: radius.md, paddingHorizontal: 10 },
  lessonRowCurrent: { backgroundColor: '#FFFBEE', borderWidth: 1, borderColor: '#F1D78D' },
  lessonRail: { width: 58, alignItems: 'center' },
  lessonNode: { width: 40, height: 40, borderRadius: 20, marginTop: 17, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  lessonNodeComplete: { backgroundColor: palette.teal },
  lessonNodeCurrent: { backgroundColor: palette.saffron, borderWidth: 4, borderColor: palette.saffronSoft },
  lessonNodeLocked: { backgroundColor: palette.surfaceMuted, borderWidth: 1, borderColor: palette.line },
  lessonConnector: { position: 'absolute', width: 2, top: 55, bottom: -18, backgroundColor: palette.line },
  lessonConnectorComplete: { backgroundColor: '#82C7BD' },
  lessonCopy: { flex: 1, alignItems: 'flex-end', paddingVertical: 16, paddingLeft: 12 },
  lessonTitleRow: { width: '100%', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  lessonTitle: { flex: 1, color: palette.ink, fontSize: 15, lineHeight: 24, fontWeight: '800', textAlign: 'right', writingDirection: 'rtl' },
  lessonEnglish: { color: palette.primary, fontFamily: type.latinSemibold, fontSize: 10, marginTop: 2 },
  lessonTextLocked: { color: '#A09CAF' },
  lessonMeta: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, marginTop: 7 },
  lessonMetaText: { color: palette.muted, fontSize: 10, writingDirection: 'rtl' },
  nextLessonCard: { width: 300, padding: 22, alignItems: 'flex-end' },
  nextLessonIcon: { width: 52, height: 52, borderRadius: 18, backgroundColor: palette.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 19 },
  nextLessonKicker: { color: palette.primary, fontSize: 11, fontWeight: '800', writingDirection: 'rtl' },
  nextLessonTitle: { color: palette.ink, fontSize: 20, lineHeight: 30, fontWeight: '800', textAlign: 'right', writingDirection: 'rtl', marginTop: 6 },
  nextLessonEnglish: { color: palette.primary, fontFamily: type.latinSemibold, fontSize: 11, marginTop: 2 },
  nextLessonText: { color: palette.muted, fontSize: 13, lineHeight: 23, textAlign: 'right', writingDirection: 'rtl', marginTop: 14, marginBottom: 20 },
  pathTip: { width: 300, padding: 18, flexDirection: 'row-reverse', gap: 12 },
  tipIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: palette.tealSoft, alignItems: 'center', justifyContent: 'center' },
  tipCopy: { flex: 1, alignItems: 'flex-end' },
  tipTitle: { color: palette.ink, fontSize: 13, fontWeight: '800', writingDirection: 'rtl' },
  tipText: { color: palette.muted, fontSize: 11, lineHeight: 19, textAlign: 'right', writingDirection: 'rtl', marginTop: 4 },
  comingSoon: { padding: 34, alignItems: 'center' },
  comingSoonIcon: { width: 68, height: 68, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  comingSoonTitle: { color: palette.ink, fontSize: 22, lineHeight: 33, fontWeight: '800', textAlign: 'center', writingDirection: 'rtl' },
  comingSoonText: { maxWidth: 560, color: palette.muted, fontSize: 14, lineHeight: 25, textAlign: 'center', writingDirection: 'rtl', marginTop: 10, marginBottom: 22 },
  lessonScreen: { flex: 1, backgroundColor: palette.background },
  lessonTopBar: { minHeight: 82, borderBottomWidth: 1, borderBottomColor: palette.line, backgroundColor: palette.surface, paddingHorizontal: 20, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  lessonTopProgress: { flex: 1, maxWidth: 620, gap: 9 },
  lessonTopCopy: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  lessonTopTitle: { flex: 1, color: palette.ink, fontSize: 13, fontWeight: '800', textAlign: 'right', writingDirection: 'rtl' },
  lessonTopStep: { color: palette.muted, fontSize: 11, writingDirection: 'rtl' },
  lessonScroll: { flex: 1 },
  lessonScrollContent: { paddingHorizontal: 16, paddingVertical: 28, alignItems: 'center' },
  lessonContentWrap: { width: '100%', maxWidth: 760 },
  lessonContentDesktop: { maxWidth: 820 },
  readingCard: { padding: 24 },
  readingHeader: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  readingTitle: { color: palette.ink, fontSize: 28, lineHeight: 42, fontWeight: '800', textAlign: 'right', writingDirection: 'rtl', marginTop: 26 },
  readingBody: { color: palette.inkSoft, fontSize: 17, lineHeight: 34, textAlign: 'right', writingDirection: 'rtl', marginTop: 16 },
  legalDiagram: { marginTop: 26, alignItems: 'center', borderRadius: radius.lg, padding: 20, backgroundColor: palette.background, borderWidth: 1, borderColor: palette.line },
  diagramLevelTop: { width: '72%', minHeight: 62, borderRadius: radius.md, backgroundColor: palette.primaryDark, alignItems: 'center', justifyContent: 'center' },
  diagramLevelMiddle: { width: '84%', minHeight: 62, borderRadius: radius.md, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center' },
  diagramLevelBottom: { width: '96%', minHeight: 62, borderRadius: radius.md, backgroundColor: '#6A5CC8', alignItems: 'center', justifyContent: 'center' },
  diagramArrow: { height: 34, alignItems: 'center', justifyContent: 'center' },
  diagramEn: { color: palette.white, fontFamily: type.latinBold, fontSize: 12 },
  diagramFa: { color: '#E9E6FA', fontSize: 11, writingDirection: 'rtl', marginTop: 3 },
  callout: { marginTop: 22, borderRadius: radius.md, padding: 18, backgroundColor: palette.tealSoft, flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 12 },
  calloutIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: palette.white, alignItems: 'center', justifyContent: 'center' },
  calloutText: { flex: 1, color: '#165952', fontSize: 14, lineHeight: 25, textAlign: 'right', writingDirection: 'rtl' },
  termCard: { marginTop: 18, borderRadius: radius.md, padding: 18, borderWidth: 1, borderColor: '#D5CFFF', backgroundColor: palette.primarySoft, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  termBadge: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: radius.round, backgroundColor: palette.white },
  termBadgeText: { color: palette.primary, fontSize: 10, fontWeight: '800', writingDirection: 'rtl' },
  termCopy: { flex: 1, alignItems: 'flex-end' },
  termFa: { color: palette.ink, fontSize: 16, fontWeight: '800', writingDirection: 'rtl' },
  termEn: { color: palette.primary, fontFamily: type.latinSemibold, fontSize: 11, marginTop: 3 },
  quizCard: { padding: 24, alignItems: 'flex-end' },
  quizIcon: { width: 60, height: 60, borderRadius: 20, backgroundColor: palette.primarySoft, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  quizKicker: { alignSelf: 'center', color: palette.primary, fontSize: 11, fontWeight: '800', writingDirection: 'rtl', marginTop: 16 },
  quizQuestion: { width: '100%', color: palette.ink, fontSize: 25, lineHeight: 39, fontWeight: '800', textAlign: 'center', writingDirection: 'rtl', marginTop: 8 },
  quizHint: { width: '100%', color: palette.muted, fontSize: 12, textAlign: 'center', writingDirection: 'rtl', marginTop: 8 },
  answersList: { width: '100%', gap: 11, marginTop: 24 },
  answerOption: { minHeight: 66, borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surface, flexDirection: 'row-reverse', alignItems: 'center', gap: 13 },
  answerSelected: { borderColor: palette.primary, backgroundColor: palette.primarySoft },
  answerCorrect: { borderColor: palette.success, backgroundColor: '#E8F6F1' },
  answerIncorrect: { borderColor: palette.rose, backgroundColor: palette.roseSoft },
  answerMarker: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.background, alignItems: 'center', justifyContent: 'center' },
  answerMarkerSelected: { backgroundColor: palette.primary, borderColor: palette.primary },
  answerMarkerCorrect: { backgroundColor: palette.success, borderColor: palette.success },
  answerMarkerIncorrect: { backgroundColor: palette.rose, borderColor: palette.rose },
  answerNumber: { color: palette.muted, fontFamily: type.latinBold, fontSize: 12 },
  answerNumberSelected: { color: palette.white },
  answerText: { flex: 1, color: palette.inkSoft, fontSize: 14, lineHeight: 25, textAlign: 'right', writingDirection: 'rtl' },
  feedback: { width: '100%', borderRadius: radius.md, padding: 18, marginTop: 18 },
  feedbackCorrect: { backgroundColor: '#E8F6F1', borderWidth: 1, borderColor: '#AFDDD0' },
  feedbackReview: { backgroundColor: palette.saffronSoft, borderWidth: 1, borderColor: '#E8CF83' },
  feedbackTitleRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  feedbackTitle: { color: palette.ink, fontSize: 14, fontWeight: '800', writingDirection: 'rtl' },
  feedbackText: { color: palette.inkSoft, fontSize: 13, lineHeight: 24, textAlign: 'right', writingDirection: 'rtl', marginTop: 9 },
  lessonBottomBar: { borderTopWidth: 1, borderTopColor: palette.line, backgroundColor: palette.surface, paddingHorizontal: 16, paddingVertical: 12 },
  lessonBottomInner: { width: '100%', maxWidth: 820, alignSelf: 'center', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  autosaveText: { flex: 1, color: palette.muted, fontSize: 10, textAlign: 'center', writingDirection: 'rtl' },
  reviewHero: { minHeight: 350, borderRadius: radius.xl, padding: 26, backgroundColor: palette.primaryDark, gap: 28, overflow: 'hidden', ...shadow },
  reviewHeroDesktop: { minHeight: 310, flexDirection: 'row-reverse', alignItems: 'center', padding: 38 },
  reviewHeroCopy: { flex: 1, alignItems: 'flex-end' },
  reviewHeroTitle: { color: palette.white, fontSize: 29, lineHeight: 43, fontWeight: '800', textAlign: 'right', writingDirection: 'rtl', marginTop: 20 },
  reviewHeroText: { maxWidth: 600, color: '#D8D4EE', fontSize: 14, lineHeight: 25, textAlign: 'right', writingDirection: 'rtl', marginTop: 12, marginBottom: 21 },
  reviewGauge: { borderRadius: radius.lg, padding: 20, backgroundColor: 'rgba(255,255,255,0.1)', flexDirection: 'row-reverse', alignItems: 'center', gap: 20 },
  reviewGaugeRing: { width: 110, height: 110, borderRadius: 55, borderWidth: 10, borderColor: palette.saffron, alignItems: 'center', justifyContent: 'center' },
  reviewGaugeValue: { color: palette.white, fontFamily: type.latinBold, fontSize: 28 },
  reviewGaugeLabel: { color: '#D8D4EE', fontSize: 10, writingDirection: 'rtl' },
  reviewGaugeMeta: { gap: 12 },
  reviewGaugeRow: { alignItems: 'flex-end' },
  reviewGaugeMetaValue: { color: palette.white, fontFamily: type.latinBold, fontSize: 17 },
  reviewGaugeMetaLabel: { color: '#D8D4EE', fontSize: 10, writingDirection: 'rtl', marginTop: 2 },
  reviewList: { paddingHorizontal: 20 },
  reviewRow: { minHeight: 92, paddingVertical: 16, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 22 },
  reviewRowMobile: { flexDirection: 'column', alignItems: 'stretch', gap: 12 },
  reviewRowBorder: { borderBottomWidth: 1, borderBottomColor: palette.line },
  reviewRowMain: { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', gap: 13 },
  strengthDot: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  reviewRowCopy: { flex: 1, alignItems: 'flex-end' },
  reviewRowTitle: { color: palette.ink, fontSize: 14, fontWeight: '800', writingDirection: 'rtl', textAlign: 'right' },
  reviewRowEnglish: { color: palette.primary, fontFamily: type.latinSemibold, fontSize: 10, marginTop: 3 },
  reviewStrength: { width: 170, gap: 8 },
  reviewStrengthMobile: { width: '100%' },
  reviewStrengthCopy: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  reviewDue: { color: palette.muted, fontSize: 10, writingDirection: 'rtl' },
  reviewStrengthValue: { color: palette.inkSoft, fontSize: 10, fontWeight: '700', writingDirection: 'rtl' },
  profileLayout: { gap: 18 },
  profileLayoutDesktop: { flexDirection: 'row-reverse', alignItems: 'flex-start' },
  profileMain: { flex: 1, gap: 16 },
  profileAside: { gap: 16 },
  profileCard: { padding: 24, flexDirection: 'row-reverse', alignItems: 'center', gap: 18 },
  avatar: { width: 72, height: 72, borderRadius: 24, backgroundColor: palette.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: palette.white, fontSize: 28, fontWeight: '800' },
  profileIdentity: { flex: 1, alignItems: 'flex-end' },
  profileName: { color: palette.ink, fontSize: 22, fontWeight: '800', writingDirection: 'rtl' },
  profileSince: { color: palette.muted, fontSize: 11, writingDirection: 'rtl', marginTop: 4 },
  profileChips: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  profileStats: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12 },
  settingsCard: { padding: 22 },
  settingsTitle: { color: palette.ink, fontSize: 18, fontWeight: '800', textAlign: 'right', writingDirection: 'rtl', marginBottom: 8 },
  settingRow: { minHeight: 78, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 14, borderBottomWidth: 1, borderBottomColor: palette.line },
  settingMain: { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  settingIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: palette.primarySoft, alignItems: 'center', justifyContent: 'center' },
  settingCopy: { flex: 1, alignItems: 'flex-end' },
  settingTitle: { color: palette.ink, fontSize: 13, fontWeight: '800', textAlign: 'right', writingDirection: 'rtl' },
  settingDescription: { color: palette.muted, fontSize: 10, lineHeight: 17, textAlign: 'right', writingDirection: 'rtl', marginTop: 3 },
  toggle: { width: 48, height: 28, borderRadius: 14, padding: 3, backgroundColor: '#C8C4D3', alignItems: 'flex-start', justifyContent: 'center' },
  toggleActive: { backgroundColor: palette.primary, alignItems: 'flex-end' },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: palette.white, ...shadow },
  toggleThumbActive: { backgroundColor: palette.white },
  goalCard: { width: 290, padding: 22, alignItems: 'flex-end' },
  goalIcon: { width: 52, height: 52, borderRadius: 18, backgroundColor: palette.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  goalKicker: { color: palette.primary, fontSize: 11, fontWeight: '800', writingDirection: 'rtl' },
  goalTitle: { color: palette.ink, fontSize: 21, fontWeight: '800', writingDirection: 'rtl', marginTop: 6, marginBottom: 17 },
  goalMeta: { width: '100%', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  goalMetaStrong: { color: palette.ink, fontSize: 11, fontWeight: '800', writingDirection: 'rtl' },
  goalMetaText: { color: palette.muted, fontSize: 10, writingDirection: 'rtl' },
  jurisdictionCard: { width: 290, padding: 22, alignItems: 'flex-end' },
  jurisdictionLabel: { color: palette.muted, fontSize: 10, fontWeight: '700', writingDirection: 'rtl' },
  jurisdictionRow: { width: '100%', flexDirection: 'row-reverse', alignItems: 'center', gap: 12, marginTop: 14 },
  jurisdictionFlag: { width: 48, height: 48, borderRadius: 16, backgroundColor: palette.primaryDark, alignItems: 'center', justifyContent: 'center' },
  jurisdictionFlagText: { color: palette.white, fontFamily: type.latinBold, fontSize: 11 },
  jurisdictionCopy: { flex: 1, alignItems: 'flex-end' },
  jurisdictionTitle: { color: palette.ink, fontSize: 14, fontWeight: '800', writingDirection: 'rtl' },
  jurisdictionEnglish: { color: palette.primary, fontFamily: type.latinSemibold, fontSize: 10, marginTop: 3 },
  jurisdictionNote: { color: palette.muted, fontSize: 10, lineHeight: 18, textAlign: 'right', writingDirection: 'rtl', marginTop: 15 },
  sidebar: { width: 264, backgroundColor: palette.primaryDark, paddingHorizontal: 20, paddingTop: 28, paddingBottom: 22 },
  sidebarNav: { gap: 7, marginTop: 46 },
  sidebarItem: { minHeight: 52, borderRadius: radius.md, paddingHorizontal: 15, flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  sidebarItemActive: { backgroundColor: palette.white },
  sidebarItemPressed: { opacity: 0.75 },
  sidebarLabel: { color: '#D5D0F0', fontSize: 13, fontWeight: '700', writingDirection: 'rtl' },
  sidebarLabelActive: { color: palette.primaryDark },
  sidebarSpacer: { flex: 1 },
  sidebarStreak: { borderRadius: radius.lg, padding: 16, backgroundColor: 'rgba(255,255,255,0.09)', flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  sidebarStreakIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: palette.saffronSoft, alignItems: 'center', justifyContent: 'center' },
  sidebarStreakCopy: { alignItems: 'flex-end' },
  sidebarStreakValue: { color: palette.white, fontSize: 15, fontWeight: '800', writingDirection: 'rtl' },
  sidebarStreakLabel: { color: '#BDB7DA', fontSize: 10, writingDirection: 'rtl', marginTop: 2 },
  sidebarLegal: { flexDirection: 'row-reverse', alignItems: 'center', gap: 7, marginTop: 18 },
  sidebarLegalText: { flex: 1, color: '#AFA8D4', fontSize: 9, lineHeight: 15, textAlign: 'right', writingDirection: 'rtl' },
  mobileHeader: { width: '100%', minHeight: 74, borderBottomWidth: 1, borderBottomColor: palette.line, backgroundColor: palette.surface, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bottomNav: { minHeight: 70, borderTopWidth: 1, borderTopColor: palette.line, backgroundColor: palette.surface, paddingHorizontal: 6, paddingTop: 7, flexDirection: 'row-reverse', alignItems: 'flex-start', justifyContent: 'space-around' },
  bottomNavItem: { minWidth: 64, minHeight: 54, alignItems: 'center', justifyContent: 'center', gap: 3 },
  bottomNavIcon: { width: 34, height: 29, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  bottomNavIconActive: { backgroundColor: palette.primarySoft },
  bottomNavLabel: { color: palette.muted, fontSize: 9, fontWeight: '700', writingDirection: 'rtl' },
  bottomNavLabelActive: { color: palette.primary },
  disclaimer: { flexDirection: 'row-reverse', alignItems: 'flex-start', justifyContent: 'center', gap: 8, paddingVertical: 10 },
  disclaimerText: { maxWidth: 650, color: palette.muted, fontSize: 10, lineHeight: 18, textAlign: 'right', writingDirection: 'rtl' },
});
