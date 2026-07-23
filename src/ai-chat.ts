import { lessons } from './curriculum';
import type { AppLanguage } from './i18n';
import { localizeLesson } from './legal-content';

export type ChatRole = 'user' | 'assistant';
export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  sourceTitles?: string[];
  mode?: 'online' | 'offline';
};

type AssistantRequest = {
  messages: ChatMessage[];
  language: AppLanguage;
  safetyId: string;
  signal?: AbortSignal;
};

type KnowledgeMatch = {
  title: string;
  englishTitle: string;
  summary: string;
  excerpts: string[];
  score: number;
};

const endpoint = process.env.EXPO_PUBLIC_AI_CHAT_ENDPOINT?.trim().replace(/\/$/, '');
export const onlineAssistantConfigured = Boolean(endpoint);

export const assistantSuggestions: Record<AppLanguage, string[]> = {
  en: ['Explain consideration in contract law.', 'How should I structure an SQE2 legal research note?', 'Compare a lease and a licence.', 'What makes a valid will?'],
  fa: ['consideration در حقوق قرارداد را توضیح بده.', 'یادداشت پژوهش حقوقی SQE2 را چگونه تنظیم کنم؟', 'lease و licence را مقایسه کن.', 'شرایط اعتبار وصیت چیست؟'],
  zh: ['解释合同法中的 consideration。', '如何组织 SQE2 法律研究笔记？', '比较 lease 与 licence。', '有效遗嘱需要什么条件？'],
  ar: ['اشرح consideration في قانون العقود.', 'كيف أنظم مذكرة بحث قانوني في SQE2؟', 'قارن بين lease و licence.', 'ما شروط صحة الوصية؟'],
  es: ['Explica consideration en contratos.', '¿Cómo estructuro una nota de investigación SQE2?', 'Compara lease y licence.', '¿Qué hace válido un testamento?'],
};

const stopWords = new Set([
  'about', 'after', 'also', 'and', 'are', 'can', 'does', 'for', 'from', 'have', 'how',
  'into', 'its', 'law', 'legal', 'that', 'the', 'this', 'what', 'when', 'where', 'which',
  'with', 'would', 'یک', 'از', 'به', 'در', 'را', 'و', 'که', 'چه', 'برای', 'است', 'این',
]);

const tokens = (value: string) => value
  .toLocaleLowerCase()
  .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
  .split(/\s+/)
  .filter((token) => token.length > 2 && !stopWords.has(token));

const lessonText = (lesson: (typeof lessons)[number]) => [
  lesson.title,
  lesson.englishTitle,
  lesson.summary,
  ...lesson.sections.flatMap((section) => [
    section.title,
    section.body,
    section.callout ?? '',
    section.example ?? '',
    ...(section.bullets ?? []),
    ...(section.checklist ?? []),
  ]),
].join(' ');

export function findKnowledgeMatches(query: string, limit = 3, language: AppLanguage = 'fa'): KnowledgeMatch[] {
  const queryTokens = Array.from(new Set(tokens(query)));
  if (!queryTokens.length) return [];
  return lessons
    .map((lesson) => {
      const localized = localizeLesson(lesson, language);
      const searchable = lessonText(localized).toLocaleLowerCase();
      const title = `${localized.title} ${localized.englishTitle}`.toLocaleLowerCase();
      const score = queryTokens.reduce((sum, token) => sum + (title.includes(token) ? 5 : searchable.includes(token) ? 1 : 0), 0);
      return {
        title: localized.title,
        englishTitle: localized.englishTitle,
        summary: localized.summary,
        excerpts: localized.sections
          .flatMap((section) => [section.body, ...(section.bullets ?? [])])
          .filter((entry) => queryTokens.some((token) => entry.toLocaleLowerCase().includes(token)))
          .slice(0, 3),
        score,
      };
    })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

const offlineCopy: Record<AppLanguage, {
  intro: string;
  noMatch: string;
  sources: string;
  boundary: string;
}> = {
  en: {
    intro: 'Here is the closest curriculum-grounded explanation:',
    noMatch: 'I could not find a close match in the installed curriculum. Try naming an FLK subject, doctrine, procedure, or SQE2 skill.',
    sources: 'Relevant lessons',
    boundary: 'Use this for study only—not legal advice. Check the current law and assessment-window cut-off.',
  },
  fa: {
    intro: 'نزدیک‌ترین توضیح مبتنی بر محتوای برنامه:',
    noMatch: 'در محتوای نصب‌شده تطبیق نزدیکی پیدا نشد. نام مبحث FLK، قاعده، رویه یا مهارت SQE2 را دقیق‌تر بنویسید.',
    sources: 'درس‌های مرتبط',
    boundary: 'فقط برای مطالعه؛ نه مشاوره حقوقی. قانون جاری و تاریخ cut-off آزمون را بررسی کنید.',
  },
  ar: {
    intro: 'هذا أقرب شرح مستند إلى منهج التطبيق:',
    noMatch: 'لم أجد تطابقاً قريباً في المنهج المثبت. اذكر موضوع FLK أو القاعدة أو الإجراء أو مهارة SQE2 بدقة أكبر.',
    sources: 'الدروس ذات الصلة',
    boundary: 'للدراسة فقط وليس استشارة قانونية. تحقق من القانون الحالي وتاريخ القطع للاختبار.',
  },
  zh: {
    intro: '以下是与应用课程最接近的说明：',
    noMatch: '在已安装课程中未找到接近内容。请更具体地写出 FLK 科目、规则、程序或 SQE2 技能。',
    sources: '相关课程',
    boundary: '仅供学习，不构成法律意见。请核对现行法律及考试法律截止日期。',
  },
  es: {
    intro: 'Esta es la explicación más cercana basada en el programa:',
    noMatch: 'No encontré una coincidencia cercana en el programa instalado. Indica una materia FLK, doctrina, procedimiento o habilidad SQE2.',
    sources: 'Lecciones relacionadas',
    boundary: 'Solo para estudio; no es asesoramiento jurídico. Comprueba la ley vigente y la fecha de corte del examen.',
  },
};

function buildOfflineReply(query: string, language: AppLanguage) {
  const matches = findKnowledgeMatches(query, 3, language);
  const copy = offlineCopy[language];
  if (!matches.length) {
    return { text: `${copy.noMatch}\n\n${copy.boundary}`, sourceTitles: [], mode: 'offline' as const };
  }
  const explanation = matches.map((match, index) => {
    const title = language === 'fa' ? `${match.title} — ${match.englishTitle}` : match.englishTitle;
    const detail = match.excerpts[0] ?? match.summary;
    return `${index + 1}. ${title}\n${detail}`;
  }).join('\n\n');
  return {
    text: `${copy.intro}\n\n${explanation}\n\n${copy.sources}: ${matches.map((match) => match.englishTitle).join(' · ')}\n\n${copy.boundary}`,
    sourceTitles: matches.map((match) => match.englishTitle),
    mode: 'offline' as const,
  };
}

export async function askStudyAssistant({ messages, language, safetyId, signal }: AssistantRequest) {
  const latest = messages.filter((message) => message.role === 'user').at(-1)?.text.trim() ?? '';
  if (!latest) throw new Error('empty_message');
  const matches = findKnowledgeMatches(latest, 3, language);
  if (!endpoint) return buildOfflineReply(latest, language);

  try {
    const response = await fetch(`${endpoint}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        language,
        safetyId,
        messages: messages.slice(-8).map(({ role, text }) => ({ role, text })),
        curriculumContext: matches.map((match) => ({
          title: match.englishTitle,
          summary: match.summary,
          excerpts: match.excerpts,
        })),
      }),
    });
    const payload = await response.json().catch(() => ({})) as { answer?: string; error?: string };
    if (response.ok && payload.answer) {
      return {
        text: payload.answer,
        sourceTitles: matches.map((match) => match.englishTitle),
        mode: 'online' as const,
      };
    }
    if (response.status === 400) throw new Error(payload.error || 'message_not_supported');
    return buildOfflineReply(latest, language);
  } catch (error) {
    if (error instanceof Error && (error.name === 'AbortError' || error.message === 'message_not_supported' || error.message === 'invalid_message')) throw error;
    return buildOfflineReply(latest, language);
  }
}

export function privacySafeLearnerId(username: string) {
  let hash = 2166136261;
  for (const character of username) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `learner_${(hash >>> 0).toString(16).padStart(8, '0')}`;
}
