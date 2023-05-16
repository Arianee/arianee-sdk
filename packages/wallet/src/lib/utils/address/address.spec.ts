import { checksumAddress } from './address';

describe('checksumAddress', () => {
  it('should return a normalized and checksumed address of passed address', () => {
    expect(
      checksumAddress('0x19fbcf704e4ca7089d8382fbeb8cacde568710ca')
    ).toEqual('0x19FBcF704e4CA7089D8382FBeB8cacdE568710ca');
  });
});
