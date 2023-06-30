import { defaultFetchLike } from '@arianee/utils';
import Creator from './creator';
import Core from '@arianee/core';
import ArianeeProtocolClient, {
  ProtocolClientV1,
} from '@arianee/arianee-protocol-client';

jest.mock('@arianee/core');
jest.mock('@arianee/arianee-protocol-client');
jest.spyOn(console, 'error').mockImplementation();

describe('Creator', () => {
  const core = Core.fromRandom();
  const creatorAddress = `0x${'a'.repeat(40)}`;

  describe('constructor', () => {
    it('should use default fetch like if not passed', () => {
      const creator = new Creator({
        core,
        creatorAddress,
      });

      expect(creator['fetchLike']).toBe(defaultFetchLike);
    });

    it('should use passed fetch like', () => {
      const fetchLike = jest.fn();
      const creator = new Creator({
        core,
        creatorAddress,
        fetchLike,
      });

      expect(creator['fetchLike']).toBe(fetchLike);
    });
  });

  describe('connect', () => {
    it('should throw if connection failed', async () => {
      jest
        .spyOn(ArianeeProtocolClient.prototype, 'connect')
        .mockRejectedValueOnce('error');

      const creator = new Creator({
        core,
        creatorAddress,
      });

      await expect(creator.connect('slug')).rejects.toThrow(
        /Unable to connect to protocol slug, see error above for more details/gi
      );
    });

    it('should return true if connection was successful', async () => {
      jest.spyOn(ArianeeProtocolClient.prototype, 'connect').mockResolvedValue({
        v1: {} as unknown as ProtocolClientV1,
      });

      const creator = new Creator({
        core,
        creatorAddress,
      });

      const connected = await creator.connect('slug');

      expect(connected).toBe(true);
      expect(creator.connected).toBe(true);
    });
  });
});
