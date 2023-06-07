import { Protocol } from '@arianee/common-types';

export type ReadLink = {
  certificateId: string;
  passphrase?: string;
  aat?: string;
  method: string;
  network: string;
  link: string;
};

export const readLink = (link: string): ReadLink => {
  let url: URL;

  try {
    url = new URL(link);
  } catch (e) {
    throw new Error('The link is not a valid URL');
  }

  const protocolName = getProtocolNameFromHostname(url.hostname.toLowerCase());
  if (!protocolName) throw new Error('No protocol found from hostname');

  const splitPathname = url.pathname.slice(1).split('/');

  const method =
    splitPathname.length > 1 ? splitPathname[0] : 'requestOwnership';

  const [certificateId, passphrase] =
    splitPathname.length > 1
      ? splitPathname[1].split(',')
      : splitPathname[0].split(',');

  const aat = url.searchParams.get('arianeeAccessToken') ?? undefined;

  return {
    certificateId,
    passphrase,
    aat,
    network: protocolName,
    method,
    link,
  };
};

const WHITELABEL_HOSTNAMES_TO_PROTOCOL_NAME: Record<string, Protocol['name']> =
  {
    'arianee.net': 'mainnet',
    'test.arianee.net': 'testnet',
    'test.arian.ee': 'testnet',
    'arian.ee': 'mainnet',
    'poly.arian.ee': 'polygon',
    'testnet.aria.fyi': 'testnet',
    'arialabs.arian.ee': 'mainnet',
    'poa.leclubleaderprice.fr': 'mainnet',
    'iwc-sokol.arianee.net': 'testnet',
    'poa.iwc.com': 'mainnet',
    'panerai-sokol.arianee.net': 'testnet',
    'poa.panerai.com': 'mainnet',
    'poa.yslbeauty.com': 'mainnet',
    'polygon.yslbeauty.com': 'ysl',
    'innovation-day.arian.ee': 'polygon',
    'stadetoulousain.arian.ee': 'stadetoulousain',
  };

export const getProtocolNameFromHostname = (
  hostname: string
): Protocol['name'] | null => {
  return WHITELABEL_HOSTNAMES_TO_PROTOCOL_NAME[hostname.toLowerCase()] || null;
};
