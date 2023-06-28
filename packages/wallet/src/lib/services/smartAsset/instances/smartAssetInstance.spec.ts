import { SmartAsset } from '@arianee/common-types';
import SmartAssetService from '../smartAsset';
import SmartAssetInstance from './smartAssetInstance';
jest.mock('../smartAsset');

describe('SmartAssetInstance', () => {
  const smartAssetService = new SmartAssetService({} as any);

  describe('claim', () => {
    it('should throw if called by the owner', async () => {
      const mockSmartAsset: Partial<SmartAsset> = {
        owner: '0x123',
      };

      const instance = new SmartAssetInstance(smartAssetService, {
        data: mockSmartAsset as any,
        arianeeEvents: [],
        userAddress: '0x123',
      });

      await expect(instance.claim()).rejects.toThrow(/already owner/gi);
    });

    it('should throw if passphrase not provided in constructor', async () => {
      const mockSmartAsset: Partial<SmartAsset> = {
        owner: '0x123',
      };

      const instance = new SmartAssetInstance(smartAssetService, {
        data: mockSmartAsset as any,
        arianeeEvents: [],
        userAddress: '0x456',
      });

      await expect(instance.claim()).rejects.toThrow(
        /passphrase is undefined/gi
      );
    });
  });

  describe('createProofLink', () => {
    it('should throw if called by non owner', async () => {
      const mockSmartAsset: Partial<SmartAsset> = {
        owner: '0x123',
      };

      const instance = new SmartAssetInstance(smartAssetService, {
        data: mockSmartAsset as any,
        arianeeEvents: [],
        userAddress: '0x456',
      });

      await expect(instance.createProofLink()).rejects.toThrow(
        /User needs to be owner/gi
      );
    });
  });

  describe('createRequestLink', () => {
    it('should throw if called by non owner', async () => {
      const mockSmartAsset: Partial<SmartAsset> = {
        owner: '0x123',
      };

      const instance = new SmartAssetInstance(smartAssetService, {
        data: mockSmartAsset as any,
        arianeeEvents: [],
        userAddress: '0x456',
      });

      await expect(instance.createRequestLink()).rejects.toThrow(
        /User needs to be owner/gi
      );
    });
  });

  describe('isOwner', () => {
    it.each([
      {
        userAddress: '0x123',
        expectedIsOwner: true,
      },
      { userAddress: '0x456', expectedIsOwner: false },
    ])(
      'should return a boolean that says if the user is owner or not of the smart asset',
      async ({ userAddress, expectedIsOwner }) => {
        const mockSmartAsset: Partial<SmartAsset> = {
          owner: '0x123',
        };

        const instance = new SmartAssetInstance(smartAssetService, {
          data: mockSmartAsset as any,
          arianeeEvents: [],
          userAddress,
        });

        expect(instance.isOwner).toBe(expectedIsOwner);
      }
    );
  });
});
