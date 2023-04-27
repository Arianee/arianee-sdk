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
  chainId: number;
  network: string;
  timestamp: string;
}
