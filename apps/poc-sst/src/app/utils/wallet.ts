import Core from '@arianee/core';
import Wallet from '@arianee/wallet';

import { environment } from '../../environments/environment';

const USER_WALLET_PRIVATE_KEY =
  '0xec808e884a6c00eee1c8852f2cb45acc1a93689f96b16eb4ccdcd88adc1ccfda';
const SECOND_USER_WALLET_PRIVATE_KEY =
  '0x7346691b675eb20c2fa2a8a74c708f7d1c65b6edcf8af0d5451b888bf56b776c';
const SERVICE_PROVIDER_WALLET_PRIVATE_KEY =
  environment.serviceProviderPrivateKey;

export type WalletsRecord = {
  userWallet: Wallet;
  secondUserWallet: Wallet;
  serviceProviderWallet: Wallet;
};

export const CORES: Record<keyof typeof WALLETS, Core> = {
  userWallet: Core.fromPrivateKey(USER_WALLET_PRIVATE_KEY),
  secondUserWallet: Core.fromPrivateKey(SECOND_USER_WALLET_PRIVATE_KEY),
  serviceProviderWallet: Core.fromPrivateKey(
    SERVICE_PROVIDER_WALLET_PRIVATE_KEY
  ),
};

export const WALLETS: WalletsRecord = {
  userWallet: new Wallet({
    auth: {
      core: CORES.userWallet,
    },
  }),
  secondUserWallet: new Wallet({
    auth: {
      core: CORES.secondUserWallet,
    },
  }),
  serviceProviderWallet: new Wallet({
    auth: {
      core: CORES.serviceProviderWallet,
    },
  }),
};
