import { Event } from '@arianee/common-types';
import SmartAssetService from '../smartAsset';
import ArianeeEventInstance from './arianeeEventInstance';
jest.mock('../smartAsset');

describe('ArianeeEventInstance', () => {
  const smartAssetService = new SmartAssetService({} as any);

  describe('acceptEvent', () => {
    it('should throw if not called by the owner', async () => {
      const mockEvent: Partial<Event> = {};

      const instance = new ArianeeEventInstance(
        smartAssetService,
        false,
        mockEvent as any
      );

      await expect(instance.acceptEvent()).rejects.toThrow(
        /User needs to be owner/gi
      );
    });
  });

  describe('refuseEvent', () => {
    it('should throw if not called by the owner', async () => {
      const mockEvent: Partial<Event> = {};

      const instance = new ArianeeEventInstance(
        smartAssetService,
        false,
        mockEvent as any
      );

      await expect(instance.refuseEvent()).rejects.toThrow(
        /User needs to be owner/gi
      );
    });
  });
});
