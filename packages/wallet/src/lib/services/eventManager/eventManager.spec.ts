/* eslint-disable @typescript-eslint/no-explicit-any */
import EventManager from './eventManager';
import Core from '@arianee/core';
import WalletApiClient from '@arianee/wallet-api-client';

jest.mock('@arianee/wallet-api-client');
jest.mock('@arianee/core');

const setIntervalSpy = jest
  .spyOn(global, 'setInterval' as any)
  .mockImplementation();

describe('EventManager', () => {
  let eventManager: EventManager<'testnet'>;
  const walletApiClient = new WalletApiClient('testnet', Core.fromRandom());

  beforeEach(() => {
    jest.clearAllMocks();
    eventManager = new EventManager('testnet', walletApiClient);
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

        new EventManager('testnet', walletApiClient, {
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
    let atLeastOneListenerSpy: jest.SpyInstance;
    let pullSmartAssetEventsSpy: jest.SpyInstance;
    let pullArianeeEventsSpy: jest.SpyInstance;
    let emitSmartAssetEventsSpy: jest.SpyInstance;
    let emitArianeeEventsSpy: jest.SpyInstance;
    let updatePullAfterSpy: jest.SpyInstance;

    beforeEach(() => {
      atLeastOneListenerSpy = jest.spyOn(
        eventManager as any,
        'atLeastOneListener'
      );

      pullSmartAssetEventsSpy = jest
        .spyOn(eventManager as any, 'pullSmartAssetEvents')
        .mockImplementation();

      pullArianeeEventsSpy = jest
        .spyOn(eventManager as any, 'pullArianeeEvents')
        .mockImplementation();

      emitSmartAssetEventsSpy = jest
        .spyOn(eventManager as any, 'emitSmartAssetEvents')
        .mockImplementation();

      emitArianeeEventsSpy = jest
        .spyOn(eventManager as any, 'emitArianeeEvents')
        .mockImplementation();

      updatePullAfterSpy = jest
        .spyOn(eventManager as any, 'updatePullAfter')
        .mockImplementation();
    });

    it('should not pull events if there is no listeners', async () => {
      atLeastOneListenerSpy.mockReturnValue(false);

      await eventManager['pull']();

      expect(atLeastOneListenerSpy).toHaveBeenCalled();
      expect(pullSmartAssetEventsSpy).not.toHaveBeenCalled();
      expect(pullArianeeEventsSpy).not.toHaveBeenCalled();
    });

    it('should pull events and dispatch them if there is more than noe listener and update the pullAfter date', async () => {
      atLeastOneListenerSpy.mockReturnValue(true);

      const events = ['mock'];

      pullSmartAssetEventsSpy.mockResolvedValue(events);
      pullArianeeEventsSpy.mockResolvedValue(events);

      await eventManager['pull']();

      expect(atLeastOneListenerSpy).toHaveBeenCalled();
      expect(pullSmartAssetEventsSpy).toHaveBeenCalled();
      expect(pullArianeeEventsSpy).toHaveBeenCalled();
      expect(emitArianeeEventsSpy).toHaveBeenCalledWith(events);
      expect(emitSmartAssetEventsSpy).toHaveBeenCalledWith(events);

      expect(updatePullAfterSpy).toHaveBeenCalled();
    });
  });
});
