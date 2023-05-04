/**
 * The following is an example of how the WalletApiClient might be used in an "arianee landing" page context.
 * It allows for retrieval of a smart asset and its events solely from the certificateId and passphrase.
 */

import { Core } from '@arianee/core';
import WalletApiClient from '@arianee/wallet-api-client';

export default async () => {
  const client = new WalletApiClient('mainnet', Core.fromRandom(), {
    apiURL: 'http://127.0.0.1:3000/',
  });

  const certificateId = '31783760';
  const passphrase = 'gokruwa5ftuv';

  const [smartAsset, events] = await Promise.all([
    client.getSmartAsset('mainnet', {
      id: certificateId,
      passphrase,
    }),
    client.getSmartAssetEvents('mainnet', {
      id: certificateId,
      passphrase,
    }),
  ]);

  console.log('Smart asset\n', JSON.stringify(smartAsset, undefined, 2), '\n');
  console.log('Events\n', JSON.stringify(events, undefined, 2));
};
