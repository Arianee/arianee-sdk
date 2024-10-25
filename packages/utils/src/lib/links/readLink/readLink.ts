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

  const protocolNameV1 = getProtocolNameFromHostname(
    url.hostname.toLowerCase()
  );

  const splitPathname = url.pathname.slice(1).split('/');

  const method =
    splitPathname.length > 1 ? splitPathname[0] : 'requestOwnership';

  const [certificateId, passphrase, protocolNameV2] =
    splitPathname.length > 1
      ? splitPathname[1].split(',')
      : splitPathname[0].split(',');

  if (!protocolNameV1 && !protocolNameV2) throw new Error('No protocol found');

  const aat = url.searchParams.get('arianeeAccessToken') ?? undefined;

  return {
    certificateId,
    passphrase,
    aat,
    network: protocolNameV2 ?? protocolNameV1,
    method,
    link,
  };
};

const WHITELABEL_HOSTNAMES_TO_PROTOCOL_NAME: Record<string, Protocol['name']> =
  {
    'test.arian.ee': 'testnet',
    'arian.ee': 'mainnet',
    'arianee.net': 'mainnet',
    'test.arianee.net': 'testnet',
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
    'testsbt.arian.ee': 'testnetSbt',
    'supernet.arian.ee': 'arianeeSupernet',
    'supernet.arianee.net': 'arianeeSupernet',
    'arianeesbt.arian.ee': 'arianeesbt',
    'arianeesbt.arianee.net': 'arianeesbt',
    'sbt.panerai.com': 'arianeesbt',
    'paneraisbt.arianee.net': 'arianeesbt',
    'supernettestnet.arian.ee': 'supernettestnet',
    'tezostestnet.arianee.net': 'tezostestnet',
    'etherlinktestnet.arianee.net': 'etherlinktestnet',
    'etherlinktestnet.arian.ee': 'etherlinktestnet',
  };

export const getProtocolNameFromHostname = (
  hostname: string
): Protocol['name'] | null => {
  return WHITELABEL_HOSTNAMES_TO_PROTOCOL_NAME[hostname.toLowerCase()] || null;
};

export const getHostnameFromProtocolName = (protocolName: Protocol['name']) => {
  return Object.entries(WHITELABEL_HOSTNAMES_TO_PROTOCOL_NAME).find(
    ([, value]) => value === protocolName
  )?.[0];
};
