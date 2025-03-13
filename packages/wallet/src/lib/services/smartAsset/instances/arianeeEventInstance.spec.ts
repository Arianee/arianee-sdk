import { Event } from '@arianee/common-types';
import Core from '@arianee/core';
import { getIssuerSigTemplate__Event } from '@arianee/utils';

import { instanceFactory } from '../../../utils/instanceFactory/instanceFactory';
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

  describe('instanceFactory', () => {
    it('should override eventInstance.sender if a signature is present', async () => {
      const mockProtocolDetails: any = {
        chainId: 666,
        contractAdresses: {
          smartAsset:
            '0x0000000000000000000000000000000000000000000000000000000000000001',
        },
      };

      const core = Core.fromRandom();
      const { signature: issuerSig } = await core.signMessage(
        getIssuerSigTemplate__Event(mockProtocolDetails, 456)
      );

      const mockEvent: Partial<Event> = {
        certificateId: '123',
        id: '456',
        sender: 'mockSender',
        imprint: 'mockImprint',
        rawContent: {
          $schema: 'mockSchema',
          issuerSignature: issuerSig,
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

      const eventInstance = await instanceFactory(
        ArianeeEventInstance,
        [smartAssetService, false, mockEvent as any],
        {} as any,
        mockProtocolClient as any
      );

      expect(eventInstance.rawContent.issuerSignature).toBe(issuerSig);
      expect(eventInstance.sender).toBe(core.getAddress());
    });
  });
});
