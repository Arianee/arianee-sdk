export type blockchainEventFilters = {
  fromBlock?: number;
  toBlock?: number | string;
  createdAfter?: string;
  createdAt?: string;

  [key: string]: any;
};
