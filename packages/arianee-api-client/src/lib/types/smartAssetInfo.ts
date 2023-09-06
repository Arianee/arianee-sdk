import { BlockchainEvent, Protocol } from '@arianee/common-types';

export type smartAssetInfo = {
  events?: BlockchainEvent[];
  tokenId: string;
  network: Protocol['name'];
  owner?: string;
  issuer?: string;
  createAt: string;
  updatedAt: string;
  imprint?: string;
  requestKey: string;
  viewKey: string;
  proofKey: string;
};
