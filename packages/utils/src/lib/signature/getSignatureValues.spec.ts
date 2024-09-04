import { hashMessage, Wallet } from 'ethers';

import { getSignatureValues } from './getSignatureValues';

describe('getSignatureValues', () => {
  it('should throw if the signature is invalid', () => {
    expect(() => getSignatureValues('invalid')).toThrowError(
      'Invalid signature'
    );
  });

  it('should return the signature values', async () => {
    const wallet = Wallet.createRandom();
    const message = 'test';
    const signature = await wallet.signMessage(message);
    const result = getSignatureValues(signature);

    const { r, s, v } = wallet.signingKey.sign(hashMessage(message));

    expect(result).toEqual({ r, s, v });
  });
});
