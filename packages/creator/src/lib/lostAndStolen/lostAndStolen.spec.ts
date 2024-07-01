import * as arianeeProtocolClientModule from '@arianee/arianee-protocol-client';
import Core from '@arianee/core';

import Creator from '../creator';
import * as getCreatorIdentityModule from '../helpers/identity/getIdentity';
import * as assertSmartAssetIssuedByModule from '../helpers/smartAsset/assertSmartAssetIssuedBy';
import LostAndStolen from './lostAndStolen';

jest.mock('@arianee/arianee-protocol-client');
jest.mock('@arianee/arianee-privacy-gateway-client');
jest.spyOn(console, 'error').mockImplementation();

describe('LostAndStolen', () => {
  const core = Core.fromRandom();
  const creatorAddress = `0x${'a'.repeat(40)}`;
  let creator: Creator<'WAIT_TRANSACTION_RECEIPT'>;
  let lostAndStolen: LostAndStolen<'WAIT_TRANSACTION_RECEIPT'>;

  const mockIsMissing = jest.fn();
  const mockSetMissingStatus = jest.fn();
  const mockUnsetMissingStatus = jest.fn();
  const mockSetSolenStatus = jest.fn();
  const mockUnsetSolenStatus = jest.fn();
  const mockIsStolen = jest.fn();

  const mockTxWrapper = jest
    .spyOn(arianeeProtocolClientModule, 'transactionWrapper')
    .mockImplementation(async (_, __, actions) => {
      await actions.protocolV1Action({
        arianeeLost: {
          isMissing: mockIsMissing,
          isStolen: mockIsStolen,
          setMissingStatus: mockSetMissingStatus,
          unsetMissingStatus: mockUnsetMissingStatus,
          setStolenStatus: mockSetSolenStatus,
          unsetStolenStatus: mockUnsetSolenStatus,
        },
      } as any);

      return null as any;
    });

  beforeEach(() => {
    jest.clearAllMocks();

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

    lostAndStolen = new LostAndStolen(creator);
    jest
      .spyOn(getCreatorIdentityModule, 'getCreatorIdentity')
      .mockImplementation();
    jest
      .spyOn(assertSmartAssetIssuedByModule, 'assertSmartAssetIssuedBy')
      .mockImplementation();
  });

  describe('missing', () => {
    describe('setMissingStatus', () => {
      it('should set missing status if not already set', async () => {
        const smartAssetId = '123';
        mockIsMissing.mockResolvedValue(false);

        const result = await lostAndStolen.setMissingStatus(smartAssetId, true);

        expect(mockTxWrapper).toHaveBeenCalled();
        expect(mockIsMissing).toHaveBeenCalledWith(smartAssetId);
        expect(mockSetMissingStatus).toHaveBeenCalledWith(smartAssetId, {});

        expect(result).toEqual({
          missingStatus: true,
          smartAssetId: smartAssetId,
        });
      });

      it('should throw error if missing status is already set as requested', async () => {
        const smartAssetId = '123';
        mockIsMissing.mockResolvedValue(true);

        await expect(
          lostAndStolen.setMissingStatus(smartAssetId, true)
        ).rejects.toThrow(`Missing status is already set as true`);
        expect(mockTxWrapper).toHaveBeenCalled();

        expect(mockIsMissing).toHaveBeenCalledWith(smartAssetId);
        expect(mockSetMissingStatus).toHaveBeenCalledTimes(0);
      });
    });
    describe('unsetMissingStatus', () => {
      it('should unset missing status if not already set', async () => {
        const smartAssetId = '123';
        mockIsMissing.mockResolvedValue(true);

        const result = await lostAndStolen.setMissingStatus(
          smartAssetId,
          false
        );

        expect(mockTxWrapper).toHaveBeenCalled();
        expect(mockIsMissing).toHaveBeenCalledWith(smartAssetId);
        expect(mockUnsetMissingStatus).toHaveBeenCalledWith(smartAssetId, {});

        expect(result).toEqual({
          missingStatus: false,
          smartAssetId: smartAssetId,
        });
      });

      it('should throw error if missing status is already set as requested', async () => {
        const smartAssetId = '123';
        mockIsMissing.mockResolvedValue(false);

        await expect(
          lostAndStolen.setMissingStatus(smartAssetId, false)
        ).rejects.toThrow(`Missing status is already set as false`);
        expect(mockTxWrapper).toHaveBeenCalled();

        expect(mockIsMissing).toHaveBeenCalledWith(smartAssetId);
        expect(mockUnsetMissingStatus).toHaveBeenCalledTimes(0);
      });
    });
  });
  describe('stolen', () => {
    describe('setStolenStatus', () => {
      it('should set stolen status if not already set', async () => {
        const smartAssetId = '123';
        mockIsStolen.mockResolvedValue(false);

        const result = await lostAndStolen.setStolenStatus(smartAssetId, true);

        expect(mockTxWrapper).toHaveBeenCalled();
        expect(mockIsStolen).toHaveBeenCalledWith(smartAssetId);
        expect(mockSetSolenStatus).toHaveBeenCalledWith(smartAssetId, {});

        expect(result).toEqual({
          stolenStatus: true,
          smartAssetId: smartAssetId,
        });
      });

      it('should throw error if stolen status is already set as requested', async () => {
        const smartAssetId = '123';
        mockIsStolen.mockResolvedValue(true);

        await expect(
          lostAndStolen.setStolenStatus(smartAssetId, true)
        ).rejects.toThrow(`Stolen status is already set as true`);
        expect(mockTxWrapper).toHaveBeenCalled();

        expect(mockIsStolen).toHaveBeenCalledWith(smartAssetId);
        expect(mockSetSolenStatus).toHaveBeenCalledTimes(0);
      });
    });
    describe('unsetStolenStatus', () => {
      it('should unset stolen status if not already set', async () => {
        const smartAssetId = '123';
        mockIsStolen.mockResolvedValue(true);

        const result = await lostAndStolen.setStolenStatus(smartAssetId, false);

        expect(mockTxWrapper).toHaveBeenCalled();
        expect(mockIsStolen).toHaveBeenCalledWith(smartAssetId);
        expect(mockUnsetSolenStatus).toHaveBeenCalledWith(smartAssetId, {});

        expect(result).toEqual({
          stolenStatus: false,
          smartAssetId: smartAssetId,
        });
      });

      it('should throw error if missing status is already set as requested', async () => {
        const smartAssetId = '123';
        mockIsStolen.mockResolvedValue(false);

        await expect(
          lostAndStolen.setStolenStatus(smartAssetId, false)
        ).rejects.toThrow(`Stolen status is already set as false`);
        expect(mockTxWrapper).toHaveBeenCalled();

        expect(mockIsStolen).toHaveBeenCalledWith(smartAssetId);
        expect(mockSetSolenStatus).toHaveBeenCalledTimes(0);
      });
    });
  });
});
