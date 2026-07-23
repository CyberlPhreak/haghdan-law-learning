import type { IconName, Lesson, Pathway, QuizQuestion } from './curriculum';
import { flkKnowledge } from './sqe-knowledge';
import { allocateBlueprintCounts } from './sqe-spec';
import { sqe2StationLessons, sqe2Stations, stationLessonIdsForSkill } from './sqe2-stations';

export type SqeStage = 'FLK1' | 'FLK2';
export type SqeTrack = SqeStage | 'SQE2' | 'EVERYDAY';
export type SqeQuestion = QuizQuestion & { stage: SqeStage; subjectId: string; unitId: string };

type Seed = {
  id: string; stage: SqeTrack; fa: string; en: string; description: string; icon: IconName;
  color: string; soft: string; framework: string; units: string[];
};

const row = (value: string) => {
  const [id, fa, en, focus] = value.split('~');
  return { id: id!, fa: fa!, en: en!, focus: focus! };
};

const seeds: Seed[] = [
  {
    id:'flk1-business',stage:'FLK1',fa:'حقوق و رویه کسب‌وکار',en:'Business Law and Practice',icon:'briefcase',color:'#274C77',soft:'#E7F0F8',
    description:'ساختار کسب‌وکار، اداره شرکت، تأمین مالی، معامله، ورشکستگی و مالیات.',
    framework:'در سؤال کسب‌وکار، ساختار، اختیار، هدف تجاری، تشریفات، ریسک، مسئولیت و مالیات را جداگانه بررسی کنید.',
    units:[
      'business-structures~ساختار کسب‌وکار و مسئولیت~Business structures and liability~sole trader، partnership، LLP، company، شخصیت حقوقی و مسئولیت محدود',
      'business-governance~اداره شرکت و اختیار~Corporate governance and authority~directors، members، resolutions، تعارض منافع و authority',
      'business-finance~سهام، بدهی و تضمین~Equity, debt and security~shares، loan finance، fixed/floating charges و registration',
      'business-transactions~خرید و فروش کسب‌وکار~Business transactions~asset/share purchase، due diligence، warranties و indemnities',
      'business-insolvency~ورشکستگی~Insolvency~insolvency tests، voidable transactions، director duties و creditor priority',
      'business-personal-insolvency~ورشکستگی شخصی~Personal bankruptcy~statutory demand، bankruptcy petition، estate، trustee، restrictions و discharge',
      'business-tax~مالیات کسب‌وکار~Business taxation~Income Tax، Corporation Tax، CGT، VAT و reliefهای اصلی',
    ],
  },
  {
    id:'flk1-dispute',stage:'FLK1',fa:'حل اختلاف',en:'Dispute Resolution',icon:'git-pull-request',color:'#6B4E9B',soft:'#F0EAF8',
    description:'ارزیابی دعوا، pre-action، شروع پرونده، ادله، دادرسی، هزینه و اجرا.',
    framework:'دعوای مدنی را با cause of action، parties، limitation، procedure، evidence، remedy، costs و enforcement تحلیل کنید.',
    units:[
      'dispute-merits~ارزیابی اولیه و مرور زمان~Merits and limitation~عناصر دعوا، parties، remedies، evidence و محاسبه limitation',
      'dispute-preaction~Pre-action و ADR~Pre-action conduct and ADR~protocol، letter of claim، response، settlement و آثار رد ADR',
      'dispute-jurisdiction~صلاحیت و قانون قابل اعمال~Jurisdiction and applicable law~service خارج قلمرو، permission، applicable law، foreign judgment و استفاده از زبان ولزی',
      'dispute-issue~صدور، ابلاغ و دفاع~Issue, service and defence~claim form، particulars، deemed service، acknowledgment و defence',
      'dispute-interim~مدیریت و اقدامات موقت~Case management and interim remedies~tracks، directions، sanctions، summary judgment و injunction',
      'dispute-evidence~افشا و ادله~Disclosure and evidence~control، privilege، witness statements، experts و burden',
      'dispute-costs~محاکمه، هزینه و اجرا~Trial, costs and enforcement~Part 36، costs orders، appeals و enforcement methods',
    ],
  },
  {
    id:'flk1-contract',stage:'FLK1',fa:'حقوق قرارداد',en:'Contract Law',icon:'file-text',color:'#8A5A20',soft:'#F8EEDC',
    description:'تشکیل، شروط، عوامل مخدوش‌کننده، اشخاص ثالث، پایان و remedies.',
    framework:'تحلیل قرارداد را به formation، terms، validity، performance یا breach و remedies تقسیم کنید.',
    units:[
      'contract-formation~تشکیل قرارداد~Formation~offer، acceptance، consideration، intention، certainty و capacity',
      'contract-terms~شروط و تفسیر~Terms and interpretation~express/implied terms، incorporation، classification و exclusion clauses',
      'contract-vitiation~عوامل مخدوش‌کننده~Vitiating factors~misrepresentation، mistake، duress، undue influence و illegality',
      'contract-thirdparties~اشخاص ثالث و انتقال~Third parties and assignment~privity، statutory rights، assignment و agency',
      'contract-discharge~پایان قرارداد~Discharge~performance، agreement، breach، frustration و termination',
      'contract-remedies~راه‌حل‌های قراردادی~Contract remedies~damages، causation، remoteness، mitigation و equitable remedies',
    ],
  },
  {
    id:'flk1-tort',stage:'FLK1',fa:'مسئولیت مدنی',en:'Tort Law',icon:'alert-triangle',color:'#A13D63',soft:'#F9E7EE',
    description:'negligence، مسئولیت اماکن و کارفرما، nuisance، دفاع و خسارت.',
    framework:'برای هر tort، duty، breach، causation، actionable damage، defence و remedy را کامل کنید.',
    units:[
      'tort-duty~تکلیف و نقض~Duty and breach~duty of care، reasonable standard، professionals و economic loss',
      'tort-causation~سببیت و دوری خسارت~Causation and remoteness~but-for، contribution، intervening acts و foreseeability',
      'tort-occupiers~اماکن، محصول و کارفرما~Occupiers, products and employers~occupiers liability، defective products و vicarious liability',
      'tort-nuisance~Nuisance و Rylands~Nuisance and Rylands v Fletcher~land rights، unreasonable use، escape و remedies',
      'tort-defences~دفاع‌ها و خسارت~Defences and damages~contributory negligence، consent، illegality، damages و limitation',
    ],
  },
  {
    id:'flk1-system',stage:'FLK1',fa:'نظام حقوقی انگلستان و ولز',en:'Legal System of England and Wales',icon:'book-open',color:'#2D6A6A',soft:'#E1F1EF',
    description:'منابع قانون، precedent، تفسیر، دادگاه‌ها، متخصصان و funding.',
    framework:'منبع قانون، hierarchy، jurisdiction و procedural route را پیش از اعمال قاعده مشخص کنید.',
    units:[
      'system-sources~منابع قانون و precedent~Sources and precedent~legislation، common law، ratio، obiter، binding و distinguishing',
      'system-interpretation~تفسیر قانون~Statutory interpretation~text، context، purpose، presumptions و interpretive aids',
      'system-courts~دادگاه‌ها و tribunals~Courts and tribunals~civil/criminal routes، hierarchy، jurisdiction و appeals',
      'system-profession~متخصصان و خدمات~Legal professionals and services~solicitors، barristers، judiciary، reserved activities و audience',
      'system-funding~هزینه و دسترسی به عدالت~Funding and access to justice~retainers، insurance، conditional fees، legal aid و costs',
    ],
  },
  {
    id:'flk1-public',stage:'FLK1',fa:'حقوق اساسی، اداری و اروپایی',en:'Constitutional, Administrative and EU Law',icon:'flag',color:'#38598B',soft:'#E7EEF8',
    description:'ساختار دولت، devolution، judicial review، حقوق بشر و حقوق اروپایی.',
    framework:'منبع اختیار عمومی، محدوده آن، procedural fairness، rights و remedy را در هر سناریو بررسی کنید.',
    units:[
      'public-constitution~ساختار قانون اساسی~Constitutional structure~sovereignty، rule of law، separation of powers، prerogative و conventions',
      'public-devolution~Devolution و قانون ولز~Devolution and Welsh law~devolved powers، reserved matters و تفاوت England/Wales',
      'public-order~نظم عمومی~Public order law~processions، assemblies، conditions، prohibited trespassory assemblies و breach of the peace',
      'public-jr~بازبینی قضایی~Judicial review~amenability، standing، time، illegality، unfairness، irrationality و remedies',
      'public-rights~حقوق بشر~Human rights~Human Rights Act، public authorities، qualified rights و proportionality',
      'public-eu~حقوق اروپایی~European law~EU-related sources، effect و interpretation با توجه به regime و date',
    ],
  },
  {
    id:'flk1-services',stage:'FLK1',fa:'خدمات حقوقی و اخلاق حرفه‌ای',en:'Legal Services and Ethics',icon:'shield',color:'#6A4C93',soft:'#EEE8F7',
    description:'اصول SRA، client care، تعارض، محرمانگی، AML و regulation.',
    framework:'ethics در همه مباحث pervasive است؛ duty به court و public trust می‌تواند بر دستور موکل مقدم باشد.',
    units:[
      'ethics-principles~اصول و Codeهای SRA~SRA Principles and Codes~honesty، integrity، independence، public trust و duty to court',
      'ethics-client~Client care و competence~Client care and competence~scope، service، costs، vulnerability، supervision و complaints',
      'ethics-conflict~تعارض و محرمانگی~Conflict and confidentiality~own/client conflicts، current/former clients و disclosure',
      'ethics-aml~AML و source of funds~Money laundering~risk، CDD، beneficial owner، suspicion، reporting و tipping off',
      'ethics-regulation~تنظیم خدمات حقوقی~Regulation of legal services~authorisation، reserved activities، undertakings و financial services',
      'services-funding~تأمین هزینه خدمات حقوقی~Funding legal services~private retainer، CFA، DBA، fixed fee، legal aid، insurance و third-party funding',
    ],
  },
  {
    id:'flk2-property',stage:'FLK2',fa:'رویه معاملات املاک',en:'Property Law and Practice',icon:'home',color:'#2A6F62',soft:'#DFF2ED',
    description:'title، searches، contract، exchange، completion، registration، lease و مالیات.',
    framework:'در conveyancing منافع client و lender، title، searches، finance، contract، completion و post-completion را دنبال کنید.',
    units:[
      'property-instructions~دستور و title~Instructions and title~client/lender، AML، registered/unregistered title و entries',
      'property-searches~Searches و enquiries~Searches and enquiries~local، drainage، environmental و enquiries متناسب با ملک',
      'property-contract~قرارداد و exchange~Contract and exchange~draft contract، deposit، conditions، authority و binding exchange',
      'property-finance~وام و mortgage~Finance and mortgage~mortgage offer، lender requirements، report on title و redemption',
      'property-completion~Completion و registration~Completion and registration~statement، transfer، SDLT/LTT، priority و Land Registry',
      'property-leasehold~Leasehold~Leasehold practice~lease terms، assignment، consent، service charge و landlord enquiries',
      'property-commercial-leases~اجاره تجاری~Commercial lease practice~grant، underlease، assignment، AGA، breach remedies و security of tenure under LTA 1954',
      'property-planning-tax~Planning و مالیات ملک~Planning and property tax~planning/building control و تفاوت SDLT با LTT',
    ],
  },
  {
    id:'flk2-wills',stage:'FLK2',fa:'وصیت و اداره ترکه',en:'Wills and Administration of Estates',icon:'edit-3',color:'#7B5B2E',soft:'#F6EEDC',
    description:'اعتبار وصیت، intestacy، grants، اداره estate، IHT و family claims.',
    framework:'اعتبار وصیت، entitlement، authority نماینده، liabilities و tax و سپس distribution را بررسی کنید.',
    units:[
      'wills-validity~اعتبار وصیت~Will validity~capacity، knowledge/approval، formalities، witnesses و undue influence',
      'wills-revocation~تغییر و revocation~Alteration and revocation~codicil، revocation، marriage، destruction و revival',
      'wills-intestacy~Intestacy~Intestacy~entitlement همسر یا civil partner، issue و سایر relatives',
      'wills-outside-estate~اموال خارج از estate~Property outside the estate~joint property، life policy، pension benefits و trust property',
      'wills-grants~نمایندگان و grants~Representatives and grants~executor، administrator، probate و letters of administration',
      'wills-administration~اداره و توزیع estate~Estate administration~assets، debts، notices، accounts، legacies و distribution',
      'wills-tax~IHT و family provision~IHT and family provision~lifetime transfers، exemptions، reliefs و reasonable provision claims',
    ],
  },
  {
    id:'flk2-accounts',stage:'FLK2',fa:'حساب‌های وکلا',en:'Solicitors Accounts',icon:'credit-card',color:'#355C7D',soft:'#E7EFF5',
    description:'client money، ledgers، transfers، bills، reconciliation و breaches.',
    framework:'هر transaction را با مالک پول، purpose، account صحیح و double entry لازم تحلیل کنید.',
    units:[
      'accounts-money~Client و business money~Client and business money~طبقه‌بندی receipt، client account و business account',
      'accounts-ledgers~Ledgers و double entry~Ledgers and double entry~cash accounts، client ledger، business ledger و balances',
      'accounts-payments~پرداخت و transfers~Payments and transfers~authority، available funds، bills، costs transfer و earmarked money',
      'accounts-reconcile~Reconciliation و breaches~Reconciliation and breaches~bank reconciliation، interest، rectification و reporting',
    ],
  },
  {
    id:'flk2-land',stage:'FLK2',fa:'حقوق زمین',en:'Land Law',icon:'map',color:'#57723A',soft:'#EBF2E2',
    description:'estates، registration، co-ownership، easements، covenants و mortgages.',
    framework:'ماهیت حق، legal/equitable بودن، creation، registration یا priority و enforceability علیه successor را بسنجید.',
    units:[
      'land-estates~Estates و interests~Estates and interests~freehold، leasehold، legal/equitable interests و formalities',
      'land-registration~Registration و priority~Registration and priority~dispositions، notices، restrictions و overriding interests',
      'land-coownership~Co-ownership~Co-ownership~joint tenancy، tenancy in common، severance، overreaching و TOLATA',
      'land-easements~Easements~Easements~characteristics، creation، prescription و registration',
      'land-covenants~Freehold covenants~Freehold covenants~benefit/burden at law/equity و remedies',
      'land-leases~Lease و licence~Leases and licences~exclusive possession، term، privity، alienation، covenants، forfeiture و termination',
      'land-mortgages~Mortgages~Mortgages~creation، priority، possession، sale و lender duties',
    ],
  },
  {
    id:'flk2-trusts',stage:'FLK2',fa:'حقوق تراست',en:'Trusts Law',icon:'users',color:'#675A8A',soft:'#EEEAF6',
    description:'ایجاد trust، constitution، trustees، breach، remedies و implied trusts.',
    framework:'نوع trust، three certainties، constitution، powers و duties و remedy را جداگانه تحلیل کنید.',
    units:[
      'trusts-certainties~Express trust و certainties~Express trusts and certainties~intention، subject matter، objects و beneficiary principle',
      'trusts-constitution~Constitution~Constitution~انتقال property، declaration و volunteers',
      'trusts-charitable~Charitable و purpose trusts~Charitable and purpose trusts~charitable purposes، public benefit، enforcement و non-charitable purpose rule',
      'trusts-trustees~Trustees~Trustees~appointment، removal، investment، delegation، maintenance و advancement',
      'trusts-duties~Fiduciary duties~Fiduciary duties~no conflict/profit، care، impartiality، accounts و information',
      'trusts-breach~Breach و remedies~Breach and remedies~compensation، account، proprietary claims، tracing و recipients',
      'trusts-thirdparty~مسئولیت اشخاص ثالث~Third-party liability~knowing receipt، dishonest assistance، personal remedy و proprietary tracing',
      'trusts-implied~Resulting و constructive trusts~Resulting and constructive trusts~presumptions، common intention و proprietary estoppel',
      'trusts-family-home~تراست خانه خانوادگی~Trusts of the family home~sole/joint legal title، express declaration، common intention، contributions و quantification',
    ],
  },
  {
    id:'flk2-crime',stage:'FLK2',fa:'مسئولیت کیفری',en:'Criminal Liability',icon:'shield-off',color:'#8B3A3A',soft:'#F7E5E5',
    description:'عناصر جرم، homicide، جرایم علیه شخص و مال، مشارکت و دفاع‌ها.',
    framework:'برای هر offence، actus reus، mens rea، causation، participation و defence را ثابت یا رد کنید.',
    units:[
      'crime-elements~عناصر و سببیت~Elements and causation~actus reus، mens rea، coincidence، omissions و causation',
      'crime-homicide~Homicide~Homicide~murder، voluntary/involuntary manslaughter و partial defences',
      'crime-person~جرایم علیه شخص~Non-fatal offences~assault، battery، ABH، GBH و consent',
      'crime-property~جرایم علیه مال~Property offences~theft، robbery، burglary، fraud و criminal damage',
      'crime-inchoate~Attempt و مشارکت~Inchoate and secondary liability~attempt، conspiracy، encouraging/assisting و secondary parties',
      'crime-defences~دفاع‌ها~Defences~self-defence، intoxication، duress، necessity و insanity',
    ],
  },
  {
    id:'flk2-criminal-practice',stage:'FLK2',fa:'رویه کیفری',en:'Criminal Law and Practice',icon:'lock',color:'#495057',soft:'#ECEFF1',
    description:'پلیس، detention، bail، plea، trial، evidence، sentencing و appeal.',
    framework:'خط زمانی پرونده را از police powers تا charge، venue، trial، sentence و appeal دنبال کنید.',
    units:[
      'crim-police~Police powers~Police powers~stop/search، arrest، entry/search، seizure و safeguards',
      'crim-detention~Detention و interview~Detention and interview~custody clock، review، legal advice، caution و identification',
      'crim-bail~Charge، bail و first hearing~Charge, bail and first hearing~charging، bail tests، remand و plea before venue',
      'crim-trial~Mode of trial و procedure~Mode of trial and procedure~summary/either-way/indictable، allocation، plea و trial',
      'crim-evidence~ادله کیفری~Criminal evidence~confessions، silence، hearsay، bad character، identification و exclusion',
      'crim-sentence~Sentencing و appeals~Sentencing and appeals~guidelines، plea credit، orders و appeal routes',
    ],
  },
  {
    id:'sqe2-interview',stage:'SQE2',fa:'مصاحبه و attendance note',en:'Client interview and attendance note/legal analysis',icon:'message-circle',color:'#355E88',soft:'#E5EFF8',
    description:'پرسش مؤثر، اعتماد، advice اولیه، تحلیل و next steps.',
    framework:'در ۱۰ دقیقه آماده شوید، ۲۵ دقیقه مصاحبه موکل‌محور انجام دهید و attendance note تحلیلی و عملی بنویسید.',
    units:[
      'interview-plan~آمادگی و agenda~Preparation and agenda~chronology، goals، issues، documents و question plan',
      'interview-question~پرسش و گوش‌دادن~Questioning and listening~open-to-closed funnel، active listening، clarification و signposting',
      'interview-client~اعتماد و client focus~Trust and client focus~زبان قابل فهم، احترام، vulnerability و preliminary advice',
      'interview-note~Attendance note~Attendance note~material facts، law، ethics، advice، options و next steps',
    ],
  },
  {
    id:'sqe2-advocacy',stage:'SQE2',fa:'دفاع شفاهی',en:'Advocacy',icon:'mic',color:'#7B4A2F',soft:'#F6E9E0',
    description:'آمادگی، submission ساختاریافته، اقناع و تعامل با دادگاه.',
    framework:'در ۴۵ دقیقه order، test، facts و authorities را آماده و در ۱۵ دقیقه submission روشن ارائه کنید.',
    units:[
      'advocacy-prepare~آمادگی bundle~Bundle preparation~order sought، legal test، chronology، evidence و weak points',
      'advocacy-structure~ساختار submission~Submission structure~introduction، roadmap، propositions، application و close',
      'advocacy-persuade~اقناع و پاسخ~Persuasion and response~قوی‌ترین points، concessions، questions و time control',
      'advocacy-ethics~رفتار و ethics~Court conduct and ethics~duty to court، accuracy، authorities و professional language',
    ],
  },
  {
    id:'sqe2-analysis',stage:'SQE2',fa:'تحلیل پرونده و موضوع',en:'Case and matter analysis',icon:'layers',color:'#5C4D91',soft:'#EEEAF8',
    description:'گزارش ۶۰ دقیقه‌ای برای partner با advice، risk و strategy.',
    framework:'facts را غربال، issues را به law وصل و advice موکل‌محور را با options، risks و next steps گزارش کنید.',
    units:[
      'analysis-facts~Facts و chronology~Facts and chronology~material facts، contradictions، evidence و missing information',
      'analysis-issues~Issue و application~Issue and application~rule، application، counterargument، ethics و outcome',
      'analysis-options~Options و strategy~Options and strategy~client objectives، negotiation، risk، cost/time و recommendation',
      'analysis-report~گزارش به partner~Partner report~executive answer، headings، concise analysis و action plan',
    ],
  },
  {
    id:'sqe2-research',stage:'SQE2',fa:'پژوهش حقوقی',en:'Legal research',icon:'search',color:'#2D6F68',soft:'#E0F1EE',
    description:'انتخاب منابع، reasoning، authority و advice در ۶۰ دقیقه.',
    framework:'سؤال را scope، منابع معتبر را انتخاب و نتیجه را با authority و advice عملی گزارش کنید.',
    units:[
      'research-scope~Scope و search plan~Scope and search plan~issue، jurisdiction، date، keywords و source hierarchy',
      'research-sources~ارزیابی منابع~Evaluating sources~primary/secondary، currency، relevance، binding weight و distractors',
      'research-reason~Reasoning و application~Reasoning and application~proposition، authority، facts، uncertainty و counter-view',
      'research-note~Research note~Research note~short answer، key sources، advice و next steps',
    ],
  },
  {
    id:'sqe2-writing',stage:'SQE2',fa:'نگارش حقوقی',en:'Legal writing',icon:'mail',color:'#9A5A21',soft:'#F8ECDF',
    description:'نامه یا ایمیل دقیق، روشن و مناسب مخاطب در ۳۰ دقیقه.',
    framework:'هدف و مخاطب را تعیین، law را به concern موکل اعمال و action/deadline را روشن بیان کنید.',
    units:[
      'writing-audience~مخاطب و tone~Audience and tone~client، opponent، third party یا partner و سطح مناسب detail',
      'writing-structure~ساختار و clarity~Structure and clarity~purpose، facts، advice، action، deadline و headings',
      'writing-advice~Advice و negotiation~Advice and negotiation~options، risk، proposal، client focus و professional firmness',
      'writing-review~دقت و بازبینی~Accuracy and review~names، dates، amounts، law، ethics و attachments',
    ],
  },
  {
    id:'sqe2-drafting',stage:'SQE2',fa:'تنظیم اسناد حقوقی',en:'Legal drafting',icon:'file-plus',color:'#475B74',soft:'#E8EDF3',
    description:'تنظیم یا اصلاح سند دقیق، جامع و مؤثر در ۴۵ دقیقه.',
    framework:'instructions را به operative clauses تبدیل، precedent را تطبیق و effect و consistency را بازبینی کنید.',
    units:[
      'drafting-instructions~دستور و precedent~Instructions and precedent~parties، objectives، facts، options و irrelevant clauses',
      'drafting-language~زبان operative~Operative language~who، shall، what، when، definitions، conditions و consequences',
      'drafting-structure~ساختار سند~Document structure~recitals، definitions، provisions، schedules و execution',
      'drafting-review~صحت و بازبینی~Legal review~cross-references، numbering، terms، legality، completeness و ethics',
    ],
  },
];

const wrong = [
  'فقط عنوان سند یا ادعای یک طرف کافی است و facts دیگر بررسی نمی‌شود.',
  'برای رسیدن به نتیجه دلخواه موکل می‌توان تشریفات و وظایف حرفه‌ای را نادیده گرفت.',
  'همه قواعد بدون توجه به تاریخ، قلمرو و نوع پرونده یکسان اعمال می‌شوند.',
  'وجود یک عنصر مرتبط، بدون تکمیل عناصر دیگر، نتیجه را قطعی می‌کند.',
  'بهترین راه همیشه حفظ یک تعریف بدون اعمال آن بر سناریو است.',
  'می‌توان ethics و professional conduct را تا پایان تحلیل کنار گذاشت.',
];

const scenarioContexts: Record<string, string> = {
  'flk1-business': 'یک مدیر برای تصمیم مهم شرکت و پیامد مالی آن از مؤسسه راهنمایی می‌خواهد.',
  'flk1-dispute': 'موکلی با یک اختلاف، اسناد ناقص و یک مهلت احتمالی برای طرح یا دفاع از دعوا مراجعه کرده است.',
  'flk1-contract': 'دو طرف درباره وجود قرارداد، معنای یک شرط و راه‌حل پس از نقض اختلاف دارند.',
  'flk1-tort': 'موکل پس از زیان مالی یا جسمی می‌خواهد بداند چه کسی مسئول است و چه خسارتی قابل مطالبه است.',
  'flk1-system': 'برای انتخاب مرجع و منبع قانون باید نوع پرونده و جایگاه تصمیم قبلی مشخص شود.',
  'flk1-public': 'یک مقام عمومی تصمیمی گرفته که بر حقوق فرد اثر دارد و قانونی‌بودن فرایند محل سؤال است.',
  'flk1-services': 'وکیل بین دستور موکل، محرمانگی، تعارض احتمالی و وظیفه حرفه‌ای باید تصمیم بگیرد.',
  'flk2-property': 'خریدار و lender پیش از exchange درباره title، searches و ریسک‌های ملک پاسخ می‌خواهند.',
  'flk2-wills': 'پس از فوت، اعتبار وصیت، اختیار نماینده و ترتیب پرداخت و توزیع estate باید روشن شود.',
  'flk2-accounts': 'مؤسسه وجهی دریافت کرده و باید ماهیت پول، ledger و انتقال مجاز را درست ثبت کند.',
  'flk2-land': 'خریدار ملکی با حق ثبت‌نشده یا تعهد قبلی می‌خواهد بداند آن حق علیه او قابل اجراست یا نه.',
  'flk2-trusts': 'beneficiary درباره ایجاد trust، رفتار trustee و remedy پس از breach پرسش دارد.',
  'flk2-crime': 'facts پرونده باید عنصر به عنصر با offence، mens rea، participation و defence تطبیق داده شود.',
  'flk2-criminal-practice': 'متهم از نخستین تماس با پلیس تا trial، sentence یا appeal به advice مرحله‌ای نیاز دارد.',
  'sqe2-interview': 'ایمیل partner و چند سند اولیه دارید؛ باید اطلاعات لازم را از موکل بگیرید و attendance note بنویسید.',
  'sqe2-advocacy': 'bundle کوتاهی دریافت کرده‌اید و باید order مشخصی را در برابر قاضی درخواست کنید.',
  'sqe2-analysis': 'پرونده‌ای با facts موافق و مخالف دارید و partner یک گزارش عملی و client-focused می‌خواهد.',
  'sqe2-research': 'partner درباره مسئله‌ای محدود از شما research، authority و advice قابل استفاده می‌خواهد.',
  'sqe2-writing': 'باید برای یک مخاطب مشخص نامه یا ایمیلی روشن، دقیق و متناسب با هدف موکل بنویسید.',
  'sqe2-drafting': 'باید precedent را با instructions و facts پرونده تطبیق دهید و clauses مؤثر بسازید.',
};

// These English-only supplements make the clarifications published for the
// September 2026 specification visible without invalidating the existing
// reviewed offline translation index for the core Persian lessons.
const september2026Clarifications: Record<string, string[]> = {
  'business-finance': ['Share funding expressly includes redemption and buyback. Other reductions of share capital and Companies Act 2006 financial assistance are outside this clarified line.'],
  'business-tax': ['Corporation Tax coverage includes income profits, chargeable gains, allowable deductions, principal reliefs and exemptions, calculation, payment and collection.'],
  'dispute-costs': ['Enforcement includes the procedure for obtaining information from a judgment debtor.'],
  'property-searches': ['Identify who makes each search or enquiry and analyse issues arising from every result rather than merely naming the search.'],
  'property-contract': ['Practise drafting the sale contract and exchanging with authority through the Law Society formulae for exchange.'],
  'property-completion': ['Pre-completion work includes financial considerations and apportionments.'],
  'property-commercial-leases': ['Practise drafting the assignment contract and applying Part II Landlord and Tenant Act 1954, including contracting out.'],
  'wills-validity': ['Cover knowledge and approval and identify who bears the burden of proof when validity is challenged.'],
  'wills-revocation': ['Cover the use and effect of codicils, every method of revocation, and the effect of divorce or dissolution on an existing will.'],
  'wills-grants': ['Cover executor eligibility and suitability, Non-Contentious Probate Rules priority, and the evidence required for each form of grant.'],
  'wills-administration': ['Cover pre-distribution duties and protection against unknown, missing or insolvent beneficiaries and creditors.'],
  'wills-tax': ['Cover IHT incidence among representatives, beneficiaries, trustees and co-owners; immediately chargeable transfers, PETs and gifts with reservation; and the statutory factors for a 1975 Act claim.'],
  'trusts-constitution': ['Cover the Re Rose and Strong v Bird rules and Choithram v Pagarani as exceptions relevant to imperfect gifts and constitution.'],
  'trusts-implied': ['Distinguish automatic resulting trusts from presumed resulting trusts.'],
  'crim-detention': ['Apply the requirements of a lawful suspect interview under PACE 1984 Code C.'],
  'crim-bail': ['Practise the procedure for both applying for and opposing bail.'],
  'crim-evidence': ['Cover challenges to hearsay admissibility and the admission, exclusion and use of bad-character evidence.'],
  'crim-trial': ['Address the relevance of a defendant’s good character and the procedure and hearings in the youth court.'],
  'crim-sentence': ['Cover Newton hearings and youth sentencing, including the role of the relevant children and young people guideline.'],
};

const splitFocus = (focus: string) => focus.split('،').map(item => item.trim()).filter(Boolean);

const answerSet = (correct: string, salt: number, alternatives: string[] = []) => {
  const candidates = [...alternatives, ...wrong].filter((value, index, all) => value !== correct && all.indexOf(value) === index);
  const distractors = candidates.slice(0, 4);
  while (distractors.length < 4) distractors.push(`این گزینه مرحله ${distractors.length + 1} تحلیل را بدون دلیل حذف می‌کند.`);
  const correctIndex = salt % 5;
  const answers = [...distractors];
  answers.splice(correctIndex, 0, correct);
  return { answers, correctIndex };
};

const peerDistractors = (subject: Seed, unitId: string) => subject.units
  .map(row)
  .filter(unit => unit.id !== unitId)
  .slice(0, 4)
  .map(unit => flkKnowledge[unit.id]?.[0] ?? ('تحلیل را فقط به «' + unit.fa + '» و این موارد محدود کنید: ' + unit.focus + '.'));

const makeQuestion = (subject: Seed, raw: string, variant: number): SqeQuestion => {
  const unit = row(raw);
  const topics = splitFocus(unit.focus);
  const rules = flkKnowledge[unit.id] ?? topics.map(topic => 'قاعده، عناصر، استثناها و اثر عملیِ ' + topic + ' را مشخص کنید.');
  const scenario = subject.id === 'flk2-accounts'
    ? variant % 2 === 0
      ? 'در جریان completion یک معامله ملک، firm باید receipt، client ledger، lender funds و payment مجاز را ثبت و کنترل کند.'
      : 'در اداره یک estate، firm پول حاصل از assets را دریافت کرده و باید client money، پرداخت debts و accounting entries را درست مدیریت کند.'
    : scenarioContexts[subject.id] ?? 'یک موکل با مسئله‌ای چندمرحله‌ای برای advice مراجعه کرده است.';
  const correctAnswers = [
    rules[0]!,
    rules[1] ?? rules[0]!,
    rules[0]!,
    rules[1] ?? rules[0]!,
    rules[0]!,
    rules[1] ?? rules[0]!,
    'ابتدا chronology، parties، هدف موکل و facts گمشده را مشخص کنید؛ سپس عناصر «' + unit.fa + '» را اعمال کنید.',
    'در کنار قانون، هر تعارض، محرمانگی، صداقت، duty to court و public trust مرتبط را مستقل بررسی کنید.',
    'پس از liability یا entitlement، remedy، deadline، costs و next step عملی را جداگانه بررسی کنید.',
    'اگر facts کافی نیست، conclusion مشروط بدهید و دقیقاً بگویید چه اطلاعات یا سندی باید تهیه شود.',
    'هدف موکل، ریسک، زمان و هزینه را در advice وارد کنید و صرفاً قانون انتزاعی را تکرار نکنید.',
    'بهترین پاسخ، قاعده درست را جامع اما متناسب با سطح Day One Solicitor روی scenario اعمال می‌کند.',
  ];
  const prompts = [
    'کدام گزاره، قاعده اصلی «' + unit.fa + '» را دقیق‌تر بیان می‌کند؟',
    'در advice مربوط به «' + unit.fa + '»، کدام proposition قانونی صحیح‌تر است؟',
    scenario + ' کدام قاعده باید در تحلیل اعمال شود؟',
    'کدام گزینه درباره عناصر یا اثر حقوقی «' + unit.fa + '» درست‌تر است؟',
    'برای رد گزینه‌های ناقص در «' + unit.fa + '»، کدام قاعده تعیین‌کننده است؟',
    'کدام statement باید در یادداشت حقوقی این موضوع گنجانده شود؟',
    'بعد از تعیین قاعده اصلی، کدام مرحله نباید فراموش شود؟',
    'در تحلیل این scenario، ethics چگونه باید وارد شود؟',
    'اگر اطلاعات سناریو ناقص باشد، بهترین advice چیست؟',
    'کدام پاسخ واقعاً client-focused است؟',
    'در بازبینی نهایی پاسخ، چه کاری مفیدتر است؟',
    'کدام گزینه با استاندارد کاربرد قانون در SQE1 سازگارتر است؟',
  ];
  const correct = correctAnswers[variant % correctAnswers.length]!;
  const alternatives = [
    ...peerDistractors(subject, unit.id),
    topics.length > 1 ? `فقط «${topics[0]}» را بررسی کنید و «${topics.slice(1).join('، ')}» را کنار بگذارید.` : wrong[0]!,
  ];
  return {
    id: `${subject.stage.toLowerCase()}-${unit.id}-q${variant + 1}`,
    stage: subject.stage as SqeStage,
    subjectId: subject.id,
    unitId: unit.id,
    prompt: prompts[variant % prompts.length]!,
    ...answerSet(correct, subject.id.length + unit.id.length + variant, alternatives),
    explanation: 'قواعد کلیدی: ' + rules.join(' ') + ' چارچوب کاربردی: ' + subject.framework + ' پاسخ باید law، facts، ethics و نتیجه عملی را به هم متصل کند.',
  };
};

const makeSkillQuiz = (subject: Seed, unit: ReturnType<typeof row>, index: number): QuizQuestion => {
  const correctAnswers = [
    `خروجی را با skills criteria، application of law، ethics و client focus بازبینی کنید.`,
    `زمان را میان planning، execution و final review تقسیم کنید و یک خروجی usable تحویل دهید.`,
    `facts مرتبط را انتخاب و advice یا drafting را برای مخاطب و هدف مشخص تنظیم کنید.`,
    `هر uncertainty را صادقانه مشخص و next step عملی را بیان کنید.`,
  ];
  const prompts = [
    'بهترین self-review برای این ایستگاه چیست؟',
    'مدیریت زمان این تمرین چگونه باید باشد؟',
    'کدام رویکرد با معیارهای SQE2 سازگارتر است؟',
    'با یک نکته نامطمئن چگونه برخورد می‌کنید؟',
  ];
  return {
    id: `${unit.id}-skill-${index + 1}`,
    prompt: prompts[index]!,
    ...answerSet(correctAnswers[index]!, index + unit.id.length, peerDistractors(subject, unit.id)),
    explanation: `${subject.framework} تمرکز تمرین: ${unit.focus}.`,
  };
};

const makeLesson = (subject: Seed, raw: string): Lesson => {
  const unit = row(raw);
  const practical = subject.stage === 'SQE2';
  const topics = splitFocus(unit.focus);
  const rules = flkKnowledge[unit.id] ?? topics.map(topic => 'قاعده، عناصر، استثناها و اثر عملیِ ' + topic + ' را مشخص کنید.');
  const scenario = scenarioContexts[subject.id] ?? 'یک موکل با مسئله‌ای چندمرحله‌ای مراجعه کرده است.';
  const applicationChecklist = practical
    ? ['دستور و هدف خروجی را در یک جمله مشخص کنید.', 'facts و law مرتبط را از مطالب حاشیه‌ای جدا کنید.', 'خروجی را برای مخاطب و زمان ایستگاه تنظیم کنید.', 'ethics و application of law را صریح بازبینی کنید.']
    : ['lead-in را قبل از گزینه‌ها بخوانید.', 'قاعده و همه عناصر آن را مشخص کنید.', 'هر عنصر را روی facts موافق و مخالف اعمال کنید.', 'ethics، remedy، procedure و deadline را کنترل کنید.', 'پنج گزینه را با همان legal test مقایسه کنید.'];
  const quiz = practical
    ? [0, 1, 2, 3].map(index => makeSkillQuiz(subject, unit, index))
    : [0, 1, 2, 3, 4, 5].map(variant => makeQuestion(subject, raw, variant));
  const specificationClarifications = september2026Clarifications[unit.id];
  return {
    id: unit.id,
    pathwayId: subject.id,
    title: unit.fa,
    englishTitle: unit.en,
    duration: practical ? 22 : 18,
    summary: unit.focus,
    sections: [
      {
        title: 'تصویر کلی و جایگاه مبحث',
        body: `${subject.framework} این واحد نشان می‌دهد «${unit.fa}» چگونه در یک مسئله واقعی و در کنار سایر مباحث ${subject.fa} قرار می‌گیرد.`,
        callout: practical ? 'در SQE2، skills و application of law در امتیاز نهایی وزن برابر دارند.' : 'SQE1 حافظه صرف را نمی‌سنجد؛ باید rule را روی scenario یک موکل اعمال کنید.',
        bullets: rules,
        termFa: unit.fa,
        termEn: unit.en,
      },
      {
        title: 'دانش و واژگان لازم',
        body: 'پیش از حل سؤال باید اجزای زیر را از هم تفکیک کنید. برای هر جزء، قاعده، facts لازم و نتیجه احتمالی را به زبان خودتان توضیح دهید.',
        bullets: topics,
        checklist: ['کدام facts هر عنصر را پشتیبانی می‌کند؟', 'چه fact نامطلوب یا استثنایی ممکن است نتیجه را تغییر دهد؟', 'بار اثبات، تشریفات یا مهلت بر عهده چه کسی است؟'],
        callout: `محدوده این واحد: ${unit.focus}.`,
        termFa: 'دانش کارکردی',
        termEn: 'Functioning legal knowledge',
      },
      {
        title: practical ? 'روش اجرای مهارت' : 'روش اعمال قانون',
        body: practical
          ? 'یک پاسخ حرفه‌ای باید از planning کوتاه به execution منظم و سپس final review برسد. خروجی باید برای partner، client، court یا recipient واقعاً قابل استفاده باشد.'
          : 'قاعده را به‌صورت مرحله‌ای روی facts اعمال کنید. ابتدا مسئله را شناسایی کنید، سپس test قانونی را بنویسید و برای هر عنصر از facts استفاده کنید؛ بعد نتیجه و اقدام عملی را ارائه دهید.',
        checklist: applicationChecklist,
        example: practical ? `${scenario} خروجی شما باید هم از نظر مهارت و هم از نظر قانون قابل دفاع باشد.` : `${scenario} پاسخ خوب توضیح می‌دهد کدام facts نتیجه را تقویت یا تضعیف می‌کنند و چرا یک گزینه از چهار گزینه دیگر بهتر است.`,
        termFa: practical ? 'معیار مهارت' : 'اعمال قانون',
        termEn: practical ? 'Skills criterion' : 'Application of law',
      },
      ...(specificationClarifications ? [{
        title: 'September 2026 specification clarification',
        body: 'The SRA annual review expressly clarified that the following detail can be assessed from 1 September 2026.',
        bullets: specificationClarifications,
        checklist: ['Explain the rule and its elements.', 'Apply it to a short client scenario.', 'Check the assessment-window law cut-off before relying on a rate, threshold, time limit or procedural rule.'],
        source: 'SRA annual review of Assessment Specifications and the FLK: changes applying from 1 September 2026.',
        termFa: 'September 2026 coverage',
        termEn: 'September 2026 coverage',
      }] : []),
      {
        title: 'سناریوی تمرینی هدایت‌شده',
        body: scenario,
        example: `فرض کنید اسناد اولیه فقط بخشی از این موارد را پوشش می‌دهد: ${unit.focus}. یک فهرست از facts موجود، facts گمشده، قاعده احتمالی، ethics و next steps بسازید.`,
        checklist: ['هدف موکل یا دستور partner چیست؟', 'سه fact تعیین‌کننده کدام‌اند؟', 'کدام قاعده یا عنصر هنوز evidence ندارد؟', 'نتیجه موقت و اقدام بعدی چیست؟'],
        callout: 'نتیجه را قطعی اعلام نکنید مگر facts برای تمام عناصر کافی باشد.',
        termFa: 'تحلیل سناریو',
        termEn: 'Scenario analysis',
      },
      {
        title: 'Exam clinic و جمع‌بندی',
        body: practical
          ? 'پاسخ خود را با performance indicators همان مهارت مقایسه کنید: clarity، structure، client focus، legal accuracy، comprehensiveness و ethics.'
          : 'در سؤال SBA، هر پنج گزینه ممکن است ظاهراً حقوقی باشند. پاسخ درست گزینه‌ای است که lead-in را دقیق جواب می‌دهد و قاعده را کامل و متناسب با facts اعمال می‌کند.',
        bullets: ['از نتیجه‌گیری فقط بر اساس یک keyword خودداری کنید.', 'تاریخ cut-off قانون و تفاوت احتمالی England و Wales را کنترل کنید.', 'ethics حتی اگر در سؤال علامت‌گذاری نشده باشد pervasive است.', 'پس از هر پاسخ، دلیل رد چهار گزینه دیگر را بیان کنید.'],
        source: practical ? 'ساختار آموزشی بر مبنای SQE2 Assessment Specification و performance criteria است.' : 'ساختار آموزشی بر مبنای SQE1 Assessment Specification و الگوی رسمی SBA است.',
        callout: 'این محتوا آموزش عمومی است و پیش از انتشار تجاری باید توسط solicitor واجد صلاحیت بازبینی حقوقی شود.',
        termFa: 'بهترین پاسخ واحد',
        termEn: practical ? 'Performance indicators' : 'Single best answer',
      },
    ],
    quiz,
  };
};

export const sqeLessons: Lesson[] = [
  ...seeds.flatMap(subject => subject.units.map(raw => makeLesson(subject, raw))),
  ...sqe2StationLessons,
];
export const sqePathways: Pathway[] = seeds.map(subject => ({
  id:subject.id,track:subject.stage,title:subject.fa,englishTitle:subject.en,description:subject.description,
  icon:subject.icon,color:subject.color,softColor:subject.soft,level:subject.stage==='SQE2'?'مهارت عملی':subject.stage,
  lessonIds:[...subject.units.map(raw => row(raw).id), ...(subject.stage === 'SQE2' ? stationLessonIdsForSkill(subject.id) : [])],
}));
export const sqeQuestions: SqeQuestion[] = seeds.filter(subject => subject.stage==='FLK1'||subject.stage==='FLK2').flatMap(subject =>
  subject.units.flatMap(raw => Array.from({ length: 12 }, (_, variant) => makeQuestion(subject, raw, variant))),
);
export const questionsForStage = (stage: SqeStage) => sqeQuestions.filter(question => question.stage === stage);

const shuffleQuestions = (items: SqeQuestion[]) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex]!, copy[index]!];
  }
  return copy;
};

export const buildBalancedTestQuestions = (stage: SqeStage, count: number, subjectId?: string) => {
  const pool = questionsForStage(stage);
  const safeCount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  if (subjectId) return shuffleQuestions(pool.filter((question) => question.subjectId === subjectId)).slice(0, safeCount);

  const allocations = allocateBlueprintCounts(stage, Math.min(safeCount, pool.length));
  const selected = Object.entries(allocations).flatMap(([allocatedSubjectId, allocatedCount]) =>
    shuffleQuestions(pool.filter((question) => question.subjectId === allocatedSubjectId)).slice(0, allocatedCount),
  );
  return shuffleQuestions(selected);
};

export const stageSubjects = (track: SqeTrack) => sqePathways.filter(pathway => pathway.track === track);
export const sqeTotals = {
  flk1Subjects:seeds.filter(subject=>subject.stage==='FLK1').length,
  flk2Subjects:seeds.filter(subject=>subject.stage==='FLK2').length,
  sqe2Skills:seeds.filter(subject=>subject.stage==='SQE2').length,
  lessons:sqeLessons.length,practiceQuestions:sqeQuestions.length,sqe2Stations:sqe2Stations.length,
};
