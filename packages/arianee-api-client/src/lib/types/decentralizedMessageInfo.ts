import { Protocol } from '@arianee/common-types';

export type decentralizedMessageInfo = {
  messageId: string;
  network: Protocol['name'];
  isRead: boolean;
  sentAt: string;
  sentAtBlockNumber: number;
  receiver: string;
  sender: string;
  tokenId: string;
  createdAt: string;
  updatedAt: string;
  imprint: string;
};
