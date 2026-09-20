/** Only these editions are currently supported. Retired locale preferences migrate safely. */
export type SupportedLanguage = 'fa' | 'en';
export const supportedLanguages = ['fa', 'en'] as const;
export function normalizeLanguage(value: unknown): SupportedLanguage {
  return value === 'fa' || value == null ? 'fa' : 'en';
}
