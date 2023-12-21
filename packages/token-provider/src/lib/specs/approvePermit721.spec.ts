import * as arianeeProtocolClientModule from '@arianee/arianee-protocol-client';
import Core from '@arianee/core';

import * as tokenProviderModule from '../token-provider';

jest.mock('@arianee/arianee-protocol-client');

const PRIVATE_KEY =
  '0xe6963e7d7ce3f10373417abfc802aa781c432c309b2233f31e7c6c2edb198225'; //  0xD75f91b003D53ACf804049ead52661a28868bcCE

describe('approvePermit721', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should approve if not already approved', async () => {
    const getApprovedSpy = jest.fn().mockResolvedValue('0xMOCK');

    const callWrapperSpy = jest
      .spyOn(arianeeProtocolClientModule, 'callWrapper')
      .mockImplementation(async (_, __, actions) =>
        actions.protocolV1Action({
          smartAssetContract: {
            getApproved: getApprovedSpy,
          },
        } as any)
      );

    const transactionWrapperSpy = jest
      .spyOn(arianeeProtocolClientModule, 'transactionWrapper')
      .mockImplementation(async (_, __, actions) => {
        await actions.protocolV1Action({
          smartAssetContract: {
            approve: approveSpy,
          },
        } as any);

        return null as any;
      });

    const approveSpy = jest.fn();

    const core = Core.fromPrivateKey(PRIVATE_KEY);

    await tokenProviderModule.approvePermit721({
      core,
      tokenId: '467440080',
      permit721Address: '0x1028DF8BB444284E8585AF68811285a434BFAD78',
      protocolName: 'testnet',
    });

    expect(getApprovedSpy).toHaveBeenCalledWith('467440080');
    expect(approveSpy).toHaveBeenCalledWith(
      '0x1028DF8BB444284E8585AF68811285a434BFAD78',
      '467440080'
    );

    expect(callWrapperSpy).toHaveBeenCalledWith(
      expect.any(arianeeProtocolClientModule.ArianeeProtocolClient),
      'testnet',
      {
        protocolV1Action: expect.any(Function),
        protocolV2Action: expect.any(Function),
      }
    );

    expect(transactionWrapperSpy).toHaveBeenCalledWith(
      expect.any(arianeeProtocolClientModule.ArianeeProtocolClient),
      'testnet',
      {
        protocolV1Action: expect.any(Function),
        protocolV2Action: expect.any(Function),
      }
    );
  });

  it('should not approve if already approved', async () => {
    const getApprovedSpy = jest
      .fn()
      .mockResolvedValue('0x1028DF8BB444284E8585AF68811285a434BFAD78');

    const callWrapperSpy = jest
      .spyOn(arianeeProtocolClientModule, 'callWrapper')
      .mockImplementation(async (_, __, actions) =>
        actions.protocolV1Action({
          smartAssetContract: {
            getApproved: getApprovedSpy,
          },
        } as any)
      );

    const transactionWrapperSpy = jest
      .spyOn(arianeeProtocolClientModule, 'transactionWrapper')
      .mockImplementation();

    const core = Core.fromPrivateKey(PRIVATE_KEY);

    await tokenProviderModule.approvePermit721({
      core,
      tokenId: '467440080',
      permit721Address: '0x1028DF8BB444284E8585AF68811285a434BFAD78',
      protocolName: 'testnet',
    });

    expect(getApprovedSpy).toHaveBeenCalledWith('467440080');

    expect(callWrapperSpy).toHaveBeenCalledWith(
      expect.any(arianeeProtocolClientModule.ArianeeProtocolClient),
      'testnet',
      {
        protocolV1Action: expect.any(Function),
        protocolV2Action: expect.any(Function),
      }
    );

    expect(transactionWrapperSpy).not.toHaveBeenCalled();
  });
});
