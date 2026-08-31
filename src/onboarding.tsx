import Feather from '@expo/vector-icons/Feather';
import { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton, Brand } from './components';
import { resolveForwardChevron } from './direction';
import { languageOptions, LocalizedText as Text, useI18n, type AppLanguage } from './i18n';
import { MotionView, motion } from './motion';
import { SoundPressable as Pressable } from './sound';
import { useLearner } from './store';
import { createShadow, radius, useAppTheme, type AppPalette } from './theme';

type Copy = {
  welcomeEyebrow: string;
  welcomeTitle: string;
  welcomeBody: string;
  accountTitle: string;
  accountBody: string;
  accountAction: string;
  guestTitle: string;
  guestBody: string;
  guestAction: string;
  guestNote: string;
  language: string;
  skip: string;
  back: string;
  continue: string;
  begin: string;
  step: string;
  pages: Array<{ eyebrow: string; title: string; body: string }>;
};

const copy: Record<AppLanguage, Copy> = {
  en: {
    welcomeEyebrow: 'Your SQE learning space', welcomeTitle: 'Learn law with momentum.', welcomeBody: 'Short lessons, active recall and realistic practice—built around the SQE specification.',
    accountTitle: 'Use an account', accountBody: 'Keep your identity and enable secure progress sync when cloud services are configured.', accountAction: 'Create or sign in',
    guestTitle: 'Explore as a guest', guestBody: 'Start immediately. Your progress stays on this device and you can create an account later.', guestAction: 'Continue as guest', guestNote: 'General legal education for England and Wales—not legal advice.',
    language: 'Choose your language', skip: 'Skip tutorial', back: 'Back', continue: 'Continue', begin: 'Start learning', step: 'Step',
    pages: [
      { eyebrow: 'Everything in one place', title: 'Your complete SQE study toolkit', body: 'Structured lessons, flash review, practice questions and timed mock exams work together.' },
      { eyebrow: 'A guide when you need it', title: 'Meet your study assistant', body: 'Ask for plain-language explanations and get prompts that point you back to the learning material.' },
      { eyebrow: 'Know what to study next', title: 'Turn practice into a plan', body: 'Readiness, strengths and weaker subjects become clearer after every completed test.' },
      { eyebrow: 'Designed around real life', title: 'Study anywhere—even offline', body: 'Core lessons and questions stay available on phone, tablet and web without a constant connection.' },
      { eyebrow: 'Small wins add up', title: 'Build a habit that lasts', body: 'Daily missions, streaks, XP and spaced review keep each session focused and rewarding.' },
    ],
  },
  fa: {
    welcomeEyebrow: 'فضای یادگیری SQE شما', welcomeTitle: 'حقوق را با انگیزه یاد بگیرید.', welcomeBody: 'درس‌های کوتاه، مرور فعال و تمرین واقع‌گرایانه بر پایه ساختار آزمون SQE.',
    accountTitle: 'ورود با حساب', accountBody: 'هویت خود را نگه دارید و در صورت فعال بودن خدمات ابری، پیشرفت را امن همگام کنید.', accountAction: 'ساخت حساب یا ورود',
    guestTitle: 'ورود مهمان', guestBody: 'فوراً شروع کنید. پیشرفت روی همین دستگاه می‌ماند و بعداً می‌توانید حساب بسازید.', guestAction: 'ادامه به‌عنوان مهمان', guestNote: 'آموزش عمومی حقوق انگلستان و ولز است؛ مشاوره حقوقی نیست.',
    language: 'زبان خود را انتخاب کنید', skip: 'رد کردن راهنما', back: 'بازگشت', continue: 'ادامه', begin: 'شروع یادگیری', step: 'مرحله',
    pages: [
      { eyebrow: 'همه‌چیز در یک جا', title: 'جعبه‌ابزار کامل مطالعه SQE', body: 'درس‌های ساختاریافته، مرور فلش، پرسش‌های تمرینی و آزمون‌های زمان‌دار در کنار هم.' },
      { eyebrow: 'راهنما در زمان نیاز', title: 'با دستیار مطالعه آشنا شوید', body: 'توضیح ساده بخواهید و راهنمایی بگیرید تا دوباره به محتوای آموزشی مرتبط برگردید.' },
      { eyebrow: 'گام بعدی را بشناسید', title: 'تمرین را به برنامه تبدیل کنید', body: 'پس از هر آزمون، آمادگی، نقاط قوت و موضوعات نیازمند تمرکز روشن‌تر می‌شوند.' },
      { eyebrow: 'هماهنگ با زندگی واقعی', title: 'هرجا هستید، حتی آفلاین بخوانید', body: 'درس‌ها و پرسش‌های اصلی روی موبایل، تبلت و وب بدون اتصال دائمی در دسترس‌اند.' },
      { eyebrow: 'بردهای کوچک ماندگارند', title: 'عادت یادگیری بسازید', body: 'ماموریت روزانه، زنجیره، امتیاز XP و مرور فاصله‌دار هر جلسه را هدفمند می‌کند.' },
    ],
  },
  zh: {
    welcomeEyebrow: '你的 SQE 学习空间', welcomeTitle: '持续、有节奏地学习法律。', welcomeBody: '短课程、主动回忆和真实练习，围绕 SQE 考试大纲设计。',
    accountTitle: '使用账户', accountBody: '保留个人身份；配置云服务后可安全同步学习进度。', accountAction: '注册或登录',
    guestTitle: '访客体验', guestBody: '立即开始，进度保存在本设备，之后可随时创建账户。', guestAction: '以访客身份继续', guestNote: '仅提供英格兰和威尔士法律通识教育，不构成法律建议。',
    language: '选择语言', skip: '跳过教程', back: '返回', continue: '继续', begin: '开始学习', step: '步骤',
    pages: [
      { eyebrow: '一站式学习', title: '完整的 SQE 学习工具箱', body: '结构化课程、闪卡复习、练习题和计时模拟考试协同运作。' },
      { eyebrow: '需要时随时求助', title: '认识你的学习助手', body: '获取通俗解释和学习提示，并快速返回相关课程内容。' },
      { eyebrow: '明确下一步', title: '把练习变成计划', body: '每次测试后，备考度、优势和薄弱科目都会更加清晰。' },
      { eyebrow: '适应真实生活', title: '随时随地，离线也能学', body: '核心课程和题目可在手机、平板和网页上使用，无需持续联网。' },
      { eyebrow: '小进步带来大改变', title: '建立持久学习习惯', body: '每日任务、连续学习、XP 和间隔复习让每次学习更专注。' },
    ],
  },
  ar: {
    welcomeEyebrow: 'مساحتك لتعلّم SQE', welcomeTitle: 'تعلّم القانون بخطوات ثابتة.', welcomeBody: 'دروس قصيرة واسترجاع نشط وتدريب واقعي وفق مواصفات SQE.',
    accountTitle: 'استخدم حساباً', accountBody: 'احتفظ بهويتك وفعّل مزامنة التقدم الآمنة عند إعداد الخدمات السحابية.', accountAction: 'إنشاء حساب أو تسجيل الدخول',
    guestTitle: 'التجربة كضيف', guestBody: 'ابدأ فوراً. يبقى تقدمك على هذا الجهاز ويمكنك إنشاء حساب لاحقاً.', guestAction: 'المتابعة كضيف', guestNote: 'تعليم قانوني عام لإنجلترا وويلز، وليس استشارة قانونية.',
    language: 'اختر لغتك', skip: 'تخطي الدليل', back: 'رجوع', continue: 'متابعة', begin: 'ابدأ التعلّم', step: 'الخطوة',
    pages: [
      { eyebrow: 'كل شيء في مكان واحد', title: 'مجموعة أدوات SQE الكاملة', body: 'دروس منظمة ومراجعة سريعة وأسئلة تدريب وامتحانات تجريبية موقّتة.' },
      { eyebrow: 'دليل عند الحاجة', title: 'تعرّف إلى مساعد الدراسة', body: 'اطلب شرحاً مبسطاً واحصل على إرشادات تعيدك إلى المادة المناسبة.' },
      { eyebrow: 'اعرف خطوتك التالية', title: 'حوّل التدريب إلى خطة', body: 'تتضح الجاهزية ونقاط القوة والمواد الأضعف بعد كل اختبار.' },
      { eyebrow: 'مصمم للحياة اليومية', title: 'ادرس في أي مكان حتى دون اتصال', body: 'تبقى الدروس والأسئلة الأساسية متاحة على الهاتف واللوحي والويب.' },
      { eyebrow: 'الإنجازات الصغيرة تتراكم', title: 'ابنِ عادة تدوم', body: 'المهمات اليومية والاستمرارية وXP والمراجعة المتباعدة تحافظ على التركيز.' },
    ],
  },
  es: {
    welcomeEyebrow: 'Tu espacio de estudio SQE', welcomeTitle: 'Aprende derecho con constancia.', welcomeBody: 'Lecciones breves, recuerdo activo y práctica realista según el programa SQE.',
    accountTitle: 'Usar una cuenta', accountBody: 'Conserva tu identidad y activa la sincronización segura cuando se configuren servicios en la nube.', accountAction: 'Crear cuenta o entrar',
    guestTitle: 'Explorar como invitado', guestBody: 'Empieza ya. Tu progreso queda en este dispositivo y podrás crear una cuenta después.', guestAction: 'Continuar como invitado', guestNote: 'Educación jurídica general sobre Inglaterra y Gales; no es asesoramiento legal.',
    language: 'Elige tu idioma', skip: 'Saltar tutorial', back: 'Atrás', continue: 'Continuar', begin: 'Empezar a estudiar', step: 'Paso',
    pages: [
      { eyebrow: 'Todo en un solo lugar', title: 'Tu kit completo de estudio SQE', body: 'Lecciones, repaso rápido, preguntas y simulacros cronometrados trabajan juntos.' },
      { eyebrow: 'Ayuda cuando la necesitas', title: 'Conoce a tu asistente de estudio', body: 'Pide explicaciones claras y recibe indicaciones hacia el contenido relacionado.' },
      { eyebrow: 'Decide qué estudiar', title: 'Convierte la práctica en un plan', body: 'Tu preparación, fortalezas y materias débiles se aclaran tras cada prueba.' },
      { eyebrow: 'Pensado para la vida real', title: 'Estudia donde quieras, sin conexión', body: 'Las lecciones y preguntas principales funcionan en móvil, tableta y web.' },
      { eyebrow: 'Los pequeños logros cuentan', title: 'Crea un hábito duradero', body: 'Misiones, rachas, XP y repaso espaciado mantienen cada sesión enfocada.' },
    ],
  },
};

export function WelcomeGateway({ onAccount }: { onAccount: () => void }) {
  const { state, startGuest, updateSettings } = useLearner();
  const { language, isRtl } = useI18n();
  const { palette, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(palette, isRtl), [palette, isRtl]);
  const c = copy[language];
  return (
    <SafeAreaView style={styles.safe}>
      {isDark ? <Atmosphere styles={styles} /> : null}
      <ScrollView contentContainerStyle={styles.welcomeScroll} keyboardShouldPersistTaps="handled">
        <MotionView style={styles.welcomeCard} distance={16} duration={motion.relaxed}>
          <View style={styles.welcomeGlow} />
          <Brand />
          <View style={styles.languageBlock}>
            <Text style={styles.label}>{c.language}</Text>
            <View accessibilityRole="radiogroup" accessibilityLabel={c.language} style={styles.languageRow}>
              {languageOptions.map((option) => {
                const selected = state.language === option.code;
                return (
                  <Pressable key={option.code} accessibilityRole="radio" accessibilityState={{ checked: selected }} accessibilityLabel={option.englishName} onPress={() => updateSettings({ language: option.code })} style={({ pressed }) => [styles.languageChip, selected && styles.languageChipActive, pressed && styles.pressed]}>
                    <Text style={[styles.languageName, selected && styles.languageNameActive]}>{option.nativeName}</Text>
                    <Text style={[styles.languageCode, selected && styles.languageNameActive]}>{option.shortLabel}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View style={styles.welcomeCopy}>
            <View style={styles.eyebrowRow}><View style={styles.eyebrowDot} /><Text style={styles.eyebrow}>{c.welcomeEyebrow}</Text></View>
            <Text role="heading" style={styles.welcomeTitle}>{c.welcomeTitle}</Text>
            <Text style={styles.body}>{c.welcomeBody}</Text>
          </View>
          <View style={styles.choiceStack}>
            <Pressable accessibilityRole="button" accessibilityLabel={c.accountAction} onPress={onAccount} style={({ pressed }) => [styles.choiceCard, styles.accountChoice, pressed && styles.pressed]}>
              <View style={styles.choiceIcon}><Feather name="user-plus" size={25} color={palette.primary} /></View>
              <View style={styles.choiceCopy}><Text style={styles.choiceTitle}>{c.accountTitle}</Text><Text style={styles.choiceBody}>{c.accountBody}</Text><Text style={styles.choiceLink}>{c.accountAction}</Text></View>
              <Feather name={resolveForwardChevron(isRtl)} size={22} color={palette.primary} />
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={c.guestAction} onPress={startGuest} style={({ pressed }) => [styles.choiceCard, pressed && styles.pressed]}>
              <View style={[styles.choiceIcon, styles.guestIcon]}><Feather name="compass" size={25} color={palette.teal} /></View>
              <View style={styles.choiceCopy}><Text style={styles.choiceTitle}>{c.guestTitle}</Text><Text style={styles.choiceBody}>{c.guestBody}</Text><Text style={[styles.choiceLink, { color: palette.teal }]}>{c.guestAction}</Text></View>
              <Feather name={resolveForwardChevron(isRtl)} size={22} color={palette.teal} />
            </Pressable>
          </View>
          <View style={styles.legalNote}><Feather name="shield" size={16} color={palette.muted} /><Text style={styles.legalText}>{c.guestNote}</Text></View>
        </MotionView>
      </ScrollView>
    </SafeAreaView>
  );
}

export function Tutorial() {
  const { state, completeTutorial } = useLearner();
  const { language, isRtl } = useI18n();
  const { width } = useWindowDimensions();
  const { palette, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(palette, isRtl), [palette, isRtl]);
  const c = copy[language];
  const pageWidth = Math.min(width, 760);
  const [page, setPage] = useState(0);

  const goTo = (next: number) => {
    const safe = Math.max(0, Math.min(c.pages.length - 1, next));
    setPage(safe);
  };
  const continueFlow = () => page === c.pages.length - 1 ? completeTutorial() : goTo(page + 1);
  const item = c.pages[page]!;

  return (
    <SafeAreaView style={styles.safe}>
      {isDark ? <Atmosphere styles={styles} /> : null}
      <View style={[styles.tutorialShell, { width: pageWidth }]}>
        <View style={styles.tutorialTop}><Brand compact /><Pressable accessibilityRole="button" accessibilityLabel={c.skip} onPress={completeTutorial} style={({ pressed }) => [styles.skipButton, pressed && styles.pressed]}><Text style={styles.skipText}>{c.skip}</Text></Pressable></View>
        <View key={item.title} style={[styles.tutorialPage, { width: pageWidth }]} accessible accessibilityLabel={`${c.step} ${page + 1}. ${item.title}. ${item.body}`}>
          <MotionView style={styles.tutorialContent} replayKey={page} distance={14}>
            <View style={styles.tutorialCopy}><Text style={styles.tutorialEyebrow}>{item.eyebrow}</Text><Text role="heading" style={styles.tutorialTitle}>{item.title}</Text></View>
            <TutorialVisual index={page} palette={palette} styles={styles} />
            <Text style={styles.tutorialBody}>{item.body}</Text>
          </MotionView>
        </View>
        <View style={styles.tutorialFooter}>
          <View style={styles.dotRow} accessibilityLabel={`${c.step} ${page + 1} of ${c.pages.length}`}>
            {c.pages.map((item, index) => <View key={item.title} style={[styles.dot, index === page && styles.dotActive]} />)}
          </View>
          <View style={styles.tutorialActions}>
            {page > 0 ? <ActionButton label={c.back} direction="back" variant="quiet" onPress={() => goTo(page - 1)} /> : <View />}
            <ActionButton label={page === c.pages.length - 1 ? c.begin : c.continue} icon={page === c.pages.length - 1 ? 'check' : undefined} direction="forward" onPress={continueFlow} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Atmosphere({ styles }: { styles: ReturnType<typeof createStyles> }) {
  return <View accessible={false} style={styles.atmosphere}><View style={styles.atmospherePrimary} /><View style={styles.atmosphereTeal} /><View style={styles.atmosphereWarm} /></View>;
}

function TutorialVisual({ index, palette, styles }: { index: number; palette: AppPalette; styles: ReturnType<typeof createStyles> }) {
  if (index === 0) return <View style={styles.visualStage}><View style={styles.toolCluster}>{(['book-open', 'edit-3', 'layers', 'clock'] as const).map((icon, item) => <View key={icon} style={[styles.toolBubble, item === 1 && styles.toolBubbleTeal, item === 2 && styles.toolBubbleGold]}><Feather name={icon} size={28} color={item === 1 ? palette.teal : item === 2 ? palette.goldInk : palette.primary} /></View>)}</View></View>;
  if (index === 1) return <View style={styles.visualStage}><View style={styles.assistantOrb}><Feather name="message-circle" size={54} color={palette.primary} /></View><View style={styles.speech}><Text style={styles.speechText}>Ask. Understand. Apply.</Text></View></View>;
  if (index === 2) return <View style={styles.visualStage}><View style={styles.chart}>{[38, 56, 72, 88, 66, 48].map((height, item) => <View key={height} style={styles.chartColumn}><View style={[styles.chartBar, { height, backgroundColor: item === 3 ? palette.teal : palette.surfaceMuted }]} />{item === 3 ? <Feather name="user" size={15} color={palette.white} style={styles.chartUser} /> : null}</View>)}</View><View style={styles.readinessBadge}><Feather name="trending-up" size={17} color={palette.teal} /><Text style={styles.readinessText}>74%</Text></View></View>;
  if (index === 3) return <View style={styles.visualStage}><View style={styles.deviceRow}><View style={styles.phone}><Feather name="smartphone" size={54} color={palette.primary} /></View><View style={styles.syncLine}><Feather name="refresh-cw" size={24} color={palette.teal} /></View><View style={styles.laptop}><Feather name="monitor" size={67} color={palette.primary} /></View></View><View style={styles.offlineBadge}><Feather name="wifi-off" size={17} color={palette.goldInk} /><Text style={styles.offlineText}>Offline ready</Text></View></View>;
  return <View style={styles.visualStage}><View style={styles.habitRing}><Feather name="award" size={62} color={palette.saffron} /><View style={styles.habitCheck}><Feather name="check" size={19} color={palette.white} /></View></View><View style={styles.streakRow}>{[1, 2, 3, 4, 5].map((item) => <View key={item} style={[styles.streakDay, item < 5 && styles.streakDayDone]}><Text style={[styles.streakText, item < 5 && styles.streakTextDone]}>{item}</Text></View>)}</View></View>;
}

const createStyles = (palette: AppPalette, isRtl: boolean) => {
  // Web inherits document.dir, so a normal row already mirrors RTL content.
  // Native needs an explicit row reversal because it has no CSS direction.
  const rowDirection = Platform.OS === 'web' ? 'row' : isRtl ? 'row-reverse' : 'row';
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  atmosphere: { ...StyleSheet.absoluteFillObject, overflow: 'hidden', pointerEvents: 'none' },
  atmospherePrimary: { position: 'absolute', width: 460, height: 460, top: -260, right: -180, borderRadius: 230, backgroundColor: palette.ambientPrimary },
  atmosphereTeal: { position: 'absolute', width: 360, height: 360, bottom: -220, left: -190, borderRadius: 180, backgroundColor: palette.ambientSecondary },
  atmosphereWarm: { position: 'absolute', width: 220, height: 220, top: '45%', right: -150, borderRadius: 110, backgroundColor: palette.ambientWarm },
  welcomeScroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  welcomeCard: { position: 'relative', overflow: 'hidden', width: '100%', maxWidth: 720, alignSelf: 'center', gap: 24, padding: 24, borderWidth: 1, borderColor: palette.line, borderRadius: radius.xl, backgroundColor: palette.surface, ...createShadow(palette) },
  welcomeGlow: { position: 'absolute', width: 280, height: 280, borderRadius: 140, top: -180, right: -100, backgroundColor: palette.primarySoft, opacity: 0.9 },
  languageBlock: { gap: 10 }, label: { color: palette.inkSoft, fontSize: 13, fontWeight: '800' }, languageRow: { flexDirection: rowDirection, flexWrap: 'wrap', gap: 8, paddingVertical: 2 },
  languageChip: { flexGrow: 1, flexBasis: 112, minHeight: 48, minWidth: 104, maxWidth: 180, flexDirection: rowDirection, alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: palette.line, borderRadius: radius.md, backgroundColor: palette.surfaceMuted },
  languageChipActive: { borderColor: palette.primary, backgroundColor: palette.primarySoft }, languageName: { color: palette.inkSoft, fontSize: 13, fontWeight: '800' }, languageNameActive: { color: palette.primaryDark }, languageCode: { color: palette.muted, fontSize: 11, fontWeight: '800' },
  welcomeCopy: { gap: 9 }, eyebrowRow: { flexDirection: rowDirection, alignItems: 'center', gap: 8 }, eyebrowDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.saffron }, eyebrow: { color: palette.primary, fontSize: 12, fontWeight: '900' }, welcomeTitle: { color: palette.ink, fontSize: 34, lineHeight: 43, fontWeight: '900' }, body: { color: palette.inkSoft, fontSize: 15, lineHeight: 24 },
  choiceStack: { gap: 12 }, choiceCard: { minHeight: 132, flexDirection: rowDirection, alignItems: 'center', gap: 14, padding: 16, borderWidth: 1, borderColor: palette.line, borderRadius: radius.lg, backgroundColor: palette.surfaceMuted }, accountChoice: { borderColor: palette.secondaryBorder, backgroundColor: palette.primarySoft }, choiceIcon: { width: 52, height: 52, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.surface }, guestIcon: { backgroundColor: palette.tealSoft }, choiceCopy: { flex: 1, gap: 4 }, choiceTitle: { color: palette.ink, fontSize: 17, lineHeight: 24, fontWeight: '900' }, choiceBody: { color: palette.inkSoft, fontSize: 12, lineHeight: 19 }, choiceLink: { color: palette.primary, fontSize: 12, lineHeight: 19, fontWeight: '900', marginTop: 3 }, legalNote: { flexDirection: rowDirection, alignItems: 'flex-start', justifyContent: 'center', gap: 8, padding: 12 }, legalText: { flex: 1, color: palette.muted, fontSize: 11, lineHeight: 18 }, pressed: { opacity: 0.86 },
  tutorialShell: { flex: 1, maxWidth: 760, alignSelf: 'center', overflow: 'hidden', backgroundColor: 'transparent' }, tutorialTop: { minHeight: 68, flexDirection: rowDirection, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 }, skipButton: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 10 }, skipText: { color: palette.muted, fontSize: 12, fontWeight: '800' }, tutorialPager: { flex: 1 }, tutorialPage: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 12 }, tutorialContent: { flex: 1, maxHeight: 700, justifyContent: 'space-around', gap: 20 }, tutorialCopy: { gap: 8 }, tutorialEyebrow: { color: palette.primary, fontSize: 13, lineHeight: 20, fontWeight: '900' }, tutorialTitle: { color: palette.ink, fontSize: 32, lineHeight: 41, fontWeight: '900' }, tutorialBody: { color: palette.inkSoft, fontSize: 17, lineHeight: 27 },
  visualStage: { minHeight: 250, alignItems: 'center', justifyContent: 'center', gap: 20 }, toolCluster: { width: 230, height: 200, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 12 }, toolBubble: { width: 92, height: 82, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.primarySoft }, toolBubbleTeal: { backgroundColor: palette.tealSoft }, toolBubbleGold: { backgroundColor: palette.saffronSoft }, assistantOrb: { width: 150, height: 150, borderRadius: 52, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.primarySoft, borderWidth: 1, borderColor: palette.secondaryBorder }, speech: { maxWidth: 260, paddingHorizontal: 18, paddingVertical: 12, borderRadius: radius.md, backgroundColor: palette.brandSurface }, speechText: { color: palette.white, fontSize: 14, fontWeight: '800', textAlign: 'center' },
  chart: { height: 150, flexDirection: 'row', alignItems: 'flex-end', gap: 9, paddingHorizontal: 16, paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: palette.line }, chartColumn: { width: 34, alignItems: 'center', justifyContent: 'flex-end' }, chartBar: { width: 34, borderTopLeftRadius: 9, borderTopRightRadius: 9 }, chartUser: { position: 'absolute', bottom: 8 }, readinessBadge: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: palette.tealSoft }, readinessText: { color: palette.tealInk, fontSize: 15, fontWeight: '900' },
  deviceRow: { flexDirection: 'row', alignItems: 'center', gap: 14 }, phone: { width: 78, height: 120, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: palette.primarySoft }, syncLine: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 23, backgroundColor: palette.tealSoft }, laptop: { width: 150, height: 112, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: palette.primarySoft }, offlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 999, backgroundColor: palette.saffronSoft }, offlineText: { color: palette.goldInk, fontSize: 13, fontWeight: '900' },
  habitRing: { width: 170, height: 170, borderRadius: 85, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.saffronSoft, borderWidth: 10, borderColor: palette.primarySoft }, habitCheck: { position: 'absolute', right: 5, bottom: 13, width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.teal }, streakRow: { flexDirection: 'row', gap: 8 }, streakDay: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: palette.line, backgroundColor: palette.surfaceMuted }, streakDayDone: { borderColor: palette.primary, backgroundColor: palette.primary }, streakText: { color: palette.muted, fontSize: 12, fontWeight: '900' }, streakTextDone: { color: palette.white },
  tutorialFooter: { gap: 16, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 18, borderTopWidth: 1, borderTopColor: palette.line, backgroundColor: palette.surface }, dotRow: { minHeight: 20, flexDirection: rowDirection, alignItems: 'center', justifyContent: 'center', gap: 7 }, dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.line }, dotActive: { width: 25, backgroundColor: palette.primary }, tutorialActions: { minHeight: 52, flexDirection: rowDirection, alignItems: 'center', justifyContent: 'space-between', gap: 12 },
});
};
