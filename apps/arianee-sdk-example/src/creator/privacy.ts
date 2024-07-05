import ArianeeProtocolClient, {
  ProtocolClientV1,
} from '@arianee/arianee-protocol-client';
import {
  ProtocolDetails,
  ProtocolDetailsResolver,
  TokenAccessType,
} from '@arianee/common-types';
import Core from '@arianee/core';
import Creator from '@arianee/creator';
import { computeAddress, Wallet } from 'ethers';

// NOTE: Below are default private keys for localnet testing, safe to commit
const DEPLOYER_PRIVATE_KEY =
  '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d';
const RELAYER_PRIVATE_KEY =
  '0x829e924fdf021ba3dbbc4225edfece9aca04b929d6e75613329ca6f1d31c0bb4';

// NOTE: Credit type are 0-indexed in Arianee historical contracts but 1-indexed in the "Full Privacy" extension contracts
// /!\ Bellow are the 0-indexed credit types /!\
const CREDIT_TYPE_CERTIFICATE = 0;
const CREDIT_TYPE_MESSAGE = 1;
const CREDIT_TYPE_EVENT = 2;
const CREDIT_TYPE_UPDATE = 3;

// Custom protocol details resolver for local testing
const protocolDetailsResolver: ProtocolDetailsResolver = (slug: string) => {
  const protocolDetails: ProtocolDetails = {
    protocolVersion: '1.5',
    chainId: 5577,
    httpProvider: 'http://127.0.0.1:8545',
    gasStation: '',
    contractAdresses: {
      aria: '0x254dffcd3277C0b1660F6d42EFbB754edaBAbC2B',
      creditHistory: '0xe982E462b094850F12AF94d21D470e21bE9D0E9C',
      eventArianee: '0x59d3631c86BbE35EF041872d502F218A39FBa150',
      identity: '0xA57B8a5584442B467b4689F1144D269d096A3daF',
      smartAsset: '0xD833215cBcc3f914bD1C9ece3EE7BF8B14f841bb',
      store: '0x2612Af3A521c2df9EAF28422Ca335b04AdF3ac66',
      whitelist: '0xC89Ce4735882C9F0f0FE26686c53074E09B0D550',
      lost: '0x0290FB167208Af455bB137780163b7B7a9a10C16',
      message: '0x9561C133DD8580860B6b7E504bC5Aa500f0f06a7',
      userAction: '0x67B5656d60a809915323Bf2C40A8bEF15A152e3e',
      updateSmartAssets: '0x9b1f7F645351AF3631a656421eD2e40f2802E6c0',
      issuerProxy: '0xDDb64fE46a91D46ee29420539FC25FD07c5FEa3E',
      creditNotePool: '0x7414e38377D6DAf6045626EC8a8ABB8a1BC4B97a',
    },
    soulbound: false,
  };
  return Promise.resolve(protocolDetails);
};

const setupProtocol = async () => {
  const deployerProtocolClient = new ArianeeProtocolClient(
    Core.fromPrivateKey(DEPLOYER_PRIVATE_KEY),
    { protocolDetailsResolver }
  );
  const deployerProtocolClientV1 = (await deployerProtocolClient.connect(
    'localnet'
  )) as ProtocolClientV1;

  const relayerAddress = computeAddress(RELAYER_PRIVATE_KEY);
  console.log(`Adding ${relayerAddress} as a credit free sender...`);
  const addCreditFreeSenderRes =
    await deployerProtocolClientV1.arianeeIssuerProxy!.addCreditFreeSender(
      relayerAddress
    );
  console.log(`Done: ${addCreditFreeSenderRes.hash}`);

  // Add some credit for the ArianeeIssuerProxy
  // We don't check anything that is credit related in this test file, we just need to have some credit to be able to perform some actions
  const creditTypeQuantityEach = BigInt(100);

  const creditTypeCertPrice =
    await deployerProtocolClientV1.storeContract.getCreditPrice(
      CREDIT_TYPE_CERTIFICATE
    );
  const creditTypeCertAriaAmount = creditTypeCertPrice * creditTypeQuantityEach;

  const creditTypeMessagePrice =
    await deployerProtocolClientV1.storeContract.getCreditPrice(
      CREDIT_TYPE_MESSAGE
    );
  const creditTypeMessageAriaAmount =
    creditTypeMessagePrice * creditTypeQuantityEach;

  const creditTypeEventPrice =
    await deployerProtocolClientV1.storeContract.getCreditPrice(
      CREDIT_TYPE_EVENT
    );
  const creditTypeEventAriaAmount =
    creditTypeEventPrice * creditTypeQuantityEach;

  const creditTypeUpdatePrice =
    await deployerProtocolClientV1.storeContract.getCreditPrice(
      CREDIT_TYPE_UPDATE
    );
  const creditTypeUpdateAriaAmount =
    creditTypeUpdatePrice * creditTypeQuantityEach;

  const totalAriaAmount =
    creditTypeCertAriaAmount +
    creditTypeMessageAriaAmount +
    creditTypeEventAriaAmount +
    creditTypeUpdateAriaAmount;

  const storeContractAddress =
    await deployerProtocolClientV1.storeContract.getAddress();
  const arianeeIssuerProxyAddress =
    await deployerProtocolClientV1.arianeeIssuerProxy!.getAddress();

  console.log(`Approving ${totalAriaAmount} ARIA for the store contract...`);
  const approveRes = await deployerProtocolClientV1.ariaContract.approve(
    storeContractAddress,
    totalAriaAmount
  );
  console.log(`(1/1) Done: ${approveRes.hash}`);

  console.log(
    `Buying ${creditTypeQuantityEach} credits of each type for the ArianeeIssuerProxy...`
  );
  const buyCredit0Res = await deployerProtocolClientV1.storeContract.buyCredit(
    CREDIT_TYPE_CERTIFICATE,
    creditTypeQuantityEach,
    arianeeIssuerProxyAddress
  );
  console.log(`(1/4) Done: ${buyCredit0Res.hash}`);
  const buyCredit1Res = await deployerProtocolClientV1.storeContract.buyCredit(
    CREDIT_TYPE_MESSAGE,
    creditTypeQuantityEach,
    arianeeIssuerProxyAddress
  );
  console.log(`(2/4) Done: ${buyCredit1Res.hash}`);
  const buyCredit2Res = await deployerProtocolClientV1.storeContract.buyCredit(
    CREDIT_TYPE_EVENT,
    creditTypeQuantityEach,
    arianeeIssuerProxyAddress
  );
  console.log(`(3/4) Done: ${buyCredit2Res.hash}`);
  const buyCredit3Res = await deployerProtocolClientV1.storeContract.buyCredit(
    CREDIT_TYPE_UPDATE,
    creditTypeQuantityEach,
    arianeeIssuerProxyAddress
  );
  console.log(`(4/4) Done: ${buyCredit3Res.hash}`);
};

export default async () => {
  // Some setup to configure a freshly deployed localnet
  await setupProtocol();

  // We can now proceed with the actual example, using an instance of the Creator in privacy mode
  const relayerCreator = new Creator({
    core: Core.fromPrivateKey(RELAYER_PRIVATE_KEY), // Relayer private key
    creatorAddress: Wallet.createRandom().address,
    transactionStrategy: 'WAIT_TRANSACTION_RECEIPT',
    privacyMode: true,
    circuitsBuildPath: 'dist/packages/privacy-circuits/build',
    protocolDetailsResolver,
  });

  await relayerCreator.connect('localnet');

  const smartAssetId = Math.floor(Math.random() * 1000000);

  // Try to hydrate a smartAsset (and reserve it on-the-fly)
  console.log('> Hydrating smartAsset...');
  const createSmartAssetRawRes =
    await relayerCreator.smartAssets.createSmartAssetRaw({
      smartAssetId,
      tokenAccess: {
        fromPassphrase: 'be6qhkoijals',
      },
      tokenRecoveryTimestamp: 123456789,
      content: {
        $schema:
          'https://cert.arianee.org/version5/ArianeeProductCertificate-i18n.json',
        name: 'hydrate',
      },
    });
  console.log(
    `SmartAsset successfully hydrated: ${JSON.stringify(
      createSmartAssetRawRes
    )}`
  );

  // Try to add a token access to the smartAsset
  console.log('\n> Adding token access...');
  const setTokenAccessRes = await relayerCreator.smartAssets.setTokenAccess(
    String(smartAssetId),
    TokenAccessType.request,
    { fromPassphrase: 'be6qhkoijzfe' }
  );
  console.log(
    `Token access successfully added: ${JSON.stringify(setTokenAccessRes)}`
  );

  // Try to create an event for the smartAsset
  console.log('\n> Creating event...');
  const createEventRawRes = await relayerCreator.events.createEventRaw({
    smartAssetId,
    content: {
      $schema: 'https://cert.arianee.org/version1/ArianeeEvent-i18n.json',
      title: 'event',
    },
  });
  console.log(
    `Event successfully created: ${JSON.stringify(createEventRawRes)}`
  );

  // Try to create a message for the smartAsset
  console.log('\n> Creating message...');
  const createMessageRawRes = await relayerCreator.messages.createMessageRaw({
    smartAssetId,
    content: {
      $schema: 'https://cert.arianee.org/version1/ArianeeMessage-i18n.json',
      title: 'message',
    },
  });
  console.log(
    `Message successfully created: ${JSON.stringify(createMessageRawRes)}`
  );

  // Try to destroy the smartAsset
  console.log('\n> Destroying smartAsset...');
  const destroySmartAssetRes =
    await relayerCreator.smartAssets.destroySmartAsset(String(smartAssetId));
  console.log(
    `SmartAsset successfully destroyed: ${destroySmartAssetRes?.hash}`
  );
};
