import { Protocol, ProtocolName } from '@arianee/common-types';

export type WalletRewards = {
  poa: string;
  sokol: string;
  polygon: string;
  supernet: string;
};

export const getWalletReward = (
  protocolName: Protocol['name'],
  walletRewards: WalletRewards
): string => {
  switch (protocolName) {
    case 'mainnet':
    case 'poa':
      return walletRewards.poa;
    case 'testnet':
    case 'sokol':
      return walletRewards.sokol;
    case ProtocolName.richemontsupernet:
    case ProtocolName.arianeeSupernet:
      return walletRewards.supernet;
    case 'polygon':
    default:
      return walletRewards.polygon;
  }
};
