import * as arianeeProtocolClientModule from '@arianee/arianee-protocol-client';
import Core from '@arianee/core';

import Creator from '../creator';
import * as getCreatorIdentityModule from '../helpers/identity/getIdentity';
import { isIdentityApproved } from '../helpers/identity/isIdentityApproved';

jest.mock('@arianee/arianee-protocol-client');
jest.mock('@arianee/arianee-privacy-gateway-client');
jest.spyOn(console, 'error').mockImplementation();
jest.mock('../helpers/identity/isIdentityApproved', () => {
  return {
    isIdentityApproved: jest.fn().mockResolvedValue(true),
  };
});
describe('Identities', () => {
  const core = Core.fromRandom();
  const creatorAddress = `0x${'a'.repeat(40)}`;
  let creator: Creator<'WAIT_TRANSACTION_RECEIPT'>;

  beforeEach(() => {
    creator = new Creator({
      core,
      creatorAddress,
      transactionStrategy: 'WAIT_TRANSACTION_RECEIPT',
    });

    Object.defineProperty(Creator.prototype, 'connected', {
      get: () => true,
    });

    Object.defineProperty(Creator.prototype, 'slug', {
      get: () => 'testnet',
    });

    jest.clearAllMocks();
  });

  describe('updateIdentity', () => {
    const getCreatorIdentitySpy = jest
      .spyOn(getCreatorIdentityModule, 'getCreatorIdentity')
      .mockImplementation();

    it('should call the v1 contract with correct params', async () => {
      const updateInformationsSpy = jest.fn();

      const uri = 'https://mock.com';
      const imprint = '0x0';

      const transactionWrapperSpy = jest
        .spyOn(arianeeProtocolClientModule, 'transactionWrapper')
        .mockImplementation();

      await creator.identities.updateIdentity({
        uri,
        imprint,
      });

      const { protocolV1Action } = transactionWrapperSpy.mock.calls[0][2];

      await protocolV1Action({
        identityContract: {
          updateInformations: updateInformationsSpy,
        },
      } as any);

      expect(updateInformationsSpy).toHaveBeenCalledWith(uri, imprint, {});

      expect(transactionWrapperSpy).toHaveBeenCalledWith(
        creator['arianeeProtocolClient'],
        creator['slug'],
        {
          protocolV1Action: expect.any(Function),
          protocolV2Action: expect.any(Function),
        },
        undefined
      );

      expect(isIdentityApproved).toHaveBeenCalledWith(creator);
    });

    it('should throw if called on v2 protocol', async () => {
      const updateInformationsSpy = jest.fn();

      const uri = 'https://mock.com';
      const imprint = '0x0';

      const transactionWrapperSpy = jest
        .spyOn(arianeeProtocolClientModule, 'transactionWrapper')
        .mockImplementation();

      await creator.identities.updateIdentity({
        uri,
        imprint,
      });

      const { protocolV2Action } = transactionWrapperSpy.mock.calls[0][2];

      await expect(
        protocolV2Action({
          identityContract: {
            updateInformations: updateInformationsSpy,
          },
        } as any)
      ).rejects.toThrowError(/not yet implemented/gi);

      expect(isIdentityApproved).toHaveBeenCalledWith(creator);
    });
  });
});
