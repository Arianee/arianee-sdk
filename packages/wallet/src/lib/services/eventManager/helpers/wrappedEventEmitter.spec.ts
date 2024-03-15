import { EventEmitter } from 'eventemitter3';

import { WrappedEventEmitter } from './wrappedEventEmitter';

jest.mock('eventemitter3');

describe('WrappedEventEmitter', () => {
  const eventEmitter = new EventEmitter();
  const eventName = 'smartAssetReceived';
  let wrappedEventEmitter: WrappedEventEmitter<typeof eventName>;

  beforeEach(() => {
    wrappedEventEmitter = new WrappedEventEmitter(eventEmitter, eventName);
  });

  describe('addListener', () => {
    it('should call the eventEmitter addListener method with the eventName and the function', async () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const mockFn = () => {};

      wrappedEventEmitter.addListener(mockFn);

      expect(eventEmitter.addListener).toHaveBeenCalledWith(eventName, mockFn);
    });
  });

  describe('removeListener', () => {
    it('should call the eventEmitter removeListener method with the eventName and the function', async () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const mockFn = () => {};

      wrappedEventEmitter.removeListener(mockFn);

      expect(eventEmitter.removeListener).toHaveBeenCalledWith(
        eventName,
        mockFn
      );
    });
  });

  describe('removeListener', () => {
    it('should call the eventEmitter removeAllListeners method with the eventName ', async () => {
      wrappedEventEmitter.removeAllListeners();

      expect(eventEmitter.removeAllListeners).toHaveBeenCalledWith(eventName);
    });
  });
});
