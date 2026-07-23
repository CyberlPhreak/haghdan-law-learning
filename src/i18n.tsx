import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { StyleSheet, Text as NativeText, type TextProps } from 'react-native';
import { localizeLegalText } from './legal-content';

export type AppLanguage = 'fa' | 'en' | 'zh' | 'ar' | 'es';

export const languageOptions: Array<{ code: AppLanguage; nativeName: string; englishName: string; shortLabel: string; rtl: boolean }> = [
  { code: 'fa', nativeName: 'فارسی', englishName: 'Persian', shortLabel: 'FA', rtl: true },
  { code: 'en', nativeName: 'English', englishName: 'English', shortLabel: 'EN', rtl: false },
  { code: 'zh', nativeName: '简体中文', englishName: 'Chinese', shortLabel: '中文', rtl: false },
  { code: 'ar', nativeName: 'العربية', englishName: 'Arabic', shortLabel: 'AR', rtl: true },
  { code: 'es', nativeName: 'Español', englishName: 'Spanish', shortLabel: 'ES', rtl: false },
];

const en: Record<string, string> = {
  'brand.label': 'HaghDān, law and SQE learning',
  'common.back': 'Back',
  'common.close': 'Close',
  'common.save': 'Save',
  'common.lesson': 'lesson',
  'common.lessons': 'lessons',
  'common.completed': 'completed',
  'common.notStarted': 'Not started',
  'common.questions': 'questions',
  'common.correct': 'correct',
  'common.level': 'Level',
  'common.current': 'Current level',
  'language.title': 'App language',
  'language.helper': 'Choose the language for the interface, lessons and tests. Official English terminology remains visible for legal precision.',
  'language.contentFallback': 'Draft offline translation from the verified Persian source. Official English terminology is retained; legal editorial review is required before publication.',
  'nav.home': 'Home',
  'nav.learn': 'Learn',
  'nav.review': 'Review',
  'nav.practice': 'Tests',
  'nav.profile': 'Profile',
  'auth.secure': 'Secure local sign-in',
  'auth.learningAccount': 'Your learning account',
  'auth.welcome': 'Welcome back',
  'auth.create': 'Create your HaghDān account',
  'auth.loginBody': 'Enter your username and PIN to continue.',
  'auth.createBody': 'Your username, PIN and learning progress stay on this device.',
  'auth.displayName': 'Display name',
  'auth.displayNamePlaceholder': 'For example, Sara',
  'auth.username': 'Username',
  'auth.pin': 'Sign-in PIN',
  'auth.pinHint': '4 to 6 digits',
  'auth.confirmPin': 'Confirm PIN',
  'auth.confirmPinHint': 'Enter the PIN again',
  'auth.dailyGoal': 'Daily goal',
  'auth.goalHelper': 'How many short lessons each day? You can change this later.',
  'auth.terms': 'I accept the terms, privacy policy, and that this is general legal education—not legal advice.',
  'auth.login': 'Sign in',
  'auth.createAction': 'Create account and begin',
  'auth.forgot': 'I forgot my PIN',
  'auth.localSecurity': 'Your PIN is stored as a hash. Cloud sync is not enabled.',
  'home.eyebrow': 'Learning dashboard',
  'home.greeting': 'Hello {name}',
  'home.subtitle': 'Make one legal concept clearer today.',
  'home.today': 'Today’s recommendation',
  'home.startLesson': 'Start lesson',
  'home.minutes': '{count} min',
  'home.sections': '{count} sections',
  'home.dailyGoal': 'Today’s goal',
  'home.mastery': 'Overall progress',
  'home.complete': 'Lessons completed',
  'home.reviewReady': 'Reviews ready',
  'home.streak': 'Day streak',
  'home.pathways': 'Recommended pathways',
  'home.library': 'Your law library',
  'home.libraryProgress': '{done} of {total} lessons completed',
  'insights.eyebrow': 'Learning analytics', 'insights.readiness': 'Your readiness is {count}%', 'insights.focus': 'Next focus: {subject}', 'insights.firstTest': 'Your strengths and focus areas appear after your first test.', 'insights.view': 'View report',
  'game.club': 'Learning Club',
  'game.toNext': '{count} XP to the next level',
  'game.maxLevel': 'Highest current level',
  'game.streak': 'Day streak',
  'game.missionsToday': 'Today’s missions',
  'game.badgesUnlocked': 'Badges unlocked',
  'game.progressMessage': 'Earn {count} more XP to reach “{level}”.',
  'game.maxMessage': 'You have reached the highest current level. Your mastery journey continues.',
  'game.missionsHeading': 'Today’s missions',
  'game.missionsSummary': '{done} of 3 complete · rewards are applied automatically',
  'game.badgesHeading': 'Badge hall',
  'game.badgesSummary': '{done} of {total} badges unlocked',
  'game.roadmap': 'Progress roadmap',
  'game.roadmapNote': 'These are learning stages, not professional titles.',
  'game.done': 'Complete · reward applied.',
  'game.locked': 'locked',
  'game.unlocked': 'unlocked',
  'game.level.1': 'Starter',
  'game.level.2': 'Law Explorer',
  'game.level.3': 'Analyst',
  'game.level.4': 'Reasoner',
  'game.level.5': 'Strategist',
  'game.level.6': 'Researcher',
  'game.level.7': 'Advanced Learner',
  'game.mission.first-lesson.title': 'Strong start',
  'game.mission.first-lesson.description': 'Complete one short lesson today.',
  'game.mission.daily-goal.title': 'Daily goal',
  'game.mission.daily-goal.description': 'Complete {count} lessons today.',
  'game.mission.practice.title': 'Active practice',
  'game.mission.practice.description': 'Finish one practice set or test.',
  'game.achievement.first-step.title': 'First step',
  'game.achievement.first-step.description': 'Complete your first lesson.',
  'game.achievement.reader-5.title': 'Five concepts',
  'game.achievement.reader-5.description': 'Complete five lessons.',
  'game.achievement.reader-15.title': 'Library in motion',
  'game.achievement.reader-15.description': 'Complete fifteen lessons.',
  'game.achievement.first-test.title': 'Enter the arena',
  'game.achievement.first-test.description': 'Record your first test.',
  'game.achievement.accurate.title': 'Seventy percent',
  'game.achievement.accurate.description': 'Score at least 70% in a test.',
  'game.achievement.streak-3.title': 'Three-day streak',
  'game.achievement.streak-3.description': 'Stay active for three consecutive days.',
  'game.achievement.streak-7.title': 'Golden week',
  'game.achievement.streak-7.description': 'Stay active for seven consecutive days.',
  'game.achievement.xp-1000.title': 'One thousand XP',
  'game.achievement.xp-1000.description': 'Reach 1,000 XP.',
  'learn.eyebrow': 'Complete SQE programme',
  'learn.title': 'Structured learning',
  'learn.subtitle': 'FLK1 and FLK2 applied knowledge, plus all six SQE2 skills.',
  'learn.search': 'Search a subject or legal term…',
  'learn.units': '{sections} subjects · {units} learning units',
  'learn.available': '{done} completed; every unit is available without locks.',
  'learn.translationNote': 'Interface and curriculum language: {language}. Lesson and mock translations work offline and are marked as editorial drafts.',
  'learn.pathwayDescription': 'Official SQE subject pathway with structured lessons, practice and reviewed terminology.',
  'learn.everyday': 'Everyday law',
  'learn.specTitle': 'Mapped to the SRA specification · 2025/26 + September 2026 changes',
  'learn.specText': '{sqe1} SQE1 subjects · {sqe2} SQE2 skills · {stations} practical stations · {questions} practice questions',
  'practice.subject': '20-question practice · {subject}',
  'lesson.close': 'Close lesson',
  'lesson.save': 'Save lesson',
  'lesson.section': 'Section {current} of {total}',
  'lesson.nextSection': 'Next section',
  'lesson.startQuiz': 'Start knowledge check',
  'lesson.checkAnswer': 'Check answer',
  'lesson.nextQuestion': 'Next question',
  'lesson.submit': 'Save result',
  'lesson.answerRequired': 'Choose an answer before continuing.',
  'lesson.assessment': 'Knowledge check',
  'lesson.example': 'Applied example and practice',
  'lesson.checklist': 'Section checklist',
  'lesson.keyTerm': 'Key term',
  'lesson.correctFeedback': 'Excellent—correct',
  'lesson.retryFeedback': 'That’s okay—let’s review it',
  'lesson.chain': '{count} answer chain',
  'lesson.complete': 'Lesson completed',
  'lesson.progressSaved': 'Progress saved and questions added to spaced review.',
  'lesson.backPath': 'Back to pathway',
  'review.title': 'Spaced review', 'review.subtitle': 'Questions return at the right time to strengthen memory.', 'review.now': 'Ready now', 'review.later': 'For later', 'review.done': 'Today’s review is complete',
  'practice.title': 'Practice and tests', 'practice.subtitle': '{count} structured five-option questions with timing, flags and saved results.', 'practice.quick': 'Quick practice', 'practice.diagnostic': 'Diagnostic test', 'practice.mock': 'Timed mock session', 'practice.full': 'Full two-session mock', 'practice.recent': 'Recent results', 'practice.empty': 'No result recorded yet',
  'test.exit': 'Exit test', 'test.question': 'Question {current} of {total}', 'test.flag': 'Flag', 'test.flagged': 'Flagged', 'test.previous': 'Previous', 'test.next': 'Next', 'test.finish': 'Finish test', 'test.answerRequired': 'Answer this question before continuing.', 'test.result': '{stage} result', 'test.breakdown': 'Performance by subject', 'test.back': 'Back to tests',
  'profile.eyebrow': 'Protected account',
  'profile.title': 'Learning settings',
  'profile.subtitle': 'Your account and progress are stored locally on this device.',
  'profile.details': 'Profile',
  'profile.preferences': 'Preferences',
  'profile.appearance': 'Appearance',
  'profile.appearanceHelper': 'Light, dark, or match your device',
  'profile.sound': 'Sound feedback',
  'profile.soundHelper': 'Short sounds for taps, correct answers and retries',
  'profile.contentLanguage': 'Legal content display',
  'profile.contentLanguageHelper': 'Official English terms remain visible alongside reviewed translations.',
  'profile.contentTransparency': 'Content and publication transparency',
  'profile.specCurrent': 'SRA 2025/26 · For assessments up to 31 August 2026',
  'profile.specSummary': '{lessons} SQE units · {stations} SQE2 stations · published September 2026 changes are also mapped',
  'profile.offlinePrivacy': 'Offline privacy',
  'profile.independent': 'Independent product',
  'profile.independentDetail': 'Independent from SRA and Kaplan SQE · general education, not legal advice.',
  'profile.signOut': 'Sign out',
  'profile.reset': 'Erase data and start again',
  'profile.nameError': 'Display name must contain at least two characters.',
  'profile.resetTitle': 'Erase progress?',
  'profile.resetBody': 'All local lessons and scores will be removed.',
  'profile.cancel': 'Cancel',
  'profile.erase': 'Erase',
  'theme.mode': '{mode} mode',
  'theme.system': 'Device',
  'theme.light': 'Light',
  'theme.dark': 'Dark',
  'notice.legal': 'General education about the law of England and Wales—not legal advice. Laws and deadlines may change.',
};

const fa: Record<string, string> = {
  'brand.label': 'حق‌دان، آموزش حقوق و SQE', 'common.back': 'بازگشت', 'common.close': 'بستن', 'common.save': 'ذخیره', 'common.lesson': 'درس', 'common.lessons': 'درس', 'common.completed': 'تکمیل شده', 'common.notStarted': 'شروع نشده', 'common.questions': 'سؤال', 'common.correct': 'درست', 'common.level': 'سطح', 'common.current': 'سطح فعلی',
  'language.title': 'زبان برنامه', 'language.helper': 'زبان رابط، درس‌ها و آزمون‌ها را انتخاب کنید. اصطلاح رسمی انگلیسی برای دقت حقوقی حفظ می‌شود.', 'language.contentFallback': 'ترجمه آفلاین پیش‌نویس از منبع معتبر فارسی؛ اصطلاحات رسمی انگلیسی حفظ شده‌اند و پیش از انتشار به بازبینی حقوقی نیاز است.',
  'nav.home': 'خانه', 'nav.learn': 'مسیرها', 'nav.review': 'مرور', 'nav.practice': 'آزمون', 'nav.profile': 'حساب',
  'auth.secure': 'ورود امن محلی', 'auth.learningAccount': 'حساب یادگیری شما', 'auth.welcome': 'خوش آمدید', 'auth.create': 'حساب حق‌دان را بسازید', 'auth.loginBody': 'برای ادامه، شناسه کاربری و PIN خود را وارد کنید.', 'auth.createBody': 'شناسه و PIN فقط روی این دستگاه نگهداری می‌شوند و پیشرفت فعلی شما محفوظ می‌ماند.', 'auth.displayName': 'نام نمایشی', 'auth.displayNamePlaceholder': 'مثلاً سارا', 'auth.username': 'شناسه کاربری', 'auth.pin': 'PIN ورود', 'auth.pinHint': '۴ تا ۶ رقم', 'auth.confirmPin': 'تکرار PIN', 'auth.confirmPinHint': 'PIN را دوباره وارد کنید', 'auth.dailyGoal': 'هدف روزانه', 'auth.goalHelper': 'چند درس کوتاه در روز؟ بعداً قابل تغییر است.', 'auth.terms': 'شرایط استفاده، سیاست حریم خصوصی و این نکته را می‌پذیرم که محتوا آموزش عمومی است و مشاوره حقوقی نیست.', 'auth.login': 'ورود به حساب', 'auth.createAction': 'ساخت حساب و شروع', 'auth.forgot': 'PIN را فراموش کرده‌ام', 'auth.localSecurity': 'PIN به‌صورت هش‌شده ذخیره می‌شود؛ همگام‌سازی ابری هنوز فعال نیست.',
  'home.eyebrow': 'داشبورد یادگیری', 'home.greeting': 'سلام {name}', 'home.subtitle': 'امروز یک مفهوم حقوقی را روشن‌تر کنید.', 'home.today': 'پیشنهاد امروز', 'home.startLesson': 'شروع درس', 'home.minutes': '{count} دقیقه', 'home.sections': '{count} بخش', 'home.dailyGoal': 'هدف امروز', 'home.mastery': 'پیشرفت کل', 'home.complete': 'درس کامل', 'home.reviewReady': 'مرور آماده', 'home.streak': 'روز پیوسته', 'home.pathways': 'مسیرهای پیشنهادی', 'home.library': 'کتابخانه حقوقی شما', 'home.libraryProgress': '{done} از {total} درس تکمیل شده', 'insights.eyebrow': 'تحلیل یادگیری', 'insights.readiness': 'آمادگی شما {count}٪ است', 'insights.focus': 'تمرکز بعدی: {subject}', 'insights.firstTest': 'با اولین آزمون، نقاط قوت و ضعف شما مشخص می‌شود.', 'insights.view': 'مشاهده گزارش',
  'game.club': 'باشگاه یادگیری', 'game.toNext': '{count} XP تا سطح بعد', 'game.maxLevel': 'بالاترین سطح فعلی', 'game.streak': 'روز پیوسته', 'game.missionsToday': 'ماموریت امروز', 'game.badgesUnlocked': 'نشان بازشده', 'game.progressMessage': 'با {count} امتیاز دیگر به «{level}» می‌رسید.', 'game.maxMessage': 'شما به بالاترین سطح فعلی رسیده‌اید؛ مسیر تسلط ادامه دارد.', 'game.missionsHeading': 'ماموریت‌های امروز', 'game.missionsSummary': '{done} از ۳ کامل شده · پاداش‌ها خودکار ثبت می‌شوند', 'game.badgesHeading': 'تالار نشان‌ها', 'game.badgesSummary': '{done} از {total} نشان باز شده است', 'game.roadmap': 'مسیر پیشرفت', 'game.roadmapNote': 'عنوان‌ها فقط مرحله یادگیری هستند و عنوان حرفه‌ای محسوب نمی‌شوند.', 'game.done': 'انجام شد؛ پاداش ثبت شد.', 'game.locked': 'قفل', 'game.unlocked': 'باز شده',
  'learn.eyebrow': 'برنامه کامل SQE', 'learn.title': 'یادگیری ساختاریافته', 'learn.subtitle': 'FLK1 و FLK2 برای دانش کاربردی؛ SQE2 برای شش مهارت عملی.', 'learn.search': 'جست‌وجوی موضوع یا اصطلاح…', 'learn.units': '{sections} بخش · {units} واحد یادگیری', 'learn.available': '{done} واحد تکمیل شده؛ همه واحدها بدون قفل در دسترس‌اند.', 'learn.translationNote': 'زبان رابط و محتوای آموزشی: {language}. ترجمه درس‌ها و آزمون‌ها آفلاین است و وضعیت پیش‌نویس تحریریه دارد.', 'learn.pathwayDescription': 'مسیر رسمی SQE با درس‌های ساختاریافته، تمرین و اصطلاحات بازبینی‌شده.', 'learn.everyday': 'حقوق روزمره', 'learn.specTitle': 'نگاشت‌شده به ساختار SRA · ۲۰۲۵/۲۶ + تغییرات سپتامبر ۲۰۲۶', 'learn.specText': '{sqe1} بخش SQE1 · {sqe2} مهارت SQE2 · {stations} ایستگاه عملی · {questions} پرسش تمرینی', 'practice.subject': 'تمرین ۲۰ سؤال · {subject}',
  'lesson.close': 'بستن درس', 'lesson.save': 'ذخیره درس', 'lesson.section': 'بخش {current} از {total}', 'lesson.nextSection': 'بخش بعد', 'lesson.startQuiz': 'شروع آزمون کوتاه', 'lesson.checkAnswer': 'بررسی پاسخ', 'lesson.nextQuestion': 'پرسش بعد', 'lesson.submit': 'ثبت نتیجه', 'lesson.answerRequired': 'برای ادامه، ابتدا یک پاسخ را انتخاب کنید.', 'lesson.assessment': 'سنجش یادگیری', 'lesson.example': 'مثال و تمرین کاربردی', 'lesson.checklist': 'چک‌لیست این بخش', 'lesson.keyTerm': 'واژه کلیدی', 'lesson.correctFeedback': 'آفرین! درست بود', 'lesson.retryFeedback': 'اشکالی ندارد؛ دوباره مرور کنیم', 'lesson.chain': 'زنجیره {count}', 'lesson.complete': 'درس تکمیل شد', 'lesson.progressSaved': 'پیشرفت ذخیره شد و پرسش‌ها به برنامه مرور فاصله‌دار اضافه شدند.', 'lesson.backPath': 'بازگشت به مسیر',
  'review.title': 'مرور فاصله‌دار', 'review.subtitle': 'پرسش‌ها در زمان مناسب برای تثبیت حافظه برمی‌گردند.', 'review.now': 'اکنون آماده', 'review.later': 'برای بعد', 'review.done': 'مرور امروز تمام شد', 'practice.title': 'تمرین و آزمون', 'practice.subtitle': '{count} پرسش پنج‌گزینه‌ای ساختاریافته با زمان‌سنج، علامت‌گذاری و ذخیره نتیجه.', 'practice.quick': 'تمرین سریع', 'practice.diagnostic': 'آزمون تشخیصی', 'practice.mock': 'نشست شبیه‌ساز', 'practice.full': 'آزمون کامل دو‌نشستی', 'practice.recent': 'نتایج اخیر', 'practice.empty': 'هنوز نتیجه‌ای ثبت نشده', 'test.exit': 'خروج از آزمون', 'test.question': 'سؤال {current} از {total}', 'test.flag': 'علامت‌گذاری', 'test.flagged': 'علامت‌گذاری شد', 'test.previous': 'قبلی', 'test.next': 'بعدی', 'test.finish': 'پایان آزمون', 'test.answerRequired': 'پاسخ این سؤال الزامی است.', 'test.result': 'نتیجه {stage}', 'test.breakdown': 'عملکرد بر اساس بخش', 'test.back': 'بازگشت به آزمون‌ها',
  'profile.eyebrow': 'حساب محافظت‌شده', 'profile.title': 'تنظیمات یادگیری', 'profile.subtitle': 'حساب و پیشرفت شما به‌صورت محلی روی همین دستگاه ذخیره می‌شوند.', 'profile.details': 'مشخصات', 'profile.preferences': 'ترجیحات', 'profile.appearance': 'ظاهر برنامه', 'profile.appearanceHelper': 'روشن، تاریک یا هماهنگ با تنظیمات دستگاه', 'profile.sound': 'بازخورد صوتی', 'profile.soundHelper': 'صدای کوتاه برای لمس، پاسخ درست و پاسخ نادرست', 'profile.contentLanguage': 'نمایش محتوای حقوقی', 'profile.contentLanguageHelper': 'اصطلاح رسمی انگلیسی کنار ترجمه بازبینی‌شده باقی می‌ماند.', 'profile.contentTransparency': 'شفافیت محتوا و انتشار', 'profile.specCurrent': 'SRA 2025/26 · برای ارزیابی‌های تا ۳۱ اوت ۲۰۲۶', 'profile.specSummary': '{lessons} واحد SQE · {stations} ایستگاه SQE2 · تغییرات منتشرشده سپتامبر ۲۰۲۶ نیز نگاشت شده است', 'profile.offlinePrivacy': 'حریم خصوصی آفلاین', 'profile.independent': 'محصول مستقل', 'profile.independentDetail': 'مستقل از SRA و Kaplan SQE · آموزش عمومی، نه مشاوره حقوقی.', 'profile.signOut': 'خروج از حساب', 'profile.reset': 'پاک‌کردن داده و شروع دوباره', 'profile.nameError': 'نام نمایشی حداقل دو نویسه لازم دارد.', 'profile.resetTitle': 'پاک‌کردن پیشرفت؟', 'profile.resetBody': 'همه درس‌ها و امتیازهای محلی حذف می‌شوند.', 'profile.cancel': 'انصراف', 'profile.erase': 'پاک کردن', 'theme.mode': 'حالت {mode}', 'theme.system': 'دستگاه', 'theme.light': 'روشن', 'theme.dark': 'تاریک', 'notice.legal': 'آموزش عمومی حقوق انگلستان و ولز؛ نه مشاوره حقوقی. قانون و مهلت‌ها ممکن است تغییر کنند.',
};

const zh: Record<string, string> = {
  'brand.label': 'HaghDān，法律与 SQE 学习', 'common.back': '返回', 'common.close': '关闭', 'common.save': '保存', 'common.lesson': '课程', 'common.lessons': '课程', 'common.completed': '已完成', 'common.notStarted': '尚未开始', 'common.questions': '题', 'common.correct': '正确', 'common.level': '等级', 'common.current': '当前等级',
  'language.title': '应用语言', 'language.helper': '选择界面、课程和测试语言。为确保法律准确性，保留官方英语术语。', 'language.contentFallback': '基于已验证波斯语原文的离线草稿翻译。保留官方英语术语；发布前需要法律编辑审校。',
  'nav.home': '首页', 'nav.learn': '学习', 'nav.review': '复习', 'nav.practice': '测试', 'nav.profile': '我的',
  'auth.secure': '本地安全登录', 'auth.learningAccount': '你的学习账户', 'auth.welcome': '欢迎回来', 'auth.create': '创建 HaghDān 账户', 'auth.loginBody': '输入用户名和 PIN 以继续。', 'auth.createBody': '用户名、PIN 和学习进度仅保存在此设备上。', 'auth.displayName': '显示名称', 'auth.displayNamePlaceholder': '例如 Sara', 'auth.username': '用户名', 'auth.pin': '登录 PIN', 'auth.pinHint': '4 至 6 位数字', 'auth.confirmPin': '确认 PIN', 'auth.confirmPinHint': '再次输入 PIN', 'auth.dailyGoal': '每日目标', 'auth.goalHelper': '每天完成多少个短课程？以后可以修改。', 'auth.terms': '我接受使用条款、隐私政策，并理解本应用提供一般法律教育而非法律意见。', 'auth.login': '登录', 'auth.createAction': '创建账户并开始', 'auth.forgot': '我忘记了 PIN', 'auth.localSecurity': 'PIN 以哈希形式保存；尚未启用云同步。',
  'home.eyebrow': '学习仪表盘', 'home.greeting': '你好，{name}', 'home.subtitle': '今天弄懂一个法律概念。', 'home.today': '今日推荐', 'home.startLesson': '开始课程', 'home.minutes': '{count} 分钟', 'home.sections': '{count} 个部分', 'home.dailyGoal': '今日目标', 'home.mastery': '总体进度', 'home.complete': '已完成课程', 'home.reviewReady': '待复习', 'home.streak': '连续天数', 'home.pathways': '推荐学习路径', 'home.library': '你的法律学习库', 'home.libraryProgress': '已完成 {done}/{total} 个课程', 'insights.eyebrow': '学习分析', 'insights.readiness': '当前准备度为 {count}%', 'insights.focus': '下一重点：{subject}', 'insights.firstTest': '完成首次测试后即可看到优势与重点领域。', 'insights.view': '查看报告',
  'game.club': '学习俱乐部', 'game.toNext': '距离下一等级还需 {count} XP', 'game.maxLevel': '当前最高等级', 'game.streak': '连续天数', 'game.missionsToday': '今日任务', 'game.badgesUnlocked': '已解锁徽章', 'game.progressMessage': '再获得 {count} XP 即可达到“{level}”。', 'game.maxMessage': '你已达到当前最高等级，精进之路仍在继续。', 'game.missionsHeading': '今日任务', 'game.missionsSummary': '已完成 {done}/3 · 奖励自动发放', 'game.badgesHeading': '徽章大厅', 'game.badgesSummary': '已解锁 {done}/{total} 个徽章', 'game.roadmap': '成长路线', 'game.roadmapNote': '这些仅是学习阶段，并非职业头衔。', 'game.done': '已完成，奖励已发放。', 'game.locked': '未解锁', 'game.unlocked': '已解锁',
  'learn.eyebrow': '完整 SQE 课程', 'learn.title': '结构化学习', 'learn.subtitle': 'FLK1、FLK2 应用知识以及全部六项 SQE2 技能。', 'learn.search': '搜索科目或法律术语…', 'learn.units': '{sections} 个科目 · {units} 个学习单元', 'learn.available': '已完成 {done} 个；所有单元均可直接学习。', 'learn.translationNote': '界面和课程语言：{language}。课程与模拟测试翻译可离线使用，并标记为编辑草稿。', 'learn.pathwayDescription': '官方 SQE 科目路径，包含结构化课程、练习和经审校术语。', 'learn.everyday': '日常法律', 'learn.specTitle': '已映射至 SRA 规范 · 2025/26 + 2026 年 9 月变更', 'learn.specText': '{sqe1} 个 SQE1 科目 · {sqe2} 项 SQE2 技能 · {stations} 个实务站点 · {questions} 道练习题', 'practice.subject': '20 题专项练习 · {subject}',
  'lesson.close': '关闭课程', 'lesson.save': '保存课程', 'lesson.section': '第 {current}/{total} 部分', 'lesson.nextSection': '下一部分', 'lesson.startQuiz': '开始知识测验', 'lesson.checkAnswer': '检查答案', 'lesson.nextQuestion': '下一题', 'lesson.submit': '保存结果', 'lesson.answerRequired': '请先选择答案再继续。', 'lesson.assessment': '知识测验', 'lesson.example': '应用示例与练习', 'lesson.checklist': '本节清单', 'lesson.keyTerm': '关键词', 'lesson.correctFeedback': '答对了，很棒！', 'lesson.retryFeedback': '没关系，我们再复习一下', 'lesson.chain': '连续答对 {count} 题', 'lesson.complete': '课程已完成', 'lesson.progressSaved': '进度已保存，题目已加入间隔复习。', 'lesson.backPath': '返回学习路径',
  'review.title': '间隔复习', 'review.subtitle': '题目会在合适的时间再次出现，以强化记忆。', 'review.now': '现在可复习', 'review.later': '稍后复习', 'review.done': '今天的复习已完成', 'practice.title': '练习与测试', 'practice.subtitle': '{count} 道结构化五选一题，支持计时、标记和保存结果。', 'practice.quick': '快速练习', 'practice.diagnostic': '诊断测试', 'practice.mock': '计时模拟场次', 'practice.full': '完整双场模拟', 'practice.recent': '最近结果', 'practice.empty': '尚无测试结果', 'test.exit': '退出测试', 'test.question': '第 {current}/{total} 题', 'test.flag': '标记', 'test.flagged': '已标记', 'test.previous': '上一题', 'test.next': '下一题', 'test.finish': '结束测试', 'test.answerRequired': '请先回答本题。', 'test.result': '{stage} 结果', 'test.breakdown': '各科表现', 'test.back': '返回测试',
  'profile.eyebrow': '受保护账户', 'profile.title': '学习设置', 'profile.subtitle': '账户和进度仅保存在此设备上。', 'profile.details': '个人资料', 'profile.preferences': '偏好设置', 'profile.appearance': '外观', 'profile.appearanceHelper': '浅色、深色或跟随设备', 'profile.sound': '声音反馈', 'profile.soundHelper': '点击、答对和重试时播放短音效', 'profile.contentLanguage': '法律内容显示', 'profile.contentLanguageHelper': '官方英语术语会与经过审校的翻译一起显示。', 'profile.contentTransparency': '内容与发布透明度', 'profile.specCurrent': 'SRA 2025/26 · 适用于截至 2026 年 8 月 31 日的评估', 'profile.specSummary': '{lessons} 个 SQE 单元 · {stations} 个 SQE2 站点 · 已映射 2026 年 9 月发布的变更', 'profile.offlinePrivacy': '离线隐私', 'profile.independent': '独立产品', 'profile.independentDetail': '独立于 SRA 和 Kaplan SQE · 一般教育内容，不构成法律意见。', 'profile.signOut': '退出登录', 'profile.reset': '清除数据并重新开始', 'profile.nameError': '显示名称至少需要两个字符。', 'profile.resetTitle': '清除进度？', 'profile.resetBody': '所有本地课程和分数都将被删除。', 'profile.cancel': '取消', 'profile.erase': '清除', 'theme.mode': '{mode}模式', 'theme.system': '跟随设备', 'theme.light': '浅色', 'theme.dark': '深色', 'notice.legal': '英格兰和威尔士法律的一般教育内容，不构成法律意见。法律和期限可能变化。',
};

const ar: Record<string, string> = {
  'brand.label': 'حق‌دان، لتعلّم القانون وSQE', 'common.back': 'رجوع', 'common.close': 'إغلاق', 'common.save': 'حفظ', 'common.lesson': 'درس', 'common.lessons': 'دروس', 'common.completed': 'مكتمل', 'common.notStarted': 'لم يبدأ', 'common.questions': 'أسئلة', 'common.correct': 'صحيح', 'common.level': 'المستوى', 'common.current': 'المستوى الحالي',
  'language.title': 'لغة التطبيق', 'language.helper': 'اختر لغة الواجهة والدروس والاختبارات. تبقى المصطلحات الإنجليزية الرسمية ظاهرة للدقة القانونية.', 'language.contentFallback': 'ترجمة مسودة تعمل دون اتصال من المصدر الفارسي الموثق. حُفظت المصطلحات الإنجليزية الرسمية، وتلزم مراجعة تحريرية قانونية قبل النشر.',
  'nav.home': 'الرئيسية', 'nav.learn': 'التعلّم', 'nav.review': 'المراجعة', 'nav.practice': 'الاختبارات', 'nav.profile': 'الحساب',
  'auth.secure': 'دخول محلي آمن', 'auth.learningAccount': 'حساب التعلّم', 'auth.welcome': 'مرحباً بعودتك', 'auth.create': 'أنشئ حساب حق‌دان', 'auth.loginBody': 'أدخل اسم المستخدم ورمز PIN للمتابعة.', 'auth.createBody': 'تبقى بيانات الحساب والتقدم على هذا الجهاز.', 'auth.displayName': 'الاسم الظاهر', 'auth.displayNamePlaceholder': 'مثلاً سارة', 'auth.username': 'اسم المستخدم', 'auth.pin': 'رمز PIN', 'auth.pinHint': 'من 4 إلى 6 أرقام', 'auth.confirmPin': 'تأكيد PIN', 'auth.confirmPinHint': 'أدخل PIN مرة أخرى', 'auth.dailyGoal': 'الهدف اليومي', 'auth.goalHelper': 'كم درساً قصيراً كل يوم؟ يمكنك تغييره لاحقاً.', 'auth.terms': 'أوافق على الشروط وسياسة الخصوصية وأن المحتوى تعليم قانوني عام وليس استشارة قانونية.', 'auth.login': 'تسجيل الدخول', 'auth.createAction': 'إنشاء الحساب والبدء', 'auth.forgot': 'نسيت رمز PIN', 'auth.localSecurity': 'يُحفظ PIN كقيمة مشفّرة، والمزامنة السحابية غير مفعلة.',
  'home.eyebrow': 'لوحة التعلّم', 'home.greeting': 'مرحباً {name}', 'home.subtitle': 'وضّح مفهوماً قانونياً واحداً اليوم.', 'home.today': 'اقتراح اليوم', 'home.startLesson': 'ابدأ الدرس', 'home.minutes': '{count} دقيقة', 'home.sections': '{count} أقسام', 'home.dailyGoal': 'هدف اليوم', 'home.mastery': 'التقدم العام', 'home.complete': 'الدروس المكتملة', 'home.reviewReady': 'جاهز للمراجعة', 'home.streak': 'أيام متتالية', 'home.pathways': 'المسارات المقترحة', 'home.library': 'مكتبتك القانونية', 'home.libraryProgress': 'أكملت {done} من {total} درساً', 'insights.eyebrow': 'تحليل التعلّم', 'insights.readiness': 'جاهزيتك {count}٪', 'insights.focus': 'التركيز التالي: {subject}', 'insights.firstTest': 'تظهر نقاط القوة والتركيز بعد أول اختبار.', 'insights.view': 'عرض التقرير',
  'game.club': 'نادي التعلّم', 'game.toNext': '{count} XP للمستوى التالي', 'game.maxLevel': 'أعلى مستوى حالي', 'game.streak': 'أيام متتالية', 'game.missionsToday': 'مهام اليوم', 'game.badgesUnlocked': 'شارات مفتوحة', 'game.progressMessage': 'يتبقى {count} XP للوصول إلى «{level}».', 'game.maxMessage': 'وصلت إلى أعلى مستوى حالي، وتستمر رحلة الإتقان.', 'game.missionsHeading': 'مهام اليوم', 'game.missionsSummary': 'اكتملت {done} من 3 · تُضاف المكافآت تلقائياً', 'game.badgesHeading': 'قاعة الشارات', 'game.badgesSummary': 'فُتحت {done} من {total} شارة', 'game.roadmap': 'مسار التقدم', 'game.roadmapNote': 'هذه مراحل تعلّم وليست ألقاباً مهنية.', 'game.done': 'اكتملت وأُضيفت المكافأة.', 'game.locked': 'مقفلة', 'game.unlocked': 'مفتوحة',
  'learn.eyebrow': 'برنامج SQE الكامل', 'learn.title': 'تعلّم منظّم', 'learn.subtitle': 'معرفة FLK1 وFLK2 التطبيقية والمهارات الست في SQE2.', 'learn.search': 'ابحث عن موضوع أو مصطلح قانوني…', 'learn.units': '{sections} موضوعاً · {units} وحدة تعلم', 'learn.available': 'اكتملت {done} وحدة؛ جميع الوحدات متاحة بلا قفل.', 'learn.translationNote': 'لغة الواجهة والمنهج: {language}. تعمل ترجمات الدروس والاختبارات التجريبية دون اتصال وتحمل علامة مسودة تحريرية.', 'learn.pathwayDescription': 'مسار رسمي لموضوع SQE مع دروس منظمة وتدريب ومصطلحات مراجعة.', 'learn.everyday': 'القانون اليومي', 'learn.specTitle': 'مرتبط بمواصفات SRA · 2025/26 + تغييرات سبتمبر 2026', 'learn.specText': '{sqe1} موضوعاً في SQE1 · {sqe2} مهارات SQE2 · {stations} محطة عملية · {questions} سؤال تدريب', 'practice.subject': 'تدريب من 20 سؤالاً · {subject}',
  'lesson.close': 'إغلاق الدرس', 'lesson.save': 'حفظ الدرس', 'lesson.section': 'القسم {current} من {total}', 'lesson.nextSection': 'القسم التالي', 'lesson.startQuiz': 'ابدأ اختبار المعرفة', 'lesson.checkAnswer': 'تحقق من الإجابة', 'lesson.nextQuestion': 'السؤال التالي', 'lesson.submit': 'حفظ النتيجة', 'lesson.answerRequired': 'اختر إجابة قبل المتابعة.', 'lesson.assessment': 'اختبار المعرفة', 'lesson.example': 'مثال وتطبيق عملي', 'lesson.checklist': 'قائمة هذا القسم', 'lesson.keyTerm': 'مصطلح أساسي', 'lesson.correctFeedback': 'ممتاز، إجابة صحيحة', 'lesson.retryFeedback': 'لا بأس، لنراجعها مجدداً', 'lesson.chain': 'سلسلة {count} إجابات', 'lesson.complete': 'اكتمل الدرس', 'lesson.progressSaved': 'حُفظ التقدم وأُضيفت الأسئلة للمراجعة المتباعدة.', 'lesson.backPath': 'العودة إلى المسار',
  'review.title': 'مراجعة متباعدة', 'review.subtitle': 'تعود الأسئلة في الوقت المناسب لتثبيت الذاكرة.', 'review.now': 'جاهز الآن', 'review.later': 'لاحقاً', 'review.done': 'اكتملت مراجعة اليوم', 'practice.title': 'التدريب والاختبارات', 'practice.subtitle': '{count} سؤالاً منظماً بخمسة خيارات مع توقيت وحفظ النتائج.', 'practice.quick': 'تدريب سريع', 'practice.diagnostic': 'اختبار تشخيصي', 'practice.mock': 'جلسة محاكاة', 'practice.full': 'محاكاة كاملة بجلستين', 'practice.recent': 'النتائج الأخيرة', 'practice.empty': 'لا توجد نتيجة بعد', 'test.exit': 'الخروج من الاختبار', 'test.question': 'السؤال {current} من {total}', 'test.flag': 'تمييز', 'test.flagged': 'مميّز', 'test.previous': 'السابق', 'test.next': 'التالي', 'test.finish': 'إنهاء الاختبار', 'test.answerRequired': 'يجب الإجابة قبل المتابعة.', 'test.result': 'نتيجة {stage}', 'test.breakdown': 'الأداء حسب الموضوع', 'test.back': 'العودة للاختبارات',
  'profile.eyebrow': 'حساب محمي', 'profile.title': 'إعدادات التعلّم', 'profile.subtitle': 'يُحفظ الحساب والتقدم محلياً على هذا الجهاز.', 'profile.details': 'الملف الشخصي', 'profile.preferences': 'التفضيلات', 'profile.appearance': 'المظهر', 'profile.appearanceHelper': 'فاتح أو داكن أو حسب الجهاز', 'profile.sound': 'التغذية الصوتية', 'profile.soundHelper': 'أصوات قصيرة للمس والإجابة الصحيحة والمحاولة', 'profile.contentLanguage': 'عرض المحتوى القانوني', 'profile.contentLanguageHelper': 'تبقى المصطلحات الإنجليزية الرسمية بجانب الترجمات المراجعة.', 'profile.contentTransparency': 'شفافية المحتوى والنشر', 'profile.specCurrent': 'SRA 2025/26 · للتقييمات حتى 31 أغسطس 2026', 'profile.specSummary': '{lessons} وحدة SQE · {stations} محطة SQE2 · تم أيضاً ربط تغييرات سبتمبر 2026 المنشورة', 'profile.offlinePrivacy': 'خصوصية بلا اتصال', 'profile.independent': 'منتج مستقل', 'profile.independentDetail': 'مستقل عن SRA وKaplan SQE · تعليم عام، وليس استشارة قانونية.', 'profile.signOut': 'تسجيل الخروج', 'profile.reset': 'مسح البيانات والبدء من جديد', 'profile.nameError': 'يجب ألا يقل اسم العرض عن حرفين.', 'profile.resetTitle': 'مسح التقدم؟', 'profile.resetBody': 'ستُحذف كل الدروس والنتائج المحلية.', 'profile.cancel': 'إلغاء', 'profile.erase': 'مسح', 'theme.mode': 'وضع {mode}', 'theme.system': 'الجهاز', 'theme.light': 'فاتح', 'theme.dark': 'داكن', 'notice.legal': 'تعليم عام حول قانون إنجلترا وويلز، وليس استشارة قانونية. قد تتغير القوانين والمواعيد.',
};

const es: Record<string, string> = {
  'brand.label': 'HaghDān, aprendizaje jurídico y SQE', 'common.back': 'Volver', 'common.close': 'Cerrar', 'common.save': 'Guardar', 'common.lesson': 'lección', 'common.lessons': 'lecciones', 'common.completed': 'completado', 'common.notStarted': 'Sin empezar', 'common.questions': 'preguntas', 'common.correct': 'correctas', 'common.level': 'Nivel', 'common.current': 'Nivel actual',
  'language.title': 'Idioma de la aplicación', 'language.helper': 'Elige el idioma de la interfaz, las lecciones y las pruebas. Se conservan los términos oficiales en inglés para mayor precisión jurídica.', 'language.contentFallback': 'Traducción preliminar sin conexión desde la fuente persa verificada. Se conservan los términos oficiales en inglés; requiere revisión jurídica antes de publicarse.',
  'nav.home': 'Inicio', 'nav.learn': 'Aprender', 'nav.review': 'Repasar', 'nav.practice': 'Pruebas', 'nav.profile': 'Perfil',
  'auth.secure': 'Acceso local seguro', 'auth.learningAccount': 'Tu cuenta de aprendizaje', 'auth.welcome': 'Bienvenido de nuevo', 'auth.create': 'Crea tu cuenta HaghDān', 'auth.loginBody': 'Introduce tu usuario y PIN para continuar.', 'auth.createBody': 'Tu cuenta y progreso permanecen en este dispositivo.', 'auth.displayName': 'Nombre visible', 'auth.displayNamePlaceholder': 'Por ejemplo, Sara', 'auth.username': 'Usuario', 'auth.pin': 'PIN de acceso', 'auth.pinHint': 'De 4 a 6 dígitos', 'auth.confirmPin': 'Confirmar PIN', 'auth.confirmPinHint': 'Introduce el PIN otra vez', 'auth.dailyGoal': 'Objetivo diario', 'auth.goalHelper': '¿Cuántas lecciones cortas al día? Podrás cambiarlo después.', 'auth.terms': 'Acepto los términos, la privacidad y que esto es educación jurídica general, no asesoramiento legal.', 'auth.login': 'Iniciar sesión', 'auth.createAction': 'Crear cuenta y empezar', 'auth.forgot': 'He olvidado mi PIN', 'auth.localSecurity': 'El PIN se guarda como hash; la sincronización en la nube no está activa.',
  'home.eyebrow': 'Panel de aprendizaje', 'home.greeting': 'Hola, {name}', 'home.subtitle': 'Aclara hoy un concepto jurídico.', 'home.today': 'Recomendación de hoy', 'home.startLesson': 'Empezar lección', 'home.minutes': '{count} min', 'home.sections': '{count} secciones', 'home.dailyGoal': 'Objetivo de hoy', 'home.mastery': 'Progreso total', 'home.complete': 'Lecciones terminadas', 'home.reviewReady': 'Repasos listos', 'home.streak': 'Racha de días', 'home.pathways': 'Rutas recomendadas', 'home.library': 'Tu biblioteca jurídica', 'home.libraryProgress': '{done} de {total} lecciones completadas', 'insights.eyebrow': 'Análisis de aprendizaje', 'insights.readiness': 'Tu preparación es del {count}%', 'insights.focus': 'Siguiente foco: {subject}', 'insights.firstTest': 'Tus fortalezas y prioridades aparecerán después de la primera prueba.', 'insights.view': 'Ver informe',
  'game.club': 'Club de aprendizaje', 'game.toNext': '{count} XP para el siguiente nivel', 'game.maxLevel': 'Nivel máximo actual', 'game.streak': 'Racha de días', 'game.missionsToday': 'Misiones de hoy', 'game.badgesUnlocked': 'Insignias abiertas', 'game.progressMessage': 'Consigue {count} XP más para llegar a «{level}».', 'game.maxMessage': 'Has llegado al nivel máximo actual; el dominio continúa.', 'game.missionsHeading': 'Misiones de hoy', 'game.missionsSummary': '{done} de 3 completadas · recompensas automáticas', 'game.badgesHeading': 'Sala de insignias', 'game.badgesSummary': '{done} de {total} insignias abiertas', 'game.roadmap': 'Ruta de progreso', 'game.roadmapNote': 'Son etapas de aprendizaje, no títulos profesionales.', 'game.done': 'Completada; recompensa aplicada.', 'game.locked': 'bloqueada', 'game.unlocked': 'abierta',
  'learn.eyebrow': 'Programa SQE completo', 'learn.title': 'Aprendizaje estructurado', 'learn.subtitle': 'Conocimiento aplicado FLK1 y FLK2, y las seis destrezas SQE2.', 'learn.search': 'Buscar materia o término jurídico…', 'learn.units': '{sections} materias · {units} unidades', 'learn.available': '{done} completadas; todas las unidades están disponibles.', 'learn.translationNote': 'Idioma de interfaz y currículo: {language}. Las traducciones de lecciones y simulacros funcionan sin conexión y están marcadas como borradores editoriales.', 'learn.pathwayDescription': 'Ruta oficial SQE con lecciones estructuradas, práctica y terminología revisada.', 'learn.everyday': 'Derecho cotidiano', 'learn.specTitle': 'Mapeado a la especificación SRA · 2025/26 + cambios de septiembre de 2026', 'learn.specText': '{sqe1} materias SQE1 · {sqe2} destrezas SQE2 · {stations} estaciones prácticas · {questions} preguntas', 'practice.subject': 'Práctica de 20 preguntas · {subject}',
  'lesson.close': 'Cerrar lección', 'lesson.save': 'Guardar lección', 'lesson.section': 'Sección {current} de {total}', 'lesson.nextSection': 'Siguiente sección', 'lesson.startQuiz': 'Empezar comprobación', 'lesson.checkAnswer': 'Comprobar respuesta', 'lesson.nextQuestion': 'Siguiente pregunta', 'lesson.submit': 'Guardar resultado', 'lesson.answerRequired': 'Elige una respuesta antes de continuar.', 'lesson.assessment': 'Comprobación de aprendizaje', 'lesson.example': 'Ejemplo y práctica aplicada', 'lesson.checklist': 'Lista de esta sección', 'lesson.keyTerm': 'Término clave', 'lesson.correctFeedback': 'Excelente, es correcto', 'lesson.retryFeedback': 'No pasa nada; repasémoslo', 'lesson.chain': 'Racha de {count} respuestas', 'lesson.complete': 'Lección completada', 'lesson.progressSaved': 'Progreso guardado y preguntas añadidas al repaso espaciado.', 'lesson.backPath': 'Volver a la ruta',
  'review.title': 'Repaso espaciado', 'review.subtitle': 'Las preguntas vuelven en el momento adecuado para reforzar la memoria.', 'review.now': 'Listo ahora', 'review.later': 'Para después', 'review.done': 'Repaso de hoy completado', 'practice.title': 'Práctica y pruebas', 'practice.subtitle': '{count} preguntas estructuradas de cinco opciones con tiempo y resultados guardados.', 'practice.quick': 'Práctica rápida', 'practice.diagnostic': 'Prueba diagnóstica', 'practice.mock': 'Sesión simulada', 'practice.full': 'Simulacro completo en dos sesiones', 'practice.recent': 'Resultados recientes', 'practice.empty': 'Aún no hay resultados', 'test.exit': 'Salir de la prueba', 'test.question': 'Pregunta {current} de {total}', 'test.flag': 'Marcar', 'test.flagged': 'Marcada', 'test.previous': 'Anterior', 'test.next': 'Siguiente', 'test.finish': 'Finalizar prueba', 'test.answerRequired': 'Responde antes de continuar.', 'test.result': 'Resultado {stage}', 'test.breakdown': 'Rendimiento por materia', 'test.back': 'Volver a pruebas',
  'profile.eyebrow': 'Cuenta protegida', 'profile.title': 'Ajustes de aprendizaje', 'profile.subtitle': 'La cuenta y el progreso se guardan localmente en este dispositivo.', 'profile.details': 'Perfil', 'profile.preferences': 'Preferencias', 'profile.appearance': 'Apariencia', 'profile.appearanceHelper': 'Claro, oscuro o igual que el dispositivo', 'profile.sound': 'Respuesta sonora', 'profile.soundHelper': 'Sonidos breves al tocar, acertar o reintentar', 'profile.contentLanguage': 'Contenido jurídico', 'profile.contentLanguageHelper': 'Los términos oficiales en inglés siguen visibles junto a traducciones revisadas.', 'profile.contentTransparency': 'Transparencia de contenido', 'profile.specCurrent': 'SRA 2025/26 · Para evaluaciones hasta el 31 de agosto de 2026', 'profile.specSummary': '{lessons} unidades SQE · {stations} estaciones SQE2 · también se mapearon los cambios publicados en septiembre de 2026', 'profile.offlinePrivacy': 'Privacidad sin conexión', 'profile.independent': 'Producto independiente', 'profile.independentDetail': 'Independiente de SRA y Kaplan SQE · educación general, no asesoramiento legal.', 'profile.signOut': 'Cerrar sesión', 'profile.reset': 'Borrar datos y empezar de nuevo', 'profile.nameError': 'El nombre visible debe tener al menos dos caracteres.', 'profile.resetTitle': '¿Borrar el progreso?', 'profile.resetBody': 'Se eliminarán todas las lecciones y puntuaciones locales.', 'profile.cancel': 'Cancelar', 'profile.erase': 'Borrar', 'theme.mode': 'Modo {mode}', 'theme.system': 'Dispositivo', 'theme.light': 'Claro', 'theme.dark': 'Oscuro', 'notice.legal': 'Educación general sobre el derecho de Inglaterra y Gales; no es asesoramiento legal. Las leyes y plazos pueden cambiar.',
};

const gameExtras: Record<Exclude<AppLanguage, 'en'>, Record<string, string>> = {
  fa: {
    'game.level.1': 'شروع‌کننده', 'game.level.2': 'کاوشگر حقوق', 'game.level.3': 'تحلیل‌گر', 'game.level.4': 'استدلال‌گر', 'game.level.5': 'راهبردگر', 'game.level.6': 'پژوهشگر', 'game.level.7': 'حق‌دان پیشرو',
    'game.mission.first-lesson.title': 'شروع قدرتمند', 'game.mission.first-lesson.description': 'یک درس کوتاه را امروز کامل کنید.', 'game.mission.daily-goal.title': 'هدف روزانه', 'game.mission.daily-goal.description': '{count} درس را تا پایان امروز کامل کنید.', 'game.mission.practice.title': 'تمرین فعال', 'game.mission.practice.description': 'یک تمرین یا آزمون را به پایان برسانید.',
    'game.achievement.first-step.title': 'اولین گام', 'game.achievement.first-step.description': 'اولین درس را کامل کنید.', 'game.achievement.reader-5.title': 'پنج مفهوم', 'game.achievement.reader-5.description': 'پنج درس را کامل کنید.', 'game.achievement.reader-15.title': 'کتابخانه در حرکت', 'game.achievement.reader-15.description': 'پانزده درس را کامل کنید.', 'game.achievement.first-test.title': 'ورود به میدان', 'game.achievement.first-test.description': 'اولین آزمون را ثبت کنید.', 'game.achievement.accurate.title': 'دقت هفتاد', 'game.achievement.accurate.description': 'در یک آزمون حداقل ۷۰٪ بگیرید.', 'game.achievement.streak-3.title': 'سه روز پیوسته', 'game.achievement.streak-3.description': 'سه روز متوالی فعال باشید.', 'game.achievement.streak-7.title': 'هفته طلایی', 'game.achievement.streak-7.description': 'هفت روز متوالی فعال باشید.', 'game.achievement.xp-1000.title': 'هزار امتیاز', 'game.achievement.xp-1000.description': 'به ۱۰۰۰ XP برسید.',
  },
  zh: {
    'game.level.1': '起步者', 'game.level.2': '法律探索者', 'game.level.3': '分析者', 'game.level.4': '推理者', 'game.level.5': '策略者', 'game.level.6': '研究者', 'game.level.7': '进阶学习者',
    'game.mission.first-lesson.title': '有力开局', 'game.mission.first-lesson.description': '今天完成一个短课程。', 'game.mission.daily-goal.title': '每日目标', 'game.mission.daily-goal.description': '今天完成 {count} 个课程。', 'game.mission.practice.title': '主动练习', 'game.mission.practice.description': '完成一组练习或测试。',
    'game.achievement.first-step.title': '第一步', 'game.achievement.first-step.description': '完成第一个课程。', 'game.achievement.reader-5.title': '五个概念', 'game.achievement.reader-5.description': '完成五个课程。', 'game.achievement.reader-15.title': '流动的知识库', 'game.achievement.reader-15.description': '完成十五个课程。', 'game.achievement.first-test.title': '进入考场', 'game.achievement.first-test.description': '记录第一次测试。', 'game.achievement.accurate.title': '百分之七十', 'game.achievement.accurate.description': '一次测试达到至少 70%。', 'game.achievement.streak-3.title': '连续三天', 'game.achievement.streak-3.description': '连续活跃三天。', 'game.achievement.streak-7.title': '黄金一周', 'game.achievement.streak-7.description': '连续活跃七天。', 'game.achievement.xp-1000.title': '一千 XP', 'game.achievement.xp-1000.description': '达到 1,000 XP。',
  },
  ar: {
    'game.level.1': 'مبتدئ', 'game.level.2': 'مستكشف القانون', 'game.level.3': 'محلل', 'game.level.4': 'مستدل', 'game.level.5': 'استراتيجي', 'game.level.6': 'باحث', 'game.level.7': 'متعلم متقدم',
    'game.mission.first-lesson.title': 'بداية قوية', 'game.mission.first-lesson.description': 'أكمل درساً قصيراً اليوم.', 'game.mission.daily-goal.title': 'الهدف اليومي', 'game.mission.daily-goal.description': 'أكمل {count} دروس اليوم.', 'game.mission.practice.title': 'تدريب نشط', 'game.mission.practice.description': 'أكمل تدريباً أو اختباراً واحداً.',
    'game.achievement.first-step.title': 'الخطوة الأولى', 'game.achievement.first-step.description': 'أكمل درسك الأول.', 'game.achievement.reader-5.title': 'خمسة مفاهيم', 'game.achievement.reader-5.description': 'أكمل خمسة دروس.', 'game.achievement.reader-15.title': 'مكتبة متحركة', 'game.achievement.reader-15.description': 'أكمل خمسة عشر درساً.', 'game.achievement.first-test.title': 'دخول الميدان', 'game.achievement.first-test.description': 'سجّل اختبارك الأول.', 'game.achievement.accurate.title': 'سبعون بالمئة', 'game.achievement.accurate.description': 'احصل على 70٪ في اختبار.', 'game.achievement.streak-3.title': 'ثلاثة أيام', 'game.achievement.streak-3.description': 'نشاط لثلاثة أيام متتالية.', 'game.achievement.streak-7.title': 'أسبوع ذهبي', 'game.achievement.streak-7.description': 'نشاط لسبعة أيام متتالية.', 'game.achievement.xp-1000.title': 'ألف XP', 'game.achievement.xp-1000.description': 'اجمع 1,000 XP.',
  },
  es: {
    'game.level.1': 'Principiante', 'game.level.2': 'Explorador jurídico', 'game.level.3': 'Analista', 'game.level.4': 'Razonador', 'game.level.5': 'Estratega', 'game.level.6': 'Investigador', 'game.level.7': 'Aprendiz avanzado',
    'game.mission.first-lesson.title': 'Buen comienzo', 'game.mission.first-lesson.description': 'Completa hoy una lección corta.', 'game.mission.daily-goal.title': 'Objetivo diario', 'game.mission.daily-goal.description': 'Completa hoy {count} lecciones.', 'game.mission.practice.title': 'Práctica activa', 'game.mission.practice.description': 'Termina una práctica o prueba.',
    'game.achievement.first-step.title': 'Primer paso', 'game.achievement.first-step.description': 'Completa tu primera lección.', 'game.achievement.reader-5.title': 'Cinco conceptos', 'game.achievement.reader-5.description': 'Completa cinco lecciones.', 'game.achievement.reader-15.title': 'Biblioteca en marcha', 'game.achievement.reader-15.description': 'Completa quince lecciones.', 'game.achievement.first-test.title': 'Entrar en juego', 'game.achievement.first-test.description': 'Registra tu primera prueba.', 'game.achievement.accurate.title': 'Setenta por ciento', 'game.achievement.accurate.description': 'Logra al menos 70% en una prueba.', 'game.achievement.streak-3.title': 'Racha de tres días', 'game.achievement.streak-3.description': 'Mantente activo tres días seguidos.', 'game.achievement.streak-7.title': 'Semana dorada', 'game.achievement.streak-7.description': 'Mantente activo siete días seguidos.', 'game.achievement.xp-1000.title': 'Mil XP', 'game.achievement.xp-1000.description': 'Alcanza 1.000 XP.',
  },
};

const interfaceExtras: Record<AppLanguage, Record<string, string>> = {
  en: {
    'common.loading': 'Preparing HaghDān…',
    'assistant.eyebrow': 'Curriculum-grounded assistant', 'assistant.title': 'AI Study Assistant', 'assistant.subtitle': 'Ask about FLK1, FLK2, SQE2 skills, or a legal concept from the installed curriculum.', 'assistant.online': 'Secure online AI', 'assistant.offline': 'Offline curriculum search', 'assistant.privacy': 'Do not enter names, case details, confidential, privileged, financial, health, immigration, or criminal-matter information.', 'assistant.suggestions': 'Try a study question', 'assistant.placeholder': 'Ask a legal study question…', 'assistant.send': 'Send question', 'assistant.empty': 'Choose a suggestion or ask a question. Answers are educational and may be incomplete.', 'assistant.error': 'The online assistant is unavailable. Check your connection or try the offline curriculum search later.', 'assistant.clear': 'Clear chat', 'assistant.clearTitle': 'Clear this chat?', 'assistant.clearBody': 'Messages are held only on this screen and will be removed.', 'assistant.tooLong': 'Keep the question under 2,000 characters.', 'home.assistant': 'Ask the AI Study Assistant', 'home.assistantBody': 'Get a curriculum-grounded explanation, exam method, and relevant lesson references.',
    'support.eyebrow': 'Help and legal', 'support.title': 'Support centre', 'support.subtitle': 'Get help, report a content concern, manage privacy, and read the legal documents.', 'support.contact': 'Contact support', 'support.contactBody': 'Open a private-safe support request. Do not post confidential case details.', 'support.report': 'Report a legal-content error', 'support.reportBody': 'Flag an outdated rule, broken question, translation issue, or accessibility problem.', 'support.privacyRequest': 'Privacy request', 'support.privacyRequestBody': 'Ask a privacy question or request deletion of any server-side support information.', 'support.privacy': 'Privacy Policy', 'support.terms': 'Terms and disclaimer', 'support.rights': 'Copyright and trade marks', 'support.delete': 'Delete local account and data', 'support.deleteBody': 'Erase the local profile, PIN hash, progress, bookmarks, scores and settings.', 'support.version': 'App version {version}', 'support.readInApp': 'Read in the app', 'support.openWeb': 'Open public web copy',
    'legal.updated': 'Updated {date}',
    'auth.resetLocalTitle': 'Delete the local account?', 'auth.resetLocalBody': 'If you forgot your PIN, the only offline recovery option is to delete this account and all progress saved on this device.', 'auth.resetLocalAction': 'Delete account and data',
    'auth.error.usernameLength': 'Username must contain 3 to 24 characters.', 'auth.error.usernameCharacters': 'Use letters, numbers, full stops, and underscores only.', 'auth.error.usernameEdges': 'Username cannot begin or end with a full stop or underscore.', 'auth.error.usernameRepeated': 'Repeated full stops or underscores are not allowed.', 'auth.error.pinFormat': 'PIN must contain 4 to 6 digits.', 'auth.error.invalidLogin': 'The username or PIN is incorrect.', 'auth.error.displayName': 'Display name must contain at least two characters.', 'auth.error.pinMismatch': 'The PIN confirmation does not match.', 'auth.error.termsRequired': 'Accept the terms to create an account.',
    'learn.noResultsTitle': 'No results in this section', 'learn.noResultsBody': 'Try another search term or choose a different section.',
    'test.finishTitle': 'Finish this test?', 'test.unanswered': '{count} questions are unanswered.', 'test.continue': 'Continue test', 'test.submitResult': 'Submit result', 'test.sessionOneComplete': '{stage} · Session one complete', 'test.breakTitle': 'Break between sessions', 'test.breakBody': '{count} answers from session one are saved. When you are ready, session two begins with 90 questions and a separate 153-minute timer.', 'test.startSecond': 'Start session two', 'test.boundaryTitle': 'The session boundary is protected', 'test.boundaryBody': 'Once session two begins, you cannot return to session-one answers, matching the official FLK experience.',
    'insights.readyGood': 'Good readiness', 'insights.readyProgress': 'Making progress', 'insights.readyFoundation': 'Building foundations', 'insights.index': 'Readiness index', 'insights.reportTitle': 'A clear view of your learning journey', 'insights.reportSubtitle': 'Study patterns, test readiness, and the subjects to prioritise next.', 'insights.target': 'Suggested target for practice tests: 70% or higher', 'insights.completedLessons': 'Lessons completed', 'insights.studyMinutes': 'Learning minutes', 'insights.averageTest': 'Average test', 'insights.activeDays': 'Active days', 'insights.rhythm': 'Study rhythm over the last 7 days', 'insights.strengths': 'Strengths', 'insights.strengthsSubtitle': 'Subjects where your performance is more consistent', 'insights.strengthsEmpty': 'Your strengths will appear after your first completed test.', 'insights.priorities': 'Focus priorities', 'insights.prioritiesSubtitle': 'Subjects where more review will have the greatest impact', 'insights.prioritiesEmpty': 'There is not enough data to identify focus areas yet.', 'insights.masteryMap': 'Subject mastery map', 'insights.measurable': 'Measured score', 'insights.smartNext': 'Smart next step', 'insights.smartWeakness': 'Complete a short lesson or test in “{subject}”; it currently has the most room for growth.', 'insights.smartStart': 'Complete one lesson and then a quick practice so HaghDān can build a more personal recommendation.', 'insights.activeSummary': '{count} active days in the last seven days', 'insights.activeDay': 'Active day', 'insights.consistencyTitle': 'Consistency matters more than study volume', 'insights.consistencyBody': 'Each bar shows the lessons and tests completed on that day.', 'insights.activityLabel': '{day}: {count} activities', 'insights.assessments': '{count} assessments', 'insights.statusStrong': 'Strong', 'insights.statusDeveloping': 'Developing', 'insights.statusFocus': 'Needs focus', 'insights.statusUnmeasured': 'Not assessed yet', 'insights.lessonCoverage': '{count}% lesson coverage',
  },
  fa: {
    'common.loading': 'در حال آماده‌سازی حق‌دان…',
    'assistant.eyebrow': 'دستیار مبتنی بر محتوای برنامه', 'assistant.title': 'دستیار مطالعه هوشمند', 'assistant.subtitle': 'درباره FLK1، FLK2، مهارت‌های SQE2 یا یک مفهوم حقوقی از محتوای نصب‌شده بپرسید.', 'assistant.online': 'هوش مصنوعی آنلاین امن', 'assistant.offline': 'جست‌وجوی آفلاین محتوای برنامه', 'assistant.privacy': 'نام، جزئیات پرونده، اطلاعات محرمانه، privileged، مالی، سلامت، مهاجرت یا موضوع کیفری وارد نکنید.', 'assistant.suggestions': 'یک سؤال مطالعاتی امتحان کنید', 'assistant.placeholder': 'سؤال حقوقی برای مطالعه بنویسید…', 'assistant.send': 'ارسال سؤال', 'assistant.empty': 'یک پیشنهاد را انتخاب کنید یا سؤال بنویسید. پاسخ‌ها آموزشی‌اند و ممکن است ناقص باشند.', 'assistant.error': 'دستیار آنلاین در دسترس نیست. اتصال را بررسی کنید یا بعداً از جست‌وجوی آفلاین استفاده کنید.', 'assistant.clear': 'پاک‌کردن گفتگو', 'assistant.clearTitle': 'گفتگو پاک شود؟', 'assistant.clearBody': 'پیام‌ها فقط در این صفحه نگه داشته می‌شوند و حذف خواهند شد.', 'assistant.tooLong': 'سؤال را کوتاه‌تر از ۲۰۰۰ نویسه نگه دارید.', 'home.assistant': 'از دستیار مطالعه هوشمند بپرسید', 'home.assistantBody': 'توضیح مبتنی بر محتوای برنامه، روش آزمون و درس‌های مرتبط را دریافت کنید.',
    'support.eyebrow': 'راهنما و حقوق کاربر', 'support.title': 'مرکز پشتیبانی', 'support.subtitle': 'کمک بگیرید، مشکل محتوا را گزارش کنید، حریم خصوصی را مدیریت و اسناد حقوقی را بخوانید.', 'support.contact': 'تماس با پشتیبانی', 'support.contactBody': 'درخواست پشتیبانی باز کنید و اطلاعات محرمانه پرونده را ارسال نکنید.', 'support.report': 'گزارش خطای محتوای حقوقی', 'support.reportBody': 'قاعده قدیمی، سؤال خراب، ترجمه یا مشکل دسترسی‌پذیری را گزارش کنید.', 'support.privacyRequest': 'درخواست حریم خصوصی', 'support.privacyRequestBody': 'پرسش حریم خصوصی یا حذف اطلاعات پشتیبانی سمت سرور را درخواست کنید.', 'support.privacy': 'سیاست حریم خصوصی', 'support.terms': 'شرایط و سلب مسئولیت', 'support.rights': 'کپی‌رایت و علائم تجاری', 'support.delete': 'حذف حساب و داده‌های محلی', 'support.deleteBody': 'پروفایل، هش PIN، پیشرفت، نشانک‌ها، امتیازها و تنظیمات حذف می‌شوند.', 'support.version': 'نسخه برنامه {version}', 'support.readInApp': 'مطالعه در برنامه', 'support.openWeb': 'بازکردن نسخه عمومی وب',
    'legal.updated': 'به‌روزرسانی {date}',
    'auth.resetLocalTitle': 'حذف حساب محلی؟', 'auth.resetLocalBody': 'اگر PIN را فراموش کرده‌اید، تنها راه بازیابی آفلاین حذف حساب و همه پیشرفت‌های این دستگاه است.', 'auth.resetLocalAction': 'حذف حساب و داده‌ها',
    'auth.error.usernameLength': 'شناسه کاربری باید بین ۳ تا ۲۴ نویسه باشد.', 'auth.error.usernameCharacters': 'فقط حروف، عدد، نقطه و زیرخط مجاز است.', 'auth.error.usernameEdges': 'شناسه نباید با نقطه یا زیرخط شروع یا تمام شود.', 'auth.error.usernameRepeated': 'نقطه یا زیرخط تکراری مجاز نیست.', 'auth.error.pinFormat': 'PIN باید ۴ تا ۶ رقم باشد.', 'auth.error.invalidLogin': 'شناسه کاربری یا PIN درست نیست.', 'auth.error.displayName': 'نام نمایشی حداقل دو نویسه لازم دارد.', 'auth.error.pinMismatch': 'تکرار PIN با PIN اصلی یکسان نیست.', 'auth.error.termsRequired': 'پذیرش شرایط برای ساخت حساب الزامی است.',
    'learn.noResultsTitle': 'نتیجه‌ای در این بخش نبود', 'learn.noResultsBody': 'عبارت یا بخش دیگری را امتحان کنید.',
    'test.finishTitle': 'آزمون را تمام می‌کنید؟', 'test.unanswered': '{count} سؤال بدون پاسخ است.', 'test.continue': 'ادامه آزمون', 'test.submitResult': 'ثبت نتیجه', 'test.sessionOneComplete': '{stage} · پایان نشست اول', 'test.breakTitle': 'استراحت میان دو نشست', 'test.breakBody': '{count} پاسخ نشست اول ذخیره شده است. نشست دوم با ۹۰ سؤال و زمان مستقل ۱۵۳ دقیقه آغاز می‌شود.', 'test.startSecond': 'شروع نشست دوم', 'test.boundaryTitle': 'مرز نشست حفظ می‌شود', 'test.boundaryBody': 'پس از شروع نشست دوم نمی‌توانید به پاسخ‌های نشست اول برگردید.',
    'insights.readyGood': 'آمادگی خوب', 'insights.readyProgress': 'در حال پیشرفت', 'insights.readyFoundation': 'در حال ساخت پایه', 'insights.index': 'شاخص آمادگی', 'insights.reportTitle': 'تصویر روشن از مسیر یادگیری شما', 'insights.reportSubtitle': 'روند مطالعه، آمادگی آزمون و اولویت‌های بعدی.', 'insights.target': 'هدف پیشنهادی آزمون‌های تمرینی: ۷۰٪ یا بیشتر', 'insights.completedLessons': 'درس تکمیل‌شده', 'insights.studyMinutes': 'دقیقه یادگیری', 'insights.averageTest': 'میانگین آزمون', 'insights.activeDays': 'روز پیوسته', 'insights.rhythm': 'ریتم مطالعه در ۷ روز اخیر', 'insights.strengths': 'نقاط قوت', 'insights.strengthsSubtitle': 'موضوعاتی که عملکرد پایدارتری دارید', 'insights.strengthsEmpty': 'پس از اولین آزمون، نقاط قوت اینجا ظاهر می‌شوند.', 'insights.priorities': 'اولویت‌های تمرکز', 'insights.prioritiesSubtitle': 'موضوعاتی که مرور بیشتر بیشترین اثر را دارد', 'insights.prioritiesEmpty': 'هنوز داده کافی برای شناسایی ضعف‌ها وجود ندارد.', 'insights.masteryMap': 'نقشه تسلط موضوعی', 'insights.measurable': 'امتیاز قابل اندازه‌گیری', 'insights.smartNext': 'پیشنهاد هوشمند بعدی', 'insights.smartWeakness': 'یک درس یا آزمون کوتاه از «{subject}» انجام دهید؛ این موضوع بیشترین ظرفیت رشد را دارد.', 'insights.smartStart': 'یک درس و سپس یک تمرین سریع انجام دهید تا حق‌دان پیشنهاد شخصی‌تری بسازد.', 'insights.activeSummary': '{count} روز فعال از هفت روز اخیر', 'insights.activeDay': 'روز فعال', 'insights.consistencyTitle': 'پیوستگی مهم‌تر از حجم مطالعه است', 'insights.consistencyBody': 'هر ستون درس‌ها و آزمون‌های تکمیل‌شده آن روز را نشان می‌دهد.', 'insights.activityLabel': '{day}: {count} فعالیت', 'insights.assessments': '{count} ارزیابی', 'insights.statusStrong': 'قوی', 'insights.statusDeveloping': 'در حال رشد', 'insights.statusFocus': 'نیاز به تمرکز', 'insights.statusUnmeasured': 'هنوز ارزیابی نشده', 'insights.lessonCoverage': '{count}٪ پوشش درس‌ها',
  },
  zh: {
    'common.loading': '正在准备 HaghDān…',
    'assistant.eyebrow': '基于课程的助手', 'assistant.title': 'AI 学习助手', 'assistant.subtitle': '询问 FLK1、FLK2、SQE2 技能或已安装课程中的法律概念。', 'assistant.online': '安全在线 AI', 'assistant.offline': '离线课程搜索', 'assistant.privacy': '请勿输入姓名、案件细节、机密或特权信息，以及财务、健康、移民或刑事事项信息。', 'assistant.suggestions': '尝试学习问题', 'assistant.placeholder': '输入法律学习问题…', 'assistant.send': '发送', 'assistant.empty': '选择建议或提出问题。回答仅供学习，可能不完整。', 'assistant.error': '在线助手暂不可用。请检查网络或稍后使用离线课程搜索。', 'assistant.clear': '清除对话', 'assistant.clearTitle': '清除本次对话？', 'assistant.clearBody': '消息仅保留在此页面，随后会被删除。', 'assistant.tooLong': '问题请控制在 2,000 个字符以内。', 'home.assistant': '询问 AI 学习助手', 'home.assistantBody': '获取基于课程的说明、考试方法和相关课程。',
    'support.eyebrow': '帮助与法律', 'support.title': '支持中心', 'support.subtitle': '获取帮助、报告内容问题、管理隐私并阅读法律文件。', 'support.contact': '联系支持', 'support.contactBody': '提交支持请求，请勿发布机密案件信息。', 'support.report': '报告法律内容错误', 'support.reportBody': '报告过时规则、题目错误、翻译或无障碍问题。', 'support.privacyRequest': '隐私请求', 'support.privacyRequestBody': '提出隐私问题或请求删除服务器端支持信息。', 'support.privacy': '隐私政策', 'support.terms': '条款与免责声明', 'support.rights': '版权与商标', 'support.delete': '删除本地账户和数据', 'support.deleteBody': '清除本地资料、PIN 哈希、进度、书签、分数和设置。', 'support.version': '应用版本 {version}', 'support.readInApp': '在应用内阅读', 'support.openWeb': '打开公开网页版本',
    'legal.updated': '更新于 {date}',
    'auth.resetLocalTitle': '删除本地账户？', 'auth.resetLocalBody': '如果忘记 PIN，离线模式下只能删除账户及本设备上的所有进度。', 'auth.resetLocalAction': '删除账户和数据',
    'auth.error.usernameLength': '用户名必须包含 3 至 24 个字符。', 'auth.error.usernameCharacters': '仅可使用字母、数字、句点和下划线。', 'auth.error.usernameEdges': '用户名不能以句点或下划线开头或结尾。', 'auth.error.usernameRepeated': '不允许连续句点或下划线。', 'auth.error.pinFormat': 'PIN 必须是 4 至 6 位数字。', 'auth.error.invalidLogin': '用户名或 PIN 不正确。', 'auth.error.displayName': '显示名称至少需要两个字符。', 'auth.error.pinMismatch': '两次输入的 PIN 不一致。', 'auth.error.termsRequired': '创建账户前请接受条款。',
    'learn.noResultsTitle': '本分类无结果', 'learn.noResultsBody': '请尝试其他关键词或选择不同分类。',
    'test.finishTitle': '结束测试？', 'test.unanswered': '还有 {count} 题未作答。', 'test.continue': '继续测试', 'test.submitResult': '提交结果', 'test.sessionOneComplete': '{stage} · 第一场完成', 'test.breakTitle': '两场之间休息', 'test.breakBody': '第一场已保存 {count} 个答案。准备好后，第二场将以 90 道题和独立的 153 分钟计时开始。', 'test.startSecond': '开始第二场', 'test.boundaryTitle': '场次边界已保护', 'test.boundaryBody': '第二场开始后不能返回第一场的答案，与官方 FLK 体验一致。',
    'insights.readyGood': '准备良好', 'insights.readyProgress': '稳步进步', 'insights.readyFoundation': '正在打基础', 'insights.index': '准备度指数', 'insights.reportTitle': '清晰掌握你的学习进程', 'insights.reportSubtitle': '查看学习节奏、考试准备度和下一步重点科目。', 'insights.target': '练习测试建议目标：70% 或更高', 'insights.completedLessons': '已完成课程', 'insights.studyMinutes': '学习分钟', 'insights.averageTest': '测试平均分', 'insights.activeDays': '活跃天数', 'insights.rhythm': '最近 7 天的学习节奏', 'insights.strengths': '优势科目', 'insights.strengthsSubtitle': '表现更稳定的科目', 'insights.strengthsEmpty': '完成首次测试后，优势将显示在这里。', 'insights.priorities': '重点优先项', 'insights.prioritiesSubtitle': '加强复习能带来最大提升的科目', 'insights.prioritiesEmpty': '目前数据不足，无法识别重点领域。', 'insights.masteryMap': '科目掌握度地图', 'insights.measurable': '可量化分数', 'insights.smartNext': '智能下一步', 'insights.smartWeakness': '完成“{subject}”的短课或测试；该科目当前提升空间最大。', 'insights.smartStart': '先完成一节课，再做一次快速练习，让 HaghDān 生成更个性化的建议。', 'insights.activeSummary': '最近七天有 {count} 个活跃日', 'insights.activeDay': '活跃日', 'insights.consistencyTitle': '持续性比学习量更重要', 'insights.consistencyBody': '每个柱形表示当天完成的课程和测试数。', 'insights.activityLabel': '{day}：{count} 项活动', 'insights.assessments': '{count} 次评估', 'insights.statusStrong': '强项', 'insights.statusDeveloping': '提升中', 'insights.statusFocus': '需要重点关注', 'insights.statusUnmeasured': '尚未评估', 'insights.lessonCoverage': '课程覆盖率 {count}%',
  },
  ar: {
    'common.loading': 'جارٍ تجهيز HaghDān…',
    'assistant.eyebrow': 'مساعد مستند إلى المنهج', 'assistant.title': 'مساعد الدراسة بالذكاء الاصطناعي', 'assistant.subtitle': 'اسأل عن FLK1 أو FLK2 أو مهارات SQE2 أو مفهوم قانوني من المنهج المثبت.', 'assistant.online': 'ذكاء اصطناعي آمن عبر الإنترنت', 'assistant.offline': 'بحث المنهج دون اتصال', 'assistant.privacy': 'لا تدخل أسماء أو تفاصيل قضايا أو معلومات سرية أو مميزة أو مالية أو صحية أو هجرة أو مسائل جنائية.', 'assistant.suggestions': 'جرّب سؤالاً دراسياً', 'assistant.placeholder': 'اكتب سؤالاً قانونياً للدراسة…', 'assistant.send': 'إرسال', 'assistant.empty': 'اختر اقتراحاً أو اطرح سؤالاً. الإجابات تعليمية وقد تكون غير مكتملة.', 'assistant.error': 'المساعد عبر الإنترنت غير متاح. تحقق من الاتصال أو استخدم البحث دون اتصال لاحقاً.', 'assistant.clear': 'مسح المحادثة', 'assistant.clearTitle': 'مسح هذه المحادثة؟', 'assistant.clearBody': 'تُحفظ الرسائل في هذه الشاشة فقط وسيتم حذفها.', 'assistant.tooLong': 'اجعل السؤال أقل من 2,000 حرف.', 'home.assistant': 'اسأل مساعد الدراسة', 'home.assistantBody': 'احصل على شرح من المنهج وطريقة الامتحان والدروس ذات الصلة.',
    'support.eyebrow': 'المساعدة والشؤون القانونية', 'support.title': 'مركز الدعم', 'support.subtitle': 'احصل على المساعدة وبلّغ عن مشكلة وأدر الخصوصية واقرأ المستندات القانونية.', 'support.contact': 'الاتصال بالدعم', 'support.contactBody': 'افتح طلب دعم ولا تنشر تفاصيل قضية سرية.', 'support.report': 'الإبلاغ عن خطأ قانوني', 'support.reportBody': 'بلّغ عن قاعدة قديمة أو سؤال أو ترجمة أو مشكلة وصول.', 'support.privacyRequest': 'طلب خصوصية', 'support.privacyRequestBody': 'اطرح سؤال خصوصية أو اطلب حذف معلومات الدعم على الخادم.', 'support.privacy': 'سياسة الخصوصية', 'support.terms': 'الشروط وإخلاء المسؤولية', 'support.rights': 'حقوق النشر والعلامات', 'support.delete': 'حذف الحساب والبيانات المحلية', 'support.deleteBody': 'يمحو الملف المحلي ورمز PIN المشفّر والتقدم والإشارات والنتائج والإعدادات.', 'support.version': 'إصدار التطبيق {version}', 'support.readInApp': 'القراءة داخل التطبيق', 'support.openWeb': 'فتح النسخة العامة على الويب',
    'legal.updated': 'حُدث في {date}',
    'auth.resetLocalTitle': 'حذف الحساب المحلي؟', 'auth.resetLocalBody': 'إذا نسيت PIN، فخيار الاستعادة الوحيد دون اتصال هو حذف الحساب وكل التقدم على هذا الجهاز.', 'auth.resetLocalAction': 'حذف الحساب والبيانات',
    'auth.error.usernameLength': 'يجب أن يتضمن اسم المستخدم من 3 إلى 24 حرفاً.', 'auth.error.usernameCharacters': 'استخدم الحروف والأرقام والنقاط والشرطة السفلية فقط.', 'auth.error.usernameEdges': 'لا يمكن أن يبدأ اسم المستخدم أو ينتهي بنقطة أو شرطة سفلية.', 'auth.error.usernameRepeated': 'لا يسمح بتكرار النقاط أو الشرط السفلية.', 'auth.error.pinFormat': 'يجب أن يتكون PIN من 4 إلى 6 أرقام.', 'auth.error.invalidLogin': 'اسم المستخدم أو PIN غير صحيح.', 'auth.error.displayName': 'يجب ألا يقل الاسم الظاهر عن حرفين.', 'auth.error.pinMismatch': 'تأكيد PIN غير مطابق.', 'auth.error.termsRequired': 'وافق على الشروط لإنشاء حساب.',
    'learn.noResultsTitle': 'لا توجد نتائج في هذا القسم', 'learn.noResultsBody': 'جرّب عبارة أخرى أو اختر قسماً مختلفاً.',
    'test.finishTitle': 'إنهاء الاختبار؟', 'test.unanswered': 'هناك {count} أسئلة بلا إجابة.', 'test.continue': 'متابعة الاختبار', 'test.submitResult': 'إرسال النتيجة', 'test.sessionOneComplete': '{stage} · اكتملت الجلسة الأولى', 'test.breakTitle': 'استراحة بين الجلستين', 'test.breakBody': 'حُفظت {count} إجابة من الجلسة الأولى. عندما تكون مستعداً، تبدأ الجلسة الثانية بـ 90 سؤالاً ومؤقت مستقل 153 دقيقة.', 'test.startSecond': 'بدء الجلسة الثانية', 'test.boundaryTitle': 'حدود الجلسة محمية', 'test.boundaryBody': 'بعد بدء الجلسة الثانية لا يمكنك العودة إلى إجابات الأولى.',
    'insights.readyGood': 'جاهزية جيدة', 'insights.readyProgress': 'تقدم مستمر', 'insights.readyFoundation': 'بناء الأسس', 'insights.index': 'مؤشر الجاهزية', 'insights.reportTitle': 'رؤية واضحة لمسار تعلمك', 'insights.reportSubtitle': 'نمط الدراسة والجاهزية للاختبار والمواضيع التي ينبغي تقديمها.', 'insights.target': 'الهدف المقترح للاختبارات التدريبية: 70٪ أو أكثر', 'insights.completedLessons': 'دروس مكتملة', 'insights.studyMinutes': 'دقائق التعلم', 'insights.averageTest': 'متوسط الاختبار', 'insights.activeDays': 'أيام نشطة', 'insights.rhythm': 'إيقاع الدراسة في آخر 7 أيام', 'insights.strengths': 'نقاط القوة', 'insights.strengthsSubtitle': 'مواضيع أداؤك فيها أكثر ثباتاً', 'insights.strengthsEmpty': 'ستظهر نقاط قوتك بعد إكمال أول اختبار.', 'insights.priorities': 'أولويات التركيز', 'insights.prioritiesSubtitle': 'مواضيع يكون لمراجعتها الأثر الأكبر', 'insights.prioritiesEmpty': 'لا توجد بيانات كافية لتحديد مواضيع التركيز بعد.', 'insights.masteryMap': 'خريطة إتقان المواضيع', 'insights.measurable': 'النتيجة القابلة للقياس', 'insights.smartNext': 'الخطوة الذكية التالية', 'insights.smartWeakness': 'أكمل درساً قصيراً أو اختباراً في «{subject}»؛ فهو يملك الآن أكبر مجال للنمو.', 'insights.smartStart': 'أكمل درساً ثم تدريباً سريعاً ليبني HaghDān توصية أكثر تخصيصاً.', 'insights.activeSummary': '{count} أيام نشطة خلال آخر سبعة أيام', 'insights.activeDay': 'يوم نشط', 'insights.consistencyTitle': 'الاستمرار أهم من حجم الدراسة', 'insights.consistencyBody': 'يوضح كل عمود الدروس والاختبارات المكتملة في ذلك اليوم.', 'insights.activityLabel': '{day}: {count} أنشطة', 'insights.assessments': '{count} تقييمات', 'insights.statusStrong': 'قوي', 'insights.statusDeveloping': 'قيد التطور', 'insights.statusFocus': 'يحتاج إلى تركيز', 'insights.statusUnmeasured': 'لم يقيّم بعد', 'insights.lessonCoverage': 'تغطية الدروس {count}٪',
  },
  es: {
    'common.loading': 'Preparando HaghDān…',
    'assistant.eyebrow': 'Asistente basado en el programa', 'assistant.title': 'Asistente de estudio con IA', 'assistant.subtitle': 'Pregunta sobre FLK1, FLK2, habilidades SQE2 o un concepto jurídico del programa instalado.', 'assistant.online': 'IA segura en línea', 'assistant.offline': 'Búsqueda local del programa', 'assistant.privacy': 'No introduzcas nombres, datos de casos, información confidencial o privilegiada, financiera, sanitaria, migratoria o penal.', 'assistant.suggestions': 'Prueba una pregunta', 'assistant.placeholder': 'Escribe una pregunta jurídica de estudio…', 'assistant.send': 'Enviar', 'assistant.empty': 'Elige una sugerencia o pregunta. Las respuestas son educativas y pueden ser incompletas.', 'assistant.error': 'El asistente en línea no está disponible. Comprueba la conexión o usa después la búsqueda local.', 'assistant.clear': 'Borrar chat', 'assistant.clearTitle': '¿Borrar este chat?', 'assistant.clearBody': 'Los mensajes solo se mantienen en esta pantalla y se eliminarán.', 'assistant.tooLong': 'Mantén la pregunta por debajo de 2.000 caracteres.', 'home.assistant': 'Pregunta al asistente de estudio', 'home.assistantBody': 'Obtén una explicación basada en el programa, método de examen y lecciones relacionadas.',
    'support.eyebrow': 'Ayuda y legal', 'support.title': 'Centro de soporte', 'support.subtitle': 'Obtén ayuda, informa de problemas, gestiona tu privacidad y consulta los documentos legales.', 'support.contact': 'Contactar con soporte', 'support.contactBody': 'Abre una solicitud sin publicar datos confidenciales del caso.', 'support.report': 'Informar de un error jurídico', 'support.reportBody': 'Señala una regla desactualizada, pregunta, traducción o problema de accesibilidad.', 'support.privacyRequest': 'Solicitud de privacidad', 'support.privacyRequestBody': 'Pregunta sobre privacidad o solicita borrar información de soporte del servidor.', 'support.privacy': 'Política de privacidad', 'support.terms': 'Términos y aviso legal', 'support.rights': 'Derechos de autor y marcas', 'support.delete': 'Eliminar cuenta y datos locales', 'support.deleteBody': 'Borra el perfil local, hash del PIN, progreso, favoritos, resultados y ajustes.', 'support.version': 'Versión de la app {version}', 'support.readInApp': 'Leer en la app', 'support.openWeb': 'Abrir copia pública web',
    'legal.updated': 'Actualizado el {date}',
    'auth.resetLocalTitle': '¿Eliminar la cuenta local?', 'auth.resetLocalBody': 'Si olvidaste el PIN, la única recuperación sin conexión es eliminar la cuenta y todo el progreso guardado en este dispositivo.', 'auth.resetLocalAction': 'Eliminar cuenta y datos',
    'auth.error.usernameLength': 'El usuario debe tener entre 3 y 24 caracteres.', 'auth.error.usernameCharacters': 'Usa solo letras, números, puntos y guiones bajos.', 'auth.error.usernameEdges': 'El usuario no puede empezar ni terminar con un punto o guión bajo.', 'auth.error.usernameRepeated': 'No se permiten puntos ni guiones bajos repetidos.', 'auth.error.pinFormat': 'El PIN debe tener entre 4 y 6 dígitos.', 'auth.error.invalidLogin': 'El usuario o el PIN no son correctos.', 'auth.error.displayName': 'El nombre visible debe tener al menos dos caracteres.', 'auth.error.pinMismatch': 'La confirmación del PIN no coincide.', 'auth.error.termsRequired': 'Acepta los términos para crear una cuenta.',
    'learn.noResultsTitle': 'No hay resultados en esta sección', 'learn.noResultsBody': 'Prueba otro término o elige una sección diferente.',
    'test.finishTitle': '¿Finalizar la prueba?', 'test.unanswered': 'Hay {count} preguntas sin responder.', 'test.continue': 'Continuar prueba', 'test.submitResult': 'Enviar resultado', 'test.sessionOneComplete': '{stage} · Primera sesión completada', 'test.breakTitle': 'Descanso entre sesiones', 'test.breakBody': 'Se han guardado {count} respuestas de la primera sesión. Cuando estés listo, la segunda comienza con 90 preguntas y un temporizador independiente de 153 minutos.', 'test.startSecond': 'Empezar segunda sesión', 'test.boundaryTitle': 'El límite de sesión está protegido', 'test.boundaryBody': 'Al comenzar la segunda sesión no podrás volver a las respuestas de la primera, como en la experiencia oficial FLK.',
    'insights.readyGood': 'Buena preparación', 'insights.readyProgress': 'Avanzando', 'insights.readyFoundation': 'Construyendo la base', 'insights.index': 'Índice de preparación', 'insights.reportTitle': 'Una visión clara de tu aprendizaje', 'insights.reportSubtitle': 'Ritmo de estudio, preparación para la prueba y materias a priorizar.', 'insights.target': 'Objetivo sugerido en pruebas: 70% o más', 'insights.completedLessons': 'Lecciones completadas', 'insights.studyMinutes': 'Minutos de aprendizaje', 'insights.averageTest': 'Media de pruebas', 'insights.activeDays': 'Días activos', 'insights.rhythm': 'Ritmo de estudio de los últimos 7 días', 'insights.strengths': 'Fortalezas', 'insights.strengthsSubtitle': 'Materias donde tu rendimiento es más constante', 'insights.strengthsEmpty': 'Tus fortalezas aparecerán después de la primera prueba.', 'insights.priorities': 'Prioridades', 'insights.prioritiesSubtitle': 'Materias donde un mayor repaso tendrá más efecto', 'insights.prioritiesEmpty': 'Aún no hay datos suficientes para identificar prioridades.', 'insights.masteryMap': 'Mapa de dominio por materia', 'insights.measurable': 'Puntuación medida', 'insights.smartNext': 'Siguiente paso inteligente', 'insights.smartWeakness': 'Completa una lección o prueba breve de «{subject}»; es la materia con mayor margen de mejora.', 'insights.smartStart': 'Completa una lección y una práctica rápida para que HaghDān cree una recomendación más personal.', 'insights.activeSummary': '{count} días activos en los últimos siete días', 'insights.activeDay': 'Día activo', 'insights.consistencyTitle': 'La constancia importa más que el volumen', 'insights.consistencyBody': 'Cada barra muestra las lecciones y pruebas completadas ese día.', 'insights.activityLabel': '{day}: {count} actividades', 'insights.assessments': '{count} evaluaciones', 'insights.statusStrong': 'Fuerte', 'insights.statusDeveloping': 'En desarrollo', 'insights.statusFocus': 'Necesita atención', 'insights.statusUnmeasured': 'Aún sin evaluar', 'insights.lessonCoverage': '{count}% de cobertura',
  },
};

const catalogs: Record<AppLanguage, Record<string, string>> = {
  fa: { ...fa, ...gameExtras.fa, ...interfaceExtras.fa },
  en: { ...en, ...interfaceExtras.en },
  zh: { ...zh, ...gameExtras.zh, ...interfaceExtras.zh },
  ar: { ...ar, ...gameExtras.ar, ...interfaceExtras.ar },
  es: { ...es, ...gameExtras.es, ...interfaceExtras.es },
};
const localeTags: Record<AppLanguage, string> = { fa: 'fa-IR', en: 'en-GB', zh: 'zh-CN', ar: 'ar', es: 'es-ES' };

type I18nValue = {
  language: AppLanguage;
  isRtl: boolean;
  locale: string;
  t: (key: string, values?: Record<string, string | number>) => string;
  formatNumber: (value: number) => string;
  legalTitle: (persian: string, english: string) => string;
  secondaryLegalTitle: (persian: string, english: string) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ language, children }: { language: AppLanguage; children: ReactNode }) {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = localeTags[language];
    document.documentElement.dir = languageOptions.find((item) => item.code === language)?.rtl ? 'rtl' : 'ltr';
  }, [language]);
  const value = useMemo<I18nValue>(() => {
    const option = languageOptions.find((item) => item.code === language) ?? languageOptions[0]!;
    const t = (key: string, values: Record<string, string | number> = {}) => {
      let result = catalogs[language][key] ?? en[key] ?? key;
      Object.entries(values).forEach(([name, replacement]) => { result = result.replaceAll(`{${name}}`, String(replacement)); });
      return result;
    };
    return {
      language,
      isRtl: option.rtl,
      locale: localeTags[language],
      t,
      formatNumber: (number) => number.toLocaleString(localeTags[language]),
      legalTitle: (persian, english) => language === 'fa' ? persian : english,
      secondaryLegalTitle: (persian, english) => {
        if (language === 'fa') return english;
        if (language === 'en') return '';
        const localized = localizeLegalText(persian, language);
        return localized === persian ? '' : localized;
      },
    };
  }, [language]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n must be used inside I18nProvider');
  return value;
}

export function LocalizedText({ style, ...props }: TextProps) {
  const { isRtl } = useI18n();
  const flattened = StyleSheet.flatten(style);
  const existingAlignment = flattened?.textAlign;
  const preserveAlignment = existingAlignment === 'center' || existingAlignment === 'justify';
  return <NativeText {...props} style={[style, { writingDirection: isRtl ? 'rtl' : 'ltr', textAlign: preserveAlignment ? existingAlignment : isRtl ? 'right' : 'left' }]} />;
}
