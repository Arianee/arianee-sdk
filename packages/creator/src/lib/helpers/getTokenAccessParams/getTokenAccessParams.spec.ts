import { TokenAccess } from '../../types';
import { getTokenAccessParams } from './getTokenAccessParams';

describe('getTokenAccessParams', () => {
  it('should generate a random passphrase if no tokenAccess is provided', () => {
    const { passphrase, publicKey } = getTokenAccessParams();
    expect(passphrase).toBeDefined();
    expect(publicKey).toBeDefined();
  });

  it('should return the address if tokenAccess is an object with an address property', () => {
    const params = getTokenAccessParams({ address: '0x123' });
    expect(params.passphrase).not.toBeDefined();
    expect(params.publicKey).toBe('0x123');
  });

  it('should return the pasphrase and its address if tokenAccess is an object with a fromPassphrase property', () => {
    const params = getTokenAccessParams({ fromPassphrase: 'cfbsfms598wr' });
    expect(params.passphrase).toBe('cfbsfms598wr');
    expect(params.publicKey).toBe('0x0f1C82cC304A3ade1e38855410D5cdF3CFB024Ad');
  });

  it('should throw an error if tokenAccess is an object with an invalid property', () => {
    expect(() =>
      getTokenAccessParams({ invalid: 'property' } as unknown as TokenAccess)
    ).toThrow('Invalid token access');
  });
});
