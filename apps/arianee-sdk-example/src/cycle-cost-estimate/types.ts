import { TxInfos } from '@arianee/creator';

interface LogFileAction extends TxInfos {
  type: 'hydrate' | 'event' | 'message';
  time: number;
}
interface LogFile {
  startTime: number;
  lastUpdateTime: number;
  lifecycleCount: number; // Each lifecycle is composed of a SmartAsset hydration, an event creation and a message creation (3 transactions)
  lifecycleAvgTime: number;
  errorCount: number;
  actions?: LogFileAction[];
}

interface SettlementBatch {
  id: number;
  timestamp: number;
  txHash: string;
  compressedTxCount: number;
  gasUsed: bigint;
  gasCost: bigint;
  etherPrice: number;
  usdCost: number;
  arbitrumUsdCost?: number;
  arbitrumNovaUsdCost?: number;
}

interface MsgPayForBlobs {
  id: number;
  timestamp: number;
  txId: number;
  gasCost: number;
  celestiaPrice: number;
  usdCost: number;
}

// Blockscout API (api/v2/arbitrum/batches)
interface BlockscoutCommitmentTransaction {
  block_number: number;
  hash: string;
  status: string;
  timestamp: string;
}

interface BlockscoutSettlementBatch {
  batch_data_container: string;
  blocks_count: number;
  commitment_transaction: BlockscoutCommitmentTransaction;
  number: number;
  transactions_count: number;
}

// Etherscan API
interface EtherscanTransaction {
  blockHash: string;
  blockNumber: string;
  from: string;
  gas: string;
  gasPrice: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  maxFeePerBlobGas: string;
  hash: string;
  input: string;
  nonce: string;
  to: string;
  transactionIndex: string;
  value: string;
  type: string;
  accessList: Array<{
    address: string;
    storageKeys: string[];
  }>;
  chainId: string;
  blobVersionedHashes: string[];
  v: string;
  r: string;
  s: string;
  yParity: string;
}

// Celenium API
interface CeleniumMessage {
  id: number;
  height: number;
  time: string;
  position: number;
  type: string;
  data: {
    BlobSizes: number[];
    Namespaces: string[];
    ShareCommitments: string[];
    ShareVersions: number[];
    Signer: string;
  };
  tx: {
    id: number;
    height: number;
    position: number;
    gas_wanted: number;
    gas_used: number;
    timeout_height: number;
    events_count: number;
    messages_count: number;
    hash: string;
    fee: string;
    time: string;
    message_types: string[];
    status: string;
  };
  namespace: {
    id: number;
    size: number;
    blobs_count: number;
    version: number;
    namespace_id: string;
    hash: string;
    pfb_count: number;
    last_height: number;
    last_message_time: string;
    name: string;
    reserved: boolean;
  };
}

export {
  LogFile,
  LogFileAction,
  SettlementBatch,
  MsgPayForBlobs,
  BlockscoutSettlementBatch,
  BlockscoutCommitmentTransaction,
  EtherscanTransaction,
  CeleniumMessage,
};
