import { Protocol } from '@arianee/common-types';
import {
  ContractTransactionReceipt,
  ContractTransactionResponse,
  TransactionRequest,
} from 'ethers';

import ArianeeProtocolClient from '../../arianeeProtocolClient';
import ProtocolClientV1 from '../../v1/protocolClientV1';
import ProtocolClientV2 from '../../v2/protocolClientV2';

export type NonPayableOverrides = Omit<
  Omit<TransactionRequest, 'to' | 'data'>,
  'value' | 'blockTag' | 'enableCcipRead'
>;

export const noWaitTransactionWrapper = async (
  arianeeProtocolClient: ArianeeProtocolClient,
  protocolName: Protocol['name'],
  actions: {
    protocolV1Action: (
      v1: ProtocolClientV1
    ) => Promise<ContractTransactionResponse>;
    protocolV2Action: (
      v2: ProtocolClientV2
    ) => Promise<ContractTransactionResponse>;
  },
  connectOptions?: Parameters<ArianeeProtocolClient['connect']>[1]
): Promise<ContractTransactionResponse> => {
  const protocol = await arianeeProtocolClient.connect(
    protocolName,
    connectOptions
  );

  if (
    !(protocol instanceof ProtocolClientV1) &&
    !(protocol instanceof ProtocolClientV2)
  )
    throw new Error(
      `The wrapper does not support this protocol (${protocolName} / ${protocol})`
    );

  let tx: ContractTransactionResponse;

  if (protocol instanceof ProtocolClientV1) {
    try {
      tx = await actions.protocolV1Action(protocol);
    } catch (e) {
      console.error(e);
      throw new Error('Error while executing the protocol v1 action');
    }
  } else {
    try {
      tx = await actions.protocolV2Action(protocol);
    } catch (e) {
      console.error(e);
      throw new Error('Error while executing the protocol v2 action');
    }
  }

  return tx;
};

export const transactionWrapper = async (
  arianeeProtocolClient: ArianeeProtocolClient,
  protocolName: Protocol['name'],
  actions: {
    protocolV1Action: (
      v1: ProtocolClientV1
    ) => Promise<ContractTransactionResponse>;
    protocolV2Action: (
      v2: ProtocolClientV2
    ) => Promise<ContractTransactionResponse>;
  },
  connectOptions?: Parameters<ArianeeProtocolClient['connect']>[1]
): Promise<ContractTransactionReceipt> => {
  const tx = await noWaitTransactionWrapper(
    arianeeProtocolClient,
    protocolName,
    actions,
    connectOptions
  );

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
};
