/**
 * The following is an example of how the WalletApiClient might be used in a wallet context.
 * It allows for retrieval of smart assets, events, messages...
 */

import { Core } from '@arianee/core';
import WalletApiClient from '@arianee/wallet-api-client';

export default async () => {
  const client = new WalletApiClient(
    'mainnet',
    Core.fromMnemonic(
      'sunset setup moral spoil stomach flush document expand rent siege perfect gauge'
    ),
    {
      apiURL: 'http://127.0.0.1:3000/',
    }
  );

  const certificateId = '31783760';

  const [smartAsset, events, ownedSmartAssets, receivedMessages] =
    await Promise.all([
      client.getSmartAsset('mainnet', {
        id: certificateId,
      }),
      client.getSmartAssetEvents('mainnet', {
        id: certificateId,
      }),
      client.getOwnedSmartAssets(),
      client.getReceivedMessages(),
    ]);

  console.log(
    'Smart asset\n',
    JSON.stringify(smartAsset, undefined, 2).slice(0, 20) + '...',
    '\n'
  );
  console.log(
    'Events\n',
    JSON.stringify(events, undefined, 2).slice(0, 20) + '...'
  );

  console.log('Owned smart assets (mainnet): ', ownedSmartAssets.length);
  console.log('Received messages (mainnet): ', receivedMessages.length);
};
