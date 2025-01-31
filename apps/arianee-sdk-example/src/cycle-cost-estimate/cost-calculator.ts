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
const ETHERSCAN_API_KEY = 'XXX';
const ETHERSCAN_API_TX_ENDPOINT = `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=%Hash%&apikey=${ETHERSCAN_API_KEY}`;

const CELENIUM_NAMESPACE_ID = '1234';
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

const fetchLayer1Transaction = async (
  hash: string
): Promise<EtherscanTransaction> => {
  const response = await fetch(
    ETHERSCAN_API_TX_ENDPOINT.replace('%Hash%', hash)
  );
  if (!response.ok) {
    throw new Error('Failed to fetch layer 1 transaction');
  }

  const data = await response.json();
  if (data.result === null) {
    throw new Error('Transaction not found');
  }

  return data.result;
};

const getCoinPriceAt = async (
  coin: string,
  timestamp: number,
  currency: string = 'usd'
): Promise<number> => {
  const from = Math.floor(timestamp / 1000);
  const to = Math.floor(timestamp / 1000) + 300; // 5 minutes window
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/${coin}/market_chart/range?vs_currency=${currency}&from=${from}&to=${to}`
  );
  // We can't use `interval=5m` because we need an entreprise account for that, so this will give only the price for the closest hour
  if (!response.ok) {
    throw new Error(`Failed to fetch ${coin} price`);
  }

  const data = await response.json();
  if (data.status?.error_code === 429) {
    throw new Error('Rate limit exceeded');
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

export default async () => {
  const logFile = readLogFile(LOG_FILE);
  if (logFile.lifecycleCount === 0 || logFile.actions.length === 0) {
    throw new Error('No lifecycle nor actions found');
  }

  // -- Settlement cost estimate

  console.log(
    `\nFecthing settlement batches from ${logFile.startTime} to ${logFile.lastUpdateTime}...`
  );
  const bsSettlementBatches = await fetchSettlementBatches(
    logFile.startTime,
    logFile.lastUpdateTime
  );
  console.log(`Found ${bsSettlementBatches.length} settlement batches`);

  const settlementBatches: SettlementBatch[] = [];
  for (const bsSettlementBatch of bsSettlementBatches) {
    const { number, commitment_transaction, transactions_count } =
      bsSettlementBatch;
    console.log(`Estimating cost for batch ${number}...`);
    const { hash, timestamp } = commitment_transaction;
    const commitmentTx = await fetchLayer1Transaction(hash);
    const batchGasCost =
      toBigInt(commitmentTx.gas) * toBigInt(commitmentTx.gasPrice);
    const etherPriceAt = await getCoinPriceAt(
      'ethereum',
      new Date(timestamp).getTime()
    );
    const batchUsdCost = Number(formatEther(batchGasCost)) * etherPriceAt;
    console.log(
      `Batch ${
        bsSettlementBatch.number
      } estimated cost is ${batchUsdCost.toFixed(2)} USD`
    );
    settlementBatches.push({
      id: number,
      txHash: hash,
      timestamp: new Date(timestamp).getTime(),
      gasCost: batchGasCost,
      etherPrice: etherPriceAt,
      usdCost: batchUsdCost,
      compressedTxCount: transactions_count,
    });
  }

  const totalSettlementUsdCost = settlementBatches.reduce(
    (acc, batch) => acc + batch.usdCost,
    0
  );
  console.log(
    `Total settlement estimated cost is ${totalSettlementUsdCost.toFixed(
      2
    )} USD`
  );

  // -- Data availability cost estimate

  console.log(
    `\nFecthing "PayForBlob" messages from ${logFile.startTime} to ${logFile.lastUpdateTime}...`
  );
  const celPayForBlobMessages = await fetchPayForBlobMessages(
    1738253120221,
    1738253121021
  );
  console.log(`Found ${celPayForBlobMessages.length} "PayForBlob" messages`);

  const msgsPayForBlob: MsgPayForBlobs[] = [];
  for (const celPayForBlobMsg of celPayForBlobMessages) {
    const { id, tx, time } = celPayForBlobMsg;
    console.log(`Estimating cost for message ${id}...`);
    const { fee: txFee, time: txTime } = tx;
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
  }

  const totalMsgsPayForBlobUsdCost = msgsPayForBlob.reduce(
    (acc, msg) => acc + msg.usdCost,
    0
  );
  console.log(
    `Total data availability estimated cost is ${totalMsgsPayForBlobUsdCost.toFixed(
      4
    )} USD\n`
  );

  // -- Total cost estimate

  const l2TxCount = logFile.actions.length;
  const compressedL1TxCount = settlementBatches
    .map((b) => b.compressedTxCount)
    .reduce((a, b) => a + b, 0);

  // Check if the number of compressed transactions posted on the L1 is almost equal (~5%) to the number of transactions on the L2
  if (Math.abs(l2TxCount - compressedL1TxCount) > l2TxCount * 0.05) {
    console.warn(
      `WARNING: The number of compressed transactions posted on the L1 (${compressedL1TxCount}) is significantly different from the number of transactions on the L2 (${l2TxCount})`
    );
  }

  const usdCostPerTx =
    (totalSettlementUsdCost + totalMsgsPayForBlobUsdCost) / compressedL1TxCount;

  // We remove (arbitrarily) the last transactions from the L2 log file to match the number of compressed transactions posted on the L1
  const totalL2GasUsed = logFile.actions
    .slice(
      l2TxCount > compressedL1TxCount ? l2TxCount - compressedL1TxCount : 0
    )
    .reduce(
      (acc, action) =>
        acc + (action.gasUsed ? BigInt(action.gasUsed) : BigInt(0)),
      BigInt(0)
    );

  const usdCostPerGas =
    (totalSettlementUsdCost + totalMsgsPayForBlobUsdCost) /
    Number(totalL2GasUsed);

  console.table([
    {
      label: 'L2 Transaction Count',
      value: l2TxCount,
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
      label: 'Settlement Cost',
      value: `${totalSettlementUsdCost.toFixed(2)} USD`,
    },
    {
      label: 'Data Availability Cost',
      value: `${totalMsgsPayForBlobUsdCost.toFixed(4)} USD`,
    },
    {
      label: 'USD Cost per Transaction',
      value: `${usdCostPerTx.toFixed(4)} USD`,
    },
    {
      label: 'USD Cost per Gas',
      value: `${usdCostPerGas} USD`,
    },
    {
      label: 'Total Cost',
      value: `${(totalSettlementUsdCost + totalMsgsPayForBlobUsdCost).toFixed(
        2
      )} USD`,
    },
  ]);
};
