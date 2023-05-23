import Wallet from '@arianee/wallet';
import Core from '@arianee/core';
import WalletApiClient from '@arianee/wallet-api-client';
import { ChainType } from '@arianee/common-types';
import { ArianeeAccessToken } from '@arianee/arianee-access-token';

const mnemonic =
  'sunset setup moral spoil stomach flush document expand rent siege perfect gauge';

const core = Core.fromMnemonic(mnemonic);

const arianeeAccessToken = new ArianeeAccessToken(core);

const testnetWalletApiClient = new WalletApiClient('testnet', core, {
  apiURL: 'http://127.0.0.1:3000/',
  arianeeAccessToken,
});

const testnetWallet = new Wallet({
  auth: { mnemonic },
  walletAbstraction: testnetWalletApiClient,
  arianeeAccessToken,
});

const mainnetWalletApiClient = new WalletApiClient('mainnet', core, {
  apiURL: 'http://127.0.0.1:3000/',
  arianeeAccessToken,
});

const mainnetWallet = new Wallet({
  auth: { core },
  walletAbstraction: mainnetWalletApiClient,
  chainType: 'mainnet',
  arianeeAccessToken,
});

export const wallets: Record<ChainType, Wallet<ChainType>> = {
  testnet: testnetWallet,
  mainnet: mainnetWallet,
};
