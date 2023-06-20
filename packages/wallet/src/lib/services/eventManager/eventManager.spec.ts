/* eslint-disable @typescript-eslint/no-explicit-any */
import EventManager from './eventManager';
import Core from '@arianee/core';
import WalletApiClient from '@arianee/wallet-api-client';
import {
  BlockchainEvent,
  ChainType,
  UnnestedBlockchainEvent,
} from '@arianee/common-types';

jest.mock('@arianee/wallet-api-client');
jest.mock('@arianee/core');
jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

const setIntervalSpy = jest
  .spyOn(global, 'setInterval' as any)
  .mockImplementation();

let atLeastOneListenerSpy: jest.SpyInstance;

describe('EventManager', () => {
  const userAddress = '0xd2d4e53ee4b05878c1a58f2e746f824538b84ec6';
  const checksummedUserAddress = '0xd2D4e53eE4B05878C1A58F2e746F824538b84EC6';
  const chainType: ChainType = 'testnet';

  const date = new Date();

  let eventManager: EventManager<typeof chainType>;
  const mockedFetchLike = jest.fn();
  const walletApiClient = new WalletApiClient(chainType, Core.fromRandom());

  beforeEach(() => {
    jest.clearAllMocks();
    eventManager = new EventManager(
      chainType,
      walletApiClient,
      userAddress,
      mockedFetchLike
    );

    atLeastOneListenerSpy = jest.spyOn(
      eventManager as any,
      'atLeastOneListener'
    );
  });

  describe('constructor', () => {
    it.each([
      {
        caseName: 'parameterized interval',
        interval: 2000,
      },
      {
        caseName: 'default interval (5000)',
        interval: undefined,
      },
    ])(
      'should call setInterval with the pull method (interval: $caseName)',
      ({ interval }) => {
        jest.clearAllMocks();

        const expectedInterval = interval ?? 5000;

        expect(setIntervalSpy).not.toHaveBeenCalled();

        new EventManager(chainType, walletApiClient, userAddress, jest.fn(), {
          pullInterval: interval,
        });

        expect(setIntervalSpy).toHaveBeenCalledWith(
          expect.any(Function),
          expectedInterval
        );
      }
    );
  });

  describe('pull', () => {
    let fetchUserDataIfNeededSpy: jest.SpyInstance;
    let pullSmartAssetsEventsSpy: jest.SpyInstance;
    let pullArianeeEventsSpy: jest.SpyInstance;
    let pullIdentitiesEventsSpy: jest.SpyInstance;
    let pullMessagesEventsSpy: jest.SpyInstance;
    let emitSmartAssetsEventsSpy: jest.SpyInstance;
    let emitArianeeEventsSpy: jest.SpyInstance;
    let emitIdentitiesEventsSpy: jest.SpyInstance;
    let emitMessagesEventsSpy: jest.SpyInstance;
    let updatePullAfterSpy: jest.SpyInstance;

    beforeEach(() => {
      fetchUserDataIfNeededSpy = jest
        .spyOn(eventManager as any, 'fetchUserDataIfNeeded')
        .mockImplementation();

      pullSmartAssetsEventsSpy = jest
        .spyOn(eventManager as any, 'pullSmartAssetsEvents')
        .mockImplementation();

      pullArianeeEventsSpy = jest
        .spyOn(eventManager as any, 'pullArianeeEvents')
        .mockImplementation();

      pullIdentitiesEventsSpy = jest
        .spyOn(eventManager as any, 'pullIdentitiesEvents')
        .mockImplementation();

      pullMessagesEventsSpy = jest
        .spyOn(eventManager as any, 'pullMessagesEvents')
        .mockImplementation();

      emitSmartAssetsEventsSpy = jest
        .spyOn(eventManager as any, 'emitSmartAssetsEvents')
        .mockImplementation();

      emitArianeeEventsSpy = jest
        .spyOn(eventManager as any, 'emitArianeeEvents')
        .mockImplementation();

      emitMessagesEventsSpy = jest
        .spyOn(eventManager as any, 'emitMessagesEvents')
        .mockImplementation();

      emitIdentitiesEventsSpy = jest
        .spyOn(eventManager as any, 'emitIdentitiesEvents')
        .mockImplementation();

      updatePullAfterSpy = jest
        .spyOn(eventManager as any, 'updatePullAfter')
        .mockImplementation();
    });

    it('should pull events, dispatch them and update the pullAfter date', async () => {
      const events = ['mock'];

      pullSmartAssetsEventsSpy.mockResolvedValue(events);
      pullArianeeEventsSpy.mockResolvedValue(events);
      pullIdentitiesEventsSpy.mockResolvedValue(events);
      pullMessagesEventsSpy.mockResolvedValue(events);

      await eventManager['pull']();

      expect(fetchUserDataIfNeededSpy).toHaveBeenCalled();

      expect(pullSmartAssetsEventsSpy).toHaveBeenCalled();
      expect(pullArianeeEventsSpy).toHaveBeenCalled();
      expect(pullIdentitiesEventsSpy).toHaveBeenCalled();
      expect(pullMessagesEventsSpy).toHaveBeenCalled();
      expect(emitArianeeEventsSpy).toHaveBeenCalledWith(events);
      expect(emitSmartAssetsEventsSpy).toHaveBeenCalledWith(events);
      expect(emitIdentitiesEventsSpy).toHaveBeenCalledWith(events);
      expect(emitMessagesEventsSpy).toHaveBeenCalledWith(events);

      expect(updatePullAfterSpy).toHaveBeenCalled();
    });
  });

  describe('fetchUserDataIfNeeded', () => {
    it('should set userTokenIds and userIssuers if there is at least one listener for identityUpdated or arianeeEventReceived', async () => {
      atLeastOneListenerSpy.mockReturnValue(true);

      const getOwnedNftsSpy = jest
        .spyOn(eventManager['arianeeApiClient'].multichain, 'getOwnedNfts')
        .mockResolvedValue([
          {
            tokenId: '1',
            issuer: '0x9c40e9cef669a3120491e786fcfe5e80a9325c04',
          },
        ] as any);

      await eventManager['fetchUserDataIfNeeded']();

      expect(atLeastOneListenerSpy).toHaveBeenCalledWith([
        'identityUpdated',
        'arianeeEventReceived',
      ]);

      expect(getOwnedNftsSpy).toHaveBeenCalledWith(
        chainType,
        checksummedUserAddress,
        false
      );

      expect(eventManager['userTokenIds']).toEqual(['1']);
      expect(eventManager['userTokenIssuers']).toEqual([
        '0x9c40e9CEf669a3120491E786fcfe5E80a9325c04',
      ]);
    });
  });

  describe('pullSmartAssetsEvents', () => {
    it('should return an object with empty received and transferred events if there is no listener', async () => {
      atLeastOneListenerSpy.mockReturnValue(false);

      const getEventsSpy = jest
        .spyOn(eventManager['arianeeApiClient'].multichain, 'getEvents')
        .mockImplementation();

      const result = await eventManager['pullSmartAssetsEvents']();

      expect(getEventsSpy).not.toHaveBeenCalled();
      expect(result).toEqual({
        received: [],
        transferred: [],
      });
    });
    it('should call getEvents from arianeeApiClient and return an object with transferred and received events', async () => {
      atLeastOneListenerSpy.mockReturnValue(true);

      const events = ['mock'] as any;

      const getEventsSpy = jest
        .spyOn(eventManager['arianeeApiClient'].multichain, 'getEvents')
        .mockResolvedValue(events);

      const result = await eventManager['pullSmartAssetsEvents']();

      expect(getEventsSpy).toHaveBeenNthCalledWith(
        1,
        chainType,
        'ArianeeSmartAsset',
        'Transfer',
        {
          createdAfter: new Date(date.getTime() - 10 * 1000).toISOString(),
          returnValues: {
            _from: checksummedUserAddress,
          },
        }
      );
      expect(getEventsSpy).toHaveBeenNthCalledWith(
        2,
        chainType,
        'ArianeeSmartAsset',
        'Transfer',
        {
          createdAfter: new Date(date.getTime() - 10 * 1000).toISOString(),
          returnValues: {
            _to: checksummedUserAddress,
          },
        }
      );

      expect(result).toEqual({
        received: events,
        transferred: events,
      });
    });
  });

  describe('emitSmartAssetsEvents', () => {
    it('should emit smartAssetTransferred and smartAssetReceived events with correct data', async () => {
      const receivedEvent = {
        returnValues: {
          _from: '0x123',
          _to: userAddress,
          _tokenId: '1',
        },
        protocol: { chainId: 1, name: 'mock' },
      } as unknown as UnnestedBlockchainEvent;

      const transferredEvent = {
        returnValues: {
          _from: userAddress,
          _to: '0x123',
          _tokenId: '2',
        },

        protocol: { chainId: 1, name: 'mock' },
      } as unknown as UnnestedBlockchainEvent;

      const emitUniqueSpy = jest.spyOn(eventManager as any, 'emitUnique');

      await eventManager['emitSmartAssetsEvents']({
        received: [receivedEvent],
        transferred: [transferredEvent],
      });

      expect(emitUniqueSpy).toHaveBeenNthCalledWith(
        1,
        'smartAssetTransferred',
        {
          certificateId: '2',
          protocol: {
            name: 'mock',
            chainId: 1,
          },
          to: '0x123',
        },
        transferredEvent
      );

      expect(emitUniqueSpy).toHaveBeenNthCalledWith(
        2,
        'smartAssetReceived',
        {
          certificateId: '1',
          protocol: {
            name: 'mock',
            chainId: 1,
          },
          from: '0x123',
        },
        receivedEvent
      );
    });
  });

  describe('pullArianeeEvents', () => {
    it('should return an empty array if there is no listener', async () => {
      atLeastOneListenerSpy.mockReturnValue(false);

      const getEventsSpy = jest
        .spyOn(eventManager['arianeeApiClient'].multichain, 'getEvents')
        .mockImplementation();

      const result = await eventManager['pullArianeeEvents']();

      expect(getEventsSpy).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
    it('should call getEvents from arianeeApiClient and return an array of arianee events', async () => {
      atLeastOneListenerSpy.mockReturnValue(true);

      const events = ['mock'] as any;

      const getEventsSpy = jest
        .spyOn(eventManager['arianeeApiClient'].multichain, 'getEvents')
        .mockResolvedValue(events);

      eventManager['userTokenIds'] = ['1', '2'];

      const result = await eventManager['pullArianeeEvents']();

      expect(getEventsSpy).toHaveBeenCalledWith(
        chainType,
        'ArianeeEvent',
        'EventCreated',
        {
          createdAfter: new Date(date.getTime() - 10 * 1000).toISOString(),
          tokenIdsIn: JSON.stringify(['1', '2']),
        }
      );

      expect(result).toEqual(['mock'] as any);
    });
  });

  describe('emitArianeeEvents', () => {
    it('should emit arianeeEventReceived events with correct data', async () => {
      const arianeeEvent = {
        returnValues: {
          _eventId: '2',
          _tokenId: '1',
        },
        protocol: { chainId: 1, name: 'mock' },
      } as unknown as UnnestedBlockchainEvent;

      const emitUniqueSpy = jest.spyOn(eventManager as any, 'emitUnique');

      await eventManager['emitArianeeEvents']([arianeeEvent]);

      expect(emitUniqueSpy).toHaveBeenCalledWith(
        'arianeeEventReceived',
        {
          certificateId: '1',
          protocol: {
            name: 'mock',
            chainId: 1,
          },
          eventId: '2',
        },
        arianeeEvent
      );
    });
  });

  describe('pullIdentitiesEvents', () => {
    it('should return an empty array if there is no listener', async () => {
      atLeastOneListenerSpy.mockReturnValue(false);

      const getEventsSpy = jest
        .spyOn(eventManager['arianeeApiClient'].multichain, 'getEvents')
        .mockImplementation();

      const result = await eventManager['pullIdentitiesEvents']();

      expect(getEventsSpy).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
    it('should call getEvents from arianeeApiClient and return an array of identities events', async () => {
      atLeastOneListenerSpy.mockReturnValue(true);

      const events = ['mock'] as any;

      const getEventsSpy = jest
        .spyOn(eventManager['arianeeApiClient'].multichain, 'getEvents')
        .mockResolvedValue(events);

      eventManager['userTokenIssuers'] = ['0x1', '0x2'];

      const result = await eventManager['pullIdentitiesEvents']();

      expect(getEventsSpy).toHaveBeenCalledWith(
        chainType,
        'ArianeeIdentity',
        'URIUpdated',
        {
          createdAfter: new Date(date.getTime() - 10 * 1000).toISOString(),
          identitiesIn: JSON.stringify(['0x1', '0x2']),
        }
      );

      expect(result).toEqual(['mock'] as any);
    });
  });

  describe('emitIdentitiesEvents', () => {
    it('should emit identityUpdated events with correct data', async () => {
      const identityEvent = {
        returnValues: {
          _identity: '0x1',
        },
        protocol: { chainId: 1, name: 'mock' },
      } as unknown as UnnestedBlockchainEvent;

      const emitUniqueSpy = jest.spyOn(eventManager as any, 'emitUnique');

      await eventManager['emitIdentitiesEvents']([identityEvent]);

      expect(emitUniqueSpy).toHaveBeenCalledWith(
        'identityUpdated',
        {
          issuer: '0x1',
          protocol: {
            name: 'mock',
            chainId: 1,
          },
        },
        identityEvent
      );
    });
  });

  describe('pullMessagesEvents', () => {
    it('should return an empty array if there is no listener', async () => {
      atLeastOneListenerSpy.mockReturnValue(false);

      const getEventsSpy = jest
        .spyOn(eventManager['arianeeApiClient'].multichain, 'getEvents')
        .mockImplementation();

      const result = await eventManager['pullMessagesEvents']();

      expect(getEventsSpy).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
    it('should call getEvents from arianeeApiClient and return an array of messages events', async () => {
      atLeastOneListenerSpy.mockReturnValue(true);

      const events = ['mock'] as any;

      const getEventsSpy = jest
        .spyOn(eventManager['arianeeApiClient'].multichain, 'getEvents')
        .mockResolvedValue(events);

      const result = await eventManager['pullMessagesEvents']();

      expect(getEventsSpy).toHaveBeenCalledWith(
        chainType,
        'ArianeeMessage',
        'MessageSent',
        {
          createdAfter: new Date(date.getTime() - 10 * 1000).toISOString(),
          returnValues: {
            _receiver: checksummedUserAddress,
          },
        }
      );

      expect(result).toEqual(['mock'] as any);
    });
  });

  describe('emitMessagesEvents', () => {
    it('should emit messageReceived events with correct data', async () => {
      const messageEvent = {
        returnValues: {
          _messageId: '1',
        },
        protocol: { chainId: 1, name: 'mock' },
      } as unknown as UnnestedBlockchainEvent;

      const emitUniqueSpy = jest.spyOn(eventManager as any, 'emitUnique');

      await eventManager['emitMessagesEvents']([messageEvent]);

      expect(emitUniqueSpy).toHaveBeenCalledWith(
        'messageReceived',
        {
          messageId: '1',
          protocol: {
            name: 'mock',
            chainId: 1,
          },
        },
        messageEvent
      );
    });
  });
});
