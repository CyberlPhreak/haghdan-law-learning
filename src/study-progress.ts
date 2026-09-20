export type StudyRecord = {
  version: string;
  section: number;
  completedSections: number[];
  completedAt: string | null;
  updatedAt: string;
};
export type StudyProgress = Record<string, StudyRecord>;

export function normalizeStudyProgress(value: unknown): StudyProgress {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([, record]) => {
    const r = record as StudyRecord;
    return r && typeof r.version === 'string' && Number.isInteger(r.section) && r.section >= 0
      && Array.isArray(r.completedSections) && r.completedSections.every(n => Number.isInteger(n) && n >= 0)
      && typeof r.updatedAt === 'string' && Number.isFinite(Date.parse(r.updatedAt))
      && (r.completedAt === null || typeof r.completedAt === 'string' && Number.isFinite(Date.parse(r.completedAt)));
  })) as StudyProgress;
}

/** Explicit acknowledgement of reading, never a claim of mastery or an assessment score. */
export function acknowledgeStudySection(progress: StudyProgress, lessonId: string, version: string, section: number, total: number, now = new Date().toISOString()): StudyProgress {
  if (!lessonId || !Number.isInteger(total) || total < 1 || !Number.isInteger(section) || section < 0 || section >= total) return progress;
  const prior = progress[lessonId]?.version === version ? progress[lessonId] : undefined;
  const completedSections = [...new Set([...(prior?.completedSections ?? []).filter(i => i < total), section])].sort((a, b) => a - b);
  const completed = completedSections.length === total;
  return { ...progress, [lessonId]: {
    version,
    section: Math.min(section + 1, total - 1),
    completedSections,
    completedAt: completed ? prior?.completedAt ?? now : null,
    updatedAt: now,
  } };
}

export function studyResumeSection(record: StudyRecord | undefined, version: string, total: number) {
  return record?.version === version ? Math.min(Math.max(0, record.section), Math.max(0, total - 1)) : 0;
}
