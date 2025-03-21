/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Core } from '@arianee/core';
import { defaultFetchLike } from '@arianee/utils';

import ArianeePrivacyGatewayClient from './arianee-privacy-gateway-client';

const mockRpcCall = () => ({
  json: () => ({
    result: {
      $schema: 'mock',
    },
  }),
});

const certificateId = '123';
const passphrase = '05fo931jo0mi';
const messageId = '456';
const eventId = '789';

const content = {
  $schema: 'mock',
  name: 'test',
};

describe('arianeePrivacyGatewayClient', () => {
  describe('constructor', () => {
    it('should use node-fetch in node environment as default fetch function', () => {
      const client = new ArianeePrivacyGatewayClient('');
      expect(client['fetchLike']).toBe(defaultFetchLike);
    });
  });

  describe('using a Core instance as auth', () => {
    let core: Core;
    let arianeePrivacyGatewayClient: ArianeePrivacyGatewayClient;
    let rpcCallSpy: jest.SpyInstance;

    beforeEach(() => {
      core = Core.fromRandom();

      arianeePrivacyGatewayClient = new ArianeePrivacyGatewayClient(
        core,
        jest.fn()
      );

      rpcCallSpy = jest
        .spyOn(arianeePrivacyGatewayClient, 'rpcCall' as any)
        .mockImplementation(mockRpcCall);
    });

    it('should be able to call certificateRead', async () => {
      const res = await arianeePrivacyGatewayClient.certificateRead(
        'https://mock-rpc/',
        {
          certificateId,
        }
      );

      expect(rpcCallSpy).toHaveBeenCalledWith(
        'https://mock-rpc/',
        'certificate.read',
        {
          certificateId,
          authentification: {
            bearer: expect.any(String),
          },
        }
      );

      expect(res.$schema).toBeDefined();
    });

    it('should be able to call certificateCreate', async () => {
      const res = await arianeePrivacyGatewayClient.certificateCreate(
        'https://mock-rpc/',
        {
          certificateId,
          content,
        }
      );

      expect(rpcCallSpy).toHaveBeenCalledWith(
        'https://mock-rpc/',
        'certificate.create',
        {
          certificateId,
          json: content,
        }
      );

      expect(res).toBeDefined();
    });

    it('should be able to call certificateRead with a passphrase', async () => {
      const res = await arianeePrivacyGatewayClient.certificateRead(
        'https://mock-rpc/',
        {
          certificateId,
          passphrase,
        }
      );

      expect(rpcCallSpy).toHaveBeenCalledWith(
        'https://mock-rpc/',
        'certificate.read',
        {
          certificateId,
          authentification: {
            message: expect.any(String),
            signature: expect.any(String),
          },
        }
      );

      expect(res.$schema).toBeDefined();
    });
    it('should be able to call updateRead', async () => {
      const res = await arianeePrivacyGatewayClient.updateRead(
        'https://mock-rpc/',
        {
          certificateId,
        }
      );

      expect(rpcCallSpy).toHaveBeenCalledWith(
        'https://mock-rpc/',
        'update.read',
        {
          certificateId,
          authentification: {
            bearer: expect.any(String),
          },
        }
      );

      expect(res.$schema).toBeDefined();
    });

    it('should be able to call updateCreate', async () => {
      const res = await arianeePrivacyGatewayClient.updateCreate(
        'https://mock-rpc/',
        {
          certificateId,
          content,
        }
      );

      expect(rpcCallSpy).toHaveBeenCalledWith(
        'https://mock-rpc/',
        'update.create',
        {
          certificateId,
          json: content,
        }
      );

      expect(res).toBeDefined();
    });

    it('should be able to call updateRead with a passphrase', async () => {
      const res = await arianeePrivacyGatewayClient.updateRead(
        'https://mock-rpc/',
        {
          certificateId,
          passphrase,
        }
      );

      expect(rpcCallSpy).toHaveBeenCalledWith(
        'https://mock-rpc/',
        'update.read',
        {
          certificateId,
          authentification: {
            message: expect.any(String),
            signature: expect.any(String),
          },
        }
      );

      expect(res.$schema).toBeDefined();
    });

    it('should be able to call messageRead', async () => {
      const res = await arianeePrivacyGatewayClient.messageRead(
        'https://mock-rpc/',
        {
          messageId,
        }
      );

      expect(rpcCallSpy).toHaveBeenCalledWith(
        'https://mock-rpc/',
        'message.read',
        {
          messageId,
          authentification: {
            bearer: expect.any(String),
          },
        }
      );

      expect(res.$schema).toBeDefined();
    });

    it('should be able to call messageCreate', async () => {
      const res = await arianeePrivacyGatewayClient.messageCreate(
        'https://mock-rpc/',
        {
          messageId,
          content,
        }
      );

      expect(rpcCallSpy).toHaveBeenCalledWith(
        'https://mock-rpc/',
        'message.create',
        {
          messageId,
          json: content,
        }
      );

      expect(res).toBeDefined();
    });

    it('should be able to call eventRead', async () => {
      const res = await arianeePrivacyGatewayClient.eventRead(
        'https://mock-rpc/',
        {
          certificateId,
          eventId,
        }
      );

      expect(rpcCallSpy).toHaveBeenCalledWith(
        'https://mock-rpc/',
        'event.read',
        {
          certificateId,
          eventId,
          authentification: {
            bearer: expect.any(String),
          },
        }
      );

      expect(res.$schema).toBeDefined();
    });
    it('should be able to call messageCreate', async () => {
      const res = await arianeePrivacyGatewayClient.eventCreate(
        'https://mock-rpc/',
        {
          eventId,
          content,
        }
      );

      expect(rpcCallSpy).toHaveBeenCalledWith(
        'https://mock-rpc/',
        'event.create',
        {
          eventId,
          json: content,
        }
      );

      expect(res).toBeDefined();
    });

    it('should be able to call eventRead with a passphrase', async () => {
      const res = await arianeePrivacyGatewayClient.eventRead(
        'https://mock-rpc/',
        {
          certificateId,
          eventId,
          passphrase,
        }
      );

      expect(rpcCallSpy).toHaveBeenCalledWith(
        'https://mock-rpc/',
        'event.read',
        {
          certificateId,
          eventId,
          authentification: {
            message: expect.any(String),
            signature: expect.any(String),
          },
        }
      );

      expect(res.$schema).toBeDefined();
    });
  });

  describe('using an ArianeeAccessToken as auth', () => {
    let arianeePrivacyGatewayClient: ArianeePrivacyGatewayClient;
    let rpcCallSpy: jest.SpyInstance;
    const arianeeAccessToken = 'mockAat';

    beforeEach(() => {
      arianeePrivacyGatewayClient = new ArianeePrivacyGatewayClient(
        arianeeAccessToken,
        jest.fn()
      );

      rpcCallSpy = jest
        .spyOn(arianeePrivacyGatewayClient, 'rpcCall' as any)
        .mockImplementation(mockRpcCall);
    });

    it('should be able to call certificateRead', async () => {
      const res = await arianeePrivacyGatewayClient.certificateRead(
        'https://mock-rpc/',
        {
          certificateId,
        }
      );

      expect(rpcCallSpy).toHaveBeenCalledWith(
        'https://mock-rpc/',
        'certificate.read',
        {
          certificateId,
          authentification: {
            bearer: arianeeAccessToken,
          },
        }
      );

      expect(res.$schema).toBeDefined();
    });

    it('should be able to call updateRead', async () => {
      const res = await arianeePrivacyGatewayClient.updateRead(
        'https://mock-rpc/',
        {
          certificateId,
        }
      );

      expect(rpcCallSpy).toHaveBeenCalledWith(
        'https://mock-rpc/',
        'update.read',
        {
          certificateId,
          authentification: {
            bearer: arianeeAccessToken,
          },
        }
      );

      expect(res.$schema).toBeDefined();
    });

    it('should be able to call messageRead', async () => {
      const res = await arianeePrivacyGatewayClient.messageRead(
        'https://mock-rpc/',
        {
          messageId,
        }
      );

      expect(rpcCallSpy).toHaveBeenCalledWith(
        'https://mock-rpc/',
        'message.read',
        {
          messageId,
          authentification: {
            bearer: arianeeAccessToken,
          },
        }
      );

      expect(res.$schema).toBeDefined();
    });

    it('should be able to call eventRead', async () => {
      const res = await arianeePrivacyGatewayClient.eventRead(
        'https://mock-rpc/',
        {
          certificateId,
          eventId,
        }
      );

      expect(rpcCallSpy).toHaveBeenCalledWith(
        'https://mock-rpc/',
        'event.read',
        {
          certificateId,
          eventId,
          authentification: {
            bearer: arianeeAccessToken,
          },
        }
      );

      expect(res.$schema).toBeDefined();
    });
  });

  describe('using a message/signature as auth', () => {
    let arianeePrivacyGatewayClient: ArianeePrivacyGatewayClient;
    let rpcCallSpy: jest.SpyInstance;
    const auth = {
      message: 'mockMessage',
      signature: 'mockSignature',
    };

    beforeEach(() => {
      arianeePrivacyGatewayClient = new ArianeePrivacyGatewayClient(
        auth,
        jest.fn()
      );

      rpcCallSpy = jest
        .spyOn(arianeePrivacyGatewayClient, 'rpcCall' as any)
        .mockImplementation(mockRpcCall);
    });

    it('should be able to call certificateRead', async () => {
      const res = await arianeePrivacyGatewayClient.certificateRead(
        'https://mock-rpc/',
        {
          certificateId,
        }
      );

      expect(rpcCallSpy).toHaveBeenCalledWith(
        'https://mock-rpc/',
        'certificate.read',
        {
          certificateId,
          authentification: {
            ...auth,
          },
        }
      );

      expect(res.$schema).toBeDefined();
    });

    it('should be able to call updateRead', async () => {
      const res = await arianeePrivacyGatewayClient.updateRead(
        'https://mock-rpc/',
        {
          certificateId,
        }
      );

      expect(rpcCallSpy).toHaveBeenCalledWith(
        'https://mock-rpc/',
        'update.read',
        {
          certificateId,
          authentification: {
            ...auth,
          },
        }
      );

      expect(res.$schema).toBeDefined();
    });

    it('should throw if trying to call messageRead', async () => {
      const f = async () =>
        await arianeePrivacyGatewayClient.messageRead('https://mock-rpc/', {
          messageId,
        });

      expect(f).rejects.toThrowError(/cannot/gi);
    });

    it('should be able to call eventRead', async () => {
      const res = await arianeePrivacyGatewayClient.eventRead(
        'https://mock-rpc/',
        {
          certificateId,
          eventId,
        }
      );

      expect(rpcCallSpy).toHaveBeenCalledWith(
        'https://mock-rpc/',
        'event.read',
        {
          certificateId,
          eventId,
          authentification: {
            ...auth,
          },
        }
      );

      expect(res.$schema).toBeDefined();
    });
  });
});
