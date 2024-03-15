/**
 * The following is an example of a minimalistic Arianee Wallet for node built with the @arianee/wallet library
 */
import Core from '@arianee/core';
import { Wallet } from '@arianee/wallet';
import WalletApiClient from '@arianee/wallet-api-client';
export default async () => {
  const mnemonic =
    'sunset setup moral spoil stomach flush document expand rent siege perfect gauge';

  // no need to setup core and wallet api client etc but i need to override the api url so i can use my local wallet-api
  const core = Core.fromMnemonic(mnemonic);
  const walletApiClient = new WalletApiClient('testnet', core, {
    apiURL: 'http://127.0.0.1:3000/',
  });

  const wallet = new Wallet({
    auth: { mnemonic },
    walletAbstraction: walletApiClient,
    i18nStrategy: {
      useLanguages: ['fr-FR'],
    },
  });

  /* to be completed with further implementations */
  const [allNfts, oneNft] = await Promise.all([
    wallet.smartAsset.getOwned(),
    wallet.smartAsset.get('mainnet', {
      id: '92988157',
    }),
  ]);
  const nftsCount = allNfts.length;
  const messages = [];
  const messagesCount = messages.length;

  console.table({
    Address: wallet.getAddress(),
    'Chain type': wallet.chainType,
    'NFTs count': nftsCount,
    'Messages count': messagesCount,
  });

  console.log(`All NFTs`);
  console.table(allNfts);

  console.log(
    `One NFT: \n${JSON.stringify(oneNft, undefined, 2).slice(0, 200)}\n...`
  );
  console.table({
    'Certificate id': oneNft.data.certificateId,
    'Arianee events count': oneNft.arianeeEvents.length,
    'Blockchain events count': oneNft.data.blockchainEvents.length,
  });

  wallet.smartAsset.received.addListener((event) => {
    console.log(
      `smart asset received (${event.certificateId} on ${event.protocol.name})`
    );
  });

  wallet.smartAsset.transferred.addListener((event) => {
    console.log(
      `smart asset transferred (${event.certificateId} on ${event.protocol.name})`
    );
  });

  wallet.smartAsset.updated.addListener((event) => {
    console.log(
      `smart asset updated (${event.certificateId} on ${event.protocol.name})`
    );
  });

  wallet.smartAsset.arianeeEventReceived.addListener((event) => {
    console.log(
      `arianee event received on ${event.certificateId} (event ${event.eventId} on ${event.protocol.name})`
    );
  });

  console.log(`\n\nListening to transfer events and messages...\n`);
};
