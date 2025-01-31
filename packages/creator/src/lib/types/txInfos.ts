export type TxInfos = {
  txHash: string;
  gasUsed?: bigint;
  gasPrice?: bigint;
  blobGasUsed?: bigint | null;
  blobGasPrice?: bigint | null;
  cumulativeGasUsed?: bigint;
  fee?: bigint;
};
