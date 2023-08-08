import * as arianeeProtocolClientModule from '@arianee/arianee-protocol-client';
import { ArianeeProductCertificateI18N } from '@arianee/common-types';
import Core from '@arianee/core';

import Creator from '../creator';

jest.mock('@arianee/arianee-protocol-client');
jest.spyOn(console, 'error').mockImplementation();

describe('Creator', () => {
  const core = Core.fromPrivateKey(
    '0x6930cbe9e9c1d1c2e864b2b0e22bca033933369b0bfdbe236b1a29bc712bc137'
  );
  const publicKey = '0x655F362F23cA6B937a2418F882097Ea3B2b14Ef0';
  const creatorAddress = `0x${'a'.repeat(40)}`;
  let creator: Creator;

  beforeEach(() => {
    creator = new Creator({
      core,
      creatorAddress,
    });

    jest.clearAllMocks();
  });

  describe('getAvailableSmartAssetId', () => {
    it('should call the v1 contract with correct params and return the id', async () => {
      jest
        .spyOn(creator.utils, 'requiresCreatorToBeConnected')
        .mockImplementation();

      const ownerOfSpy = jest.fn().mockRejectedValue(new Error('owned by 0x0'));

      const callWrapperSpy = jest

        .spyOn(arianeeProtocolClientModule, 'callWrapper')
        .mockImplementation(async (_, __, actions) => {
          await actions.protocolV1Action({
            smartAssetContract: {
              ownerOf: ownerOfSpy,
            },
          } as any);
        });

      const id = await creator.utils.getAvailableSmartAssetId();

      expect(ownerOfSpy).toHaveBeenCalledWith(expect.any(Number));

      expect(callWrapperSpy).toHaveBeenCalledWith(
        creator['arianeeProtocolClient'],
        creator['slug'],
        {
          protocolV1Action: expect.any(Function),
        },
        undefined
      );

      expect(id).toEqual(expect.any(Number));
    });
  });

  describe('isSmartAssetAvailable', () => {
    it('should call the v1 contract with correct params and return true if available', async () => {
      jest
        .spyOn(creator.utils, 'requiresCreatorToBeConnected')
        .mockImplementation();

      const ownerOfSpy = jest.fn().mockRejectedValue(new Error('owned by 0x0'));

      const callWrapperSpy = jest
        .spyOn(arianeeProtocolClientModule, 'callWrapper')
        .mockImplementation(async (_, __, actions) => {
          await actions.protocolV1Action({
            smartAssetContract: {
              ownerOf: ownerOfSpy,
            },
          } as any);
        });

      const available = await creator.utils.isSmartAssetIdAvailable(123);

      expect(ownerOfSpy).toHaveBeenCalledWith(expect.any(Number));

      expect(callWrapperSpy).toHaveBeenCalledWith(
        creator['arianeeProtocolClient'],
        creator['slug'],
        {
          protocolV1Action: expect.any(Function),
        },
        undefined
      );

      expect(available).toBeTruthy();
    });
  });

  describe('canCreateSmartAsset', () => {
    it('return true if the smart asset id is available', async () => {
      const id = 123;

      jest
        .spyOn(creator.utils, 'requiresCreatorToBeConnected')
        .mockImplementation();

      const isSmartAssetIdAvailableSpy = jest
        .spyOn(creator.utils, 'isSmartAssetIdAvailable')
        .mockResolvedValue(true);

      const canCreate = await creator.utils.canCreateSmartAsset(id);

      expect(isSmartAssetIdAvailableSpy).toHaveBeenCalledWith(id);
      expect(canCreate).toBeTruthy();
    });

    it('return true if the smart asset id is not available but is reserved', async () => {
      const id = 123;

      jest
        .spyOn(creator.utils, 'requiresCreatorToBeConnected')
        .mockImplementation();

      const isSmartAssetIdAvailableSpy = jest
        .spyOn(creator.utils, 'isSmartAssetIdAvailable')
        .mockResolvedValue(false);

      const callWrapperSpy = jest
        .spyOn(arianeeProtocolClientModule, 'callWrapper')
        .mockResolvedValueOnce(publicKey)
        .mockResolvedValueOnce(
          '0x0000000000000000000000000000000000000000000000000000000000000000'
        );

      const canCreate = await creator.utils.canCreateSmartAsset(id);

      expect(callWrapperSpy).toHaveBeenNthCalledWith(
        1,
        creator['arianeeProtocolClient'],
        creator['slug'],
        {
          protocolV1Action: expect.any(Function),
        },
        undefined
      );

      expect(callWrapperSpy).toHaveBeenNthCalledWith(
        2,
        creator['arianeeProtocolClient'],
        creator['slug'],
        {
          protocolV1Action: expect.any(Function),
        },
        undefined
      );

      expect(isSmartAssetIdAvailableSpy).toHaveBeenCalledWith(id);
      expect(canCreate).toBeTruthy();
    });
  });

  describe('calculateImprint', () => {
    it('should calculate the right imprint', async () => {
      const content: ArianeeProductCertificateI18N = {
        $schema:
          'https://cert.arianee.org/version5/ArianeeProductCertificate-i18n.json',
        medias: [
          {
            mediaType: 'picture',
            type: 'product',
            url: 'https://bdh-enduser.api.staging.arianee.com/pub/1679388075201-Cypher_an_illusration_for_a_test_certificate_085255e5-318a-4a12-90ac-4f3e77cf641c.png',
          },
        ],
        i18n: [
          {
            language: 'fr-FR',
            name: 'I18N TEST (FR)',
            description: 'Description in French',
          },
        ],
        category: 'apparel',
        language: 'en-US',
        name: 'I18N TEST (EN)',
        description: 'Description in English',
      };
      const imprint = await creator.utils.calculateImprint(content);

      expect(imprint).toEqual(
        '0xce917f8d652187e7bf162b2c05d4b5439cef04142795eb6e5d2283b6193b8e88'
      );
    });
  });
});
