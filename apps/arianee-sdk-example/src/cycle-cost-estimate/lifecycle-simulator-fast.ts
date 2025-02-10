import ArianeeProtocolClient, {
  ProtocolClientV1,
} from '@arianee/arianee-protocol-client';
import {
  ProtocolDetailsResolver,
  ProtocolDetailsV1,
} from '@arianee/common-types';
import Core from '@arianee/core';
import Creator, { TxInfos } from '@arianee/creator';
import { Wallet, computeAddress, formatEther } from 'ethers';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { LogFile, LogFileAction } from './types';
import { waitFor } from './utils';

// Wallet that will buy credits for the ArianeeIssuerProxy and add the relayer as a credit free sender (if needed)
const ADMIN_PRIVATE_KEY = '123';
// Wallet that will relay the intents (actions) to the ArianeeIssuerProxy. Its also the intents issuer here for simplicity
const RELAYERS_PRIVATE_KEYS = ['123', '123', '123'];
const RELAYERS_ADDRESSES = RELAYERS_PRIVATE_KEYS.map((privateKey) =>
  computeAddress(privateKey)
);

const TOTAL_LIFECYCLE_PER_RELAYER = 1000;

const CREDIT_TYPE_CERTIFICATE = 0;
const CREDIT_TYPE_MESSAGE = 1;
const CREDIT_TYPE_EVENT = 2;
const CREDIT_TYPE_UPDATE = 3;

const PRIVACY_MODE = false;

const CYCLE_PROTOCOL_DETAILS: ProtocolDetailsV1 = {
  protocolVersion: '1.6',
  chainId: 6940,
  httpProvider: 'https://cycle-alpha.calderachain.xyz/http',
  contractAdresses: {
    aria: '0x757494946FD1A932aFDD3b04D791DA2a8071b4ad',
    creditHistory: '0xC32A7e84529571FeE9720dfdF51085795a6F3494',
    eventArianee: '0xa6e120f59Dfe127d63412e515AeA2b517711451a',
    identity: '0x9Dbcf2De1b15DA2981E726f3D6143d9b84E6dFC9',
    smartAsset: '0xa6167068F2253820Fbbb44d94403d2446F3E505C',
    store: '0x905659A96dD6E6ADC32c52340bA887a0d4cce361',
    whitelist: '0xe162DbA83ac7125B4Ad45952c1e2Ff872A4Ad3d8',
    lost: '0xfBf9E2DE9391306Ae9Dbc8876e79e4a5a70Ada30',
    message: '0x1699f4F02a8F4ABC36BB87239C8CCd4D196D7b8B',
    userAction: '0x0000000000000000000000000000000000000000',
    updateSmartAssets: '0xD7E0A901692C500C9a663F964aa0CE411B4d2500',
    issuerProxy: '0xA8A7d052a700c5E1A2EE3Ca4fF8E6e89514afD6C',
    creditNotePool: '0x0000000000000000000000000000000000000000',
  },
  soulbound: false,
};

// Custom protocol details resolver for Cycle testing
const protocolDetailsResolver: ProtocolDetailsResolver = (_slug: string) => {
  return Promise.resolve(CYCLE_PROTOCOL_DETAILS);
};

export const buyCredit = async (
  to: string,
  adminProtocolClientV1: ProtocolClientV1,
  adminAddress: string
) => {
  const creditTypeQuantityEach =
    BigInt(TOTAL_LIFECYCLE_PER_RELAYER) *
    (PRIVACY_MODE ? BigInt(RELAYERS_ADDRESSES.length) : BigInt(1));
  console.log(
    `Checking if ${creditTypeQuantityEach} credits of each type are available for ${to} to use...`
  );
  const creditTypeCertBalance =
    await adminProtocolClientV1.creditHistoryContract.balanceOf(
      to,
      CREDIT_TYPE_CERTIFICATE
    );
  const needToBuyCreditTypeCert =
    creditTypeCertBalance < creditTypeQuantityEach;
  console.log(
    `> balanceOf(${to}, ${CREDIT_TYPE_CERTIFICATE}): ${creditTypeCertBalance}`
  );
  let creditTypeCertAriaAmount = BigInt(0);
  let creditTypeCertToBuy = BigInt(0);
  if (needToBuyCreditTypeCert) {
    const creditTypeCertPrice =
      await adminProtocolClientV1.storeContract.getCreditPrice(
        CREDIT_TYPE_CERTIFICATE
      );
    creditTypeCertToBuy = creditTypeQuantityEach - creditTypeCertBalance;
    creditTypeCertAriaAmount = creditTypeCertPrice * creditTypeCertToBuy;
  }

  const creditTypeMessageBalance =
    await adminProtocolClientV1.creditHistoryContract.balanceOf(
      to,
      CREDIT_TYPE_MESSAGE
    );
  const needToBuyCreditTypeMessage =
    creditTypeMessageBalance < creditTypeQuantityEach;
  console.log(
    `> balanceOf(${to}, ${CREDIT_TYPE_MESSAGE}): ${creditTypeMessageBalance}`
  );
  let creditTypeMessageAriaAmount = BigInt(0);
  let creditTypeMessageToBuy = BigInt(0);
  if (needToBuyCreditTypeMessage) {
    const creditTypeMessagePrice =
      await adminProtocolClientV1.storeContract.getCreditPrice(
        CREDIT_TYPE_MESSAGE
      );
    creditTypeMessageToBuy = creditTypeQuantityEach - creditTypeMessageBalance;
    creditTypeMessageAriaAmount =
      creditTypeMessagePrice * creditTypeMessageToBuy;
  }

  const creditTypeEventBalance =
    await adminProtocolClientV1.creditHistoryContract.balanceOf(
      to,
      CREDIT_TYPE_EVENT
    );
  const needToBuyCreditTypeEvent =
    creditTypeEventBalance < creditTypeQuantityEach;
  console.log(
    `> balanceOf(${to}, ${CREDIT_TYPE_EVENT}): ${creditTypeEventBalance}`
  );
  let creditTypeEventAriaAmount = BigInt(0);
  let creditTypeEventToBuy = BigInt(0);
  if (needToBuyCreditTypeEvent) {
    const creditTypeEventPrice =
      await adminProtocolClientV1.storeContract.getCreditPrice(
        CREDIT_TYPE_EVENT
      );
    creditTypeEventToBuy = creditTypeQuantityEach - creditTypeEventBalance;
    creditTypeEventAriaAmount = creditTypeEventPrice * creditTypeEventToBuy;
  }

  const creditTypeUpdateBalance =
    await adminProtocolClientV1.creditHistoryContract.balanceOf(
      to,
      CREDIT_TYPE_UPDATE
    );
  const needToBuyCreditTypeUpdate =
    creditTypeUpdateBalance < creditTypeQuantityEach;
  console.log(
    `> balanceOf(${to}, ${CREDIT_TYPE_UPDATE}): ${creditTypeUpdateBalance}`
  );
  let creditTypeUpdateAriaAmount = BigInt(0);
  let creditTypeUpdateToBuy = BigInt(0);
  if (needToBuyCreditTypeUpdate) {
    const creditTypeUpdatePrice =
      await adminProtocolClientV1.storeContract.getCreditPrice(
        CREDIT_TYPE_UPDATE
      );
    creditTypeUpdateToBuy = creditTypeQuantityEach - creditTypeUpdateBalance;
    creditTypeUpdateAriaAmount = creditTypeUpdatePrice * creditTypeUpdateToBuy;
  }

  const totalAriaAmount =
    creditTypeCertAriaAmount +
    creditTypeMessageAriaAmount +
    creditTypeEventAriaAmount +
    creditTypeUpdateAriaAmount;
  console.log(
    `Needed ARIA amount is ${totalAriaAmount} to buy ${creditTypeCertToBuy} certificate credit(s), ${creditTypeMessageToBuy} message credit(s), ${creditTypeEventToBuy} event credit(s) and ${creditTypeUpdateToBuy} update credit(s)`
  );

  if (totalAriaAmount > 0) {
    console.log(
      `Checking allowance of ${adminAddress} for the store contract...`
    );
    const allowance = await adminProtocolClientV1.ariaContract.allowance(
      adminAddress,
      CYCLE_PROTOCOL_DETAILS.contractAdresses.store!
    );
    console.log(
      `> allowance(${adminAddress}, ${CYCLE_PROTOCOL_DETAILS.contractAdresses.store}): ${allowance}`
    );
    if (allowance < totalAriaAmount) {
      console.log(
        `Approving ${formatEther(
          totalAriaAmount.toString()
        )} (${totalAriaAmount}) ARIA for the store contract...`
      );
      const approveRes = await adminProtocolClientV1.ariaContract.approve(
        CYCLE_PROTOCOL_DETAILS.contractAdresses.store!,
        totalAriaAmount
      );
      console.log(`Done: ${approveRes.hash}`);
      await waitFor(1000);
    }

    if (creditTypeCertToBuy > 0) {
      console.log(
        `Buying ${creditTypeCertToBuy} certificate credits for ${to}...`
      );
      const buyCredit0Res = await adminProtocolClientV1.storeContract.buyCredit(
        CREDIT_TYPE_CERTIFICATE,
        creditTypeCertToBuy,
        to
      );
      console.log(`Done: ${buyCredit0Res.hash}`);
      await waitFor(1000);
    }

    if (creditTypeMessageToBuy > 0) {
      console.log(
        `Buying ${creditTypeMessageToBuy} message credits for ${to}...`
      );
      const buyCredit1Res = await adminProtocolClientV1.storeContract.buyCredit(
        CREDIT_TYPE_MESSAGE,
        creditTypeMessageToBuy,
        to
      );
      console.log(`Done: ${buyCredit1Res.hash}`);
      await waitFor(1000);
    }

    if (creditTypeEventToBuy > 0) {
      console.log(`Buying ${creditTypeEventToBuy} event credits for ${to}...`);
      const buyCredit2Res = await adminProtocolClientV1.storeContract.buyCredit(
        CREDIT_TYPE_EVENT,
        creditTypeEventToBuy,
        to
      );
      console.log(`Done: ${buyCredit2Res.hash}`);
      await waitFor(1000);
    }

    if (creditTypeUpdateToBuy > 0) {
      console.log(
        `Buying ${creditTypeUpdateToBuy} update credits for ${to}...`
      );
      const buyCredit3Res = await adminProtocolClientV1.storeContract.buyCredit(
        CREDIT_TYPE_UPDATE,
        creditTypeUpdateToBuy,
        to
      );
      console.log(`Done: ${buyCredit3Res.hash}`);
      await waitFor(1000);
    }
  }
};

const setupTest = async () => {
  const adminProtocolClient = new ArianeeProtocolClient(
    Core.fromPrivateKey(ADMIN_PRIVATE_KEY),
    { protocolDetailsResolver }
  );
  const adminProtocolClientV1 = (await adminProtocolClient.connect(
    'cycle'
  )) as ProtocolClientV1;
  await waitFor(1000);

  if (PRIVACY_MODE) {
    for (const relayerAddress of RELAYERS_ADDRESSES) {
      console.log(`Checking if ${relayerAddress} is a credit free sender...`);
      const isACreditFreeSender =
        await adminProtocolClientV1.arianeeIssuerProxy!.creditFreeSenders(
          relayerAddress
        );
      console.log(
        `> creditFreeSenders(${relayerAddress}): ${isACreditFreeSender}`
      );

      if (!isACreditFreeSender) {
        console.log(`Adding ${relayerAddress} as a credit free sender...`);
        const addCreditFreeSenderRes =
          await adminProtocolClientV1.arianeeIssuerProxy!.addCreditFreeSender(
            relayerAddress
          );
        console.log(`Done: ${addCreditFreeSenderRes.hash}`);
        await waitFor(1000);
      }
    }
  }

  const adminAddress = computeAddress(ADMIN_PRIVATE_KEY);
  if (PRIVACY_MODE) {
    const arianeeIssuerProxyAddress =
      CYCLE_PROTOCOL_DETAILS.contractAdresses.issuerProxy!;
    await buyCredit(
      arianeeIssuerProxyAddress,
      adminProtocolClientV1,
      adminAddress
    );
  } else {
    for (const relayerAddress of RELAYERS_ADDRESSES) {
      await buyCredit(relayerAddress, adminProtocolClientV1, adminAddress);
    }
  }
};

const simulateSmartAssetLifecycle = async (
  creator: Creator<'WAIT_TRANSACTION_RECEIPT'>
): Promise<LogFileAction[]> => {
  const actions: LogFileAction[] = [];
  const coreAddress = creator.core.getAddress();

  console.log(`[${coreAddress}] Hydrating a non-reserved SmartAsset...`);
  const createSmartAssetRawRes = await creator.smartAssets.createSmartAssetRaw({
    tokenAccess: {
      fromPassphrase: '1234',
    },
    tokenRecoveryTimestamp: 56789,
    content: {
      $schema:
        'https://cert.arianee.org/version8/ArianeeProductCertificate-i18n.json',
      name: 'hydrate',
    },
  });
  console.log(`[${coreAddress}] Done: ${createSmartAssetRawRes.txHash}`);
  actions.push({
    type: 'hydrate',
    time: Date.now(),
    ...getTxInfos(createSmartAssetRawRes),
  });

  const smartAssetId = Number(createSmartAssetRawRes.smartAssetId);

  console.log(
    `[${coreAddress}] Creating an event for SmartAsset ${smartAssetId}...`
  );
  const createEventRawRes = await creator.events.createEventRaw({
    smartAssetId,
    content: {
      $schema: 'https://cert.arianee.org/version1/ArianeeEvent-i18n.json',
      title: 'event',
    },
  });
  console.log(`[${coreAddress}] Done: ${createEventRawRes.txHash}`);
  actions.push({
    type: 'event',
    time: Date.now(),
    ...getTxInfos(createEventRawRes),
  });

  console.log(
    `[${coreAddress}] Creating a message for SmartAsset ${smartAssetId}...`
  );
  const createMessageRawRes = await creator.messages.createMessageRaw({
    smartAssetId,
    content: {
      $schema: 'https://cert.arianee.org/version1/ArianeeMessage-i18n.json',
      title: 'message',
    },
  });
  console.log(`[${coreAddress}] Done: ${createMessageRawRes.txHash}`);
  actions.push({
    type: 'message',
    time: Date.now(),
    ...getTxInfos(createMessageRawRes),
  });

  return actions;
};

export default async () => {
  const startTime = Date.now();
  await setupTest();

  console.log('\n');
  console.log(`[${startTime}.json]`);
  console.log('\n');

  let logFile: LogFile = {
    startTime: startTime,
    lastUpdateTime: startTime,
    lifecycleCount: 0,
    lifecycleAvgTime: 0,
    errorCount: 0,
  };
  saveLogFile(logFile);

  const relayerCreators: Creator<'WAIT_TRANSACTION_RECEIPT'>[] =
    await Promise.all(
      RELAYERS_PRIVATE_KEYS.map(async (privateKey) => {
        const creator = new Creator({
          core: Core.fromPrivateKey(privateKey),
          creatorAddress: Wallet.createRandom().address,
          transactionStrategy: 'WAIT_TRANSACTION_RECEIPT',
          privacyMode: PRIVACY_MODE,
          circuitsBuildPath: 'dist/packages/privacy-circuits/build',
          protocolDetailsResolver,
        });
        await creator.connect('cycle');
        return creator;
      })
    );

  let lifecycleCount = 1;
  let taskErrorCount = 0;

  let lifecycleAvgTime = 0;
  let totalExecTime = 0;

  while (lifecycleCount <= TOTAL_LIFECYCLE_PER_RELAYER) {
    const lifecycleSt = Date.now();
    const tasks = relayerCreators.map((creator) =>
      simulateSmartAssetLifecycle(creator)
    );
    const results = await Promise.allSettled(tasks);
    const lifecycleStEt = Date.now();
    const lifecycleExecTime = lifecycleStEt - lifecycleSt;
    totalExecTime += lifecycleExecTime;
    lifecycleAvgTime = totalExecTime / lifecycleCount;

    console.log(`- lifecycle(${lifecycleCount}): ${lifecycleExecTime / 1000}s`);
    console.log(`- lifecycle(avg): ${lifecycleAvgTime / 1000}s`);
    console.log('\n');

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const lifecycleActions = result.value;
        logFile.actions = [...(logFile.actions ?? []), ...lifecycleActions];
      } else {
        console.error(
          `- lifecycle(${lifecycleCount}): ${result.reason.message}`
        );
        taskErrorCount++;
      }
    }

    logFile = {
      ...logFile,
      lastUpdateTime: Date.now(),
      lifecycleCount,
      lifecycleAvgTime,
      errorCount: taskErrorCount, // Not the same indication as `errorCount` in `lifecycle-simulator.ts`
    };
    saveLogFile(logFile);
    lifecycleCount++;
  }
};

const getTxInfos = (txInfos: TxInfos): TxInfos => {
  const {
    txHash,
    gasUsed,
    gasPrice,
    blobGasUsed,
    blobGasPrice,
    cumulativeGasUsed,
    fee,
  } = txInfos;
  return {
    txHash,
    gasUsed,
    gasPrice,
    blobGasUsed,
    blobGasPrice,
    cumulativeGasUsed,
    fee,
  };
};

const saveLogFile = (logFile: LogFile) => {
  const logsFolderPath = 'logs';
  if (!existsSync(logsFolderPath)) {
    mkdirSync(logsFolderPath);
  }
  const logFileName = `${logFile.startTime}.json`;
  const logFilePath = `${logsFolderPath}/${logFileName}`;

  // Replace all BigInt values with strings to avoid JSON.stringify() converting them to JSON objects
  const logFileData = JSON.parse(
    JSON.stringify(logFile, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
  writeFileSync(logFilePath, JSON.stringify(logFileData, null, 2));
};
