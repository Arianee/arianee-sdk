import Core from '@arianee/core';
import { generateRandomPassphrase } from '@arianee/utils';

import { TokenAccess } from '../types';

export const getTokenAccessParams = (
  tokenAccess?: TokenAccess
): {
  passphrase?: string;
  publicKey: string;
} => {
  let publicKey: string;
  let passphrase: string | undefined = undefined;

  if (!tokenAccess) {
    passphrase = generateRandomPassphrase();
    publicKey = Core.fromPassPhrase(passphrase).getAddress();
  } else if ('address' in tokenAccess) {
    publicKey = tokenAccess.address;
  } else if ('fromPassphrase' in tokenAccess) {
    passphrase = tokenAccess.fromPassphrase;
    const wallet = Core.fromPassPhrase(passphrase);
    publicKey = wallet.getAddress();
  } else {
    throw new Error('Invalid token access');
  }

  return {
    passphrase,
    publicKey,
  };
};
