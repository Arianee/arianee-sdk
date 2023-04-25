import { ArianeeAccessToken } from './arianee-access-token';
import { Core } from '@arianee/core';

describe('arianeeAccessToken', () => {
  const pk =
    '0xaab1af774ae54a2efaff0d3d93308c00fa7b639304da92847cfc986af4b87eb5';
  const core = Core.fromPrivateKey(pk);

  it('should generate a valid aat', async () => {
    const aatGenerator = new ArianeeAccessToken(core);
    const aat = await aatGenerator['generateAAT']({ iat: 0, exp: 0 });
    expect(aat).toEqual(
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJzZWNwMjU2azEifQ==.eyJpc3MiOiIweDc2OTFlMDcwNUMyRThlRDc5MzY2QjA2N2Q1ZkNBRmE4OUFBMDdGODgiLCJzdWIiOiJ3YWxsZXQiLCJleHAiOjAsImlhdCI6MH0=.0x6ec31d56cb6ec7ff9cf9c04f16c4bdc75b9b1d1b35d1940f20b3e905e162600b67a1970f537b9ae8c26c1f05a93913d13d599923880f71ed1198b331593bd8f81b'
    );
  });

  it('should verify aat validity', async () => {
    // this aat has a long exp date
    const aat =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFVEgifQ==.eyJpc3MiOiIweDc2OTFlMDcwNUMyRThlRDc5MzY2QjA2N2Q1ZkNBRmE4OUFBMDdGODgiLCJzY29wZSI6ImFsbCIsImV4cCI6NjAxNjgyMjQwNzQxOTg4LCJpYXQiOjE2ODIyNDA3NDE5ODgsImNoYWluIjoidGVzdG5ldCIsInN1YiI6IndhbGxldCJ9.0x7bfc70360ed7809d2b0c9e348930c10917ebcabfee5cfa0dc608719e8eaae812492c497a388fce5ff61ef5fb9a1c13ac4ef33075249e8c63adc95e05603188b21b';
    const aatValidity = ArianeeAccessToken.isArianeeAccessTokenValid(aat);
    expect(aatValidity).toEqual(true);
  });

  it('should create a validate an aat', async () => {
    const aatGenerator = new ArianeeAccessToken(core);
    const aat = await aatGenerator['generateAAT']();
    const aatValidity = ArianeeAccessToken.isArianeeAccessTokenValid(aat);
    expect(aatValidity).toEqual(true);
  });

  it('should create a validate an aat', async () => {
    const aatGenerator = new ArianeeAccessToken(core);
    const aat = await aatGenerator['generateAAT']();
    const decoded = ArianeeAccessToken.decodeJwt(aat);
    expect(decoded.payload.iss).toEqual(core.getAddress());
  });

  describe('getValidWalletAccessToken', () => {
    it('returns the existing token if it is valid', async () => {
      const aatGenerator = new ArianeeAccessToken(core);
      const spy = jest.spyOn(aatGenerator, 'createWalletAccessToken');

      const aat1 = await aatGenerator.getValidWalletAccessToken();
      const aat2 = await aatGenerator.getValidWalletAccessToken();
      expect(aat1).toBe(aat2);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('creates a new token if the existing token is expired', async () => {
      const aatGenerator = new ArianeeAccessToken(core);
      const spy = jest.spyOn(aatGenerator, 'createWalletAccessToken');

      const aat1 = await aatGenerator.getValidWalletAccessToken({ exp: 0 });
      const aat2 = await aatGenerator.getValidWalletAccessToken();

      expect(aat1).not.toBe(aat2);
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('creates a new token if there is no existing token', async () => {
      const aatGenerator = new ArianeeAccessToken(core);
      const spy = jest.spyOn(aatGenerator, 'createWalletAccessToken');

      const aat1 = await aatGenerator.getValidWalletAccessToken();
      expect(aat1).toBeDefined();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
