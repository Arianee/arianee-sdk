import {
  Interface,
  Result,
  TransactionDescription,
  TransactionRequest,
} from 'ethers';
import { ethers6_v1, ethers6_v1_1 } from '@arianee/arianee-abi';

const ArianeeFactories = { ...ethers6_v1.factories, ...ethers6_v1_1.factories };
const ArianeeContracts = Object.keys(ArianeeFactories).map((key) => {
  return {
    name: key.split('__')[0],
    abi: (ArianeeFactories as any)[key].abi,
  };
});

interface DecodedArianeeTransaction {
  contractName: string;
  functionName: string;
  functionArgs: Result;
  from: string;
  to: string;
}

class DecodedArianeeTransactionError extends Error {
  constructor(message: string) {
    super(`An error occured while decoding transaction: ${message}`);
    this.name = 'DecodedArianeeTransactionError';
  }
}

function decodeTransaction(
  transactionRequest: TransactionRequest
): DecodedArianeeTransaction {
  const { data, value, from, to } = transactionRequest;
  if (!data) throw new DecodedArianeeTransactionError('Missing data');
  if (!from) throw new DecodedArianeeTransactionError('Missing from');
  if (!to) throw new DecodedArianeeTransactionError('Missing to');

  let matchingContractName: string | null = null;
  let decoded: TransactionDescription | null = null;
  for (const contract of ArianeeContracts) {
    const iface = new Interface(contract.abi);
    decoded = iface.parseTransaction({ data, value: value ?? undefined });
    if (decoded !== null) {
      matchingContractName = contract.name;
      break;
    }
  }
  if (!decoded) {
    throw new DecodedArianeeTransactionError('No matching interface');
  }

  return {
    contractName: matchingContractName!,
    functionName: decoded.name,
    functionArgs: decoded.args,
    from: from.toString(),
    to: to.toString(),
  };
}

export {
  DecodedArianeeTransaction,
  decodeTransaction,
  DecodedArianeeTransactionError,
};
