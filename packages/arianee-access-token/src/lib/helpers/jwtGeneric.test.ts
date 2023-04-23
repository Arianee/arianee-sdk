import { JWTGeneric } from './jwtGeneric';
import { Core } from '@arianee-sdk/core';
import { ethers } from 'ethers';
import { ArianeeAccessTokenPayload } from '../types/arianeeAccessTokenPayload';

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
    scope: 'wallet',
    exp: 0,
    iat: 0,
  };
  const expectedToken =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJzZWNwMjU2azEifQ==.eyJpc3MiOiIweDc0RkUwOURiMjNEZjVjMzVkMjk2OUI2NjZmN0FBOTQ2MjFFMTFEMzAiLCJzY29wZSI6IndhbGxldCIsImV4cCI6MCwiaWF0IjowfQ==.0x4367a69f695973c6d4ddf068ef5053926cd74c9158ca09c2c3de77b5b941e5b0712b8ec0a4a590da5f769e6887768af20bd9d39e13ed7160a6f4f7a2eb9af5c51c';

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
          scope: 'wallet',
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
          scope: 'wallet',
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
          scope: 'wallet',
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
          scope: 'wallet',
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
