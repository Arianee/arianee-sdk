import { isProtocolV2FromSlug } from '../../slug/slug';
import { getHostnameFromProtocolName } from '../readLink/readLink';
import { IdentityInstance } from '@arianee/wallet';
import { BrandIdentity } from '@arianee/common-types';

/**
 * Creates a valid proof / request / view link for a smart asset based on the protocol slug
 * @param slug the protocol slug (also known as protocol name or network name)
 * @param suffix the optional suffix of the link (e.g. /proof)
 * @param tokenId the token id of the smart asset
 * @param passphrase the passphrase of the smart asset
 * @returns a valid link
 */
export const createLink = ({
  slug,
  suffix = '',
  tokenId,
  passphrase,
  brandIdentity,
}: {
  slug: string;
  suffix?: string;
  tokenId: string;
  passphrase: string;
  brandIdentity?: IdentityInstance<BrandIdentity>;
}) => {
  let customDomain: string | undefined;
  if (brandIdentity) {
    customDomain = extractCustomDomainFromBrandIdentity(brandIdentity);
    console.log('customDomain', customDomain);
  }

  if (isProtocolV2FromSlug(slug)) {
    return `https://arian.ee${suffix}/${tokenId},${passphrase},${slug}`;
  } else {
    return `https://${
      customDomain ?? getHostnameFromProtocolName(slug)
    }${suffix}/${tokenId},${passphrase}`;
  }
};

const extractCustomDomainFromBrandIdentity = (
  brandIdentity: IdentityInstance<BrandIdentity>
) => {
  let customDomain: string | undefined;

  const deepLinkDomainUrl =
    brandIdentity?.data?.rawContent?.externalContents?.find(
      (ec) => ec.type === 'deepLinkDomain'
    )?.url;
  if (deepLinkDomainUrl && deepLinkDomainUrl?.length > 0) {
    customDomain = deepLinkDomainUrl;
    if (customDomain.startsWith('http://')) {
      customDomain = customDomain.replace('http://', '');
    }
    if (customDomain.startsWith('https://')) {
      customDomain = customDomain.replace('https://', '');
    }
    if (customDomain.endsWith('/')) {
      customDomain = customDomain.slice(0, -1);
    }
  }

  return customDomain;
};
