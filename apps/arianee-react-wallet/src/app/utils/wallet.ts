import { ArianeeAccessToken } from '@arianee/arianee-access-token';
import { ChainType } from '@arianee/common-types';
import Core from '@arianee/core';
import Wallet from '@arianee/wallet';
import WalletApiClient from '@arianee/wallet-api-client';

const mnemonic =
  'sunset setup moral spoil stomach flush document expand rent siege perfect gauge';

const prefix = '';

const core = Core.fromMnemonic(mnemonic);

export const arianeeAccessToken = new ArianeeAccessToken(core);

export const getWallet = (chainType: ChainType, walletApiUrl: string) => {
  const walletApiClient = new WalletApiClient(chainType, core, {
    apiURL: walletApiUrl,
    arianeeAccessToken,
    arianeeAccessTokenPrefix: prefix,
  });

  const wallet = new Wallet({
    auth: { core },
    walletAbstraction: walletApiClient,
    chainType,
    arianeeAccessToken,
    arianeeAccessTokenPrefix: prefix,
  });

  return wallet;
};
