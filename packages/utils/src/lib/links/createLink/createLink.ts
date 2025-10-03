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
  // Determine the base URL and custom domain info
  let baseUrl: string;
  let customUrl: URL | null = null;

  if (brandIdentity) {
    const customDomain = extractCustomDomainFromBrandIdentity(brandIdentity);
    if (customDomain) {
      try {
        customUrl = new URL(
          customDomain.startsWith('http')
            ? customDomain
            : `https://${customDomain}`
        );
      } catch {
        // If URL parsing fails, treat as hostname only
        customUrl = new URL(`https://${customDomain}`);
      }
    }
  }

  // Set the path: suffix + customPath + tokenId,passphrase
  let path = suffix;
  if (customUrl?.pathname) {
    // Remove leading slash from customPath and trailing slash from suffix
    const customPath = customUrl.pathname.replace(/^\/+|\/+$/g, '');
    const cleanSuffix = suffix.replace(/\/+$/, '');
    path = cleanSuffix + (customPath ? `/${customPath}` : '');
  }

  // Add the tokenId,passphrase part
  const tokenPart = isProtocolV2FromSlug(slug)
    ? `${tokenId},${passphrase},${slug}`
    : `${tokenId},${passphrase}`;

  const fullPath = `${path}/${tokenPart}`;

  // Build the final URL
  if (customUrl) {
    // Use URL constructor for custom domains to handle query parameters properly
    const url = new URL(customUrl.origin + fullPath);
    // Ensure we use HTTPS
    url.protocol = 'https:';
    if (customUrl.search) {
      url.search = customUrl.search;
    }
    return url.toString();
  } else {
    // For non-custom domains, construct manually to preserve case
    const hostname = getHostnameFromProtocolName(slug) ?? `${slug}.arianee.net`;
    const baseUrl = isProtocolV2FromSlug(slug)
      ? 'https://arian.ee'
      : `https://${hostname}`;
    return `${baseUrl}${fullPath}`;
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
 * @returns the custom domain URL or undefined
 */
const extractCustomDomainFromBrandIdentity = (brandIdentity: BrandIdentity) => {
  const deepLinkDomainUrl = brandIdentity?.rawContent?.externalContents?.find(
    (ec) => ec.type === 'deepLinkDomain'
  )?.url;

  if (deepLinkDomainUrl && deepLinkDomainUrl?.length > 0) {
    return deepLinkDomainUrl;
  }

  return undefined;
};
