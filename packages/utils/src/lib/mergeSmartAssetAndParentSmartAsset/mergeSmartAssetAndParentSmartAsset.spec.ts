import { ArianeeProductCertificateI18N } from '@arianee/common-types';

import { mergeSmartAssetAndParentSmartAsset } from './mergeSmartAssetAndParentSmartAsset';

const parentNotice = {
  type: 'website',
  title: 'Notice',
  url: 'https://example.com/notice',
};
const childLink = {
  type: 'website',
  title: 'Child link',
  url: 'https://example.com/child',
};

describe('mergeSmartAssetAndParentSmartAsset', () => {
  it('should let the child override the parent scalar properties', () => {
    const result = mergeSmartAssetAndParentSmartAsset([
      { name: 'parent name', description: 'parent description' },
      { name: 'child name' },
    ] as ArianeeProductCertificateI18N[]);

    expect(result).toEqual({
      name: 'child name',
      description: 'parent description',
    });
  });

  it('should concatenate child externalContents after the parent ones instead of overriding them (ARI-3292)', () => {
    const result = mergeSmartAssetAndParentSmartAsset([
      { name: 'parent name', externalContents: [parentNotice] },
      { name: 'child name', externalContents: [childLink] },
    ] as unknown as ArianeeProductCertificateI18N[]);

    expect(result.name).toEqual('child name');
    expect(result.externalContents).toEqual([parentNotice, childLink]);
  });

  it('should keep the parent externalContents when the child has none', () => {
    const result = mergeSmartAssetAndParentSmartAsset([
      { externalContents: [parentNotice] },
      { name: 'child name' },
    ] as unknown as ArianeeProductCertificateI18N[]);

    expect(result.externalContents).toEqual([parentNotice]);
  });

  it('should remove externalContents duplicated between parent and child', () => {
    const result = mergeSmartAssetAndParentSmartAsset([
      { externalContents: [parentNotice] },
      { externalContents: [{ ...parentNotice }, childLink] },
    ] as unknown as ArianeeProductCertificateI18N[]);

    expect(result.externalContents).toEqual([parentNotice, childLink]);
  });

  it('should accumulate externalContents across several parent levels', () => {
    const grandParentNotice = {
      type: 'website',
      title: 'Grand parent',
      url: 'https://example.com/grand-parent',
    };

    const result = mergeSmartAssetAndParentSmartAsset([
      { externalContents: [grandParentNotice] },
      { externalContents: [parentNotice] },
      { externalContents: [childLink] },
    ] as unknown as ArianeeProductCertificateI18N[]);

    expect(result.externalContents).toEqual([
      grandParentNotice,
      parentNotice,
      childLink,
    ]);
  });

  it('should concatenate i18n externalContents by language and keep parent-only languages (ARI-3292)', () => {
    const parentNoticeEn = {
      type: 'website',
      title: 'Notice EN',
      url: 'https://example.com/notice-en',
    };
    const parentNoticeFr = {
      type: 'website',
      title: 'Notice FR',
      url: 'https://example.com/notice-fr',
    };
    const childLinkEn = {
      type: 'website',
      title: 'Child link EN',
      url: 'https://example.com/child-en',
    };

    const result = mergeSmartAssetAndParentSmartAsset([
      {
        i18n: [
          { language: 'fr-FR', externalContents: [parentNoticeFr] },
          { language: 'en-US', externalContents: [parentNoticeEn] },
        ],
      },
      { i18n: [{ language: 'en-US', externalContents: [childLinkEn] }] },
    ] as unknown as ArianeeProductCertificateI18N[]);

    expect(result.i18n).toEqual([
      { language: 'fr-FR', externalContents: [parentNoticeFr] },
      { language: 'en-US', externalContents: [parentNoticeEn, childLinkEn] },
    ]);
  });
});
