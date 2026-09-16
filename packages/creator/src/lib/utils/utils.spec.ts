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

  // Shape of a record as the Arianee API serves it.
  const owner = '0x655F362F23cA6B937a2418F882097Ea3B2b14Ef0';
  const issuer = '0x42Fbe8eB12a2d99Dd05ca1C11F74aCC1dc9beAce';
  const emptyImprint = `0x${'0'.repeat(64)}`;
  const apiRecord = (overrides: Record<string, unknown> = {}) =>
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
    it('returns false when the API knows the token, and makes no RPC call', async () => {
      getSmartAssetFromApiMock.mockResolvedValue(apiRecord());

      const callWrapperSpy = jest.spyOn(
        arianeeProtocolClientModule,
        'callWrapper'
      );

      await expect(creator.utils.isSmartAssetIdAvailable(123)).resolves.toBe(
        false
      );
      expect(getSmartAssetFromApiMock).toHaveBeenCalledWith(creator, 123);
      expect(callWrapperSpy).not.toHaveBeenCalled();
    });

    it('returns true when the API does not know the token, and makes no RPC call', async () => {
      getSmartAssetFromApiMock.mockResolvedValue(null);

      const callWrapperSpy = jest.spyOn(
        arianeeProtocolClientModule,
        'callWrapper'
      );

      await expect(creator.utils.isSmartAssetIdAvailable(123)).resolves.toBe(
        true
      );
      expect(callWrapperSpy).not.toHaveBeenCalled();
    });

    it('returns true when the API record is owned by the zero address', async () => {
      // The contract treats those tokens as invalid, so the id is not taken.
      getSmartAssetFromApiMock.mockResolvedValue(
        apiRecord({ owner: ZeroAddress })
      );

      await expect(creator.utils.isSmartAssetIdAvailable(123)).resolves.toBe(
        true
      );
    });

    it('propagates an API failure rather than reporting the id as free', async () => {
      // "The API answered 404" licenses "free". "The API did not answer" does
      // not, and treating it as free would hand out ids for a whole outage.
      getSmartAssetFromApiMock.mockRejectedValue(new Error('api unreachable'));

      await expect(creator.utils.isSmartAssetIdAvailable(123)).rejects.toThrow(
        /api unreachable/
      );
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

    it('resolves a reserved token from the API alone, with no RPC call', async () => {
      // Reserved = owned by us with an empty imprint. That used to cost three
      // RPC reads: ownerOf via isSmartAssetIdAvailable, then ownerOf and
      // tokenImprint again.
      const id = 123;

      jest
        .spyOn(creator.utils, 'isSmartAssetIdAvailable')
        .mockResolvedValue(false);

      getSmartAssetFromApiMock.mockResolvedValue(
        apiRecord({ owner: publicKey, imprint: emptyImprint })
      );

      const callWrapperSpy = jest.spyOn(
        arianeeProtocolClientModule,
        'callWrapper'
      );

      await expect(creator.utils.canCreateSmartAsset(id)).resolves.toBe(true);
      expect(callWrapperSpy).not.toHaveBeenCalled();
    });

    it('return false if the token is owned by someone else', async () => {
      jest
        .spyOn(creator.utils, 'isSmartAssetIdAvailable')
        .mockResolvedValue(false);

      getSmartAssetFromApiMock.mockResolvedValue(
        apiRecord({ owner: `0x${'b'.repeat(40)}`, imprint: emptyImprint })
      );

      await expect(creator.utils.canCreateSmartAsset(123)).resolves.toBe(false);
    });
  });

  describe('getSmartAssetOwner', () => {
    it('is served by the API, with no RPC call', async () => {
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

    it('throws when the API carries no owner', async () => {
      getSmartAssetFromApiMock.mockResolvedValue(null);

      await expect(creator.utils.getSmartAssetOwner('123')).rejects.toThrow(
        /has no owner for smart asset 123/
      );
    });
  });

  describe('getSmartAssetIssuer', () => {
    it('is served by the API, with no RPC call', async () => {
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

    it('falls back to the zero address when the API carries no issuer, the reserved nft case', async () => {
      getSmartAssetFromApiMock.mockResolvedValue(null);

      await expect(creator.utils.getSmartAssetIssuer('123')).resolves.toEqual(
        ZeroAddress
      );
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
