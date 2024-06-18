import { Protocol } from './protocol';

export interface EventData {
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
  removed: boolean;
  id: string;
}

export interface BlockchainEvent {
  eventData: EventData;
  protocol: Protocol;
  timestamp: number;
  smartContractName: string;
  blockNumber: number;
  contractAddress: string;
}

export interface UnnestedBlockchainEvent extends EventData {
  protocol: Protocol;
  timestamp: number;
  smartContractName: string;
  blockNumber: number;
  contractAddress: string;
}
