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
const ADMIN_PRIVATE_KEY = '0x123';
// Wallet that will relay the intents (actions) to the ArianeeIssuerProxy. Its also the intents issuer here for simplicity
const RELAYER_PRIVATE_KEY = '0x123';

const CREDIT_TYPE_CERTIFICATE = 0;
const CREDIT_TYPE_MESSAGE = 1;
const CREDIT_TYPE_EVENT = 2;
const CREDIT_TYPE_UPDATE = 3;

const CYCLE_PROTOCOL_DETAILS: ProtocolDetailsV1 = {
  protocolVersion: '1.6',
  chainId: 128123,
  httpProvider: 'https://node.ghostnet.etherlink.com',
  gasStation: 'https://gasstation.arianee.com/128123',
  contractAdresses: {
    aria: '0x757494946FD1A932aFDD3b04D791DA2a8071b4ad',
    creditHistory: '0x4FFCE80C2A9663cD0c743E16F9bBaD2d84836cB4',
    eventArianee: '0xB050D180BB55245dd070e4dF4C24327a6cA59Ae0',
    identity: '0x7ef7E9EC6F1C77dD6CCEA519718200A55067C555',
    smartAsset: '0x59BfCb87ca9C47A59a63f8ccc701252Ceb65CA13',
    store: '0xB23bf48A4eb70DFCB15c57d9275336223dC03b3E',
    whitelist: '0xff46aFe50585F78672bf9894a16929c31089D7A7',
    lost: '0x44417312191Fc514123BeD975941A003C7BB4417',
    message: '0xf081B40D2F88bbd4FDaAbac454d16FC337B41ae1',
    userAction: '0x0000000000000000000000000000000000000000',
    updateSmartAssets: '0xc6bF5764CB7c944f718c6f28C69974728e3d63d4',
    issuerProxy: '0x904908be7F0949696053f4a960Ff3a9122EEE0bC',
    creditNotePool: '0x0000000000000000000000000000000000000000',
  },
  soulbound: false,
};

// Custom protocol details resolver for Cycle testing
const protocolDetailsResolver: ProtocolDetailsResolver = (_slug: string) => {
  return Promise.resolve(CYCLE_PROTOCOL_DETAILS);
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

  const adminAddress = computeAddress(ADMIN_PRIVATE_KEY);
  const relayerAddress = computeAddress(RELAYER_PRIVATE_KEY);

  console.log(`Checking if ${relayerAddress} is a credit free sender...`);
  const isACreditFreeSender =
    await adminProtocolClientV1.arianeeIssuerProxy!.creditFreeSenders(
      relayerAddress
    );
  console.log(`> creditFreeSenders(${relayerAddress}): ${isACreditFreeSender}`);

  if (!isACreditFreeSender) {
    console.log(`Adding ${relayerAddress} as a credit free sender...`);
    const addCreditFreeSenderRes =
      await adminProtocolClientV1.arianeeIssuerProxy!.addCreditFreeSender(
        relayerAddress
      );
    console.log(`Done: ${addCreditFreeSenderRes.hash}`);
    await waitFor(1000);
  }

  const creditTypeQuantityEach = BigInt(10000);

  console.log(
    `Checking if ${creditTypeQuantityEach} credits of each type are available on the ArianeeIssuerProxy for use...`
  );
  const creditTypeCertBalance =
    await adminProtocolClientV1.creditHistoryContract.balanceOf(
      CYCLE_PROTOCOL_DETAILS.contractAdresses.issuerProxy!,
      CREDIT_TYPE_CERTIFICATE
    );
  const needToBuyCreditTypeCert =
    creditTypeCertBalance < creditTypeQuantityEach;
  console.log(
    `> balanceOf(${CYCLE_PROTOCOL_DETAILS.contractAdresses.issuerProxy}, ${CREDIT_TYPE_CERTIFICATE}): ${creditTypeCertBalance}`
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
      CYCLE_PROTOCOL_DETAILS.contractAdresses.issuerProxy!,
      CREDIT_TYPE_MESSAGE
    );
  const needToBuyCreditTypeMessage =
    creditTypeMessageBalance < creditTypeQuantityEach;
  console.log(
    `> balanceOf(${CYCLE_PROTOCOL_DETAILS.contractAdresses.issuerProxy}, ${CREDIT_TYPE_MESSAGE}): ${creditTypeMessageBalance}`
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
      CYCLE_PROTOCOL_DETAILS.contractAdresses.issuerProxy!,
      CREDIT_TYPE_EVENT
    );
  const needToBuyCreditTypeEvent =
    creditTypeEventBalance < creditTypeQuantityEach;
  console.log(
    `> balanceOf(${CYCLE_PROTOCOL_DETAILS.contractAdresses.issuerProxy}, ${CREDIT_TYPE_EVENT}): ${creditTypeEventBalance}`
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
      CYCLE_PROTOCOL_DETAILS.contractAdresses.issuerProxy!,
      CREDIT_TYPE_UPDATE
    );
  const needToBuyCreditTypeUpdate =
    creditTypeUpdateBalance < creditTypeQuantityEach;
  console.log(
    `> balanceOf(${CYCLE_PROTOCOL_DETAILS.contractAdresses.issuerProxy}, ${CREDIT_TYPE_UPDATE}): ${creditTypeUpdateBalance}`
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
        `Buying ${creditTypeCertToBuy} certificate credits for the ArianeeIssuerProxy...`
      );
      const buyCredit0Res = await adminProtocolClientV1.storeContract.buyCredit(
        CREDIT_TYPE_CERTIFICATE,
        creditTypeCertToBuy,
        CYCLE_PROTOCOL_DETAILS.contractAdresses.issuerProxy!
      );
      console.log(`Done: ${buyCredit0Res.hash}`);
      await waitFor(1000);
    }

    if (creditTypeMessageToBuy > 0) {
      console.log(
        `Buying ${creditTypeMessageToBuy} message credits for the ArianeeIssuerProxy...`
      );
      const buyCredit1Res = await adminProtocolClientV1.storeContract.buyCredit(
        CREDIT_TYPE_MESSAGE,
        creditTypeMessageToBuy,
        CYCLE_PROTOCOL_DETAILS.contractAdresses.issuerProxy!
      );
      console.log(`Done: ${buyCredit1Res.hash}`);
      await waitFor(1000);
    }

    if (creditTypeEventToBuy > 0) {
      console.log(
        `Buying ${creditTypeEventToBuy} event credits for the ArianeeIssuerProxy...`
      );
      const buyCredit2Res = await adminProtocolClientV1.storeContract.buyCredit(
        CREDIT_TYPE_EVENT,
        creditTypeEventToBuy,
        CYCLE_PROTOCOL_DETAILS.contractAdresses.issuerProxy!
      );
      console.log(`Done: ${buyCredit2Res.hash}`);
      await waitFor(1000);
    }

    if (creditTypeUpdateToBuy > 0) {
      console.log(
        `Buying ${creditTypeUpdateToBuy} update credits for the ArianeeIssuerProxy...`
      );
      const buyCredit3Res = await adminProtocolClientV1.storeContract.buyCredit(
        CREDIT_TYPE_UPDATE,
        creditTypeUpdateToBuy,
        CYCLE_PROTOCOL_DETAILS.contractAdresses.issuerProxy!
      );
      console.log(`Done: ${buyCredit3Res.hash}`);
      await waitFor(1000);
    }
  }
};

const simulateSmartAssetLifecycle = async (
  creator: Creator<'WAIT_TRANSACTION_RECEIPT'>
): Promise<LogFileAction[]> => {
  const actions: LogFileAction[] = [];

  console.log(`Hydrating a non-reserved SmartAsset...`);
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
  console.log(`Done: ${createSmartAssetRawRes.txHash}`);
  actions.push({
    type: 'hydrate',
    time: Date.now(),
    ...getTxInfos(createSmartAssetRawRes),
  });
  await waitFor(1000);

  const smartAssetId = Number(createSmartAssetRawRes.smartAssetId);

  console.log(`Creating an event for SmartAsset ${smartAssetId}...`);
  const createEventRawRes = await creator.events.createEventRaw({
    smartAssetId,
    content: {
      $schema: 'https://cert.arianee.org/version1/ArianeeEvent-i18n.json',
      title: 'event',
    },
  });
  console.log(`Done: ${createEventRawRes.txHash}`);
  actions.push({
    type: 'event',
    time: Date.now(),
    ...getTxInfos(createEventRawRes),
  });
  await waitFor(1000);

  console.log(`Creating a message for SmartAsset ${smartAssetId}...`);
  const createMessageRawRes = await creator.messages.createMessageRaw({
    smartAssetId,
    content: {
      $schema: 'https://cert.arianee.org/version1/ArianeeMessage-i18n.json',
      title: 'message',
    },
  });
  console.log(`Done: ${createMessageRawRes.txHash}`);
  actions.push({
    type: 'message',
    time: Date.now(),
    ...getTxInfos(createMessageRawRes),
  });
  await waitFor(1000);

  return actions;
};

export default async () => {
  const startTime = Date.now();

  await setupTest();
  console.log('\n');

  let logFile: LogFile = {
    startTime: startTime,
    lastUpdateTime: startTime,
    lifecycleCount: 0,
    lifecycleAvgTime: 0,
    errorCount: 0,
  };
  saveLogFile(logFile);

  const relayerCreator = new Creator({
    core: Core.fromPrivateKey(RELAYER_PRIVATE_KEY),
    creatorAddress: Wallet.createRandom().address,
    transactionStrategy: 'WAIT_TRANSACTION_RECEIPT',
    privacyMode: true,
    circuitsBuildPath: 'dist/packages/privacy-circuits/build',
    protocolDetailsResolver,
  });
  await relayerCreator.connect('cycle');

  let lifecycleCount = 1;
  let errorCount = 0;

  let lifecycleAvgTime = 0;
  let totalExecTime = 0;

  while (true) {
    await waitFor(3000);

    let lifecycleActions: LogFileAction[] = [];
    try {
      const lifecycleSt = Date.now();
      lifecycleActions = await simulateSmartAssetLifecycle(relayerCreator);
      const lifecycleStEt = Date.now();
      const lifecycleExecTime = lifecycleStEt - lifecycleSt;
      totalExecTime += lifecycleExecTime;
      lifecycleAvgTime = totalExecTime / lifecycleCount;
      console.log(
        `- lifecycle(${lifecycleCount}): ${lifecycleExecTime / 1000}s`
      );
      console.log(`- lifecycle(avg): ${lifecycleAvgTime / 1000}s`);
      console.log('\n');
    } catch (err) {
      console.error(`- lifecycle(${lifecycleCount}): ${err.message}`);
      errorCount++;
    }

    logFile = {
      ...logFile,
      lastUpdateTime: Date.now(),
      lifecycleCount,
      lifecycleAvgTime,
      errorCount,
      actions: [...(logFile.actions ?? []), ...lifecycleActions],
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
