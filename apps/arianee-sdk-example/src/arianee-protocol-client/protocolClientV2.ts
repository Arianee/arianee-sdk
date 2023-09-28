import ArianeeProtocolClient, {
  ProtocolClientV2,
} from '@arianee/arianee-protocol-client';
import { ProtocolDetailsV2 } from '@arianee/common-types';
import Core from '@arianee/core';

export default async () => {
  const core = Core.fromMnemonic(
    'sunset setup moral spoil stomach flush document expand rent siege perfect gauge'
  );

  const slug = 'test-v2';

  const mockProtocolDetails: ProtocolDetailsV2 = {
    protocolVersion: '2.0',
    chainId: 77,
    httpProvider: 'https://sokol.arianee.net',
    gasStation: 'https://gasstation.arianee.com/77',
    contractAdresses: {
      nft: '0xab459bf433187B78c66323Bf56e1E59bE1D405b6',
      ownershipRegistry: '0x40b6851Af149C70A7A5b7694dBD76f0A81a3F576',
      eventHub: '0xF45577b9B8a33EC58169c5c0f936F55e095Cf660',
      messageHub: '0x6271B6D8Dc92649e60b96806450D8C49802486Eb',
      rulesManager: '0xeF104AcFEaA0cff8eE9f9c5426bb4a2A818d26D4',
      creditManager: '0x6709a7e7FE038Dc32925Ba5A14704a7eD1e6bD2F',
    },
    nftInterfaces: {
      ERC721: true,
      SmartAsset: true,
      SmartAssetBurnable: true,
      SmartAssetRecoverable: true,
      SmartAssetSoulbound: false,
      SmartAssetUpdatable: true,
      SmartAssetURIStorage: true,
      SmartAssetURIStorageOverridable: false,
    },
  };

  const client = new ArianeeProtocolClient(core, {
    protocolDetailsResolver: async () => mockProtocolDetails,
  });

  const protocol = await client.connect(slug);

  if (protocol instanceof ProtocolClientV2) {
    console.log('Connected to v2');

    const randomAddress = '0x26a3a4c6cbeb72f9947f2fb2d5d5628162bd8f37';

    console.log('Testing various contracts on protocol v2\n\n');

    const isTrustedForwarder =
      await protocol.rulesManagerContract.isTrustedForwarder(randomAddress);

    const creditPriceUsd =
      await protocol.creditManagerContract.getCreditPriceUsd(
        protocol.protocolDetails.contractAdresses.nft
      );

    const isTrustedForwarder2 =
      await protocol.eventHubContract.isTrustedForwarder(randomAddress);

    const isTrustedForwarder3 =
      await protocol.messageHubContract.isTrustedForwarder(randomAddress);

    const isTrustedForwarder4 =
      await protocol.ownershipRegistryContract.isTrustedForwarder(
        randomAddress
      );

    const isTrustedForwarder5 =
      await protocol.rulesManagerContract.isTrustedForwarder(randomAddress);

    const balanceOf = await protocol.smartAssetBaseContract.balanceOf(
      randomAddress
    );

    console.log(
      'isTrustedForwarder (' + randomAddress + ')',
      isTrustedForwarder
    );

    console.log(
      'creditPriceUsd (' + protocol.protocolDetails.contractAdresses.nft + ')',
      creditPriceUsd
    );

    console.log(
      'isTrustedForwarder2 (' + randomAddress + ')',
      isTrustedForwarder2
    );

    console.log(
      'isTrustedForwarder3 (' + randomAddress + ')',
      isTrustedForwarder3
    );

    console.log(
      'isTrustedForwarder4 (' + randomAddress + ')',
      isTrustedForwarder4
    );

    console.log(
      'isTrustedForwarder5 (' + randomAddress + ')',
      isTrustedForwarder5
    );

    console.log('balanceOf (' + randomAddress + ')', balanceOf);

    console.log('\nSuccess\n\n');
  } else {
    console.warn('not instance of v2');
  }
};
