import type { SqeStage } from './sqe';

export const sraSpecification = {
  checkedAt: '2026-07-23',
  currentLabel: 'SRA 2025/26 · برای ارزیابی‌های تا ۳۱ اوت ۲۰۲۶',
  nextLabel: 'SRA 2026/27 · قابل اعمال از ۱ سپتامبر ۲۰۲۶',
  lawCutOff: 'قانون و رویه قابل آزمون چهار ماه تقویمی پیش از نخستین ارزیابی هر پنجره تثبیت می‌شود.',
  independentNotice: 'حق‌دان مستقل است و مورد تأیید SRA، Kaplan SQE یا Pearson VUE نیست.',
  urls: {
    sqe1: 'https://sqe.sra.org.uk/assessments/sqe1-assessments/sqe1-specification',
    flk1: 'https://sqe.sra.org.uk/assessments/sqe1-assessments/sqe1-specification/flk1',
    flk2: 'https://sqe.sra.org.uk/assessments/sqe1-assessments/sqe1-specification/flk2',
    blueprint: 'https://sqe.sra.org.uk/assessments/sqe1-assessments/sqe1-specification/sqe1-annex4',
    sqe2: 'https://sqe.sra.org.uk/assessments/sqe2-assessments/sqe2-specification',
    sqe2Assessments: 'https://sqe.sra.org.uk/assessments/sqe2-assessments/sqe2-specification/sqe2-assessments',
    changes2026: 'https://sqe.sra.org.uk/assessments/sqe1-assessments/sqe1-specification/sqe-changes-sept-2026',
  },
} as const;

export type BlueprintGroup = {
  id: string;
  titleFa: string;
  subjectIds: string[];
  minPercent: number;
  maxPercent: number;
};

export const sqe1Blueprint: Record<SqeStage, BlueprintGroup[]> = {
  FLK1: [
    { id: 'business', titleFa: 'حقوق و رویه کسب‌وکار', subjectIds: ['flk1-business'], minPercent: 14, maxPercent: 20 },
    { id: 'dispute', titleFa: 'حل اختلاف', subjectIds: ['flk1-dispute'], minPercent: 14, maxPercent: 20 },
    { id: 'contract', titleFa: 'حقوق قرارداد', subjectIds: ['flk1-contract'], minPercent: 14, maxPercent: 20 },
    { id: 'tort', titleFa: 'مسئولیت مدنی', subjectIds: ['flk1-tort'], minPercent: 14, maxPercent: 20 },
    { id: 'system', titleFa: 'نظام حقوقی، عمومی و اروپایی', subjectIds: ['flk1-system', 'flk1-public'], minPercent: 14, maxPercent: 20 },
    { id: 'services', titleFa: 'خدمات حقوقی', subjectIds: ['flk1-services'], minPercent: 12, maxPercent: 16 },
  ],
  FLK2: [
    { id: 'property', titleFa: 'رویه املاک، همراه حساب‌های وکلا', subjectIds: ['flk2-property', 'flk2-accounts'], minPercent: 14, maxPercent: 20 },
    { id: 'wills', titleFa: 'وصیت و اداره ترکه، همراه حساب‌های وکلا', subjectIds: ['flk2-wills', 'flk2-accounts'], minPercent: 14, maxPercent: 20 },
    { id: 'land', titleFa: 'حقوق زمین', subjectIds: ['flk2-land'], minPercent: 14, maxPercent: 20 },
    { id: 'trusts', titleFa: 'حقوق تراست', subjectIds: ['flk2-trusts'], minPercent: 14, maxPercent: 20 },
    { id: 'crime', titleFa: 'مسئولیت کیفری', subjectIds: ['flk2-crime'], minPercent: 14, maxPercent: 20 },
    { id: 'criminal-practice', titleFa: 'حقوق و رویه کیفری', subjectIds: ['flk2-criminal-practice'], minPercent: 14, maxPercent: 20 },
  ],
};

// Exact 180-question targets stay inside Annex 4 ranges. Solicitors Accounts is
// integrated across the Property and Wills classifications, rather than treated
// as an independent blueprint classification.
export const examSubjectTargets: Record<SqeStage, Record<string, number>> = {
  FLK1: {
    'flk1-business': 31,
    'flk1-dispute': 31,
    'flk1-contract': 30,
    'flk1-tort': 30,
    'flk1-system': 15,
    'flk1-public': 15,
    'flk1-services': 28,
  },
  FLK2: {
    'flk2-property': 27,
    'flk2-wills': 27,
    'flk2-accounts': 6,
    'flk2-land': 30,
    'flk2-trusts': 30,
    'flk2-crime': 30,
    'flk2-criminal-practice': 30,
  },
};

export const allocateBlueprintCounts = (stage: SqeStage, total: number) => {
  const safeTotal = Number.isFinite(total) ? Math.max(0, Math.min(180, Math.floor(total))) : 0;
  const targets = examSubjectTargets[stage];
  const entries = Object.entries(targets).map(([subjectId, fullCount], order) => {
    const exact = (fullCount / 180) * safeTotal;
    return { subjectId, order, count: Math.floor(exact), remainder: exact - Math.floor(exact) };
  });
  let remaining = safeTotal - entries.reduce((sum, item) => sum + item.count, 0);
  [...entries]
    .sort((a, b) => b.remainder - a.remainder || a.order - b.order)
    .forEach((item) => {
      if (remaining > 0) {
        item.count += 1;
        remaining -= 1;
      }
    });
  return Object.fromEntries(entries.map(({ subjectId, count }) => [subjectId, count]));
};

export const september2026Changes = [
  'هر rate، threshold یا مبلغ exemption/relief مالیاتی که باید اعمال شود در سؤال ارائه خواهد شد.',
  'پوشش money laundering در SQE2 از سپتامبر ۲۰۲۶ علاوه بر Business در Property Practice نیز صریحاً قابل آزمون است.',
  'معیار Correct and Comprehensive Application of Law و راهنمای ایستگاه Legal Research روشن‌تر شده است.',
  'در SQE2 دسته بازخورد جداگانه‌ای برای Ethics and Professional Conduct ایجاد می‌شود؛ قالب آزمون تغییر نمی‌کند.',
  'The detailed FLK clarifications for business, dispute resolution, contract, property, wills and probate, trusts, and criminal practice are mapped to named learning units.',
  'Negotiation practice is included within interview/attendance note, case and matter analysis, and legal writing, matching the permitted SQE2 assessment routes.',
] as const;
