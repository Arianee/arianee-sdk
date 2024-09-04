import { SmartAsset } from '@arianee/common-types';
import Core from '@arianee/core';
import { getIssuerSigTemplate__SmartAsset } from '@arianee/utils';

import { instanceFactory } from '../../../utils/instanceFactory/instanceFactory';
import SmartAssetService from '../smartAsset';
import SmartAssetInstance from './smartAssetInstance';

jest.mock('../smartAsset');

jest.mock('@arianee/utils', () => {
  const originalModule = jest.requireActual('@arianee/utils');
  return {
    ...originalModule,
    calculateImprint: jest.fn().mockResolvedValue('mockImprint'),
  };
});

jest.mock('@arianee/arianee-protocol-client', () => {
  const originalModule = jest.requireActual('@arianee/arianee-protocol-client');
  return {
    ...originalModule,
    ArianeeProtocolClient: jest.fn().mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue({
        protocolDetails: {
          protocol: {
            name: 'mockProtocolName',
          },
        },
      }),
    })),
  };
});

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

  describe('createTransferPermit', () => {
    it('should throw if called by non owner', async () => {
      const mockSmartAsset: Partial<SmartAsset> = {
        owner: '0x123',
      };

      const instance = new SmartAssetInstance(smartAssetService, {
        data: mockSmartAsset as any,
        arianeeEvents: [],
      });

      await expect(instance.createTransferPermit('0x0000')).rejects.toThrow(
        /User needs to be owner/gi
      );
    });
  });

  describe('instanceFactory', () => {
    it('should override smartAssetInstance.data.issuer if a signature is present', async () => {
      const mockProtocolDetails: any = {
        chainId: 666,
        contractAdresses: {
          smartAsset:
            '0x0000000000000000000000000000000000000000000000000000000000000001',
        },
      };

      const core = Core.fromRandom();
      const { signature: issuerSig } = await core.signMessage(
        getIssuerSigTemplate__SmartAsset(mockProtocolDetails, 123)
      );

      const mockSmartAsset: Partial<SmartAsset> = {
        certificateId: '123',
        issuer: 'mockIssuer',
        imprint: 'mockImprint',
        rawContent: {
          $schema: 'mockSchema',
          issuer_signature: issuerSig,
        },
        protocol: {
          chainId: 666,
          name: 'mockProtocolName',
        },
      };

      const mockProtocolClient = {
        connect: jest.fn().mockResolvedValue({
          protocolDetails: mockProtocolDetails,
        }),
      };

      const smartAssetInstance = await instanceFactory(
        SmartAssetInstance,
        [smartAssetService, { data: mockSmartAsset as any, arianeeEvents: [] }],
        {} as any,
        mockProtocolClient as any
      );

      expect(smartAssetInstance.data.rawContent.issuer_signature).toBe(
        issuerSig
      );
      expect(smartAssetInstance.data.issuer).toBe(core.getAddress());
    });
  });
});
