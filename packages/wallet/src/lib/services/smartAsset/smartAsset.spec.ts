import { Core } from '@arianee/core';
import SmartAssetService from './smartAsset';
import WalletApiClient from '@arianee/wallet-api-client';
import EventManager from '../eventManager/eventManager';
import { ArianeeAccessToken } from '@arianee/arianee-access-token';
import ArianeeProtocolClient from '@arianee/arianee-protocol-client';
import * as txWrapperModule from '../../utils/transactions/transactionWrapper';
import SmartAssetInstance from './instances/smartAssetInstance';

jest.mock('@arianee/wallet-api-client');
jest.mock('@arianee/arianee-access-token');
jest.mock('@arianee/arianee-protocol-client');
jest.mock('../eventManager/eventManager');
jest.mock('../../utils/transactions/transactionWrapper');

const mockSmartAssetUpdated = {} as any;
const mockSmartAssetReceived = {} as any;
const mockSmartAssetTransferred = {} as any;
const mockArianeeEventReceived = {} as any;
Object.defineProperty(EventManager.prototype, 'smartAssetUpdated', {
  get: () => mockSmartAssetUpdated,
});
Object.defineProperty(EventManager.prototype, 'smartAssetReceived', {
  get: () => mockSmartAssetReceived,
});
Object.defineProperty(EventManager.prototype, 'smartAssetTransferred', {
  get: () => mockSmartAssetTransferred,
});
Object.defineProperty(EventManager.prototype, 'arianeeEventReceived', {
  get: () => mockArianeeEventReceived,
});

const defaultI18nStrategy = {
  useLanguages: ['mo-CK'],
};

describe('SmartAssetService', () => {
  let smartAssetService: SmartAssetService<'testnet'>;
  const core = Core.fromRandom();
  const walletApiClient = new WalletApiClient('testnet', core);
  const arianeeAccessToken = new ArianeeAccessToken(core);
  const arianeeProtocolClient = new ArianeeProtocolClient(core);
  const walletRewards = {
    poa: '0x0',
    sokol: '0x1',
    polygon: '0x2',
  };
  const eventManager = new EventManager(
    'testnet',
    walletApiClient,
    '0x123456',
    jest.fn()
  );

  const getSmartAssetSpy = jest
    .spyOn(walletApiClient, 'getSmartAsset')
    .mockImplementation();

  const getSmartAssetEventsSpy = jest
    .spyOn(walletApiClient, 'getSmartAssetEvents')
    .mockResolvedValue([]);

  const getOwnedSmartAssetsSpy = jest
    .spyOn(walletApiClient, 'getOwnedSmartAssets')
    .mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();

    smartAssetService = new SmartAssetService({
      walletAbstraction: walletApiClient,
      eventManager: eventManager,
      i18nStrategy: defaultI18nStrategy,
      arianeeAccessToken: arianeeAccessToken,
      arianeeProtocolClient: arianeeProtocolClient,
      walletRewards: walletRewards,
      core: core,
    });
  });

  describe('events', () => {
    it('should expose an updated event that is a reference to eventManager.smartAssetUpdated', () => {
      expect(smartAssetService.updated).toBe(mockSmartAssetUpdated);
    });
    it('should expose a received event that is a reference to eventManager.smartAssetReceived', () => {
      expect(smartAssetService.received).toBe(mockSmartAssetReceived);
    });
    it('should expose a transferred event that is a reference to eventManager.smartAssetTransferred', () => {
      expect(smartAssetService.transferred).toBe(mockSmartAssetTransferred);
    });
    it('should expose a arianeeEventReceived event that is a reference to eventManager.arianeeEventReceived', () => {
      expect(smartAssetService.arianeeEventReceived).toBe(
        mockArianeeEventReceived
      );
    });
  });

  describe('get', () => {
    it.each([
      {
        strategyName: 'default i18nStrategy',
        i18nStrategy: undefined,
      },
      {
        strategyName: 'params i18nStrategy',
        i18nStrategy: {
          useLanguages: ['te-ST'],
        },
      },
    ])(
      'should call getSmartAsset + getSmartAssetEvents and use $strategyName',
      async ({ i18nStrategy }) => {
        const protocolName = 'mockProtocol';
        const expectedPreferedLanguages = i18nStrategy
          ? i18nStrategy.useLanguages
          : defaultI18nStrategy.useLanguages;

        const smartAsset = {
          id: '1',
          passphrase: 'mock',
        };

        await smartAssetService.get(protocolName, smartAsset, {
          i18nStrategy,
        });

        expect(getSmartAssetSpy).toHaveBeenCalledWith(
          protocolName,
          smartAsset,
          {
            preferredLanguages: expectedPreferedLanguages,
          }
        );

        expect(getSmartAssetEventsSpy).toHaveBeenCalledWith(
          protocolName,
          smartAsset,
          {
            preferredLanguages: expectedPreferedLanguages,
          }
        );
      }
    );
  });

  describe('getOwned', () => {
    it.each([
      {
        strategyName: 'default i18nStrategy',
        i18nStrategy: undefined,
      },
      {
        strategyName: 'params i18nStrategy',
        i18nStrategy: {
          useLanguages: ['te-ST'],
        },
      },
    ])(
      'should call getOwnedSmartAssets + getSmartAssetEvents and use the $strategyName',
      async ({ i18nStrategy }) => {
        const protocolName = 'mockProtocol';
        const expectedPreferedLanguages = i18nStrategy
          ? i18nStrategy.useLanguages
          : defaultI18nStrategy.useLanguages;

        getOwnedSmartAssetsSpy.mockResolvedValueOnce([
          {
            certificateId: '1',
            protocol: {
              name: protocolName,
              chainId: 1,
            },
          } as any,
          {
            certificateId: '2',
            protocol: {
              name: protocolName,
              chainId: 1,
            },
          } as any,
        ]);

        const owned = await smartAssetService.getOwned({
          i18nStrategy,
        });

        expect(getSmartAssetEventsSpy).toHaveBeenNthCalledWith(
          1,
          protocolName,
          {
            id: '1',
          },
          {
            preferredLanguages: expectedPreferedLanguages,
          }
        );

        expect(getSmartAssetEventsSpy).toHaveBeenCalledTimes(2);

        expect(getOwnedSmartAssetsSpy).toHaveBeenCalledWith({
          preferredLanguages: expectedPreferedLanguages,
        });

        expect(owned[0]).toBeInstanceOf(SmartAssetInstance);
      }
    );
  });
  describe('getFromLink', () => {
    it.each([
      {
        strategyName: 'default i18nStrategy',
        i18nStrategy: undefined,
      },
      {
        strategyName: 'params i18nStrategy',
        i18nStrategy: {
          useLanguages: ['te-ST'],
        },
      },
    ])(
      'should call walletApiClient.handleLink and call get with the correct params (using $strategyName)',
      async ({ i18nStrategy }) => {
        const mockGet = {
          data: {
            certificateId: '123',
            protocol: {
              name: 'testnet',
              chainId: 1,
            },
          },
          arianeeEvents: [],
          claim: expect.any(Function),
        };

        const expectedI18NStrategy = i18nStrategy ?? defaultI18nStrategy;

        const getSpy = jest
          .spyOn(smartAssetService, 'get')
          .mockResolvedValueOnce(mockGet as any);

        const handleLinkSpy = jest
          .spyOn(WalletApiClient.prototype, 'handleLink')
          .mockResolvedValue({
            certificateId: '123',
            passphrase: 'abc',
            network: 'testnet',
            method: 'requestOwnership',
            link: 'https://test.arian.ee/123,abc',
          });

        const getValidWalletAccessTokenSpy = jest
          .spyOn(ArianeeAccessToken.prototype, 'getValidWalletAccessToken')
          .mockResolvedValue('mockAccessToken');

        const smartAsset = await smartAssetService.getFromLink(
          'https://test.arian.ee/123,abc',
          true,
          i18nStrategy
        );

        expect(handleLinkSpy).toHaveBeenCalledWith(
          'https://test.arian.ee/123,abc',
          {
            resolveFinalNft: true,
            arianeeAccessToken: 'mockAccessToken',
          }
        );

        expect(getValidWalletAccessTokenSpy).toHaveBeenCalled();
        expect(getSpy).toHaveBeenCalledWith(
          'testnet',
          {
            id: '123',
            passphrase: 'abc',
          },
          {
            i18nStrategy: expectedI18NStrategy,
          }
        );

        expect(smartAsset).toEqual(mockGet);
      }
    );

    it('should throw if the wallet abstraction is not a WalletApiClient', async () => {
      const smartAssetService = new SmartAssetService({
        walletAbstraction: {} as any,
        eventManager: eventManager,
        i18nStrategy: defaultI18nStrategy,
        arianeeAccessToken: arianeeAccessToken,
        arianeeProtocolClient: arianeeProtocolClient,
        walletRewards: walletRewards,
        core: core,
      });

      await expect(
        smartAssetService.getFromLink('https://test.arian.ee/123,abc')
      ).rejects.toThrowError(
        'The wallet abstraction you use do not support this method'
      );
    });

    it('should throw if no smart asset can be retrieved from the link', async () => {
      jest
        .spyOn(WalletApiClient.prototype, 'handleLink')
        .mockRejectedValue(new Error('mockError'));

      await expect(
        smartAssetService.getFromLink('https://test.arian.ee/123,abc')
      ).rejects.toThrowError('Could not retrieve a smart asset from this link');
    });
  });

  describe('claim', () => {
    it('should call the v1 contract with correct params', async () => {
      const requestTokenSpy = jest.fn();

      const service = new SmartAssetService({
        walletAbstraction: walletApiClient,
        eventManager: eventManager,
        i18nStrategy: defaultI18nStrategy,
        arianeeAccessToken: arianeeAccessToken,
        arianeeProtocolClient: arianeeProtocolClient,
        walletRewards: walletRewards,
        core: Core.fromPrivateKey(
          '0xe5ca26599b7210485f8a4a4d1d1c1ba89752ca7b9be2f566665e730f952552e0'
        ),
      });

      const transactionWrapperSpy = jest
        .spyOn(txWrapperModule, 'transactionWrapper')
        .mockResolvedValue({
          mockReceipt: '0x123',
        } as any);

      await service.claim('testnet', '86208174', 'gx2mhc408880', {
        overrides: {
          nonce: 123456,
        },
      });

      const { protocolV1Action } = transactionWrapperSpy.mock.calls[0][2];

      await protocolV1Action({
        storeContract: {
          'requestToken(uint256,bytes32,bool,address,bytes,address)':
            requestTokenSpy,
        },
      } as any);

      expect(requestTokenSpy).toHaveBeenCalledWith(
        86208174,
        '0x41e5a882819f11c7dcaf097e9008f1aa68cf913351d4ce52cf9dbd747933badf',
        false,
        '0x1',
        '0xd4de91e2b2348eb67c4837e0fdc5772e40a42a427528c3a97dbc9a2f61cf05547648a8ec36647f709f00ba1376c9b454b92c017c4c85163e117db28f64c522d61c',
        '0x44BccE8aE7c47d3e0666441F946B4065A3286c23',
        {
          nonce: 123456,
        }
      );

      expect(transactionWrapperSpy).toHaveBeenCalledWith(
        arianeeProtocolClient,
        'testnet',
        {
          protocolV1Action: expect.any(Function),
        }
      );
    });
  });

  describe('acceptEvent', () => {
    it('should call transactionWrapper with correct params', async () => {
      const transactionWrapperSpy = jest
        .spyOn(txWrapperModule, 'transactionWrapper')
        .mockResolvedValue({
          mockReceipt: '0x123',
        } as any);

      const acceptEventSpy = jest.fn();

      await smartAssetService.acceptEvent('mockProtocol', '123', {
        nonce: 123456,
      });

      const { protocolV1Action } = transactionWrapperSpy.mock.calls[0][2];

      await protocolV1Action({
        storeContract: {
          acceptEvent: acceptEventSpy,
        },
      } as any);

      expect(acceptEventSpy).toHaveBeenCalledWith('123', '0x2', {
        nonce: 123456,
      });

      expect(transactionWrapperSpy).toHaveBeenCalledWith(
        arianeeProtocolClient,
        'mockProtocol',
        {
          protocolV1Action: expect.any(Function),
        }
      );
    });
  });

  describe('refuseEvent', () => {
    it('should call transactionWrapper with correct params', async () => {
      const transactionWrapperSpy = jest
        .spyOn(txWrapperModule, 'transactionWrapper')
        .mockResolvedValue({
          mockReceipt: '0x123',
        } as any);

      const refuseEventSpy = jest.fn();

      await smartAssetService.refuseEvent('mockProtocol', '123', {
        nonce: 123456,
      });

      const { protocolV1Action } = transactionWrapperSpy.mock.calls[0][2];

      await protocolV1Action({
        storeContract: {
          refuseEvent: refuseEventSpy,
        },
      } as any);

      expect(refuseEventSpy).toHaveBeenCalledWith('123', '0x2', {
        nonce: 123456,
      });

      expect(transactionWrapperSpy).toHaveBeenCalledWith(
        arianeeProtocolClient,
        'mockProtocol',
        {
          protocolV1Action: expect.any(Function),
        }
      );
    });
  });

  describe('createLink', () => {
    it.each([
      {
        linkType: 'proof',
        expectedLink: 'https://test.arianee.net/proof/123,twpmfcvwup35',
        expectedAccessType: 2,
      },
      {
        linkType: 'requestOwnership',
        expectedLink: 'https://test.arianee.net/123,twpmfcvwup35',
        expectedAccessType: 1,
      },
    ])(
      'should call transactionWrapper with correct params and return the link',
      async ({ linkType, expectedAccessType, expectedLink }) => {
        const transactionWrapperSpy = jest
          .spyOn(txWrapperModule, 'transactionWrapper')
          .mockResolvedValue({
            mockReceipt: '0x123',
          } as any);

        const addTokenAccessSpy = jest.fn();

        const link = await smartAssetService.createLink(
          linkType as 'proof' | 'requestOwnership',
          'testnet',
          '123',
          {
            passphrase: 'twpmfcvwup35',
            overrides: {
              nonce: 123456,
            },
          }
        );

        const { protocolV1Action } = transactionWrapperSpy.mock.calls[0][2];

        await protocolV1Action({
          smartAssetContract: {
            addTokenAccess: addTokenAccessSpy,
          },
        } as any);

        expect(link).toEqual(expectedLink);

        expect(addTokenAccessSpy).toHaveBeenCalledWith(
          '123',
          '0x01cAF71551aadbe6dA1b8c2Be652b3874f8A91Dc',
          true,
          expectedAccessType,
          {
            nonce: 123456,
          }
        );

        expect(transactionWrapperSpy).toHaveBeenCalledWith(
          arianeeProtocolClient,
          'testnet',
          {
            protocolV1Action: expect.any(Function),
          }
        );
      }
    );
  });
});
