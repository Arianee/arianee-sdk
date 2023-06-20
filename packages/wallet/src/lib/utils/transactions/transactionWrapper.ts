import {
  ContractTransactionReceipt,
  ContractTransactionResponse,
  TransactionRequest,
} from 'ethers';
import { Protocol } from '@arianee/common-types';
import ArianeeProtocolClient, {
  ProtocolClientV1,
} from '@arianee/arianee-protocol-client';

export type NonPayableOverrides = Omit<
  Omit<TransactionRequest, 'to' | 'data'>,
  'value' | 'blockTag' | 'enableCcipRead'
>;

export const transactionWrapper = async (
  arianeeProtocolClient: ArianeeProtocolClient,
  protocolName: Protocol['name'],
  actions: {
    protocolV1Action: (
      v1: ProtocolClientV1
    ) => Promise<ContractTransactionResponse>;
  }
): Promise<ContractTransactionReceipt> => {
  const protocol = await arianeeProtocolClient.connect(protocolName);

  if ('v1' in protocol) {
    let tx: ContractTransactionResponse;
    try {
      tx = await actions.protocolV1Action(protocol.v1);
    } catch (e) {
      console.error(e);
      throw new Error('Error while executing the protocol v1 action');
    }

    let receipt: ContractTransactionReceipt | null;
    try {
      receipt = await tx.wait();
    } catch (e) {
      console.error(e);
      throw new Error('Error while waiting for the transaction');
    }

    if (!receipt)
      throw new Error('Could not retrieve the receipt of the transaction');

    return receipt;
  } else {
    throw new Error(`This protocol is not yet supported (${protocolName})`);
  }
};
