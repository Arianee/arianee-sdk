import { ArianeeApiClient } from '@arianee/arianee-api-client';

export default async () => {
  const arianeeApiClient = new ArianeeApiClient(
    'https://api.staging.arianee.com'
  );

  const ownedNfts = await arianeeApiClient.multichain.getOwnedNfts(
    'testnet',
    '0xA9Bc90D24D0b8495043Ab5857455444630028CAF'
  );

  console.log(
    'nft owned by 0xA9Bc90D24D0b8495043Ab5857455444630028CAF',
    ownedNfts
  );

  const receivedMessage = await arianeeApiClient.multichain.getReceivedMessages(
    'testnet',
    '0xA9Bc90D24D0b8495043Ab5857455444630028CAF'
  );

  console.log('received message', receivedMessage);

  const identity = await arianeeApiClient.multichain.getIdentity(
    '0x0ECCF7BD729F6367eCa5234DbDDb0480394215E1'
  );
  console.log(identity);

  const nft = await arianeeApiClient.network.getNft('testnet', '92988157');
  console.log(nft);
};
