import { JWTGeneric } from './jwtGeneric';
import { Core } from '@arianee/core';
import { ethers } from 'ethers';
import { ArianeeAccessTokenPayload } from '../types/ArianeeAccessTokenPayload';

describe('JWTGeneric', function () {
  const pubKey = '0x74FE09Db23Df5c35d2969B666f7AA94621E11D30';
  const privateKey =
    '0x14a99f4c1f00982e9f3762c9abaf88b30e9f3e6bb8b89bc99ecb76e1cd7a6538';

  const core = Core.fromPrivateKey(privateKey);

  const signer = async (data: string) =>
    (await core.signMessage(data)).signature;
  const recover = (message: string, signature: string) =>
    ethers.verifyMessage(message, signature);
  const now = Date.now();
  const payload: ArianeeAccessTokenPayload = {
    iss: '0x74FE09Db23Df5c35d2969B666f7AA94621E11D30',
    sub: 'wallet',
    exp: 0,
    iat: 0,
  };
  const expectedToken =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJzZWNwMjU2azEifQ==.eyJpc3MiOiIweDc0RkUwOURiMjNEZjVjMzVkMjk2OUI2NjZmN0FBOTQ2MjFFMTFEMzAiLCJzdWIiOiJ3YWxsZXQiLCJleHAiOjAsImlhdCI6MH0=.0x5e6a861198682b3ab59a5be58dfa534affc7d2f7e9e93b0ca7e6c04493d5e9ea2e136d1c07f43b7e951f9d4a52c67ea89f44ceec9ea6a86e14b09eb427a82a591c';

  describe('basic methods', () => {
    test('it should create a token', async () => {
      const jwt = new JWTGeneric({ signer, recover });

      const jwtService = await jwt.setPayload(payload);
      const token = await jwtService.sign();

      expect(token).toBe(expectedToken);
    });

    test('it should decode a token', () => {
      const jwt = new JWTGeneric({ signer, recover });

      const decodedToken = jwt.setToken(expectedToken).decode();

      expect(decodedToken.payload).toEqual(payload);
    });

    test('it should verify a wrong pubKey and say false', () => {
      const jwt = new JWTGeneric({ signer, recover });

      const isAuthentic = jwt
        .setToken(expectedToken)
        .verify('0x74FE09Db23Df5c35d2969B666f7AA94621E110');

      expect(isAuthentic).toBeFalsy();
    });

    test('it should verify the right pubkey and say true', () => {
      const jwt = new JWTGeneric({ signer, recover });

      const isAuthentic = jwt.setToken(expectedToken).verify(pubKey);

      expect(isAuthentic).toBeTruthy();
    });
  });

  describe('verify methods', () => {
    describe('exp', () => {
      test('it should be false if expired', async () => {
        const jwt = new JWTGeneric({ signer, recover });
        const now = Date.now();
        const exp = new Date();
        exp.setMinutes(exp.getMinutes() - 5);
        const payload: ArianeeAccessTokenPayload = {
          sub: 'wallet',
          iss: pubKey,
          iat: now,
          exp: exp.getTime(),
        };

        const jwtService = await jwt.setPayload(payload);
        const token = await jwtService.sign();

        const isAuthentic = jwt.setToken(token).verify(pubKey);

        expect(isAuthentic).toBeFalsy();
      });
      test('it should be true if not expired', async () => {
        const jwt = new JWTGeneric({ signer, recover });
        const exp = new Date();
        exp.setMinutes(exp.getMinutes() + 5);
        const payload: ArianeeAccessTokenPayload = {
          sub: 'wallet',
          iss: pubKey,
          iat: now,
          exp: exp.getTime(),
        };

        const jwtService = await jwt.setPayload(payload);
        const token = await jwtService.sign();

        const isAuthentic = jwt.setToken(token).verify(pubKey);

        expect(isAuthentic).toBeTruthy();
      });
    });
    describe('nbf', () => {
      test('it should be false if before nbf', async () => {
        const jwt = new JWTGeneric({ signer, recover });
        const nbf = new Date();
        nbf.setMinutes(nbf.getMinutes() + 5);
        const payload: ArianeeAccessTokenPayload = {
          sub: 'wallet',
          iss: pubKey,
          iat: now,
          exp: now + 5 * 60 * 1000,
          nbf: nbf.getTime(),
        };

        const jwtService = await jwt.setPayload(payload);
        const token = await jwtService.sign();

        const isAuthentic = jwt.setToken(token).verify(pubKey);

        expect(isAuthentic).toBeFalsy();
      });
      test('it should be true if after nbf', async () => {
        const jwt = new JWTGeneric({ signer, recover });
        const nbf = new Date();
        nbf.setMinutes(nbf.getMinutes() - 5);
        const payload: ArianeeAccessTokenPayload = {
          sub: 'wallet',
          iss: pubKey,
          iat: now,
          exp: now + 5 * 60 * 1000,
          nbf: nbf.getTime(),
        };

        const jwtService = await jwt.setPayload(payload);
        const token = await jwtService.sign();

        const isAuthentic = jwt.setToken(token).verify(pubKey);

        expect(isAuthentic).toBeTruthy();
      });
    });

    test('it should verify a token and say true', () => {
      const jwt = new JWTGeneric({ signer, recover });

      const isAuthentic = jwt.setToken(expectedToken).verify(pubKey);

      expect(isAuthentic).toBeTruthy();
    });
  });
});
