import { ArianeeProductCertificateI18N } from '@arianee/common-types';

/**
 * Merge array of smart asset.
 * Ex: parent nft should be in first position, children last positions.
 * @param contents
 * @returns
 */
export function mergeSmartAssetAndParentSmartAsset(
  contents: ArianeeProductCertificateI18N[]
): ArianeeProductCertificateI18N {
  const content: ArianeeProductCertificateI18N = <
    ArianeeProductCertificateI18N
  >{};
  contents.forEach((d) => {
    Object.assign(content, d);
  });
  return content;
}
