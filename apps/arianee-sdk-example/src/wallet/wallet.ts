/**
 * The following is an example of a minimalistic Arianee Wallet for node built with the @arianee/wallet library
 */
import { Wallet } from '@arianee-sdk/wallet';

export default async () => {
  const mnemonic =
    'sunset setup moral spoil stomach flush document expand rent siege perfect gauge';

  const wallet = new Wallet({
    auth: { mnemonic },
  });

  /* to be completed with further implementations */
  const nfts = [];
  const nftsCount = nfts.length;
  const messages = [];
  const messagesCount = messages.length;
  console.table({
    Address: wallet.getAddress(),
    'Chain type': wallet.chainType,
    'NFTs count': nftsCount,
    'Messages count': messagesCount,
  });

  console.log(`Listening to transfer events and messages...\n`);

  // eslint-disable-next-line no-constant-condition
  while (1) {
    // keep alive
  }
};
