import * as arianeeProtocolClientModule from '@arianee/arianee-protocol-client';
import { ArianeeProductCertificateI18N } from '@arianee/common-types';
import Core from '@arianee/core';
import { ZeroAddress } from 'ethers';

import Creator from '../creator';
import { getSmartAssetFromApi } from '../helpers/smartAsset/getSmartAssetFromApi';
import { CreditType } from '../types';

jest.mock('@arianee/arianee-protocol-client');
jest.mock('../helpers/smartAsset/getSmartAssetFromApi');
jest.spyOn(console, 'error').mockImplementation();

const getSmartAssetFromApiMock = getSmartAssetFromApi as jest.MockedFunction<
  typeof getSmartAssetFromApi
>;

describe('Creator', () => {
  const core = Core.fromPrivateKey(
    '0x6930cbe9e9c1d1c2e864b2b0e22bca033933369b0bfdbe236b1a29bc712bc137'
  );
  const publicKey = '0x655F362F23cA6B937a2418F882097Ea3B2b14Ef0';
  const creatorAddress = `0x${'a'.repeat(40)}`;
  let creator: Creator<'WAIT_TRANSACTION_RECEIPT'>;

  beforeEach(() => {
    creator = new Creator({
      core,
      creatorAddress,
      transactionStrategy: 'WAIT_TRANSACTION_RECEIPT',
    });

    Object.defineProperty(Creator.prototype, 'connected', {
      get: () => true,
    });

    Object.defineProperty(Creator.prototype, 'slug', {
      get: () => 'testnet',
    });

    jest.clearAllMocks();
    // Default: the API does not know the token, so every existing case keeps
    // exercising the chain fallback. The API path is covered explicitly below.
    getSmartAssetFromApiMock.mockResolvedValue(null);
  });

  describe('getAvailableId', () => {
    it('smartAsset: should call isSmartAssetIdAvailable and return the free number', async () => {
      const isSmartAssetIdAvailableSpy = jest
        .spyOn(creator.utils, 'isSmartAssetIdAvailable')
        .mockResolvedValue(true);

      const id = await creator.utils.getAvailableId('smartAsset');

      expect(isSmartAssetIdAvailableSpy).toHaveBeenCalledWith(
        expect.any(Number)
      );

      expect(id).toEqual(expect.any(Number));
    });
    it('message: should call isMessageIdAvailable and return the free number', async () => {
      const isMessageIdAvailableSpy = jest
        .spyOn(creator.utils, 'isMessageIdAvailable')
        .mockResolvedValue(true);

      const id = await creator.utils.getAvailableId('message');

      expect(isMessageIdAvailableSpy).toHaveBeenCalledWith(expect.any(Number));

      expect(id).toEqual(expect.any(Number));
    });
  });

  describe('getAvailableSmartAssetId', () => {
    it('should call getAvailableId and return the number', async () => {
      const getAvailableIdSpy = jest
        .spyOn(creator.utils, 'getAvailableId')
        .mockResolvedValue(123);

      const id = await creator.utils.getAvailableSmartAssetId();

      expect(getAvailableIdSpy).toHaveBeenCalledWith('smartAsset');

      expect(id).toEqual(123);
    });
  });

  describe('getAvailableMessageId', () => {
    it('should call getAvailableId and return the number', async () => {
      const getAvailableIdSpy = jest
        .spyOn(creator.utils, 'getAvailableId')
        .mockResolvedValue(123);

      const id = await creator.utils.getAvailableMessageId();

      expect(getAvailableIdSpy).toHaveBeenCalledWith('message');

      expect(id).toEqual(123);
    });
  });

  describe('isSmartAssetIdAvailable', () => {
    it('should call the v1 contract with correct params and return true if available', async () => {
      const ownerOfSpy = jest
        .fn()
        .mockRejectedValue({ code: 'CALL_EXCEPTION' });

      const callWrapperSpy = jest
        .spyOn(arianeeProtocolClientModule, 'callWrapper')
        .mockImplementation(async (_, __, actions) => {
          await actions.protocolV1Action({
            smartAssetContract: {
              ownerOf: ownerOfSpy,
            },
          } as any);
        });

      const available = await creator.utils.isSmartAssetIdAvailable(123);

      expect(ownerOfSpy).toHaveBeenCalledWith(expect.any(Number));

      expect(callWrapperSpy).toHaveBeenCalledWith(
        creator['arianeeProtocolClient'],
        creator['slug'],
        {
          protocolV1Action: expect.any(Function),
          protocolV2Action: expect.any(Function),
        },
        undefined
      );

      expect(available).toBeTruthy();
    });
  });

  describe('canCreateSmartAsset', () => {
    it('return true if the smart asset id is available', async () => {
      const id = 123;

      const isSmartAssetIdAvailableSpy = jest
        .spyOn(creator.utils, 'isSmartAssetIdAvailable')
        .mockResolvedValue(true);

      const canCreate = await creator.utils.canCreateSmartAsset(id);

      expect(isSmartAssetIdAvailableSpy).toHaveBeenCalledWith(id);
      expect(canCreate).toBeTruthy();
    });

    it('return true if the smart asset id is not available but is reserved', async () => {
      const id = 123;

      const isSmartAssetIdAvailableSpy = jest
        .spyOn(creator.utils, 'isSmartAssetIdAvailable')
        .mockResolvedValue(false);

      const callWrapperSpy = jest
        .spyOn(arianeeProtocolClientModule, 'callWrapper')
        .mockResolvedValueOnce(publicKey)
        .mockResolvedValueOnce(
          '0x0000000000000000000000000000000000000000000000000000000000000000'
        );

      const canCreate = await creator.utils.canCreateSmartAsset(id);

      expect(callWrapperSpy).toHaveBeenNthCalledWith(
        1,
        creator['arianeeProtocolClient'],
        creator['slug'],
        {
          protocolV1Action: expect.any(Function),
          protocolV2Action: expect.any(Function),
        },
        undefined
      );

      expect(callWrapperSpy).toHaveBeenNthCalledWith(
        2,
        creator['arianeeProtocolClient'],
        creator['slug'],
        {
          protocolV1Action: expect.any(Function),
          protocolV2Action: expect.any(Function),
        },
        undefined
      );

      expect(isSmartAssetIdAvailableSpy).toHaveBeenCalledWith(id);
      expect(canCreate).toBeTruthy();
    });
  });

  describe('reads served by the Arianee API instead of the chain', () => {
    const owner = '0x655F362F23cA6B937a2418F882097Ea3B2b14Ef0';
    const issuer = '0x42Fbe8eB12a2d99Dd05ca1C11F74aCC1dc9beAce';
    const emptyImprint = `0x${'0'.repeat(64)}`;

    const apiRecord = (overrides = {}) =>
      ({
        tokenId: '123',
        network: 'testnet',
        owner,
        issuer,
        imprint: emptyImprint,
        createAt: '',
        updatedAt: '',
        ...overrides,
      } as any);

    it('isSmartAssetIdAvailable answers false from the API without any RPC call', async () => {
      getSmartAssetFromApiMock.mockResolvedValue(apiRecord());

      const callWrapperSpy = jest.spyOn(
        arianeeProtocolClientModule,
        'callWrapper'
      );

      await expect(creator.utils.isSmartAssetIdAvailable(123)).resolves.toBe(
        false
      );
      expect(callWrapperSpy).not.toHaveBeenCalled();
    });

    it('isSmartAssetIdAvailable still asks the chain when the API owner is the zero address', async () => {
      // The contract treats a token owned by the zero address as invalid, so the
      // two sources must not be allowed to disagree.
      getSmartAssetFromApiMock.mockResolvedValue(
        apiRecord({ owner: ZeroAddress })
      );

      const callWrapperSpy = jest
        .spyOn(arianeeProtocolClientModule, 'callWrapper')
        .mockImplementation(async (_, __, actions) => {
          await actions.protocolV1Action({
            smartAssetContract: {
              ownerOf: jest.fn().mockRejectedValue({ code: 'CALL_EXCEPTION' }),
            },
          } as any);
        });

      await expect(creator.utils.isSmartAssetIdAvailable(123)).resolves.toBe(
        true
      );
      expect(callWrapperSpy).toHaveBeenCalled();
    });

    it('getSmartAssetOwner is served by the API', async () => {
      getSmartAssetFromApiMock.mockResolvedValue(apiRecord());

      const callWrapperSpy = jest.spyOn(
        arianeeProtocolClientModule,
        'callWrapper'
      );

      await expect(creator.utils.getSmartAssetOwner('123')).resolves.toEqual(
        owner
      );
      expect(callWrapperSpy).not.toHaveBeenCalled();
    });

    it('getSmartAssetIssuer is served by the API', async () => {
      getSmartAssetFromApiMock.mockResolvedValue(apiRecord());

      const callWrapperSpy = jest.spyOn(
        arianeeProtocolClientModule,
        'callWrapper'
      );

      await expect(creator.utils.getSmartAssetIssuer('123')).resolves.toEqual(
        issuer
      );
      expect(callWrapperSpy).not.toHaveBeenCalled();
    });

    it('canCreateSmartAsset resolves a reserved token with no RPC call at all', async () => {
      // Reserved = owned by us with an empty imprint. That used to cost three
      // RPC reads (ownerOf via isSmartAssetIdAvailable, ownerOf, tokenImprint).
      getSmartAssetFromApiMock.mockResolvedValue(
        apiRecord({ owner: publicKey })
      );

      const callWrapperSpy = jest.spyOn(
        arianeeProtocolClientModule,
        'callWrapper'
      );

      await expect(creator.utils.canCreateSmartAsset(123)).resolves.toBe(true);
      expect(callWrapperSpy).not.toHaveBeenCalled();
    });
  });

  describe('calculateImprint', () => {
    it('should calculate the right imprint', async () => {
      const content: ArianeeProductCertificateI18N = {
        $schema:
          'https://cert.arianee.org/version5/ArianeeProductCertificate-i18n.json',
        medias: [
          {
            mediaType: 'picture',
            type: 'product',
            url: 'https://bdh-enduser.api.staging.arianee.com/pub/1679388075201-Cypher_an_illusration_for_a_test_certificate_085255e5-318a-4a12-90ac-4f3e77cf641c.png',
          },
        ],
        i18n: [
          {
            language: 'fr-FR',
            name: 'I18N TEST (FR)',
            description: 'Description in French',
          },
        ],
        category: 'apparel',
        language: 'en-US',
        name: 'I18N TEST (EN)',
        description: 'Description in English',
      };

      const creator = new Creator({
        core: Core.fromRandom(),
        creatorAddress: '0x' + 'a'.repeat(40),
        transactionStrategy: 'WAIT_TRANSACTION_RECEIPT',
        fetchLike: fetch,
      });
      const imprint = await creator.utils.calculateImprint(content);

      expect(imprint).toEqual(
        '0xce917f8d652187e7bf162b2c05d4b5439cef04142795eb6e5d2283b6193b8e88'
      );
    });
  });

  describe('getNativeBalance', () => {
    it('should call the protocol details getNativeBalance method with correct params and return it', async () => {
      const getNativeBalanceSpy = jest
        .fn()
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(2);

      const callWrapperSpy = jest
        .spyOn(arianeeProtocolClientModule, 'callWrapper')
        .mockImplementation(async (_, __, actions) =>
          actions.protocolV1Action({
            getNativeBalance: getNativeBalanceSpy,
          } as any)
        );

      const balance1 = await creator.utils.getNativeBalance();
      const balance2 = await creator.utils.getNativeBalance('0x123');

      expect(getNativeBalanceSpy).toHaveBeenNthCalledWith(1, core.getAddress());
      expect(getNativeBalanceSpy).toHaveBeenNthCalledWith(2, '0x123');

      expect(callWrapperSpy).toHaveBeenCalledWith(
        creator['arianeeProtocolClient'],
        creator['slug'],
        {
          protocolV1Action: expect.any(Function),
          protocolV2Action: expect.any(Function),
        },
        undefined
      );

      expect(balance1).toEqual(1);
      expect(balance2).toEqual(2);
    });
  });

  describe('getAriaBalance', () => {
    it('should call the ariaContract balanceOf method with correct params and return it', async () => {
      const balanceOfSpy = jest
        .fn()
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(2);

      const callWrapperSpy = jest
        .spyOn(arianeeProtocolClientModule, 'callWrapper')
        .mockImplementation(async (_, __, actions) =>
          actions.protocolV1Action({
            ariaContract: {
              balanceOf: balanceOfSpy,
            },
          } as any)
        );

      const balance1 = await creator.utils.getAriaBalance();
      const balance2 = await creator.utils.getAriaBalance('0x123');

      expect(balanceOfSpy).toHaveBeenNthCalledWith(1, core.getAddress());
      expect(balanceOfSpy).toHaveBeenNthCalledWith(2, '0x123');

      expect(callWrapperSpy).toHaveBeenCalledWith(
        creator['arianeeProtocolClient'],
        creator['slug'],
        {
          protocolV1Action: expect.any(Function),
          protocolV2Action: expect.any(Function),
        },
        undefined
      );

      expect(balance1).toEqual(1);
      expect(balance2).toEqual(2);
    });
  });

  describe('getCreditBalance', () => {
    it('should call the creditHistoryContract balanceOf method with correct params and return it', async () => {
      const balanceOfSpy = jest
        .fn()
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(2);

      const callWrapperSpy = jest
        .spyOn(arianeeProtocolClientModule, 'callWrapper')
        .mockImplementation(async (_, __, actions) =>
          actions.protocolV1Action({
            creditHistoryContract: {
              balanceOf: balanceOfSpy,
            },
          } as any)
        );

      const balance1 = await creator.utils.getCreditBalance(
        CreditType.smartAsset,
        undefined,
        undefined
      );
      const balance2 = await creator.utils.getCreditBalance(
        CreditType.event,
        '0x123',
        undefined
      );

      expect(balanceOfSpy).toHaveBeenNthCalledWith(
        1,
        core.getAddress(),
        CreditType.smartAsset
      );
      expect(balanceOfSpy).toHaveBeenNthCalledWith(
        2,
        '0x123',
        CreditType.event
      );

      expect(callWrapperSpy).toHaveBeenCalledWith(
        creator['arianeeProtocolClient'],
        creator['slug'],
        {
          protocolV1Action: expect.any(Function),
          protocolV2Action: expect.any(Function),
        },
        undefined
      );

      expect(balance1).toEqual(1);
      expect(balance2).toEqual(2);
    });
    it('should call the creditHistoryContract balanceOf method with correct params and return it (V2)', async () => {
      const balanceOfSpy = jest
        .fn()
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(2);

      const callWrapperSpy = jest
        .spyOn(arianeeProtocolClientModule, 'callWrapper')
        .mockImplementation(async (_, __, actions) =>
          actions.protocolV2Action({
            creditManagerContract: {
              balanceOf: balanceOfSpy,
            },
          } as any)
        );

      const balance1 = await creator.utils.getCreditBalance(
        CreditType.smartAsset,
        undefined,
        '0xevent'
      );
      const balance2 = await creator.utils.getCreditBalance(
        CreditType.event,
        '0x123',
        '0xevent'
      );

      expect(balanceOfSpy).toHaveBeenNthCalledWith(
        1,
        core.getAddress(),
        '0xevent'
      );
      expect(balanceOfSpy).toHaveBeenNthCalledWith(2, '0x123', '0xevent');

      expect(callWrapperSpy).toHaveBeenCalledWith(
        creator['arianeeProtocolClient'],
        creator['slug'],
        {
          protocolV1Action: expect.any(Function),
          protocolV2Action: expect.any(Function),
        },
        undefined
      );

      expect(balance1).toEqual(1);
      expect(balance2).toEqual(2);
    });
  });

  describe('requestTestnetAria20', () => {
    it('should throw if the protocol is not testnet', async () => {
      Object.defineProperty(creator, 'slug', {
        get: () => 'mainnet',
      });

      await expect(creator.utils.requestTestnetAria20()).rejects.toThrow(
        'This method is only available for the protocol with slug testnet'
      );
    });

    it('should call the faucet with correct params and return true if successful', async () => {
      const mockedFetch = jest.fn(() => Promise.resolve({ ok: true }));

      const creator = new Creator({
        core: Core.fromRandom(),
        creatorAddress: '0x' + 'a'.repeat(40),
        fetchLike: mockedFetch as unknown as typeof fetch,
        transactionStrategy: 'WAIT_TRANSACTION_RECEIPT',
      });

      Object.defineProperty(creator, 'slug', {
        get: () => 'testnet',
      });

      const success = await creator.utils.requestTestnetAria20();

      expect(success).toBeTruthy();
    });
  });

  describe('isMessageIdAvailable', () => {
    it('should return true if the sender is the 0 address', async () => {
      const messagesSpy = jest.fn().mockResolvedValue({
        sender: '0x0000000000000000000000000000000000000000',
      });

      const callWrapperSpy = jest
        .spyOn(arianeeProtocolClientModule, 'callWrapper')
        .mockImplementation(async (_, __, actions) =>
          actions.protocolV1Action({
            messageContract: {
              messages: messagesSpy,
            },
          } as any)
        );

      const available = await creator.utils.isMessageIdAvailable(123);

      expect(messagesSpy).toHaveBeenCalledWith(123);

      expect(callWrapperSpy).toHaveBeenCalledWith(
        creator['arianeeProtocolClient'],
        creator['slug'],
        {
          protocolV1Action: expect.any(Function),
          protocolV2Action: expect.any(Function),
        },
        undefined
      );

      expect(available).toBeTruthy();
    });
  });
  describe('isEventIdAvailable', () => {
    it('should return true if the token associated to the event id is 0', async () => {
      const eventIdToTokenSpy = jest.fn().mockResolvedValue(BigInt(0));

      const callWrapperSpy = jest
        .spyOn(arianeeProtocolClientModule, 'callWrapper')
        .mockImplementation(async (_, __, actions) =>
          actions.protocolV1Action({
            eventContract: {
              eventIdToToken: eventIdToTokenSpy,
            },
          } as any)
        );

      const available = await creator.utils.isEventIdAvailable(123);

      expect(eventIdToTokenSpy).toHaveBeenCalledWith(123);

      expect(callWrapperSpy).toHaveBeenCalledWith(
        creator['arianeeProtocolClient'],
        creator['slug'],
        {
          protocolV1Action: expect.any(Function),
          protocolV2Action: expect.any(Function),
        },
        undefined
      );

      expect(available).toBeTruthy();
    });
    it('should return true if the token associated to the event id is 0 (V2)', async () => {
      const eventIdToEventsIndexSpy = jest.fn().mockResolvedValue(BigInt(0));

      const callWrapperSpy = jest
        .spyOn(arianeeProtocolClientModule, 'callWrapper')
        .mockImplementation(async (_, __, actions) =>
          actions.protocolV2Action({
            eventHubContract: {
              eventIdToEventsIndex: eventIdToEventsIndexSpy,
            },
            protocolDetails: {
              contractAdresses: {
                nft: '0x123',
              },
            },
          } as any)
        );

      const available = await creator.utils.isEventIdAvailable(123);

      expect(eventIdToEventsIndexSpy).toHaveBeenCalledWith('0x123', 123);

      expect(callWrapperSpy).toHaveBeenCalledWith(
        creator['arianeeProtocolClient'],
        creator['slug'],
        {
          protocolV1Action: expect.any(Function),
          protocolV2Action: expect.any(Function),
        },
        undefined
      );

      expect(available).toBeTruthy();
    });
  });

  describe('getAvailableEventId', () => {
    it('should call getAvailableId and return the number', async () => {
      const getAvailableIdSpy = jest
        .spyOn(creator.utils, 'getAvailableId')
        .mockResolvedValue(123);

      const id = await creator.utils.getAvailableEventId();

      expect(getAvailableIdSpy).toHaveBeenCalledWith('event');

      expect(id).toEqual(123);
    });
  });
});
