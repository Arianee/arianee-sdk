import Wallet from '@arianee/wallet';
import Core from '@arianee/core';
import WalletApiClient from '@arianee/wallet-api-client';
import { ChainType } from '@arianee/common-types';
import { ArianeeAccessToken } from '@arianee/arianee-access-token';

const mnemonic =
  'sunset setup moral spoil stomach flush document expand rent siege perfect gauge';

// this won't work for now as Arianee Privacy Gateway does not yet support prefixed AATs
// const prefix = 'Please sign this message to authenticate with your wallet.\r\n';
const prefix = '';

const core = Core.fromMnemonic(mnemonic);

export const arianeeAccessToken = new ArianeeAccessToken(core);

const testnetWalletApiClient = new WalletApiClient('testnet', core, {
  apiURL: 'http://127.0.0.1:3000/',
  arianeeAccessToken,
  arianeeAccessTokenPrefix: prefix,
});

const testnetWallet = new Wallet({
  auth: { mnemonic },
  walletAbstraction: testnetWalletApiClient,
  arianeeAccessToken,
  arianeeAccessTokenPrefix: prefix,
});

const mainnetWalletApiClient = new WalletApiClient('mainnet', core, {
  apiURL: 'http://127.0.0.1:3000/',
  arianeeAccessToken,
  arianeeAccessTokenPrefix: prefix,
});

const mainnetWallet = new Wallet({
  auth: { core },
  walletAbstraction: mainnetWalletApiClient,
  chainType: 'mainnet',
  arianeeAccessToken,
  arianeeAccessTokenPrefix: prefix,
});

export const wallets: Record<ChainType, Wallet<ChainType>> = {
  testnet: testnetWallet,
  mainnet: mainnetWallet,
};
