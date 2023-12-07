/* eslint-disable @typescript-eslint/no-explicit-any */
import { Core } from '@arianee/core';
import { MemoryStorage } from '@arianee/utils';

import { ArianeeAccessToken } from './arianee-access-token';
import * as timeBeforeExpModule from './helpers/timeBeforeExp';

describe('arianeeAccessToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const pk =
    '0xaab1af774ae54a2efaff0d3d93308c00fa7b639304da92847cfc986af4b87eb5';
  const core = Core.fromPrivateKey(pk);

  describe('constructor', () => {
    it('should use the MemoryStorage if no storage passed', () => {
      const arianeeAccessToken = new ArianeeAccessToken(core);
      expect(arianeeAccessToken['storage']).toBeInstanceOf(MemoryStorage);
    });

    it('should use the passed storage', () => {
      const storage = new MemoryStorage();

      const arianeeAccessToken = new ArianeeAccessToken(core, {
        storage,
      });

      expect(arianeeAccessToken['storage']).toBe(storage);
    });

    it('should set the initial walletAccessToken if passed', () => {
      const storage = {
        setItem: jest.fn(),
      } as unknown as Storage;

      const arianeeAccessToken = new ArianeeAccessToken(core, {
        storage,
        initialValues: {
          walletAccessToken: 'mockToken',
        },
      });

      expect(storage.setItem).toHaveBeenCalledWith(
        'arianee__lastAAT',
        'mockToken'
      );
      expect(arianeeAccessToken['storage']).toBe(storage);
    });
  });

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

  it('should verify a prefixed aat validity', async () => {
    // this aat has a long exp date
    const prefixedAat =
      'Please sign this arianee access token\neyJ0eXAiOiJKV1QiLCJhbGciOiJzZWNwMjU2azEifQ==.eyJpc3MiOiIweDc2OTFlMDcwNUMyRThlRDc5MzY2QjA2N2Q1ZkNBRmE4OUFBMDdGODgiLCJzdWIiOiJ3YWxsZXQiLCJleHAiOjYwMTY4MjI0MDc0MTk4OCwiaWF0IjoxNjg2MzAzNzg1NzE0fQ==.0x034fdc0cef784787bbc085adc73c1f9adb59e6045bfcb3aab7caeeb5e939e26d266e6eb84956df6c0517b4c61d623e6e3ab5c84d13fb3d9c7a27dba811168ac81c';
    const isValid = ArianeeAccessToken.isArianeeAccessTokenValid(prefixedAat);
    expect(isValid).toEqual(true);
  });

  it('should decode a prefixed aat', async () => {
    // this aat has a long exp date
    const prefixedAat =
      'Please sign this arianee access token\neyJ0eXAiOiJKV1QiLCJhbGciOiJzZWNwMjU2azEifQ==.eyJpc3MiOiIweDc2OTFlMDcwNUMyRThlRDc5MzY2QjA2N2Q1ZkNBRmE4OUFBMDdGODgiLCJzdWIiOiJ3YWxsZXQiLCJleHAiOjIwMDE2NjM5NjkwOTUsImlhdCI6MTY4NjMwMzk2OTA5NX0=.0x3d7a5471eb857cf5b0f0893e4d78ec7dbcfc0b3670a4a366b049abd7e4517b3a2ebc04b6b4661e75762c3d324ec274718fb1ca49203d0fb01e4d71a4c9a5c2e51c';

    const decoded = ArianeeAccessToken.decodeJwt(prefixedAat);

    expect(decoded.payload).toMatchObject({
      iss: '0x7691e0705C2E8eD79366B067d5fCAFa89AA07F88',
      sub: 'wallet',
      exp: 2001663969095,
      iat: 1686303969095,
    });
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

    it('returns the passed initial token if it is valid', async () => {
      const initialAAT =
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJzZWNwMjU2azEifQ==.eyJpc3MiOiIweDc2OTFlMDcwNUMyRThlRDc5MzY2QjA2N2Q1ZkNBRmE4OUFBMDdGODgiLCJzdWIiOiJ3YWxsZXQiLCJleHAiOjE4NzQ3NDQ3MDY2NjEsImlhdCI6MTcwMTk0NDcwNjY2MX0=.0xc325b872a4ea65b89ba8846685920b90155fcb8c9d87c06dd4fcdbc708ad4f1a4dc67029b946f44284d0442eee03b08ee9bba1de5bfd6769fd2bbd86363456b41c';

      const aatGenerator = new ArianeeAccessToken(core, {
        initialValues: {
          walletAccessToken: initialAAT,
        },
      });

      const spy = jest.spyOn(aatGenerator, 'createWalletAccessToken');

      const aat1 = await aatGenerator.getValidWalletAccessToken();
      const aat2 = await aatGenerator.getValidWalletAccessToken();
      expect(aat1).toBe(aat2);
      expect(aat1).toBe(initialAAT);
      expect(spy).not.toHaveBeenCalled();
    });

    it('creates a new token if the existing token is expired', async () => {
      const aatGenerator = new ArianeeAccessToken(core);
      const spy = jest.spyOn(aatGenerator, 'createWalletAccessToken');
      const isExpInLessThanSpy = jest.spyOn(
        timeBeforeExpModule,
        'isExpInLessThan'
      );

      const aat1 = await aatGenerator.getValidWalletAccessToken({ exp: 0 });
      const aat2 = await aatGenerator.getValidWalletAccessToken();

      expect(aat1).not.toBe(aat2);
      expect(spy).toHaveBeenCalledTimes(2);
      expect(isExpInLessThanSpy).toHaveBeenCalledWith(aat1, 10);
    });

    it('creates a new token if there is no existing token', async () => {
      const aatGenerator = new ArianeeAccessToken(core);
      const spy = jest.spyOn(aatGenerator, 'createWalletAccessToken');

      const aat1 = await aatGenerator.getValidWalletAccessToken();
      expect(aat1).toBeDefined();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('creates a new token with the passed prefix', async () => {
      const aat = new ArianeeAccessToken(core);
      const createWalletAccessTokenSpy = jest.spyOn(
        aat,
        'createWalletAccessToken'
      );

      const prefix = 'Please sign this arianee access token\n';

      const generatedAat = await aat.getValidWalletAccessToken({}, { prefix });

      expect(generatedAat).toMatch(new RegExp(prefix + '(a-zA-Zd.)*', 'gi'));
      expect(createWalletAccessTokenSpy).toHaveBeenCalledTimes(1);
      expect(createWalletAccessTokenSpy).toHaveBeenCalledWith({}, prefix);
    });
  });

  describe('createWalletAccessToken', () => {
    it('should call and return generateAAT with correct params', async () => {
      const aat = new ArianeeAccessToken(core);

      const generateAATSpy = jest.spyOn(aat as any, 'generateAAT');
      const generatedAat = await aat.createWalletAccessToken({}, 'prefix');

      expect(generateAATSpy).toHaveBeenCalledWith({}, 'prefix');
      expect(generatedAat).toMatch(/prefix(a-zA-Zd.)*/gi);
    });
  });
});
