import { ArianeeProductCertificateI18N } from '@arianee/common-types';

type MergeableI18N = {
  language?: string;
  externalContents?: unknown[];
  [key: string]: unknown;
};

type MergeableContent = {
  externalContents?: unknown[];
  i18n?: MergeableI18N[];
  [key: string]: unknown;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const deepEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, i) => deepEqual(item, b[i]));
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    return (
      aKeys.length === bKeys.length &&
      aKeys.every((key) => deepEqual(a[key], b[key]))
    );
  }
  return false;
};

/**
 * Concatenates parent and child externalContents (parent entries first) and
 * removes strictly identical duplicates (ARI-3292).
 */
const concatExternalContents = (
  parent: unknown[],
  child: unknown[]
): unknown[] => {
  const result = [...parent];
  for (const entry of child) {
    if (!result.some((existing) => deepEqual(existing, entry))) {
      result.push(entry);
    }
  }
  return result;
};

/**
 * Merges a single parent/child pair: the child overrides the parent's
 * properties, except externalContents which are concatenated (parent first) at
 * the root and, recursively, inside each matching i18n language entry. i18n is
 * merged by language so parent-only languages are kept and child-only languages
 * are appended (ARI-3292).
 */
const mergeContentPair = (
  parent: MergeableContent,
  child: MergeableContent
): MergeableContent => {
  const result: MergeableContent = { ...parent, ...child };

  if (
    Array.isArray(parent.externalContents) &&
    Array.isArray(child.externalContents)
  ) {
    result.externalContents = concatExternalContents(
      parent.externalContents,
      child.externalContents
    );
  }

  if (Array.isArray(parent.i18n) && Array.isArray(child.i18n)) {
    result.i18n = mergeI18nByLanguage(parent.i18n, child.i18n);
  }

  return result;
};

const mergeI18nByLanguage = (
  parentI18n: MergeableI18N[],
  childI18n: MergeableI18N[]
): MergeableI18N[] => {
  const merged = parentI18n.map((parentLang) => {
    const childLang = childI18n.find(
      (lang) => lang?.language === parentLang?.language
    );
    return childLang ? mergeContentPair(parentLang, childLang) : parentLang;
  });

  const childOnlyLanguages = childI18n.filter(
    (childLang) =>
      !parentI18n.some(
        (parentLang) => parentLang?.language === childLang?.language
      )
  );

  return [...merged, ...childOnlyLanguages];
};

/**
 * Merge array of smart asset.
 * Ex: parent nft should be in first position, children last positions.
 *
 * The child overrides the parents' scalar properties, but externalContents are
 * accumulated from the whole chain (parent first, deduplicated) instead of
 * being overridden, both at the root and per language in i18n (ARI-3292).
 * @param contents
 * @returns
 */
export function mergeSmartAssetAndParentSmartAsset(
  contents: ArianeeProductCertificateI18N[]
): ArianeeProductCertificateI18N {
  return contents.reduce<MergeableContent>(
    (merged, content) =>
      mergeContentPair(merged, (content ?? {}) as unknown as MergeableContent),
    {}
  ) as unknown as ArianeeProductCertificateI18N;
}
