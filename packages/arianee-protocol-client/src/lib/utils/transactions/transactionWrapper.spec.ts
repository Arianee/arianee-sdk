// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import ArianeeProtocolClient, {
  ProtocolClientV1,
} from '@arianee/arianee-protocol-client';
import { Core } from '@arianee/core';
import { ContractTransactionResponse } from 'ethers';

import { transactionWrapper } from './transactionWrapper';

jest.mock('@arianee/arianee-protocol-client');
jest.spyOn(console, 'error').mockImplementation();

describe('transactionWrapper', () => {
  const arianeeProtocolClient = new ArianeeProtocolClient(
    Core.fromPrivateKey(
      '0xc53e9fc60d0ed7edd7d98a61fe6cb0cff4e91752cc5a52522985f2a44fc93208'
    )
  );

  // set prototype to those of ProtocolClientV1 so that instanceof check passes
  const RealProtocolClientV1 = jest.requireActual(
    '@arianee/arianee-protocol-client'
  ).ProtocolClientV1;
  const mockProtocolClientV1 = new ProtocolClientV1({} as any, {} as any);
  Object.setPrototypeOf(mockProtocolClientV1, RealProtocolClientV1.prototype);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw if the protocol is not supported', async () => {
    const connectSpy = jest
      .spyOn(arianeeProtocolClient, 'connect')
      .mockResolvedValue({} as any);

    await expect(
      transactionWrapper(arianeeProtocolClient, 'mockProtocol', {
        protocolV1Action: async () => ({} as ContractTransactionResponse),
      })
    ).rejects.toThrowError(/is not yet supported/gi);

    expect(connectSpy).toHaveBeenCalledWith('mockProtocol', undefined);
  });

  it('should call the protocol v1 action, wait for the transaction and return the receipt', async () => {
    const waitSpy = jest.fn().mockResolvedValue({ mockReceipt: '0x123' });
    const protocolV1Action = jest.fn().mockResolvedValue({
      wait: waitSpy,
    });

    const connectSpy = jest
      .spyOn(arianeeProtocolClient, 'connect')
      .mockResolvedValue(mockProtocolClientV1);

    const receipt = await transactionWrapper(
      arianeeProtocolClient,
      'mockProtocol',
      {
        protocolV1Action,
      }
    );

    expect(connectSpy).toHaveBeenCalledWith('mockProtocol', undefined);
    expect(protocolV1Action).toHaveBeenCalledWith(mockProtocolClientV1);
    expect(receipt).toMatchObject({ mockReceipt: '0x123' });
  });

  it('should throw if the protocol v1 action fails', async () => {
    const protocolV1Action = jest
      .fn()
      .mockRejectedValue(new Error('v1 action error'));

    jest
      .spyOn(arianeeProtocolClient, 'connect')
      .mockResolvedValue(mockProtocolClientV1);

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

    jest
      .spyOn(arianeeProtocolClient, 'connect')
      .mockResolvedValue(mockProtocolClientV1);

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

    jest
      .spyOn(arianeeProtocolClient, 'connect')
      .mockResolvedValue(mockProtocolClientV1);

    await expect(
      transactionWrapper(arianeeProtocolClient, 'mockProtocol', {
        protocolV1Action,
      })
    ).rejects.toThrow(/could not retrieve the receipt of the transaction/gi);
  });
});
