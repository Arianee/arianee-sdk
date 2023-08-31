import ArianeeProtocolClient, {
  ProtocolClientV2,
} from '@arianee/arianee-protocol-client';
import Core from '@arianee/core';

export default async () => {
  const core = Core.fromMnemonic(
    'sunset setup moral spoil stomach flush document expand rent siege perfect gauge'
  );

  const slug = 'test-v2';

  const client = new ArianeeProtocolClient(core, {
    protocolDetailsResolver: async () => ({
      httpProvider: 'https://sokol.arianee.net',
      gasStation: 'https://cert.arianee.net/gasStation/testnet.json',
      chainId: 77,
      contractAdresses: {
        nft: '0xf844b35F51a2df1Af7A7b86dA1C0CfAfa51A5BCA',
        ownership: '0xA5177B6F7c5F1a79E51e27423ddCE90c728B966c',
        rulesManager: '0x6C39Da7C40dB161b1aF17bE40389AF618fd6a8Cf',
        event: '0x0D70d06F3a56E9d662815410Fa4D05191471e763',
        message: '0x57792bDBbC3e74975E68931307db9E1d330c670c',
        credit: '0xef4C3E30114748732474Ca813A539dE9eFd3c694',
      },
      collectionFeatures: {
        burnable: false,
        recoverable: false,
        uriUpdatable: false,
        imprintUpdatable: false,
        transferable: true,
      },
      protocolVersion: '2',
    }),
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
