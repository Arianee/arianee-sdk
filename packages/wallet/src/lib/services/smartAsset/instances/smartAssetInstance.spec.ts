import { SmartAsset } from '@arianee/common-types';

import SmartAssetService from '../smartAsset';
import SmartAssetInstance from './smartAssetInstance';
jest.mock('../smartAsset');

describe('SmartAssetInstance', () => {
  const smartAssetService = new SmartAssetService({} as any);
  beforeEach(() => {
    jest.clearAllMocks();
    (smartAssetService.isOwnerOf as jest.Mock).mockReturnValue(false);
  });

  describe('claim', () => {
    it('should throw if called by the owner', async () => {
      const mockSmartAsset: Partial<SmartAsset> = {
        owner: '0x123',
      };

      (smartAssetService.isOwnerOf as jest.Mock).mockReturnValue(true);

      const instance = new SmartAssetInstance(smartAssetService, {
        data: mockSmartAsset as any,
        arianeeEvents: [],
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

        (smartAssetService.isOwnerOf as jest.Mock).mockReturnValue(
          expectedIsOwner
        );

        const instance = new SmartAssetInstance(smartAssetService, {
          data: mockSmartAsset as any,
          arianeeEvents: [],
        });

        expect(instance.isOwner).toBe(expectedIsOwner);
      }
    );
  });

  describe('transfer', () => {
    it('should throw if called by non owner', async () => {
      const mockSmartAsset: Partial<SmartAsset> = {
        owner: '0x123',
      };

      const instance = new SmartAssetInstance(smartAssetService, {
        data: mockSmartAsset as any,
        arianeeEvents: [],
      });

      await expect(instance.transfer('0x0000')).rejects.toThrow(
        /User needs to be owner/gi
      );
    });
  });
});
