import { ChainType, Protocol } from '@arianee/common-types';

export const getChainTypeOf = (protocolName: string): ChainType => {
  switch (protocolName) {
    case 'testnet':
    case 'mumbai':
    case 'arianeeTestnet':
      return 'testnet';
    default:
      return 'mainnet';
  }
};

export const protocolNameToChainId = (protocolName: Protocol['name']) => {
  if (protocolName.includes('-')) {
    return parseInt(protocolName.split('-')[0]);
  }

  switch (protocolName) {
    case 'ethereum':
      return 1;
    case 'mainnet':
      return 99;
    case 'testnet':
      return 77;
    case 'mumbai':
      return 80001;
    case 'arianeeSupernet':
      return 11891;
    default:
      return 137;
  }
};
