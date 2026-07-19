import type { ComponentProps } from 'react';
import type { Feather } from '@expo/vector-icons';

import { sqeLessons, sqePathways } from './sqe';

export type IconName = ComponentProps<typeof Feather>['name'];
export type LessonSection = { title: string; body: string; callout?: string; bullets?: string[]; example?: string; checklist?: string[]; source?: string; termFa: string; termEn: string };
export type QuizQuestion = { id: string; prompt: string; answers: string[]; correctIndex: number; explanation: string };
export type Lesson = { id: string; pathwayId: string; title: string; englishTitle: string; duration: number; summary: string; sections: LessonSection[]; quiz: QuizQuestion[] };
export type Pathway = { id: string; track?: 'FLK1' | 'FLK2' | 'SQE2' | 'EVERYDAY'; title: string; englishTitle: string; description: string; icon: IconName; color: string; softColor: string; level: string; lessonIds: string[] };

const q = (id: string, prompt: string, answers: string[], correctIndex: number, explanation: string): QuizQuestion =>
  ({ id, prompt, answers, correctIndex, explanation });

const l = (
  pathwayId: string,
  id: string,
  title: string,
  englishTitle: string,
  duration: number,
  summary: string,
  first: LessonSection,
  second: LessonSection,
  quiz: QuizQuestion[],
): Lesson => ({ pathwayId, id, title, englishTitle, duration, summary, sections: [first, second], quiz });

const everydayPathways: Pathway[] = [
  { id: 'foundations', title: 'مبانی حقوق انگلستان و ولز', englishTitle: 'Foundations of English Law', description: 'منابع قانون، ساختار دادگاه‌ها و تفاوت پرونده‌های مدنی و کیفری.', icon: 'book-open', color: '#4B3DB8', softColor: '#ECE9FF', level: 'مقدماتی', lessonIds: ['sources-of-law', 'court-hierarchy', 'civil-or-criminal'] },
  { id: 'housing', title: 'اجاره‌نشینی و مسکن', englishTitle: 'Housing & Tenancy', description: 'قرارداد اجاره، ودیعه، تعمیرات و مسیر قانونی پایان اجاره.', icon: 'home', color: '#A65D00', softColor: '#FFF1D6', level: 'کاربردی', lessonIds: ['tenancy-agreement', 'tenancy-deposit', 'repairs-and-eviction'] },
  { id: 'employment', title: 'حقوق کار و محیط کار', englishTitle: 'Employment Law', description: 'شرایط استخدام، تبعیض و اصول پایه اخراج منصفانه.', icon: 'briefcase', color: '#A83454', softColor: '#FCE8EE', level: 'مقدماتی', lessonIds: ['employment-status', 'workplace-discrimination', 'fair-dismissal'] },
  { id: 'immigration', title: 'مهاجرت و پناهندگی', englishTitle: 'Immigration & Asylum', description: 'تصمیم‌های مهاجرتی، ادعای پناهندگی و حق اعتراض.', icon: 'globe', color: '#08756E', softColor: '#DDF4F0', level: 'مقدماتی تا متوسط', lessonIds: ['immigration-decisions', 'asylum-basics', 'appeal-and-review'] },
  { id: 'police', title: 'برخورد با پلیس', englishTitle: 'Police Encounters', description: 'توقف و بازرسی، بازداشت و حقوق فرد در مصاحبه پلیس.', icon: 'shield', color: '#28598F', softColor: '#E4EFFD', level: 'کاربردی', lessonIds: ['stop-and-search', 'arrest-rights', 'police-interview'] },
];

const everydayLessons: Lesson[] = [
  l('foundations', 'sources-of-law', 'قانون از کجا می‌آید؟', 'Sources of law', 7, 'با مهم‌ترین منابع قانون و نقش هرکدام آشنا شوید.',
    { title: 'قانون‌گذاری پارلمان', body: 'پارلمان قوانین اصلی را تصویب می‌کند. مقررات تکمیلی و تصمیم دادگاه‌ها نیز بر شیوه اجرای آن اثر می‌گذارند.', callout: 'دادگاه متن قانون را در پرونده واقعی تفسیر و اجرا می‌کند.', termFa: 'قانون موضوعه', termEn: 'Legislation' },
    { title: 'قانون ساخته‌شده در دادگاه‌ها', body: 'اصول حقوقی دادگاه‌های بالاتر می‌توانند برای دادگاه‌های پایین‌تر الزام‌آور باشند. جایگاه دادگاه و استدلال ضروری رأی مهم است.', termFa: 'رأی سابق قضایی', termEn: 'Judicial precedent' },
    [q('sources-1', 'کدام نهاد قوانین اصلی را تصویب می‌کند؟', ['پارلمان', 'هر دادگاه بدوی', 'شورای محلی'], 0, 'Acts of Parliament توسط پارلمان تصویب می‌شوند.'), q('sources-2', 'نقش معمول دادگاه چیست؟', ['لغو خودکار قانون', 'تفسیر قانون در پرونده', 'نوشتن قانون اساسی'], 1, 'دادگاه قانون را در زمینه پرونده تفسیر می‌کند.')]),
  l('foundations', 'court-hierarchy', 'سلسله‌مراتب دادگاه‌ها', 'Court hierarchy', 8, 'ببینید پرونده‌ها کجا آغاز می‌شوند و اعتراض چگونه بالا می‌رود.',
    { title: 'چرا سطح دادگاه مهم است؟', body: 'نوع پرونده، ارزش یا شدت آن و مرحله رسیدگی تعیین می‌کند پرونده در کدام دادگاه شنیده شود.', callout: 'مسیر دقیق به موضوع و مقررات شکلی بستگی دارد.', termFa: 'صلاحیت', termEn: 'Jurisdiction' },
    { title: 'تجدیدنظر با رسیدگی دوباره فرق دارد', body: 'تجدیدنظر معمولاً بررسی می‌کند آیا تصمیم قبلی از نظر حقوقی یا شکلی اشتباه بوده است؛ نه اینکه همیشه همه مدارک از ابتدا شنیده شود.', termFa: 'تجدیدنظر', termEn: 'Appeal' },
    [q('courts-1', 'صلاحیت دادگاه یعنی چه؟', ['قدرت قانونی رسیدگی', 'ساختمان دادگاه', 'نظر شخصی قاضی'], 0, 'Jurisdiction یعنی اختیار قانونی رسیدگی.'), q('courts-2', 'تجدیدنظر معمولاً بر چه تمرکز دارد؟', ['محبوبیت رأی', 'اشتباه حقوقی یا شکلی', 'شروع پرونده تازه'], 1, 'وجود خطای قابل رسیدگی بررسی می‌شود.')]),
  l('foundations', 'civil-or-criminal', 'مدنی یا کیفری؟', 'Civil or criminal?', 7, 'طرفین، هدف و معیار اثبات دو نوع پرونده را مقایسه کنید.',
    { title: 'پرونده مدنی', body: 'دعوای مدنی معمولاً اختلاف اشخاص یا سازمان‌ها درباره قرارداد، خسارت یا مسکن است و خواهان یک راه‌حل مدنی می‌خواهد.', termFa: 'خواهان و خوانده', termEn: 'Claimant and defendant' },
    { title: 'پرونده کیفری', body: 'دادستان ادعا می‌کند متهم مرتکب جرم شده و باید اتهام را فراتر از شک معقول ثابت کند.', callout: 'نام طرفین و معیار اثبات سرنخ‌های مهم‌اند.', termFa: 'فراتر از شک معقول', termEn: 'Beyond reasonable doubt' },
    [q('civil-1', 'چه کسی دعوای مدنی را آغاز می‌کند؟', ['خواهان', 'هیئت منصفه', 'دادستان در همه موارد'], 0, 'Claimant درخواست راه‌حل مدنی می‌کند.'), q('civil-2', 'معیار اثبات کیفری چیست؟', ['توازن احتمالات', 'فراتر از شک معقول', 'احتمال ضعیف'], 1, 'اتهام باید فراتر از شک معقول ثابت شود.')]),
  l('housing', 'tenancy-agreement', 'شناخت قرارداد اجاره', 'Understanding a tenancy', 8, 'تعهدات اصلی موجر و مستأجر را از متن قرارداد جدا کنید.',
    { title: 'قرارداد فقط اجاره‌بها نیست', body: 'مدت، مبلغ، پرداخت، تعمیرات و استفاده از ملک در قرارداد می‌آیند. برخی حقوق قانونی حتی اگر نوشته نشده باشند وجود دارند.', termFa: 'قرارداد اجاره', termEn: 'Tenancy agreement' },
    { title: 'مدرک نگه دارید', body: 'قرارداد، رسید، گزارش وضعیت اولیه، عکس و مکاتبات را نگه دارید.', callout: 'ارتباط مهم را کتبی و محترمانه ثبت کنید.', termFa: 'گزارش وضعیت ملک', termEn: 'Inventory' },
    [q('tenancy-1', 'چه چیزی می‌تواند بیرون از متن قرارداد هم وجود داشته باشد؟', ['حقوق قانونی', 'حق حذف همه تعهدات', 'حق نپرداختن همیشگی'], 0, 'بعضی حقوق به موجب قانون اعمال می‌شوند.'), q('tenancy-2', 'چه مدرکی برای وضعیت ملک مفید است؟', ['گزارش و عکس تاریخ‌دار', 'حدس شفاهی', 'پیام حذف‌شده'], 0, 'مدارک هم‌زمان روشن‌ترند.')]),
  l('housing', 'tenancy-deposit', 'ودیعه و طرح‌های حمایتی', 'Tenancy deposits', 7, 'هدف حفاظت از ودیعه و اطلاعات لازم را بشناسید.',
    { title: 'حفاظت از ودیعه', body: 'در بسیاری از اجاره‌های خصوصی واجد شرایط، موجر باید ودیعه را در طرح مورد تأیید حفاظت و اطلاعات مقرر را ارائه کند.', termFa: 'طرح حفاظت از ودیعه', termEn: 'Tenancy deposit scheme' },
    { title: 'اختلاف پایان اجاره', body: 'طرح حفاظت می‌تواند فرایند حل اختلاف داشته باشد. قرارداد، موجودی اولیه، عکس و رسید هزینه‌ها مهم‌اند.', callout: 'کسر باید قابل توضیح و متناسب باشد.', termFa: 'حل اختلاف', termEn: 'Dispute resolution' },
    [q('deposit-1', 'هدف طرح حفاظت چیست؟', ['حفاظت و حل اختلاف', 'تعیین مالیات', 'صدور ویزا'], 0, 'طرح از پول ودیعه حفاظت می‌کند.'), q('deposit-2', 'چه مدرکی مفیدتر است؟', ['گزارش وضعیت و عکس', 'حدس', 'پیام حذف‌شده'], 0, 'مقایسه آغاز و پایان اجاره مهم است.')]),
  l('housing', 'repairs-and-eviction', 'تعمیرات و پایان اجاره', 'Repairs and ending a tenancy', 9, 'مشکل را ثبت و تفاوت اخطار با حکم را درک کنید.',
    { title: 'گزارش تعمیرات', body: 'مشکل را سریع، روشن و کتبی گزارش کنید. موجر برای بخش‌هایی از ساختمان و تأسیسات مسئولیت قانونی دارد.', termFa: 'عدم ایمنی', termEn: 'Disrepair' },
    { title: 'اخطار پایان کار نیست', body: 'اخطار لزوماً الزام فوری به ترک ملک نیست؛ در بسیاری موارد مراحل قانونی و حکم دادگاه لازم است.', callout: 'در برابر اخطار سریع مشاوره بگیرید.', termFa: 'حکم تصرف', termEn: 'Possession order' },
    [q('repairs-1', 'گام نخست برای تعمیرات چیست؟', ['گزارش کتبی', 'نادیده‌گرفتن', 'درگیری'], 0, 'ثبت کتبی مسیر پیگیری را روشن می‌کند.'), q('repairs-2', 'آیا هر اخطار یعنی تخلیه فوری؟', ['بله', 'خیر، مراحل دیگری ممکن است لازم باشد', 'فقط آخر هفته'], 1, 'اخطار معمولاً بخشی از فرایند است.')]),
  l('employment', 'employment-status', 'وضعیت و شرایط استخدام', 'Employment status and terms', 8, 'عنوان قراردادی را با واقعیت رابطه کاری مقایسه کنید.',
    { title: 'عنوان تعیین‌کننده نیست', body: 'حقوق می‌تواند به employee، worker یا self-employed بودن بستگی داشته باشد. واقعیت کنترل، تعهد و استقلال بررسی می‌شود.', termFa: 'وضعیت استخدامی', termEn: 'Employment status' },
    { title: 'شرایط کتبی', body: 'حقوق، ساعات، محل کار و مرخصی باید روشن باشند. فیش حقوقی و سوابق شیفت را نگه دارید.', termFa: 'بیانیه شرایط', termEn: 'Written statement' },
    [q('status-1', 'برای وضعیت استخدامی چه مهم است؟', ['واقعیت رابطه کاری', 'فقط عنوان', 'لباس کار'], 0, 'نحوه واقعی کار بررسی می‌شود.'), q('status-2', 'مدرک اختلاف ساعات چیست؟', ['سوابق شیفت و فیش', 'حدس', 'حذف تقویم'], 0, 'سوابق پرداخت و زمان مفیدند.')]),
  l('employment', 'workplace-discrimination', 'تبعیض در محیط کار', 'Workplace discrimination', 9, 'رفتار ممنوع و ویژگی‌های حمایت‌شده را بشناسید.',
    { title: 'ویژگی‌های حمایت‌شده', body: 'قانون از افراد در برابر تبعیض مرتبط با ویژگی‌هایی مانند نژاد، مذهب، جنسیت، معلولیت و سن حمایت می‌کند.', termFa: 'ویژگی حمایت‌شده', termEn: 'Protected characteristic' },
    { title: 'مستقیم و غیرمستقیم', body: 'تبعیض غیرمستقیم می‌تواند از قاعده‌ای ظاهراً یکسان ناشی شود که گروهی را در موقعیت نامطلوب ویژه قرار می‌دهد.', callout: 'هر رفتار ناعادلانه از نظر حقوقی تبعیض نیست.', termFa: 'تبعیض غیرمستقیم', termEn: 'Indirect discrimination' },
    [q('discrimination-1', 'ادعا نیازمند ارتباط با چیست؟', ['ویژگی حمایت‌شده', 'سلیقه', 'هر تصمیم'], 0, 'ارتباط قانونی باید بررسی شود.'), q('discrimination-2', 'قاعده یکسان با زیان گروهی ممکن است چیست؟', ['تبعیض غیرمستقیم', 'همیشه جرم', 'بی‌اهمیت'], 0, 'قاعده عمومی می‌تواند اثر نامتناسب داشته باشد.')]),
  l('employment', 'fair-dismissal', 'اصول اخراج منصفانه', 'Fair dismissal basics', 9, 'دلیل و فرایند اخراج را جداگانه بررسی کنید.',
    { title: 'دلیل قابل قبول', body: 'رفتار، توانایی، افزونگی نیرو یا محدودیت قانونی ممکن است دلیل بالقوه منصفانه باشند.', termFa: 'اخراج ناعادلانه', termEn: 'Unfair dismissal' },
    { title: 'فرایند منصفانه', body: 'تحقیق، اطلاع، فرصت پاسخ و اعتراض داخلی اهمیت دارند. برخی حقوق به مدت خدمت وابسته‌اند.', callout: 'مهلت دادگاه کار معمولاً کوتاه است.', termFa: 'دادگاه کار', termEn: 'Employment Tribunal' },
    [q('dismissal-1', 'چه دو موضوعی مهم‌اند؟', ['دلیل و فرایند', 'سن مدیر و دفتر', 'لباس'], 0, 'هر دو جداگانه بررسی می‌شوند.'), q('dismissal-2', 'چرا اقدام سریع مهم است؟', ['مهلت‌ها کوتاه‌اند', 'مدرک مهم نیست', 'پرونده همان روز بسته می‌شود'], 0, 'مهلت می‌تواند حق ادعا را محدود کند.')]),
  l('immigration', 'immigration-decisions', 'خواندن تصمیم مهاجرتی', 'Reading an immigration decision', 9, 'نوع تصمیم، دلیل‌ها و مهلت را جدا کنید.',
    { title: 'سه سؤال نخست', body: 'نوع درخواست، نتیجه و تاریخ ابلاغ را مشخص کنید؛ سپس دلیل‌ها و بخش اعتراض را بخوانید.', termFa: 'نامه تصمیم', termEn: 'Decision letter' },
    { title: 'مهلت و مسیر', body: 'مسیر می‌تواند appeal، administrative review، judicial review یا درخواست تازه باشد و به نوع تصمیم بستگی دارد.', callout: 'پیش از مهلت مشاوره تنظیم‌شده بگیرید.', termFa: 'بازبینی اداری', termEn: 'Administrative review' },
    [q('decision-1', 'ابتدا چه چیزی را ثبت می‌کنید؟', ['نوع تصمیم و تاریخ', 'رنگ کاغذ', 'نام کارکنان'], 0, 'نوع و تاریخ برای مهلت ضروری‌اند.'), q('decision-2', 'آیا همه تصمیم‌ها اعتراض یکسان دارند؟', ['بله', 'خیر', 'فقط شفاهی'], 1, 'راه‌ها به نوع تصمیم وابسته‌اند.')]),
  l('immigration', 'asylum-basics', 'مبانی ادعای پناهندگی', 'Asylum claim basics', 10, 'تعریف حمایت و نقش شواهد را مرور کنید.',
    { title: 'ترس موجه از آزار', body: 'بررسی می‌شود آیا شخص به دلیل مشخصی از آزار می‌ترسد و کشور مبدأ می‌تواند از او حمایت کند یا نه.', termFa: 'پناهنده', termEn: 'Refugee' },
    { title: 'روایت و شواهد', body: 'شرح منسجم، توضیح تناقض و ارائه مدارک موجود مهم است.', callout: 'این حوزه تخصصی است و درس جای مشاوره نیست.', termFa: 'اعتبار روایت', termEn: 'Credibility' },
    [q('asylum-1', 'موضوع محوری چیست؟', ['ترس موجه از آزار', 'سفر عمومی', 'شغل بهتر'], 0, 'تعریف بر خطر آزار تمرکز دارد.'), q('asylum-2', 'با تناقض چه کنید؟', ['پنهان کنید', 'صادقانه توضیح دهید', 'مدرک بسازید'], 1, 'توضیح زمینه مهم است.')]),
  l('immigration', 'appeal-and-review', 'اعتراض و بازبینی', 'Appeal and review', 9, 'اعتراض ماهوی را از بررسی خطا تشخیص دهید.',
    { title: 'حق اعتراض', body: 'اگر قانون حق appeal بدهد، متن تصمیم مسیر، مهلت و شیوه اقدام را توضیح می‌دهد.', termFa: 'حق اعتراض', termEn: 'Right of appeal' },
    { title: 'بازبینی قضایی', body: 'Judicial review معمولاً قانونی‌بودن تصمیم‌گیری را بررسی می‌کند، نه همه واقعیت‌ها را از نو.', callout: 'انتخاب راه اشتباه می‌تواند زمان را از بین ببرد.', termFa: 'بازبینی قضایی', termEn: 'Judicial review' },
    [q('appeal-1', 'مسیر اعتراض را کجا می‌یابید؟', ['نامه تصمیم', 'تبلیغ تصادفی', 'پاکت'], 0, 'نامه باید مسیر موجود را بیان کند.'), q('appeal-2', 'بازبینی قضایی بر چه تمرکز دارد؟', ['قانونی‌بودن تصمیم', 'همه واقعیت‌ها از نو', 'خسارت خودکار'], 0, 'مشروعیت فرایند بررسی می‌شود.')]),
  l('police', 'stop-and-search', 'توقف و بازرسی', 'Stop and search', 8, 'اطلاعات مأمور و آنچه باید ثبت کنید را بشناسید.',
    { title: 'مبنای قانونی', body: 'برای بسیاری از بازرسی‌ها پلیس باید اختیار قانونی و دلایل معقول داشته باشد، هرچند استثناهایی وجود دارد.', termFa: 'دلایل معقول', termEn: 'Reasonable grounds' },
    { title: 'آرام بمانید و ثبت کنید', body: 'نام یا شماره مأمور، زمان، مکان، مبنا و نتیجه را یادداشت کنید.', callout: 'حق شما به معنی امن‌بودن درگیری فیزیکی نیست.', termFa: 'رسید بازرسی', termEn: 'Search record' },
    [q('search-1', 'پلیس معمولاً به چه نیاز دارد؟', ['اختیار و دلایل لازم', 'کنجکاوی', 'اجازه همسایه'], 0, 'مبنای اختیار باید قابل توضیح باشد.'), q('search-2', 'چه چیزی را ثبت کنید؟', ['زمان، مکان و مأمور', 'فقط هوا', 'هیچ'], 0, 'جزئیات برای پیگیری مفیدند.')]),
  l('police', 'arrest-rights', 'حقوق هنگام بازداشت', 'Rights on arrest', 8, 'دلیل بازداشت و حقوق پایه را مرور کنید.',
    { title: 'اطلاع از دلیل', body: 'فرد باید از بازداشت و دلیل آن مطلع شود. custody officer بر بازداشتگاه نظارت می‌کند.', termFa: 'مأمور بازداشتگاه', termEn: 'Custody officer' },
    { title: 'مشاوره حقوقی', body: 'فرد معمولاً حق مشاوره حقوقی مستقل و رایگان و اطلاع‌دادن به یک شخص را دارد.', callout: 'درخواست وکیل نشانه گناه نیست.', termFa: 'مشاوره حقوقی رایگان', termEn: 'Free legal advice' },
    [q('arrest-1', 'چه اطلاعاتی باید داده شود؟', ['واقعیت و دلیل بازداشت', 'نتیجه دادگاه', 'همه شاهدان'], 0, 'فرد باید مبنای بازداشت را بداند.'), q('arrest-2', 'مشاوره در بازداشتگاه معمولاً چیست؟', ['مستقل و رایگان', 'فقط برای ثروتمندان', 'نشانه گناه'], 0, 'مشاوره معمولاً رایگان است.')]),
  l('police', 'police-interview', 'مصاحبه پلیس', 'Police interview', 9, 'احتیاط قانونی، سکوت و نقش وکیل را بفهمید.',
    { title: 'احتیاط قانونی', body: 'caution درباره حق سکوت و امکان اثرگذاری سکوت بر دفاع بعدی هشدار می‌دهد.', termFa: 'احتیاط قانونی', termEn: 'Police caution' },
    { title: 'پیش از پاسخ مشورت کنید', body: 'وکیل درباره شواهد، شیوه مصاحبه و پیامد پاسخ یا سکوت راهنمایی می‌کند.', callout: 'پیش از تصمیم، با وکیل مشورت کنید.', termFa: 'مصاحبه تحت احتیاط', termEn: 'Interview under caution' },
    [q('interview-1', 'caution درباره چیست؟', ['حق سکوت و پیامد آن', 'جریمه قطعی', 'زمان دادگاه'], 0, 'caution حق سکوت را توضیح می‌دهد.'), q('interview-2', 'پیش از پاسخ چه کنید؟', ['مشاوره حقوقی بگیرید', 'حدس بزنید', 'بدون خواندن امضا کنید'], 0, 'راهبرد به پرونده بستگی دارد.')]),
];

export const pathways: Pathway[] = [...sqePathways, ...everydayPathways];
export const lessons: Lesson[] = [...sqeLessons, ...everydayLessons];
export const lessonById = Object.fromEntries(lessons.map((item) => [item.id, item])) as Record<string, Lesson>;
export const pathwayById = Object.fromEntries(pathways.map((item) => [item.id, item])) as Record<string, Pathway>;
export const glossary = lessons.flatMap((item) => item.sections).map((section) => ({ fa: section.termFa, en: section.termEn })).filter((item, index, all) => all.findIndex((candidate) => candidate.en === item.en) === index);
