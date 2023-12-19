// This file can be replaced during build by using the `fileReplacements` array.
// When building for production, this file is replaced with `environment.prod.ts`.

import { PERMIT721_ADDRESS } from '@arianee/permit721-sdk';

export const environment = {
  production: false,
  serviceProviderCallbackUrl: window.location.href + 'provider',
  serviceProviderAddress: '0x663A2b5bf860D22b317A7C6b8Fce470558DC74Be',
  serviceProviderPrivateKey:
    '0xe9f603798e4fa03c4bd05774bfbe92ec80ba022b7fe9d24b6cc9bf7bad2028b5',
  network: 'testnet',
  httpProvider: 'https://sokol.arianee.net/',
  chainId: 77,
  permit721Address: PERMIT721_ADDRESS,
};
