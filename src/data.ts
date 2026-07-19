import type { ComponentProps } from 'react';
import type { Feather } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof Feather>['name'];
export type LessonState = 'complete' | 'current' | 'locked';

export type Lesson = {
  id: string;
  title: string;
  englishTitle: string;
  duration: number;
  state: LessonState;
};

export type Pathway = {
  id: string;
  title: string;
  englishTitle: string;
  description: string;
  icon: IconName;
  color: string;
  softColor: string;
  progress: number;
  lessonsCount: number;
  level: string;
  lessons: Lesson[];
};

export const pathways: Pathway[] = [
  {
    id: 'foundations',
    title: 'مبانی حقوق انگلستان و ولز',
    englishTitle: 'Foundations of English Law',
    description: 'از ساختار دادگاه‌ها تا رأی سابق؛ تصویری روشن از اینکه نظام حقوقی چگونه کار می‌کند.',
    icon: 'book-open',
    color: '#4B3DB8',
    softColor: '#ECE9FF',
    progress: 42,
    lessonsCount: 8,
    level: 'مقدماتی',
    lessons: [
      { id: 'legal-systems', title: 'قانون از کجا می‌آید؟', englishTitle: 'Sources of law', duration: 6, state: 'complete' },
      { id: 'parliament', title: 'پارلمان و قانون‌گذاری', englishTitle: 'Parliament & legislation', duration: 7, state: 'complete' },
      { id: 'courts-intro', title: 'نقش دادگاه‌ها', englishTitle: 'The role of courts', duration: 5, state: 'complete' },
      { id: 'court-hierarchy', title: 'سلسله‌مراتب دادگاه‌ها', englishTitle: 'Court hierarchy', duration: 7, state: 'current' },
      { id: 'precedent', title: 'رأی سابق در عمل', englishTitle: 'Precedent in practice', duration: 8, state: 'locked' },
      { id: 'civil-criminal', title: 'حقوق مدنی یا کیفری؟', englishTitle: 'Civil or criminal?', duration: 6, state: 'locked' },
      { id: 'legal-people', title: 'چه کسی چه کاری انجام می‌دهد؟', englishTitle: 'Legal professionals', duration: 7, state: 'locked' },
      { id: 'recap', title: 'جمع‌بندی و سناریو', englishTitle: 'Applied recap', duration: 9, state: 'locked' },
    ],
  },
  {
    id: 'immigration',
    title: 'مهاجرت و پناهندگی',
    englishTitle: 'Immigration & Asylum',
    description: 'واژگان، فرایندها و تصمیم‌هایی که برای درک پرونده‌های مهاجرتی لازم است.',
    icon: 'globe',
    color: '#087F78',
    softColor: '#DDF4F0',
    progress: 18,
    lessonsCount: 12,
    level: 'مقدماتی تا متوسط',
    lessons: [],
  },
  {
    id: 'employment',
    title: 'حقوق کار و محیط کار',
    englishTitle: 'Employment Law',
    description: 'قرارداد کار، تبعیض، اخراج و مسیرهای حل اختلاف را به زبان ساده بشناسید.',
    icon: 'briefcase',
    color: '#B33C58',
    softColor: '#FCE8ED',
    progress: 0,
    lessonsCount: 10,
    level: 'مقدماتی',
    lessons: [],
  },
  {
    id: 'housing',
    title: 'اجاره‌نشینی و مسکن',
    englishTitle: 'Housing & Tenancy',
    description: 'مفاهیم پایه‌ی قرارداد اجاره، ودیعه، تعمیرات و پایان اجاره.',
    icon: 'home',
    color: '#B9770E',
    softColor: '#FFF1C8',
    progress: 0,
    lessonsCount: 9,
    level: 'کاربردی',
    lessons: [],
  },
  {
    id: 'police',
    title: 'برخورد با پلیس',
    englishTitle: 'Police Encounters',
    description: 'مفاهیم کلیدی درباره‌ی توقف، بازداشت، مصاحبه و دسترسی به مشاوره.',
    icon: 'shield',
    color: '#2F5E9E',
    softColor: '#E4EFFD',
    progress: 0,
    lessonsCount: 7,
    level: 'کاربردی',
    lessons: [],
  },
  {
    id: 'contracts',
    title: 'قراردادها در زندگی روزمره',
    englishTitle: 'Everyday Contracts',
    description: 'پیشنهاد، پذیرش، شروط و نقض قرارداد را با مثال‌های روزمره یاد بگیرید.',
    icon: 'file-text',
    color: '#675027',
    softColor: '#F3EAD7',
    progress: 0,
    lessonsCount: 11,
    level: 'مقدماتی',
    lessons: [],
  },
];

export const lessonPages = [
  {
    kicker: 'درس ۴ از ۸',
    title: 'سلسله‌مراتب دادگاه‌ها یعنی چه؟',
    body: 'دادگاه‌های انگلستان و ولز در یک ساختار چندسطحی قرار دارند. هر سطح، نوع مشخصی از پرونده را بررسی می‌کند و دادگاه‌های بالاتر می‌توانند تصمیم دادگاه‌های پایین‌تر را بازبینی کنند.',
    callout: 'ساختار دادگاه‌ها کمک می‌کند بدانیم یک پرونده از کجا شروع می‌شود و اعتراض به تصمیم در کجا بررسی خواهد شد.',
    termFa: 'سلسله‌مراتب دادگاه‌ها',
    termEn: 'Court hierarchy',
  },
  {
    kicker: 'ایده‌ی کلیدی',
    title: 'چرا جایگاه دادگاه مهم است؟',
    body: 'جایگاه دادگاه فقط درباره‌ی تجدیدنظر نیست. در نظام مبتنی بر رأی سابق، تصمیم یک دادگاه بالاتر می‌تواند راهنمای الزام‌آور دادگاه‌های پایین‌تر در پرونده‌های مشابه باشد.',
    callout: 'همه‌ی بخش‌های یک رأی ارزش یکسانی ندارند؛ استدلال اصلی که برای تصمیم لازم بوده، اهمیت ویژه‌ای دارد.',
    termFa: 'رأی سابق قضایی',
    termEn: 'Judicial precedent',
  },
];

export const lessonQuiz = {
  question: 'کدام گزینه بهترین توضیح برای «رأی سابق قضایی» است؟',
  answers: [
    'تصمیم دادگاه بالاتر می‌تواند مسیر تصمیم دادگاه پایین‌تر را در پرونده‌ی مشابه تعیین کند.',
    'هر قاضی می‌تواند بدون توجه به تصمیم‌های قبلی، قانون تازه‌ای ایجاد کند.',
    'تنها تصمیم‌های پارلمان برای دادگاه‌ها قابل استفاده‌اند.',
  ],
  correctIndex: 0,
  explanation: 'در نظام حقوقی انگلستان و ولز، دادگاه‌های پایین‌تر معمولاً باید از اصول حقوقی الزام‌آورِ دادگاه‌های بالاتر پیروی کنند؛ البته شباهت واقعی پرونده‌ها و بخش الزام‌آور رأی اهمیت دارد.',
};

export const reviewItems = [
  { title: 'رأی سابق قضایی', english: 'Judicial precedent', due: 'اکنون', strength: 38 },
  { title: 'قانون موضوعه', english: 'Legislation', due: 'امروز', strength: 62 },
  { title: 'صلاحیت دادگاه', english: 'Jurisdiction', due: 'امروز', strength: 74 },
  { title: 'بار اثبات', english: 'Burden of proof', due: 'فردا', strength: 81 },
];
