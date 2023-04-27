import { Protocol } from './protocol';

export interface BlockchainEvent {
  returnValues: {
    [key: string]: unknown;
  };
  raw: {
    data: string;
    topics: string[];
  };
  event: string;
  signature: string;
  logIndex: number;
  transactionIndex: number;
  transactionHash: string;
  blockHash: string;
  blockNumber: number;
  address: string;
  protocol: Protocol;
  timestamp: string;
}
