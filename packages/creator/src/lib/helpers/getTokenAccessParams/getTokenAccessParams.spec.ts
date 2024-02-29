/* eslint-disable prettier/prettier */
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
  describe('getTokenAccessParams with trimming functionality', () => {
    it('should trim leading spaces or tabs from the passphrase and return the correct address', () => {
      // Assuming 'generateRandomPassphrase' and 'Core.fromPassPhrase' are mocked or their behavior is predictable in the test environment
      // Example passphrase with leading spaces and tabs
      const passphraseWithSpaces = '    cfbsfms598wr       '; // Leading spaces
      const passphraseWithTabs = '\t\tcfbsfms598wr'; // Leading tabs

      const paramsWithSpaces = getTokenAccessParams({
        fromPassphrase: passphraseWithSpaces,
      });
      const paramsWithTabs = getTokenAccessParams({
        fromPassphrase: passphraseWithTabs,
      });

      // Assuming '0x0f1C82cC304A3ade1e38855410D5cdF3CFB024Ad' is the expected address for the trimmed passphrase 'cfbsfms598wr'
      const expectedAddress = '0x0f1C82cC304A3ade1e38855410D5cdF3CFB024Ad';

      expect(paramsWithSpaces.passphrase).toBe('cfbsfms598wr');
      expect(paramsWithSpaces.publicKey).toBe(expectedAddress);
      expect(paramsWithTabs.passphrase).toBe('cfbsfms598wr');
      expect(paramsWithTabs.publicKey).toBe(expectedAddress);
    });
  });
});
