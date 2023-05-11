export type I18NStrategy = 'raw' | { useLanguages: string[] };

export const getPreferredLanguages = (
  i18nStrategy?: I18NStrategy
): string[] | undefined => {
  if (!i18nStrategy || i18nStrategy === 'raw') return undefined;
  return i18nStrategy.useLanguages;
};
