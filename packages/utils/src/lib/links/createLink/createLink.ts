import { BrandIdentity } from '@arianee/common-types';
import { ethers } from 'ethers';

import { isProtocolV2FromSlug } from '../../slug/slug';
import { getHostnameFromProtocolName } from '../readLink/readLink';

const RESOLVER_BASE_URL = 'https://q.arianee.net';

/**
 * Creates a valid proof / request / view link for a smart asset based on the protocol slug
 * @param slug the protocol slug (also known as protocol name or network name)
 * @param suffix the optional suffix of the link (e.g. /proof)
 * @param tokenId the token id of the smart asset
 * @param passphrase the passphrase of the smart asset
 * @param brandIdentity a brand identity object to extract custom domain from (if any), custom domain of the identity will be used as the hostname
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
  brandIdentity?: BrandIdentity;
}) => {
  let customDomain: string | undefined;
  if (brandIdentity) {
    customDomain = extractCustomDomainFromBrandIdentity(brandIdentity);
  }

  if (isProtocolV2FromSlug(slug)) {
    return `https://arian.ee${suffix}/${tokenId},${passphrase},${slug}`;
  } else {
    const hostname =
      customDomain ??
      getHostnameFromProtocolName(slug) ??
      `${slug}.arianee.net`;
    return `https://${hostname}${suffix}/${tokenId},${passphrase}`;
  }
};

/**
 * Creates a valid proof / request / view link for the link resolver
 * @param slug the protocol slug (also known as protocol name or network name)
 * @param suffix the optional suffix of the link (e.g. /proof)
 * @param tokenId the token id of the smart asset
 * @param passphrase the passphrase of the smart asset
 * @param identityAddress the address of the identity that will be used as parameter in the link
 * @param resolverBaseURL optionally overrides the base url of the link resolver
 * @returns a valid link
 */
export const createResolverLink = ({
  slug,
  suffix = '',
  tokenId,
  passphrase,
  identityAddress,
  resolverBaseURL,
}: {
  slug: string;
  suffix?: string;
  tokenId: string;
  passphrase: string;
  identityAddress: string;
  resolverBaseURL?: string;
}) => {
  const _resolverBaseURL = resolverBaseURL?.endsWith('/')
    ? resolverBaseURL.slice(0, -1)
    : resolverBaseURL;

  if (!ethers.isAddress(identityAddress))
    throw new Error('invalid identity address');

  if (!tokenId) throw new Error('tokenId is required');
  if (!passphrase) throw new Error('passphrase is required');
  if (!slug) throw new Error('slug is required');

  return `${
    _resolverBaseURL ?? RESOLVER_BASE_URL
  }${suffix}/${tokenId},${passphrase},${slug},${identityAddress}`;
};

/**
 * Extracts the custom domain located in brand identity external contents if any
 * @param brandIdentity the brand identity
 * @returns the custom domain or undefined
 */
const extractCustomDomainFromBrandIdentity = (brandIdentity: BrandIdentity) => {
  let customDomain: string | undefined;

  const deepLinkDomainUrl = brandIdentity?.rawContent?.externalContents?.find(
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
