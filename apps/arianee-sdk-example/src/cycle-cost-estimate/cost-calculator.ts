import { formatEther, toBigInt } from 'ethers';
import { existsSync, readFileSync } from 'fs';
import {
  BlockscoutSettlementBatch,
  CeleniumMessage,
  EtherscanTransaction,
  LogFile,
  MsgPayForBlobs,
  SettlementBatch,
} from './types';
import { waitFor } from './utils';

const LOG_FILE = 'logs/1234.json';
const BLOCKSCOUT_API_BATCHES_ENDPOINT =
  'https://cycle-alpha.calderaexplorer.xyz/api/v2/arbitrum/batches';
const ETHERSCAN_API_KEY = '123';
const ETHERSCAN_API_TX_ENDPOINT = `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=%Hash%&apikey=${ETHERSCAN_API_KEY}`;

const ARBISCAN_API_KEY = '123';
const ARBISCAN_API_BLOCK_BY_TIME_ENDPOINT = `https://api.arbiscan.io/api?module=block&action=getblocknobytime&timestamp=%Timestamp%&closest=before&apikey=${ARBISCAN_API_KEY}`;
const ARBITRUM_RPC_URL = 'https://arb1.arbitrum.io/rpc';

const CELENIUM_NAMESPACE_ID = '123';
const CELENIUM_NAMESPACE_VERSION = '0';

const readLogFile = (path: string): LogFile => {
  if (!existsSync(path)) {
    throw new Error('File not found');
  }
  return JSON.parse(readFileSync(path, 'utf8')) as LogFile;
};

const fetchSettlementBatches = async (
  from: number,
  to: number
): Promise<BlockscoutSettlementBatch[]> => {
  const fetchSettlementBatchesPage = async (number?: number) => {
    const response = await fetch(
      `${BLOCKSCOUT_API_BATCHES_ENDPOINT}?items_count=500${
        number ? '&number=' + number : ''
      }`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch batches');
    }
    return response.json();
  };

  let nextNumber: number | undefined = undefined;
  let batches = [];
  let foundInRange = false;

  while (true) {
    const data = await fetchSettlementBatchesPage(nextNumber);
    const items = data.items;

    if (items.length === 0) {
      break;
    }

    for (const item of items) {
      const timestamp = new Date(
        item.commitment_transaction.timestamp
      ).getTime();
      if (timestamp >= from && timestamp <= to) {
        foundInRange = true;
        batches.push(item);
      } else if (foundInRange && timestamp > to) {
        return batches;
      }
    }

    if (!foundInRange) {
      nextNumber = data.next_page_params.number;
      await waitFor(2000);
    } else {
      break;
    }
  }

  return batches;
};

const fetchPayForBlobMessages = async (
  from: number,
  to: number
): Promise<CeleniumMessage[]> => {
  const fetchMessagesPage = async (offset: number) => {
    const response = await fetch(
      `https://api-mainnet.celenium.io/v1/namespace/${CELENIUM_NAMESPACE_ID}/${CELENIUM_NAMESPACE_VERSION}/messages?limit=100&offset=${offset}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    return response.json();
  };

  let offset = 0;
  let messages: CeleniumMessage[] = [];
  let foundInRange = false;

  while (true) {
    const data = await fetchMessagesPage(offset);
    if (data.length === 0) {
      break;
    }

    for (const message of data) {
      const timestamp = new Date(message.time).getTime();
      if (timestamp >= from && timestamp <= to) {
        foundInRange = true;
        if (
          // message.namespace.blobs_count > 0 &&
          message.type === 'MsgPayForBlobs'
        ) {
          messages.push(message);
        }
      } else if (foundInRange && timestamp > to) {
        return messages;
      }
    }

    if (!foundInRange) {
      offset += 100;
      await waitFor(2000);
    } else {
      break;
    }
  }

  return messages;
};

const getTransaction = async (
  endpoint: string,
  hash: string
): Promise<EtherscanTransaction> => {
  const response = await fetch(endpoint.replace('%Hash%', hash));
  if (!response.ok) {
    throw new Error('Failed to fetch layer 1 transaction');
  }

  const data = await response.json();
  if (data.result === null) {
    throw new Error('Transaction not found');
  }

  return data.result;
};

const getBlockNumberByTimestamp = async (
  endpoint: string,
  timestamp: number
): Promise<string> => {
  const response = await fetch(
    endpoint.replace('%Timestamp%', Math.floor(timestamp / 1000).toString())
  );
  const data = await response.json();
  if (data.status !== '1') {
    throw new Error('Failed to fetch Arbitrum block number');
  }
  return data.result;
};

const getBlockByNumber = async (
  rpcUrl: string,
  blockNumber: string
): Promise<any> => {
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getBlockByNumber',
      params: ['0x' + Number(blockNumber).toString(16), true],
      id: 1,
    }),
  });
  const data = await response.json();
  return data.result;
};

const getCoinPriceAt = async (
  coin: string,
  timestamp: number,
  currency: string = 'usd'
): Promise<number> => {
  const from = Math.floor(timestamp / 1000);
  const to = Math.floor(timestamp / 1000) + 3600; // 1 hour window
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/${coin}/market_chart/range?vs_currency=${currency}&from=${from}&to=${to}`
  );
  // We can't use `interval=5m` because we need an entreprise account for that, so this will give only the price for the closest hour

  const data = await response.json();
  if (data.status?.error_code === 429) {
    throw new Error('Rate limit exceeded');
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch ${coin} price`);
  }
  if (!data.prices || data.prices.length === 0) {
    throw new Error('Price data not found');
  }

  // Find the closest price to the given timestamp
  const closestPrice = data.prices.reduce((prev, curr) => {
    return Math.abs(curr[0] - timestamp) < Math.abs(prev[0] - timestamp)
      ? curr
      : prev;
  });

  return Math.floor(closestPrice[1]);
};

const getEffectiveGasPrice = (tx: any, baseFee: bigint): bigint => {
  if (tx.gasPrice) {
    return toBigInt(tx.gasPrice);
  }
  if (tx.maxFeePerGas && tx.maxPriorityFeePerGas) {
    const maxFee = toBigInt(tx.maxFeePerGas);
    const maxPriority = toBigInt(tx.maxPriorityFeePerGas);
    const candidate = baseFee + maxPriority;
    return candidate < maxFee ? candidate : maxFee;
  }
  return baseFee;
};

export default async () => {
  const logFile = readLogFile(LOG_FILE);
  if (logFile.lifecycleCount === 0 || logFile.actions.length === 0) {
    throw new Error('No lifecycle nor actions found');
  }

  const startTime = logFile.startTime;
  const endTime = logFile.lastUpdateTime + 60 * 60 * 1000; // 1 hour window to avoid missing batches posted after `lastUpdateTime`

  // Settlement cost estimate...
  console.log(
    `\nFecthing settlement batches from ${startTime} to ${endTime}...`
  );
  const bsSettlementBatches = await fetchSettlementBatches(startTime, endTime);
  console.log(`Found ${bsSettlementBatches.length} settlement batches`);

  let etherPriceAvg = 0;
  let gasCostUsedAvg = BigInt(0);
  let etherGasPriceAvg = 0;
  let arbitrumGasPriceAvg = 0;

  const settlementBatches: SettlementBatch[] = [];
  for (const bsSettlementBatch of bsSettlementBatches) {
    const { number, commitment_transaction, transactions_count } =
      bsSettlementBatch;
    console.log(`Estimating cost for batch ${number}...`);
    const { hash, timestamp: timestampAsStr } = commitment_transaction;
    const timestamp = new Date(timestampAsStr).getTime();

    const commitmentTx = await getTransaction(ETHERSCAN_API_TX_ENDPOINT, hash);
    const commitmentTxGasUsed = toBigInt(commitmentTx.gas);
    const batchGasCost = commitmentTxGasUsed * toBigInt(commitmentTx.gasPrice);

    const etherPriceAt = await getCoinPriceAt('ethereum', timestamp);
    const batchUsdCost = Number(formatEther(batchGasCost)) * etherPriceAt;
    console.log(
      `Batch ${
        bsSettlementBatch.number
      } estimated cost on Ethereum (L1) is ${batchUsdCost.toFixed(2)} USD`
    );

    // Arbitrum cost estimate...
    const arbAvgGasPrice = BigInt(500000000); // Arbitrarily set to 0.5 Gwei (most of the time it's actually 0.25 Gwei or less)
    const arbitrumBatchGasCost = commitmentTxGasUsed * arbAvgGasPrice;
    const arbitrumBatchUsdCost =
      Number(formatEther(arbitrumBatchGasCost)) * etherPriceAt;
    console.log(
      `Batch ${
        bsSettlementBatch.number
      } estimated cost on Arbitrum (L2) is ${arbitrumBatchUsdCost.toFixed(
        4
      )} USD`
    );

    settlementBatches.push({
      id: number,
      timestamp: new Date(timestamp).getTime(),
      txHash: hash,
      compressedTxCount: transactions_count,
      gasUsed: commitmentTxGasUsed,
      gasCost: batchGasCost,
      etherPrice: etherPriceAt,
      usdCost: batchUsdCost,
      arbitrumUsdCost: arbitrumBatchUsdCost,
    });

    etherPriceAvg += etherPriceAt;
    gasCostUsedAvg += commitmentTxGasUsed;
    etherGasPriceAvg += Number(commitmentTx.gasPrice);
    arbitrumGasPriceAvg += Number(arbAvgGasPrice);

    // Wait to avoid rate limiting
    await waitFor(15000);
  }

  etherPriceAvg /= bsSettlementBatches.length;
  gasCostUsedAvg /= BigInt(bsSettlementBatches.length);
  etherGasPriceAvg /= bsSettlementBatches.length;
  arbitrumGasPriceAvg /= bsSettlementBatches.length;
  console.log('etherPriceAvg', etherPriceAvg);
  console.log('gasCostUsedAvg', gasCostUsedAvg);
  console.log('etherGasPriceAvg', etherGasPriceAvg);
  console.log('arbitrumGasPriceAvg', arbitrumGasPriceAvg);

  const totalSettlementUsdCost = settlementBatches.reduce(
    (acc, batch) => acc + batch.usdCost,
    0
  );
  console.log(
    `Total settlement estimated cost on Ethereum (L1) is ${totalSettlementUsdCost.toFixed(
      2
    )} USD`
  );
  const totalSettlementArbitrumUsdCost = settlementBatches.reduce(
    (acc, batch) => acc + batch.arbitrumUsdCost,
    0
  );
  console.log(
    `Total settlement estimated cost on Arbitrum (L2) is ${totalSettlementArbitrumUsdCost.toFixed(
      4
    )} USD`
  );

  // Waiting again to avoid rate limiting
  console.log('\nWaiting 60 seconds to avoid rate limiting...');
  await waitFor(60000);

  // Data availability cost estimate...
  console.log(
    `\nFecthing "PayForBlob" messages from ${startTime} to ${endTime}...`
  );
  const celPayForBlobMessages = await fetchPayForBlobMessages(
    startTime,
    endTime
  );
  console.log(`Found ${celPayForBlobMessages.length} "PayForBlob" messages`);

  let celestiaPriceAvg = 0;
  let celestiaGasUsedAvg = 0;
  let celestiaTxFeeAvg = 0;

  const msgsPayForBlob: MsgPayForBlobs[] = [];
  for (const celPayForBlobMsg of celPayForBlobMessages) {
    const { id, tx, time } = celPayForBlobMsg;
    console.log(`Estimating cost for message ${id}...`);
    const { fee: txFee, time: txTime, gas_used } = tx;
    const celestiaPriceAt = await getCoinPriceAt(
      'celestia',
      new Date(txTime).getTime()
    );
    const msgUsdCost = (Number(txFee) / 1e6) * celestiaPriceAt;
    console.log(`Message ${id} estimated cost is ${msgUsdCost.toFixed(4)} USD`);
    msgsPayForBlob.push({
      id,
      timestamp: new Date(time).getTime(),
      txId: tx.id,
      gasCost: tx.gas_used,
      celestiaPrice: celestiaPriceAt,
      usdCost: msgUsdCost,
    });

    celestiaPriceAvg += celestiaPriceAt;
    celestiaGasUsedAvg += Number(gas_used);
    celestiaTxFeeAvg += Number(txFee);

    // Wait to avoid rate limiting
    await waitFor(15000);
  }

  celestiaPriceAvg /= celPayForBlobMessages.length;
  celestiaGasUsedAvg /= celPayForBlobMessages.length;
  celestiaTxFeeAvg /= celPayForBlobMessages.length;
  console.log('celestaPriceAvg', celestiaPriceAvg);
  console.log('celestaGasUsedAvg', celestiaGasUsedAvg);
  console.log('celestaTxFeeAvg', celestiaTxFeeAvg);

  const totalMsgsPayForBlobUsdCost = msgsPayForBlob.reduce(
    (acc, msg) => acc + msg.usdCost,
    0
  );
  console.log(
    `Total data availability estimated cost is ${totalMsgsPayForBlobUsdCost.toFixed(
      4
    )} USD\n`
  );

  // Total cost estimate...
  const l2TxCount = logFile.actions.length;
  const compressedL1TxCount = settlementBatches
    .map((b) => b.compressedTxCount)
    .reduce((a, b) => a + b, 0);

  // Check if the number of compressed transactions posted on the L1 is almost equal (~5%) to the number of transactions on the L2
  const diffTxCountPercent = Math.abs(
    (l2TxCount - compressedL1TxCount) / l2TxCount
  );
  if (diffTxCountPercent > 0.05) {
    console.warn(
      `WARNING: The number of compressed transactions posted on the L1 (${compressedL1TxCount}) is significantly different from the number of transactions on the L2 (${l2TxCount}) [~${
        diffTxCountPercent * 100
      }%]`
    );
  }

  // We count 2 transactions per L2 transaction (one for the actual transaction and one for the `startBlock` transaction)
  const adjustedTxCount = l2TxCount * 2;

  const totalSettlementUsdCostAdjusted =
    (totalSettlementUsdCost / compressedL1TxCount) * adjustedTxCount;
  const totalSettlementArbitrumUsdCostAdjusted =
    (totalSettlementArbitrumUsdCost / compressedL1TxCount) * adjustedTxCount;
  const totalMsgsPayForBlobUsdCostAdjusted =
    (totalMsgsPayForBlobUsdCost / compressedL1TxCount) * adjustedTxCount;

  const usdCostPerTxAdjusted =
    (totalSettlementUsdCostAdjusted + totalMsgsPayForBlobUsdCostAdjusted) /
    l2TxCount;
  const arbitrumUsdCostPerTxAdjusted =
    (totalSettlementArbitrumUsdCostAdjusted +
      totalMsgsPayForBlobUsdCostAdjusted) /
    l2TxCount;

  // There is no need to count the gas used for the `startBlock` transaction because it's 0
  const totalL2GasUsed = logFile.actions.reduce(
    (acc, action) =>
      acc + (action.gasUsed ? BigInt(action.gasUsed) : BigInt(0)),
    BigInt(0)
  );

  // const usdCostPerGas =
  //   (totalSettlementUsdCost + totalMsgsPayForBlobUsdCost) /
  //   Number(totalL2GasUsed);
  // const arbitrumUsdCostPerGas =
  //   (totalSettlementArbitrumUsdCost + totalMsgsPayForBlobUsdCost) /
  //   Number(totalL2GasUsed);

  console.table([
    {
      label: 'L2 Transaction Count',
      value: l2TxCount,
    },
    {
      label: 'L2 Transaction Count Adjusted',
      value: adjustedTxCount,
    },
    {
      label: 'L2 Total Gas Used',
      value: `${totalL2GasUsed}`,
    },
    {
      label: 'L1 Compressed Transaction Count',
      value: compressedL1TxCount,
    },
    {
      label: 'L1 Batch Count',
      value: settlementBatches.length,
    },
    {
      label: 'Celestia "PayForBlob" Message Count',
      value: celPayForBlobMessages.length,
    },
    {},
    {
      label: 'Settlement Cost on Ethereum (L1) Adjusted',
      value: `${totalSettlementUsdCostAdjusted.toFixed(2)} USD`,
    },
    {
      label: 'Settlement Cost on Arbitrum (L2) Adjusted',
      value: `${totalSettlementArbitrumUsdCostAdjusted.toFixed(4)} USD`,
    },
    {
      label: 'Data Availability Cost Adjusted',
      value: `${totalMsgsPayForBlobUsdCostAdjusted.toFixed(4)} USD`,
    },
    {},
    {
      label: 'USD Cost per Transaction w/ Ethereum (L1) Adjusted',
      value: `${usdCostPerTxAdjusted.toFixed(4)} USD`,
    },
    {
      label: 'Total Cost w/ Ethereum (L1) Adjusted',
      value: `${(
        totalSettlementUsdCostAdjusted + totalMsgsPayForBlobUsdCostAdjusted
      ).toFixed(2)} USD`,
    },
    {},
    {
      label: 'USD Cost per Transaction w/ Arbitrum (L2) Adjusted',
      value: `${arbitrumUsdCostPerTxAdjusted.toFixed(4)} USD`,
    },
    {
      label: 'Total Cost w/ Arbitrum (L2) Adjusted',
      value: `${(
        totalSettlementArbitrumUsdCostAdjusted +
        totalMsgsPayForBlobUsdCostAdjusted
      ).toFixed(4)} USD`,
    },
  ]);
};
