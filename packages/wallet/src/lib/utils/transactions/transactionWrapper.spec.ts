import ArianeeProtocolClient from '@arianee/arianee-protocol-client';
import { Core } from '@arianee/core';
import { transactionWrapper } from './transactionWrapper';
import { ContractTransactionResponse } from 'ethers';

jest.mock('@arianee/arianee-protocol-client');
jest.spyOn(console, 'error').mockImplementation();

describe('transactionWrapper', () => {
  const arianeeProtocolClient = new ArianeeProtocolClient(
    Core.fromPrivateKey(
      '0xc53e9fc60d0ed7edd7d98a61fe6cb0cff4e91752cc5a52522985f2a44fc93208'
    )
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw if the protocol is not supported', async () => {
    const connectSpy = jest
      .spyOn(arianeeProtocolClient, 'connect')
      .mockResolvedValue({
        v2: {},
      } as any);

    await expect(
      transactionWrapper(arianeeProtocolClient, 'mockProtocol', {
        protocolV1Action: async () => ({} as ContractTransactionResponse),
      })
    ).rejects.toThrowError(/is not yet supported/gi);

    expect(connectSpy).toHaveBeenCalledWith('mockProtocol');
  });

  it('should call the protocol v1 action, wait for the transaction and return the receipt', async () => {
    const waitSpy = jest.fn().mockResolvedValue({ mockReceipt: '0x123' });
    const protocolV1Action = jest.fn().mockResolvedValue({
      wait: waitSpy,
    });
    const v1Spy = jest.fn();

    const connectSpy = jest
      .spyOn(arianeeProtocolClient, 'connect')
      .mockResolvedValue({
        v1: v1Spy,
      } as any);

    const receipt = await transactionWrapper(
      arianeeProtocolClient,
      'mockProtocol',
      {
        protocolV1Action,
      }
    );

    expect(connectSpy).toHaveBeenCalledWith('mockProtocol');
    expect(protocolV1Action).toHaveBeenCalledWith(v1Spy);
    expect(receipt).toMatchObject({ mockReceipt: '0x123' });
  });

  it('should throw if the protocol v1 action fails', async () => {
    const protocolV1Action = jest
      .fn()
      .mockRejectedValue(new Error('v1 action error'));

    jest.spyOn(arianeeProtocolClient, 'connect').mockResolvedValue({
      v1: jest.fn(),
    } as any);

    await expect(
      transactionWrapper(arianeeProtocolClient, 'mockProtocol', {
        protocolV1Action,
      })
    ).rejects.toThrow(/error while executing the protocol v1 action/gi);
  });

  it('should throw if the wait method of the tx fails', async () => {
    const waitSpy = jest.fn().mockRejectedValue(new Error('wait error'));
    const protocolV1Action = jest.fn().mockResolvedValue({
      wait: waitSpy,
    });
    const v1Spy = jest.fn();

    jest.spyOn(arianeeProtocolClient, 'connect').mockResolvedValue({
      v1: v1Spy,
    } as any);

    await expect(
      transactionWrapper(arianeeProtocolClient, 'mockProtocol', {
        protocolV1Action,
      })
    ).rejects.toThrow(/error while waiting for the transaction/gi);
  });

  it('should throw if the receipt is null after waiting', async () => {
    const waitSpy = jest.fn().mockResolvedValue(null);
    const protocolV1Action = jest.fn().mockResolvedValue({
      wait: waitSpy,
    });
    const v1Spy = jest.fn();

    jest.spyOn(arianeeProtocolClient, 'connect').mockResolvedValue({
      v1: v1Spy,
    } as any);

    await expect(
      transactionWrapper(arianeeProtocolClient, 'mockProtocol', {
        protocolV1Action,
      })
    ).rejects.toThrow(/could not retrieve the receipt of the transaction/gi);
  });
});
