import { isProtocolV2FromSlug } from '../../slug/slug';
import { getHostnameFromProtocolName } from '../readLink/readLink';

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
}: {
  slug: string;
  suffix?: string;
  tokenId: string;
  passphrase: string;
}) => {
  if (isProtocolV2FromSlug(slug)) {
    return `https://arian.ee${suffix}/${tokenId},${passphrase},${slug}`;
  } else {
    return `https://${getHostnameFromProtocolName(
      slug
    )}${suffix}/${tokenId},${passphrase}`;
  }
};
