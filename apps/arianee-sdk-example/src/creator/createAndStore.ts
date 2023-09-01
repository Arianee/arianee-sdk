import Core from '@arianee/core';
import Creator from '@arianee/creator';

// WARNING: This code will only work if your address has a validated identity

export default async () => {
  const creator = new Creator({
    core: Core.fromPrivateKey(process.env.PRIVATE_KEY),
    creatorAddress: '0x6C0084Bb281dcE6B0f0cc86191086531A50dDf04',
  });

  await creator.connect('testnet');

  const smartAsset = await creator.smartAssets.createAndStoreSmartAsset({
    content: {
      $schema:
        'https://cert.arianee.org/version5/ArianeeProductCertificate-i18n.json',
      name: 'test from creator',
    },
  });
  console.log(smartAsset);

  // You can then create a message with the smartAssetId

  /*
  const message = await creator.createAndStoreMessage({
    smartAssetId: YOUR_SMART_ASSET_ID_HERE,
    content: {
      $schema: 'https://cert.arianee.org/version1/ArianeeMessage-i18n.json',
      title: 'test message from creator',
    },
  });

  console.log(message);
  */
};
