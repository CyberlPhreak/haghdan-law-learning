import type { Lesson, QuizQuestion } from './curriculum';

type SkillId = 'sqe2-interview' | 'sqe2-advocacy' | 'sqe2-analysis' | 'sqe2-research' | 'sqe2-writing' | 'sqe2-drafting';
type PracticeAreaId = 'dispute' | 'criminal' | 'property' | 'wills' | 'business';

type PracticeArea = {
  id: PracticeAreaId;
  fa: string;
  en: string;
  foundation: string;
  file: string;
  issues: string[];
};

type Skill = {
  id: SkillId;
  fa: string;
  en: string;
  minutes: number;
  format: 'شفاهی' | 'کتبی';
  task: string;
  criteria: string[];
};

export type Sqe2Station = {
  id: string;
  skillId: SkillId;
  practiceAreaId: PracticeAreaId;
  title: string;
  englishTitle: string;
  minutes: number;
  format: 'شفاهی' | 'کتبی';
  brief: string;
  task: string;
  issues: string[];
  criteria: string[];
  includesNegotiation: boolean;
};

const practiceAreas: PracticeArea[] = [
  {
    id: 'dispute', fa: 'حل اختلاف', en: 'Dispute Resolution',
    foundation: 'Contract، Tort، limitation، procedure، evidence، remedies، costs و settlement',
    file: 'یک شرکت کوچک درباره نقض قرارداد خدمات، خسارت ادعایی، اسناد ناقص و پیشنهاد settlement دستور می‌دهد.',
    issues: ['cause of action و defence', 'limitation و pre-action', 'evidence و privilege', 'remedy، costs و negotiation'],
  },
  {
    id: 'criminal', fa: 'دادرسی کیفری', en: 'Criminal Litigation',
    foundation: 'Criminal liability، police station advice، bail، evidence، trial، sentence و appeal',
    file: 'موکل پس از arrest و interview با اختلاف در evidence، سابقه احتمالی و تصمیم فوری درباره plea یا bail روبه‌رو است.',
    issues: ['offence، mens rea و defence', 'PACE safeguards و admissibility', 'bail، venue و case management', 'client instructions، ethics و next step'],
  },
  {
    id: 'property', fa: 'رویه املاک', en: 'Property Practice',
    foundation: 'Freehold/leasehold title، searches، lender، contract، completion، planning و tax',
    file: 'خریدار یک ملک leasehold با mortgage offer، restriction ثبتی، alteration و پاسخ ناقص seller مراجعه می‌کند.',
    issues: ['title و third-party rights', 'searches، enquiries و planning', 'lender duties و conflict', 'exchange، completion، SDLT/LTT و AML'],
  },
  {
    id: 'wills', fa: 'وصیت و اداره ترکه', en: 'Wills and Probate',
    foundation: 'Will validity، intestacy، grants، administration، IHT، trusts و family provision',
    file: 'خانواده درباره وصیت اصلاح‌شده، gift ناموفق، اختیار personal representative و ادعای وابسته اختلاف دارند.',
    issues: ['capacity، execution و interpretation', 'grant و authority', 'IHT، debts و distribution', '1975 Act claim، conflict و confidentiality'],
  },
  {
    id: 'business', fa: 'سازمان‌های تجاری', en: 'Business Organisations',
    foundation: 'Entity، governance، finance، insolvency، tax، Contract، AML و financial services',
    file: 'مدیران یک شرکت درباره قرارداد بزرگ، authority، تأمین مالی، conflict و source of funds راهنمایی می‌خواهند.',
    issues: ['authority و corporate approvals', 'directors duties و conflict', 'finance، security و insolvency risk', 'tax، AML، financial services و undertakings'],
  },
];

const skills: Skill[] = [
  {
    id: 'sqe2-interview', fa: 'مصاحبه و attendance note', en: 'Client interview and attendance note/legal analysis', minutes: 60, format: 'شفاهی',
    task: '۱۰ دقیقه آماده شوید، ۲۵ دقیقه مصاحبه کنید و سپس در ۲۵ دقیقه attendance note/legal analysis بنویسید.',
    criteria: ['پرسش و listening مؤثر', 'ارتباط مناسب و رفتار حرفه‌ای', 'client focus و trust', 'ثبت اطلاعات، advice و next steps', 'اعمال درست و جامع قانون و ethics'],
  },
  {
    id: 'sqe2-advocacy', fa: 'دفاع شفاهی', en: 'Advocacy', minutes: 60, format: 'شفاهی',
    task: 'در ۴۵ دقیقه bundle را آماده و در ۱۵ دقیقه submission را در برابر قاضی ارائه کنید.',
    criteria: ['زبان و رفتار مناسب', 'ساختار روشن و منطقی', 'استدلال persuasive', 'تعامل با دادگاه', 'facts کلیدی و اعمال درست و جامع قانون و ethics'],
  },
  {
    id: 'sqe2-analysis', fa: 'تحلیل پرونده', en: 'Case and matter analysis', minutes: 60, format: 'کتبی',
    task: 'در ۶۰ دقیقه گزارش partner را با legal analysis، advice موکل‌محور، risks، options و next steps تهیه کنید.',
    criteria: ['facts مرتبط', 'advice موکل‌محور', 'زبان روشن، دقیق و مختصر', 'اعمال درست و جامع قانون و ethics'],
  },
  {
    id: 'sqe2-research', fa: 'پژوهش حقوقی', en: 'Legal research', minutes: 60, format: 'کتبی',
    task: 'از منابع اولیه و ثانویه ارائه‌شده، منابع مرتبط را انتخاب و یک research note مستدل برای partner بنویسید.',
    criteria: ['انتخاب منابع مرتبط و current', 'reasoning و authority', 'advice موکل‌محور', 'زبان روشن، دقیق و مختصر', 'اعمال درست و جامع قانون و ethics'],
  },
  {
    id: 'sqe2-writing', fa: 'نگارش حقوقی', en: 'Legal writing', minutes: 30, format: 'کتبی',
    task: 'در ۳۰ دقیقه نامه یا ایمیل مناسب recipient بنویسید که facts، advice، action و deadline را روشن کند.',
    criteria: ['facts مرتبط', 'ساختار منطقی', 'client/recipient focus', 'زبان روشن و مناسب مخاطب', 'اعمال درست و جامع قانون و ethics'],
  },
  {
    id: 'sqe2-drafting', fa: 'تنظیم سند', en: 'Legal drafting', minutes: 45, format: 'کتبی',
    task: 'در ۴۵ دقیقه سند یا clauses خواسته‌شده را از precedent یا از ابتدا تنظیم و بازبینی کنید.',
    criteria: ['زبان روشن و دقیق', 'ساختار منطقی', 'اثر حقوقی درست', 'جامع‌بودن سند و شناسایی ethics'],
  },
];

const allowedAreas: Record<SkillId, PracticeAreaId[]> = {
  'sqe2-interview': ['property', 'wills'],
  'sqe2-advocacy': ['dispute', 'criminal'],
  'sqe2-analysis': ['dispute', 'criminal', 'property', 'wills', 'business'],
  'sqe2-research': ['dispute', 'criminal', 'property', 'wills', 'business'],
  'sqe2-writing': ['dispute', 'criminal', 'property', 'wills', 'business'],
  'sqe2-drafting': ['dispute', 'criminal', 'property', 'wills', 'business'],
};

const negotiationStationIds = new Set([
  'station-interview-property',
  'station-analysis-dispute',
  'station-writing-dispute',
]);

export const sqe2Stations: Sqe2Station[] = skills.flatMap((skill) => allowedAreas[skill.id].map((areaId) => {
  const area = practiceAreas.find((item) => item.id === areaId)!;
  const id = `station-${skill.id.replace('sqe2-', '')}-${area.id}`;
  const includesNegotiation = negotiationStationIds.has(id);
  return {
    id,
    skillId: skill.id,
    practiceAreaId: area.id,
    title: `${skill.fa} · ${area.fa}`,
    englishTitle: `${skill.en} · ${area.en}`,
    minutes: skill.minutes,
    format: skill.format,
    brief: area.file,
    task: skill.task,
    issues: [
      ...area.issues,
      area.foundation,
      ...(includesNegotiation ? ['Negotiation: objectives, BATNA, authority, opening position, concessions, settlement terms and ethics'] : []),
    ],
    criteria: skill.criteria,
    includesNegotiation,
  };
}));

const stationQuiz = (station: Sqe2Station): QuizQuestion[] => [
  {
    id: `${station.id}-q1`,
    prompt: 'پیش از شروع این ایستگاه، بهترین اقدام چیست؟',
    answers: ['دستور، مخاطب، خروجی و زمان را مشخص و سپس file را issue-map کنید.', 'نوشتن پاسخ نهایی بدون planning', 'حذف facts نامطلوب', 'فرض‌کردن facts گمشده', 'تمرکز فقط بر واژگان تخصصی'],
    correctIndex: 0,
    explanation: 'Planning باید instruction، recipient، deliverable، chronology، issues و تقسیم زمان را روشن کند.',
  },
  {
    id: `${station.id}-q2`,
    prompt: 'در self-marking کدام معیار باید هم‌زمان بررسی شود؟',
    answers: ['فقط طول پاسخ', 'فقط تعداد authorities', 'skills، application of law، client focus و ethics', 'فقط spelling', 'فقط نتیجه نهایی'],
    correctIndex: 2,
    explanation: 'SRA عملکرد SQE2 را بر skills و application of law می‌سنجد و ethics pervasive است.',
  },
  {
    id: `${station.id}-q3`,
    prompt: 'اگر یک fact تعیین‌کننده در file موجود نباشد، بهترین رویکرد چیست؟',
    answers: ['آن را به نفع موکل فرض کنید.', 'عدم قطعیت را مشخص، نتیجه را مشروط و next step برای اثبات fact پیشنهاد کنید.', 'موضوع را حذف کنید.', 'قانون را بدون application تکرار کنید.', 'به موکل نتیجه قطعی بدهید.'],
    correctIndex: 1,
    explanation: 'پاسخ حرفه‌ای نباید fact بسازد؛ باید uncertainty و اقدام لازم برای تکمیل evidence را روشن کند.',
  },
  {
    id: `${station.id}-q4`,
    prompt: 'بازبینی نهایی باید به چه نتیجه‌ای برسد؟',
    answers: ['یک متن طولانی‌تر', 'خروجی usable، درست، جامع، متناسب با مخاطب و قابل اقدام', 'حذف advice عملی', 'پنهان‌کردن risk', 'نادیده‌گرفتن ethics مگر در instruction آمده باشد'],
    correctIndex: 1,
    explanation: 'خروجی SQE2 باید برای client، partner یا court قابل استفاده و از نظر law، facts، ethics و next steps کامل باشد.',
  },
];

export const sqe2StationLessons: Lesson[] = sqe2Stations.map((station) => ({
  id: station.id,
  pathwayId: station.skillId,
  title: station.title,
  englishTitle: station.englishTitle,
  duration: station.minutes,
  summary: `${station.format} · ${station.minutes} دقیقه · شبیه‌سازی زمینه رسمی SRA`,
  sections: [
    {
      title: 'فرمت رسمی و مأموریت',
      body: station.task,
      callout: `${station.format} · زمان رسمی ${station.minutes} دقیقه. ethics در صورت وجود flag نمی‌شود و باید خودتان آن را شناسایی کنید.`,
      bullets: station.criteria,
      termFa: 'ایستگاه مهارتی',
      termEn: 'Legal skills assessment',
    },
    {
      title: 'پرونده تمرینی',
      body: station.brief,
      bullets: station.issues,
      checklist: ['هدف client یا instruction partner را یک‌جمله‌ای بنویسید.', 'chronology، parties و documents را فهرست کنید.', 'facts موافق، مخالف و گمشده را جدا کنید.', 'law، procedure، remedy و ethics را issue-map کنید.'],
      termFa: 'پرونده شبیه‌سازی‌شده',
      termEn: 'Simulated case file',
    },
    {
      title: 'اجرای زمان‌دار',
      body: 'تمرین را بدون توقف و در زمان رسمی اجرا کنید. برای planning، تولید خروجی و final review زمان مشخص کنار بگذارید.',
      example: 'پاسخ باید مستقیماً instruction را انجام دهد؛ قانون انتزاعی بدون application، یا نتیجه بدون reasons، نمره کامل نمی‌گیرد.',
      checklist: ['Planning کوتاه', 'ساختار و headings مناسب', 'application عنصر به عنصر', 'client/recipient focus', 'final review برای accuracy، completeness و ethics'],
      termFa: 'اجرای زمان‌دار',
      termEn: 'Timed performance',
    },
    {
      title: 'Rubric خودارزیابی',
      body: 'هر معیار را از A تا F ارزیابی و برای هر ضعف یک اصلاح مشخص بنویسید. skills و application of law در نتیجه کلی SQE2 وزن برابر دارند.',
      bullets: station.criteria,
      checklist: ['آیا همه facts مهم آمده‌اند؟', 'آیا law درست و جامع اعمال شده است؟', 'آیا advice برای هدف client مفید است؟', ...(station.includesNegotiation ? ['Check authority, objectives, concessions, settlement terms and implementation risk.'] : []), 'آیا مسئله ethical شناسایی و حل شده است؟', 'آیا خروجی روشن، مختصر و قابل اقدام است؟'],
      source: 'Mapped to the SRA SQE2 Assessment Specification applicable from 1 September 2025 and published 2026 transition changes.',
      callout: 'این scenario تألیفی حق‌دان است و سؤال رسمی یا past paper نیست.',
      termFa: 'معیار ارزیابی',
      termEn: 'Assessment criteria',
    },
  ],
  quiz: stationQuiz(station),
}));

export const stationLessonIdsForSkill = (skillId: string) => sqe2Stations.filter((station) => station.skillId === skillId).map((station) => station.id);
