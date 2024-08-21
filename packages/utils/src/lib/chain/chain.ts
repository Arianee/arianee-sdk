import {
  ChainID,
  ChainType,
  Protocol,
  ProtocolName,
} from '@arianee/common-types';

export const CHAIN_TYPE_IDS: {
  [key in ChainType]: { name: ProtocolName; id: ChainID }[];
} = {
  testnet: [
    { name: ProtocolName.testnet, id: 77 },
    { name: ProtocolName.mumbai, id: 80001 },
    { name: ProtocolName.arianeeTestnet, id: 42 },
    { name: ProtocolName.testnetSbt, id: 77 },
    { name: ProtocolName.tezostestnet, id: 42793 },
    { name: ProtocolName.supernettestnet, id: 999118981 },
    { name: ProtocolName.etherlinktestnet, id: 128123 },
  ],
  mainnet: [
    { name: ProtocolName.mainnet, id: 99 },
    { name: ProtocolName.polygon, id: 137 },
    { name: ProtocolName.stadetoulousain, id: 137 },
    { name: ProtocolName.ysl, id: 137 },
    { name: ProtocolName.arialabs, id: 137 },
    { name: ProtocolName.arianeeSupernet, id: 11891 },
    { name: ProtocolName.arianeesbt, id: 11891 },
    { name: ProtocolName.richemontsupernet, id: 11891 },
  ],
};
export const chainIdsByChainType = (chainType: ChainType): number[] =>
  CHAIN_TYPE_IDS[chainType].map((element) => element.id);

export const chainNamesByChainType = (chainType: ChainType): ProtocolName[] =>
  CHAIN_TYPE_IDS[chainType].map((element) => element.name);

export const protocolNameToChainType = (protocolName: Protocol['name']) => {
  const chainType = Object.keys(CHAIN_TYPE_IDS).find((chainType) =>
    CHAIN_TYPE_IDS[chainType as ChainType].find(
      (chain) => chain.name === protocolName
    )
  ) as ChainType;
  if (chainType) return chainType;
  console.warn('No matching chain type found, returning default chain type');
  return 'mainnet'; // default chain type
};

export const protocolNameToChainId = (
  protocolName: Protocol['name']
): number => {
  if (protocolName.includes('-')) {
    return parseInt(protocolName.split('-')[0]);
  }

  for (const chainType in CHAIN_TYPE_IDS) {
    const chain = CHAIN_TYPE_IDS[chainType as ChainType].find(
      (chain) => chain.name === protocolName
    );
    if (chain) return chain.id;
  }
  console.warn('No matching chain ID found, returning default chain ID');
  return protocolNameToChainId('polygon'); // default chain id
};

export const getChainTypeOf = (protocolName: string): ChainType =>
  protocolNameToChainType(protocolName);
